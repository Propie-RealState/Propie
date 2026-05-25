import { FastifyReply, FastifyRequest } from "fastify";

import { updatePropertyImagesOrderService } from "../services/update-property-images-order.service";

export async function updatePropertyImagesOrderController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };

    Body: {
      imageIds: string[];
    };
  }>,
  reply: FastifyReply,
) {
  try {
    await updatePropertyImagesOrderService({
      propertyId: request.params.propertyId,
      imageIds: request.body.imageIds,
      userId: request.user.id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FORBIDDEN") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      if (error.message.startsWith("INCOMPLETE_IMAGE_IDS")) {
        return reply.status(400).send({
          code: "INCOMPLETE_IMAGE_IDS",
          message: error.message.replace("INCOMPLETE_IMAGE_IDS: ", ""),
        });
      }

      if (error.message === "USE_MEDIA_ORDER") {
        return reply.status(400).send({
          code: "USE_MEDIA_ORDER",
          message:
            "Esta propiedad tiene videos. Usá PATCH /media/order con [{ id, type }, ...]",
        });
      }

      if (error.message === "DUPLICATE_IMAGE_IDS") {
        return reply.status(400).send({
          code: "DUPLICATE_IMAGE_IDS",
          message: "imageIds tiene UUIDs repetidos",
        });
      }

      if (error.message === "INVALID_IMAGE_IDS") {
        return reply.status(400).send({
          code: "INVALID_IMAGE_IDS",
          message:
            "Algún UUID no existe en esta propiedad o no es válido (revisá variables de Postman)",
        });
      }
    }

    throw error;
  }
}
