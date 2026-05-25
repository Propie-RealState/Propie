import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import {
  SearchAddressQuerySchema,
} from "../schemas/geocoding.schema";

import {
  searchAddressSuggestionsService,
} from "../services/geocoding.service";

export async function searchAddressController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const query =
    SearchAddressQuerySchema.parse(
      request.query
    );

  const items =
    await searchAddressSuggestionsService(
      query.query,
      query.limit
    );

  return reply.send({
    items,
  });
}
