import { expect, test } from "@playwright/test";

import { dismissOverlays, login, logoutFromProfile } from "./helpers/auth";
import { loadSeedData } from "./helpers/test-data";

test.describe("authentication and explore", () => {
  test("login, explore navigation, and logout", async ({ page }) => {
    const seed = loadSeedData();

    await login(page, seed.client.email, seed.password);

    await expect(page.getByRole("button", { name: "Explorar" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Perfil" })).toBeVisible();

    await dismissOverlays(page);
    await page.getByRole("button", { name: "Mensajes" }).click();
    await expect(page).toHaveURL(/\/mensajes/);

    await page.getByRole("button", { name: "Explorar" }).click();
    await expect(page).toHaveURL(/\/explor(ar|e)/);

    await logoutFromProfile(page);
  });
});
