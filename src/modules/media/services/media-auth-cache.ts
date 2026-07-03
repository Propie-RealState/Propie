type AuthCacheEntry = {
  allowed: boolean;
  expiresAt: number;
};

const cache = new Map<string, AuthCacheEntry>();

const AUTH_CACHE_TTL_MS = 60_000;

function cacheKey(
  storagePath: string,
  viewerUserId?: string,
  viewerRole?: string,
): string {
  return `${storagePath}:${viewerUserId ?? ""}:${viewerRole ?? ""}`;
}

export function getCachedMediaAuth(
  storagePath: string,
  viewerUserId?: string,
  viewerRole?: string,
): boolean | undefined {
  const key = cacheKey(storagePath, viewerUserId, viewerRole);
  const entry = cache.get(key);
  const now = Date.now();

  if (!entry || entry.expiresAt <= now) {
    if (entry) {
      cache.delete(key);
    }

    return undefined;
  }

  return entry.allowed;
}

export function setCachedMediaAuth(
  storagePath: string,
  allowed: boolean,
  viewerUserId?: string,
  viewerRole?: string,
): void {
  cache.set(cacheKey(storagePath, viewerUserId, viewerRole), {
    allowed,
    expiresAt: Date.now() + AUTH_CACHE_TTL_MS,
  });
}

/** Test helper — clears the in-process cache. */
export function clearMediaAuthCache(): void {
  cache.clear();
}
