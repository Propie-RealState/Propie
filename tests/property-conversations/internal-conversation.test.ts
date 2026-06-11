import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/database/client";
import { sendMessageService } from "@/modules/property-conversations/services/send-message.service";
import { startInternalConversationService } from "@/modules/property-conversations/services/start-internal-conversation.service";
import { listConversationsService } from "@/modules/property-conversations/services/list-conversations.service";
import {
  cleanupFixture,
  seedConversationFixture,
} from "../helpers/test-db";

describe("internal conversations", () => {
  let fixture: Awaited<ReturnType<typeof seedConversationFixture>>;

  beforeAll(async () => {
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
  });

  it("owner starts internal conversation with assigned agent", async () => {
    const conversation = await startInternalConversationService({
      userId: fixture.ownerId,
      propertyId: fixture.propertyId,
      agentId: fixture.agentId,
    });

    expect(conversation.conversationType).toBe("PROPERTY_INTERNAL");
    expect(conversation.internalAgentId).toBe(fixture.agentId);
    expect(conversation.clientId).toBeNull();
  });

  it("agent starts internal conversation with owner", async () => {
    const conversation = await startInternalConversationService({
      userId: fixture.agentId,
      propertyId: fixture.propertyId,
    });

    expect(conversation.conversationType).toBe("PROPERTY_INTERNAL");
    expect(conversation.internalAgentId).toBe(fixture.agentId);
  });

  it("reuses the same internal thread per property and agent", async () => {
    const first = await startInternalConversationService({
      userId: fixture.ownerId,
      propertyId: fixture.propertyId,
      agentId: fixture.agentId,
    });

    const second = await startInternalConversationService({
      userId: fixture.agentId,
      propertyId: fixture.propertyId,
    });

    expect(second.id).toBe(first.id);
  });

  it("lists internal conversations in the shared inbox", async () => {
    await startInternalConversationService({
      userId: fixture.ownerId,
      propertyId: fixture.propertyId,
      agentId: fixture.agentId,
    });

    const ownerInbox = await listConversationsService({
      userId: fixture.ownerId,
    });
    const agentInbox = await listConversationsService({
      userId: fixture.agentId,
    });

    expect(
      ownerInbox.some(
        (conversation) => conversation.conversationType === "PROPERTY_INTERNAL",
      ),
    ).toBe(true);
    expect(
      agentInbox.some(
        (conversation) => conversation.conversationType === "PROPERTY_INTERNAL",
      ),
    ).toBe(true);
    expect(
      ownerInbox.some(
        (conversation) => conversation.conversationType === "PROPERTY_CLIENT",
      ),
    ).toBe(true);
  });

  it("does not expose internal conversations to clients", async () => {
    await startInternalConversationService({
      userId: fixture.ownerId,
      propertyId: fixture.propertyId,
      agentId: fixture.agentId,
    });

    const clientInbox = await listConversationsService({
      userId: fixture.clientId,
    });

    expect(
      clientInbox.every(
        (conversation) => conversation.conversationType === "PROPERTY_CLIENT",
      ),
    ).toBe(true);
  });

  it("allows owner and agent to exchange messages in internal thread", async () => {
    const conversation = await startInternalConversationService({
      userId: fixture.ownerId,
      propertyId: fixture.propertyId,
      agentId: fixture.agentId,
    });

    const ownerMessage = await sendMessageService({
      userId: fixture.ownerId,
      conversationId: conversation.id,
      body: "Hola agente",
    });

    const agentMessage = await sendMessageService({
      userId: fixture.agentId,
      conversationId: conversation.id,
      body: "Hola owner",
    });

    expect(ownerMessage.senderRole).toBe("OWNER");
    expect(agentMessage.senderRole).toBe("AGENT");

    const result = await db.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM property_conversation_messages
        WHERE conversation_id = $1
      `,
      [conversation.id],
    );

    expect(Number(result.rows[0]?.count ?? 0)).toBeGreaterThanOrEqual(2);
  });
});
