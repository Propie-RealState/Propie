import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  PropertyMapQuerySchema,
} from "../schemas/property-map.schema";

import {
  getMapPropertiesService,
} from "../services/get-map-properties.service";

export async function getMapPropertiesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const query =
    PropertyMapQuerySchema.parse(
      request.query
    );

  const items =
    await getMapPropertiesService(query);

  return reply.send({
    items,
  });
}
