import { uploadMultipart } from "../../../../lib/api";

export async function uploadPropertyImages(
  propertyId: string,
  files: File[],
) {
  const formData = new FormData();

  for (const file of files) {
    formData.append("files", file);
  }

  return uploadMultipart(`/properties/${propertyId}/images`, formData);
}
