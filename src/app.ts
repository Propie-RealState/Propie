import Fastify from "fastify";

import cors from "@fastify/cors";

import multipart from "@fastify/multipart";

import fastifyStatic from "@fastify/static";

import path from "node:path";

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

import { favoritesRoutes } from "./modules/favorites/routes/favorites.routes";

import { chatsRoutes } from "./modules/chats/routes/chats.routes";

import { notificationsRoutes } from "./modules/notifications/routes/notifications.routes";

import { contactsRoutes } from "./modules/contacts/routes/contacts.routes";

// ========================================================
// BUILD APP
// ========================================================

export async function buildApp() {

  const app =
    Fastify({
      logger: true,
      bodyLimit: 104_857_600,
      requestTimeout: 300_000,
    });

  // ======================================================
  // CORS
  // ======================================================

  await app.register(
    cors,
    {
      origin: true,

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
  // STATIC FILES
  // ======================================================

  await app.register(
    fastifyStatic,
    {
      root: path.join(
        process.cwd(),
        "uploads"
      ),

      prefix:
        "/uploads/",
    }
  );

  // ======================================================
  // ROUTES
  // ======================================================

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
    notificationsRoutes,
    {
      prefix: "/notifications",
    }
  );

  await app.register(
    contactsRoutes,
    {
      prefix: "/contacts",
    }
  );

  return app;
}