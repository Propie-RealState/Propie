import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  NearbyPropertiesQuerySchema,
} from "../schemas/property-map.schema";

import {
  getNearbyPropertiesService,
} from "../services/get-nearby-properties.service";

export async function getNearbyPropertiesController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const query =
    NearbyPropertiesQuerySchema.parse(
      request.query
    );

  const items =
    await getNearbyPropertiesService(query);

  return reply.send({
    items,
    limit:
      query.limit,
    offset:
      query.offset,
  });
}
