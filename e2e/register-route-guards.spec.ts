import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

import {
  advancePastAccount,
  advanceToSecurity,
  fillValidAccount,
  fillValidPersonalData,
  fillValidSecurity,
  passEmailVerification,
  primeRegisterSession,
  readRegisterDraft,
  startAgentRegistration,
  startClientRegistration,
  startOwnerRegistration,
  submitOwnerRegistration,
  waitPastSplash,
} from "./helpers/register";

async function expectNoSecretsInDraft(page: Page) {
  const draft = await readRegisterDraft(page);
  expect(draft).toBeTruthy();
  expect(draft?.password ?? "").toBe("");
  expect(draft?.pin ?? "").toBe("");
  expect(draft?.recoveryEmail ?? "").toBe("");
  expect(draft?.recoveryPhone ?? "").toBe("");
}

async function seedRegisterProgress(
  page: Page,
  role: "OWNER" | "AGENT" | "CLIENT",
  lastCompletedStep: "account" | "personal" | "security" | "role" | null,
) {
  await page.evaluate(
    ({ role, lastCompletedStep }) => {
      const raw = sessionStorage.getItem("propie.registerDraft");
      const draft = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      draft.role = role;
      draft.registrationProgress = { lastCompletedStep };
      sessionStorage.setItem("propie.registerDraft", JSON.stringify(draft));
    },
    { role, lastCompletedStep },
  );
}

async function goThroughPhotoToRole(page: Page, roleInfoPath: RegExp) {
  await expect(page).toHaveURL(/\/registro\/profile-photo/);
  await page.getByTestId("register-continue").click();
  await expect(page).toHaveURL(roleInfoPath);
}

test.describe("registration route guards", () => {
  test("cannot skip account / personal / security (owner)", async ({ page }) => {
    await primeRegisterSession(page);
    await waitPastSplash(page);
    await page.evaluate(() => sessionStorage.removeItem("propie.registerDraft"));

    await page.goto("/registro/security");
    await expect(page).toHaveURL(/\/registro\/?$/);

    await seedRegisterProgress(page, "OWNER", null);
    await page.goto("/registro/security");
    await expect(page).toHaveURL(/\/registro\/owner\/?$/);

    await seedRegisterProgress(page, "OWNER", "account");
    await page.goto("/registro/security");
    await expect(page).toHaveURL(/\/registro\/personal-data/);

    await page.goto("/registro/owner-info");
    await expect(page).toHaveURL(/\/registro\/personal-data/);
  });

  test("refresh keeps personal and role pages (owner)", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `guard-refresh-${Date.now()}@propie.test`);
    await advancePastAccount(page);
    await expect(page).toHaveURL(/\/registro\/personal-data/);
    await page.reload();
    await expect(page).toHaveURL(/\/registro\/personal-data/);
    await expect(page.getByLabel("DNI")).toBeVisible();

    await advanceToSecurity(page);
    await fillValidSecurity(page);
    await page.getByTestId("register-continue").click();
    await goThroughPhotoToRole(page, /\/registro\/owner-info/);
    await page.reload();
    await expect(page).toHaveURL(/\/registro\/owner-info/);
    await expectNoSecretsInDraft(page);
  });

  test("browser back and forward stay within allowed steps", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `guard-hist-${Date.now()}@propie.test`);
    await advancePastAccount(page);
    await advanceToSecurity(page);

    await page.goBack();
    await expect(page).toHaveURL(/\/registro\/personal-data/);

    await page.goForward();
    await expect(page).toHaveURL(/\/registro\/security/);

    await page.goto("/registro/owner-info");
    await expect(page).toHaveURL(/\/registro\/security/);
  });

  test("owner happy path, verification, duplicate email, no secrets in storage", async ({
    page,
  }) => {
    const email = `guard-owner-${Date.now()}@propie.test`;
    await startOwnerRegistration(page);
    await fillValidAccount(page, email);
    await advancePastAccount(page);
    await advanceToSecurity(page);
    await fillValidSecurity(page);
    await page.getByTestId("register-continue").click();
    await goThroughPhotoToRole(page, /\/registro\/owner-info/);
    await expectNoSecretsInDraft(page);

    await submitOwnerRegistration(page);
    await passEmailVerification(page, email);
    await expect(page.getByRole("button", { name: "Perfil" })).toBeVisible();

    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await startOwnerRegistration(page);
    await fillValidAccount(page, email);
    await advancePastAccount(page);
    await advanceToSecurity(page);
    await fillValidSecurity(page);
    await page.getByTestId("register-continue").click();
    await goThroughPhotoToRole(page, /\/registro\/owner-info/);

    const registerResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/auth/register") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: /Finalizar/i }).click();
    const response = await registerResponse;
    expect(response.status()).toBe(409);
    await expect(page).toHaveURL(/\/registro\/owner/);
    await expect(page.locator("#email-error")).toHaveText(/ya está registrado/i);
    await expectNoSecretsInDraft(page);
  });

  test("agent cannot skip steps; happy path reaches verification", async ({
    page,
  }) => {
    const email = `guard-agent-${Date.now()}@propie.test`;

    await primeRegisterSession(page);
    await waitPastSplash(page);
    await seedRegisterProgress(page, "AGENT", null);
    await page.goto("/registro/agent-info");
    await expect(page).toHaveURL(/\/registro\/agent\/?$/);

    await startAgentRegistration(page);
    await fillValidAccount(page, email);
    await advancePastAccount(page);

    const validImage = path.join(__dirname, "fixtures", "valid-id.png");
    await fillValidPersonalData(page);
    await page.getByTestId("register-field-dniFrontImage").setInputFiles(validImage);
    await page.getByTestId("register-field-dniBackImage").setInputFiles(validImage);
    await page.getByTestId("register-field-biometricSelfie").setInputFiles(validImage);
    // Agent doc fields are local React state; submit as soon as Continuar enables
    // to avoid a remount clearing File state before the click lands.
    await expect
      .poll(async () => page.getByTestId("register-continue").isEnabled())
      .toBe(true);
    await page.locator("form").evaluate((form) => {
      (form as HTMLFormElement).requestSubmit();
    });
    await expect(page).toHaveURL(/\/registro\/security/);

    await fillValidSecurity(page);
    await page.getByTestId("register-continue").click();
    await goThroughPhotoToRole(page, /\/registro\/agent-info/);

    const registerResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/auth/register") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: /Finalizar/i }).click();
    expect((await registerResponse).status()).toBe(201);
    await expect(page).toHaveURL(/\/registro\/verification/);
    await expectNoSecretsInDraft(page);
  });

  test("client cannot skip steps; happy path reaches verification", async ({
    page,
  }) => {
    const email = `guard-client-${Date.now()}@propie.test`;

    await primeRegisterSession(page);
    await waitPastSplash(page);
    await seedRegisterProgress(page, "CLIENT", null);
    await page.goto("/registro/client-info");
    await expect(page).toHaveURL(/\/registro\/client\/?$/);

    await startClientRegistration(page);
    await fillValidAccount(page, email);
    await advancePastAccount(page);
    await advanceToSecurity(page);
    await fillValidSecurity(page);
    await page.getByTestId("register-continue").click();
    await goThroughPhotoToRole(page, /\/registro\/client-info/);

    const registerResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/auth/register") &&
        response.request().method() === "POST",
    );
    await page.getByRole("button", { name: /Finalizar/i }).click();
    expect((await registerResponse).status()).toBe(201);
    await expect(page).toHaveURL(/\/registro\/verification/);
    await expectNoSecretsInDraft(page);
  });
});
