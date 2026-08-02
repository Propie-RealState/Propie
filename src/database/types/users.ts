import type { UserRole } from "./roles";

export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

/** Domain user shape returned by the user repository (not an HTTP contract). */
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};
