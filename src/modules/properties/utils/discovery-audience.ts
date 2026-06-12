import type { FastifyRequest } from "fastify";

export function isAgentDiscoveryAudience(
  request: FastifyRequest,
): boolean {
  return request.user?.role === "AGENT";
}
