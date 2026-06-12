import { expect, test } from "@playwright/test";

import { login } from "./helpers/auth";
import { hasSupabaseForUploads, loadSeedData } from "./helpers/test-data";
import { join } from "node:path";

const testImagePath = join(
  process.cwd(),
  "e2e",
  "fixtures",
  "test-image.png",
);

test.describe("owner commercialization settings", () => {
  test("shows only manual approval when accepting agents", async ({ page }) => {
    test.skip(
      !hasSupabaseForUploads(),
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for image upload",
    );

    const seed = loadSeedData();
    await login(page, seed.owner.email, seed.password);
    await page.getByRole("button", { name: "Publicar" }).click();

    await page.getByRole("button", { name: "Venta" }).click();
    await page.getByRole("button", { name: "Casa" }).click();
    await page.getByPlaceholder("Buscar direccion...").fill("Av Colon 100 Cordoba");
    await page.locator(".publish-location-map").click({ position: { x: 120, y: 120 } });
    await page.getByRole("button", { name: "Continuar" }).click();

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByRole("button", { name: "Galería" }).click(),
    ]);
    await fileChooser.setFiles(testImagePath);
    await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled({
      timeout: 60_000,
    });
    await page.getByRole("button", { name: "Continuar" }).click();

    await page.locator("#title").fill(`E2E Commercialization ${Date.now()}`);
    await page
      .locator("#description")
      .fill("Descripcion de prueba para validar la pantalla de comercializacion.");
    await page.locator("#price").fill("99000");
    await page.locator("#rooms").fill("2");
    await page.locator("#bathrooms").fill("1");
    await page.locator("#sqm").fill("60");
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page).toHaveURL(/\/publicar\/comercializacion/);
    await page.getByRole("button", { name: "Aceptar agentes" }).click();

    await expect(page.getByText("Gestión de agentes")).toBeVisible();
    await expect(page.getByText("Aprobación manual")).toBeVisible();
    await expect(page.getByText("Mostrar chats")).toHaveCount(0);
    await expect(page.getByText("Agenda compartida")).toHaveCount(0);
  });
});
