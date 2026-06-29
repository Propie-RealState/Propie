import type { FastifyReply, FastifyRequest } from "fastify";
import { uploadAvatarService } from "../services/upload-avatar.service";
import { FileValidationError } from "@/lib/storage/file-validation";

export async function uploadAvatarController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const file = await request.file();

  if (!file) {
    return reply.status(400).send({ error: "No file provided" });
  }

  try {
    const buffer = await file.toBuffer();
    const avatarUrl = await uploadAvatarService(request.user.id, buffer, {
      mimetype: file.mimetype,
      filename: file.filename,
    });

    return reply.send({ success: true, avatarUrl });
  } catch (error) {
    if (error instanceof FileValidationError) {
      return reply.status(400).send({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    throw error;
  }
}
