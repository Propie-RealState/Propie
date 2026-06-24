import { canAccessConversation } from "../repositories/can-access-conversation.repository";
import { listConversationMessagesRepository } from "../repositories/messages.repository";
import { getParticipantState } from "../repositories/participant-states.repository";
import { findConversationByIdRepository } from "../repositories/property-conversations.repository";
import { mapMessageRow } from "../utils/map-message";
import { canAdminRead } from "@/utils/authorization";

export async function listMessagesService(input: {
  userId: string;
  userRole: string;
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

  if (canAdminRead(input.userRole)) {
    const rows = await listConversationMessagesRepository({
      conversationId: input.conversationId,
      limit: input.limit,
      offset: input.offset,
      createdBefore: null,
    });

    return rows.map(mapMessageRow);
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
    createdBefore: canAccess ? null : state?.revoked_at ?? null,
  });

  return rows.map(mapMessageRow);
}
