import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { createSignedStorageUrl } from "@/lib/supabase";
import { isMediaStoragePath } from "@/lib/storage/storage-reference";
import { optionalAuthMiddleware } from "@/middlewares/auth.middleware";
import {
  authorizeMediaAccess,
  legacyUploadContentType,
  readLegacyUploadFile,
} from "../services/media-access.service";

export async function mediaRoutes(app: FastifyInstance) {
  app.get(
    "/*",
    { preHandler: optionalAuthMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const wildcardPath = (request.params as { "*": string })["*"] ?? "";
      const storagePath = wildcardPath.replace(/^\/+/, "");

      if (!storagePath || !isMediaStoragePath(storagePath)) {
        return reply.status(404).send({
          success: false,
          error: {
            code: "MEDIA_NOT_FOUND",
            message: "Media not found",
          },
        });
      }

      const allowed = await authorizeMediaAccess({
        storagePath,
        viewerUserId: request.user?.id,
        viewerRole: request.user?.role,
      });

      if (!allowed) {
        return reply.status(403).send({
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Not authorized to access this file",
          },
        });
      }

      if (storagePath.startsWith("legacy/")) {
        const buffer = await readLegacyUploadFile(storagePath);

        if (!buffer) {
          return reply.status(404).send({
            success: false,
            error: {
              code: "MEDIA_NOT_FOUND",
              message: "Media not found",
            },
          });
        }

        return reply
          .header("Content-Type", legacyUploadContentType(storagePath))
          .header("Cache-Control", "private, max-age=300")
          .send(buffer);
      }

      const signedUrl = await createSignedStorageUrl(storagePath);

      return reply.redirect(signedUrl, 302);
    },
  );
}
