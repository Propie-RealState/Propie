export type PropertyConversationStatus = "OPEN" | "ARCHIVED" | "CLOSED";

export type PropertyConversation = {
  id: string;
  propertyId: string;
  clientId: string;
  status: PropertyConversationStatus;
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

export type PropertyConversationMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "CLIENT" | "OWNER" | "AGENT";
  contentType: "TEXT" | "SYSTEM";
  body: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};
