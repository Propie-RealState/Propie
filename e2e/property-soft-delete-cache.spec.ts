import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { login } from "./helpers/auth";
import { createE2ePool } from "./helpers/db";
import { loadSeedData } from "./helpers/test-data";

const API_URL = process.env.VITE_API_URL ?? "http://localhost:3000";

async function ensureSoftDeleteSchema(pool: ReturnType<typeof createE2ePool>) {
  const sql = readFileSync(
    join(process.cwd(), "src/database/schemas/044-property-soft-delete.sql"),
    "utf8",
  );
  await pool.query(sql);
}

async function createOwnedPublishedProperty(input: {
  pool: ReturnType<typeof createE2ePool>;
  ownerId: string;
  title: string;
}) {
  const result = await input.pool.query<{ id: string }>(
    `
      INSERT INTO properties (
        owner_id,
        title,
        description,
        property_type,
        operation_type,
        price,
        status,
        publisher_id,
        publisher_type,
        published_at
      )
      VALUES (
        $1,
        $2,
        'E2E soft delete property',
        'HOUSE',
        'SALE',
        150000,
        'ACTIVE',
        $1,
        'OWNER',
        now()
      )
      RETURNING id
    `,
    [input.ownerId, input.title],
  );

  return result.rows[0].id;
}

test.describe("owner soft delete cache sync", () => {
  test("Explore drops deleted card without hard refresh", async ({ page }) => {
    const seed = loadSeedData();
    const pool = createE2ePool();
    const title = `E2E Cache Sync ${Date.now()}`;
    let propertyId = "";

    try {
      await ensureSoftDeleteSchema(pool);
      propertyId = await createOwnedPublishedProperty({
        pool,
        ownerId: seed.owner.id,
        title,
      });

      await page.setViewportSize({ width: 1280, height: 720 });
      await login(page, seed.owner.email, seed.password);

      // Warm Explore cache (SPA).
      await page.goto("/explorar");
      await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });

      // Delete from My Properties without full document reload afterward.
      await page.getByRole("button", { name: "Mis Props." }).click();
      await expect(page).toHaveURL(/\/mis-propiedades/);
      await expect(
        page.getByRole("heading", { name: "Mis Propiedades" }),
      ).toBeVisible();

      const row = page.locator(".property-management-row", { hasText: title });
      await expect(row).toBeVisible({ timeout: 20_000 });

      await page.evaluate(() => {
        window.confirm = () => true;
      });

      const deleteResponsePromise = page.waitForResponse(
        (response) =>
          response.request().method() === "DELETE"
          && response.url().includes(`/properties/${propertyId}`),
        { timeout: 30_000 },
      );
      await page
        .locator(".property-management-row", { hasText: title })
        .getByRole("button", { name: "Eliminar propiedad", exact: true })
        .click();
      expect((await deleteResponsePromise).status()).toBe(204);

      // Assert optimistic cache sync ran (dev build exposes the query client).
      const cachedIds = await page.evaluate((id) => {
        const client = (
          window as unknown as {
            __PROPIE_QUERY_CLIENT__?: {
              getQueryData: (key: readonly string[]) => Array<{ id: string }> | undefined;
            };
          }
        ).__PROPIE_QUERY_CLIENT__;
        const published = client?.getQueryData(["published-properties"]) ?? [];
        return {
          hasClient: Boolean(client),
          stillPresent: published.some((p) => p.id === id),
          count: published.length,
        };
      }, propertyId);
      expect(cachedIds.hasClient).toBe(true);
      expect(cachedIds.stillPresent).toBe(false);

      const exploreApiAfterDelete = await page.request.get(
        `${API_URL}/properties`,
      );
      const apiList = await exploreApiAfterDelete.json();
      const apiRows = Array.isArray(apiList)
        ? apiList
        : (apiList.items ?? apiList.data ?? []);
      expect(
        (apiRows as Array<{ id: string }>).some((p) => p.id === propertyId),
      ).toBe(false);

      await expect(
        page.locator(".property-management-row", { hasText: title }),
      ).toHaveCount(0);

      // Wait for published-properties refetch to settle before navigating.
      await page.waitForFunction(
        (id) => {
          const client = (
            window as unknown as {
              __PROPIE_QUERY_CLIENT__?: {
                getQueryState: (key: readonly string[]) => {
                  fetchStatus: string;
                  data?: Array<{ id: string }>;
                } | undefined;
              };
            }
          ).__PROPIE_QUERY_CLIENT__;
          const state = client?.getQueryState(["published-properties"]);
          if (!state || state.fetchStatus === "fetching") {
            return false;
          }
          return !(state.data ?? []).some((p) => p.id === id);
        },
        propertyId,
        { timeout: 15_000 },
      );

      await page.getByRole("button", { name: "Explorar" }).click();
      await expect(page).toHaveURL(/\/explor(ar|e)/);

      const exploreDebug = await page.evaluate((id) => {
        const client = (
          window as unknown as {
            __PROPIE_QUERY_CLIENT__?: {
              getQueryData: (key: readonly string[]) => Array<{ id: string; title: string }> | undefined;
              getQueryState: (key: readonly string[]) => {
                fetchStatus: string;
                status: string;
                dataUpdatedAt: number;
              } | undefined;
            };
          }
        ).__PROPIE_QUERY_CLIENT__;
        const data = client?.getQueryData(["published-properties"]) ?? [];
        const state = client?.getQueryState(["published-properties"]);
        return {
          present: data.some((p) => p.id === id),
          titles: data.filter((p) => p.title.includes("E2E Cache Sync")).map((p) => p.title),
          fetchStatus: state?.fetchStatus,
          status: state?.status,
          count: data.length,
        };
      }, propertyId);

      expect(
        exploreDebug,
        `Explore cache debug: ${JSON.stringify(exploreDebug)}`,
      ).toMatchObject({ present: false });

      await expect(
        page.locator(".property-compact-card").filter({ hasText: title }),
      ).toHaveCount(0);

      // Favorites uses the same published-properties query.
      await page.goto("/favoritos");
      await expect(page).toHaveURL(/\/favoritos/);
      await expect(
        page.locator(".property-compact-card").filter({ hasText: title }),
      ).toHaveCount(0);

      // Direct detail URL → not found, still no hard refresh of the app shell.
      await page.goto(`/propiedad/${propertyId}`);
      await expect(page.getByText(/Propiedad no encontrada/i)).toBeVisible({
        timeout: 15_000,
      });

      const exploreApi = await page.request.get(`${API_URL}/properties`);
      const payload = await exploreApi.json();
      const list = Array.isArray(payload)
        ? payload
        : (payload.items ?? payload.data ?? []);
      expect(
        (list as Array<{ id: string }>).some((p) => p.id === propertyId),
      ).toBe(false);
    } finally {
      if (propertyId) {
        await pool.query(`DELETE FROM properties WHERE id = $1`, [propertyId]);
      }
      await pool.end();
    }
  });
});
