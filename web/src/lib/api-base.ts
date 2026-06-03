const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://propie-api.onrender.com";

export const API_URL =
  import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  // Absolute URLs (Supabase, external CDN) and data URIs pass through as-is.
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  return `${API_URL}${url}`;
}
