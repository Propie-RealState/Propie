import type { NotificationItem } from "../services/notifications.service";

export function isPropertyConversationNotification(
  notification: Pick<NotificationItem, "type" | "entityType">,
) {
  return (
    notification.type === "MESSAGE_RECEIVED" &&
    notification.entityType === "property_conversation"
  );
}

export function excludePropertyConversationNotifications<
  T extends Pick<NotificationItem, "type" | "entityType">,
>(items: T[]) {
  return items.filter((item) => !isPropertyConversationNotification(item));
}
