import { canManageProperty } from "../repositories/can-manage-property.repository";
import { findUserById } from "@/database/repositories/user.repository";
import { isAdmin } from "@/utils/authorization";
import {
  assertPropertyNotDeleted,
  PropertyDeletedError,
  PropertyNotFoundError,
} from "./assert-property-owner";

export async function assertCanManageProperty(
  userId: string,
  propertyId: string,
): Promise<void> {
  try {
    await assertPropertyNotDeleted(propertyId);
  } catch (error) {
    if (
      error instanceof PropertyNotFoundError
      || error instanceof PropertyDeletedError
    ) {
      throw new Error("PROPERTY_NOT_FOUND");
    }
    throw error;
  }

  const user = await findUserById(userId);

  if (user && isAdmin(user.role)) {
    return;
  }

  const allowed = await canManageProperty(userId, propertyId);

  if (!allowed) {
    throw new Error("FORBIDDEN");
  }
}
