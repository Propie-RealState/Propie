import { FastifyReply, FastifyRequest } from "fastify";

import { updatePropertyMediaOrderService } from "../services/update-property-media-order.service";

function isValidMediaItem(
  item: unknown,
): item is { id: string; type: "image" | "video" } {
  if (!item || typeof item !== "object") {
    return false;
  }

  const { id, type } = item as { id?: unknown; type?: unknown };

  return (
    typeof id === "string" &&
    id.length > 0 &&
    (type === "image" || type === "video")
  );
}

export async function updatePropertyMediaOrderController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };

    Body: {
      media: {
        id: string;
        type: "image" | "video";
      }[];
    };
  }>,
  reply: FastifyReply,
) {
  const media = request.body?.media;

  if (!Array.isArray(media)) {
    return reply.status(400).send({
      code: "INVALID_BODY",
      message:
        'El body debe ser { "media": [{ "id": "uuid", "type": "image"|"video" }, ...] }',
    });
  }

  if (media.length === 0) {
    return reply.status(400).send({
      code: "EMPTY_MEDIA",
      message: "El array media no puede estar vacío",
    });
  }

  if (!media.every(isValidMediaItem)) {
    return reply.status(400).send({
      code: "INVALID_MEDIA_TYPE",
      message:
        "Cada item necesita id (string) y type (image o video). No envíes solo UUIDs",
    });
  }

  try {
    await updatePropertyMediaOrderService({
      propertyId: request.params.propertyId,
      media,
      userId: request.user.id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FORBIDDEN") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      if (error.message.startsWith("INCOMPLETE_MEDIA")) {
        return reply.status(400).send({
          code: "INCOMPLETE_MEDIA",
          message: error.message.replace("INCOMPLETE_MEDIA: ", ""),
        });
      }

      if (
        error.message === "DUPLICATE_MEDIA_ID" ||
        error.message === "IMAGE_TYPE_MISMATCH" ||
        error.message === "VIDEO_TYPE_MISMATCH"
      ) {
        return reply.status(400).send({
          code: error.message,
          message:
            "Cada item necesita id + type correcto (image/video), sin repetir IDs",
        });
      }

      if (
        error.message === "INVALID_IMAGE_IDS" ||
        error.message === "INVALID_VIDEO_IDS"
      ) {
        return reply.status(400).send({
          code: error.message,
          message: "Algún id no existe en esta propiedad o el type no coincide",
        });
      }
    }

    throw error;
  }
}
