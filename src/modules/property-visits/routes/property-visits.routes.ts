import type { FastifyInstance, RouteHandlerMethod } from "fastify";

import { USER_ROLES } from "@/constants/roles";
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
      preHandler: requireAuthenticated,
    },
    listVisitsController as RouteHandlerMethod,
  );

  app.get(
    "/analytics",
    {
      preHandler: requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
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
      preHandler: requireAuthenticated,
    },
    getVisitController as RouteHandlerMethod,
  );

  app.post(
    "/",
    {
      preHandler: requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
    },
    createVisitController as RouteHandlerMethod,
  );

  app.post(
    "/:id/confirm",
    {
      preHandler: requireAuthenticated,
    },
    confirmVisitController as RouteHandlerMethod,
  );

  app.post(
    "/:id/reschedule",
    {
      preHandler: requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
    },
    rescheduleVisitController as RouteHandlerMethod,
  );

  app.post(
    "/:id/cancel",
    {
      preHandler: requireAuthenticated,
    },
    cancelVisitController as RouteHandlerMethod,
  );

  app.post(
    "/:id/complete",
    {
      preHandler: requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
    },
    completeVisitController as RouteHandlerMethod,
  );
}
