import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { createSignedStorageUrl } from "@/lib/supabase";
import { getCachedSignedStorageUrl } from "@/lib/storage/signed-url-cache";
import { isMediaStoragePath } from "@/lib/storage/storage-reference";
import { authMiddleware, optionalAuthMiddleware } from "@/middlewares/auth.middleware";
import { generateMediaToken, verifyMediaToken } from "@/services/auth/jwt";
import {
  authorizeMediaAccess,
  legacyUploadContentType,
  readLegacyUploadFile,
} from "../services/media-access.service";

export async function mediaRoutes(app: FastifyInstance) {
  // Media URLs may carry a `?ct=` capability token. `no-referrer` stops the
  // full URL (token included) from leaking to third parties via the Referer
  // header — the primary mitigation for capability-token exposure. Scoped to
  // this plugin, so only /media/* responses are affected.
  app.addHook("onSend", async (_request, reply) => {
    reply.header("Referrer-Policy", "no-referrer");
  });

  // ── Capability token ──────────────────────────────────────────────
  // Browser <img>/<video> cannot attach an Authorization header, so an
  // authenticated caller exchanges its session here for a short-lived,
  // read-only media token that is appended to media URLs as `?ct=`.
  // Registered before the wildcard so it is matched as a static route.
  app.get(
    "/token",
    { preHandler: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const token = generateMediaToken({
        userId: request.user.id,
        role: request.user.role,
      });

      return reply.send({ success: true, token });
    },
  );

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

      // Resolve the viewer from either the Authorization header (set by
      // optionalAuthMiddleware) or a `?ct=` capability token. This lets an
      // owner view their own draft media through a plain <img> tag without
      // making the browser send a bearer header.
      let viewer = request.user
        ? { id: request.user.id, role: request.user.role }
        : undefined;

      if (!viewer) {
        const capabilityToken = (request.query as { ct?: string } | undefined)?.ct;

        if (capabilityToken) {
          try {
            const payload = verifyMediaToken(capabilityToken);
            viewer = { id: payload.sub, role: payload.role };
          } catch {
            // Fall through as anonymous; public media is still served.
          }
        }
      }

      const allowed = await authorizeMediaAccess({
        storagePath,
        viewerUserId: viewer?.id,
        viewerRole: viewer?.role,
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

      const { url: signedUrl, maxAgeSeconds } = await getCachedSignedStorageUrl(
        storagePath,
        () => createSignedStorageUrl(storagePath),
      );

      const hasCapabilityToken = Boolean(
        (request.query as { ct?: string } | undefined)?.ct,
      );
      const isAuthenticatedViewer = Boolean(viewer);
      const scope =
        hasCapabilityToken || isAuthenticatedViewer ? "private" : "public";

      // The 302 points at a signed URL that expires with the object's signed
      // TTL. The browser caches this redirect, so its max-age MUST NOT exceed
      // the signed URL's remaining life — otherwise a replayed cached redirect
      // hits an expired token and Supabase returns 400. No stale-while-
      // revalidate: serving a stale redirect would reintroduce the same
      // expired-token failure.
      const cacheControl = `${scope}, max-age=${maxAgeSeconds}`;

      return reply.header("Cache-Control", cacheControl).redirect(signedUrl, 302);
    },
  );
}
