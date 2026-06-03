import type { FastifyReply, FastifyRequest } from "fastify";
import { uploadAvatarService } from "../services/upload-avatar.service";

export async function uploadAvatarController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const file = await request.file();

  if (!file) {
    return reply.status(400).send({ error: "No file provided" });
  }

  const buffer = await file.toBuffer();

  const avatarUrl = await uploadAvatarService(request.user.id, buffer);

  return reply.send({ success: true, avatarUrl });
}
