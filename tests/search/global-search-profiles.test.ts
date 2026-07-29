import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";

type SearchAgent = {
  id: string;
  fullName: string;
};

type SearchResponse = {
  agents: SearchAgent[];
  owners: SearchAgent[];
};

describe("GET /search profile matching", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  const userIds: string[] = [];

  let hyphenAgentId: string;
  let obrienAgentId: string;
  let joseAgentId: string;

  beforeAll(async () => {
    app = await buildApp();

    // Unique prefixes avoid colliding with seeded agents under the result limit.
    const hyphen = await registerUserViaApi(app, "AGENT", {
      firstName: "Zzqjuan-Perez",
      lastName: "Zzqgarcia",
    });
    const obrien = await registerUserViaApi(app, "AGENT", {
      firstName: "Zzqo'Brien",
      lastName: "Zzqwalsh",
    });
    const jose = await registerUserViaApi(app, "AGENT", {
      firstName: "Zzqjosé",
      lastName: "Zzqmaría-Luisa",
    });

    userIds.push(hyphen.userId, obrien.userId, jose.userId);
    hyphenAgentId = hyphen.userId;
    obrienAgentId = obrien.userId;
    joseAgentId = jose.userId;

    // Ensure profile rows carry the same display names used by search COALESCE.
    await db.query(
      `
        UPDATE profiles
        SET first_name = u.first_name, last_name = u.last_name
        FROM users u
        WHERE profiles.user_id = u.id
          AND u.id = ANY($1::uuid[])
      `,
      [userIds],
    );
  });

  afterAll(async () => {
    await cleanupTestUsers(userIds);
    await app.close();
  });

  async function search(q: string): Promise<SearchResponse> {
    const response = await app.inject({
      method: "GET",
      url: `/search?q=${encodeURIComponent(q)}&limit=8`,
    });

    expect(response.statusCode).toBe(200);
    return response.json() as SearchResponse;
  }

  function agentIds(body: SearchResponse): string[] {
    return body.agents.map((agent) => agent.id);
  }

  it("matches hyphenated first names with and without hyphen", async () => {
    const withHyphen = await search("Zzqjuan-Perez");
    const withSpace = await search("Zzqjuan Perez");

    expect(agentIds(withHyphen)).toContain(hyphenAgentId);
    expect(agentIds(withSpace)).toContain(hyphenAgentId);
  });

  it("matches apostrophe names with apostrophe or spaced query", async () => {
    const withApostrophe = await search("Zzqo'Brien");
    const withSpace = await search("Zzqo Brien");

    expect(agentIds(withApostrophe)).toContain(obrienAgentId);
    expect(agentIds(withSpace)).toContain(obrienAgentId);
  });

  it("matches accented names with and without accents", async () => {
    const withAccent = await search("Zzqjosé");
    const withoutAccent = await search("Zzqjose");

    expect(agentIds(withAccent)).toContain(joseAgentId);
    expect(agentIds(withoutAccent)).toContain(joseAgentId);
  });

  it("is case-insensitive", async () => {
    const upper = await search("ZZQJUAN-PEREZ");
    const lower = await search("zzqjuan-perez");

    expect(agentIds(upper)).toContain(hyphenAgentId);
    expect(agentIds(lower)).toContain(hyphenAgentId);
  });

  it("returns empty agent groups for nonsense queries", async () => {
    const body = await search("zzznomatchxyz123");

    expect(body.agents).toEqual([]);
  });
});
