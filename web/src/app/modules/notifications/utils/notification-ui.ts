export function getNotificationIcon(type: string) {
  switch (type) {
    case 'NEW_PROPERTY_NEARBY':
    case 'PROPERTY_PUBLISHED':
      return 'map-pin';
    case 'PROPERTY_PRICE_CHANGED':
      return 'trending-down';
    case 'PROPERTY_FAVORITE_UPDATED':
    case 'PROPERTY_UPDATED':
      return 'heart';
    case 'AGENT_APPLICATION_RECEIVED':
    case 'AGENT_APPLICATION_ACCEPTED':
    case 'AGENT_APPLICATION_REJECTED':
      return 'briefcase';
    case 'MESSAGE_RECEIVED':
      return 'message-circle';
    case 'VISIT_CREATED':
    case 'VISIT_CONFIRMED':
    case 'VISIT_CANCELLED':
    case 'VISIT_RESCHEDULED':
    case 'VISIT_REMINDER':
      return 'calendar';
    default:
      return 'bell';
  }
}

export function getNotificationRoute(notification: {
  type: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
}) {
  if (notification.type === 'MESSAGE_RECEIVED') {
    if (notification.entityId) {
      return `/mensajes/${notification.entityId}`;
    }

    return '/mensajes';
  }

  if (notification.type === 'AGENT_APPLICATION_RECEIVED') {
    return '/solicitudes-agentes';
  }

  if (notification.type.startsWith('AGENT_APPLICATION_')) {
    return '/solicitudes-agentes';
  }

  if (
    notification.type.startsWith('VISIT_') ||
    notification.entityType === 'property_visit'
  ) {
    if (notification.entityId) {
      return `/visitas/${notification.entityId}`;
    }

    return '/visitas';
  }

  if (
    notification.entityType === 'property' &&
    notification.entityId
  ) {
    return `/propiedad/${notification.entityId}`;
  }

  return '/notificaciones';
}
