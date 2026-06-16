import { test, expect } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

import {
  collectPublishWizardIssues,
  mockPublisherSession,
} from "./helpers/publish-wizard-audit";

const SCREENSHOT_DIR = path.join("e2e", "screenshots", "publish-wizard-audit");

const VIEWPORTS = [
  { name: "iphone-se-portrait", width: 375, height: 667 },
  { name: "iphone-13-portrait", width: 390, height: 844 },
  { name: "android-small-portrait", width: 360, height: 640 },
  { name: "iphone-se-landscape", width: 667, height: 375 },
  { name: "tablet-portrait", width: 768, height: 1024 },
] as const;

const STEPS = [
  { path: "/publicar", slug: "step1-empty" },
  { path: "/publicar/fotos-videos", slug: "step2-empty" },
  { path: "/publicar/informacion", slug: "step3-empty" },
  { path: "/publicar/comercializacion", slug: "step4-empty" },
  { path: "/publicar/revision", slug: "step5-empty" },
] as const;

test.describe("publish wizard responsive audit", () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  test.beforeEach(async ({ page }) => {
    await mockPublisherSession(page, {
      propertyId: "e2e-property-id",
      propertyType: "HOUSE",
      listingType: "SALE",
      address: "Av Colon 100, Cordoba",
      lat: -31.4201,
      lng: -64.1888,
    });
  });

  for (const viewport of VIEWPORTS) {
    for (const step of STEPS) {
      test(`${viewport.name} ${step.slug}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await page.goto(step.path, { waitUntil: "networkidle" });

        await expect(page.getByTestId("publish-wizard")).toBeVisible();
        await expect(page.getByTestId("publish-wizard-footer")).toBeVisible();
        await expect(page.getByTestId("publish-wizard-cta")).toBeVisible();
        await expect(page.getByRole("button", { name: "Volver" })).toBeVisible();

        const issues = await collectPublishWizardIssues(page, step.path);

        await page.screenshot({
          path: path.join(
            SCREENSHOT_DIR,
            `${viewport.name}-${step.slug}.png`,
          ),
          fullPage: false,
        });

        expect(
          issues,
          issues.map((issue) => `${issue.type}: ${issue.detail}`).join("\n"),
        ).toEqual([]);
      });
    }
  }

  test("step1 partially completed state keeps CTA visible", async ({ page }) => {
    await mockPublisherSession(page, {
      propertyId: "e2e-property-id",
      propertyType: "APARTMENT",
      listingType: "RENT",
      address: "San Martin 500",
      lat: -31.41,
      lng: -64.19,
    });

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/publicar", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /Alquilá largo/ }).click();
    await page.getByRole("button", { name: "Departamento" }).click();

    const issues = await collectPublishWizardIssues(page, "/publicar/partial");
    expect(issues).toEqual([]);
    await expect(page.getByTestId("publish-wizard-cta")).toBeVisible();
  });

  test("step3 validation errors show hint and keep CTA visible", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/publicar/informacion", { waitUntil: "networkidle" });
    await page.getByTestId("publish-wizard-cta").click();
    await expect(
      page.getByText("Completá título, descripción, precio, habitaciones, baños y m²."),
    ).toBeVisible();

    const issues = await collectPublishWizardIssues(
      page,
      "/publicar/informacion/validation",
    );
    expect(issues).toEqual([]);
    await expect(page.getByTestId("publish-wizard-cta")).toBeVisible();
  });

  test("step3 keyboard focus keeps field above sticky footer", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/publicar/informacion", { waitUntil: "networkidle" });
    await page.getByTestId("publish-wizard-body").evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    await page.locator("#garage").focus();
    await page.waitForTimeout(400);

    const issues = await collectPublishWizardIssues(
      page,
      "/publicar/informacion/keyboard",
    );
    expect(issues).toEqual([]);
  });

  test("step2 image upload controls remain accessible", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/publicar/fotos-videos", { waitUntil: "networkidle" });
    await expect(page.getByRole("button", { name: "Galería" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cámara" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Videos" })).toBeVisible();
    await expect(page.getByText("Aún no agregaste fotos ni videos")).toBeVisible();

    await page.getByTestId("publish-wizard-cta").click();
    await expect(
      page.getByText("Agregá al menos una foto o video para continuar."),
    ).toBeVisible();

    const issues = await collectPublishWizardIssues(
      page,
      "/publicar/fotos-videos/empty",
    );
    expect(issues).toEqual([]);
  });

  test("scroll restoration resets body scroll on step change", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/publicar/fotos-videos", { waitUntil: "networkidle" });
    await page.goto("/publicar/informacion", { waitUntil: "networkidle" });

    await page.getByTestId("publish-wizard-body").evaluate((el) => {
      el.scrollTop = 480;
    });

    await page.getByRole("button", { name: "Volver" }).click();
    await page.waitForURL(/\/publicar\/fotos-videos/);

    const scrollTop = await page.getByTestId("publish-wizard-body").evaluate(
      (el) => el.scrollTop,
    );
    expect(scrollTop).toBe(0);
  });
});
