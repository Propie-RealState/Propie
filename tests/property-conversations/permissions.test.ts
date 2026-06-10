import { describe, it, expect, beforeAll, afterAll } from "vitest";

import {
  canAccessConversation,
  canSendMessage,
  canReadMessageHistorically,
} from "@/modules/property-conversations/repositories/can-access-conversation.repository";
import {
  cleanupFixture,
  seedConversationFixture,
} from "../helpers/test-db";

describe("conversation permissions", () => {
  let fixture: Awaited<ReturnType<typeof seedConversationFixture>>;

  beforeAll(async () => {
    fixture = await seedConversationFixture();
  });

  afterAll(async () => {
    await cleanupFixture(fixture);
  });

  it("blocks unauthorized user", async () => {
    const allowed = await canAccessConversation({
      userId: fixture.strangerId,
      conversationId: fixture.conversationId,
    });
    expect(allowed).toBe(false);
  });

  it("allows active agent to send", async () => {
    const allowed = await canSendMessage({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
    });
    expect(allowed).toBe(true);
  });

  it("blocks removed agent from sending", async () => {
    await fixture.deactivateAgent();

    const allowed = await canSendMessage({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
    });
    expect(allowed).toBe(false);
  });

  it("allows removed agent read-only historical access", async () => {
    const allowed = await canReadMessageHistorically({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      messageCreatedAt: fixture.firstMessageAt,
    });
    expect(allowed).toBe(true);
  });

  it("blocks removed agent from messages after revocation", async () => {
    const allowed = await canReadMessageHistorically({
      userId: fixture.agentId,
      conversationId: fixture.conversationId,
      messageCreatedAt: new Date().toISOString(),
    });
    expect(allowed).toBe(false);
  });
});
