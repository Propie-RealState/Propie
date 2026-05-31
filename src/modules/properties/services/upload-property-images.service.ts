import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream/promises";

import type { MultipartFile } from "@fastify/multipart";

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

function getSupabaseStorageConfig() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;

  if (!url || !serviceRoleKey || !bucket) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    serviceRoleKey,
    bucket,
  };
}

async function streamToBuffer(file: MultipartFile) {
  const chunks: Buffer[] = [];

  for await (const chunk of file.file) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

export async function savePropertyImageFromMultipart(
  propertyId: string,
  file: MultipartFile,
) {
  const extension = path.extname(file.filename).toLowerCase();

  if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
    throw new Error("INVALID_IMAGE_FORMAT");
  }

  const filename = `${randomUUID()}${extension}`;
  const storagePath = `properties/${propertyId}/${filename}`;
  const supabaseConfig = getSupabaseStorageConfig();

  if (supabaseConfig) {
    const body = await streamToBuffer(file);
    const uploadUrl =
      `${supabaseConfig.url}/storage/v1/object/${supabaseConfig.bucket}/${storagePath}`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${supabaseConfig.serviceRoleKey}`,
        "Content-Type": file.mimetype,
        "x-upsert": "false",
      },
      body,
    });

    if (!response.ok) {
      const message = await response.text();

      throw new Error(`SUPABASE_STORAGE_UPLOAD_FAILED: ${message}`);
    }

    return `${supabaseConfig.url}/storage/v1/object/public/${supabaseConfig.bucket}/${storagePath}`;
  }

  const uploadsPath = path.join(process.cwd(), "uploads");
  const filepath = path.join(uploadsPath, filename);

  await fs.promises.mkdir(uploadsPath, {
    recursive: true,
  });

  await pipeline(file.file, fs.createWriteStream(filepath));

  return `/uploads/${filename}`;
}
