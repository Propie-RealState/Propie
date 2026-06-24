import { db } from "@/database/client";

import { USER_ROLES } from "@/constants/roles";
import { hasRole } from "@/utils/authorization";

import { upsertParticipantStates } from "../repositories/participant-states.repository";
import {
  getActiveAgentIdsForProperty,
  getConversationContext,
} from "../repositories/participants.repository";
import {
  getPropertyChatGate,
  upsertPropertyConversation,
} from "../repositories/property-conversations.repository";
import { mapConversationRow } from "../utils/map-conversation";

async function assertClientUser(userId: string) {
  const result = await db.query<{ role: string }>(
    `
      SELECT role
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [userId],
  );

  if (!hasRole(result.rows[0]?.role ?? "", USER_ROLES.CLIENT)) {
    throw new Error("FORBIDDEN");
  }
}

export async function startConversationService(input: {
  clientId: string;
  propertyId: string;
}) {
  await assertClientUser(input.clientId);

  const gate = await getPropertyChatGate(input.propertyId);

  if (!gate) {
    throw new Error("PROPERTY_NOT_AVAILABLE");
  }

  if (!gate.allowChat) {
    throw new Error("CHAT_DISABLED");
  }

  const conversation = await upsertPropertyConversation({
    propertyId: input.propertyId,
    clientId: input.clientId,
  });

  const context = await getConversationContext(conversation.id);

  if (!context) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  const agentIds = await getActiveAgentIdsForProperty(context.propertyId);

  if (!context.clientId) {
    throw new Error("CONVERSATION_NOT_FOUND");
  }

  await upsertParticipantStates({
    conversationId: conversation.id,
    participants: [
      { userId: context.clientId, role: "CLIENT" },
      { userId: context.ownerId, role: "OWNER" },
      ...agentIds.map((agentId) => ({
        userId: agentId,
        role: "AGENT" as const,
      })),
    ],
  });

  return mapConversationRow(conversation);
}
