import type { PoolClient } from "pg";

import { db } from "@/database/client";

import type { PropertyConversationMessageRow } from "@/database/types/property-conversations";

export async function insertConversationMessage(
  input: {
    conversationId: string;
    senderId: string;
    senderRole: "CLIENT" | "OWNER" | "AGENT";
    body: string;
  },
  client?: PoolClient,
) {
  const executor = client ?? db;

  const result = await executor.query<PropertyConversationMessageRow>(
    `
      INSERT INTO property_conversation_messages (
        conversation_id,
        sender_id,
        sender_role,
        body
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        conversation_id,
        sender_id,
        sender_role,
        content_type,
        body,
        metadata,
        created_at,
        edited_at,
        deleted_at
    `,
    [
      input.conversationId,
      input.senderId,
      input.senderRole,
      input.body,
    ],
  );

  return result.rows[0];
}

export async function updateConversationLastMessage(
  input: {
    conversationId: string;
    preview: string;
  },
  client: PoolClient,
) {
  await client.query(
    `
      UPDATE property_conversations
      SET last_message_at = now(),
          last_message_preview = LEFT($2, 200),
          updated_at = now()
      WHERE id = $1
    `,
    [input.conversationId, input.preview],
  );
}
