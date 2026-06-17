import { expect, test } from "@playwright/test";

import {
  fillUnifiedAccount,
  continueFromAccount,
  fillBasicProfile,
  startOwnerRegistration,
} from "./helpers/register";

test.describe("registration validation", () => {
  test("invalid email blocks continue", async ({ page }) => {
    await startOwnerRegistration(page);
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByTestId("register-field-password").fill("SecureP@ss1");
    await page.getByTestId("register-field-confirmPassword").fill("SecureP@ss1");
    await page.getByLabel("Email").blur();

    await expect(page.getByText("Ingresá un email válido")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("weak password shows strength indicator", async ({ page }) => {
    await startOwnerRegistration(page);
    await page.getByTestId("register-field-password").fill("abc");

    await expect(page.getByText("Contraseña débil")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("underage blocks basic profile step", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillUnifiedAccount(page, `age-test-${Date.now()}@test.com`);
    await continueFromAccount(page);

    await page.getByLabel("Nombre").fill("Juan");
    await page.getByLabel("Apellido").fill("Pérez");
    await page.getByLabel("Fecha de nacimiento").fill("2015-06-01");
    await page.getByLabel("Nacionalidad").fill("Argentina");
    await page.getByLabel("Fecha de nacimiento").blur();
    await expect(page.getByText("Debés ser mayor de 18 años")).toBeVisible();
    await expect(page.getByTestId("register-create-account")).toBeDisabled();
  });

  test("valid owner flow reaches verification", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillUnifiedAccount(page, `valid-flow-${Date.now()}@test.com`);
    await continueFromAccount(page);
    await fillBasicProfile(page);
    await page.getByTestId("register-create-account").click();
    await expect(page).toHaveURL(/\/registro\/verification/);
    await expect(page.getByText("Verificá tu email")).toBeVisible();
  });
});
