import { z } from "zod";

import { USER_ROLES } from "@/constants/roles";

/** Public registration — ADMIN must never be accepted via API. */
export const RegisterableUserRoleSchema = z.enum([
  USER_ROLES.OWNER,
  USER_ROLES.AGENT,
  USER_ROLES.CLIENT,
]);
