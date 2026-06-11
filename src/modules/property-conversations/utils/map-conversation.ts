import type { PropertyConversationRow } from "@/database/types/property-conversations";

import {
  resolveConversationPresentation,
  type ConversationPresentation,
} from "./resolve-conversation-presentation";

export type PropertyConversation = {
  id: string;
  propertyId: string;
  conversationType: PropertyConversationRow["conversation_type"];
  clientId: string | null;
  internalAgentId: string | null;
  status: PropertyConversationRow["status"];
  assignedAgentId: string | null;
  metadata: Record<string, unknown>;
  leadScore: number | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount?: number;
  readOnly?: boolean;
  propertyTitle?: string;
  inboxRoleLabel?: string;
  inboxSubtitle?: string;
  headerParticipantRole?: ConversationPresentation["headerParticipantRole"];
  headerParticipantName?: string;
  headerParticipantIsOnline?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ConversationListRow = PropertyConversationRow & {
  unread_count: number;
  property_title: string;
  owner_id: string;
  owner_first_name: string | null;
  owner_last_name: string | null;
  client_first_name: string | null;
  client_last_name: string | null;
  internal_agent_first_name: string | null;
  internal_agent_last_name: string | null;
};

function mapPresentationFields(
  row: ConversationListRow,
  viewerUserId: string,
) {
  const presentation = resolveConversationPresentation({
    conversationType: row.conversation_type,
    propertyTitle: row.property_title,
    viewerUserId,
    ownerId: row.owner_id,
    clientId: row.client_id,
    internalAgentId: row.internal_agent_id,
    ownerFirstName: row.owner_first_name,
    ownerLastName: row.owner_last_name,
    clientFirstName: row.client_first_name,
    clientLastName: row.client_last_name,
    internalAgentFirstName: row.internal_agent_first_name,
    internalAgentLastName: row.internal_agent_last_name,
  });

  return {
    propertyTitle: presentation.propertyTitle,
    inboxRoleLabel: presentation.inboxRoleLabel,
    inboxSubtitle: presentation.inboxSubtitle,
    headerParticipantRole: presentation.headerParticipantRole,
    headerParticipantName: presentation.headerParticipantName,
    headerParticipantIsOnline: presentation.headerParticipantIsOnline,
  };
}

export function mapConversationRow(
  row: PropertyConversationRow,
  unreadCount?: number,
): PropertyConversation {
  return {
    id: row.id,
    propertyId: row.property_id,
    conversationType: row.conversation_type,
    clientId: row.client_id,
    internalAgentId: row.internal_agent_id,
    status: row.status,
    assignedAgentId: row.assigned_agent_id,
    metadata: row.metadata,
    leadScore: row.lead_score,
    lastMessageAt: row.last_message_at,
    lastMessagePreview: row.last_message_preview,
    unreadCount,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapConversationListRow(
  row: ConversationListRow,
  viewerUserId: string,
): PropertyConversation {
  return {
    ...mapConversationRow(row, row.unread_count),
    ...mapPresentationFields(row, viewerUserId),
  };
}

export function mapConversationDetailRow(
  row: ConversationListRow,
  viewerUserId: string,
  options?: { readOnly?: boolean },
): PropertyConversation {
  return {
    ...mapConversationListRow(row, viewerUserId),
    readOnly: options?.readOnly,
  };
}
