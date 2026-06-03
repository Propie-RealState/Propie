import { API_URL } from "../../../../lib/api-base";

/**
 * Upload an avatar file to the backend via multipart.
 * The backend processes it with sharp (256×256 WebP) and stores it in Supabase.
 * Returns the new public URL stored in profiles.avatar_url.
 */
export async function uploadAvatar(file: File): Promise<string> {
  const accessToken = localStorage.getItem("accessToken");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_URL}/profile/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data.avatarUrl as string;
}
