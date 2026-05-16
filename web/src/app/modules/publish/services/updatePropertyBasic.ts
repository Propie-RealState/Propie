import { apiFetch }
  from "../../../../lib/api";

export async function updatePropertyBasic(
  propertyId: string,
  input: {
    title: string;
    description: string;
    price: number;
  }
) {
  return apiFetch(
    `/properties/${propertyId}/basic`,
    {
      method: "PATCH",

      body: JSON.stringify(
        input
      ),
    }
  );
}