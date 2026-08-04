import { expect, test } from "@playwright/test";

import { mockPublisherSession } from "./helpers/publish-wizard-audit";

async function seedEditWizard(page: import("@playwright/test").Page) {
  await mockPublisherSession(page, {
    publishMode: "edit",
    propertyId: "e2e-published-property-id",
    propertyType: "HOUSE",
    listingType: "SALE",
    title: "Casa editada E2E",
    description: "Descripcion ya publicada para prueba de finalizacion.",
    price: 150000,
    currency: "USD",
    bedrooms: 3,
    bathrooms: 2,
    areaM2: 90,
    address: "Av Colon 100, Cordoba",
    city: "Cordoba",
    lat: -31.4201,
    lng: -64.1888,
    commercializationType: "DIRECT",
  });

  await page.addInitScript(() => {
    (
      window as unknown as { __e2ePublishCalls?: number }
    ).__e2ePublishCalls = 0;

    const originalFetch = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const url = String(input);
      const method = String(init?.method ?? "GET").toUpperCase();

      if (url.includes("/publish") && method === "PATCH") {
        (
          window as unknown as { __e2ePublishCalls: number }
        ).__e2ePublishCalls += 1;

        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: "ALREADY_PUBLISHED",
              message: "Property already published",
            },
          }),
          {
            status: 409,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      return originalFetch(input, init);
    };
  });
}

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 800 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
] as const;

test.describe("edit property finalization", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name}: saves without calling publish and shows edit success`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await seedEditWizard(page);

      await page.goto("/publicar", { waitUntil: "networkidle" });
      await expect(
        page.getByRole("heading", { name: "Editar propiedad" }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: "Publicá tu propiedad" }),
      ).toHaveCount(0);

      await page.goto("/publicar/revision", { waitUntil: "networkidle" });

      await expect(
        page.getByRole("heading", { name: "Verificación y guardar" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Guardar cambios" }),
      ).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Publicar propiedad" }),
      ).toHaveCount(0);

      await page
        .getByText("Soy titular o estoy autorizado a publicar esta propiedad")
        .click();
      await page
        .getByText("Acepto los términos y condiciones de publicación")
        .click();

      await page.getByRole("button", { name: "Guardar cambios" }).click();

      await expect(page.getByText("Edición completada")).toBeVisible({
        timeout: 15_000,
      });
      await expect(
        page.getByText("Los cambios se guardaron correctamente."),
      ).toBeVisible();

      const publishCalls = await page.evaluate(
        () =>
          (window as unknown as { __e2ePublishCalls?: number })
            .__e2ePublishCalls ?? 0,
      );
      expect(publishCalls).toBe(0);

      await page.getByRole("button", { name: "Ver tu publicación" }).click();
      await expect(page).toHaveURL(/\/propiedad\/e2e-published-property-id/);
    });
  }
});
