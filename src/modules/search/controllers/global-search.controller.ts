import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { GlobalSearchQuerySchema } from "../schemas/global-search.schema";
import { globalSearchService } from "../services/global-search.service";

export async function globalSearchController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = GlobalSearchQuerySchema.parse(
    request.query,
  );

  const results = await globalSearchService(
    query.q,
    query.limit,
  );

  return reply.send(results);
}
