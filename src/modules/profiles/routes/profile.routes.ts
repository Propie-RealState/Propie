import type { FastifyInstance } from "fastify";

import { authMiddleware }
from "../../../middlewares/auth.middleware";

import { updateProfile }
from "../repositories/profiles.repository";

import { uploadAvatarController }
from "../controllers/upload-avatar.controller";

export async function profileRoutes(
  app: FastifyInstance
) {

  app.post(
    "/me/avatar",
    { preHandler: authMiddleware },
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

      const body =
        request.body as {
          phone?: string;
          location?: string;
          bio?: string;
        };

      console.log("BODY");
      console.log(body);

      console.log("USER ID");
      console.log(request.user.id);

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