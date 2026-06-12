import { PROPERTY_STATUSES } from "../constants/property-status.constants";
import { getPropertyByIdRepository } from "../repositories/get-property-by-id.repository";
import { upsertPropertyStatusSubscriptionRepository } from "../repositories/property-status-subscriptions.repository";

type Input = {
  userId: string;
  propertyId: string;
};

export async function subscribePropertyStatusService(input: Input) {
  const property = await getPropertyByIdRepository(input.propertyId);

  if (!property) {
    throw new Error("Property not found");
  }

  if (property.status !== PROPERTY_STATUSES.PAUSED) {
    throw new Error("Property is not paused");
  }

  return upsertPropertyStatusSubscriptionRepository({
    propertyId: input.propertyId,
    userId: input.userId,
  });
}
