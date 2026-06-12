import { expect, test } from "@playwright/test";
import { join } from "node:path";

import { login } from "./helpers/auth";
import { hasSupabaseForUploads, loadSeedData } from "./helpers/test-data";

const testImagePath = join(
  process.cwd(),
  "e2e",
  "fixtures",
  "test-image.png",
);

test.describe("owner publish flow", () => {
  test("owner completes publish flow and sees property in My Properties", async ({
    page,
  }) => {
    test.skip(
      !hasSupabaseForUploads(),
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for image upload",
    );
    const seed = loadSeedData();
    const propertyTitle = `E2E Publish ${Date.now()}`;

    await login(page, seed.owner.email, seed.password);
    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page).toHaveURL(/\/publicar/);
    await expect(
      page.getByRole("heading", { name: "Publicá tu propiedad" }),
    ).toBeVisible();

    await page.getByRole("button", { name: "Venta" }).click();
    await page.getByRole("button", { name: "Casa" }).click();

    await page.getByPlaceholder("Buscar direccion...").fill("Av Colon 100 Cordoba");
    await page.locator(".publish-location-map").click({ position: { x: 120, y: 120 } });
    await expect(page.getByText(/-31\./)).toBeVisible();

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/publicar\/fotos-videos/);

    const [fileChooser] = await Promise.all([
      page.waitForEvent("filechooser"),
      page.getByRole("button", { name: "Galería" }).click(),
    ]);
    await fileChooser.setFiles(testImagePath);
    await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled({
      timeout: 60_000,
    });
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page).toHaveURL(/\/publicar\/informacion/);
    async function typeField(selector: string, value: string) {
      const field = page.locator(selector);
      await field.click();
      await field.fill("");
      await field.pressSequentially(value, { delay: 15 });
    }

    await typeField("#title", propertyTitle);
    await typeField(
      "#description",
      "Departamento luminoso para smoke test E2E con descripcion completa.",
    );
    await typeField("#price", "125000");
    await typeField("#rooms", "3");
    await typeField("#bathrooms", "2");
    await typeField("#sqm", "85");

    const continueDetails = page.getByRole("button", { name: "Continuar" });
    await expect(continueDetails).toBeEnabled({ timeout: 30_000 });
    await continueDetails.click();

    await expect(page).toHaveURL(/\/publicar\/comercializacion/);
    await page.getByRole("button", { name: "Sin intermediarios" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();

    await expect(page).toHaveURL(/\/publicar\/revision/);
    await page
      .getByText("Soy titular o estoy autorizado a publicar esta propiedad")
      .click();
    await page.getByText("Acepto los términos y condiciones de publicación").click();
    await page.getByRole("button", { name: "Publicar propiedad" }).click();

    await expect(
      page.getByText("Tu publicación ya puede aparecer en búsquedas y mapas."),
    ).toBeVisible({ timeout: 60_000 });

    await page.getByRole("button", { name: "Explorar propiedades" }).click();
    await page.getByRole("button", { name: "Mis Props." }).click();
    await expect(page).toHaveURL(/\/mis-propiedades/);
    await expect(page.getByText(propertyTitle)).toBeVisible();
  });
});
