import { db } from "@/database/client";

type ConversationContext = {
  conversationId: string;
  propertyId: string;
  clientId: string;
  ownerId: string;
};

export async function getConversationContext(
  conversationId: string,
): Promise<ConversationContext | null> {
  const result = await db.query<{
    conversation_id: string;
    property_id: string;
    client_id: string;
    owner_id: string;
  }>(
    `
      SELECT
        pc.id AS conversation_id,
        pc.property_id,
        pc.client_id,
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
    propertyId: row.property_id,
    clientId: row.client_id,
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
  if (userId === context.clientId) {
    return true;
  }

  if (userId === context.ownerId) {
    return true;
  }

  return isActiveAgentOnProperty(userId, context.propertyId);
}
