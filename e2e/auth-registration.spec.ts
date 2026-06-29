import { expect, test } from "@playwright/test";

import {
  advancePastAccount,
  advanceToSecurity,
  fillValidAccount,
  fillValidPersonalData,
  fillValidSecurity,
  passEmailVerification,
  startOwnerRegistration,
  submitOwnerRegistration,
} from "./helpers/register";

test.describe("registration and email verification", () => {
  test("register, verify email, login, and reach protected navigation", async ({
    page,
  }) => {
    const email = `e2e-verify-${Date.now()}@propie.test`;

    await startOwnerRegistration(page);
    await fillValidAccount(page, email);
    await advancePastAccount(page);
    await advanceToSecurity(page);
    await fillValidSecurity(page);
    await page.getByTestId("register-continue").click();
    await expect(page).toHaveURL(/\/registro\/profile-photo/);
    await page.getByTestId("register-continue").click();
    await expect(page).toHaveURL(/\/registro\/owner-info/);
    await submitOwnerRegistration(page);
    await passEmailVerification(page, email);

    await expect(page).toHaveURL(/\/explor(ar|e)/, { timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Perfil" })).toBeVisible();
  });
});
