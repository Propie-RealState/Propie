export const NOTIFICATION_TYPES = {
  PROPERTY_PUBLISHED: "PROPERTY_PUBLISHED",
  PROPERTY_UPDATED: "PROPERTY_UPDATED",
  PROPERTY_PRICE_CHANGED: "PROPERTY_PRICE_CHANGED",
  PROPERTY_FAVORITE_UPDATED: "PROPERTY_FAVORITE_UPDATED",
  NEW_PROPERTY_NEARBY: "NEW_PROPERTY_NEARBY",
  AGENT_APPLICATION_RECEIVED: "AGENT_APPLICATION_RECEIVED",
  AGENT_APPLICATION_ACCEPTED: "AGENT_APPLICATION_ACCEPTED",
  AGENT_APPLICATION_REJECTED: "AGENT_APPLICATION_REJECTED",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
} as const;

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export type NotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  read: boolean;
  readAt: string | null;
  createdAt: string;
};

export type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
};

export type NotificationPreferences = {
  userId: string;
  nearbyEnabled: boolean;
  favoritesEnabled: boolean;
  messagesEnabled: boolean;
  agentApplicationsEnabled: boolean;
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
};
