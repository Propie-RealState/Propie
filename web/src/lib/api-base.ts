const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://propie-api.onrender.com";

export const API_URL =
  import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

const UNRESOLVABLE_MEDIA_HOSTS = new Set(["example.com", "www.example.com"]);

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith("data:")) {
    return url;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const host = new URL(url).hostname.toLowerCase();

      if (UNRESOLVABLE_MEDIA_HOSTS.has(host)) {
        return null;
      }
    } catch {
      return null;
    }

    return url;
  }

  return `${API_URL}${url}`;
}
