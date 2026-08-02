import { z } from "zod";

import { PROPERTY_STATUSES } from "../constants/property-status.constants";

export const PropertyStatusSchema = z.enum([
  PROPERTY_STATUSES.ACTIVE,
  PROPERTY_STATUSES.PAUSED,
  PROPERTY_STATUSES.RESERVED,
  PROPERTY_STATUSES.FINALIZED,
]);

export const UpdatePropertyStatusSchema = z.object({
  status: PropertyStatusSchema,
});

export type UpdatePropertyStatusInput = z.infer<
  typeof UpdatePropertyStatusSchema
>;
