import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import { updatePropertyImageCoverService }
    from "../services/update-property-image-cover.service";
  
  export async function updatePropertyImageCoverController(
    request: FastifyRequest<{
      Params: {
        propertyId: string;
        imageId: string;
      };
    }>,
    reply: FastifyReply,
  ) {
    const userId = request.user.id;
  
    const {
      propertyId,
      imageId,
    } = request.params;
  
    await updatePropertyImageCoverService({
      propertyId,
      imageId,
      userId,
    });
  
    return reply.status(204).send();
  }