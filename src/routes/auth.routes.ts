import type {
  FastifyInstance,
} from 'fastify';

import {
  LoginSchema,
} from '@/database/types/auth';

import {
  login,
} from '../services/auth/auth.service';

import {
  refreshSession,
} from '../services/auth/refresh';

import {
  authMiddleware,
} from '../middlewares/auth.middleware';

import {
  roleMiddleware,
} from '../middlewares/role.middleware';

import {
  logoutSession,
} from '../services/auth/logout';

import {
  cleanupSessions,
} from "../services/auth/cleanup";

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



  // Registro: POST /auth/register → register.route.ts

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

  // ======================================================
  // ME
  // ======================================================

  app.get(
    '/me',

    {
      preHandler:
        authMiddleware,
    },

    async (
      request,
      reply
    ) => {
      return reply.send({
        success: true,

        data:
          request.user,
      });
    }
  );

  // ======================================================
  // OWNER ONLY
  // ======================================================

  app.get(
    '/owner-only',

    {
      preHandler: [
        authMiddleware,

        roleMiddleware([
          'OWNER',
        ]),
      ],
    },

    async (
      request,
      reply
    ) => {
      return reply.send({
        success: true,

        message:
          'Welcome owner',

        user:
          request.user,
      });
    }
  );

  // ======================================================
  // LOGOUT
  // ======================================================

  app.post(
    '/logout',

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
        // LOGOUT SESSION
        // ================================================

        await logoutSession(
          body.refreshToken
        );

        // ================================================
        // RESPONSE
        // ================================================

        return reply
          .status(200)
          .send({
            success: true,
          });

      } catch (error) {

        console.error(error);

        return reply
          .status(400)
          .send({
            success: false,

            error: {
              code:
                'LOGOUT_ERROR',

              message:
                'Failed to logout',
            },
          });
      }
    }
  );

  app.delete(
    "/sessions/cleanup",

    async (
      _request,
      reply
    ) => {

      try {

        const result =
          await cleanupSessions();

        return reply
          .status(200)
          .send({
            success: true,

            data: result,
          });

      } catch (error) {

        console.error(error);

        return reply
          .status(500)
          .send({
            success: false,
          });
      }
    }
  );


}

