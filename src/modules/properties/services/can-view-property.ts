import {
  EXPLORE_VISIBLE_STATUSES,
  PROPERTY_STATUSES,
  type PropertyLifecycleStatus,
} from "../constants/property-status.constants";
import { canManageProperty } from "../repositories/can-manage-property.repository";
import {
  getPropertyAccessRowRepository,
  type PropertyAccessRow,
} from "../repositories/property-read.repository";

function isPubliclyVisible(property: PropertyAccessRow): boolean {
  return (
    property.published_at != null &&
    EXPLORE_VISIBLE_STATUSES.includes(
      property.status as PropertyLifecycleStatus,
    )
  );
}

/**
 * Pure visibility predicate shared by the property-detail service
 * and media authorization. Kept side-effect free apart from the
 * manage-check fallback so both callers stay consistent.
 */
export async function canViewProperty(
  property: PropertyAccessRow,
  viewerUserId?: string,
): Promise<boolean> {
  if (property.deleted_at != null) {
    return false;
  }

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

/**
 * Lightweight "can this viewer access this property?" check that
 * never loads the full property-detail graph. Used by media
 * authorization so signed-URL requests don't trigger the heavy
 * detail query.
 */
export async function canViewPropertyById(input: {
  propertyId: string;
  viewerUserId?: string;
}): Promise<boolean> {
  const property = await getPropertyAccessRowRepository(input.propertyId);

  if (!property) {
    return false;
  }

  return canViewProperty(property, input.viewerUserId);
}
