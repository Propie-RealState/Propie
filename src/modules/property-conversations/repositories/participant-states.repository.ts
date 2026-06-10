import { db } from "@/database/client";

import type { PropertyConversationParticipantStateRow } from "@/database/types/property-conversations";

export async function getParticipantState(input: {
  userId: string;
  conversationId: string;
}): Promise<PropertyConversationParticipantStateRow | null> {
  const result = await db.query<PropertyConversationParticipantStateRow>(
    `
      SELECT
        conversation_id,
        user_id,
        unread_count,
        last_read_at,
        last_read_message_id,
        participant_role,
        revoked_at,
        created_at,
        updated_at
      FROM property_conversation_participant_states
      WHERE conversation_id = $1
        AND user_id = $2
      LIMIT 1
    `,
    [input.conversationId, input.userId],
  );

  return result.rows[0] ?? null;
}
