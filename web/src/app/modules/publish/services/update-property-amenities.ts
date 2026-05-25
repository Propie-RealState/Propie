import { apiFetch }
  from "../../../../lib/api";

export async function updatePropertyAmenities(
  propertyId: string,

  amenities: string[]
) {

  return apiFetch(
    `/properties/${propertyId}/amenities`,
    {
      method: "PATCH",

      body: JSON.stringify({
        amenities,
      }),
    }
  );
}