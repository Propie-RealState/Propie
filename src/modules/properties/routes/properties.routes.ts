import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify";

import {
  authMiddleware,
  optionalAuthMiddleware,
} from "@/middlewares/auth.middleware";
import { requireRoles } from "@/middlewares/require-roles.middleware";
import {
  PROPERTY_MANAGER_ROLES,
  PUBLISHER_ROLES,
} from "@/constants/roles";

import {
  findPropertyByIdController,
  getMapPropertiesController,
  getMyPropertiesController,
  getNearbyPropertiesController,
  getPropertiesController,
} from "../controllers/property-discovery.controller";
import {
  createPropertyController,
  publishPropertyController,
  savePropertyAmenitiesController,
  savePropertyCommercializationController,
  updatePropertyBasicController,
  updatePropertyLocationController,
  updatePropertyStatusController,
} from "../controllers/property-lifecycle.controller";
import {
  deletePropertyImageController,
  deletePropertyVideoController,
  updatePropertyImageCoverController,
  updatePropertyImagesOrderController,
  updatePropertyMediaOrderController,
  uploadPropertyImagesController,
  uploadPropertyVideosController,
} from "../controllers/property-media.controller";
import { subscribePropertyStatusController } from "../controllers/property-subscriptions.controller";
import { updatePropertyAmenitiesSchema } from "../schemas/update-property-amenities.schema";
import { updatePropertyCommercializationSchema } from "../schemas/update-property-commercialization.schema";
import { UpdatePropertyLocationSchema } from "../schemas/update-property-location.schema";
import { UpdatePropertyStatusSchema } from "../schemas/update-property-status.schema";

export async function propertiesRoutes(app: FastifyInstance) {
  const requirePropertyManager = requireRoles(PROPERTY_MANAGER_ROLES);

  app.post(
    "/",

    {
      preHandler: requireRoles(PUBLISHER_ROLES),
    },

    createPropertyController as RouteHandlerMethod,
  );

  app.get(
    "/",
    {
      preHandler: optionalAuthMiddleware,
    },
    getPropertiesController as RouteHandlerMethod,
  );

  app.get(
    "/map",
    {
      preHandler: optionalAuthMiddleware,
    },
    getMapPropertiesController as RouteHandlerMethod,
  );

  app.get(
    "/nearby",
    {
      preHandler: optionalAuthMiddleware,
    },
    getNearbyPropertiesController as RouteHandlerMethod,
  );
  
  app.get(
    "/mine",
    {
      preHandler: requireRoles(PROPERTY_MANAGER_ROLES),
    },
    getMyPropertiesController as RouteHandlerMethod,
  );

  app.get(
    "/:id",
    {
      preHandler: optionalAuthMiddleware,
    },
    findPropertyByIdController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/status",
    {
      preHandler: requirePropertyManager,
    },
    async (request, reply) => {
      const body = UpdatePropertyStatusSchema.parse(request.body);

      return updatePropertyStatusController(
        {
          ...request,
          params: { id: (request.params as { id: string }).id },
          body,
        },
        reply,
      );
    },
  );

  app.post(
    "/:id/status-subscriptions",
    {
      preHandler: authMiddleware,
    },
    subscribePropertyStatusController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/basic",

    {
      preHandler: requirePropertyManager,
    },

    updatePropertyBasicController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/location",

    {
      preHandler: requirePropertyManager,
    },

    async (request, reply) => {
      const body = UpdatePropertyLocationSchema.parse(request.body);

      return updatePropertyLocationController(
        {
          ...request,

          params: {
            id: (request.params as { id: string }).id,
          },

          body,
        },

        reply,
      );
    },
  );

  app.post(
    "/:id/images",

    {
      preHandler: requirePropertyManager,
    },

    uploadPropertyImagesController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/amenities",

    {
      preHandler: requirePropertyManager,
    },

    async (request, reply) => {
      const body = updatePropertyAmenitiesSchema.parse(request.body);

      return savePropertyAmenitiesController(
        {
          ...request,

          params: {
            id: (request.params as { id: string }).id,
          },

          body,
        },
        reply,
      );
    },
  );

  app.patch(
    "/:id/commercialization",

    {
      preHandler: requirePropertyManager,
    },

    async (request, reply) => {
      const body = updatePropertyCommercializationSchema.parse(request.body);

      return savePropertyCommercializationController(
        {
          ...request,

          params: {
            id: (request.params as { id: string }).id,
          },

          body,
        },
        reply,
      );
    },
  );
  app.patch(
    "/:id/publish",

    {
      preHandler: requirePropertyManager,
    },

    publishPropertyController as RouteHandlerMethod,
  );

  app.patch(
    "/:propertyId/images/order",
    {
      preHandler: requirePropertyManager,
    },
    updatePropertyImagesOrderController as RouteHandlerMethod,
  );

  app.delete(
    "/:propertyId/images/:imageId",
    {
      preHandler: requirePropertyManager,
    },
    deletePropertyImageController as RouteHandlerMethod,
  );

  app.patch(
    "/:propertyId/images/:imageId/cover",
    {
      preHandler: requirePropertyManager,
    },
    updatePropertyImageCoverController as RouteHandlerMethod,
  );

  app.post(
    "/:propertyId/videos",
    {
      preHandler: requirePropertyManager,
    },
    uploadPropertyVideosController as RouteHandlerMethod,
  );

  app.patch(
    "/:propertyId/media/order",
    {
      preHandler: requirePropertyManager,
    },
    updatePropertyMediaOrderController as RouteHandlerMethod,
  );

  app.delete(
    "/:propertyId/videos/:videoId",
    {
      preHandler: requirePropertyManager,
    },
    deletePropertyVideoController as RouteHandlerMethod,
  );
}
