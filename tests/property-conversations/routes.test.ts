import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import { generateAccessToken } from "@/services/auth/jwt";
import {
  cleanupStartConversationProperty,
  seedStartConversationProperty,
} from "../helpers/test-db";

describe("property-conversations routes", () => {
  let fixture: Awaited<ReturnType<typeof seedStartConversationProperty>>;
  let clientToken: string;
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    fixture = await seedStartConversationProperty();
    app = await buildApp();

    const user = await db.query<{ email: string }>(
      `SELECT email FROM users WHERE id = $1`,
      [fixture.clientId],
    );

    clientToken = generateAccessToken({
      userId: fixture.clientId,
      email: user.rows[0].email,
      role: "CLIENT",
    });
  });

  afterAll(async () => {
    await cleanupStartConversationProperty(fixture);
    await app.close();
  });

  it("POST /property-conversations creates a conversation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/property-conversations",
      headers: {
        authorization: `Bearer ${clientToken}`,
      },
      payload: {
        propertyId: fixture.propertyId,
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.success).toBe(true);
    expect(body.data.propertyId).toBe(fixture.propertyId);
  });

  it("GET /property-conversations lists conversations for client", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/property-conversations",
      headers: {
        authorization: `Bearer ${clientToken}`,
      },
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.data.length).toBeGreaterThan(0);
  });

  it("GET /chats returns deprecated response", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/chats",
      headers: {
        authorization: `Bearer ${clientToken}`,
      },
    });

    expect(response.statusCode).toBe(410);
    expect(response.json().error.code).toBe("DEPRECATED");
  });
});
