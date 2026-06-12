import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  findPropertyByIdService,
} from "../services/find-property-by-id.service";

export async function findPropertyByIdController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply
) {
  const property = await findPropertyByIdService({
    propertyId: request.params.id,
    viewerUserId: request.user?.id,
  });

  if (!property) {
    return reply
      .status(404)
      .send({
        message:
          "Property not found",
      });
  }

  return reply.send(property);
}