import type { FastifyInstance } from "fastify";

import { API_VERSION } from "@/config/version";

export async function rootRoute(app: FastifyInstance) {
  app.get("/", (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    return reply.send({
      service: "Propie API",
      status: "running",
      version: API_VERSION,
      environment: process.env.NODE_ENV ?? "development",
    });
  });
}
