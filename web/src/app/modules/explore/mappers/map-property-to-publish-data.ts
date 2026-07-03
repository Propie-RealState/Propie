import type { PropertyPublishData } from "../../publish/types/property-publish.types";

/** Raw property payload from GET /properties/:id (snake_case). */
export type ApiPropertyPayload = {
  id: string;
  property_type?: string;
  operation_type?: string;
  title?: string | null;
  description?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area_m2?: number | null;
  price?: number | null;
  currency?: string | null;
  country?: string | null;
  province?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  address?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
};

export function mapApiPropertyToPublishData(
  property: ApiPropertyPayload,
): Partial<PropertyPublishData> {
  return {
    propertyId: property.id,
    propertyType: property.property_type as PropertyPublishData["propertyType"],
    listingType: property.operation_type as PropertyPublishData["listingType"],
    title: property.title || "",
    description: property.description || "",
    bedrooms: property.bedrooms ?? null,
    bathrooms: property.bathrooms ?? null,
    areaM2: property.area_m2 ?? null,
    price: property.price ?? null,
    currency: property.currency === "ARS" ? "ARS" : "USD",
    country: property.country || "",
    province: property.province || "",
    city: property.city || "",
    neighborhood: property.neighborhood || "",
    address: property.address || "",
    lat:
      property.latitude !== undefined && property.latitude !== null
        ? Number(property.latitude)
        : null,
    lng:
      property.longitude !== undefined && property.longitude !== null
        ? Number(property.longitude)
        : null,
    // Media is always loaded in PublishStep2 from the API — never from context.
    images: [],
  };
}
