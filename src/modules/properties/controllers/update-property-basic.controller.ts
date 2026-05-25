import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import {
    UpdatePropertyBasicInput,
  } from "../schemas/update-property-basic.schema";
  
  import {
    updatePropertyBasicService,
  } from "../services/update-property-basic.service";
  
  export async function updatePropertyBasicController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
  
      Body: UpdatePropertyBasicInput;
    }>,
    reply: FastifyReply
  ) {
    try {
      await updatePropertyBasicService({
          propertyId:
            request.params.id,
  
          ownerId:
            request.user.id,
  
          title:
            request.body.title,
  
          description:
            request.body.description,
  
          price:
            request.body.price,

          bedrooms:
            request.body.bedrooms,

          bathrooms:
            request.body.bathrooms,

          areaM2:
            request.body.areaM2,

          propertyType:
            request.body.propertyType,

          operationType:
            request.body.operationType,
        });
  
      return reply.status(200).send({ ok: true });
  
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