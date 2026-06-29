const STORAGE_BUCKET =
  process.env.SUPABASE_STORAGE_BUCKET ?? "property-images";

const STORAGE_PATH_PATTERN =
  /^(avatars|images|videos)\/[a-zA-Z0-9/_\-.]+$/;

const LEGACY_PATH_PATTERN =
  /^legacy\/[a-zA-Z0-9/_\-.]+$/;

export function isStoragePath(value: string): boolean {
  return STORAGE_PATH_PATTERN.test(value);
}

export function isMediaStoragePath(value: string): boolean {
  return isStoragePath(value) || LEGACY_PATH_PATTERN.test(value);
}

/**
 * Normalize a DB value (storage path or legacy public URL) to a bucket-relative path.
 */
export function parseStorageReference(
  reference: string,
): string | null {
  const trimmed = reference.trim();

  if (!trimmed) {
    return null;
  }

  if (isStoragePath(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/uploads/")) {
    return trimmed.replace(/^\/uploads\//, "legacy/");
  }

  const publicMarker = `/object/public/${STORAGE_BUCKET}/`;

  if (trimmed.includes(publicMarker)) {
    const idx = trimmed.indexOf(publicMarker);
    return decodeURIComponent(trimmed.slice(idx + publicMarker.length));
  }

  const signedMarker = `/object/sign/${STORAGE_BUCKET}/`;

  if (trimmed.includes(signedMarker)) {
    const idx = trimmed.indexOf(signedMarker);
    const remainder = trimmed.slice(idx + signedMarker.length);
    return decodeURIComponent(remainder.split("?")[0] ?? "");
  }

  return null;
}

export function toMediaAccessPath(reference: string): string | null {
  const storagePath = parseStorageReference(reference);

  if (!storagePath) {
    return null;
  }

  return `/media/${storagePath}`;
}
