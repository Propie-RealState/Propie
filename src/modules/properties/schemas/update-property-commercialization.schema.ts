import { z } from "zod";

export const updatePropertyCommercializationSchema =
  z.object({
    commercializationType:
      z.enum([
        "AGENTS",
        "AGENCIES",
        "BOTH",
        "DIRECT",
      ]),

    manualApproval:
      z.boolean(),

    allowChat:
      z.boolean(),

    sharedCalendar:
      z.boolean(),
  });

export type UpdatePropertyCommercializationInput =
  z.infer<
    typeof updatePropertyCommercializationSchema
  >;