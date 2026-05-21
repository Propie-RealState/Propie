import { apiFetch } from "../../../../lib/api";

export async function deletePropertyImage(
  propertyId: string,
  imageId: string,
) {
  return apiFetch(`/properties/${propertyId}/images/${imageId}`, {
    method: "DELETE",
  });
}
