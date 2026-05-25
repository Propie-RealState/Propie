import { FastifyReply, FastifyRequest } from "fastify";

import { assertCanManageProperty } from "../utils/assert-can-manage-property";
import { savePropertyVideoFromMultipart } from "../services/upload-property-videos.service";

export async function uploadPropertyVideosController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const { propertyId } = request.params;
    const userId = request.user.id;

    await assertCanManageProperty(userId, propertyId);

    const uploadedVideos = [];

    for await (const file of request.files()) {
      const video = await savePropertyVideoFromMultipart(
        propertyId,
        file,
      );

      uploadedVideos.push(video);
    }

    if (uploadedVideos.length === 0) {
      return reply.status(400).send({
        message: "No se envió ningún archivo (key: files, type: File)",
      });
    }

    return reply.status(201).send({ videos: uploadedVideos });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FORBIDDEN") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      if (error.message === "INVALID_VIDEO_FORMAT") {
        return reply.status(400).send({
          message: "Formato no permitido. Usá mp4, mov, webm o m4v",
        });
      }

      const err = error as Error & { code?: string };

      if (err.code === "FST_REQ_FILE_TOO_LARGE") {
        return reply.status(413).send({
          message: "El video supera el límite de 100 MB",
        });
      }
    }

    throw error;
  }
}
