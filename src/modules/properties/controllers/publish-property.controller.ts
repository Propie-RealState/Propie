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
  
    const publisherType =
      user.role === "AGENT" ? "AGENT" : "OWNER";

    const property = await publishPropertyService({
      userId: user.id,
      publisherType,
      propertyId: request.params.id,
    });
  
    return reply.send({
      success: true,
  
      property,
    });
  }