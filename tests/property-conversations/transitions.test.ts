import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "@/app";
import { db } from "@/database/client";
import { appendConversationEvent } from "@/modules/property-conversations/services/append-conversation-event.service";
import { sendMessageService } from "@/modules/property-conversations/services/send-message.service";
import {
  archiveConversationService,
  closeConversationService,
  reopenConversationService,
} from "@/modules/property-conversations/services/update-conversation-status.service";
import { startConversationService } from "@/modules/property-conversations/services/start-conversation.service";
import {
  revokeParticipantOnAgentDeactivated,
  syncParticipantsOnAgentEnabled,
} from "@/modules/property-conversations/services/sync-participants.service";
import type { PropertyConversationStatus } from "@/modules/property-conversations/types/property-conversation.types";
import {
  assertConversationStatusTransition,
  ConversationStatusTransitionError,
  getAllowedConversationStatusTransitions,
} from "@/modules/property-conversations/utils/conversation-status-transitions";
import { canSendMessage } from "@/modules/property-conversations/repositories/can-access-conversation.repository";
import { generateAccessToken } from "@/services/auth/jwt";
import {
  cleanupFixture,
  cleanupStartConversationProperty,
  seedConversationFixture,
  seedStartConversationProperty,
} from "../helpers/test-db";

const ALL_STATUSES: PropertyConversationStatus[] = [
  "OPEN",
  "ARCHIVED",
  "CLOSED",
];

const LEGAL_TRANSITIONS: [PropertyConversationStatus, PropertyConversationStatus][] = [
  ["OPEN", "ARCHIVED"],
  ["OPEN", "CLOSED"],
  ["ARCHIVED", "OPEN"],
];

describe("conversation status transition matrix", () => {
  it("exposes allowed targets per status", () => {
    expect(getAllowedConversationStatusTransitions("OPEN")).toEqual([
      "ARCHIVED",
      "CLOSED",
    ]);
    expect(getAllowedConversationStatusTransitions("CLOSED")).toEqual([]);
  });

  it.each(LEGAL_TRANSITIONS)("allows %s → %s", (from, to) => {
    expect(() => assertConversationStatusTransition(from, to)).not.toThrow();
  });

  it.each(
    ALL_STATUSES.flatMap((from) =>
      ALL_STATUSES.filter((to) => to !== from).map((to) => [from, to] as const),
    ).filter(
      ([from, to]) =>
        !LEGAL_TRANSITIONS.some(([legalFrom, legalTo]) => legalFrom === from && legalTo === to),
    ),
  )("rejects illegal transition %s → %s", (from, to) => {
    expect(() => assertConversationStatusTransition(from, to)).toThrow(
      ConversationStatusTransitionError,
    );
  });
});

describe("conversation lifecycle services", () => {
  let fixture: Awaited<ReturnType<typeof seedConversationFixture>>;

  beforeAll(async () => {
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
  });

  it("owner archives and reopens conversation", async () => {
    const archived = await archiveConversationService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
    });

    expect(archived.status).toBe("ARCHIVED");

    const reopened = await reopenConversationService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
    });

    expect(reopened.status).toBe("OPEN");
  });

  it("rejects messages on archived conversation", async () => {
    await archiveConversationService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
    });

    await expect(
      sendMessageService({
        userId: fixture.clientId,
        conversationId: fixture.conversationId,
        body: "Should fail",
      }),
    ).rejects.toThrow("CONVERSATION_CLOSED");

    await reopenConversationService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
    });
  });

  it("rejects CLOSED → OPEN transition", async () => {
    await closeConversationService({
      userId: fixture.ownerId,
      conversationId: fixture.conversationId,
    });

    await expect(
      reopenConversationService({
        userId: fixture.ownerId,
        conversationId: fixture.conversationId,
      }),
    ).rejects.toThrow(ConversationStatusTransitionError);
  });
});

describe("appendConversationEvent parity", () => {
  let fixture: Awaited<ReturnType<typeof seedConversationFixture>>;

  beforeAll(async () => {
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
  });

  it("system messages update unread counts like user messages", async () => {
    const ownerUnreadBefore = await db.query<{ unread_count: number }>(
      `
        SELECT unread_count
        FROM property_conversation_participant_states
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [fixture.conversationId, fixture.ownerId],
    );

    await appendConversationEvent({
      conversationId: fixture.conversationId,
      senderId: fixture.clientId,
      senderRole: "CLIENT",
      body: "System-style event",
      contentType: "SYSTEM",
      metadata: { test: true },
    });

    const ownerUnreadAfter = await db.query<{ unread_count: number }>(
      `
        SELECT unread_count
        FROM property_conversation_participant_states
        WHERE conversation_id = $1 AND user_id = $2
      `,
      [fixture.conversationId, fixture.ownerId],
    );

    expect(ownerUnreadAfter.rows[0].unread_count).toBe(
      ownerUnreadBefore.rows[0].unread_count + 1,
    );
  });
});

describe("participant reinstatement", () => {
  let fixture: Awaited<ReturnType<typeof seedStartConversationProperty>>;

  beforeAll(async () => {
    fixture = await seedStartConversationProperty();
  });

  afterAll(async () => {
    await cleanupStartConversationProperty(fixture);
  });

  it("client restart does not reinstate revoked agent", async () => {
    const conversation = await startConversationService({
      clientId: fixture.clientId,
      propertyId: fixture.propertyId,
    });

    await revokeParticipantOnAgentDeactivated({
      propertyId: fixture.propertyId,
      agentId: fixture.agentId,
    });

    await startConversationService({
      clientId: fixture.clientId,
      propertyId: fixture.propertyId,
    });

    const canSend = await canSendMessage({
      userId: fixture.agentId,
      conversationId: conversation.id,
    });

    expect(canSend).toBe(false);

    await syncParticipantsOnAgentEnabled({
      propertyId: fixture.propertyId,
      agentId: fixture.agentId,
    });

    const canSendAfterSync = await canSendMessage({
      userId: fixture.agentId,
      conversationId: conversation.id,
    });

    expect(canSendAfterSync).toBe(true);
  });
});

describe("conversation lifecycle routes", () => {
  let fixture: Awaited<ReturnType<typeof seedConversationFixture>>;
  let app: Awaited<ReturnType<typeof buildApp>>;
  let ownerToken: string;

  beforeAll(async () => {
    fixture = await seedConversationFixture();
    app = await buildApp();

    const user = await db.query<{ email: string }>(
      `SELECT email FROM users WHERE id = $1`,
      [fixture.ownerId],
    );

    ownerToken = generateAccessToken({
      userId: fixture.ownerId,
      email: user.rows[0].email,
      role: "OWNER",
    });
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
    await app.close();
  });

  it("POST /property-conversations/:id/close rejects messaging", async () => {
    const closeResponse = await app.inject({
      method: "POST",
      url: `/property-conversations/${fixture.conversationId}/close`,
      headers: { authorization: `Bearer ${ownerToken}` },
    });

    expect(closeResponse.statusCode).toBe(200);
    expect(closeResponse.json().data.status).toBe("CLOSED");

    const messageResponse = await app.inject({
      method: "POST",
      url: `/property-conversations/${fixture.conversationId}/messages`,
      headers: { authorization: `Bearer ${ownerToken}` },
      payload: { body: "Too late" },
    });

    expect(messageResponse.statusCode).toBe(403);
    expect(messageResponse.json().error.code).toBe("CONVERSATION_CLOSED");
  });
});
