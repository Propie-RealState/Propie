import type { FastifyContextConfig } from "fastify";

const isTestEnv = process.env.VITEST === "true";

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
  publicSearch: {
    max: 60,
    timeWindow: "1 minute",
  },
} as const;

export type RateLimitPreset = keyof typeof RATE_LIMIT_PRESETS;

export function rateLimitRouteConfig(
  preset: RateLimitPreset,
): FastifyContextConfig {
  if (isTestEnv) {
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
