import { resolveMediaUrl } from "../api-base";

// ============================================================
// MEDIA URL RESOLUTION
// ============================================================
// `resolveMediaUrl` (in api-base) produces a public, cacheable proxy URL.
// For private/owner media (e.g. draft properties) the same URL must carry a
// capability token so a plain <img>/<video> request is authorized.

/** True when the URL points at the authenticated /media proxy. */
function isProxyMediaUrl(url: string): boolean {
  return url.includes("/media/") && !url.startsWith("data:") && !url.startsWith("blob:");
}

/** Appends a capability token to a proxy media URL. Leaves other URLs intact. */
export function appendMediaToken(
  url: string | null,
  token: string | null,
): string | null {
  if (!url || !token || !isProxyMediaUrl(url)) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}ct=${encodeURIComponent(token)}`;
}

/**
 * Resolves a storage path/URL to a ready-to-render URL, adding a capability
 * token when one is provided. Use this in owner contexts (publish wizard,
 * edit property, owner dashboards) so draft media renders correctly.
 */
export function resolveOwnerMediaUrl(
  url: string | null | undefined,
  token: string | null,
): string | null {
  return appendMediaToken(resolveMediaUrl(url), token);
}
