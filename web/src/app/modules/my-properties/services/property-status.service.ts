import { apiFetch } from "../../../../lib/api";
import { trackEvent } from "../../../../lib/analytics";
import { AnalyticsEvents } from "../../../../lib/analytics-events";

import type { PropertyStatus } from "../types/my-properties.types";

export async function updatePropertyStatus(
  propertyId: string,
  status: PropertyStatus,
) {
  const result = await apiFetch(`/properties/${propertyId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  trackEvent(AnalyticsEvents.PROPERTY_UPDATED, { propertyId, status });

  return result;
}

export async function subscribePropertyActiveAgain(propertyId: string) {
  return apiFetch(`/properties/${propertyId}/status-subscriptions`, {
    method: "POST",
  });
}
