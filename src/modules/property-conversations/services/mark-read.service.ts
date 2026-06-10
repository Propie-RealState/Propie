import { canAccessConversation } from "../repositories/can-access-conversation.repository";
import { markConversationReadRepository } from "../repositories/participant-states.repository";

export async function markReadService(input: {
  userId: string;
  conversationId: string;
}) {
  const allowed = await canAccessConversation({
    userId: input.userId,
    conversationId: input.conversationId,
  });

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }

  await markConversationReadRepository({
    userId: input.userId,
    conversationId: input.conversationId,
  });
}
