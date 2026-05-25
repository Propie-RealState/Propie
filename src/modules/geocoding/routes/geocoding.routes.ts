import {
  FastifyInstance,
  RouteHandlerMethod,
} from "fastify";

import {
  searchAddressController,
} from "../controllers/search-address.controller";

export async function geocodingRoutes(
  app: FastifyInstance
) {
  app.get(
    "/search",
    searchAddressController as RouteHandlerMethod,
  );
}
