import type {
  MessageContentType,
  ParticipantRole,
  PropertyConversationStatus,
  PropertyConversationType,
} from "@/modules/property-conversations/types/property-conversation.types";

export type PropertyConversationStatusRow = PropertyConversationStatus;

export type PropertyConversationRow = {
  id: string;
  property_id: string;
  conversation_type: PropertyConversationType;
  client_id: string | null;
  internal_agent_id: string | null;
  status: PropertyConversationStatus;
  assigned_agent_id: string | null;
  metadata: Record<string, unknown>;
  lead_score: number | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyConversationMessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_role: ParticipantRole;
  content_type: MessageContentType;
  body: string;
  metadata: Record<string, unknown>;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
};

export type PropertyConversationParticipantStateRow = {
  conversation_id: string;
  user_id: string;
  unread_count: number;
  last_read_at: string | null;
  last_read_message_id: string | null;
  participant_role: ParticipantRole;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
};
