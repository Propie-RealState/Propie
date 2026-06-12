import type { FastifyInstance, RouteHandlerMethod } from "fastify";

import { authMiddleware } from "@/middlewares/auth.middleware";

import {
  getAgentPublicProfileController,
  getUserPublicProfileController,
} from "../controllers/agent-profiles.controller";
import {
  getCommercializedPropertiesController,
  getPublishedPropertiesController,
} from "../controllers/agent-properties.controller";
import {
  checkCanReviewController,
  createUserReviewController,
  listLegacyAgentReviewsController,
  listUserReviewsController,
} from "../controllers/agent-reviews.controller";

export async function agentsRoutes(app: FastifyInstance) {
  app.get(
    "/users/:userId/public",
    getUserPublicProfileController as RouteHandlerMethod,
  );

  app.get(
    "/users/:userId/can-review",
    { preHandler: authMiddleware },
    checkCanReviewController as RouteHandlerMethod,
  );

  app.get(
    "/users/:userId/reviews",
    listUserReviewsController as RouteHandlerMethod,
  );

  app.post(
    "/users/:userId/reviews",
    { preHandler: authMiddleware },
    createUserReviewController as RouteHandlerMethod,
  );

  app.get(
    "/:agentId/commercialized-properties",
    getCommercializedPropertiesController as RouteHandlerMethod,
  );

  app.get(
    "/users/:userId/published-properties",
    getPublishedPropertiesController as RouteHandlerMethod,
  );

  app.get(
    "/:agentId/profile",
    getAgentPublicProfileController as RouteHandlerMethod,
  );

  app.get(
    "/:agentId/reviews",
    listLegacyAgentReviewsController as RouteHandlerMethod,
  );
}
