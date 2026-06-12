import type { FastifyInstance, RouteHandlerMethod } from "fastify";

import { USER_ROLES } from "@/constants/roles";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { cronSecretMiddleware } from "@/middlewares/cron-secret.middleware";
import { requireRoles } from "@/middlewares/require-roles.middleware";

import {
  cancelVisitController,
  completeVisitController,
  confirmVisitController,
  createVisitController,
  getVisitController,
  listVisitsController,
  processVisitRemindersController,
  rescheduleVisitController,
  visitAnalyticsController,
} from "../controllers/property-visits.controller";

export async function propertyVisitsRoutes(app: FastifyInstance) {
  const requireAuthenticated = requireRoles([
    USER_ROLES.CLIENT,
    USER_ROLES.OWNER,
    USER_ROLES.AGENT,
  ]);

  app.get(
    "/",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    listVisitsController as RouteHandlerMethod,
  );

  app.get(
    "/analytics",
    {
      preHandler: [
        authMiddleware,
        requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
      ],
    },
    visitAnalyticsController as RouteHandlerMethod,
  );

  app.post(
    "/process-reminders",
    {
      preHandler: [cronSecretMiddleware],
    },
    processVisitRemindersController as RouteHandlerMethod,
  );

  app.get(
    "/:id",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    getVisitController as RouteHandlerMethod,
  );

  app.post(
    "/",
    {
      preHandler: [
        authMiddleware,
        requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
      ],
    },
    createVisitController as RouteHandlerMethod,
  );

  app.post(
    "/:id/confirm",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    confirmVisitController as RouteHandlerMethod,
  );

  app.post(
    "/:id/reschedule",
    {
      preHandler: [
        authMiddleware,
        requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
      ],
    },
    rescheduleVisitController as RouteHandlerMethod,
  );

  app.post(
    "/:id/cancel",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    cancelVisitController as RouteHandlerMethod,
  );

  app.post(
    "/:id/complete",
    {
      preHandler: [
        authMiddleware,
        requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
      ],
    },
    completeVisitController as RouteHandlerMethod,
  );
}
