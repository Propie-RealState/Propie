import { apiFetch } from "../../../../lib/api";

export type MediaOrderItem = {
  id: string;
  type: "image" | "video";
};

export async function updatePropertyMediaOrder(
  propertyId: string,
  media: MediaOrderItem[],
) {
  return apiFetch(`/properties/${propertyId}/media/order`, {
    method: "PATCH",
    body: JSON.stringify({ media }),
  });
}
