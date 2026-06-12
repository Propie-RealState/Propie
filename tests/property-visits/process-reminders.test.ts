import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { getCronSecret } from "@/config/cron";
import { generateAccessToken } from "@/services/auth/jwt";
import {
  cleanupFixture,
  seedConversationFixture,
  type ConversationFixture,
} from "../helpers/test-db";
import { ensureVisitSchema } from "../helpers/ensure-visit-schema";

describe("POST /property-visits/process-reminders", () => {
  let fixture: ConversationFixture;
  let clientToken: string;
  let app: Awaited<ReturnType<typeof buildApp>>;
  const cronSecret = getCronSecret();

  beforeAll(async () => {
    await ensureVisitSchema();
    fixture = await seedConversationFixture();
    app = await buildApp();

    clientToken = generateAccessToken({
      userId: fixture.clientId,
      email: "client@test.local",
      role: "CLIENT",
    });
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
    await app.close();
  });

  it("rejects requests without cron secret", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/property-visits/process-reminders",
      headers: { authorization: `Bearer ${clientToken}` },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe("UNAUTHORIZED");
  });

  it("rejects requests with invalid cron secret", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/property-visits/process-reminders",
      headers: { "x-cron-secret": "wrong-secret" },
    });

    expect(response.statusCode).toBe(401);
  });

  it("allows execution with valid cron secret", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/property-visits/process-reminders",
      headers: { "x-cron-secret": cronSecret },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().success).toBe(true);
    expect(response.json().data).toHaveProperty("processedCount");
  });
});
