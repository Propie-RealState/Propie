import { apiFetch }
from "../../../../lib/api";

export async function createProperty(
  input: {
    propertyType: string;

    listingType: string;
  }
) {

  return apiFetch(
    "/properties",
    {
      method: "POST",

      body: JSON.stringify(
        input
      ),
    }
  );
}