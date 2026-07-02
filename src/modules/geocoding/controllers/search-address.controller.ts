import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { applyPublicReadCache } from "@/lib/http/cache-headers";
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

  applyPublicReadCache(reply, 600);
  return reply.send({
    items,
  });
}
