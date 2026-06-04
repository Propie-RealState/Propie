import { resolveMediaUrl } from "../../../../lib/api-base";
import type { PropertyPin } from "../types/map.types";

type PropertyPinDto = {
  type: "property";
  id: string;
  lat: number;
  lng: number;
  price: number;
  operationType: string;
  propertyType: string;
  coverImage?: string | null;
  bedrooms?: number;
  location?: string | null;
};

export function mapPropertyPinDto(
  pin: PropertyPinDto
): PropertyPin {
  return {
    ...pin,
    coverImage: pin.coverImage
      ? resolveMediaUrl(pin.coverImage)
      : null,
    location: pin.location ?? null,
  };
}
