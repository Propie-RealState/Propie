import { apiFetch } from "../../../../lib/api";

export async function deletePropertyVideo(
  propertyId: string,
  videoId: string,
) {
  return apiFetch(`/properties/${propertyId}/videos/${videoId}`, {
    method: "DELETE",
  });
}
