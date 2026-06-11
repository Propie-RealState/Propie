import type { PropertyConversationMessage } from "../types/property-conversation.types";

export const CONVERSATION_ROLE_COLORS = {
  OWNER: "#4417E6",
  AGENT: "#C52E3E",
  CLIENT: "#10B981",
  SYSTEM: "#6B7280",
} as const;

export type ConversationSenderRole =
  keyof typeof CONVERSATION_ROLE_COLORS;

export function getConversationRoleColor(
  role: PropertyConversationMessage["senderRole"] | "SYSTEM",
) {
  if (role === "SYSTEM") {
    return CONVERSATION_ROLE_COLORS.SYSTEM;
  }

  return CONVERSATION_ROLE_COLORS[role];
}

export function getConversationRoleLabel(
  role: PropertyConversationMessage["senderRole"] | "SYSTEM",
) {
  switch (role) {
    case "OWNER":
      return "Propietario";
    case "AGENT":
      return "Agente";
    case "CLIENT":
      return "Cliente";
    case "SYSTEM":
      return "Sistema";
    default:
      return "Usuario";
  }
}

export function formatMessageAuthorLabel(input: {
  role: PropertyConversationMessage["senderRole"] | "SYSTEM";
  displayName?: string | null;
}) {
  const roleLabel = getConversationRoleLabel(input.role);

  if (input.role === "SYSTEM") {
    return roleLabel;
  }

  const name = input.displayName?.trim() || "Usuario";
  return `${roleLabel} · ${name}`;
}

export function emitPropertyConversationsChanged() {
  window.dispatchEvent(new Event("property-conversations:changed"));
}
