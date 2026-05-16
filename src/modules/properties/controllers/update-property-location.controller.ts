import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import {
    UpdatePropertyLocationInput,
  } from "../schemas/update-property-location.schema";
  
  import {
    updatePropertyLocationService,
  } from "../services/update-property-location.service";
  
  export async function updatePropertyLocationController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
  
      Body:
        UpdatePropertyLocationInput;
    }>,
    reply: FastifyReply
  ) {
    try {
  
      const location =
        await updatePropertyLocationService({
          propertyId:
            request.params.id,
  
          ownerId:
            request.user.id,
  
          country:
            request.body.country,
  
          province:
            request.body.province,
  
          city:
            request.body.city,
  
          neighborhood:
            request.body.neighborhood,
  
          address:
            request.body.address,
        });
  
      return reply.send(location);
  
    } catch (error) {
  
      if (
        error instanceof Error
      ) {
  
        if (
          error.message ===
          "PROPERTY_NOT_FOUND"
        ) {
          return reply
            .status(404)
            .send({
              message:
                "Property not found",
            });
        }
  
        if (
          error.message ===
          "FORBIDDEN"
        ) {
          return reply
            .status(403)
            .send({
              message:
                "Forbidden",
            });
        }
      }
  
      throw error;
    }
  }