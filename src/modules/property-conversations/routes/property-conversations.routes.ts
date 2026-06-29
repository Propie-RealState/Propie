import type { FastifyInstance, RouteHandlerMethod } from "fastify";

import { USER_ROLES } from "@/constants/roles";
import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRoles } from "@/middlewares/require-roles.middleware";
import {
  archiveConversationController,
  closeConversationController,
  getConversationController,
  listConversationsController,
  listHistoricalConversationsController,
  listMessagesController,
  markReadController,
  reopenConversationController,
  sendMessageController,
  startConversationController,
  startInternalConversationController,
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

  app.post(
    "/internal",
    {
      preHandler: [
        authMiddleware,
        requireRoles([USER_ROLES.OWNER, USER_ROLES.AGENT]),
      ],
    },
    startInternalConversationController as RouteHandlerMethod,
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

  const requireConversationManager = requireRoles([
    USER_ROLES.OWNER,
    USER_ROLES.AGENT,
  ]);

  app.post(
    "/:id/archive",
    {
      preHandler: [authMiddleware, requireConversationManager],
    },
    archiveConversationController as RouteHandlerMethod,
  );

  app.post(
    "/:id/close",
    {
      preHandler: [authMiddleware, requireConversationManager],
    },
    closeConversationController as RouteHandlerMethod,
  );

  app.post(
    "/:id/reopen",
    {
      preHandler: [authMiddleware, requireConversationManager],
    },
    reopenConversationController as RouteHandlerMethod,
  );
}
