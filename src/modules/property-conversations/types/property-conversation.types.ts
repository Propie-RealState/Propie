export const PROPERTY_CONVERSATION_TYPES = [
  "PROPERTY_CLIENT",
  "PROPERTY_INTERNAL",
] as const;

export type PropertyConversationType =
  (typeof PROPERTY_CONVERSATION_TYPES)[number];

export const PROPERTY_CONVERSATION_STATUSES = [
  "OPEN",
  "ARCHIVED",
  "CLOSED",
] as const;

export type PropertyConversationStatus =
  (typeof PROPERTY_CONVERSATION_STATUSES)[number];

export const MESSAGE_CONTENT_TYPES = ["TEXT", "SYSTEM"] as const;

export type MessageContentType =
  (typeof MESSAGE_CONTENT_TYPES)[number];

export const PARTICIPANT_ROLES = [
  "CLIENT",
  "OWNER",
  "AGENT",
] as const;

export type ParticipantRole =
  (typeof PARTICIPANT_ROLES)[number];
