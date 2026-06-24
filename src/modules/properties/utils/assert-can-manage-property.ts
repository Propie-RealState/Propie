import { canManageProperty } from "../repositories/can-manage-property.repository";
import { findUserById } from "@/database/repositories/user.repository";
import { isAdmin } from "@/utils/authorization";

export async function assertCanManageProperty(
  userId: string,
  propertyId: string,
): Promise<void> {
  const user = await findUserById(userId);

  if (user && isAdmin(user.role)) {
    return;
  }

  const allowed = await canManageProperty(userId, propertyId);

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }
}
