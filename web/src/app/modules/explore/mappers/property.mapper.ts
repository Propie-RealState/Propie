import type { PropertyDTO } from "../types/property.dto";
import type { Property } from "../types/property.types";
import type { PropertyCurrency } from "../../publish/types/property-publish.types";
import { resolveMediaUrl } from "../../../../lib/api-base";

function normalizeCurrency(
  currency: string | null | undefined,
): PropertyCurrency {
  return currency === "ARS" ? "ARS" : "USD";
}

export function mapPropertyDtoToProperty(
  property: PropertyDTO
): Property {
  return {
    id: property.id,

    title: property.title,

    location: [
      property.city,
      property.province,
    ]
      .filter(Boolean)
      .join(", "),

    price: property.price,

    currency: normalizeCurrency(property.currency),

    propertyType: property.property_type,

    operationType: property.operation_type,

    coverImage: property.cover_image
      ? resolveMediaUrl(property.cover_image)
      : null,

    rooms: property.bedrooms || 0,

    bathrooms: property.bathrooms || 0,

    sqm: property.area_m2 || 0,
  };
}
