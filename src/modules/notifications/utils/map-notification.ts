import type {
  CreateNotificationInput,
  NotificationRow,
} from "../types/notification.types";

export function mapNotificationRow(
  row: NotificationRow,
) {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: row.metadata ?? {},
    read: row.read_at !== null,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export function buildNotificationValues(
  input: CreateNotificationInput,
) {
  return [
    input.userId,
    input.type,
    input.title,
    input.body,
    input.entityType ?? null,
    input.entityId ?? null,
    JSON.stringify(input.metadata ?? {}),
  ];
}
