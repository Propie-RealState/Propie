import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import {
  applyOptionalAuthDetailCache,
  applyOptionalAuthPublicCache,
} from "@/lib/http/cache-headers";

// Optional pagination for the explore listing. Both fields stay optional so
// omitting them preserves the legacy "return everything" behavior.
const ExplorePaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});
import { isAgentDiscoveryAudience } from "../utils/discovery-audience";
import { findPropertyByIdService } from "../services/find-property-by-id.service";
import { getMapPropertiesService } from "../services/get-map-properties.service";
import { getMyPropertiesService } from "../services/get-my-properties.service";
import { getNearbyPropertiesService } from "../services/get-nearby-properties.service";
import { getPropertiesService } from "../services/get-properties.service";
import {
  NearbyPropertiesQuerySchema,
  PropertyMapQuerySchema,
} from "../schemas/property-map.schema";

export async function getPropertiesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Opt-in pagination: when limit/offset are absent the response is the
  // full array (unchanged contract). When present, the same array shape is
  // returned but bounded — clients can migrate to paging without a new
  // envelope. See docs/phase-3-backend-performance-report.md.
  const { limit, offset } = ExplorePaginationSchema.parse(request.query);

  const properties = await getPropertiesService({
    forAgentDiscovery: isAgentDiscoveryAudience(request),
    limit,
    offset,
  });

  applyOptionalAuthPublicCache(request, reply);
  return reply.send(properties);
}

export async function getMapPropertiesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = PropertyMapQuerySchema.parse(request.query);

  const items = await getMapPropertiesService(query, {
    forAgentDiscovery: isAgentDiscoveryAudience(request),
  });

  applyOptionalAuthPublicCache(request, reply);
  return reply.send({
    items,
  });
}

export async function getNearbyPropertiesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const query = NearbyPropertiesQuerySchema.parse(request.query);

  const items = await getNearbyPropertiesService(query, {
    forAgentDiscovery: isAgentDiscoveryAudience(request),
  });

  applyOptionalAuthPublicCache(request, reply);
  return reply.send({
    items,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getMyPropertiesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = request.user.id;

  const properties = await getMyPropertiesService(userId);

  return reply.send(properties);
}

export async function findPropertyByIdController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  const property = await findPropertyByIdService({
    propertyId: request.params.id,
    viewerUserId: request.user?.id,
  });

  if (!property) {
    return reply.status(404).send({
      message: "Property not found",
    });
  }

  applyOptionalAuthDetailCache(request, reply);
  return reply.send(property);
}
