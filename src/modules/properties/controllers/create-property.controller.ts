import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import {
    CreatePropertyInput,
  } from "../schemas/create-property.schema";
  
  import {
    createPropertyService,
  } from "../services/create-property.service";
  
  export async function createPropertyController(
    request: FastifyRequest<{
      Body: CreatePropertyInput;
    }>,
    reply: FastifyReply
  ) {
    const result =
      await createPropertyService({
        ownerId:
          request.user.id,
  
        propertyType:
          request.body.propertyType,
  
        listingType:
          request.body.listingType,
      });
  
    return reply
      .status(201)
      .send(result);
  }