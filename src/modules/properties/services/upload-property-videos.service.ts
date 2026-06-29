import { randomUUID } from "node:crypto";
import path from "node:path";

import type { MultipartFile } from "@fastify/multipart";

import { createPropertyVideoRepository } from "../repositories/property-media.repository";
import { uploadToStorage } from "@/lib/supabase";
import { FileValidationError, validateVideoUpload } from "@/lib/storage/file-validation";

const ALLOWED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".m4v",
]);

export async function savePropertyVideoFromMultipart(
  propertyId: string,
  file: MultipartFile,
) {
  const extension = path.extname(file.filename).toLowerCase();
  const buffer = await file.toBuffer();

  try {
    validateVideoUpload({
      mimetype: file.mimetype,
      size: buffer.length,
      filename: file.filename,
    });
  } catch (error) {
    if (error instanceof FileValidationError) {
      if (error.code === "INVALID_EXTENSION") {
        throw new Error("INVALID_VIDEO_FORMAT");
      }

      throw error;
    }

    throw error;
  }

  if (!ALLOWED_VIDEO_EXTENSIONS.has(extension)) {
    throw new Error("INVALID_VIDEO_FORMAT");
  }

  const storagePath = `videos/${propertyId}/${randomUUID()}${extension}`;

  const videoPath = await uploadToStorage(
    storagePath,
    buffer,
    file.mimetype,
  );

  return createPropertyVideoRepository({
    propertyId,
    videoUrl: videoPath,
  });
}
