import { db } from "@/database/client";

import { USER_ROLES } from "@/constants/roles";
import { hasAnyRole, isAdmin } from "@/utils/authorization";

import { ensureParticipantStates } from "../repositories/participant-states.repository";
import {
  getConversationContext,
  isActiveAgentOnProperty,
} from "../repositories/participants.repository";
import {
  getPropertyChatGate,
  upsertInternalPropertyConversation,
} from "../repositories/property-conversations.repository";
import { mapConversationRow } from "../utils/map-conversation";

async function getUserRole(userId: string) {
  const result = await db.query<{ role: string }>(
    `
      SELECT role
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0]?.role ?? null;
}

export async function startInternalConversationService(input: {
  userId: string;
  propertyId: string;
  agentId?: string;
}) {
  const role = await getUserRole(input.userId);

  if (
    !role
    || !hasAnyRole(role, [
      USER_ROLES.OWNER,
      USER_ROLES.AGENT,
    ])
  ) {
    throw new Error("FORBIDDEN");
  }

  const gate = await getPropertyChatGate(input.propertyId);

  if (!gate) {
    throw new Error("PROPERTY_NOT_AVAILABLE");
  }

  if (!gate.allowChat) {
    throw new Error("CHAT_DISABLED");
  }

  let internalAgentId = input.agentId ?? null;

  if (role === USER_ROLES.AGENT) {
    internalAgentId = input.userId;
  }

  if (!internalAgentId) {
    throw new Error("AGENT_REQUIRED");
  }

  if (
    !isAdmin(role)
    && role === USER_ROLES.OWNER
    && gate.ownerId !== input.userId
  ) {
    throw new Error("FORBIDDEN");
  }

  const agentIsActive = await isActiveAgentOnProperty(
    internalAgentId,
    input.propertyId,
  );

  if (!agentIsActive) {
    throw new Error("AGENT_NOT_ACTIVE");
  }

  const conversation = await upsertInternalPropertyConversation({
    propertyId: input.propertyId,
    internalAgentId,
  });

  const context = await getConversationContext(conversation.id);

  if (!context) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  await ensureParticipantStates({
    conversationId: conversation.id,
    participants: [
      { userId: context.ownerId, role: "OWNER" },
      { userId: internalAgentId, role: "AGENT" },
    ],
  });

  return mapConversationRow(conversation);
}
