import { db } from "@/database/client";

import type { PropertyConversationRow } from "@/database/types/property-conversations";

type ConversationContext = {
  conversationId: string;
  conversationType: PropertyConversationRow["conversation_type"];
  propertyId: string;
  clientId: string | null;
  internalAgentId: string | null;
  ownerId: string;
};

export async function getConversationContext(
  conversationId: string,
): Promise<ConversationContext | null> {
  const result = await db.query<{
    conversation_id: string;
    conversation_type: PropertyConversationRow["conversation_type"];
    property_id: string;
    client_id: string | null;
    internal_agent_id: string | null;
    owner_id: string;
  }>(
    `
      SELECT
        pc.id AS conversation_id,
        pc.conversation_type,
        pc.property_id,
        pc.client_id,
        pc.internal_agent_id,
        p.owner_id
      FROM property_conversations pc
      INNER JOIN properties p
        ON p.id = pc.property_id
      WHERE pc.id = $1
      LIMIT 1
    `,
    [conversationId],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  return {
    conversationId: row.conversation_id,
    conversationType: row.conversation_type,
    propertyId: row.property_id,
    clientId: row.client_id,
    internalAgentId: row.internal_agent_id,
    ownerId: row.owner_id,
  };
}

export async function isActiveAgentOnProperty(
  userId: string,
  propertyId: string,
): Promise<boolean> {
  const result = await db.query<{ is_active: boolean }>(
    `
      SELECT EXISTS (
        SELECT 1
        FROM property_assignments pa
        WHERE pa.property_id = $1
          AND pa.agent_id = $2
          AND pa.is_active = true
      ) AS is_active
    `,
    [propertyId, userId],
  );

  return result.rows[0]?.is_active === true;
}

export async function isActiveParticipant(
  userId: string,
  context: ConversationContext,
): Promise<boolean> {
  if (context.conversationType === "PROPERTY_INTERNAL") {
    if (userId === context.ownerId) {
      return true;
    }

    if (
      userId === context.internalAgentId
      && await isActiveAgentOnProperty(userId, context.propertyId)
    ) {
      return true;
    }

    return false;
  }

  if (context.clientId && userId === context.clientId) {
    return true;
  }

  if (userId === context.ownerId) {
    return true;
  }

  return isActiveAgentOnProperty(userId, context.propertyId);
}

export async function getActiveAgentIdsForProperty(
  propertyId: string,
): Promise<string[]> {
  const result = await db.query<{ agent_id: string }>(
    `
      SELECT agent_id
      FROM property_assignments
      WHERE property_id = $1
        AND is_active = true
    `,
    [propertyId],
  );

  return result.rows.map((row) => row.agent_id);
}
