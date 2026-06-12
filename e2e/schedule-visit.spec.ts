import { expect, test } from "@playwright/test";

import { login } from "./helpers/auth";
import { loadSeedData } from "./helpers/test-data";

test.describe("visit scheduling flow", () => {
  test("owner schedules a visit from an existing conversation", async ({
    page,
  }) => {
    const seed = loadSeedData();

    await login(page, seed.owner.email, seed.password);
    await page.getByRole("button", { name: "Mensajes" }).click();
    await expect(page).toHaveURL(/\/mensajes/);

    await page
      .getByRole("button")
      .filter({ hasText: seed.contactProperty.title })
      .click();
    await expect(page).toHaveURL(
      new RegExp(`/mensajes/${seed.visitConversation.id}`),
    );

    await page.getByRole("button", { name: "Agendar visita" }).first().click();
    await expect(page.getByLabel("Fecha")).toBeVisible();

    await page.getByRole("button", { name: "Agendar visita" }).last().click();
    await expect(
      page.getByText("Solicitud de visita enviada"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Entendido" }).click();
    await page.goBack();
    await expect(page).toHaveURL(/\/mensajes$/);

    await page.getByRole("button", { name: "Visitas" }).click();
    await expect(page).toHaveURL(/\/visitas/);
    await expect(page.getByText(seed.contactProperty.title).first()).toBeVisible();
  });
});
