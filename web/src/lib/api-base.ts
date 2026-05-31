export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export function resolveMediaUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_URL}${url}`;
}
