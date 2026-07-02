import type { FastifyReply, FastifyRequest } from "fastify";

/**
 * Phase 1 public cache policy.
 *
 * - Optional-auth catalog endpoints: cache only anonymous responses (AGENT
 *   discovery filter changes the payload).
 * - Fully public read endpoints: short public TTL.
 * - Authenticated / user-specific routes: never cached here.
 */

const PRIVATE_NO_CACHE = "private, no-cache";

export function hasAuthorizationHeader(request: FastifyRequest): boolean {
  return Boolean(request.headers.authorization?.trim());
}

/** Explore catalog, map, nearby, search — anonymous only. */
export function applyOptionalAuthPublicCache(
  request: FastifyRequest,
  reply: FastifyReply,
  maxAgeSeconds = 60,
): void {
  if (hasAuthorizationHeader(request)) {
    reply.header("Cache-Control", PRIVATE_NO_CACHE);
    reply.header("Vary", "Authorization");
    return;
  }

  reply.header(
    "Cache-Control",
    `public, max-age=${maxAgeSeconds}, stale-while-revalidate=120`,
  );
}

/** Property detail — visibility can differ when a viewer token is present. */
export function applyOptionalAuthDetailCache(
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  if (hasAuthorizationHeader(request)) {
    reply.header("Cache-Control", PRIVATE_NO_CACHE);
    reply.header("Vary", "Authorization");
    return;
  }

  reply.header(
    "Cache-Control",
    "public, max-age=30, stale-while-revalidate=60",
  );
}

/** Fully public endpoints (agent profiles, geocoding, reviews lists). */
export function applyPublicReadCache(
  reply: FastifyReply,
  maxAgeSeconds = 300,
): void {
  reply.header(
    "Cache-Control",
    `public, max-age=${maxAgeSeconds}, stale-while-revalidate=60`,
  );
}
