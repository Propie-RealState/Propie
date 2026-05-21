import { apiFetch } from "../../../../lib/api";

export async function updatePropertyImagesOrder(
  propertyId: string,
  imageIds: string[],
) {
  return apiFetch(`/properties/${propertyId}/images/order`, {
    method: "PATCH",
    body: JSON.stringify({ imageIds }),
  });
}
