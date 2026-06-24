import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";

export async function adminHealthController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(200).send({
    success: true,
    data: {
      scope: "admin",
      status: "ok",
    },
  });
}
