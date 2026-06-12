import {
  EXPLORE_VISIBLE_STATUSES,
  PROPERTY_STATUSES,
  type PropertyLifecycleStatus,
} from "../constants/property-status.constants";
import { canManageProperty } from "../repositories/can-manage-property.repository";
import { findPropertyByIdRepository } from "../repositories/property-read.repository";

type Input = {
  propertyId: string;
  viewerUserId?: string;
};

type PropertyViewRow = {
  id: string;
  status: string;
  owner_id: string;
  publisher_id: string | null;
  published_at: string | null;
};

function isPubliclyVisible(property: PropertyViewRow): boolean {
  return (
    property.published_at != null &&
    EXPLORE_VISIBLE_STATUSES.includes(
      property.status as PropertyLifecycleStatus,
    )
  );
}

async function canViewProperty(
  property: PropertyViewRow,
  viewerUserId?: string,
): Promise<boolean> {
  if (property.status === PROPERTY_STATUSES.FINALIZED) {
    if (!viewerUserId) {
      return false;
    }

    return (
      property.owner_id === viewerUserId ||
      property.publisher_id === viewerUserId
    );
  }

  if (isPubliclyVisible(property)) {
    return true;
  }

  if (!viewerUserId) {
    return false;
  }

  return canManageProperty(viewerUserId, property.id);
}

export async function findPropertyByIdService(input: Input) {
  const property = await findPropertyByIdRepository(input.propertyId);

  if (!property) {
    return null;
  }

  const allowed = await canViewProperty(
    {
      id: property.id,
      status: property.status,
      owner_id: property.owner_id,
      publisher_id: property.publisher_id,
      published_at: property.published_at,
    },
    input.viewerUserId,
  );

  if (!allowed) {
    return null;
  }

  return property;
}
