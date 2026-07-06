import { expect, test, type Page } from "@playwright/test";

import { loadSeedData } from "./helpers/test-data";

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1280, height: 800 },
} as const;

type ViewportName = keyof typeof VIEWPORTS;

async function primeSession(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    sessionStorage.setItem("propie_skip_splash", "1");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
  });
}

async function openShareFromProperty(
  page: Page,
  propertyId: string,
) {
  await page.goto(`/propiedad/${propertyId}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Compartir" }).click();
  await expect(page).toHaveURL(new RegExp(`/compartir/${propertyId}`));
  await expect(page.getByRole("heading", { name: "Compartir", exact: true })).toBeVisible();
}

async function expectSharePreview(
  page: Page,
  property: { id: string; title: string; address: string },
) {
  const preview = page.getByTestId("share-property-preview");
  await expect(preview.getByText(property.title)).toBeVisible();
  await expect(preview.getByText(property.address)).toBeVisible();
  await expect(page.getByTestId("share-property-url")).toHaveText(
    new RegExp(`/propiedad/${property.id}$`),
  );
}

for (const viewportName of Object.keys(VIEWPORTS) as ViewportName[]) {
  test.describe(`share preview (${viewportName})`, () => {
    test.use({ viewport: VIEWPORTS[viewportName] });

    test("preview and URL match each selected property", async ({ page }) => {
      const seed = loadSeedData();
      await primeSession(page);

      for (const property of seed.shareProperties) {
        await openShareFromProperty(page, property.id);
        await expectSharePreview(page, property);

        await page.getByRole("button", { name: "Volver" }).click();
        await expect(page).toHaveURL(
          new RegExp(`/propiedad/${property.id}`),
        );
      }
    });
  });
}
