import { FastifyReply, FastifyRequest } from "fastify";

import { subscribePropertyStatusService } from "../services/subscribe-property-status.service";

export async function subscribePropertyStatusController(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
) {
  try {
    const subscription = await subscribePropertyStatusService({
      userId: request.user.id,
      propertyId: request.params.id,
    });

    return reply.send({ success: true, subscription });
  } catch (error) {
    if (error instanceof Error && error.message === "Property not found") {
      return reply.status(404).send({ message: error.message });
    }

    if (error instanceof Error && error.message === "Property is not paused") {
      return reply.status(400).send({ message: error.message });
    }

    throw error;
  }
}
