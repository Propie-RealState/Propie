import { z } from "zod";

import {
  MESSAGE_CONTENT_TYPES,
  PARTICIPANT_ROLES,
  PROPERTY_CONVERSATION_STATUSES,
  PROPERTY_CONVERSATION_TYPES,
} from "@/modules/property-conversations/types/property-conversation.types";

export const PropertyConversationStatusSchema = z.enum(
  PROPERTY_CONVERSATION_STATUSES,
);

export type PropertyConversationStatusRow = z.infer<
  typeof PropertyConversationStatusSchema
>;

export const MessageContentTypeSchema = z.enum(MESSAGE_CONTENT_TYPES);

export const ParticipantRoleSchema = z.enum(PARTICIPANT_ROLES);

export const PropertyConversationTypeSchema = z.enum(
  PROPERTY_CONVERSATION_TYPES,
);

export const PropertyConversationRowSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid(),
  conversation_type: PropertyConversationTypeSchema,
  client_id: z.string().uuid().nullable(),
  internal_agent_id: z.string().uuid().nullable(),
  status: PropertyConversationStatusSchema,
  assigned_agent_id: z.string().uuid().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  lead_score: z.coerce.number().nullable(),
  last_message_at: z.string().datetime().nullable(),
  last_message_preview: z.string().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type PropertyConversationRow = z.infer<
  typeof PropertyConversationRowSchema
>;

export const PropertyConversationMessageRowSchema = z.object({
  id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  sender_id: z.string().uuid(),
  sender_role: ParticipantRoleSchema,
  content_type: MessageContentTypeSchema,
  body: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  created_at: z.string().datetime(),
  edited_at: z.string().datetime().nullable(),
  deleted_at: z.string().datetime().nullable(),
});

export type PropertyConversationMessageRow = z.infer<
  typeof PropertyConversationMessageRowSchema
>;

export const PropertyConversationParticipantStateRowSchema = z.object({
  conversation_id: z.string().uuid(),
  user_id: z.string().uuid(),
  unread_count: z.number().int(),
  last_read_at: z.string().datetime().nullable(),
  last_read_message_id: z.string().uuid().nullable(),
  participant_role: ParticipantRoleSchema,
  revoked_at: z.string().datetime().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type PropertyConversationParticipantStateRow = z.infer<
  typeof PropertyConversationParticipantStateRowSchema
>;
