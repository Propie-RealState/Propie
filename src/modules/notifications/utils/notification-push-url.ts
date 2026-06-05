import type { NotificationType } from "../types/notification.types";
import { NOTIFICATION_TYPES } from "../types/notification.types";

export function buildNotificationDeepLink(input: {
  type: NotificationType;
  entityType: string | null;
  entityId: string | null;
}) {
  if (input.type === NOTIFICATION_TYPES.MESSAGE_RECEIVED) {
    return "/mensajes";
  }

  if (
    input.type === NOTIFICATION_TYPES.AGENT_APPLICATION_RECEIVED ||
    input.type.startsWith("AGENT_APPLICATION_")
  ) {
    return "/notificaciones";
  }

  if (input.entityType === "property" && input.entityId) {
    return `/propiedad/${input.entityId}`;
  }

  return "/notificaciones";
}
