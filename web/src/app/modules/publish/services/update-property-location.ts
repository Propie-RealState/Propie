import { apiFetch } from "../../../../lib/api";

type UpdatePropertyLocationInput = {
  country: string;
  province: string;
  city: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
};

export async function updatePropertyLocation(
  propertyId: string,
  input: UpdatePropertyLocationInput
) {
  return apiFetch(
    `/properties/${propertyId}/location`,
    {
      method:
        "PATCH",
      body:
        JSON.stringify(input),
    },
  );
}
