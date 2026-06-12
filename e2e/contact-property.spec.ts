import { expect, test } from "@playwright/test";

import { login } from "./helpers/auth";
import { loadSeedData } from "./helpers/test-data";

test.describe("client contact flow", () => {
  test("client contacts a published property and opens conversation", async ({
    page,
  }) => {
    const seed = loadSeedData();

    await login(page, seed.client.email, seed.password);

    await page
      .getByPlaceholder("Buscar propiedades, ubicaciones, agentes...")
      .fill(seed.contactProperty.title);
    await page
      .getByRole("button", { name: seed.contactProperty.title })
      .click();

    await expect(page).toHaveURL(
      new RegExp(`/propiedad/${seed.contactProperty.id}`),
    );

    await expect(page.getByRole("button", { name: "Contactar" })).toBeEnabled();
    await page.getByRole("button", { name: "Contactar" }).click();

    await expect(page).toHaveURL(/\/mensajes\/[0-9a-f-]+/);
    await expect(
      page.getByPlaceholder("Escribí tu mensaje..."),
    ).toBeVisible();
  });
});
