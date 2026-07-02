import {
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { applyOptionalAuthPublicCache } from "@/lib/http/cache-headers";
import { isAgentDiscoveryAudience } from "@/modules/properties/utils/discovery-audience";
import { GlobalSearchQuerySchema } from "../schemas/global-search.schema";
import { globalSearchService } from "../services/global-search.service";

export async function globalSearchController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = GlobalSearchQuerySchema.parse(
    request.query,
  );

  const results = await globalSearchService(query.q, query.limit, {
    forAgentDiscovery: isAgentDiscoveryAudience(request),
  });

  applyOptionalAuthPublicCache(request, reply, 30);
  return reply.send(results);
}
