import { apiFetch } from "../../../../lib/api";

import type { PropertyStatus } from "../types/my-properties.types";

export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatus,
) {
  return apiFetch(`/properties/${propertyId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function subscribePropertyActiveAgain(propertyId: string) {
  return apiFetch(`/properties/${propertyId}/status-subscriptions`, {
    method: "POST",
  });
}
