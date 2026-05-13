import type {
  FastifyInstance,
} from 'fastify';

import {
  RegisterSchema,
  LoginSchema,
} from '@/database/types/auth';

import {
  register,
  login,
} from '../services/auth/auth.service';

import {
  refreshSession,
} from '../services/auth/refresh';

// ========================================================
// AUTH ROUTES
// ========================================================

export async function authRoutes(
  app: FastifyInstance
) {

  // ======================================================
  // HEALTH
  // ======================================================

  app.get(
    '/health',
    async () => {
      return {
        success: true,
      };
    }
  );



  // ======================================================
  // REGISTER
  // ======================================================

  app.post(
    '/register',
    async (
      request,
      reply
    ) => {
      try {
        const input =
          RegisterSchema.parse(
            request.body
          );

        const response =
          await register(
            input
          );

        return reply
          .status(201)
          .send({
            success: true,

            data: response,
          });
      } catch (error) {
        console.error(error);

        return reply
          .status(400)
          .send({
            success: false,

            error: {
              code:
                'REGISTER_ERROR',

              message:
                'Failed to register user',
            },
          });
      }
    }
  );



  // ======================================================
  // LOGIN
  // ======================================================

  app.post(
    '/login',
    async (
      request,
      reply
    ) => {
      try {
        const input =
          LoginSchema.parse(
            request.body
          );

        const response =
          await login(
            input
          );

        return reply
          .status(200)
          .send({
            success: true,

            data: response,
          });
      } catch (error) {
        console.error(error);

        return reply
          .status(401)
          .send({
            success: false,

            error: {
              code:
                'LOGIN_ERROR',

              message:
                'Invalid credentials',
            },
          });
      }
    }
  );
  // ======================================================
  // REFRESH
  // ======================================================

  app.post(
    '/refresh',
    async (
      request,
      reply
    ) => {
      try {

        const body =
          request.body as {
            refreshToken: string;
          };



        // ================================================
        // REFRESH SESSION
        // ================================================

        const response =
          await refreshSession(
            body.refreshToken
          );



        // ================================================
        // RESPONSE
        // ================================================

        return reply
          .status(200)
          .send({
            success: true,

            data: response,
          });

      } catch (error) {

        console.error(error);

        return reply
          .status(401)
          .send({
            success: false,

            error: {
              code:
                'INVALID_REFRESH_TOKEN',

              message:
                'Invalid refresh token',
            },
          });
      }
    }
  );
}

