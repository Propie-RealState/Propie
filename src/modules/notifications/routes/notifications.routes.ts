import type {
  FastifyInstance,
  RouteHandlerMethod,
} from "fastify";

import { authMiddleware } from "@/middlewares/auth.middleware";
import {
  getNotificationPreferencesController,
  getPushVapidPublicKeyController,
  getUnreadNotificationCountController,
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
  registerPushSubscriptionController,
  unregisterPushSubscriptionController,
  updateNotificationPreferencesController,
} from "../controllers/notifications.controller";

export async function notificationsRoutes(
  app: FastifyInstance,
) {
  app.get(
    "/",
    { preHandler: authMiddleware },
    listNotificationsController as RouteHandlerMethod,
  );

  app.get(
    "/unread-count",
    { preHandler: authMiddleware },
    getUnreadNotificationCountController as RouteHandlerMethod,
  );

  app.patch(
    "/read-all",
    { preHandler: authMiddleware },
    markAllNotificationsReadController as RouteHandlerMethod,
  );

  app.get(
    "/preferences",
    { preHandler: authMiddleware },
    getNotificationPreferencesController as RouteHandlerMethod,
  );

  app.patch(
    "/preferences",
    { preHandler: authMiddleware },
    updateNotificationPreferencesController as RouteHandlerMethod,
  );

  app.get(
    "/push/vapid-public-key",
    getPushVapidPublicKeyController as RouteHandlerMethod,
  );

  app.post(
    "/push/subscribe",
    { preHandler: authMiddleware },
    registerPushSubscriptionController as RouteHandlerMethod,
  );

  app.delete(
    "/push/subscribe",
    { preHandler: authMiddleware },
    unregisterPushSubscriptionController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/read",
    { preHandler: authMiddleware },
    markNotificationReadController as RouteHandlerMethod,
  );
}
