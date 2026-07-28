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

test.describe("owner soft delete property", () => {
  for (const viewport of [
    { name: "desktop", width: 1280, height: 720 },
    { name: "mobile", width: 390, height: 844 },
  ] as const) {
    test(`owner deletes property (${viewport.name})`, async ({ page }) => {
      const seed = loadSeedData();
      const pool = createE2ePool();
      const title = `E2E Soft Delete ${viewport.name} ${Date.now()}`;
      let propertyId = "";

      try {
        await ensureSoftDeleteSchema(pool);
        propertyId = await createOwnedPublishedProperty({
          pool,
          ownerId: seed.owner.id,
          title,
        });

        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await login(page, seed.owner.email, seed.password);

        // Warm Explore React Query cache with the live listing.
        await page.goto("/explorar");
        await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });

        await page.goto("/mis-propiedades");
        await expect(
          page.getByRole("heading", { name: "Mis Propiedades" }),
        ).toBeVisible();

        const row = page.locator(".property-management-row", {
          hasText: title,
        });
        await row.scrollIntoViewIfNeeded();
        await expect(row).toBeVisible({ timeout: 15_000 });

        const deleteButton = row.getByRole("button", {
          name: "Eliminar propiedad",
          exact: true,
        });
        await expect(deleteButton).toBeVisible();

        await page.evaluate(() => {
          window.confirm = () => true;
        });

        const deleteResponsePromise = page.waitForResponse(
          (response) =>
            response.request().method() === "DELETE"
            && response.url().includes(`/properties/${propertyId}`),
          { timeout: 30_000 },
        );

        await deleteButton.click();
        const deleteResponse = await deleteResponsePromise;
        expect(deleteResponse.status()).toBe(204);

        const deletedRow = await pool.query<{ deleted_at: string | null }>(
          `SELECT deleted_at FROM properties WHERE id = $1`,
          [propertyId],
        );
        expect(deletedRow.rows[0]?.deleted_at).not.toBeNull();

        await expect(
          page.locator(".property-management-row", { hasText: title }),
        ).toHaveCount(0, { timeout: 15_000 });

        const exploreApi = await page.request.get(`${API_URL}/properties`);
        expect(exploreApi.status()).toBe(200);
        const exploreJson = await exploreApi.json();
        const explorePayload = Array.isArray(exploreJson)
          ? exploreJson
          : (exploreJson.items
            ?? exploreJson.data
            ?? exploreJson.properties
            ?? []);
        expect(
          (explorePayload as Array<{ id: string }>).some(
            (p) => p.id === propertyId,
          ),
        ).toBe(false);

        await page.goto("/explorar");
        await expect(page.getByText(title)).toHaveCount(0);

        await page.goto(`/propiedad/${propertyId}`);
        await expect(page.getByText(/Propiedad no encontrada/i)).toBeVisible({
          timeout: 15_000,
        });

        const token = await page.evaluate(() =>
          localStorage.getItem("accessToken"),
        );
        const detail = await page.request.get(
          `${API_URL}/properties/${propertyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        expect(detail.status()).toBe(404);
      } finally {
        if (propertyId) {
          await pool.query(`DELETE FROM properties WHERE id = $1`, [
            propertyId,
          ]);
        }
        await pool.end();
      }
    });
  }
});
