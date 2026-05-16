import {
  FastifyInstance,
  FastifyRequest,
  RouteHandlerMethod,
} from "fastify";

import { authMiddleware }
  from "@/middlewares/auth.middleware";

import { createPropertyController }
  from "../controllers/create-property.controller";

import { findPropertyByIdController }
  from "../controllers/find-property-by-id.controller";

import { updatePropertyBasicController }
  from "../controllers/update-property-basic.controller";

import {
  updatePropertyLocationController,
} from "../controllers/update-property-location.controller";

import {
  updatePropertyDetailsController,
} from "../controllers/update-property-details.controller";

import {
  UpdatePropertyDetailsSchema,
} from "../schemas/update-property-details.schema";

export async function propertiesRoutes(
  app: FastifyInstance
) {

  app.post(
    "/",

    {
      preHandler:
        authMiddleware,
    },

    createPropertyController as RouteHandlerMethod
  );



  app.get(
    "/:id",

    {
      preHandler:
        authMiddleware,
    },

    findPropertyByIdController as RouteHandlerMethod
  );



  app.patch(
    "/:id/basic",

    {
      preHandler:
        authMiddleware,
    },

    updatePropertyBasicController as RouteHandlerMethod
  );



  app.patch(
    "/:id/location",

    {
      preHandler:
        authMiddleware,
    },

    updatePropertyLocationController as RouteHandlerMethod
  );



  app.patch(
    "/:id/details",

    {
      preHandler:
        authMiddleware,
    },

    async (
      request,
      reply
    ) => {

      const body =
        UpdatePropertyDetailsSchema.parse(
          request.body
        );

      return updatePropertyDetailsController(
        {
          ...request,

          params: {
            id:
              (request.params as { id: string }).id,
          },

          body,
        },

        reply
      );
    }
  );
}