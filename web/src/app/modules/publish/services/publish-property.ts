import { apiFetch }
  from "../../../../lib/api";
import { trackEvent } from "../../../../lib/analytics";
import { AnalyticsEvents } from "../../../../lib/analytics-events";

export async function publishProperty(
  propertyId: string
) {

    const result = await apiFetch(
        `/properties/${propertyId}/publish`,
        {
          method: "PATCH",
      
          body: JSON.stringify({}),
        }
      );

    trackEvent(AnalyticsEvents.PROPERTY_PUBLISHED, { propertyId });

    return result;
}