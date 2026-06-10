import type { PoolClient } from "pg";

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

type ParticipantSeed = {
  userId: string;
  role: "CLIENT" | "OWNER" | "AGENT";
};

export async function upsertParticipantStates(input: {
  conversationId: string;
  participants: ParticipantSeed[];
}) {
  for (const participant of input.participants) {
    await db.query(
      `
        INSERT INTO property_conversation_participant_states (
          conversation_id,
          user_id,
          participant_role
        )
        VALUES ($1, $2, $3)
        ON CONFLICT (conversation_id, user_id)
        DO UPDATE SET
          participant_role = EXCLUDED.participant_role,
          revoked_at = NULL,
          updated_at = now()
      `,
      [
        input.conversationId,
        participant.userId,
        participant.role,
      ],
    );
  }
}

export async function incrementUnreadCountsForRecipients(
  input: {
    conversationId: string;
    senderId: string;
  },
  client: PoolClient,
) {
  await client.query(
    `
      UPDATE property_conversation_participant_states
      SET unread_count = unread_count + 1,
          updated_at = now()
      WHERE conversation_id = $1
        AND user_id <> $2
        AND revoked_at IS NULL
    `,
    [input.conversationId, input.senderId],
  );
}

export async function listActiveNotificationRecipientIds(
  conversationId: string,
  senderId: string,
): Promise<string[]> {
  const result = await db.query<{ user_id: string }>(
    `
      SELECT user_id
      FROM property_conversation_participant_states
      WHERE conversation_id = $1
        AND user_id <> $2
        AND revoked_at IS NULL
    `,
    [conversationId, senderId],
  );

  return result.rows.map((row) => row.user_id);
}
