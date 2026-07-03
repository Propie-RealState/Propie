import { getDefaultSignedUrlTtlSeconds } from "@/lib/supabase";

type SignedUrlEntry = {
  url: string;
  expiresAt: number;
};

const cache = new Map<string, SignedUrlEntry>();

// Refresh signed URLs before Supabase expiry to avoid mid-render failures.
const SAFETY_WINDOW_MS = 60_000;

/**
 * Reuses in-process signed URLs so repeated /media/* hits for the same object
 * do not call Supabase on every request.
 */
export async function getCachedSignedStorageUrl(
  storagePath: string,
  factory: () => Promise<string>,
): Promise<string> {
  const now = Date.now();
  const cached = cache.get(storagePath);

  if (cached && cached.expiresAt - SAFETY_WINDOW_MS > now) {
    return cached.url;
  }

  const url = await factory();
  const ttlMs = getDefaultSignedUrlTtlSeconds() * 1000;

  cache.set(storagePath, {
    url,
    expiresAt: now + ttlMs,
  });

  return url;
}

/** Test helper — clears the in-process cache. */
export function clearSignedUrlCache(): void {
  cache.clear();
}
