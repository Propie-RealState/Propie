import type {
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { z } from "zod";

import {
  addFavorite,
  listFavoritePropertyIds,
  removeFavorite,
  syncFavorites,
} from "../services/favorites.service";
import {
  PropertyDeletedError,
  PropertyNotFoundError,
} from "@/modules/properties/utils/assert-property-owner";

const SyncFavoritesSchema = z.object({
  propertyIds: z.array(z.string().uuid()),
});

export async function listFavoritesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const propertyIds = await listFavoritePropertyIds(request.user.id);

  return reply.send({
    success: true,
    data: propertyIds,
  });
}

export async function addFavoriteController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const propertyId = await addFavorite({
      userId: request.user.id,
      propertyId: request.params.propertyId,
    });

    return reply.status(201).send({
      success: true,
      data: {
        propertyId,
      },
    });
  } catch (error) {
    if (
      error instanceof PropertyNotFoundError
      || error instanceof PropertyDeletedError
    ) {
      return reply.status(404).send({
        success: false,
        error: {
          code: "PROPERTY_NOT_FOUND",
          message: "Property not found",
        },
      });
    }

    throw error;
  }
}

export async function removeFavoriteController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const propertyId = await removeFavorite({
    userId: request.user.id,
    propertyId: request.params.propertyId,
  });

  if (!propertyId) {
    return reply.status(404).send({
      success: false,
      error: {
        code: "FAVORITE_NOT_FOUND",
        message: "Favorite not found",
      },
    });
  }

  return reply.send({
    success: true,
    data: {
      propertyId,
    },
  });
}

export async function syncFavoritesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = SyncFavoritesSchema.parse(request.body);
  const propertyIds = await syncFavorites({
    userId: request.user.id,
    propertyIds: body.propertyIds,
  });

  return reply.send({
    success: true,
    data: propertyIds,
  });
}
