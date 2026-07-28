import { softDeletePropertyRepository } from "../repositories/property-write.repository";
import { getPropertyByIdRepository } from "../repositories/property-read.repository";
import {
  assertIsPropertyOwner,
  PropertyForbiddenError,
  PropertyNotFoundError,
} from "../utils/assert-property-owner";

export async function softDeletePropertyService(input: {
  propertyId: string;
  userId: string;
}): Promise<void> {
  const property = await getPropertyByIdRepository(input.propertyId);

  if (!property) {
    throw new PropertyNotFoundError();
  }

  assertIsPropertyOwner(
    {
      id: property.id,
      owner_id: property.owner_id,
      deleted_at: property.deleted_at ?? null,
    },
    input.userId,
  );

  if (property.deleted_at != null) {
    return;
  }

  const result = await softDeletePropertyRepository({
    propertyId: input.propertyId,
    deletedBy: input.userId,
  });

  if (result === "not_found") {
    throw new PropertyNotFoundError();
  }
}

export { PropertyForbiddenError, PropertyNotFoundError };
