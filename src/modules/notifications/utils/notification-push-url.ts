import type { NotificationType } from "../types/notification.types";
import { NOTIFICATION_TYPES } from "../types/notification.types";

export function buildNotificationDeepLink(input: {
  type: NotificationType;
  entityType: string | null;
  entityId: string | null;
}) {
  if (input.type === NOTIFICATION_TYPES.MESSAGE_RECEIVED) {
    if (input.entityId) {
      return `/mensajes/${input.entityId}`;
    }

    return "/mensajes";
  }

  if (
    input.type === NOTIFICATION_TYPES.AGENT_APPLICATION_RECEIVED ||
    input.type.startsWith("AGENT_APPLICATION_")
  ) {
    return "/solicitudes-agentes";
  }

  if (
    input.type.startsWith("VISIT_") ||
    input.entityType === "property_visit"
  ) {
    if (input.entityId) {
      return `/visitas/${input.entityId}`;
    }

    return "/visitas";
  }

  if (input.entityType === "property" && input.entityId) {
    return `/propiedad/${input.entityId}`;
  }

  return "/notificaciones";
}
