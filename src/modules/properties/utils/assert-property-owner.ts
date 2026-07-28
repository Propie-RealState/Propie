import { getPropertyByIdRepository } from "../repositories/property-read.repository";

export class PropertyNotFoundError extends Error {
  constructor(message = "Property not found") {
    super(message);
    this.name = "PropertyNotFoundError";
  }
}

export class PropertyForbiddenError extends Error {
  constructor(message = "Only the property owner can delete this property.") {
    super(message);
    this.name = "PropertyForbiddenError";
  }
}

export class PropertyDeletedError extends Error {
  constructor(message = "Property not found") {
    super(message);
    this.name = "PropertyDeletedError";
  }
}

type PropertyOwnerRow = {
  id: string;
  owner_id: string;
  deleted_at: string | Date | null;
};

/**
 * Owner-only check for soft delete. No admin/agent/publisher bypass.
 */
export function assertIsPropertyOwner(
  property: PropertyOwnerRow,
  userId: string,
): void {
  if (property.owner_id !== userId) {
    throw new PropertyForbiddenError();
  }
}

export async function assertPropertyNotDeleted(
  propertyId: string,
): Promise<void> {
  const property = await getPropertyByIdRepository(propertyId);

  if (!property) {
    throw new PropertyNotFoundError();
  }

  if (property.deleted_at != null) {
    throw new PropertyDeletedError();
  }
}
