const DEFAULT_API_URL = import.meta.env.DEV
  ? "http://localhost:3000"
  : "https://propie-api.onrender.com";

export const API_URL =
  import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_URL}${url}`;
}
