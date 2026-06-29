import { expect, test } from "@playwright/test";
import path from "node:path";

import {
  fillValidAccount,
  fillValidPersonalData,
  fillValidSecurity,
  advanceToSecurity,
  advancePastAccount,
  startAgentRegistration,
  startOwnerRegistration,
} from "./helpers/register";

test.describe("registration validation", () => {
  test("invalid email blocks continue", async ({ page }) => {
    await startOwnerRegistration(page);
    await page.getByLabel("Nombre").fill("Juan");
    await page.getByLabel("Apellido").fill("Pérez");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByTestId("register-field-password").fill("SecureP@ss1");
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

  test("invalid DNI blocks personal data step", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `dni-test-${Date.now()}@test.com`);
    await page.getByTestId("register-continue").click();
    await advancePastAccount(page);

    await page.getByLabel("DNI").fill("123");
    await page.getByLabel("DNI").blur();
    await expect(page.getByText("El DNI debe tener entre 7 y 8 dígitos")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("underage birth date is rejected", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `age-test-${Date.now()}@test.com`);
    await page.getByTestId("register-continue").click();
    await advancePastAccount(page);

    await page.getByLabel("DNI").fill("12345678");
    await page.getByLabel("Fecha de nacimiento").fill("2015-06-01");
    await page.getByLabel("Fecha de nacimiento").blur();
    await expect(page.getByText("Debés ser mayor de 18 años")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("invalid CUIT/CUIL blocks continue", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `cuit-test-${Date.now()}@test.com`);
    await page.getByTestId("register-continue").click();
    await advancePastAccount(page);

    await fillValidPersonalData(page);
    await page.getByLabel("CUIT/CUIL").fill("123");
    await page.getByLabel("CUIT/CUIL").blur();
    await expect(page.getByText("El CUIT/CUIL debe tener exactamente 11 dígitos")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("invalid recovery phone blocks security step", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `phone-test-${Date.now()}@test.com`);
    await page.getByTestId("register-continue").click();
    await advancePastAccount(page);
    await advanceToSecurity(page);

    await page.locator("#recoveryEmail").fill("recovery@test.com");
    await page.locator("#recoveryPhone").fill("123");
    await page.locator("#recoveryPhone").blur();
    await expect(page.getByText("El teléfono debe tener al menos 10 dígitos")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("invalid PIN when enabled blocks continue", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `pin-test-${Date.now()}@test.com`);
    await page.getByTestId("register-continue").click();
    await advancePastAccount(page);
    await advanceToSecurity(page);

    await page.getByTestId("register-field-pinEnabled").check({ force: true });
    await page.getByPlaceholder("Ingresá tu PIN de 4 dígitos").fill("12");
    await page.getByPlaceholder("Ingresá tu PIN de 4 dígitos").blur();
    await expect(page.getByText("El PIN debe tener exactamente 4 dígitos")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("oversized profile photo shows error", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `photo-test-${Date.now()}@test.com`);
    await page.getByTestId("register-continue").click();
    await advancePastAccount(page);
    await advanceToSecurity(page);
    await fillValidSecurity(page);
    await page.getByTestId("register-continue").click();

    const bigFile = path.join(__dirname, "fixtures", "oversized.png");
    await page.getByTestId("register-field-profilePhoto").setInputFiles(bigFile);
    await expect(page.getByText("La imagen no puede superar 10 MB")).toBeVisible();
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("agent document validation requires all files", async ({ page }) => {
    await startAgentRegistration(page);
    await fillValidAccount(page, `agent-doc-${Date.now()}@test.com`);
    await page.getByTestId("register-continue").click();
    await advancePastAccount(page);

    await fillValidPersonalData(page);
    await expect(page.getByTestId("register-continue")).toBeDisabled();

    const validImage = path.join(__dirname, "fixtures", "valid-id.png");
    await page.getByTestId("register-field-dniFrontImage").setInputFiles(validImage);
    await expect(page.getByTestId("register-continue")).toBeDisabled();
  });

  test("valid owner flow reaches profile photo", async ({ page }) => {
    await startOwnerRegistration(page);
    await fillValidAccount(page, `valid-flow-${Date.now()}@test.com`);
    await page.getByTestId("register-continue").click();
    await advancePastAccount(page);
    await advanceToSecurity(page);
    await fillValidSecurity(page);
    await page.getByTestId("register-continue").click();

    await expect(page).toHaveURL(/\/registro\/profile-photo/);
    await expect(page.getByText("Foto de perfil")).toBeVisible();
  });
});
