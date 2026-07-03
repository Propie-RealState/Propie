import { uploadMultipart } from "../../../../lib/api";

export async function uploadPropertyVideos(
  propertyId: string,
  files: File[],
) {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  return uploadMultipart(`/properties/${propertyId}/videos`, formData);
}
