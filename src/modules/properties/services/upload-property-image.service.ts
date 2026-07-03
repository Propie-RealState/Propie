import { randomUUID } from "node:crypto";

import { hashFileContent } from "@/lib/storage/content-hash";
import { FileValidationError, validateImageUpload } from "@/lib/storage/file-validation";
import { StorageUploadTracker } from "@/lib/storage/storage-upload-tracker";
import { uploadToStorage } from "@/lib/supabase";
import {
  createPropertyImageRepository,
  findPropertyImageByContentHashRepository,
} from "../repositories/property-media.repository";
import { processPropertyImage } from "./process-property-image.service";

type UploadPropertyImageInput = {
  propertyId: string;
  rawBuffer: Buffer;
  mimetype: string;
  filename: string;
  isCover: boolean;
};

/**
 * Uploads a single property image with per-file atomicity:
 * - idempotent on content hash (safe client retries)
 * - storage rollback if DB insert fails
 */
export async function uploadPropertyImageService(
  input: UploadPropertyImageInput,
) {
  try {
    validateImageUpload({
      mimetype: input.mimetype,
      size: input.rawBuffer.length,
      filename: input.filename,
    });
  } catch (error) {
    if (error instanceof FileValidationError) {
      throw error;
    }

    throw error;
  }

  const contentHash = hashFileContent(input.rawBuffer);
  const existing = await findPropertyImageByContentHashRepository(
    input.propertyId,
    contentHash,
  );

  if (existing) {
    return existing;
  }

  const tracker = new StorageUploadTracker();

  try {
    const { fullBuffer, thumbBuffer } = await processPropertyImage(
      input.rawBuffer,
    );

    const uuid = randomUUID();
    const fullPath = `images/${input.propertyId}/${uuid}.webp`;
    const thumbPath = `images/${input.propertyId}/${uuid}_thumb.webp`;

    await uploadToStorage(fullPath, fullBuffer, "image/webp");
    tracker.track(fullPath);

    await uploadToStorage(thumbPath, thumbBuffer, "image/webp");
    tracker.track(thumbPath);

    const image = await createPropertyImageRepository({
      propertyId: input.propertyId,
      imageUrl: fullPath,
      thumbUrl: thumbPath,
      isCover: input.isCover,
      contentHash,
    });

    tracker.release();

    return image;
  } catch (error) {
    await tracker.rollback();
    throw error;
  }
}
