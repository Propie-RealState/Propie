import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/database/client";
import { listConversationsService } from "@/modules/property-conversations/services/list-conversations.service";
import { markReadService } from "@/modules/property-conversations/services/mark-read.service";
import { sendMessageService } from "@/modules/property-conversations/services/send-message.service";
import {
  cleanupFixture,
  seedConversationFixture,
} from "../helpers/test-db";

async function getParticipantUnread(
  conversationId: string,
  userId: string,
) {
  const result = await db.query<{
    unread_count: number;
    last_read_at: string | null;
  }>(
    `
      SELECT unread_count, last_read_at
      FROM property_conversation_participant_states
      WHERE conversation_id = $1
        AND user_id = $2
    `,
    [conversationId, userId],
  );

  return result.rows[0];
}

describe("unread counters", () => {
  let fixture: Awaited<ReturnType<typeof seedConversationFixture>>;

  beforeAll(async () => {
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
  });

  it("increments unread for all active participants except sender", async () => {
    await sendMessageService({
      userId: fixture.clientId,
      conversationId: fixture.conversationId,
      body: "Unread bump",
    });

    const ownerState = await getParticipantUnread(
      fixture.conversationId,
      fixture.ownerId,
    );
    const agentState = await getParticipantUnread(
      fixture.conversationId,
      fixture.agentId,
    );
    const clientState = await getParticipantUnread(
      fixture.conversationId,
      fixture.clientId,
    );

    expect(ownerState.unread_count).toBeGreaterThan(0);
    expect(agentState.unread_count).toBeGreaterThan(0);
    expect(clientState.unread_count).toBe(0);
  });

  it("resets unread on mark read", async () => {
    await markReadService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
    });

    const ownerState = await getParticipantUnread(
      fixture.conversationId,
      fixture.ownerId,
    );

    expect(ownerState.unread_count).toBe(0);
  });

  it("updates last_read_at on mark read", async () => {
    await markReadService({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
    });

    const agentState = await getParticipantUnread(
      fixture.conversationId,
      fixture.agentId,
    );

    expect(agentState.last_read_at).not.toBeNull();
  });

  it("list endpoint reflects new message without websocket", async () => {
    await sendMessageService({
      userId: fixture.clientId,
      conversationId: fixture.conversationId,
      body: "Polling check",
    });

    const inbox = await listConversationsService({
      userId: fixture.ownerId,
    });

    const row = inbox.find((item) => item.id === fixture.conversationId);
    expect(row?.unreadCount).toBeGreaterThan(0);
  });
});
