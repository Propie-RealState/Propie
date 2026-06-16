import { test, expect, type Page } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";

const VIEWPORTS = [
  { name: "iphone-se", width: 375, height: 667 },
  { name: "iphone-13", width: 390, height: 844 },
  { name: "iphone-15-pro-max", width: 430, height: 932 },
  { name: "android-small", width: 360, height: 640 },
  { name: "android-medium", width: 393, height: 852 },
  { name: "android-large", width: 412, height: 915 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "tablet-landscape", width: 1024, height: 768 },
] as const;

const ROUTES = [
  "/explore",
  "/ingresar",
  "/registro",
  "/mapa",
] as const;

const SCREENSHOT_DIR = path.join("e2e", "screenshots", "responsive-audit");

type LayoutIssue = {
  viewport: string;
  route: string;
  type: string;
  detail: string;
};

async function collectLayoutIssues(
  page: Page,
  viewportName: string,
  route: string,
): Promise<LayoutIssue[]> {
  return page.evaluate(
    ({ viewport, currentRoute }) => {
      const issues: LayoutIssue[] = [];
      const doc = document.documentElement;
      const body = document.body;

      if (doc.scrollWidth > window.innerWidth + 1) {
        issues.push({
          viewport,
          route: currentRoute,
          type: "horizontal-overflow",
          detail: `scrollWidth ${doc.scrollWidth} > innerWidth ${window.innerWidth}`,
        });
      }

      if (body.scrollWidth > window.innerWidth + 1) {
        issues.push({
          viewport,
          route: currentRoute,
          type: "body-horizontal-overflow",
          detail: `body scrollWidth ${body.scrollWidth} > innerWidth ${window.innerWidth}`,
        });
      }

      const footer = document.querySelector("[data-testid='app-footer']");
      const footerButtons = Array.from(
        document.querySelectorAll("button"),
      ).filter((button) => {
        const label = button.textContent?.trim() ?? "";
        return ["Explorar", "Favoritos", "Visitas", "Mensajes", "Perfil", "Ingresar", "Registrate", "Publicar", "Mis Props."].some(
          (item) => label.includes(item),
        );
      });

      const navTarget = footer ?? footerButtons[0];
      if (navTarget) {
        const rect = navTarget.getBoundingClientRect();
        if (rect.bottom > window.innerHeight + 1 || rect.top >= window.innerHeight) {
          issues.push({
            viewport,
            route: currentRoute,
            type: "footer-clipped",
            detail: `footer bottom ${rect.bottom} vs viewport ${window.innerHeight}`,
          });
        }
      }

      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach((modal, index) => {
        const rect = modal.getBoundingClientRect();
        if (
          rect.bottom > window.innerHeight + 2 ||
          rect.top < -2 ||
          rect.right > window.innerWidth + 2 ||
          rect.left < -2
        ) {
          issues.push({
            viewport,
            route: currentRoute,
            type: "modal-overflow",
            detail: `dialog #${index} rect ${JSON.stringify({
              top: rect.top,
              bottom: rect.bottom,
              left: rect.left,
              right: rect.right,
            })}`,
          });
        }
      });

      return issues;
    },
    { viewport: viewportName, currentRoute: route },
  );
}

test.describe("responsive layout audit", () => {
  test.beforeAll(() => {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  });

  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${viewport.name} ${route}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await page.goto(route, { waitUntil: "networkidle" });

        if (route === "/explore") {
          await page.waitForTimeout(2600);
        }

        const issues = await collectLayoutIssues(page, viewport.name, route);

        await page.screenshot({
          path: path.join(
            SCREENSHOT_DIR,
            `${viewport.name}-${route.replace(/\//g, "_") || "root"}.png`,
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
});
