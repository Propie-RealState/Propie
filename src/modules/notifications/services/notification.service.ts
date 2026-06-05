import type { CreateNotificationInput } from "../types/notification.types";
import {
  countNotificationsRepository,
  createNotificationRepository,
  createNotificationsRepository,
  getNotificationPreferencesRepository,
  listNotificationsRepository,
  markAllNotificationsReadRepository,
  markNotificationReadRepository,
  upsertNotificationPreferencesRepository,
} from "../repositories/notifications.repository";
import type { UpdateNotificationPreferencesInput } from "../schemas/notification.schema";

export async function createNotification(
  input: CreateNotificationInput,
) {
  return createNotificationRepository(input);
}

export async function createNotifications(
  inputs: CreateNotificationInput[],
) {
  return createNotificationsRepository(inputs);
}

export async function listNotifications(input: {
  userId: string;
  limit: number;
  offset: number;
  unreadOnly?: boolean;
}) {
  const [items, total] = await Promise.all([
    listNotificationsRepository(input),
    countNotificationsRepository({
      userId: input.userId,
      unreadOnly: input.unreadOnly,
    }),
  ]);

  return {
    items,
    meta: {
      total,
      limit: input.limit,
      offset: input.offset,
      hasMore: input.offset + items.length < total,
    },
  };
}

export async function getUnreadNotificationCount(userId: string) {
  return countNotificationsRepository({
    userId,
    unreadOnly: true,
  });
}

export async function markNotificationRead(input: {
  notificationId: string;
  userId: string;
}) {
  return markNotificationReadRepository(input);
}

export async function markAllNotificationsRead(userId: string) {
  return markAllNotificationsReadRepository(userId);
}

export async function getNotificationPreferences(userId: string) {
  const row = await getNotificationPreferencesRepository(userId);

  if (!row) {
    return {
      userId,
      nearbyEnabled: true,
      favoritesEnabled: true,
      messagesEnabled: true,
      agentApplicationsEnabled: true,
      latitude: null,
      longitude: null,
      radiusMeters: 5000,
    };
  }

  return {
    userId: row.user_id,
    nearbyEnabled: row.nearby_enabled,
    favoritesEnabled: row.favorites_enabled,
    messagesEnabled: row.messages_enabled,
    agentApplicationsEnabled: row.agent_applications_enabled,
    latitude:
      row.latitude !== null ? Number(row.latitude) : null,
    longitude:
      row.longitude !== null ? Number(row.longitude) : null,
    radiusMeters: row.radius_meters,
  };
}

export async function updateNotificationPreferences(input: {
  userId: string;
  preferences: UpdateNotificationPreferencesInput;
}) {
  const row = await upsertNotificationPreferencesRepository({
    userId: input.userId,
    ...input.preferences,
  });

  return {
    userId: row.user_id,
    nearbyEnabled: row.nearby_enabled,
    favoritesEnabled: row.favorites_enabled,
    messagesEnabled: row.messages_enabled,
    agentApplicationsEnabled: row.agent_applications_enabled,
    latitude:
      row.latitude !== null ? Number(row.latitude) : null,
    longitude:
      row.longitude !== null ? Number(row.longitude) : null,
    radiusMeters: row.radius_meters,
  };
}
