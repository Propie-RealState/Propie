import { FastifyReply, FastifyRequest } from "fastify";

import { UpdatePropertyStatusSchema } from "../schemas/update-property-status.schema";
import { updatePropertyStatusService } from "../services/update-property-status.service";

export async function updatePropertyStatusController(
  request: FastifyRequest<{
    Params: { id: string };
    Body: unknown;
  }>,
  reply: FastifyReply,
) {
  try {
    const body = UpdatePropertyStatusSchema.parse(request.body);

    const property = await updatePropertyStatusService({
      userId: request.user.id,
      propertyId: request.params.id,
      status: body.status,
    });

    return reply.send({ success: true, property });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return reply.status(403).send({ message: "Forbidden" });
    }

    if (error instanceof Error && error.message === "Property not found") {
      return reply.status(404).send({ message: error.message });
    }

    throw error;
  }
}
