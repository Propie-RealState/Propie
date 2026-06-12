import { randomUUID } from "node:crypto";
import path from "node:path";

import type { MultipartFile } from "@fastify/multipart";

import { createPropertyVideoRepository } from "../repositories/property-media.repository";
import { uploadToStorage } from "@/lib/supabase";

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

  if (!ALLOWED_VIDEO_EXTENSIONS.has(extension)) {
    throw new Error("INVALID_VIDEO_FORMAT");
  }

  const storagePath = `videos/${propertyId}/${randomUUID()}${extension}`;

  const buffer = await file.toBuffer();

  const videoUrl = await uploadToStorage(
    storagePath,
    buffer,
    file.mimetype,
  );

  return createPropertyVideoRepository({
    propertyId,
    videoUrl,
  });
}
