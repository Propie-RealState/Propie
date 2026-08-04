import { findPropertyById } from "../../publish/services/find-property-by-id";
import type { PropertyPublishData } from "../../publish/types/property-publish.types";
import { mapApiPropertyToPublishData } from "./map-property-to-publish-data";

/**
 * Shared edit-wizard hydration payload used by PropertyDetails and /editar.
 * Callers own reset / updateData / navigate ordering.
 */
export async function fetchEditPublishWizardData(
  propertyId: string,
): Promise<Partial<PropertyPublishData> & { publishMode: "edit" }> {
  const property = await findPropertyById(propertyId);

  return {
    ...mapApiPropertyToPublishData(property),
    publishMode: "edit",
  };
}
