import type { FastifyReply, FastifyRequest } from "fastify";

import { getCronSecret } from "@/config/cron";

export async function cronSecretMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const expected = getCronSecret();

  if (!expected) {
    return reply.status(503).send({
      success: false,
      error: {
        code: "CRON_NOT_CONFIGURED",
        message: "Cron secret is not configured",
      },
    });
  }

  const provided = request.headers["x-cron-secret"];

  if (typeof provided !== "string" || provided !== expected) {
    return reply.status(401).send({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Invalid cron secret",
      },
    });
  }
}
