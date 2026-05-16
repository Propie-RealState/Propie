import Fastify from 'fastify';

import cors from '@fastify/cors';

import {
  authRoutes,
} from './routes/auth.routes';
import { registerRoute }
  from "./routes/register.route";

import { propertiesRoutes }
  from "./modules/properties/routes/properties.routes";

// ========================================================
// BUILD APP
// ========================================================

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });



  // ======================================================
  // CORS
  // ======================================================

  await app.register(cors, {
    origin: true,

    credentials: true,
  });



  // ======================================================
  // ROUTES
  // ======================================================

  await app.register(
    authRoutes,
    {
      prefix: '/auth',
    }
  );

  await app.register(registerRoute);

  await app.register(
    propertiesRoutes,
    {
      prefix: "/properties",
    }
  );

  return app;
}