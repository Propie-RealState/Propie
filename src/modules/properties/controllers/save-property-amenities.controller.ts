import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import {
    savePropertyAmenitiesService,
  } from "../services/save-property-amenities.service";
  
  import {
    UpdatePropertyAmenitiesInput,
  } from "../schemas/update-property-amenities.schema";
  
  export async function savePropertyAmenitiesController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
  
      Body:
        UpdatePropertyAmenitiesInput;
    }>,
  
    reply: FastifyReply
  ) {
  
    await savePropertyAmenitiesService({
      propertyId:
        request.params.id,
  
      ownerId:
        request.user.id,
  
      amenities:
        request.body.amenities,
    });
  
    return reply.send({
      success: true,
    });
  }