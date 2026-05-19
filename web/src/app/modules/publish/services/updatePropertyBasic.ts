import { apiFetch } from "../../../../lib/api";

export async function updatePropertyBasic(
  propertyId: string,
  input: {
    title: string;
    description: string;
    price: number;
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
