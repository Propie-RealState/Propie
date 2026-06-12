import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import { generateAccessToken } from "@/services/auth/jwt";
import {
  cleanupFixture,
  seedConversationFixture,
  type ConversationFixture,
} from "../helpers/test-db";
import { ensureVisitSchema } from "../helpers/ensure-visit-schema";

function futureDate(daysAhead = 4) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(14, 0, 0, 0);
  return date.toISOString();
}

describe("property-visits routes", () => {
  let fixture: ConversationFixture;
  let agentToken: string;
  let clientToken: string;
  let ownerToken: string;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    await ensureVisitSchema();
    fixture = await seedConversationFixture();
    app = await buildApp();

    const users = await db.query<{ id: string; email: string; role: string }>(
      `SELECT id, email, role FROM users WHERE id = ANY($1::uuid[])`,
      [[fixture.agentId, fixture.clientId, fixture.ownerId]],
    );

    const byId = Object.fromEntries(users.rows.map((row) => [row.id, row]));

    agentToken = generateAccessToken({
      userId: fixture.agentId,
      email: byId[fixture.agentId].email,
      role: "AGENT",
    });

    clientToken = generateAccessToken({
      userId: fixture.clientId,
      email: byId[fixture.clientId].email,
      role: "CLIENT",
    });

    ownerToken = generateAccessToken({
      userId: fixture.ownerId,
      email: byId[fixture.ownerId].email,
      role: "OWNER",
    });
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
    await app.close();
  });

  it("POST /property-visits creates visit (agent)", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/property-visits",
      headers: { authorization: `Bearer ${agentToken}` },
      payload: {
        conversationId: fixture.conversationId,
        scheduledAt: futureDate(5),
        durationMinutes: 30,
        notes: "Visita de prueba",
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.status).toBe("SCHEDULED");
  });

  it("POST /property-visits creates visit (owner)", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/property-visits",
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: {
        conversationId: fixture.conversationId,
        scheduledAt: futureDate(8),
        durationMinutes: 30,
      },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.agentId).toBe(fixture.agentId);
  });

  it("POST /property-visits rejects client", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/property-visits",
      headers: { authorization: `Bearer ${clientToken}` },
      payload: {
        conversationId: fixture.conversationId,
        scheduledAt: futureDate(6),
        durationMinutes: 30,
      },
    });

    expect(response.statusCode).toBe(403);
  });

  it("GET /property-visits lists upcoming for client", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/property-visits?segment=upcoming",
      headers: { authorization: `Bearer ${clientToken}` },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.length).toBeGreaterThan(0);
  });

  it("GET /property-visits/analytics for owner", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/property-visits/analytics",
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.data).toHaveProperty("created");
    expect(body.data).toHaveProperty("completed");
  });

  it("visit confirm and complete flow via routes", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/property-visits",
      headers: { authorization: `Bearer ${agentToken}` },
      payload: {
        conversationId: fixture.conversationId,
        scheduledAt: futureDate(7),
        durationMinutes: 30,
      },
    });

    const visitId = createResponse.json().data.id;

    const confirmResponse = await app.inject({
      method: "POST",
      url: `/property-visits/${visitId}/confirm`,
      headers: { authorization: `Bearer ${clientToken}` },
    });

    expect(confirmResponse.statusCode).toBe(200);
    expect(confirmResponse.json().data.status).toBe("CONFIRMED");

    const completeResponse = await app.inject({
      method: "POST",
      url: `/property-visits/${visitId}/complete`,
      headers: { authorization: `Bearer ${agentToken}` },
    });

    expect(completeResponse.statusCode).toBe(200);
    expect(completeResponse.json().data.status).toBe("COMPLETED");
  });
});
