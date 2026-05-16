import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import {
    UpdatePropertyDetailsInput,
  } from "../schemas/update-property-details.schema";
  
  import {
    updatePropertyDetailsService,
  } from "../services/update-property-details.service";
  
  export async function updatePropertyDetailsController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
  
      Body:
        UpdatePropertyDetailsInput;
    }>,
  
    reply: FastifyReply
  ) {
  
    const property =
      await updatePropertyDetailsService({
        propertyId:
          request.params.id,
  
        ownerId:
          request.user.id,
  
        bedrooms:
          request.body.bedrooms,
  
        bathrooms:
          request.body.bathrooms,
  
        areaM2:
          request.body.areaM2,
      });
  
    return reply.send(
      property
    );
  }