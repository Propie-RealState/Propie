const API_URL =
  "http://localhost:3000";

export async function uploadPropertyImages(
  propertyId: string,
  files: File[]
) {

  const accessToken =
    localStorage.getItem(
      "accessToken"
    );

  const formData =
    new FormData();

  for (const file of files) {

    formData.append(
      "files",
      file
    );
  }

  const response =
    await fetch(
      `${API_URL}/properties/${propertyId}/images`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },

        body: formData,
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
    throw data;
  }

  return data;
}