import type { FastifyInstance } from "fastify";

import { authMiddleware } from "../../../middlewares/auth.middleware";

import { updateProfile } from "../repositories/profiles.repository";

import { uploadAvatarController } from "../controllers/upload-avatar.controller";

export async function profileRoutes(app: FastifyInstance) {
  app.post(
    "/me/avatar",
    { preHandler: authMiddleware },
    uploadAvatarController,
  );

  app.put(
    "/me",
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      const body = request.body as {
        phone?: string;
        location?: string;
        bio?: string;
        first_name?: string;
        last_name?: string;
        nationality?: string;
        birth_date?: string;
        experience?: unknown;
        certifications?: unknown;
        education?: unknown;
        agent_profile_banner_dismissed?: boolean;
      };

      const updatedProfile = await updateProfile(request.user.id, body);

      return reply.send({
        success: true,
        data: updatedProfile,
      });
    },
  );
}
