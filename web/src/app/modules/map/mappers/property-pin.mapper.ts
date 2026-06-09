import { resolveMediaUrl } from "../../../../lib/api-base";
import type { PropertyPin } from "../types/map.types";
import type { PropertyCurrency } from "../../publish/types/property-publish.types";

type PropertyPinDto = {
  type: "property";
  id: string;
  lat: number;
  lng: number;
  price: number;
  currency?: string | null;
  operationType: string;
  propertyType: string;
  coverImage?: string | null;
  bedrooms?: number;
  location?: string | null;
};

function normalizeCurrency(
  currency: string | null | undefined,
): PropertyCurrency {
  return currency === "ARS" ? "ARS" : "USD";
}

export function mapPropertyPinDto(
  pin: PropertyPinDto
): PropertyPin {
  return {
    ...pin,
    currency: normalizeCurrency(pin.currency),
    coverImage: pin.coverImage
      ? resolveMediaUrl(pin.coverImage)
      : null,
    location: pin.location ?? null,
  };
}
