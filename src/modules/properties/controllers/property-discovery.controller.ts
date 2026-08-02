import { FastifyReply, FastifyRequest } from "fastify";

import {
  applyOptionalAuthDetailCache,
  applyOptionalAuthPublicCache,
} from "@/lib/http/cache-headers";
import { decodeCursor } from "@/database/shared/cursor";

import { isAgentDiscoveryAudience } from "../utils/discovery-audience";
import { findPropertyByIdService } from "../services/find-property-by-id.service";
import { getMapPropertiesService } from "../services/get-map-properties.service";
import { getMyPropertiesService } from "../services/get-my-properties.service";
import { getNearbyPropertiesService } from "../services/get-nearby-properties.service";
import {
  getPropertiesKeysetService,
  getPropertiesService,
} from "../services/get-properties.service";
import { ExplorePaginationSchema } from "../schemas/explore-pagination.schema";
import {
  NearbyPropertiesQuerySchema,
  PropertyMapQuerySchema,
} from "../schemas/property-map.schema";

const DEFAULT_KEYSET_LIMIT = 20;

export async function getPropertiesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { limit, offset, cursor } = ExplorePaginationSchema.parse(
    request.query,
  );
  const forAgentDiscovery = isAgentDiscoveryAudience(request);

  // Legacy OFFSET mode: only when the client explicitly sends `offset`.
  // Kept temporarily for backward compatibility; returns a bare array.
  if (offset !== undefined) {
    const properties = await getPropertiesService({
      forAgentDiscovery,
      limit,
      offset,
    });

    applyOptionalAuthPublicCache(request, reply);
    return reply.send(properties);
  }

  // Keyset (cursor) mode — the preferred mechanism. Triggered by a `cursor`
  // or a `limit`. Returns { items, nextCursor, hasMore }.
  if (cursor !== undefined || limit !== undefined) {
    let decodedCursor = null;

    if (cursor !== undefined) {
      decodedCursor = decodeCursor(cursor);

      if (!decodedCursor) {
        return reply.status(400).send({
          message: "Invalid pagination cursor",
        });
      }
    }

    const page = await getPropertiesKeysetService({
      forAgentDiscovery,
      limit: limit ?? DEFAULT_KEYSET_LIMIT,
      cursor: decodedCursor,
    });

    applyOptionalAuthPublicCache(request, reply);
    return reply.send(page);
  }

  // Legacy default: no pagination params → full array (unchanged contract).
  const properties = await getPropertiesService({ forAgentDiscovery });

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
