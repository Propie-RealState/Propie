import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/database/client";
import { sendMessageService } from "@/modules/property-conversations/services/send-message.service";
import {
  cleanupFixture,
  seedConversationFixture,
} from "../helpers/test-db";

async function countNotifications(userId: string) {
  const result = await db.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM notifications
      WHERE user_id = $1
        AND type = 'MESSAGE_RECEIVED'
    `,
    [userId],
  );

  return Number(result.rows[0]?.count ?? 0);
}

async function getLatestMessage(conversationId: string) {
  const result = await db.query<{ sender_id: string; body: string }>(
    `
      SELECT sender_id, body
      FROM property_conversation_messages
      WHERE conversation_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [conversationId],
  );

  return result.rows[0] ?? null;
}

describe("messaging", () => {
  let fixture: Awaited<ReturnType<typeof seedConversationFixture>>;

  beforeAll(async () => {
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
  });

  it("client sends message", async () => {
    const message = await sendMessageService({
      userId: fixture.clientId,
      conversationId: fixture.conversationId,
      body: "Client follow-up",
    });

    expect(message.senderId).toBe(fixture.clientId);
    expect(message.body).toBe("Client follow-up");
  });

  it("agent sends message", async () => {
    await sendMessageService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      body: "Agent reply",
    });

    const latest = await getLatestMessage(fixture.conversationId);
    expect(latest?.sender_id).toBe(fixture.agentId);
    expect(latest?.body).toBe("Agent reply");
  });

  it("owner sends message", async () => {
    await sendMessageService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
      body: "Owner reply",
    });

    const latest = await getLatestMessage(fixture.conversationId);
    expect(latest?.sender_id).toBe(fixture.ownerId);
    expect(latest?.body).toBe("Owner reply");
  });

  it("creates MESSAGE_RECEIVED notifications for all participants except sender", async () => {
    const before = await countNotifications(fixture.ownerId);

    await sendMessageService({
      userId: fixture.clientId,
      conversationId: fixture.conversationId,
      body: "Hola owner",
    });

    const after = await countNotifications(fixture.ownerId);
    expect(after).toBe(before + 1);
  });

  it("does not notify revoked agents", async () => {
    await fixture.deactivateAgent();

    const before = await countNotifications(fixture.agentId);

    await sendMessageService({
      userId: fixture.clientId,
      conversationId: fixture.conversationId,
      body: "After agent removed",
    });

    const after = await countNotifications(fixture.agentId);
    expect(after).toBe(before);
  });
});
