import { apiFetch }
  from "../../../../lib/api";

export async function publishProperty(
  propertyId: string
) {

    return apiFetch(
        `/properties/${propertyId}/publish`,
        {
          method: "PATCH",
      
          body: JSON.stringify({}),
        }
      );
}