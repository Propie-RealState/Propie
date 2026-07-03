import { getDefaultSignedUrlTtlSeconds } from "@/lib/supabase";

type SignedUrlEntry = {
  url: string;
  expiresAt: number;
};

const cache = new Map<string, SignedUrlEntry>();

// Refresh signed URLs before Supabase expiry to avoid mid-render failures.
const SAFETY_WINDOW_MS = 60_000;

export type CachedSignedUrl = {
  url: string;
  /**
   * Seconds the signed URL remains usable (minus the safety window). Callers
   * MUST cap any client Cache-Control max-age to this value — caching a
   * redirect longer than its target signed URL lives yields expired-token 400s.
   */
  maxAgeSeconds: number;
};

/**
 * Reuses in-process signed URLs so repeated /media/* hits for the same object
 * do not call Supabase on every request.
 */
export async function getCachedSignedStorageUrl(
  storagePath: string,
  factory: () => Promise<string>,
): Promise<CachedSignedUrl> {
  const now = Date.now();
  const cached = cache.get(storagePath);

  if (cached && cached.expiresAt - SAFETY_WINDOW_MS > now) {
    return { url: cached.url, maxAgeSeconds: remainingSeconds(cached.expiresAt, now) };
  }

  const url = await factory();
  const ttlMs = getDefaultSignedUrlTtlSeconds() * 1000;
  const expiresAt = now + ttlMs;

  cache.set(storagePath, { url, expiresAt });

  return { url, maxAgeSeconds: remainingSeconds(expiresAt, now) };
}

function remainingSeconds(expiresAt: number, now: number): number {
  return Math.max(0, Math.floor((expiresAt - SAFETY_WINDOW_MS - now) / 1000));
}

/** Test helper — clears the in-process cache. */
export function clearSignedUrlCache(): void {
  cache.clear();
}
