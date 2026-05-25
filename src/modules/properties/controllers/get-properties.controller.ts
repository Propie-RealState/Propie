import { FastifyReply, FastifyRequest } from "fastify";
import { getPropertiesService } from "../services/get-properties.service";

export async function getPropertiesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const properties = await getPropertiesService();

  return reply.send(properties);
}