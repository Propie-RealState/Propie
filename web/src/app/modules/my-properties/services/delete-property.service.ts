import { apiFetch } from "../../../../lib/api";

export async function softDeleteProperty(propertyId: string): Promise<void> {
  await apiFetch(`/properties/${propertyId}`, {
    method: "DELETE",
  });
}
