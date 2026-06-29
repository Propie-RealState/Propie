import { createClient } from "@supabase/supabase-js";

import { parseStorageReference } from "@/lib/storage/storage-reference";

// ─── Validate env at startup ─────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "property-images";

const DEFAULT_SIGNED_URL_TTL_SECONDS = Number(
  process.env.STORAGE_SIGNED_URL_TTL_SECONDS ?? 3600,
);

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.",
  );
}

// ─── Client ──────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const storageBucket = SUPABASE_STORAGE_BUCKET;

export function getDefaultSignedUrlTtlSeconds(): number {
  return DEFAULT_SIGNED_URL_TTL_SECONDS;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Upload a buffer to Supabase Storage and return the bucket-relative path.
 * Bucket must be private; clients access files through /media/* after authorization.
 */
export async function uploadToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
  cacheControl = "31536000",
): Promise<string> {
  const { error } = await supabase.storage
    .from(storageBucket)
    .upload(storagePath, buffer, {
      contentType,
      cacheControl,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`);
  }

  return storagePath;
}

export async function createSignedStorageUrl(
  storagePath: string,
  expiresInSeconds = DEFAULT_SIGNED_URL_TTL_SECONDS,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(storageBucket)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(
      `Supabase Storage signed URL failed: ${error?.message ?? "missing signedUrl"}`,
    );
  }

  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage given a storage path or legacy public URL.
 */
export async function deleteFromStorage(reference: string): Promise<void> {
  const storagePath = parseStorageReference(reference);

  if (!storagePath || storagePath.startsWith("legacy/")) {
    return;
  }

  const { error } = await supabase.storage
    .from(storageBucket)
    .remove([storagePath]);

  if (error) {
    console.warn(
      `Supabase Storage delete warning for "${storagePath}": ${error.message}`,
    );
  }
}
