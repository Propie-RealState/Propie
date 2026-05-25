import { canManageProperty } from "../repositories/can-manage-property.repository";

export async function assertCanManageProperty(
  userId: string,
  propertyId: string,
): Promise<void> {
  const allowed = await canManageProperty(userId, propertyId);

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }
}
