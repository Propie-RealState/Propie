import type { FastifyInstance } from "fastify";

import { LoginSchema } from "../database/types/auth";

import { login } from "../services/auth/auth.service";

import { refreshSession } from "../services/auth/refresh";

import { authMiddleware } from "../middlewares/auth.middleware";

import { roleMiddleware } from "../middlewares/role.middleware";

import { logoutSession } from "../services/auth/logout";

import { cleanupSessions } from "../services/auth/cleanup";

import {
  requestPasswordReset,
  resetPasswordWithToken,
} from "../services/auth/password-reset.service";

import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "../database/types/auth";

import { rateLimitRouteConfig } from "@/config/rate-limit";

import { getMyProfile } from "../modules/profiles/services/profile.service";

import { buildAuthUserPayload } from "../modules/profiles/utils/map-profile";

import { findAgentStatsRepository } from "../modules/profiles/repositories/profiles.repository";

// ========================================================
// AUTH ROUTES
// ========================================================

export async function authRoutes(app: FastifyInstance) {
  // ======================================================
  // HEALTH
  // ======================================================

  app.get("/health", async () => {
    return {
      success: true,
    };
  });

  // Registro: POST /auth/register → register.route.ts

  // ======================================================
  // LOGIN
  // ======================================================

  app.post(
    "/login",
    { config: rateLimitRouteConfig("authLogin") },
    async (request, reply) => {
    try {
      const input = LoginSchema.parse(request.body);

      const response = await login(input);

      return reply.status(200).send({
        success: true,

        data: response,
      });
    } catch (error) {
      console.error(error);

      return reply.status(401).send({
        success: false,

        error: {
          code: "LOGIN_ERROR",

          message: "Invalid credentials",
        },
      });
    }
  },
  );
  // ======================================================
  // REFRESH
  // ======================================================

  app.post(
    "/refresh",
    { config: rateLimitRouteConfig("authRefresh") },
    async (request, reply) => {
    try {
      const body = request.body as {
        refreshToken: string;
      };

      // ================================================
      // REFRESH SESSION
      // ================================================

      const response = await refreshSession(body.refreshToken);

      // ================================================
      // RESPONSE
      // ================================================

      return reply.status(200).send({
        success: true,

        data: response,
      });
    } catch (error) {
      console.error(error);

      return reply.status(401).send({
        success: false,

        error: {
          code: "INVALID_REFRESH_TOKEN",

          message: "Invalid refresh token",
        },
      });
    }
  },
  );

  // ======================================================
  // PASSWORD RESET
  // ======================================================

  app.post(
    "/forgot-password",
    { config: rateLimitRouteConfig("authLogin") },
    async (request, reply) => {
      try {
        const input = ForgotPasswordSchema.parse(request.body);

        await requestPasswordReset(input.email);

        return reply.status(200).send({
          success: true,
          message:
            "If an account exists for that email, a password reset link has been sent.",
        });
      } catch (error) {
        console.error(error);

        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request",
          },
        });
      }
    },
  );

  app.post(
    "/reset-password",
    { config: rateLimitRouteConfig("authLogin") },
    async (request, reply) => {
      try {
        const input = ResetPasswordSchema.parse(request.body);

        await resetPasswordWithToken({
          token: input.token,
          password: input.password,
        });

        return reply.status(200).send({
          success: true,
          message: "Password updated successfully",
        });
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "INVALID_OR_EXPIRED_TOKEN"
        ) {
          return reply.status(400).send({
            success: false,
            error: {
              code: "INVALID_OR_EXPIRED_TOKEN",
              message: "Invalid or expired reset token",
            },
          });
        }

        console.error(error);

        return reply.status(400).send({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request",
          },
        });
      }
    },
  );

  // ======================================================
  // ME
  // ======================================================

  app.get(
    "/me",

    {
      preHandler: authMiddleware,
    },

    async (request, reply) => {
      const profile = await getMyProfile(request.user.id);

      let stats = null;

      if (request.user.role === "AGENT") {
        stats = await findAgentStatsRepository(request.user.id);
      }

      return reply.send({
        success: true,

        data: buildAuthUserPayload(request.user, profile, stats),
      });
    },
  );

  // ======================================================
  // OWNER ONLY
  // ======================================================

  app.get(
    "/owner-only",

    {
      preHandler: [authMiddleware, roleMiddleware(["OWNER"])],
    },

    async (request, reply) => {
      return reply.send({
        success: true,

        message: "Welcome owner",

        user: request.user,
      });
    },
  );

  // ======================================================
  // LOGOUT
  // ======================================================

  app.post(
    "/logout",

    async (request, reply) => {
      try {
        const body = request.body as {
          refreshToken: string;
        };

        // ================================================
        // LOGOUT SESSION
        // ================================================

        await logoutSession(body.refreshToken);

        // ================================================
        // RESPONSE
        // ================================================

        return reply.status(200).send({
          success: true,
        });
      } catch (error) {
        console.error(error);

        return reply.status(400).send({
          success: false,

          error: {
            code: "LOGOUT_ERROR",

            message: "Failed to logout",
          },
        });
      }
    },
  );

  app.delete(
    "/sessions/cleanup",

    async (_request, reply) => {
      try {
        const result = await cleanupSessions();

        return reply.status(200).send({
          success: true,

          data: result,
        });
      } catch (error) {
        console.error(error);

        return reply.status(500).send({
          success: false,
        });
      }
    },
  );
}
