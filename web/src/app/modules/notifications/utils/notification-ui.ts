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
    return '/mensajes';
  }

  if (
    notification.type === 'AGENT_APPLICATION_RECEIVED' ||
    notification.type.startsWith('AGENT_APPLICATION_')
  ) {
    return '/notificaciones';
  }

  if (
    notification.entityType === 'property' &&
    notification.entityId
  ) {
    return `/propiedad/${notification.entityId}`;
  }

  return '/notificaciones';
}
