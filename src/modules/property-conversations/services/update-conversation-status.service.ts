import {
  canManageConversation,
} from "../repositories/can-access-conversation.repository";
import {
  findConversationByIdRepository,
  updateConversationStatusRepository,
} from "../repositories/property-conversations.repository";
import type { PropertyConversationStatus } from "../types/property-conversation.types";
import { mapConversationRow } from "../utils/map-conversation";
import {
  assertConversationStatusTransition,
  ConversationStatusTransitionError,
} from "../utils/conversation-status-transitions";

export { ConversationStatusTransitionError };

async function transitionConversationStatus(input: {
  userId: string;
  conversationId: string;
  toStatus: PropertyConversationStatus;
}) {
  const canManage = await canManageConversation({
    userId: input.userId,
    conversationId: input.conversationId,
  });

  if (!canManage) {
    throw new Error("FORBIDDEN");
  }

  const conversation = await findConversationByIdRepository(input.conversationId);

  if (!conversation) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const fromStatus = conversation.status as PropertyConversationStatus;

  if (fromStatus === input.toStatus) {
    return mapConversationRow(conversation);
  }

  assertConversationStatusTransition(fromStatus, input.toStatus);

  const updated = await updateConversationStatusRepository({
    conversationId: input.conversationId,
    status: input.toStatus,
  });

  if (!updated) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  return mapConversationRow(updated);
}

export async function archiveConversationService(input: {
  userId: string;
  conversationId: string;
}) {
  return transitionConversationStatus({
    ...input,
    toStatus: "ARCHIVED",
  });
}

export async function closeConversationService(input: {
  userId: string;
  conversationId: string;
}) {
  return transitionConversationStatus({
    ...input,
    toStatus: "CLOSED",
  });
}

export async function reopenConversationService(input: {
  userId: string;
  conversationId: string;
}) {
  return transitionConversationStatus({
    ...input,
    toStatus: "OPEN",
  });
}
