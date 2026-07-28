import type { Page } from "@playwright/test";

type MockPublisher = {
  id: string;
  email: string;
  role: "OWNER" | "AGENT";
  profile: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

const MOCK_OWNER: MockPublisher = {
  id: "e2e-owner-id",
  email: "e2e-owner@propie.test",
  role: "OWNER",
  profile: {
    id: "e2e-profile-id",
    first_name: "E2E",
    last_name: "Owner",
  },
};

const MOCK_AGENT: MockPublisher = {
  id: "e2e-agent-id",
  email: "e2e-agent@propie.test",
  role: "AGENT",
  profile: {
    id: "e2e-agent-profile-id",
    first_name: "E2E",
    last_name: "Agent",
  },
};

export type MockPublisherSessionOptions = {
  role?: "OWNER" | "AGENT";
};

export type PublishWizardSeed = {
  publishMode?: "create" | "edit";
  propertyId?: string | null;
  propertyType?: string | null;
  listingType?: string | null;
  title?: string;
  description?: string;
  price?: number | null;
  currency?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaM2?: number | null;
  address?: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
  commercializationType?: string;
};

export async function mockPublisherSession(
  page: Page,
  publishSeed: PublishWizardSeed = {},
  options: MockPublisherSessionOptions = {},
) {
  const role = options.role ?? "OWNER";
  const publisher = role === "AGENT" ? MOCK_AGENT : MOCK_OWNER;

  await page.addInitScript(
    (payload: {
      user: MockPublisher;
      seed: PublishWizardSeed;
      trackCommercialization: boolean;
    }) => {
      localStorage.setItem("accessToken", "e2e-mock-token");
      localStorage.setItem("refreshToken", "e2e-mock-refresh");
      sessionStorage.setItem("pwa-install-dismissed", "1");
      sessionStorage.setItem("propie_geo_banner_dismissed", "1");
      sessionStorage.setItem("propie_skip_splash", "1");
      localStorage.setItem("propie_geo_prompt_shown", "1");
      localStorage.setItem("propie_geo_status", "skipped");

      const base = {
        publishMode: "create",
        propertyId: "e2e-property-id",
        propertyType: "HOUSE",
        listingType: "SALE",
        title: "",
        description: "",
        country: "Argentina",
        province: "Cordoba",
        city: "Cordoba",
        neighborhood: "Centro",
        address: "",
        lat: null,
        lng: null,
        bedrooms: null,
        bathrooms: null,
        areaM2: null,
        price: null,
        currency: "USD",
        images: [],
        commercializationType: "",
        amenities: [],
      };

      localStorage.setItem(
        "property-publish",
        JSON.stringify({ ...base, ...payload.seed }),
      );

      (
        window as unknown as { __e2eCommercializationSaves?: unknown[] }
      ).__e2eCommercializationSaves = [];

      const originalFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const url = String(input);

        if (url.includes("/auth/me")) {
          return new Response(
            JSON.stringify({ success: true, data: payload.user }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (url.includes("/auth/refresh")) {
          return new Response(
            JSON.stringify({
              success: true,
              data: {
                accessToken: "e2e-mock-token",
                refreshToken: "e2e-mock-refresh",
              },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (url.includes("/favorites")) {
          return new Response(
            JSON.stringify({ success: true, data: [] }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (
          payload.trackCommercialization &&
          url.includes("/commercialization") &&
          String(init?.method ?? "GET").toUpperCase() === "PATCH"
        ) {
          const body = init?.body ? JSON.parse(String(init.body)) : null;
          (
            window as unknown as { __e2eCommercializationSaves: unknown[] }
          ).__e2eCommercializationSaves.push(body);

          return new Response(
            JSON.stringify({
              success: true,
              data: { commercializationType: body?.commercializationType },
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return originalFetch(input, init);
      };
    },
    {
      user: publisher,
      seed: publishSeed,
      trackCommercialization: role === "AGENT",
    },
  );
}

export async function getCommercializationSaveCount(page: Page): Promise<number> {
  return page.evaluate(() => {
    return (
      (
        window as unknown as { __e2eCommercializationSaves?: unknown[] }
      ).__e2eCommercializationSaves?.length ?? 0
    );
  });
}

export async function getLastCommercializationSave(
  page: Page,
): Promise<{ commercializationType?: string } | null> {
  return page.evaluate(() => {
    const saves =
      (
        window as unknown as { __e2eCommercializationSaves?: unknown[] }
      ).__e2eCommercializationSaves ?? [];
    const last = saves[saves.length - 1];
    return (last as { commercializationType?: string } | undefined) ?? null;
  });
}

export type PublishLayoutIssue = {
  route: string;
  type: string;
  detail: string;
};

export async function collectPublishWizardIssues(
  page: Page,
  route: string,
): Promise<PublishLayoutIssue[]> {
  return page.evaluate((currentRoute) => {
    const issues: PublishLayoutIssue[] = [];
    const doc = document.documentElement;

    if (doc.scrollWidth > window.innerWidth + 1) {
      issues.push({
        route: currentRoute,
        type: "horizontal-overflow",
        detail: `scrollWidth ${doc.scrollWidth} > ${window.innerWidth}`,
      });
    }

    const footer = document.querySelector("[data-testid='publish-wizard-footer']");
    const cta = document.querySelector("[data-testid='publish-wizard-cta']");
    const back = document.querySelector("[aria-label='Volver']");

    if (!footer) {
      issues.push({
        route: currentRoute,
        type: "missing-footer",
        detail: "Sticky footer not found",
      });
    } else {
      const rect = footer.getBoundingClientRect();
      if (rect.bottom > window.innerHeight + 1 || rect.top >= window.innerHeight) {
        issues.push({
          route: currentRoute,
          type: "footer-clipped",
          detail: `footer bottom ${rect.bottom} viewport ${window.innerHeight}`,
        });
      }
    }

    if (!cta) {
      issues.push({
        route: currentRoute,
        type: "missing-cta",
        detail: "Primary CTA not found",
      });
    } else {
      const rect = cta.getBoundingClientRect();
      if (rect.bottom > window.innerHeight + 1 || rect.height < 44) {
        issues.push({
          route: currentRoute,
          type: "cta-inaccessible",
          detail: `cta bottom ${rect.bottom} height ${rect.height}`,
        });
      }
    }

    if (!back) {
      issues.push({
        route: currentRoute,
        type: "missing-back",
        detail: "Back button not found",
      });
    }

    const hiddenTextInputs = Array.from(
      document.querySelectorAll("input:not([type='file']):not([type='hidden'])"),
    ).filter((input) => {
      const style = window.getComputedStyle(input);
      return (
        style.display === "none" ||
        style.visibility === "hidden" ||
        (style.width === "0px" && style.height === "0px")
      );
    });

    hiddenTextInputs.forEach((input) => {
      const id = input.id || input.getAttribute("name") || "unnamed";
      issues.push({
        route: currentRoute,
        type: "hidden-input",
        detail: `Input "${id}" is not accessible`,
      });
    });

    const active = document.activeElement as HTMLElement | null;
    if (
      active &&
      footer &&
      active.matches("input, textarea, select") &&
      !active.classList.contains("visually-hidden")
    ) {
      const activeRect = active.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      if (activeRect.bottom > footerRect.top - 8) {
        issues.push({
          route: currentRoute,
          type: "focused-field-obscured",
          detail: `Focused ${active.id || active.tagName} overlaps footer`,
        });
      }
    }

    return issues;
  }, route);
}

export async function waitPastSplash(_page: Page) {
  // Splash skipped via sessionStorage flag in mockPublisherSession.
}
