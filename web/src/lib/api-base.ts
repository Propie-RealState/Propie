const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://propie-api.onrender.com";

export const API_URL =
  import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

const UNRESOLVABLE_MEDIA_HOSTS = new Set(["example.com", "www.example.com"]);

const STORAGE_PATH_PATTERN =
  /^(avatars|images|videos)\/[a-zA-Z0-9/_\-.]+$/;

function extractSupabaseStoragePath(url: string): string | null {
  const match = url.match(/\/object\/public\/[^/]+\/(.+?)(?:\?|$)/);

  if (!match?.[1]) {
    return null;
  }

  return decodeURIComponent(match[1]);
}

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith("data:")) {
    return url;
  }

  if (url.startsWith("/media/")) {
    return `${API_URL}${url}`;
  }

  if (STORAGE_PATH_PATTERN.test(url)) {
    return `${API_URL}/media/${url}`;
  }

  if (url.startsWith("/uploads/")) {
    const legacyPath = url.replace(/^\/uploads\//, "");
    return `${API_URL}/media/legacy/${legacyPath}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const host = new URL(url).hostname.toLowerCase();

      if (UNRESOLVABLE_MEDIA_HOSTS.has(host)) {
        return null;
      }

      const storagePath = extractSupabaseStoragePath(url);

      if (storagePath) {
        return `${API_URL}/media/${storagePath}`;
      }
    } catch {
      return null;
    }

    return url;
  }

  return `${API_URL}${url}`;
}
