import { expect, test, type Page } from "@playwright/test";

import { dismissOverlays, login, waitForAppReady } from "./helpers/auth";
import { mockPublisherSession } from "./helpers/publish-wizard-audit";
import { loadSeedData } from "./helpers/test-data";

const VIEWPORTS = {
  mobile: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
} as const;

type ViewportName = keyof typeof VIEWPORTS;

type ScrollAudit = {
  pass: boolean;
  issues: string[];
  scrollContainerFound: boolean;
  documentScrolls: boolean;
  doubleScroll: boolean;
  horizontalOverflow: boolean;
  headerOk: boolean;
  footerOk: boolean;
  canReachBottom: boolean;
};

async function primeSession(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    sessionStorage.setItem("propie_skip_splash", "1");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
  });
}

async function auditPageScroll(
  page: Page,
  options: {
    headerSelector?: string;
    footerSelector?: string;
    bottomSelector?: string;
    requireScroll?: boolean;
  } = {},
): Promise<ScrollAudit> {
  const {
    headerSelector = "h1",
    footerSelector = "[data-testid='app-footer'], footer",
    bottomSelector,
    requireScroll = false,
  } = options;

  return page.evaluate(
    ({ headerSelector, footerSelector, bottomSelector, requireScroll }) => {
      const issues: string[] = [];
      const root = document.getElementById("root");
      if (!root) {
        return {
          pass: false,
          issues: ["missing #root"],
          scrollContainerFound: false,
          documentScrolls: false,
          doubleScroll: false,
          horizontalOverflow: false,
          headerOk: false,
          footerOk: false,
          canReachBottom: false,
        };
      }

      const horizontalOverflow =
        document.documentElement.scrollWidth > window.innerWidth + 1 ||
        document.body.scrollWidth > window.innerWidth + 1;

      if (horizontalOverflow) {
        issues.push("horizontal overflow on document");
      }

      const docScrolls =
        document.documentElement.scrollHeight > window.innerHeight + 2;

      const scrollContainers: HTMLElement[] = [];
      const walk = (node: Element) => {
        if (!(node instanceof HTMLElement)) return;
        const { overflowY } = window.getComputedStyle(node);
        if (
          (overflowY === "auto" || overflowY === "scroll") &&
          node.scrollHeight > node.clientHeight + 2
        ) {
          scrollContainers.push(node);
        }
        for (const child of node.children) walk(child);
      };
      walk(root);

      const meaningful = scrollContainers.filter(
        (el) => el.scrollHeight - el.clientHeight > 24,
      );
      const doubleScroll = meaningful.length > 1;
      if (doubleScroll) {
        issues.push(`multiple scroll containers (${meaningful.length})`);
      }

      const scrollContainerFound = meaningful.length > 0;
      const contentOverflowsRoot = root.scrollHeight > root.clientHeight + 2;

      if (requireScroll && !scrollContainerFound && contentOverflowsRoot) {
        issues.push("overflowing content without internal scroll container");
      }

      if (docScrolls && !scrollContainerFound && contentOverflowsRoot) {
        issues.push("document scroll without internal scroll container");
      }

      const header = document.querySelector(headerSelector);
      let headerOk = true;
      if (header) {
        const rect = header.getBoundingClientRect();
        if (rect.top < -4 || rect.top > window.innerHeight) {
          headerOk = false;
          issues.push(`header out of view (top=${rect.top})`);
        }
      }

      const footer = document.querySelector(footerSelector);
      let footerOk = true;
      if (footer) {
        const rect = footer.getBoundingClientRect();
        if (rect.bottom > window.innerHeight + 2) {
          footerOk = false;
          issues.push(`footer clipped (bottom=${rect.bottom})`);
        }
      }

      let canReachBottom = true;
      const bottomEl = bottomSelector
        ? document.querySelector(bottomSelector)
        : null;

      if (meaningful.length > 0) {
        const container = meaningful[0];
        const before = bottomEl?.getBoundingClientRect().bottom ?? null;
        container.scrollTop = container.scrollHeight;
        const after = bottomEl?.getBoundingClientRect().bottom ?? null;
        if (bottomEl && after !== null && before !== null) {
          canReachBottom = after <= window.innerHeight + 2;
          if (!canReachBottom) {
            issues.push("bottom content not reachable after scroll");
          }
        }
        container.scrollTop = 0;
      } else if (bottomEl) {
        const rect = bottomEl.getBoundingClientRect();
        canReachBottom = rect.bottom <= window.innerHeight + 2;
        if (!canReachBottom) {
          issues.push("bottom content clipped without scroll");
        }
      }

      return {
        pass: issues.length === 0,
        issues,
        scrollContainerFound,
        documentScrolls: docScrolls,
        doubleScroll,
        horizontalOverflow,
        headerOk,
        footerOk,
        canReachBottom,
      };
    },
    { headerSelector, footerSelector, bottomSelector, requireScroll },
  );
}

async function expectScrollPass(
  page: Page,
  label: string,
  options?: Parameters<typeof auditPageScroll>[1],
) {
  const audit = await auditPageScroll(page, options);
  expect(audit.pass, `${label}: ${audit.issues.join("; ")}`).toBe(true);
  return audit;
}

async function testKeyboardScrollOnMobile(page: Page, inputLabel: string) {
  const input = page.getByLabel(inputLabel).first();
  if (!(await input.isVisible().catch(() => false))) return;

  await input.click();
  await page.waitForTimeout(300);

  const audit = await auditPageScroll(page, { requireScroll: true });
  expect(
    audit.pass || audit.scrollContainerFound,
    `keyboard focus broke scroll: ${audit.issues.join("; ")}`,
  ).toBeTruthy();

  await page.keyboard.press("Escape");
}

for (const [viewportName, size] of Object.entries(VIEWPORTS) as [
  ViewportName,
  (typeof VIEWPORTS)[ViewportName],
][]) {
  test.describe(`scroll regression — ${viewportName}`, () => {
    test.beforeEach(async ({ page }) => {
      await primeSession(page);
      await page.setViewportSize(size);
    });

    test("Login /ingresar", async ({ page }) => {
      await page.goto("/ingresar", { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: "Iniciar sesión" })).toBeVisible();
      await expectScrollPass(page, "login", {
        bottomSelector: "button[type='submit']",
        requireScroll: viewportName === "mobile",
      });
      if (viewportName === "mobile") {
        await testKeyboardScrollOnMobile(page, "Email");
      }
    });

    test("Register Choice or Closed Beta /registro", async ({ page }) => {
      await page.goto("/registro", { waitUntil: "networkidle" });
      const closedBeta = page.getByRole("heading", { name: "Beta cerrada" });
      const registerChoice = page.getByRole("heading", {
        name: "¿Cómo vas a usar Propie?",
      });

      if (await closedBeta.isVisible().catch(() => false)) {
        await expectScrollPass(page, "closed-beta", {
          bottomSelector: "button",
          requireScroll: viewportName === "mobile",
        });
      } else {
        await expect(registerChoice).toBeVisible();
        await expectScrollPass(page, "register-choice", {
          bottomSelector: "p",
          requireScroll: viewportName === "mobile",
        });
      }
    });

    test("Share /compartir/:id", async ({ page }) => {
      const seed = loadSeedData();
      await page.goto(`/compartir/${seed.contactProperty.id}`, {
        waitUntil: "networkidle",
      });
      await expect(page.getByRole("heading", { name: "Compartir" })).toBeVisible();
      await expectScrollPass(page, "share", {
        bottomSelector: "textarea, input",
        requireScroll: viewportName === "mobile",
      });
    });

    test("User Public Profile /perfil/:userId", async ({ page }) => {
      const seed = loadSeedData();
      await page.goto(`/perfil/${seed.client.id}`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: "Perfil" })).toBeVisible({
        timeout: 15_000,
      });
      await expectScrollPass(page, "user-public-profile", {
        requireScroll: false,
      });
    });

    test("Agent Public Profile /agentes/:agentId", async ({ page }) => {
      const seed = loadSeedData();
      await page.goto(`/agentes/${seed.owner.id}`, { waitUntil: "networkidle" });
      await expect(
        page.getByText(/Perfil del agente|Perfil no encontrado|Cargando perfil/),
      ).toBeVisible({ timeout: 15_000 });
      await expectScrollPass(page, "agent-public-profile", {
        requireScroll: false,
      });
    });

    test("Property Details /propiedad/:id", async ({ page }) => {
      const seed = loadSeedData();
      await page.goto(`/propiedad/${seed.contactProperty.id}`, {
        waitUntil: "networkidle",
      });
      await expect(page.getByTestId("property-gallery")).toBeVisible({
        timeout: 20_000,
      });

      const galleryScroll = await page.evaluate(() => {
        const gallery = document.querySelector('[data-testid="property-gallery"]');
        if (!gallery) return { ok: false, reason: "no gallery" };
        let node: Element | null = gallery;
        while (node) {
          const { overflowY } = window.getComputedStyle(node);
          if (overflowY === "auto" || overflowY === "scroll") {
            const el = node as HTMLElement;
            const before = gallery.getBoundingClientRect().top;
            el.scrollTop += 300;
            const after = gallery.getBoundingClientRect().top;
            return {
              ok: el.scrollTop > 0 && after < before,
              reason: `scrollTop=${el.scrollTop}`,
            };
          }
          node = node.parentElement;
        }
        return { ok: false, reason: "no scroll parent" };
      });

      expect(galleryScroll.ok, galleryScroll.reason).toBe(true);
      await expectScrollPass(page, "property-details", { requireScroll: false });
    });

    test("Explore /explorar", async ({ page }) => {
      await waitForAppReady(page);
      await dismissOverlays(page);
      await expectScrollPass(page, "explore", {
        footerSelector: "[data-testid='app-footer']",
        requireScroll: false,
      });
    });

    test("Publish Wizard /publicar", async ({ page }) => {
      await mockPublisherSession(page);
      await page.goto("/publicar", { waitUntil: "networkidle" });
      await expect(page.getByTestId("publish-wizard")).toBeVisible();
      await expect(page.getByTestId("publish-wizard-footer")).toBeVisible();
      await expectScrollPass(page, "publish-wizard", {
        footerSelector: "[data-testid='publish-wizard-footer']",
        requireScroll: viewportName === "mobile",
      });
    });
  });
}

test.describe("scroll regression — protected routes", () => {
  test.beforeEach(async ({ page }) => {
    await primeSession(page);
  });

  for (const [viewportName, size] of Object.entries(VIEWPORTS) as [
    ViewportName,
    (typeof VIEWPORTS)[ViewportName],
  ][]) {
    test(`Visit Details ${viewportName}`, async ({ page }) => {
      const seed = loadSeedData();
      await page.setViewportSize(size);
      await login(page, seed.owner.email, seed.password);

      await page.getByRole("button", { name: "Visitas" }).click();
      await expect(page).toHaveURL(/\/visitas/);

      const visitLink = page
        .getByRole("button")
        .filter({ hasText: seed.contactProperty.title })
        .first();

      if (!(await visitLink.isVisible().catch(() => false))) {
        test.skip(true, "no seeded visit in list");
      }

      await visitLink.click();
      await expect(page).toHaveURL(/\/visitas\//);
      await expect(
        page.getByRole("heading", { name: "Detalle de visita" }),
      ).toBeVisible();
      await expectScrollPass(page, "visit-details", {
        requireScroll: viewportName === "mobile",
      });
    });

    test(`Conversation Thread ${viewportName}`, async ({ page }) => {
      const seed = loadSeedData();
      await page.setViewportSize(size);
      await login(page, seed.owner.email, seed.password);

      await page.goto(`/mensajes/${seed.visitConversation.id}`, {
        waitUntil: "networkidle",
      });
      await expect(
        page.getByRole("heading", { name: /E2E Smoke|Conversación/ }),
      ).toBeVisible({ timeout: 15_000 });

      await expectScrollPass(page, "conversation-thread", {
        bottomSelector: "input",
        requireScroll: false,
      });

      if (viewportName === "mobile") {
        await testKeyboardScrollOnMobile(page, "Escribí tu mensaje");
      }
    });

    test(`My Properties loading ${viewportName}`, async ({ page }) => {
      const seed = loadSeedData();
      await page.setViewportSize(size);
      await login(page, seed.owner.email, seed.password);

      await page.route("**/properties/mine**", async (route) => {
        await new Promise((r) => setTimeout(r, 3_000));
        await route.continue();
      });

      await page.getByRole("button", { name: "Mis Props." }).click();
      await expect(page).toHaveURL(/\/mis-propiedades/);
      await expectScrollPass(page, "my-properties-loading", {
        requireScroll: false,
      });
    });

    test(`My Properties error ${viewportName}`, async ({ page }) => {
      const seed = loadSeedData();
      await page.setViewportSize(size);
      await login(page, seed.owner.email, seed.password);

      await page.route("**/properties/mine**", (route) =>
        route.fulfill({ status: 500, body: "error" }),
      );

      await page.goto("/mis-propiedades", { waitUntil: "networkidle" });
      await expect(page.getByText(/error|problema|intentá/i)).toBeVisible({
        timeout: 15_000,
      });
      await expectScrollPass(page, "my-properties-error", {
        requireScroll: false,
      });
    });
  }
});
