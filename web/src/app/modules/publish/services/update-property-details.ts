import { apiFetch }
from "../../../../lib/api";

interface Input {
  title: string;
  description: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
}

export async function updatePropertyDetails(
  propertyId: string,
  input: Input
) {

  return apiFetch(
    `/properties/${propertyId}/details`,
    {
      method: "PATCH",

      body: JSON.stringify(
        input
      ),
    }
  );
}