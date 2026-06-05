import webpush from "web-push";

import { getVapidConfig, isPushConfigured } from "@/config/vapid";

import { getNotificationPreferencesRepository } from "../repositories/notifications.repository";
import {
  deletePushSubscriptionByIdRepository,
  deletePushSubscriptionRepository,
  findPushSubscriptionsByUserIdsRepository,
  upsertPushSubscriptionRepository,
  type PushSubscriptionRow,
} from "../repositories/push-subscriptions.repository";
import type {
  Notification,
  NotificationType,
} from "../types/notification.types";
import { NOTIFICATION_TYPES } from "../types/notification.types";
import { buildNotificationDeepLink } from "../utils/notification-push-url";

let vapidConfigured = false;

function ensureVapidConfigured() {
  if (vapidConfigured || !isPushConfigured()) {
    return isPushConfigured();
  }

  const { publicKey, privateKey, subject } = getVapidConfig();
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

type PreferenceRow = {
  nearby_enabled: boolean;
  favorites_enabled: boolean;
  messages_enabled: boolean;
  agent_applications_enabled: boolean;
} | null;

function isPushAllowedForType(
  preferences: PreferenceRow,
  type: NotificationType,
) {
  switch (type) {
    case NOTIFICATION_TYPES.NEW_PROPERTY_NEARBY:
    case NOTIFICATION_TYPES.PROPERTY_PUBLISHED:
      return preferences?.nearby_enabled ?? true;
    case NOTIFICATION_TYPES.PROPERTY_PRICE_CHANGED:
    case NOTIFICATION_TYPES.PROPERTY_UPDATED:
    case NOTIFICATION_TYPES.PROPERTY_FAVORITE_UPDATED:
      return preferences?.favorites_enabled ?? true;
    case NOTIFICATION_TYPES.MESSAGE_RECEIVED:
      return preferences?.messages_enabled ?? true;
    case NOTIFICATION_TYPES.AGENT_APPLICATION_RECEIVED:
    case NOTIFICATION_TYPES.AGENT_APPLICATION_ACCEPTED:
    case NOTIFICATION_TYPES.AGENT_APPLICATION_REJECTED:
      return preferences?.agent_applications_enabled ?? true;
    default:
      return true;
  }
}

function buildPushPayload(notification: Notification) {
  const url = buildNotificationDeepLink({
    type: notification.type,
    entityType: notification.entityType,
    entityId: notification.entityId,
  });

  return JSON.stringify({
    title: notification.title,
    body: notification.body,
    url,
    notificationId: notification.id,
    type: notification.type,
    entityType: notification.entityType,
    entityId: notification.entityId,
  });
}

async function sendPushToSubscription(
  subscription: PushSubscriptionRow,
  payload: string,
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      payload,
    );
    return { ok: true as const };
  } catch (error) {
    const statusCode =
      typeof error === "object" &&
      error !== null &&
      "statusCode" in error
        ? Number((error as { statusCode?: number }).statusCode)
        : undefined;

    if (statusCode === 404 || statusCode === 410) {
      await deletePushSubscriptionByIdRepository(subscription.id);
    }

    return { ok: false as const, statusCode };
  }
}

export async function sendPushForNotifications(
  notifications: Notification[],
) {
  if (notifications.length === 0 || !ensureVapidConfigured()) {
    return { sent: 0, failed: 0, skipped: notifications.length };
  }

  const userIds = [...new Set(notifications.map((item) => item.userId))];
  const [subscriptions, preferencesRows] = await Promise.all([
    findPushSubscriptionsByUserIdsRepository(userIds),
    Promise.all(
      userIds.map(async (userId) => ({
        userId,
        preferences: await getNotificationPreferencesRepository(userId),
      })),
    ),
  ]);

  if (subscriptions.length === 0) {
    return {
      sent: 0,
      failed: 0,
      skipped: notifications.length,
    };
  }

  const preferencesByUserId = new Map(
    preferencesRows.map((row) => [row.userId, row.preferences]),
  );

  const subscriptionsByUserId = new Map<string, PushSubscriptionRow[]>();

  for (const subscription of subscriptions) {
    const current =
      subscriptionsByUserId.get(subscription.user_id) ?? [];
    current.push(subscription);
    subscriptionsByUserId.set(subscription.user_id, current);
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const notification of notifications) {
    const preferences = preferencesByUserId.get(notification.userId) ?? null;

    if (!isPushAllowedForType(preferences, notification.type)) {
      skipped += 1;
      continue;
    }

    const userSubscriptions =
      subscriptionsByUserId.get(notification.userId) ?? [];

    if (userSubscriptions.length === 0) {
      skipped += 1;
      continue;
    }

    const payload = buildPushPayload(notification);

    for (const subscription of userSubscriptions) {
      const result = await sendPushToSubscription(subscription, payload);

      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
      }
    }
  }

  return { sent, failed, skipped };
}

export async function registerPushSubscription(input: {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
  platform?: string | null;
}) {
  return upsertPushSubscriptionRepository(input);
}

export async function unregisterPushSubscription(input: {
  userId: string;
  endpoint: string;
}) {
  return deletePushSubscriptionRepository(input);
}

export function getPublicVapidKey() {
  return getVapidConfig().publicKey;
}
