import { expect, test, type Page } from "@playwright/test";

import { loadSeedData } from "./helpers/test-data";

const GALLERY_ASPECT = 3 / 4;
const ASPECT_TOLERANCE = 0.04;

async function expectGalleryFourThree(page: Page) {
  const gallery = page.getByTestId("property-gallery");
  await expect(gallery).toBeVisible();

  const box = await gallery.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      width: rect.width,
      height: rect.height,
      position: style.position,
    };
  });

  expect(box.width).toBeGreaterThan(0);
  expect(box.height).toBeGreaterThan(0);
  expect(box.position).not.toBe("fixed");
  expect(box.position).not.toBe("sticky");
  expect(box.height / box.width).toBeCloseTo(GALLERY_ASPECT, ASPECT_TOLERANCE);
}

async function scrollPageContent(page: Page, deltaY: number) {
  return page.evaluate((delta) => {
    const gallery = document.querySelector('[data-testid="property-gallery"]');
    if (!gallery) {
      throw new Error("property gallery not found");
    }

    let node: Element | null = gallery;
    while (node) {
      const { overflowY } = window.getComputedStyle(node);
      if (overflowY === "auto" || overflowY === "scroll") {
        const beforeTop = gallery.getBoundingClientRect().top;
        (node as HTMLElement).scrollTop += delta;
        const afterTop = gallery.getBoundingClientRect().top;
        return { beforeTop, afterTop, scrollTop: (node as HTMLElement).scrollTop };
      }
      node = node.parentElement;
    }

    throw new Error("scroll container not found");
  }, deltaY);
}

async function expectMosaicVisible(page: Page) {
  await expect
    .poll(async () =>
      page.locator(".property-image-gallery__mosaic").evaluate((el) => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return (
          style.display === "grid" && rect.width > 0 && rect.height > 0
        );
      }),
    )
    .toBe(true);
}

async function readGalleryBox(page: Page) {
  return page.getByTestId("property-gallery").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return {
      width: rect.width,
      height: rect.height,
      position: style.position,
    };
  });
}

async function mockPropertyImages(
  page: Page,
  propertyId: string,
  count: number,
) {
  const images = Array.from({ length: count }, (_, index) => ({
    id: `img-${index + 1}`,
    image_url: `https://placehold.co/800x450/png?text=${index + 1}`,
    thumb_url: `https://placehold.co/400x225/png?text=${index + 1}`,
    is_cover: index === 0,
    created_at: "2026-01-01T00:00:00.000Z",
  }));

  await page.route(`**/properties/${propertyId}`, async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.images = images;
    await route.fulfill({ response, json });
  });
}

async function openPropertyDetail(page: Page, propertyId: string) {
  await page.goto(`/propiedad/${propertyId}`);
  await expect(page.getByTestId("property-gallery")).toBeVisible({
    timeout: 20_000,
  });
}

test.describe("property gallery layout validation", () => {
  test("reserves 4:3 height before images load", async ({ page }) => {
    const seed = loadSeedData();

    await page.route(/\.(png|jpe?g|webp|gif|avif)(\?|$)/i, (route) =>
      route.abort(),
    );

    await openPropertyDetail(page, seed.contactProperty.id);
    await expectGalleryFourThree(page);
  });

  test("gallery scrolls with page content (not sticky/fixed)", async ({
    page,
  }) => {
    const seed = loadSeedData();
    await openPropertyDetail(page, seed.contactProperty.id);

    const scroll = await scrollPageContent(page, 400);
    expect(scroll.scrollTop).toBeGreaterThan(0);
    expect(scroll.afterTop).toBeLessThan(scroll.beforeTop);
  });

  test("uses carousel on mobile and mosaic on desktop", async ({ page }) => {
    const seed = loadSeedData();

    await page.setViewportSize({ width: 390, height: 844 });
    await openPropertyDetail(page, seed.contactProperty.id);
    await expect(page.getByTestId("property-gallery-carousel")).toBeVisible();
    await expect(
      page.locator(".property-image-gallery__mosaic"),
    ).toBeHidden();

    await page.setViewportSize({ width: 1280, height: 900 });
    await page.reload();
    await expect(page.getByTestId("property-gallery")).toBeVisible();
    await expect(page.getByTestId("property-gallery-carousel")).toBeHidden();
    await expectMosaicVisible(page);
    await expectGalleryFourThree(page);
  });

  test("CTAs are inline in the scroll column", async ({ page }) => {
    const seed = loadSeedData();
    await openPropertyDetail(page, seed.contactProperty.id);

    const cta = page.locator(".property-details-cta").first();
    await expect(cta).toBeVisible();

    const position = await cta.evaluate(
      (el) => window.getComputedStyle(el).position,
    );
    expect(position).not.toBe("fixed");
    expect(position).not.toBe("sticky");
  });

  test("same gallery size regardless of photo count", async ({ page }) => {
    const seed = loadSeedData();
    await page.setViewportSize({ width: 390, height: 844 });

    await mockPropertyImages(page, seed.contactProperty.id, 1);
    await openPropertyDetail(page, seed.contactProperty.id);
    const onePhoto = await readGalleryBox(page);

    await page.reload();
    await mockPropertyImages(page, seed.contactProperty.id, 5);
    await openPropertyDetail(page, seed.contactProperty.id);
    const fivePhotos = await readGalleryBox(page);

    expect(fivePhotos.width).toBeCloseTo(onePhoto.width, 0);
    expect(fivePhotos.height).toBeCloseTo(onePhoto.height, 0);
    expect(onePhoto.position).toBe("relative");
    expect(fivePhotos.position).toBe("relative");
  });
});
