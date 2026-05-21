import path from "node:path";
import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";

import type { MultipartFile } from "@fastify/multipart";

import { db } from "@/database/client";
import { createPropertyVideoRepository } from "../repositories/create-property-video.repository";

const ALLOWED_VIDEO_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".m4v",
]);

export async function assertPropertyOwner(
  propertyId: string,
  userId: string,
) {
  const ownerCheck = await db.query(
    `
      SELECT id
      FROM properties
      WHERE id = $1
        AND owner_id = $2
    `,
    [propertyId, userId],
  );

  if (ownerCheck.rows.length === 0) {
    throw new Error("FORBIDDEN");
  }
}

export async function savePropertyVideoFromMultipart(
  propertyId: string,
  file: MultipartFile,
) {
  const extension = path.extname(file.filename).toLowerCase();

  if (!ALLOWED_VIDEO_EXTENSIONS.has(extension)) {
    throw new Error("INVALID_VIDEO_FORMAT");
  }

  const fileName = `${randomUUID()}${extension}`;
  const uploadPath = path.resolve("uploads", fileName);

  await pipeline(file.file, fs.createWriteStream(uploadPath));

  return createPropertyVideoRepository({
    propertyId,
    videoUrl: `/uploads/${fileName}`,
  });
}
