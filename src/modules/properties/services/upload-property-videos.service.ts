import { randomUUID } from "node:crypto";
import path from "node:path";

import type { MultipartFile } from "@fastify/multipart";

import { hashFileContent } from "@/lib/storage/content-hash";
import { FileValidationError, validateVideoUpload } from "@/lib/storage/file-validation";
import { StorageUploadTracker } from "@/lib/storage/storage-upload-tracker";
import { uploadToStorage } from "@/lib/supabase";
import {
  createPropertyVideoRepository,
  findPropertyVideoByContentHashRepository,
} from "../repositories/property-media.repository";

const ALLOWED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".m4v",
]);

/**
 * Uploads a single property video with per-file atomicity and idempotency.
 */
export async function uploadPropertyVideoService(
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

  const contentHash = hashFileContent(buffer);
  const existing = await findPropertyVideoByContentHashRepository(
    propertyId,
    contentHash,
  );

  if (existing) {
    return existing;
  }

  const storagePath = `videos/${propertyId}/${randomUUID()}${extension}`;
  const tracker = new StorageUploadTracker();

  try {
    const videoPath = await uploadToStorage(
      storagePath,
      buffer,
      file.mimetype,
    );

    tracker.track(videoPath);

    const video = await createPropertyVideoRepository({
      propertyId,
      videoUrl: videoPath,
      contentHash,
    });

    tracker.release();

    return video;
  } catch (error) {
    await tracker.rollback();
    throw error;
  }
}
