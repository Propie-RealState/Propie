import type { UserRoleCode } from "@/constants/roles";

// ========================================================
// JWT PAYLOAD (persistence / token shape — not an HTTP schema)
// ========================================================

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRoleCode;
  iat: number;
  exp: number;
};
