import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify";

import { authMiddleware } from "@/middlewares/auth.middleware";
import { requireRoles } from "@/middlewares/require-roles.middleware";
import {
  PROPERTY_MANAGER_ROLES,
  USER_ROLES,
} from "@/constants/roles";

import { createPropertyController } from "../controllers/create-property.controller";

import { findPropertyByIdController } from "../controllers/find-property-by-id.controller";

import { updatePropertyBasicController } from "../controllers/update-property-basic.controller";

import { updatePropertyLocationController } from "../controllers/update-property-location.controller";

import { UpdatePropertyLocationSchema } from "../schemas/update-property-location.schema";

import { updatePropertyDetailsController } from "../controllers/update-property-details.controller";

import { UpdatePropertyDetailsSchema } from "../schemas/update-property-details.schema";

import { uploadPropertyImagesController } from "../controllers/upload-property-images.controller";

import { savePropertyAmenitiesController } from "../controllers/save-property-amenities.controller";

import { updatePropertyAmenitiesSchema } from "../schemas/update-property-amenities.schema";

import { savePropertyCommercializationController } from "../controllers/save-property-commercialization.controller";

import { updatePropertyCommercializationSchema } from "../schemas/update-property-commercialization.schema";

import { publishPropertyController } from "../controllers/publish-property.controller";

import { getPropertiesController } from "../controllers/get-properties.controller";

import { getMyPropertiesController } from "../controllers/get-my-properties.controller";

import { deletePropertyImageController } from "../controllers/delete-property-image.controller";

import { updatePropertyImageCoverController } from "../controllers/update-property-image-cover.controller";

import { updatePropertyImagesOrderController } from "../controllers/update-property-images-order.controller";

import { uploadPropertyVideosController } from "../controllers/upload-property-videos.controller";

import { updatePropertyMediaOrderController } from "../controllers/update-property-media-order.controller";

import { deletePropertyVideoController } from "../controllers/delete-property-video.controller";

import { getMapPropertiesController } from "../controllers/get-map-properties.controller";

import { getNearbyPropertiesController } from "../controllers/get-nearby-properties.controller";

export async function propertiesRoutes(app: FastifyInstance) {
  app.post(
    "/",

    {
      preHandler: requireRoles([USER_ROLES.OWNER]),
    },

    createPropertyController as RouteHandlerMethod,
  );

  app.get(
    "/",

    getPropertiesController as RouteHandlerMethod,
  );

  app.get(
    "/map",

    getMapPropertiesController as RouteHandlerMethod,
  );

  app.get(
    "/nearby",

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

    findPropertyByIdController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/basic",

    {
      preHandler: authMiddleware,
    },

    updatePropertyBasicController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/location",

    {
      preHandler: authMiddleware,
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

  app.patch(
    "/:id/details",

    {
      preHandler: authMiddleware,
    },

    async (request, reply) => {
      const body = UpdatePropertyDetailsSchema.parse(request.body);

      return updatePropertyDetailsController(
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
      preHandler: authMiddleware,
    },

    uploadPropertyImagesController as RouteHandlerMethod,
  );

  app.patch(
    "/:id/amenities",

    {
      preHandler: authMiddleware,
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
      preHandler: authMiddleware,
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
      preHandler: authMiddleware,
    },

    publishPropertyController as RouteHandlerMethod,
  );

  app.patch(
    "/:propertyId/images/order",
    {
      preHandler: authMiddleware,
    },
    updatePropertyImagesOrderController as RouteHandlerMethod,
  );

  app.delete(
    "/:propertyId/images/:imageId",
    {
      preHandler: authMiddleware,
    },
    deletePropertyImageController as RouteHandlerMethod,
  );

  app.patch(
    "/:propertyId/images/:imageId/cover",
    {
      preHandler: authMiddleware,
    },
    updatePropertyImageCoverController as RouteHandlerMethod,
  );

  app.post(
    "/:propertyId/videos",
    {
      preHandler: authMiddleware,
    },
    uploadPropertyVideosController as RouteHandlerMethod,
  );

  app.patch(
    "/:propertyId/media/order",
    {
      preHandler: authMiddleware,
    },
    updatePropertyMediaOrderController as RouteHandlerMethod,
  );

  app.delete(
    "/:propertyId/videos/:videoId",
    {
      preHandler: authMiddleware,
    },
    deletePropertyVideoController as RouteHandlerMethod,
  );
}
