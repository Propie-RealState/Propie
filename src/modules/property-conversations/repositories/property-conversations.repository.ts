import { db } from "@/database/client";

import type { PropertyConversationRow } from "@/database/types/property-conversations";

type PropertyChatGate = {
  propertyId: string;
  allowChat: boolean;
};

export async function getPropertyChatGate(
  propertyId: string,
): Promise<PropertyChatGate | null> {
  const result = await db.query<{
    property_id: string;
    allow_chat: boolean | null;
  }>(
    `
      SELECT
        p.id AS property_id,
        COALESCE(pc.allow_chat, true) AS allow_chat
      FROM properties p
      LEFT JOIN property_commercialization pc
        ON pc.property_id = p.id
      WHERE p.id = $1
        AND p.status = 'PUBLISHED'
      LIMIT 1
    `,
    [propertyId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    propertyId: row.property_id,
    allowChat: row.allow_chat ?? true,
  };
}

export async function upsertPropertyConversation(input: {
  propertyId: string;
  clientId: string;
}): Promise<PropertyConversationRow> {
  const result = await db.query<PropertyConversationRow>(
    `
      INSERT INTO property_conversations (
        property_id,
        client_id,
        status
      )
      VALUES ($1, $2, 'OPEN')
      ON CONFLICT (property_id, client_id)
      DO UPDATE SET
        updated_at = now()
      RETURNING
        id,
        property_id,
        client_id,
        status,
        assigned_agent_id,
        metadata,
        lead_score,
        last_message_at,
        last_message_preview,
        created_at,
        updated_at
    `,
    [input.propertyId, input.clientId],
  );

  return result.rows[0];
}

export async function listConversationsForUserRepository(
  userId: string,
): Promise<PropertyConversationRow[]> {
  const result = await db.query<PropertyConversationRow>(
    `
      SELECT DISTINCT
        pc.id,
        pc.property_id,
        pc.client_id,
        pc.status,
        pc.assigned_agent_id,
        pc.metadata,
        pc.lead_score,
        pc.last_message_at,
        pc.last_message_preview,
        pc.created_at,
        pc.updated_at
      FROM property_conversations pc
      INNER JOIN properties p
        ON p.id = pc.property_id
      LEFT JOIN property_assignments pa
        ON pa.property_id = pc.property_id
        AND pa.agent_id = $1
        AND pa.is_active = true
      LEFT JOIN property_conversation_participant_states ps
        ON ps.conversation_id = pc.id
        AND ps.user_id = $1
      WHERE pc.client_id = $1
        OR p.owner_id = $1
        OR (
          pa.agent_id IS NOT NULL
          AND (ps.user_id IS NULL OR ps.revoked_at IS NULL)
        )
      ORDER BY pc.last_message_at DESC NULLS LAST, pc.updated_at DESC
    `,
    [userId],
  );

  return result.rows;
}

export async function findConversationByIdRepository(
  conversationId: string,
): Promise<PropertyConversationRow | null> {
  const result = await db.query<PropertyConversationRow>(
    `
      SELECT
        id,
        property_id,
        client_id,
        status,
        assigned_agent_id,
        metadata,
        lead_score,
        last_message_at,
        last_message_preview,
        created_at,
        updated_at
      FROM property_conversations
      WHERE id = $1
      LIMIT 1
    `,
    [conversationId],
  );

  return result.rows[0] ?? null;
}

export async function listHistoricalConversationsRepository(
  userId: string,
): Promise<PropertyConversationRow[]> {
  const result = await db.query<PropertyConversationRow>(
    `
      SELECT DISTINCT
        pc.id,
        pc.property_id,
        pc.client_id,
        pc.status,
        pc.assigned_agent_id,
        pc.metadata,
        pc.lead_score,
        pc.last_message_at,
        pc.last_message_preview,
        pc.created_at,
        pc.updated_at
      FROM property_conversations pc
      INNER JOIN property_conversation_participant_states ps
        ON ps.conversation_id = pc.id
      WHERE ps.user_id = $1
        AND ps.revoked_at IS NOT NULL
      ORDER BY pc.last_message_at DESC NULLS LAST, pc.updated_at DESC
    `,
    [userId],
  );

  return result.rows;
}
