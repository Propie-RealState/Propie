import { findPropertyByIdRepository } from "../repositories/property-read.repository";
import { canViewProperty } from "./can-view-property";

type Input = {
  propertyId: string;
  viewerUserId?: string;
};

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
      deleted_at: property.deleted_at ?? null,
    },
    input.viewerUserId,
  );

  if (!allowed) {
    return null;
  }

  return property;
}
