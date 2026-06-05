import type {
  FastifyInstance,
  RouteHandlerMethod,
} from "fastify";

import { authMiddleware } from "@/middlewares/auth.middleware";
import {
  addFavoriteController,
  listFavoritesController,
  removeFavoriteController,
  syncFavoritesController,
} from "../controllers/favorites.controller";

export async function favoritesRoutes(
  app: FastifyInstance,
) {
  app.get(
    "/",
    { preHandler: authMiddleware },
    listFavoritesController as RouteHandlerMethod,
  );

  app.post(
    "/sync",
    { preHandler: authMiddleware },
    syncFavoritesController as RouteHandlerMethod,
  );

  app.post(
    "/:propertyId",
    { preHandler: authMiddleware },
    addFavoriteController as RouteHandlerMethod,
  );

  app.delete(
    "/:propertyId",
    { preHandler: authMiddleware },
    removeFavoriteController as RouteHandlerMethod,
  );
}
