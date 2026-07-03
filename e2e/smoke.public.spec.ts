import { expect, test } from "@playwright/test";

const PUBLIC_ROUTES = [
  {
    path: "/explorar",
    assert: async (page) => {
      await expect(
        page.getByPlaceholder(/Buscar propiedades/i),
      ).toBeVisible({ timeout: 15_000 });
    },
  },
  {
    path: "/mapa",
    assert: async (page) => {
      await expect(page.getByText(/Propie|Cargando mapa/i)).toBeVisible({
        timeout: 15_000,
      });
    },
  },
  {
    path: "/ingresar",
    assert: async (page) => {
      await expect(
        page.getByRole("heading", { name: "Iniciar sesión" }),
      ).toBeVisible({ timeout: 15_000 });
    },
  },
  {
    path: "/registro",
    assert: async (page) => {
      await expect(
        page.getByRole("heading", {
          name: /Beta cerrada|¿Cómo vas a usar Propie\?/,
        }),
      ).toBeVisible({ timeout: 15_000 });
    },
  },
] as const;

test.beforeEach(async ({ page }) => {
  await page.route("**/properties", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  await page.addInitScript(() => {
    sessionStorage.setItem("propie_skip_splash", "1");
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
  });
});

test.describe("public smoke", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`loads ${route.path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });
      page.on("pageerror", (err) => errors.push(err.message));

      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await route.assert(page);
      expect(page.url()).toContain(route.path);
      expect(
        errors,
        errors.join("\n") || "no console errors",
      ).toEqual([]);
    });
  }

  test("login shows SVG wordmark", async ({ page }) => {
    await page.goto("/ingresar");
    await expect(page.locator('svg[aria-label="Propie"]')).toBeVisible();
  });
});
