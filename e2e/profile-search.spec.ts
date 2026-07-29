import { expect, test, type Page } from "@playwright/test";
import { randomUUID } from "node:crypto";

import { dismissOverlays, waitForAppReady } from "./helpers/auth";
import { createE2ePool } from "./helpers/db";

const API_URL = process.env.VITE_API_URL ?? "http://localhost:3000";

type SeededAgent = {
  id: string;
  firstName: string;
  lastName: string;
  label: string;
};

async function seedSearchAgents(
  pool: ReturnType<typeof createE2ePool>,
): Promise<{ agents: SeededAgent[]; cleanupIds: string[] }> {
  const suffix = randomUUID().slice(0, 8);
  const agents: SeededAgent[] = [
    {
      id: "",
      firstName: `E2qjuan-Perez-${suffix}`,
      lastName: `Hyphen-${suffix}`,
      label: "",
    },
    {
      id: "",
      firstName: `E2qo'Brien-${suffix}`,
      lastName: `Apostrophe-${suffix}`,
      label: "",
    },
    {
      id: "",
      firstName: `E2qjosé-${suffix}`,
      lastName: `María-Luisa-${suffix}`,
      label: "",
    },
  ];

  const cleanupIds: string[] = [];

  for (const agent of agents) {
    const inserted = await pool.query<{ id: string }>(
      `
        INSERT INTO users (
          first_name,
          last_name,
          email,
          password_hash,
          role,
          is_active,
          is_verified
        )
        VALUES ($1, $2, $3, $4, 'AGENT', true, true)
        RETURNING id
      `,
      [
        agent.firstName,
        agent.lastName,
        `e2e-search-${randomUUID().slice(0, 8)}@propie.test`,
        "e2e-hash",
      ],
    );

    const id = inserted.rows[0].id;
    agent.id = id;
    agent.label = `${agent.firstName} ${agent.lastName}`.trim();
    cleanupIds.push(id);

    await pool.query(
      `
        INSERT INTO profiles (user_id, first_name, last_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id) DO UPDATE
        SET first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name
      `,
      [id, agent.firstName, agent.lastName],
    );
  }

  return { agents, cleanupIds };
}

async function searchInExplore(page: Page, query: string) {
  const input = page.getByRole("searchbox", {
    name: "Búsqueda global",
  });
  await input.fill(query);
  await expect(input).toHaveValue(query);
}

async function expectAgentVisible(page: Page, label: string) {
  await expect(
    page.getByRole("listbox").getByText(label, { exact: false }).first(),
  ).toBeVisible({ timeout: 15_000 });
}

async function expectEmptyState(page: Page) {
  await expect(
    page.getByRole("listbox").getByText(
      "No encontramos resultados para tu búsqueda.",
    ),
  ).toBeVisible({ timeout: 15_000 });
}

test.describe("profile search normalization", () => {
  const pool = createE2ePool();
  let agents: SeededAgent[] = [];
  let cleanupIds: string[] = [];

  test.beforeAll(async () => {
    const seeded = await seedSearchAgents(pool);
    agents = seeded.agents;
    cleanupIds = seeded.cleanupIds;
  });

  test.afterAll(async () => {
    if (cleanupIds.length > 0) {
      await pool.query(`DELETE FROM profiles WHERE user_id = ANY($1::uuid[])`, [
        cleanupIds,
      ]);
      await pool.query(`DELETE FROM users WHERE id = ANY($1::uuid[])`, [
        cleanupIds,
      ]);
    }
    await pool.end();
  });

  test("API matches hyphen, apostrophe, accents, and case variants", async ({
    request,
  }) => {
    const [hyphen, obrien, jose] = agents;

    const spacedHyphen = hyphen.firstName.replace("-", " ");
    const spacedObrien = obrien.firstName.replace("'", " ");
    const unaccentedJose = jose.firstName
      .normalize("NFD")
      .replace(/\p{M}/gu, "");

    const cases: Array<{ q: string; agentId: string }> = [
      { q: hyphen.firstName, agentId: hyphen.id },
      { q: spacedHyphen, agentId: hyphen.id },
      { q: obrien.firstName, agentId: obrien.id },
      { q: spacedObrien, agentId: obrien.id },
      { q: jose.firstName, agentId: jose.id },
      { q: unaccentedJose, agentId: jose.id },
      { q: hyphen.firstName.toUpperCase(), agentId: hyphen.id },
      { q: hyphen.firstName.toLowerCase(), agentId: hyphen.id },
    ];

    for (const { q, agentId } of cases) {
      const response = await request.get(
        `${API_URL}/search?q=${encodeURIComponent(q)}&limit=8`,
      );
      expect(response.ok(), `search failed for ${q}`).toBeTruthy();
      const body = (await response.json()) as {
        agents: Array<{ id: string }>;
      };
      expect(
        body.agents.map((agent) => agent.id),
        `missing agent for query ${q}`,
      ).toContain(agentId);
    }
  });

  test("desktop Explore shows matches and empty state", async ({ page }) => {
    const [hyphen, obrien, jose] = agents;
    const spacedHyphen = hyphen.firstName.replace("-", " ");
    const unaccentedJose = jose.firstName
      .normalize("NFD")
      .replace(/\p{M}/gu, "");

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/explorar", { waitUntil: "domcontentloaded" });
    await waitForAppReady(page);
    await dismissOverlays(page);

    await searchInExplore(page, hyphen.firstName);
    await expectAgentVisible(page, hyphen.label);

    await searchInExplore(page, spacedHyphen);
    await expectAgentVisible(page, hyphen.label);

    await searchInExplore(page, obrien.firstName);
    await expectAgentVisible(page, obrien.label);

    await searchInExplore(page, jose.firstName);
    await expectAgentVisible(page, jose.label);

    await searchInExplore(page, unaccentedJose);
    await expectAgentVisible(page, jose.label);

    await searchInExplore(page, "zzznomatchxyz123");
    await expectEmptyState(page);
  });

  test("mobile Explore empty state and hyphen search", async ({ page }) => {
    const [hyphen] = agents;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/explorar", { waitUntil: "domcontentloaded" });
    await waitForAppReady(page);
    await dismissOverlays(page);

    await searchInExplore(page, hyphen.firstName);
    await expectAgentVisible(page, hyphen.label);

    await searchInExplore(page, "zzznomatchxyz123");
    await expectEmptyState(page);
  });
});
