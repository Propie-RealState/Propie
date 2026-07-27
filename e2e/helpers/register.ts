import { expect, type Page } from "@playwright/test";

export async function primeRegisterSession(page: Page) {
  // Banner dismissals only — do NOT clear registerDraft here.
  // addInitScript runs on every navigation/reload; wiping the draft would
  // break route-guard refresh/deep-link scenarios.
  await page.addInitScript(() => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
  });
}

export async function clearRegisterDraft(page: Page) {
  await page.evaluate(() => {
    sessionStorage.removeItem("propie.registerDraft");
  });
}

export async function waitPastSplash(page: Page) {
  await page.goto("/");
  await page.waitForURL(/\/explor(ar|e)/, { timeout: 25_000 });
}

export async function startOwnerRegistration(page: Page) {
  await primeRegisterSession(page);
  await waitPastSplash(page);
  await clearRegisterDraft(page);
  await page.getByRole("button", { name: "Registrate" }).click();
  await page.waitForURL(/\/registro\/?$/);
  await page.getByRole("button", { name: /Soy dueño/i }).click();
  await page.waitForURL(/\/registro\/owner/);
  await expect(page.getByLabel("Nombre")).toBeVisible({ timeout: 15_000 });
}

export async function startAgentRegistration(page: Page) {
  await primeRegisterSession(page);
  await waitPastSplash(page);
  await clearRegisterDraft(page);
  await page.getByRole("button", { name: "Registrate" }).click();
  await page.waitForURL(/\/registro\/?$/);
  await page.getByRole("button", { name: /Agente/i }).click();
  await page.waitForURL(/\/registro\/agent/);
  await expect(page.getByLabel("Nombre")).toBeVisible({ timeout: 15_000 });
}

export async function startClientRegistration(page: Page) {
  await primeRegisterSession(page);
  await waitPastSplash(page);
  await clearRegisterDraft(page);
  await page.getByRole("button", { name: "Registrate" }).click();
  await page.waitForURL(/\/registro\/?$/);
  await page.getByRole("button", { name: /Quiero explorar/i }).click();
  await page.waitForURL(/\/registro\/client/);
  await expect(page.getByLabel("Nombre")).toBeVisible({ timeout: 15_000 });
}

export async function readRegisterDraft(page: Page) {
  return page.evaluate(() => {
    const raw = sessionStorage.getItem("propie.registerDraft");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return null;
    }
  });
}

export async function fillValidAccount(page: Page, email: string) {
  await page.getByLabel("Nombre").fill("Juan");
  await page.getByLabel("Apellido").fill("Pérez");
  await page.getByLabel("Email").fill(email);
  await page.getByTestId("register-field-password").fill("SecureP@ss1");
  await page.getByTestId("register-field-acceptTerms").check({ force: true });
  await page.getByTestId("register-field-acceptPrivacy").check({ force: true });
}

export async function fillValidPersonalData(page: Page) {
  await page.getByLabel("DNI").fill("12345678");
  await page.getByLabel("Fecha de nacimiento").fill("1990-01-15");
  await page.getByLabel("Nacionalidad").fill("Argentina");
  await page.getByLabel("CUIT/CUIL").fill("20123456789");
  await page.getByLabel("Dirección").fill("Av. Corrientes 1234");
  await page.getByLabel("Ciudad / zona").fill("Buenos Aires");
  await page.waitForFunction(() => {
    const raw = sessionStorage.getItem("propie.registerDraft");
    if (!raw) return false;
    try {
      const draft = JSON.parse(raw) as {
        dni?: string;
        birthDate?: string;
        nationality?: string;
        cuitCuil?: string;
        address?: string;
        location?: string;
      };
      return (
        draft.dni?.length === 8 &&
        Boolean(draft.birthDate) &&
        (draft.nationality?.length ?? 0) >= 2 &&
        draft.cuitCuil?.length === 11 &&
        (draft.address?.length ?? 0) >= 5 &&
        (draft.location?.length ?? 0) >= 2
      );
    } catch {
      return false;
    }
  });
}

export async function advanceToSecurity(page: Page) {
  await fillValidPersonalData(page);
  await expect(page.getByTestId("register-continue")).toBeEnabled({ timeout: 10_000 });
  await page.getByTestId("register-continue").click();
  await expect(page.getByRole("heading", { name: "Seguridad de cuenta" })).toBeVisible({
    timeout: 20_000,
  });
}

export async function fillValidSecurity(page: Page) {
  await expect(page).toHaveURL(/\/registro\/security/);
  await expect(page.locator("#phone")).toBeVisible({ timeout: 15_000 });
  await page.locator("#phone").fill("1123456789");
}

export async function advancePastAccount(page: Page) {
  if (!/\/registro\/personal-data/.test(page.url())) {
    await expect(page.getByTestId("register-continue")).toBeEnabled({
      timeout: 10_000,
    });
    await page.getByTestId("register-continue").click();
  }
  await expect(page).toHaveURL(/\/registro\/personal-data/, { timeout: 15_000 });
}

export async function submitOwnerRegistration(page: Page) {
  const registerResponse = page.waitForResponse(
    (response) =>
      response.url().includes("/auth/register") &&
      response.request().method() === "POST",
  );

  await page.getByRole("button", { name: /Finalizar/i }).click();

  const response = await registerResponse;
  expect(response.status()).toBe(201);
  await expect(page).toHaveURL(/\/registro\/verification/, { timeout: 20_000 });
}

export async function passEmailVerification(page: Page, email: string) {
  const { readFileSync } = await import("node:fs");
  const { join } = await import("node:path");

  await expect(page).toHaveURL(/\/registro\/verification/, { timeout: 20_000 });

  const codePath = join(
    process.cwd(),
    "e2e",
    ".verification-codes",
    `${email.trim().toLowerCase()}.code`,
  );

  await expect
    .poll(() => {
      try {
        return readFileSync(codePath, "utf8").trim();
      } catch {
        return "";
      }
    })
    .toMatch(/^\d{6}$/);

  const code = readFileSync(codePath, "utf8").trim();
  const input = page.getByPlaceholder("000000");
  await input.click();
  await input.pressSequentially(code);
  await expect(page.getByText("Verificado")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Perfil" })).toBeVisible({
    timeout: 45_000,
  });
}
