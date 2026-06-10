import type { FastifyInstance, RouteHandlerMethod } from "fastify";

import { USER_ROLES } from "@/constants/roles";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRoles } from "@/middlewares/require-roles.middleware";
import {
  getConversationController,
  listConversationsController,
  listHistoricalConversationsController,
  listMessagesController,
  markReadController,
  sendMessageController,
  startConversationController,
} from "../controllers/property-conversations.controller";

export async function propertyConversationsRoutes(
  app: FastifyInstance,
) {
  const requireAuthenticated = requireRoles([
    USER_ROLES.CLIENT,
    USER_ROLES.OWNER,
    USER_ROLES.AGENT,
  ]);

  app.post(
    "/",
    {
      preHandler: [
        authMiddleware,
        requireRoles([USER_ROLES.CLIENT]),
      ],
    },
    startConversationController as RouteHandlerMethod,
  );

  app.get(
    "/",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    listConversationsController as RouteHandlerMethod,
  );

  app.get(
    "/historical",
    {
      preHandler: [
        authMiddleware,
        requireRoles([USER_ROLES.AGENT]),
      ],
    },
    listHistoricalConversationsController as RouteHandlerMethod,
  );

  app.get(
    "/:id",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    getConversationController as RouteHandlerMethod,
  );

  app.get(
    "/:id/messages",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    listMessagesController as RouteHandlerMethod,
  );

  app.post(
    "/:id/messages",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    sendMessageController as RouteHandlerMethod,
  );

  app.post(
    "/:id/read",
    {
      preHandler: [authMiddleware, requireAuthenticated],
    },
    markReadController as RouteHandlerMethod,
  );
}
