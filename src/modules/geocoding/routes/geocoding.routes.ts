import {
  FastifyInstance,
  RouteHandlerMethod,
} from "fastify";

import { rateLimitRouteConfig } from "@/config/rate-limit";

import {
  searchAddressController,
} from "../controllers/search-address.controller";

export async function geocodingRoutes(
  app: FastifyInstance
) {
  app.get(
    "/search",
    { config: rateLimitRouteConfig("publicSearch") },
    searchAddressController as RouteHandlerMethod,
  );
}
