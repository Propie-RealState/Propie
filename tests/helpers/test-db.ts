import { db } from "@/database/client";

import { createTestUser } from "./test-users";

export type ConversationFixture = {
  ownerId: string;
  agentId: string;
  clientId: string;
  strangerId: string;
  propertyId: string;
  conversationId: string;
  firstMessageAt: string;
  deactivateAgent: () => Promise<void>;
};

export async function seedConversationFixture(): Promise<ConversationFixture> {
  const ownerId = await createTestUser("OWNER");
  const agentId = await createTestUser("AGENT");
  const clientId = await createTestUser("CLIENT");
  const strangerId = await createTestUser("CLIENT");

  const property = await db.query<{ id: string }>(
    `
      INSERT INTO properties (
        owner_id,
        title,
        property_type,
        operation_type,
        status
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [ownerId, "Test Property", "HOUSE", "SALE", "PUBLISHED"],
  );

  const propertyId = property.rows[0].id;

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
    [propertyId, agentId, ownerId],
  );

  const conversation = await db.query<{ id: string }>(
    `
      INSERT INTO property_conversations (
        property_id,
        client_id,
        status
      )
      VALUES ($1, $2, 'OPEN')
      RETURNING id
    `,
    [propertyId, clientId],
  );

  const conversationId = conversation.rows[0].id;

  const message = await db.query<{ created_at: string }>(
    `
      INSERT INTO property_conversation_messages (
        conversation_id,
        sender_id,
        sender_role,
        body
      )
      VALUES ($1, $2, 'CLIENT', $3)
      RETURNING created_at
    `,
    [conversationId, clientId, "Hello from client"],
  );

  const firstMessageAt = message.rows[0].created_at;

  const participants = [
    { userId: clientId, role: "CLIENT" },
    { userId: ownerId, role: "OWNER" },
    { userId: agentId, role: "AGENT" },
  ] as const;

  for (const participant of participants) {
    await db.query(
      `
        INSERT INTO property_conversation_participant_states (
          conversation_id,
          user_id,
          participant_role
        )
        VALUES ($1, $2, $3)
      `,
      [conversationId, participant.userId, participant.role],
    );
  }

  async function deactivateAgent() {
    await db.query(
      `
        UPDATE property_assignments
        SET is_active = false,
            ended_at = now()
        WHERE property_id = $1
          AND agent_id = $2
      `,
      [propertyId, agentId],
    );

    await db.query(
      `
        UPDATE property_conversation_participant_states
        SET revoked_at = now(),
            updated_at = now()
        WHERE conversation_id = $1
          AND user_id = $2
      `,
      [conversationId, agentId],
    );
  }

  return {
    ownerId,
    agentId,
    clientId,
    strangerId,
    propertyId,
    conversationId,
    firstMessageAt,
    deactivateAgent,
  };
}

export async function cleanupFixture(fixture: ConversationFixture) {
  await db.query(
    `DELETE FROM property_conversations WHERE id = $1`,
    [fixture.conversationId],
  );

  await db.query(
    `DELETE FROM property_assignments WHERE property_id = $1`,
    [fixture.propertyId],
  );

  await db.query(
    `DELETE FROM properties WHERE id = $1`,
    [fixture.propertyId],
  );

  const userIds = [
    fixture.ownerId,
    fixture.agentId,
    fixture.clientId,
    fixture.strangerId,
  ];

  await db.query(
    `DELETE FROM users WHERE id = ANY($1::uuid[])`,
    [userIds],
  );
}
