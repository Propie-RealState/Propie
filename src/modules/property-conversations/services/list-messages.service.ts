import {
  canAccessConversation,
  canReadMessageHistorically,
} from "../repositories/can-access-conversation.repository";
import { listConversationMessagesRepository } from "../repositories/messages.repository";
import { getParticipantState } from "../repositories/participant-states.repository";
import { findConversationByIdRepository } from "../repositories/property-conversations.repository";
import { mapMessageRow } from "../utils/map-message";

export async function listMessagesService(input: {
  userId: string;
  conversationId: string;
  limit: number;
  offset: number;
}) {
  const conversation = await findConversationByIdRepository(
    input.conversationId,
  );

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const canAccess = await canAccessConversation({
    userId: input.userId,
    conversationId: input.conversationId,
  });

  const state = await getParticipantState({
    userId: input.userId,
    conversationId: input.conversationId,
  });

  if (!canAccess && !state?.revoked_at) {
    throw new Error("FORBIDDEN");
  }

  const rows = await listConversationMessagesRepository({
    conversationId: input.conversationId,
    limit: input.limit,
    offset: input.offset,
  });

  if (canAccess) {
    return rows.map(mapMessageRow);
  }

  const historicalMessages = [];

  for (const row of rows) {
    const allowed = await canReadMessageHistorically({
      userId: input.userId,
      conversationId: input.conversationId,
      messageCreatedAt: row.created_at,
    });

    if (allowed) {
      historicalMessages.push(mapMessageRow(row));
    }
  }

  return historicalMessages;
}
