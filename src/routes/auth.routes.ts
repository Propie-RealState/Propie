import type { FastifyInstance } from "fastify";

import { LoginSchema } from "../database/types/auth";

import { login } from "../services/auth/auth.service";

import { refreshSession, RefreshSessionError } from "../services/auth/refresh";

import { authMiddleware } from "../middlewares/auth.middleware";

import { roleMiddleware } from "../middlewares/role.middleware";

import { logoutSession } from "../services/auth/logout";

import {
  requestPasswordReset,
  resetPasswordWithToken,
} from "../services/auth/password-reset.service";

import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ResendVerificationSchema,
  VerifyEmailSchema,
} from "../database/types/auth";

import { rateLimitByEmailRouteConfig, rateLimitRouteConfig } from "@/config/rate-limit";

import {
  resendEmailVerificationCode,
  verifyEmailWithCode,
} from "@/services/auth/email-verification.service";

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

      if (error instanceof Error) {
        if (error.message === "EMAIL_NOT_VERIFIED") {
          return reply.status(403).send({
            success: false,
            error: {
              code: "EMAIL_NOT_VERIFIED",
              message: "Verify your email before signing in.",
            },
          });
        }

        if (error.message === "ACCOUNT_INACTIVE") {
          return reply.status(403).send({
            success: false,
            error: {
              code: "ACCOUNT_INACTIVE",
              message: "This account is inactive.",
            },
          });
        }
      }

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

      if (error instanceof RefreshSessionError) {
        const statusByCode: Record<string, number> = {
          ACCOUNT_INACTIVE: 403,
          EMAIL_NOT_VERIFIED: 403,
          USER_NOT_FOUND: 401,
          REFRESH_TOKEN_REUSE: 401,
          SESSION_EXPIRED: 401,
          INVALID_REFRESH_TOKEN: 401,
        };

        return reply.status(statusByCode[error.code] ?? 401).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

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
  // EMAIL VERIFICATION
  // ======================================================

  app.post(
    "/verify-email",
    { config: rateLimitByEmailRouteConfig("authVerifyEmail") },
    async (request, reply) => {
      try {
        const input = VerifyEmailSchema.parse(request.body);

        await verifyEmailWithCode(input);

        return reply.status(200).send({
          success: true,
          message: "Email verified successfully.",
        });
      } catch (error) {
        if (error instanceof Error) {
          const verificationErrors: Record<
            string,
            { status: number; message: string }
          > = {
            INVALID_VERIFICATION_CODE: {
              status: 400,
              message: "Invalid verification code.",
            },
            VERIFICATION_CODE_EXPIRED: {
              status: 400,
              message: "Verification code expired.",
            },
            VERIFICATION_CODE_ALREADY_USED: {
              status: 400,
              message: "Verification code already used.",
            },
            EMAIL_ALREADY_VERIFIED: {
              status: 409,
              message: "Email is already verified.",
            },
            VERIFICATION_NOT_FOUND: {
              status: 404,
              message: "No verification code found for this account.",
            },
            ACCOUNT_INACTIVE: {
              status: 403,
              message: "This account is inactive.",
            },
          };

          const mapped = verificationErrors[error.message];

          if (mapped) {
            return reply.status(mapped.status).send({
              success: false,
              error: {
                code: error.message,
                message: mapped.message,
              },
            });
          }
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

  app.post(
    "/verification/resend",
    { config: rateLimitByEmailRouteConfig("authVerificationResend") },
    async (request, reply) => {
      try {
        const input = ResendVerificationSchema.parse(request.body);

        await resendEmailVerificationCode(input.email);

        return reply.status(200).send({
          success: true,
          message:
            "If an account exists for that email, a new verification code has been sent.",
        });
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "EMAIL_ALREADY_VERIFIED") {
            return reply.status(409).send({
              success: false,
              error: {
                code: "EMAIL_ALREADY_VERIFIED",
                message: "Email is already verified.",
              },
            });
          }

          if (error.message === "ACCOUNT_INACTIVE") {
            return reply.status(403).send({
              success: false,
              error: {
                code: "ACCOUNT_INACTIVE",
                message: "This account is inactive.",
              },
            });
          }
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

        return reply.status(200).send({
          success: true,
        });
      }
    },
  );

}
