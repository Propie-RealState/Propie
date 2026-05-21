import { FastifyReply, FastifyRequest } from "fastify";

import { deletePropertyVideoService } from "../services/delete-property-video.service";

export async function deletePropertyVideoController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
      videoId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    await deletePropertyVideoService({
      videoId: request.params.videoId,
      propertyId: request.params.propertyId,
      userId: request.user.id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "VIDEO_NOT_FOUND") {
      return reply.status(404).send({ message: "Video not found" });
    }

    throw error;
  }
}
