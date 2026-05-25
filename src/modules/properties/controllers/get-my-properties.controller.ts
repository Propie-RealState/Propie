import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import { getMyPropertiesService } from "../services/get-my-properties.service.ts";
  
  export async function getMyPropertiesController(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    const userId = request.user.id;
  
    const properties =
      await getMyPropertiesService(userId);
  
    return reply.send(properties);
  }