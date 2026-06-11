import { db } from "@/database/client";

import type { PropertyConversationRow } from "@/database/types/property-conversations";

import type { ConversationListRow } from "../utils/map-conversation";

type PropertyChatGate = {
  propertyId: string;
  allowChat: boolean;
  ownerId: string;
};

const CONVERSATION_SELECT_FIELDS = `
  pc.id,
  pc.property_id,
  pc.conversation_type,
  pc.client_id,
  pc.internal_agent_id,
  pc.status,
  pc.assigned_agent_id,
  pc.metadata,
  pc.lead_score,
  pc.last_message_at,
  pc.last_message_preview,
  pc.created_at,
  pc.updated_at
`;

const CONVERSATION_PRESENTATION_JOINS = `
  INNER JOIN properties p
    ON p.id = pc.property_id
  LEFT JOIN users owner_user
    ON owner_user.id = p.owner_id
  LEFT JOIN users client_user
    ON client_user.id = pc.client_id
  LEFT JOIN users internal_agent_user
    ON internal_agent_user.id = pc.internal_agent_id
`;

const CONVERSATION_PRESENTATION_FIELDS = `
  p.title AS property_title,
  p.owner_id,
  owner_user.first_name AS owner_first_name,
  owner_user.last_name AS owner_last_name,
  client_user.first_name AS client_first_name,
  client_user.last_name AS client_last_name,
  internal_agent_user.first_name AS internal_agent_first_name,
  internal_agent_user.last_name AS internal_agent_last_name
`;

export async function getPropertyChatGate(
  propertyId: string,
): Promise<PropertyChatGate | null> {
  const result = await db.query<{
    property_id: string;
    allow_chat: boolean | null;
    owner_id: string;
  }>(
    `
      SELECT
        p.id AS property_id,
        p.owner_id,
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
    ownerId: row.owner_id,
  };
}

const CONVERSATION_RETURNING_FIELDS = `
  id,
  property_id,
  conversation_type,
  client_id,
  internal_agent_id,
  status,
  assigned_agent_id,
  metadata,
  lead_score,
  last_message_at,
  last_message_preview,
  created_at,
  updated_at
`;

export async function upsertPropertyConversation(input: {
  propertyId: string;
  clientId: string;
}): Promise<PropertyConversationRow> {
  const existing = await db.query<{ id: string }>(
    `
      SELECT id
      FROM property_conversations
      WHERE property_id = $1
        AND client_id = $2
        AND conversation_type = 'PROPERTY_CLIENT'
      LIMIT 1
    `,
    [input.propertyId, input.clientId],
  );

  if (existing.rows[0]) {
    const result = await db.query<PropertyConversationRow>(
      `
        UPDATE property_conversations
        SET updated_at = now()
        WHERE id = $1
        RETURNING ${CONVERSATION_RETURNING_FIELDS}
      `,
      [existing.rows[0].id],
    );

    return result.rows[0];
  }

  const result = await db.query<PropertyConversationRow>(
    `
      INSERT INTO property_conversations (
        property_id,
        conversation_type,
        client_id,
        status
      )
      VALUES ($1, 'PROPERTY_CLIENT', $2, 'OPEN')
      RETURNING ${CONVERSATION_RETURNING_FIELDS}
    `,
    [input.propertyId, input.clientId],
  );

  return result.rows[0];
}

export async function upsertInternalPropertyConversation(input: {
  propertyId: string;
  internalAgentId: string;
}): Promise<PropertyConversationRow> {
  const existing = await db.query<{ id: string }>(
    `
      SELECT id
      FROM property_conversations
      WHERE property_id = $1
        AND internal_agent_id = $2
        AND conversation_type = 'PROPERTY_INTERNAL'
      LIMIT 1
    `,
    [input.propertyId, input.internalAgentId],
  );

  if (existing.rows[0]) {
    const result = await db.query<PropertyConversationRow>(
      `
        UPDATE property_conversations
        SET updated_at = now()
        WHERE id = $1
        RETURNING ${CONVERSATION_RETURNING_FIELDS}
      `,
      [existing.rows[0].id],
    );

    return result.rows[0];
  }

  const result = await db.query<PropertyConversationRow>(
    `
      INSERT INTO property_conversations (
        property_id,
        conversation_type,
        internal_agent_id,
        status
      )
      VALUES ($1, 'PROPERTY_INTERNAL', $2, 'OPEN')
      RETURNING ${CONVERSATION_RETURNING_FIELDS}
    `,
    [input.propertyId, input.internalAgentId],
  );

  return result.rows[0];
}

export async function listConversationsForUserRepository(
  userId: string,
): Promise<ConversationListRow[]> {
  const result = await db.query<ConversationListRow>(
    `
      SELECT DISTINCT
        ${CONVERSATION_SELECT_FIELDS},
        ${CONVERSATION_PRESENTATION_FIELDS},
        COALESCE(ps.unread_count, 0) AS unread_count
      FROM property_conversations pc
      ${CONVERSATION_PRESENTATION_JOINS}
      LEFT JOIN property_assignments pa
        ON pa.property_id = pc.property_id
        AND pa.agent_id = $1
        AND pa.is_active = true
      LEFT JOIN property_conversation_participant_states ps
        ON ps.conversation_id = pc.id
        AND ps.user_id = $1
      WHERE (
        pc.conversation_type = 'PROPERTY_CLIENT'
        AND (
          pc.client_id = $1
          OR p.owner_id = $1
          OR (
            pa.agent_id IS NOT NULL
            AND ps.user_id IS NOT NULL
            AND ps.revoked_at IS NULL
          )
        )
      )
      OR (
        pc.conversation_type = 'PROPERTY_INTERNAL'
        AND (
          p.owner_id = $1
          OR pc.internal_agent_id = $1
        )
        AND ps.user_id IS NOT NULL
        AND ps.revoked_at IS NULL
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
        ${CONVERSATION_RETURNING_FIELDS}
      FROM property_conversations
      WHERE id = $1
      LIMIT 1
    `,
    [conversationId],
  );

  return result.rows[0] ?? null;
}

export async function findConversationDetailByIdRepository(
  conversationId: string,
): Promise<ConversationListRow | null> {
  const result = await db.query<ConversationListRow>(
    `
      SELECT
        ${CONVERSATION_SELECT_FIELDS},
        ${CONVERSATION_PRESENTATION_FIELDS},
        0 AS unread_count
      FROM property_conversations pc
      ${CONVERSATION_PRESENTATION_JOINS}
      WHERE pc.id = $1
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
        ${CONVERSATION_SELECT_FIELDS}
      FROM property_conversations pc
      INNER JOIN property_conversation_participant_states ps
        ON ps.conversation_id = pc.id
      WHERE ps.user_id = $1
        AND ps.revoked_at IS NOT NULL
        AND pc.conversation_type = 'PROPERTY_CLIENT'
      ORDER BY pc.last_message_at DESC NULLS LAST, pc.updated_at DESC
    `,
    [userId],
  );

  return result.rows;
}
