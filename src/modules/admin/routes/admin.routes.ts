import type {
  FastifyInstance,
  RouteHandlerMethod,
} from "fastify";

import { USER_ROLES } from "@/constants/roles";
import { requireRoles } from "@/middlewares/require-roles.middleware";
import { adminHealthController } from "../controllers/admin-health.controller";
import {
  adminOverviewController,
  adminUsersController,
  adminPropertiesController,
  adminAgentsController,
  adminBIController,
} from "../controllers/admin-analytics.controller";

const requireAdmin = requireRoles([USER_ROLES.ADMIN]);

export async function adminRoutes(app: FastifyInstance) {
  // Admin analytics + BI (read-only)
  app.get(
    "/health",
    { preHandler: requireAdmin },
    adminHealthController as RouteHandlerMethod,
  );

  app.get(
    "/analytics/overview",
    { preHandler: requireAdmin },
    adminOverviewController as RouteHandlerMethod,
  );

  app.get(
    "/analytics/users",
    { preHandler: requireAdmin },
    adminUsersController as RouteHandlerMethod,
  );

  app.get(
    "/analytics/properties",
    { preHandler: requireAdmin },
    adminPropertiesController as RouteHandlerMethod,
  );

  app.get(
    "/analytics/agents",
    { preHandler: requireAdmin },
    adminAgentsController as RouteHandlerMethod,
  );

  app.get(
    "/analytics/bi",
    { preHandler: requireAdmin },
    adminBIController as RouteHandlerMethod,
  );
}
