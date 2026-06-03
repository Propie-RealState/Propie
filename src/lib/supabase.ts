import { createClient } from "@supabase/supabase-js";

// ─── Validate env at startup ─────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? "property-images";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Upload a buffer to Supabase Storage and return the public URL.
 *
 * @param storagePath  e.g. "images/{propertyId}/{uuid}.webp"
 * @param buffer       File content
 * @param contentType  MIME type
 * @param cacheControl Cache-Control max-age in seconds (default 31536000 = 1 year).
 *                     Safe for UUID-named files (content never changes at a given URL).
 *                     Use a shorter value (e.g. '3600') for paths that may be overwritten.
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

  const { data } = supabase.storage
    .from(storageBucket)
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Delete a file from Supabase Storage given its public URL.
 * Silently skips URLs that do not belong to this Supabase project
 * (e.g. legacy "/uploads/…" relative paths stored in the DB).
 */
export async function deleteFromStorage(publicUrl: string): Promise<void> {
  if (!publicUrl.includes(SUPABASE_URL!)) {
    return;
  }

  // Extract the storage path after "/object/public/{bucket}/"
  const marker = `/object/public/${storageBucket}/`;
  const idx = publicUrl.indexOf(marker);

  if (idx === -1) {
    return;
  }

  const storagePath = publicUrl.slice(idx + marker.length);

  const { error } = await supabase.storage
    .from(storageBucket)
    .remove([storagePath]);

  if (error) {
    // Non-fatal: log and continue. A missing file should not block DB cleanup.
    console.warn(`Supabase Storage delete warning for "${storagePath}": ${error.message}`);
  }
}
