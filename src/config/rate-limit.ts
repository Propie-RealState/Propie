import type { FastifyContextConfig, FastifyRequest } from "fastify";

const isTestEnv = process.env.VITEST === "true";
const isE2eEnv = process.env.E2E_CAPTURE_VERIFICATION === "true";

export const RATE_LIMIT_PRESETS = {
  authLogin: {
    max: 10,
    timeWindow: "15 minutes",
  },
  authRegister: {
    max: 5,
    timeWindow: "1 hour",
  },
  authRefresh: {
    max: 30,
    timeWindow: "15 minutes",
  },
  authVerifyEmail: {
    max: 5,
    timeWindow: "15 minutes",
  },
  authVerificationResend: {
    max: 3,
    timeWindow: "15 minutes",
  },
  publicSearch: {
    max: 60,
    timeWindow: "1 minute",
  },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS;

export type EmailRateLimitPreset =
  | "authVerifyEmail"
  | "authVerificationResend";

function extractEmailFromBody(request: FastifyRequest): string | null {
  const body = request.body;

  if (typeof body !== "object" || body === null) {
    return null;
  }

  const email = (body as { email?: unknown }).email;

  if (typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();

  return normalized.length > 0 ? normalized : null;
}

export function buildEmailRateLimitConfig(preset: EmailRateLimitPreset) {
  const { max, timeWindow } = RATE_LIMIT_PRESETS[preset];
  const scope =
    preset === "authVerifyEmail" ? "verify-email" : "verification-resend";

  return {
    max,
    timeWindow,
    hook: "preValidation" as const,
    keyGenerator: (request: FastifyRequest) => {
      const email = extractEmailFromBody(request);

      return email ? `${scope}:${email}` : `${scope}:ip:${request.ip}`;
    },
  };
}

export function rateLimitRouteConfig(
  preset: RateLimitPreset,
): FastifyContextConfig {
  if (isTestEnv || isE2eEnv) {
    return { rateLimit: false };
  }

  const { max, timeWindow } = RATE_LIMIT_PRESETS[preset];

  return {
    rateLimit: {
      max,
      timeWindow,
    },
  };
}

export function rateLimitByEmailRouteConfig(
  preset: EmailRateLimitPreset,
): FastifyContextConfig {
  if (isTestEnv || isE2eEnv) {
    return { rateLimit: false };
  }

  return {
    rateLimit: buildEmailRateLimitConfig(preset),
  };
}
