import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import {
    publishPropertyService,
  } from "../services/publish-property.service";
  
  export async function publishPropertyController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
  
    reply: FastifyReply
  ) {
  
    const user =
      request.user;
  
    const property =
      await publishPropertyService(
        {
          ownerId:
            user.id,
  
          propertyId:
            request.params.id,
        }
      );
  
    return reply.send({
      success: true,
  
      property,
    });
  }