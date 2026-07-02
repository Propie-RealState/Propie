import Fastify from "fastify";

import compress from "@fastify/compress";
import cors from "@fastify/cors";

import rateLimit from "@fastify/rate-limit";

import multipart from "@fastify/multipart";
import zlib from "node:zlib";

import {
  authRoutes,
} from "./routes/auth.routes";

import {
  registerRoute,
} from "./routes/register.route";

import {
  propertiesRoutes,
} from "./modules/properties/routes/properties.routes";

import { profileRoutes } from "./modules/profiles/routes/profile.routes";

import { agentApplicationsRoutes } from "./modules/agent-applications/routes/agent-applications.routes";

import { geocodingRoutes } from "./modules/geocoding/routes/geocoding.routes";

import { searchRoutes } from "./modules/search/routes/search.routes";

import { favoritesRoutes } from "./modules/favorites/routes/favorites.routes";

import { chatsRoutes } from "./modules/chats/routes/chats.routes";
import { propertyConversationsRoutes } from "./modules/property-conversations/routes/property-conversations.routes";
import { propertyVisitsRoutes } from "./modules/property-visits/routes/property-visits.routes";

import { notificationsRoutes } from "./modules/notifications/routes/notifications.routes";

import { agentsRoutes } from "./modules/agents/routes/agents.routes";

import { adminRoutes } from "./modules/admin/routes/admin.routes";

import { mediaRoutes } from "./modules/media/routes/media.routes";

import { healthRoute } from "./routes/health.route";
import { DEFAULT_BODY_LIMIT } from "./config/body-limits";

// ========================================================
// BUILD APP
// ========================================================

export async function buildApp() {

  const app =
    Fastify({
      logger: true,
      bodyLimit: DEFAULT_BODY_LIMIT,
      requestTimeout: 300_000,
    });

  // ======================================================
  // CORS
  // ======================================================

  const configuredOrigins = [
    process.env.FRONTEND_ORIGIN,
    process.env.DEPLOY_FRONTEND_ORIGIN,
  ]
    .flatMap((origins) => origins?.split(",") ?? [])
    .map((origin) => origin.trim())
    .filter(Boolean);

  const localOrigins =
    process.env.NODE_ENV === "production"
      ? []
      : [
          "http://localhost:5173",
          "http://127.0.0.1:5173",
        ];

  const allowedOrigins = [
    ...new Set([
      ...configuredOrigins,
      ...localOrigins,
    ]),
  ];

  await app.register(rateLimit, {
    global: false,
  });

  await app.register(compress, {
    threshold: 1024,
    encodings: ["br", "gzip", "deflate"],
    brotliOptions: {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 4,
      },
    },
    zlibOptions: {
      level: 6,
    },
  });

  await app.register(
    cors,
    {
      origin:
        allowedOrigins?.length
          ? allowedOrigins
          : true,

      credentials: true,
      methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE",
        "OPTIONS",
      ],
    }
  );

  // ======================================================
  // MULTIPART
  // ======================================================

  await app.register(
    multipart,
    {
      limits: {
        fileSize: 100 * 1024 * 1024,
        files: 10,
      },
    }
  );

  // ======================================================
  // ROUTES
  // ======================================================

  await app.register(healthRoute);

  await app.register(
    authRoutes,
    {
      prefix: "/auth",
    }
  );

  await app.register(
    registerRoute
  );

  await app.register(
    propertiesRoutes,
    {
      prefix: "/properties",
    }
  );

  await app.register(
    profileRoutes,
    {
      prefix: "/profile",
    }
  );

  await app.register(
    agentApplicationsRoutes,
    {
      prefix: "/agent-applications",
    }
  );

  await app.register(
    geocodingRoutes,
    {
      prefix: "/geocoding",
    }
  );

  await app.register(
    searchRoutes,
    {
      prefix: "/search",
    }
  );

  await app.register(
    favoritesRoutes,
    {
      prefix: "/favorites",
    }
  );

  await app.register(
    chatsRoutes,
    {
      prefix: "/chats",
    }
  );

  await app.register(
    propertyConversationsRoutes,
    {
      prefix: "/property-conversations",
    }
  );

  await app.register(
    propertyVisitsRoutes,
    {
      prefix: "/property-visits",
    }
  );

  await app.register(
    notificationsRoutes,
    {
      prefix: "/notifications",
    }
  );

  await app.register(
    agentsRoutes,
    {
      prefix: "/agents",
    }
  );

  await app.register(
    adminRoutes,
    {
      prefix: "/admin",
    }
  );

  await app.register(
    mediaRoutes,
    {
      prefix: "/media",
    }
  );

  return app;
}
