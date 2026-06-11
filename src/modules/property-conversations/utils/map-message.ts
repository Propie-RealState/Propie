import type { PropertyConversationMessageRow } from "@/database/types/property-conversations";

export type PropertyConversationMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: PropertyConversationMessageRow["sender_role"];
  contentType: PropertyConversationMessageRow["content_type"];
  body: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

export function mapMessageRow(
  row: PropertyConversationMessageRow,
): PropertyConversationMessage {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    contentType: row.content_type,
    body: row.body,
    metadata: row.metadata,
    createdAt: row.created_at,
    editedAt: row.edited_at,
    deletedAt: row.deleted_at,
  };
}
