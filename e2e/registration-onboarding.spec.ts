import { expect, test } from "@playwright/test";

import {
  completeUnifiedRegistration,
  fillUnifiedAccount,
  passVerification,
  primeRegisterSession,
  startAgentRegistration,
  startClientRegistration,
  startOwnerRegistration,
  submitBasicProfile,
  fillBasicProfile,
  continueFromAccount,
} from "./helpers/register";

const VIEWPORTS = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 13", width: 390, height: 844 },
  { name: "iPhone 15 Pro Max", width: 430, height: 932 },
  { name: "Android Small", width: 360, height: 640 },
  { name: "Android Medium", width: 412, height: 915 },
  { name: "Android Large", width: 480, height: 960 },
  { name: "Tablet Portrait", width: 768, height: 1024 },
  { name: "Tablet Landscape", width: 1024, height: 768 },
];

test.describe("unified registration onboarding", () => {
  test("owner registration shows welcome modal with both actions", async ({ page }) => {
    const email = `owner-${Date.now()}@test.com`;
    await startOwnerRegistration(page);
    await completeUnifiedRegistration(page, email);

    await expect(page.getByTestId("owner-welcome-modal")).toBeVisible({ timeout: 20_000 });

    await page.getByTestId("owner-welcome-explore").click();
    await expect(page).toHaveURL(/\/explore/);
  });

  test("owner welcome modal publish action opens wizard", async ({ page }) => {
    const email = `owner-pub-${Date.now()}@test.com`;
    await startOwnerRegistration(page);
    await completeUnifiedRegistration(page, email);
    await expect(page.getByTestId("owner-welcome-modal")).toBeVisible({ timeout: 20_000 });
    await page.getByTestId("owner-welcome-publish").click();
    await expect(page).toHaveURL(/\/publicar/);
  });

  test("client registration lands on favorites or explore", async ({ page }) => {
    const email = `client-${Date.now()}@test.com`;
    await startClientRegistration(page);
    await completeUnifiedRegistration(page, email);
    await page.waitForURL(/\/(favoritos|explore)/, { timeout: 20_000 });
  });

  test("agent registration uses publisher footer without panel", async ({ page }) => {
    const email = `agent-${Date.now()}@test.com`;
    await startAgentRegistration(page);
    await completeUnifiedRegistration(page, email);
    await page.waitForURL(/\/explore/, { timeout: 20_000 });

    const footer = page.getByTestId("app-footer");
    await expect(footer.getByText("Publicar")).toBeVisible();
    await expect(footer.getByText("Panel")).toHaveCount(0);
  });

  test("password mismatch blocks account step", async ({ page }) => {
    await startOwnerRegistration(page);
    await page.getByLabel("Email").fill(`mismatch-${Date.now()}@test.com`);
    await page.getByTestId("register-field-password").fill("SecureP@ss1");
    await page.getByTestId("register-field-confirmPassword").fill("Different1!");
    await page.getByTestId("register-field-confirmPassword").blur();
    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
    await expect(page).toHaveURL(/\/registro\/account/);
  });
});

test.describe("agent profile completion UX", () => {
  test("agent sees completion card and explore banner", async ({ page }) => {
    const email = `agent-profile-${Date.now()}@test.com`;
    await startAgentRegistration(page);
    await completeUnifiedRegistration(page, email);
    await page.waitForURL(/\/explore/, { timeout: 20_000 });

    await expect(page.getByTestId("agent-profile-banner")).toBeVisible();
    await page.getByTestId("agent-profile-banner-cta").click();
    await expect(page).toHaveURL(/\/perfil/);
    await expect(page.getByTestId("agent-profile-completion")).toBeVisible();
    await expect(page.getByTestId("agent-profile-completion-percent")).toBeVisible();
  });

  test("banner dismiss persistence", async ({ page }) => {
    const email = `agent-banner-${Date.now()}@test.com`;
    await startAgentRegistration(page);
    await completeUnifiedRegistration(page, email);
    await page.waitForURL(/\/explore/, { timeout: 20_000 });

    await page.getByTestId("agent-profile-banner-close").click();
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/profile/me") &&
          response.request().method() === "PUT" &&
          response.ok(),
      ),
      page.getByTestId("agent-banner-dont-show").click(),
    ]);
    await expect(page.getByTestId("agent-profile-banner")).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("agent-profile-banner")).toHaveCount(0);
  });

  test("banner remind later hides until next login", async ({ page }) => {
    const email = `agent-later-${Date.now()}@test.com`;
    await startAgentRegistration(page);
    await completeUnifiedRegistration(page, email);
    await page.waitForURL(/\/explore/, { timeout: 20_000 });

    await page.getByTestId("agent-profile-banner-close").click();
    await page.getByTestId("agent-banner-remind-later").click();
    await expect(page.getByTestId("agent-profile-banner")).toHaveCount(0);

    await page.reload();
    await expect(page.getByTestId("agent-profile-banner")).toHaveCount(0);
  });

  test("banner hidden for logged-out guests", async ({ page }) => {
    await page.goto("/explore");
    await page.evaluate(() => {
      sessionStorage.setItem("userType", "agente");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    });
    await page.reload();
    await expect(page.getByTestId("agent-profile-banner")).toHaveCount(0);
  });
});

test.describe("registration responsive", () => {
  for (const viewport of VIEWPORTS) {
    test(`account step renders on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await startOwnerRegistration(page);
      await expect(page.getByTestId("register-continue")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(overflow).toBeFalsy();
    });
  }
});
