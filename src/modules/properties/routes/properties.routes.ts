import { FastifyInstance, FastifyRequest, RouteHandlerMethod } from "fastify";

import { authMiddleware } from "@/middlewares/auth.middleware";

import { createPropertyController } from "../controllers/create-property.controller";

import { findPropertyByIdController } from "../controllers/find-property-by-id.controller";

import { updatePropertyBasicController } from "../controllers/update-property-basic.controller";

import { updatePropertyLocationController } from "../controllers/update-property-location.controller";

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


export async function propertiesRoutes(app: FastifyInstance) {
  app.post(
    "/",

    {
      preHandler: authMiddleware,
    },

    createPropertyController as RouteHandlerMethod,
  );

  app.get(
    "/",

    getPropertiesController as RouteHandlerMethod,
  );
  
  app.get(
    "/mine",
    {
      preHandler: authMiddleware,
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

    updatePropertyLocationController as RouteHandlerMethod,
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
}
