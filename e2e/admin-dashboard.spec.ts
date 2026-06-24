import { test, expect } from "@playwright/test";

import { dismissOverlays } from "./helpers/auth";
import { createE2ePool } from "./helpers/db";
import { loadSeedData } from "./helpers/test-data";

const seed = loadSeedData();
const API_URL = process.env.PLAYWRIGHT_API_URL ?? "http://localhost:3000";

async function loginAsAdmin(page: import("@playwright/test").Page) {
  const loginRes = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: seed.client.email, password: seed.password },
  });
  expect(loginRes.ok()).toBeTruthy();
  const body = await loginRes.json();
  expect(body.data.user.role).toBe("ADMIN");

  await page.addInitScript(
    ({ accessToken, refreshToken }) => {
      sessionStorage.setItem("pwa-install-dismissed", "1");
      sessionStorage.setItem("propie_geo_banner_dismissed", "1");
      localStorage.setItem("propie_geo_prompt_shown", "1");
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    },
    {
      accessToken: body.data.accessToken,
      refreshToken: body.data.refreshToken,
    },
  );

  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin/, { timeout: 15_000 });
}

test.describe("Admin BI Dashboard", () => {
  let originalRole: string;

  test.beforeAll(async () => {
    const pool = createE2ePool();
    const res = await pool.query<{ role: string }>(
      `SELECT role FROM users WHERE email = $1`,
      [seed.client.email],
    );
    originalRole = res.rows[0].role;
    await pool.query(`UPDATE users SET role = 'ADMIN', updated_at = now() WHERE email = $1`, [
      seed.client.email,
    ]);
    await pool.end();
  });

  test.afterAll(async () => {
    const pool = createE2ePool();
    await pool.query(`UPDATE users SET role = $1, updated_at = now() WHERE email = $2`, [
      originalRole,
      seed.client.email,
    ]);
    await pool.end();
  });

  test("desktop: loads BI sections and period selector", async ({ page }) => {
    await loginAsAdmin(page);

    await expect(page.getByTestId("admin-dashboard")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Business Intelligence" })).toBeVisible();

    for (const section of [
      "executive",
      "marketplace",
      "users",
      "properties",
      "conversations",
      "visits",
      "favorites",
    ]) {
      await expect(page.getByTestId(`section-${section}`)).toBeVisible();
    }

    await expect(page.getByTestId("period-selector")).toBeVisible();
    await page.getByTestId("period-selector").getByRole("button", { name: "7 días" }).click();
    await expect(page.getByText("Período: 7 días")).toBeVisible();
    await page.getByTestId("period-selector").getByRole("button", { name: "90 días" }).click();
    await expect(page.getByText("Período: 90 días")).toBeVisible();

    await page.screenshot({
      path: "e2e/screenshots/admin-dashboard-desktop.png",
      fullPage: true,
    });
  });

  test("mobile: responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await loginAsAdmin(page);

    await expect(page.getByTestId("admin-dashboard")).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId("period-selector")).toBeVisible();

    await page.screenshot({
      path: "e2e/screenshots/admin-dashboard-mobile.png",
      fullPage: true,
    });
  });
});

test.describe("Admin route guard", () => {
  test("guest is redirected from /admin", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem("pwa-install-dismissed", "1");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/explorar/, { timeout: 20_000 });
  });

  test("non-admin user is redirected from /admin", async ({ page }) => {
    const loginRes = await page.request.post(`${API_URL}/auth/login`, {
      data: { email: seed.owner.email, password: seed.password },
    });
    expect(loginRes.ok()).toBeTruthy();
    const body = await loginRes.json();

    await page.addInitScript(
      ({ accessToken, refreshToken }) => {
        sessionStorage.setItem("pwa-install-dismissed", "1");
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      },
      {
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
      },
    );

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/explorar/, { timeout: 20_000 });
    await dismissOverlays(page);
  });
});
