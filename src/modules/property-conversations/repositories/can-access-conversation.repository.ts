import {
  getConversationContext,
  isActiveAgentOnProperty,
  isActiveParticipant,
} from "./participants.repository";
import { getParticipantState } from "./participant-states.repository";

export async function canManageConversation(input: {
  userId: string;
  conversationId: string;
}): Promise<boolean> {
  const context = await getConversationContext(input.conversationId);

  if (!context) {
    return false;
  }

  if (context.ownerId === input.userId) {
    return true;
  }

  if (context.conversationType === "PROPERTY_INTERNAL") {
    return (
      context.internalAgentId === input.userId
      && await isActiveAgentOnProperty(input.userId, context.propertyId)
    );
  }

  return isActiveAgentOnProperty(input.userId, context.propertyId);
}

export async function canAccessConversation(input: {
  userId: string;
  conversationId: string;
}): Promise<boolean> {
  const context = await getConversationContext(input.conversationId);

  if (!context) {
    return false;
  }

  const state = await getParticipantState(input);

  if (state?.revoked_at) {
    return false;
  }

  return isActiveParticipant(input.userId, context);
}

export async function canSendMessage(input: {
  userId: string;
  conversationId: string;
}): Promise<boolean> {
  const context = await getConversationContext(input.conversationId);

  if (!context) {
    return false;
  }

  const state = await getParticipantState(input);

  if (!state || state.revoked_at) {
    return false;
  }

  return isActiveParticipant(input.userId, context);
}

export async function canReadMessageHistorically(input: {
  userId: string;
  conversationId: string;
  messageCreatedAt: string;
}): Promise<boolean> {
  const state = await getParticipantState(input);

  if (!state) {
    return false;
  }

  if (!state.revoked_at) {
    return canAccessConversation(input);
  }

  return (
    new Date(input.messageCreatedAt).getTime()
    <= new Date(state.revoked_at).getTime()
  );
}
