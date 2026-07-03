import { apiFetch } from "../api";

// ============================================================
// MEDIA CAPABILITY TOKEN CLIENT
// ============================================================
// Browser <img>/<video> elements cannot attach an Authorization header, so
// authenticated viewers exchange their session for a short-lived, read-only
// media token (see GET /media/token). The token is appended to owner/draft
// media URLs as `?ct=` so private media renders without a bearer header.
//
// The token is cached in memory and reused until shortly before it expires.

type CachedToken = {
  token: string;
  expiresAt: number;
};

let cached: CachedToken | null = null;
let inflight: Promise<string | null> | null = null;

// Refresh a little before the real expiry to avoid racing a 403.
const SAFETY_WINDOW_MS = 30_000;

// Fallback lifetime used only if the JWT `exp` claim can't be decoded.
const FALLBACK_TTL_MS = 5 * 60_000;

function decodeExpiry(token: string): number {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return 0;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(normalized)) as { exp?: number };

    return typeof json.exp === "number" ? json.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/**
 * Returns a valid media capability token for the current session, or `null`
 * when the user is not authenticated. Safe to call frequently — it caches and
 * de-duplicates in-flight requests.
 */
export async function getMediaToken(): Promise<string | null> {
  if (!localStorage.getItem("accessToken")) {
    return null;
  }

  const now = Date.now();

  if (cached && cached.expiresAt - SAFETY_WINDOW_MS > now) {
    return cached.token;
  }

  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    try {
      const result = (await apiFetch("/media/token")) as { token?: string } | null;
      const token = result?.token;

      if (!token) {
        return null;
      }

      cached = {
        token,
        expiresAt: decodeExpiry(token) || Date.now() + FALLBACK_TTL_MS,
      };

      return token;
    } catch {
      return null;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

/** Clears the cached token (e.g. on logout). */
export function clearMediaToken(): void {
  cached = null;
}
