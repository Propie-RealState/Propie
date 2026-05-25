import { FastifyReply, FastifyRequest } from "fastify";

import { deletePropertyImageService } from "../services/delete-property-image.service";

export async function deletePropertyImageController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
      imageId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const userId = request.user.id;

  const { propertyId, imageId } = request.params;

  await deletePropertyImageService({
    imageId,
    propertyId,
    userId,
  });

  return reply.status(204).send();
}