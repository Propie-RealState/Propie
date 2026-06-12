import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupProperty,
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";
import {
  ensureCommercializationModeSchema,
  setPropertyCommercializationMode,
} from "../helpers/ensure-commercialization-mode-schema";

describe("property commercialization mode", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let agent: Awaited<ReturnType<typeof registerUserViaApi>>;
  let withAgentsPropertyId: string;
  let withoutIntermediariesPropertyId: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    await ensureCommercializationModeSchema();
    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    agent = await registerUserViaApi(app, "AGENT");
    userIds.push(owner.userId, agent.userId);

    const withAgents = await db.query<{ id: string }>(
      `
        INSERT INTO properties (
          owner_id,
          title,
          property_type,
          operation_type,
          status,
          publisher_id,
          publisher_type,
          published_at
        )
        VALUES ($1, 'With Agents Property', 'HOUSE', 'SALE', 'ACTIVE', $1, 'OWNER', now())
        RETURNING id
      `,
      [owner.userId],
    );

    const withoutIntermediaries = await db.query<{ id: string }>(
      `
        INSERT INTO properties (
          owner_id,
          title,
          property_type,
          operation_type,
          status,
          publisher_id,
          publisher_type,
          published_at
        )
        VALUES ($1, 'No Intermediaries Property', 'HOUSE', 'SALE', 'ACTIVE', $1, 'OWNER', now())
        RETURNING id
      `,
      [owner.userId],
    );

    withAgentsPropertyId = withAgents.rows[0].id;
    withoutIntermediariesPropertyId = withoutIntermediaries.rows[0].id;

    await setPropertyCommercializationMode(withAgentsPropertyId, "WITH_AGENTS");
    await setPropertyCommercializationMode(
      withoutIntermediariesPropertyId,
      "WITHOUT_INTERMEDIARIES",
    );
  });

  afterAll(async () => {
    await cleanupProperty(withAgentsPropertyId);
    await cleanupProperty(withoutIntermediariesPropertyId);
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("defaults existing commercialization rows to WITH_AGENTS", async () => {
    const row = await db.query<{ commercialization_mode: string }>(
      `
        SELECT commercialization_mode
        FROM property_commercialization
        WHERE property_id = $1
      `,
      [withAgentsPropertyId],
    );

    expect(row.rows[0]?.commercialization_mode).toBe("WITH_AGENTS");
  });

  it("excludes WITHOUT_INTERMEDIARIES properties from agent discovery listings", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/properties",
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });

    expect(response.statusCode).toBe(200);
    const ids = response.json().map((property: { id: string }) => property.id);

    expect(ids).toContain(withAgentsPropertyId);
    expect(ids).not.toContain(withoutIntermediariesPropertyId);
  });

  it("blocks agent applications for WITHOUT_INTERMEDIARIES properties", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/agent-applications",
      headers: { authorization: `Bearer ${agent.accessToken}` },
      payload: {
        propertyId: withoutIntermediariesPropertyId,
        message: "Quiero representar esta propiedad",
      },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().success).toBe(false);
  });

  it("preserves WITH_AGENTS application flow", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/agent-applications",
      headers: { authorization: `Bearer ${agent.accessToken}` },
      payload: {
        propertyId: withAgentsPropertyId,
        message: "Quiero representar esta propiedad",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.property_id).toBe(withAgentsPropertyId);
  });

  it("returns accepts_agent_participation on property details", async () => {
    const blocked = await app.inject({
      method: "GET",
      url: `/properties/${withoutIntermediariesPropertyId}`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });

    expect(blocked.statusCode).toBe(200);
    expect(blocked.json().accepts_agent_participation).toBe(false);

    const allowed = await app.inject({
      method: "GET",
      url: `/properties/${withAgentsPropertyId}`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
    });

    expect(allowed.statusCode).toBe(200);
    expect(allowed.json().accepts_agent_participation).toBe(true);
  });

  it("maps DIRECT commercialization type to WITHOUT_INTERMEDIARIES", async () => {
    const draft = await db.query<{ id: string }>(
      `
        INSERT INTO properties (
          owner_id,
          title,
          property_type,
          operation_type,
          status,
          publisher_id,
          publisher_type
        )
        VALUES ($1, 'Direct Commercialization Property', 'HOUSE', 'SALE', 'ACTIVE', $1, 'OWNER')
        RETURNING id
      `,
      [owner.userId],
    );

    const propertyId = draft.rows[0].id;

    try {
      const response = await app.inject({
        method: "PATCH",
        url: `/properties/${propertyId}/commercialization`,
        headers: { authorization: `Bearer ${owner.accessToken}` },
        payload: {
          commercializationType: "DIRECT",
          manualApproval: false,
        },
      });

      expect(response.statusCode).toBe(200);

      const row = await db.query<{ commercialization_mode: string }>(
        `
          SELECT commercialization_mode
          FROM property_commercialization
          WHERE property_id = $1
        `,
        [propertyId],
      );

      expect(row.rows[0]?.commercialization_mode).toBe(
        "WITHOUT_INTERMEDIARIES",
      );

      const agentList = await app.inject({
        method: "GET",
        url: "/properties",
        headers: { authorization: `Bearer ${agent.accessToken}` },
      });

      const ids = agentList.json().map((property: { id: string }) => property.id);
      expect(ids).not.toContain(propertyId);
    } finally {
      await cleanupProperty(propertyId);
    }
  });

  it("persists commercialization settings without chat/calendar toggles", async () => {
    const draft = await db.query<{ id: string }>(
      `
        INSERT INTO properties (
          owner_id,
          title,
          property_type,
          operation_type,
          status,
          publisher_id,
          publisher_type
        )
        VALUES ($1, 'Commercialization API Property', 'HOUSE', 'SALE', 'ACTIVE', $1, 'OWNER')
        RETURNING id
      `,
      [owner.userId],
    );

    const propertyId = draft.rows[0].id;

    try {
      const response = await app.inject({
        method: "PATCH",
        url: `/properties/${propertyId}/commercialization`,
        headers: { authorization: `Bearer ${owner.accessToken}` },
        payload: {
          commercializationType: "AGENTS",
          manualApproval: true,
        },
      });

      expect(response.statusCode).toBe(200);

      const row = await db.query<{
        commercialization_type: string;
        commercialization_mode: string;
        manual_approval: boolean;
        allow_chat: boolean;
        shared_calendar: boolean;
      }>(
        `
          SELECT
            commercialization_type,
            commercialization_mode,
            manual_approval,
            allow_chat,
            shared_calendar
          FROM property_commercialization
          WHERE property_id = $1
        `,
        [propertyId],
      );

      expect(row.rows[0]).toMatchObject({
        commercialization_type: "AGENTS",
        commercialization_mode: "WITH_AGENTS",
        manual_approval: true,
        allow_chat: true,
        shared_calendar: false,
      });
    } finally {
      await cleanupProperty(propertyId);
    }
  });
});
