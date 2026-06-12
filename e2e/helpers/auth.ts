import { expect, type Page } from "@playwright/test";

async function primeTestSession(page: Page) {
  await page.addInitScript(() => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
  });
}

async function skipBlockingPrompts(page: Page) {
  await page.evaluate(() => {
    sessionStorage.setItem("pwa-install-dismissed", "1");
    sessionStorage.setItem("propie_geo_banner_dismissed", "1");
    localStorage.setItem("propie_geo_prompt_shown", "1");
    localStorage.setItem("propie_geo_status", "skipped");
  });

  const skipLocation = page.getByRole("button", { name: "Ahora no" });

  if (await skipLocation.isVisible().catch(() => false)) {
    await skipLocation.click({ force: true });
  }
}

/** Splash runs once per full page load and redirects to /explore. */
export async function waitForAppReady(page: Page) {
  await primeTestSession(page);
  await page.goto("/");
  await page.waitForURL(/\/explore/, { timeout: 20_000 });
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible({
    timeout: 15_000,
  });
}

export async function dismissOverlays(page: Page) {
  await skipBlockingPrompts(page);
}

export async function openLogin(page: Page) {
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/ingresar/);
  await expect(page.getByLabel("Email")).toBeVisible();
}

export async function login(
  page: Page,
  email: string,
  password: string,
) {
  await waitForAppReady(page);
  await openLogin(page);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.locator("form").evaluate((form) => {
    (form as HTMLFormElement).requestSubmit();
  });
  await expect(page).toHaveURL(/\/explore/, { timeout: 20_000 });
  await dismissOverlays(page);
}

export async function logoutFromProfile(page: Page) {
  await page.getByRole("button", { name: "Perfil" }).click();
  await expect(page).toHaveURL(/\/perfil/);
  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await page
    .getByRole("button", { name: "Cerrar sesión", exact: true })
    .last()
    .click();
  await expect(page.getByRole("button", { name: "Ingresar" })).toBeVisible();
}
