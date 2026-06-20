import { apiFetch } from "../../../../lib/api";

type Input = {
  propertyId: string;
  commercializationType: "AGENTS" | "DIRECT";
};

export async function savePropertyCommercialization(input: Input) {
  return apiFetch(`/properties/${input.propertyId}/commercialization`, {
    method: "PATCH",
    body: JSON.stringify({
      commercializationType: input.commercializationType,
    }),
  });
}
