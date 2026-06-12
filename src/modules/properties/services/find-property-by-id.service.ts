import { PROPERTY_STATUSES } from "../constants/property-status.constants";
import { findPropertyByIdRepository } from "../repositories/find-property-by-id.repository";

type Input = {
  propertyId: string;
  viewerUserId?: string;
};

function canViewProperty(
  property: {
    status: string;
    owner_id: string;
    publisher_id: string | null;
  },
  viewerUserId?: string,
): boolean {
  if (property.status !== PROPERTY_STATUSES.FINALIZED) {
    return true;
  }

  if (!viewerUserId) {
    return false;
  }

  return (
    property.owner_id === viewerUserId ||
    property.publisher_id === viewerUserId
  );
}

export async function findPropertyByIdService(input: Input) {
  const property = await findPropertyByIdRepository(input.propertyId);

  if (!property) {
    return null;
  }

  if (!canViewProperty(property, input.viewerUserId)) {
    return null;
  }

  return property;
}