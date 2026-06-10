import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { listConversationsService } from "@/modules/property-conversations/services/list-conversations.service";
import { startConversationService } from "@/modules/property-conversations/services/start-conversation.service";
import {
  cleanupStartConversationProperty,
  seedStartConversationProperty,
} from "../helpers/test-db";

describe("conversation creation", () => {
  let fixture: Awaited<ReturnType<typeof seedStartConversationProperty>>;

  beforeAll(async () => {
    fixture = await seedStartConversationProperty();
  });

  afterAll(async () => {
    await cleanupStartConversationProperty(fixture);
  });

  it("client creates conversation linked to property", async () => {
    const conversation = await startConversationService({
      clientId: fixture.clientId,
      propertyId: fixture.propertyId,
    });

    expect(conversation.propertyId).toBe(fixture.propertyId);
    expect(conversation.clientId).toBe(fixture.clientId);
    expect(conversation.status).toBe("OPEN");
  });

  it("returns existing conversation for same property+client", async () => {
    const first = await startConversationService({
      clientId: fixture.clientId,
      propertyId: fixture.propertyId,
    });

    const second = await startConversationService({
      clientId: fixture.clientId,
      propertyId: fixture.propertyId,
    });

    expect(second.id).toBe(first.id);
  });

  it("conversation visible to owner in list", async () => {
    const conversation = await startConversationService({
      clientId: fixture.clientId,
      propertyId: fixture.propertyId,
    });

    const inbox = await listConversationsService({
      userId: fixture.ownerId,
    });

    expect(inbox.map((item) => item.id)).toContain(conversation.id);
  });

  it("conversation visible to enabled agents in list", async () => {
    const conversation = await startConversationService({
      clientId: fixture.clientId,
      propertyId: fixture.propertyId,
    });

    const inbox = await listConversationsService({
      userId: fixture.agentId,
    });

    expect(inbox.map((item) => item.id)).toContain(conversation.id);
  });

  it("rejects when allow_chat is false", async () => {
    const blockedClient = fixture.clientId;
    const blockedProperty = fixture.propertyId;

    await fixture.setAllowChat(false);

    await expect(
      startConversationService({
        clientId: blockedClient,
        propertyId: blockedProperty,
      }),
    ).rejects.toThrow("CHAT_DISABLED");
  });
});
