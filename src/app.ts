import Fastify from 'fastify';

import cors from '@fastify/cors';

import {
  authRoutes,
} from './routes/auth.routes';
import { registerRoute }
  from "./routes/register.route";


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


  return app;
}