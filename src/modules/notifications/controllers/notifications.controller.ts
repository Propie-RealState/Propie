import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  ListNotificationsQuerySchema,
  RegisterPushSubscriptionSchema,
  UnregisterPushSubscriptionSchema,
  UpdateNotificationPreferencesSchema,
} from "../schemas/notification.schema";
import {
  getNotificationPreferences,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from "../services/notification.service";
import {
  getPublicVapidKey,
  registerPushSubscription,
  unregisterPushSubscription,
} from "../services/notification-push.service";

export async function listNotificationsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = ListNotificationsQuerySchema.parse(request.query);

  const result = await listNotifications({
    userId: request.user.id,
    limit: query.limit,
    offset: query.offset,
    unreadOnly: query.unreadOnly,
  });

  return reply.send({
    success: true,
    data: result.items,
    meta: result.meta,
  });
}

export async function getUnreadNotificationCountController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const count = await getUnreadNotificationCount(request.user.id);

  return reply.send({
    success: true,
    data: {
      count,
    },
  });
}

export async function markNotificationReadController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  const notification = await markNotificationRead({
    notificationId: request.params.id,
    userId: request.user.id,
  });

  if (!notification) {
    return reply.status(404).send({
      success: false,
      error: {
        code: "NOTIFICATION_NOT_FOUND",
        message: "Notification not found",
      },
    });
  }

  return reply.send({
    success: true,
    data: notification,
  });
}

export async function markAllNotificationsReadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updatedCount = await markAllNotificationsRead(request.user.id);

  return reply.send({
    success: true,
    data: {
      updatedCount,
    },
  });
}

export async function getNotificationPreferencesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const preferences = await getNotificationPreferences(request.user.id);

  return reply.send({
    success: true,
    data: preferences,
  });
}

export async function updateNotificationPreferencesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = UpdateNotificationPreferencesSchema.parse(request.body);
  const preferences = await updateNotificationPreferences({
    userId: request.user.id,
    preferences: body,
  });

  return reply.send({
    success: true,
    data: preferences,
  });
}

export async function getPushVapidPublicKeyController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send({
    success: true,
    data: {
      publicKey: getPublicVapidKey(),
      enabled: getPublicVapidKey().length > 0,
    },
  });
}

export async function registerPushSubscriptionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = RegisterPushSubscriptionSchema.parse(request.body);
  const subscription = await registerPushSubscription({
    userId: request.user.id,
    endpoint: body.endpoint,
    p256dh: body.p256dh,
    auth: body.auth,
    userAgent: request.headers["user-agent"] ?? null,
    platform: body.platform ?? null,
  });

  return reply.send({
    success: true,
    data: {
      id: subscription.id,
      endpoint: subscription.endpoint,
    },
  });
}

export async function unregisterPushSubscriptionController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = UnregisterPushSubscriptionSchema.parse(request.body);
  const removed = await unregisterPushSubscription({
    userId: request.user.id,
    endpoint: body.endpoint,
  });

  return reply.send({
    success: true,
    data: {
      removed,
    },
  });
}
