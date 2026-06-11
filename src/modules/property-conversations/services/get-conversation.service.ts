import {
  canAccessConversation,
} from "../repositories/can-access-conversation.repository";
import { getParticipantState } from "../repositories/participant-states.repository";
import { findConversationDetailByIdRepository } from "../repositories/property-conversations.repository";
import { mapConversationDetailRow } from "../utils/map-conversation";

export async function getConversationService(input: {
  userId: string;
  conversationId: string;
}) {
  const conversation = await findConversationDetailByIdRepository(
    input.conversationId,
  );

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const canAccess = await canAccessConversation({
    userId: input.userId,
    conversationId: input.conversationId,
  });

  if (canAccess) {
    return mapConversationDetailRow(conversation, input.userId, {
      readOnly: false,
    });
  }

  const state = await getParticipantState({
    userId: input.userId,
    conversationId: input.conversationId,
  });

  if (state?.revoked_at) {
    return mapConversationDetailRow(conversation, input.userId, {
      readOnly: true,
    });
  }

  throw new Error("FORBIDDEN");
}
