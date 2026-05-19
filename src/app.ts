import Fastify from "fastify";

import cors from "@fastify/cors";

import multipart from "@fastify/multipart";

import fastifyStatic
from "@fastify/static";

import path
from "node:path";

import {
  authRoutes,
} from "./routes/auth.routes";

import {
  registerRoute,
} from "./routes/register.route";

import {
  propertiesRoutes,
} from "./modules/properties/routes/properties.routes";

// ========================================================
// BUILD APP
// ========================================================

export async function buildApp() {

  const app =
    Fastify({
      logger: true,
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
        fileSize:
          10 * 1024 * 1024,
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

  return app;
}