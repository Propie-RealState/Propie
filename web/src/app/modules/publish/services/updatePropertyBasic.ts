import { apiFetch } from "../../../../lib/api";
import type { PropertyCurrency } from "../types/property-publish.types";

export async function updatePropertyBasic(
  propertyId: string,
  input: {
    title: string;
    description: string;
    price: number;
    currency: PropertyCurrency;
    bedrooms: number;
    bathrooms: number;
    areaM2: number;
    propertyType: string;
    operationType: string;
  },
) {
  return apiFetch(`/properties/${propertyId}/basic`, {
    method: "PATCH",

    body: JSON.stringify(input),
  });
}
