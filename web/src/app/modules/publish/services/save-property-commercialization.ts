import { apiFetch }
  from "../../../../lib/api";

type Input = {
  propertyId: string;

  commercializationType:
    | "AGENTS"
    | "AGENCIES"
    | "BOTH"
    | "DIRECT";

  manualApproval: boolean;

  allowChat: boolean;

  sharedCalendar: boolean;
};

export async function savePropertyCommercialization(
  input: Input
) {

  return apiFetch(
    `/properties/${input.propertyId}/commercialization`,
    {
      method: "PATCH",

      body: JSON.stringify({
        commercializationType:
          input.commercializationType,

        manualApproval:
          input.manualApproval,

        allowChat:
          input.allowChat,

        sharedCalendar:
          input.sharedCalendar,
      }),
    }
  );
}