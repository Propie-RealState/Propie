import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { db } from "@/database/client";
import { updateOwnerAgentApplicationStatusRepository } from "@/modules/agent-applications/repositories/agent-applications.repository";
import { listConversationsService } from "@/modules/property-conversations/services/list-conversations.service";
import {
  revokeParticipantOnAgentDeactivated,
  syncParticipantsOnAgentEnabled,
} from "@/modules/property-conversations/services/sync-participants.service";
import { createTestUser } from "../helpers/test-users";
import {
  cleanupStartConversationProperty,
  seedStartConversationProperty,
} from "../helpers/test-db";
import { startConversationService } from "@/modules/property-conversations/services/start-conversation.service";

describe("agent lifecycle", () => {
  let fixture: Awaited<ReturnType<typeof seedStartConversationProperty>>;
  let conversationId: string;

  beforeAll(async () => {
    fixture = await seedStartConversationProperty();

    const conversation = await startConversationService({
      clientId: fixture.clientId,
      propertyId: fixture.propertyId,
    });

    conversationId = conversation.id;
  });

  afterAll(async () => {
    await cleanupStartConversationProperty(fixture);
  });

  it("newly enabled agent gains access to active conversations", async () => {
    const newAgentId = await createTestUser("AGENT");

    const application = await db.query<{ id: string }>(
      `
        INSERT INTO agent_applications (
          property_id,
          agent_id,
          status
        )
        VALUES ($1, $2, 'PENDING')
        RETURNING id
      `,
      [fixture.propertyId, newAgentId],
    );

    await updateOwnerAgentApplicationStatusRepository({
      applicationId: application.rows[0].id,
      ownerId: fixture.ownerId,
      status: "ACCEPTED",
    });

    const inbox = await listConversationsService({
      userId: newAgentId,
    });

    expect(inbox.map((item) => item.id)).toContain(conversationId);

    await db.query(`DELETE FROM users WHERE id = $1`, [newAgentId]);
  });

  it("syncParticipantsOnAgentEnabled upserts participant state", async () => {
    const extraAgentId = await createTestUser("AGENT");

    await db.query(
      `
        INSERT INTO property_assignments (
          property_id,
          agent_id,
          assigned_by,
          is_active
        )
        VALUES ($1, $2, $3, true)
      `,
      [fixture.propertyId, extraAgentId, fixture.ownerId],
    );

    await syncParticipantsOnAgentEnabled({
      propertyId: fixture.propertyId,
      agentId: extraAgentId,
    });

    const state = await db.query<{ user_id: string }>(
      `
        SELECT user_id
        FROM property_conversation_participant_states
        WHERE conversation_id = $1
          AND user_id = $2
          AND revoked_at IS NULL
      `,
      [conversationId, extraAgentId],
    );

    expect(state.rows).toHaveLength(1);

    await db.query(
      `DELETE FROM property_assignments WHERE property_id = $1 AND agent_id = $2`,
      [fixture.propertyId, extraAgentId],
    );
    await db.query(`DELETE FROM users WHERE id = $1`, [extraAgentId]);
  });

  it("revokeParticipantOnAgentDeactivated blocks active inbox access", async () => {
    await revokeParticipantOnAgentDeactivated({
      propertyId: fixture.propertyId,
      agentId: fixture.agentId,
    });

    const inbox = await listConversationsService({
      userId: fixture.agentId,
    });

    expect(inbox.map((item) => item.id)).not.toContain(conversationId);
  });
});
