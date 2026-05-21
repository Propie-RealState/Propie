import type { PropertyPublishData }
  from "../../publish/types/property-publish.types";

export function mapPropertyToPublishData(
  property: any
): Partial<PropertyPublishData> {
  return {
    propertyId: property.id,

    propertyType: property.propertyType,
    listingType: property.listingType,

    title: property.title || "",
    description: property.description || "",

    bedrooms: property.bedrooms || null,
    bathrooms: property.bathrooms || null,
    areaM2: property.areaM2 || null,

    price: property.price || null,

    country: property.country || "",
    province: property.province || "",
    city: property.city || "",
    neighborhood: property.neighborhood || "",
    address: property.address || "",

    amenities: property.amenities || [],

    commercializationType:
      property.commercializationType || "",

    images:
      property.images?.map(
        (image: any) => image.imageUrl
      ) || [],
  };
}