import type { PropertyConversationRow } from "@/database/types/property-conversations";

export type PropertyConversation = {
  id: string;
  propertyId: string;
  clientId: string;
  status: PropertyConversationRow["status"];
  assignedAgentId: string | null;
  metadata: Record<string, unknown>;
  leadScore: number | null;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount?: number;
  readOnly?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ConversationListRow = PropertyConversationRow & {
  unread_count: number;
};

export function mapConversationRow(
  row: PropertyConversationRow,
  unreadCount?: number,
): PropertyConversation {
  return {
    id: row.id,
    propertyId: row.property_id,
    clientId: row.client_id,
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
): PropertyConversation {
  return mapConversationRow(row, row.unread_count);
}
