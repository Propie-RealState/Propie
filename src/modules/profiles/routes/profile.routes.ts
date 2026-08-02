import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { UPLOAD_BODY_LIMIT } from "@/config/body-limits";
import { authMiddleware }
from "../../../middlewares/auth.middleware";

import { updateProfile }
from "../repositories/profiles.repository";

import { uploadAvatarController }
from "../controllers/upload-avatar.controller";

import { UpdateProfileSchema }
from "../schemas/update-profile.schema";

export async function profileRoutes(
  app: FastifyInstance
) {

  app.post(
    "/me/avatar",
    {
      bodyLimit: UPLOAD_BODY_LIMIT,
      preHandler: authMiddleware,
    },
    uploadAvatarController,
  );

  app.put(
    "/me",

    {
      preHandler:
        authMiddleware,
    },

    async (
      request,
      reply
    ) => {
      let body: z.infer<typeof UpdateProfileSchema>;

      try {
        body = UpdateProfileSchema.parse(request.body);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              details: error.flatten(),
            },
          });
        }

        throw error;
      }

      const updatedProfile = await updateProfile(request.user.id, {
        phone: body.phone,
        location: body.location,
        bio: body.bio,
      });

      return reply.send({
        success: true,
        data: updatedProfile,
      });
    },
  );
}
