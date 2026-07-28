import { expect, test } from "@playwright/test";

import {
  getCommercializationSaveCount,
  getLastCommercializationSave,
  mockPublisherSession,
} from "./helpers/publish-wizard-audit";

const COMMERCIALIZATION_PATH = "/publicar/comercializacion";
const INFO_PATH = "/publicar/informacion";

const FILLED_PUBLISH_SEED = {
  propertyId: "e2e-property-id",
  propertyType: "HOUSE",
  listingType: "SALE",
  title: "E2E Commercialization Property",
  description: "Descripcion de prueba.",
  price: 99000,
  bedrooms: 2,
  bathrooms: 1,
  areaM2: 60,
  address: "Av Colon 100, Cordoba",
  lat: -31.4201,
  lng: -64.1888,
} as const;

test.describe("owner commercialization settings", () => {
  test.beforeEach(async ({ page }) => {
    await mockPublisherSession(page, FILLED_PUBLISH_SEED);
    await page.goto(COMMERCIALIZATION_PATH, { waitUntil: "networkidle" });
    await expect(page.getByTestId("publish-wizard")).toBeVisible();
  });

  test("renders only two selectable options with no extra settings", async ({
    page,
  }) => {
    await expect(page.getByText("Paso 4 de 5")).toBeVisible();
    const options = page.getByRole("radio");
    await expect(options).toHaveCount(2);
    await expect(page.getByRole("radio", { name: /Aceptar agentes/i })).toBeVisible();
    await expect(page.getByRole("radio", { name: /Sin intermediarios/i })).toBeVisible();

    await expect(page.getByText("Gestión de agentes")).toHaveCount(0);
    await expect(page.getByText("Aprobación manual")).toHaveCount(0);
    await expect(page.getByText("Mostrar chats")).toHaveCount(0);
    await expect(page.getByText("Agenda compartida")).toHaveCount(0);
    await expect(
      page.getByText("Vas a gestionar todas las consultas"),
    ).toHaveCount(0);
  });

  test("selecting Accept Agents does not reveal additional UI", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: /Aceptar agentes/i }).click();
    await expect(page.getByRole("radio", { name: /Aceptar agentes/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await expect(page.getByText("Gestión de agentes")).toHaveCount(0);
    await expect(page.getByText("Aprobación manual")).toHaveCount(0);
    await expect(page.getByRole("radio")).toHaveCount(2);
  });

  test("selecting No Intermediaries does not reveal additional UI", async ({
    page,
  }) => {
    await page.getByRole("radio", { name: /Sin intermediarios/i }).click();
    await expect(page.getByRole("radio", { name: /Sin intermediarios/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await expect(page.getByText("Gestión de agentes")).toHaveCount(0);
    await expect(
      page.getByText("Vas a gestionar todas las consultas"),
    ).toHaveCount(0);
    await expect(page.getByRole("radio")).toHaveCount(2);
  });

  test("allows only one option selected at a time", async ({ page }) => {
    const acceptAgents = page.getByRole("radio", { name: /Aceptar agentes/i });
    const noIntermediaries = page.getByRole("radio", { name: /Sin intermediarios/i });

    await acceptAgents.click();
    await expect(acceptAgents).toHaveAttribute("aria-checked", "true");
    await expect(noIntermediaries).toHaveAttribute("aria-checked", "false");

    await noIntermediaries.click();
    await expect(noIntermediaries).toHaveAttribute("aria-checked", "true");
    await expect(acceptAgents).toHaveAttribute("aria-checked", "false");
  });

  test("supports keyboard navigation within the radio group", async ({ page }) => {
    const acceptAgents = page.getByRole("radio", { name: /Aceptar agentes/i });
    const noIntermediaries = page.getByRole("radio", { name: /Sin intermediarios/i });

    await acceptAgents.focus();
    await page.keyboard.press("ArrowDown");
    await expect(noIntermediaries).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(noIntermediaries).toHaveAttribute("aria-checked", "true");
    await expect(acceptAgents).toHaveAttribute("aria-checked", "false");
  });

  test("mobile layout keeps two options visible without extra panels", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(COMMERCIALIZATION_PATH, { waitUntil: "networkidle" });

    await expect(page.getByRole("radio")).toHaveCount(2);
    await page.getByRole("radio", { name: /Aceptar agentes/i }).click();
    await expect(page.getByText("Gestión de agentes")).toHaveCount(0);

    await page.getByRole("radio", { name: /Sin intermediarios/i }).click();
    await expect(
      page.getByText("Vas a gestionar todas las consultas"),
    ).toHaveCount(0);
  });
});

test.describe("agent skips commercialization", () => {
  test("deep link auto-saves DIRECT once and redirects to review", async ({
    page,
  }) => {
    await mockPublisherSession(page, FILLED_PUBLISH_SEED, { role: "AGENT" });
    await page.goto(COMMERCIALIZATION_PATH, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/publicar\/revision/);
    await expect(page.getByRole("radio", { name: /Aceptar agentes/i })).toHaveCount(0);
    await expect(page.getByText("Paso 4 de 4")).toBeVisible();
    await expect(await getLastCommercializationSave(page)).toEqual({
      commercializationType: "DIRECT",
    });
    expect(await getCommercializationSaveCount(page)).toBe(1);

    await page.goto(COMMERCIALIZATION_PATH, { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/publicar\/revision/);
    expect(await getCommercializationSaveCount(page)).toBe(1);
  });

  test("informacion continue skips commercialization", async ({ page }) => {
    await mockPublisherSession(page, FILLED_PUBLISH_SEED, { role: "AGENT" });

    await page.route("**/properties/**", async (route) => {
      if (route.request().method() === "PATCH") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: {} }),
        });
        return;
      }
      await route.continue();
    });

    await page.goto(INFO_PATH, { waitUntil: "networkidle" });
    await expect(page.getByTestId("publish-wizard")).toBeVisible();
    await expect(page.getByText("Paso 3 de 4")).toBeVisible();
    await expect(page.locator("#title")).toHaveValue(FILLED_PUBLISH_SEED.title);

    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page).toHaveURL(/\/publicar\/revision/);
    await expect(page).not.toHaveURL(/comercializacion/);
    await expect(page.getByText("Paso 4 de 4")).toBeVisible();
  });

  test("mobile deep link never shows commercialization UI", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockPublisherSession(page, FILLED_PUBLISH_SEED, { role: "AGENT" });
    await page.goto(COMMERCIALIZATION_PATH, { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/publicar\/revision/);
    await expect(page.getByText(/Opciones de comercialización/i)).toHaveCount(0);
    await expect(page.getByText("Paso 4 de 4")).toBeVisible();
  });
});
