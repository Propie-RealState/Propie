import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import {
  cleanupProperty,
  cleanupTestUsers,
  registerUserViaApi,
} from "../helpers/auth-fixtures";

describe("agent applications lifecycle", () => {
  let app: Awaited<ReturnType<typeof buildApp>>;
  let owner: Awaited<ReturnType<typeof registerUserViaApi>>;
  let agent: Awaited<ReturnType<typeof registerUserViaApi>>;
  let secondAgent: Awaited<ReturnType<typeof registerUserViaApi>>;
  let client: Awaited<ReturnType<typeof registerUserViaApi>>;
  let propertyId: string;
  let applicationId: string;
  let rejectedApplicationId: string;
  const userIds: string[] = [];

  beforeAll(async () => {
    app = await buildApp();
    owner = await registerUserViaApi(app, "OWNER");
    agent = await registerUserViaApi(app, "AGENT");
    secondAgent = await registerUserViaApi(app, "AGENT");
    client = await registerUserViaApi(app, "CLIENT");
    userIds.push(
      owner.userId,
      agent.userId,
      secondAgent.userId,
      client.userId,
    );

    const property = await db.query<{ id: string }>(
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
        VALUES ($1, $2, $3, $4, $5, $1, 'OWNER', now())
        RETURNING id
      `,
      [owner.userId, "Agent Application Property", "HOUSE", "SALE", "ACTIVE"],
    );

    propertyId = property.rows[0].id;
  });

  afterAll(async () => {
    await cleanupProperty(propertyId);
    await cleanupTestUsers(userIds);
    await app.close();
  });

  it("allows an agent to apply to a property", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/agent-applications",
      headers: { authorization: `Bearer ${agent.accessToken}` },
      payload: {
        propertyId,
        message: "Me interesa representar esta propiedad",
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("PENDING");
    expect(body.data.property_id).toBe(propertyId);
    expect(body.data.agent_id).toBe(agent.userId);

    applicationId = body.data.id;
  });

  it("upserts duplicate pending applications instead of creating duplicates", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/agent-applications",
      headers: { authorization: `Bearer ${agent.accessToken}` },
      payload: {
        propertyId,
        message: "Mensaje actualizado",
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.id).toBe(applicationId);
    expect(response.json().data.message).toBe("Mensaje actualizado");

    const countRow = await db.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM agent_applications
        WHERE property_id = $1 AND agent_id = $2
      `,
      [propertyId, agent.userId],
    );

    expect(Number(countRow.rows[0].count)).toBe(1);
  });

  it("rejects applications from non-agents", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/agent-applications",
      headers: { authorization: `Bearer ${client.accessToken}` },
      payload: { propertyId },
    });

    expect(response.statusCode).toBe(403);
  });

  it("lists pending applications for the owner", async () => {
    const listResponse = await app.inject({
      method: "GET",
      url: "/agent-applications/owner",
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().data.length).toBeGreaterThan(0);

    const countResponse = await app.inject({
      method: "GET",
      url: "/agent-applications/owner/count",
      headers: { authorization: `Bearer ${owner.accessToken}` },
    });

    expect(countResponse.statusCode).toBe(200);
    expect(countResponse.json().data.count).toBeGreaterThanOrEqual(1);
  });

  it("allows the owner to reject a pending application", async () => {
    const applyResponse = await app.inject({
      method: "POST",
      url: "/agent-applications",
      headers: { authorization: `Bearer ${secondAgent.accessToken}` },
      payload: {
        propertyId,
        message: "También me interesa",
      },
    });

    rejectedApplicationId = applyResponse.json().data.id;

    const response = await app.inject({
      method: "PATCH",
      url: `/agent-applications/${rejectedApplicationId}/status`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { status: "REJECTED" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.status).toBe("REJECTED");
  });

  it("allows the owner to accept an application", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/agent-applications/${applicationId}/status`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { status: "ACCEPTED" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.status).toBe("ACCEPTED");
  });

  it("prevents agents from accepting applications", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/agent-applications/${applicationId}/status`,
      headers: { authorization: `Bearer ${agent.accessToken}` },
      payload: { status: "REJECTED" },
    });

    expect(response.statusCode).toBe(404);
  });

  it("rejects accepting an already accepted application again", async () => {
    const response = await app.inject({
      method: "PATCH",
      url: `/agent-applications/${applicationId}/status`,
      headers: { authorization: `Bearer ${owner.accessToken}` },
      payload: { status: "ACCEPTED" },
    });

    expect(response.statusCode).toBe(409);
  });
});
