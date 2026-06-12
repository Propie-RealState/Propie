import { getPropertyByIdRepository } from "../repositories/get-property-by-id.repository";

export async function assertIsPublisher(
  userId: string,
  propertyId: string,
): Promise<void> {
  const property = await getPropertyByIdRepository(propertyId);

  if (!property) {
    throw new Error("Property not found");
  }

  if (property.publisher_id !== userId) {
    throw new Error("FORBIDDEN");
  }
}

export function isPublisher(
  userId: string | undefined,
  publisherId: string | null | undefined,
): boolean {
  return Boolean(userId && publisherId && userId === publisherId);
}
