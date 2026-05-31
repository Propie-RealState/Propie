import { API_URL } from "../../../../lib/api-base";

export async function uploadPropertyVideos(
  propertyId: string,
  files: File[],
) {
  const accessToken = localStorage.getItem("accessToken");

  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  const response = await fetch(
    `${API_URL}/properties/${propertyId}/videos`,
    {
      method: "POST",
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}
