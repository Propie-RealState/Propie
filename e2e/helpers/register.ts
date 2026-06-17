import { expect, type Page } from "@playwright/test";

export async function primeRegisterSession(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    sessionStorage.setItem("propie_skip_splash", "1");
    sessionStorage.removeItem("propie.registerDraft");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
    localStorage.removeItem("propie.agent_profile_banner_dismiss");
  });
}

export async function waitPastSplash(page: Page) {
  await page.goto("/explore");
  await page.waitForURL(/\/explore/, { timeout: 25_000 });
}

async function chooseRole(page: Page, roleLabel: RegExp) {
  await primeRegisterSession(page);
  await waitPastSplash(page);
  await page.getByRole("button", { name: "Registrate" }).click();
  await page.waitForURL(/\/registro\/?$/);
  await page.getByRole("button", { name: roleLabel }).click();
  await page.waitForURL(/\/registro\/account/);
}

export async function startOwnerRegistration(page: Page) {
  await chooseRole(page, /Soy propietario/i);
}

export async function startAgentRegistration(page: Page) {
  await chooseRole(page, /Soy agente/i);
}

export async function startClientRegistration(page: Page) {
  await chooseRole(page, /Busco propiedad/i);
}

export async function fillUnifiedAccount(page: Page, email: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByTestId("register-field-password").fill("SecureP@ss1");
  await page.getByTestId("register-field-confirmPassword").fill("SecureP@ss1");
}

export async function continueFromAccount(page: Page) {
  await page.getByTestId("register-continue").click();
  await page.waitForURL(/\/registro\/profile/, { timeout: 15_000 });
}

export async function fillBasicProfile(page: Page) {
  await page.getByLabel("Nombre").fill("Juan");
  await page.getByLabel("Apellido").fill("Pérez");
  await page.getByLabel("Fecha de nacimiento").fill("1990-01-15");
  await page.getByLabel("Nacionalidad").fill("Argentina");
  await page.getByTestId("register-field-acceptTerms").check({ force: true });
  await page.getByTestId("register-field-acceptPrivacy").check({ force: true });
}

export async function submitBasicProfile(page: Page) {
  await page.getByTestId("register-create-account").click();
  await page.waitForURL(/\/registro\/verification/, { timeout: 15_000 });
}

export async function passVerification(page: Page) {
  const input = page.getByPlaceholder("000000");
  await input.click();
  await input.pressSequentially("123456");
}

export async function completeUnifiedRegistration(page: Page, email: string) {
  await fillUnifiedAccount(page, email);
  await continueFromAccount(page);
  await fillBasicProfile(page);
  await submitBasicProfile(page);
  await passVerification(page);
}
