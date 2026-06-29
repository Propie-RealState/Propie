import { db } from "@/database/client";

import {
  ensureParticipantStates,
  reinstateParticipantOnProperty,
} from "../repositories/participant-states.repository";

export async function syncParticipantsOnAgentEnabled(input: {
  propertyId: string;
  agentId: string;
}) {
  const conversations = await db.query<{ id: string }>(
    `
      SELECT id
      FROM property_conversations
      WHERE property_id = $1
        AND status = 'OPEN'
        AND conversation_type = 'PROPERTY_CLIENT'
    `,
    [input.propertyId],
  );

  for (const conversation of conversations.rows) {
    await ensureParticipantStates({
      conversationId: conversation.id,
      participants: [
        {
          userId: input.agentId,
          role: "AGENT",
        },
      ],
    });
  }

  await reinstateParticipantOnProperty({
    propertyId: input.propertyId,
    userId: input.agentId,
  });
}

export async function revokeParticipantOnAgentDeactivated(input: {
  propertyId: string;
  agentId: string;
}) {
  await db.query(
    `
      UPDATE property_conversation_participant_states ps
      SET revoked_at = now(),
          updated_at = now()
      FROM property_conversations pc
      WHERE pc.id = ps.conversation_id
        AND pc.property_id = $1
        AND ps.user_id = $2
        AND ps.revoked_at IS NULL
    `,
    [input.propertyId, input.agentId],
  );
}
