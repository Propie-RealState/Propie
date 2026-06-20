import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SCREENSHOT_ROOT = join(process.cwd(), "web", "screenshots", "logo-replacement", "after");

const REGISTER_ROUTES = [
  { name: "register-choice", path: "/registro" },
  { name: "register-owner", path: "/registro/owner" },
  { name: "register-agent", path: "/registro/agent" },
  { name: "register-client", path: "/registro/client" },
] as const;

const VIEWPORTS = {
  desktop: { width: 1440, height: 900, dir: "desktop" },
  "iphone-14": { width: 390, height: 844, dir: "mobile" },
  "pixel-7": { width: 412, height: 915, dir: "mobile" },
  "ipad-air": { width: 820, height: 1180, dir: "tablet" },
} as const;

async function primeLogoTestSession(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("propie_skip_splash", "1");
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
  });
}

async function assertHeroLogo(page: Page) {
  const logo = page.locator('img[src*="LOGO"]');
  await expect(logo).toBeVisible({ timeout: 15_000 });

  const metrics = await logo.evaluate((img) => {
    const el = img as HTMLImageElement;
    const parent = el.parentElement;
    const style = parent ? getComputedStyle(parent) : null;

    return {
      src: el.currentSrc || el.src,
      naturalWidth: el.naturalWidth,
      naturalHeight: el.naturalHeight,
      renderedWidth: el.getBoundingClientRect().width,
      renderedHeight: el.getBoundingClientRect().height,
      parentBackground: style?.backgroundColor ?? null,
      parentBorderRadius: style?.borderRadius ?? null,
    };
  });

  expect(metrics.src).toContain("LOGO%20B.png");
  expect(metrics.naturalWidth).toBeGreaterThan(0);
  expect(metrics.naturalHeight).toBeGreaterThan(0);
  expect(metrics.renderedWidth).toBeGreaterThan(0);
  expect(metrics.renderedHeight).toBeGreaterThan(0);

  const aspectDelta =
    Math.abs(
      metrics.renderedWidth / metrics.renderedHeight -
        metrics.naturalWidth / metrics.naturalHeight,
    ) < 0.15;
  expect(aspectDelta).toBe(true);

  if (metrics.parentBackground) {
    expect(metrics.parentBackground).not.toMatch(/rgba?\(255,\s*255,\s*255/i);
  }
}

async function gotoRegisterRoute(page: Page, path: string) {
  await primeLogoTestSession(page);
  await page.goto(path);
  await page.waitForURL(new RegExp(path.replace("/", "\\/")), { timeout: 20_000 });
  await page.waitForLoadState("networkidle");
}

async function mockPublisherSession(page: Page, role: "OWNER" | "AGENT") {
  await page.addInitScript((userRole) => {
    sessionStorage.setItem("propie_skip_splash", "1");
    localStorage.setItem("accessToken", "e2e-logo-token");
    localStorage.setItem("refreshToken", "e2e-logo-refresh");
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
    (window as Window & { __propieLogoRole?: string }).__propieLogoRole = userRole;
  }, role);

  await page.route("**/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          id: "e2e-logo-user",
          email: "logo-e2e@propie.test",
          role,
          profile: {
            id: "e2e-logo-profile",
            first_name: "Logo",
            last_name: "Test",
          },
        },
      }),
    });
  });

  await page.route("**/auth/refresh", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          accessToken: "e2e-logo-token",
          refreshToken: "e2e-logo-refresh",
        },
      }),
    });
  });
}

test.describe("logo replacement validation", () => {
  for (const [viewportName, viewport] of Object.entries(VIEWPORTS)) {
    test.describe(viewportName, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        mkdirSync(join(SCREENSHOT_ROOT, viewport.dir), { recursive: true });
      });

      for (const route of REGISTER_ROUTES) {
        test(`register ${route.name}`, async ({ page }) => {
          await gotoRegisterRoute(page, route.path);
          await assertHeroLogo(page);

          await page.screenshot({
            path: join(
              SCREENSHOT_ROOT,
              viewport.dir,
              `${route.name}-${viewportName}.png`,
            ),
            fullPage: false,
          });
        });
      }

      for (const role of ["OWNER", "AGENT"] as const) {
        test(`publish ${role.toLowerCase()}`, async ({ page }) => {
          await mockPublisherSession(page, role);
          await page.goto("/publicar");
          await page.waitForURL(/\/publicar/, { timeout: 20_000 });
          await expect(page.getByTestId("publish-wizard")).toBeVisible({
            timeout: 15_000,
          });
          await assertHeroLogo(page);

          await page.screenshot({
            path: join(
              SCREENSHOT_ROOT,
              viewport.dir,
              `publish-${role.toLowerCase()}-${viewportName}.png`,
            ),
            fullPage: false,
          });
        });
      }
    });
  }
});
