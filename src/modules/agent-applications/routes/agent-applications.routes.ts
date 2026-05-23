import type {
  FastifyInstance,
  RouteHandlerMethod,
} from "fastify";

import { authMiddleware } from "@/middlewares/auth.middleware";
import {
  createAgentApplicationController,
  getMyAgentApplicationByPropertyController,
  getOwnerAgentApplicationsController,
  getOwnerAgentApplicationsCountController,
  updateOwnerAgentApplicationStatusController,
} from "../controllers/agent-applications.controller";

export async function agentApplicationsRoutes(app: FastifyInstance) {
  app.post(
    "/",
    {
      preHandler: authMiddleware,
    },
    createAgentApplicationController as RouteHandlerMethod,
  );

  app.get(
    "/mine/property/:propertyId",
    {
      preHandler: authMiddleware,
    },
    getMyAgentApplicationByPropertyController as RouteHandlerMethod,
  );

  app.get(
    "/owner",
    {
      preHandler: authMiddleware,
    },
    getOwnerAgentApplicationsController as RouteHandlerMethod,
  );

  app.get(
    "/owner/count",
    {
      preHandler: authMiddleware,
    },
    getOwnerAgentApplicationsCountController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/status",
    {
      preHandler: authMiddleware,
    },
    updateOwnerAgentApplicationStatusController as RouteHandlerMethod,
  );
}
