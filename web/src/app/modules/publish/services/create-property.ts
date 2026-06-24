import { apiFetch }
from "../../../../lib/api";
import { trackEvent } from "../../../../lib/analytics";
import { AnalyticsEvents } from "../../../../lib/analytics-events";

export async function createProperty(
  input: {
    propertyType: string;

    listingType: string;
  }
) {

  const result = await apiFetch(
    "/properties",
    {
      method: "POST",

      body: JSON.stringify(
        input
      ),
    }
  );

  if (result?.propertyId) {
    trackEvent(AnalyticsEvents.PROPERTY_CREATED, {
      propertyId: result.propertyId,
      propertyType: input.propertyType,
    });
  }

  return result;
}