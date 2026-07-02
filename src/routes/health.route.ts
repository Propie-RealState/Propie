import type { FastifyInstance } from "fastify";

export async function healthRoute(app: FastifyInstance) {
  app.get("/health", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    return reply.send({ status: "ok" });
  });
}
