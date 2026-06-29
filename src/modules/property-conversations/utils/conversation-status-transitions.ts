import type { PropertyConversationStatus } from "../types/property-conversation.types";

export class ConversationStatusTransitionError extends Error {
  constructor(
    message: string,
    readonly code = "CONVERSATION_STATUS_TRANSITION_INVALID",
  ) {
    super(message);
    this.name = "ConversationStatusTransitionError";
  }
}

const ALLOWED_CONVERSATION_STATUS_TRANSITIONS: Record<
  PropertyConversationStatus,
  readonly PropertyConversationStatus[]
> = {
  OPEN: ["ARCHIVED", "CLOSED"],
  ARCHIVED: ["OPEN"],
  CLOSED: [],
};

export function getAllowedConversationStatusTransitions(
  from: PropertyConversationStatus,
): readonly PropertyConversationStatus[] {
  return ALLOWED_CONVERSATION_STATUS_TRANSITIONS[from] ?? [];
}

export function isOpenConversationStatus(
  status: PropertyConversationStatus,
): boolean {
  return status === "OPEN";
}

export function assertConversationStatusTransition(
  from: PropertyConversationStatus,
  to: PropertyConversationStatus,
): void {
  const allowed = getAllowedConversationStatusTransitions(from);

  if (!allowed.includes(to)) {
    throw new ConversationStatusTransitionError(
      `Cannot transition conversation status from ${from} to ${to}`,
    );
  }
}

export function assertOpenConversationForMessaging(
  status: PropertyConversationStatus,
): void {
  if (!isOpenConversationStatus(status)) {
    throw new Error("CONVERSATION_CLOSED");
  }
}
