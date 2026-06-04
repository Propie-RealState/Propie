import {
  FastifyInstance,
  RouteHandlerMethod,
} from "fastify";

import { globalSearchController } from "../controllers/global-search.controller";

export async function searchRoutes(
  app: FastifyInstance,
) {
  app.get(
    "/",
    globalSearchController as RouteHandlerMethod,
  );
}
