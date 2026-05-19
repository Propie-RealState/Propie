import { apiFetch }
  from "../../../../lib/api";

export async function findPropertyById(
  propertyId: string
) {

  return apiFetch(
    `/properties/${propertyId}`
  );
}