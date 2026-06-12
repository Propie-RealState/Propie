import {
  FastifyInstance,
  RouteHandlerMethod,
} from "fastify";

import { rateLimitRouteConfig } from "@/config/rate-limit";
import { optionalAuthMiddleware } from "@/middlewares/auth.middleware";

import { globalSearchController } from "../controllers/global-search.controller";

export async function searchRoutes(
  app: FastifyInstance,
) {
  app.get(
    "/",
    {
      config: rateLimitRouteConfig("publicSearch"),
      preHandler: optionalAuthMiddleware,
    },
    globalSearchController as RouteHandlerMethod,
  );
}
