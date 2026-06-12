import {
  PROPERTY_EVENT_TYPES,
  PROPERTY_STATUSES,
  type PropertyLifecycleStatus,
} from "../constants/property-status.constants";
import { insertPropertyEventRepository } from "../repositories/property-events.repository";
import { getPropertyByIdRepository } from "../repositories/get-property-by-id.repository";
import { updatePropertyStatusRepository } from "../repositories/update-property-status.repository";
import { assertIsPublisher } from "../utils/assert-is-publisher";
import { notifyPropertyActiveAgain } from "@/modules/notifications/services/notification-dispatch.service";

type Input = {
  userId: string;
  propertyId: string;
  status: PropertyLifecycleStatus;
};

export async function updatePropertyStatusService(input: Input) {
  const property = await getPropertyByIdRepository(input.propertyId);

  if (!property) {
    throw new Error("Property not found");
  }

  if (!property.published_at) {
    throw new Error("Property is not published");
  }

  await assertIsPublisher(input.userId, input.propertyId);

  const previousStatus = property.status as PropertyLifecycleStatus;

  if (previousStatus === input.status) {
    return property;
  }

  const updated = await updatePropertyStatusRepository({
    propertyId: input.propertyId,
    status: input.status,
  });

  await insertPropertyEventRepository({
    propertyId: input.propertyId,
    actorId: input.userId,
    eventType: PROPERTY_EVENT_TYPES.STATUS_CHANGED,
    payload: {
      from: previousStatus,
      to: input.status,
    },
  });

  if (
    previousStatus === PROPERTY_STATUSES.PAUSED &&
    input.status === PROPERTY_STATUSES.ACTIVE
  ) {
    try {
      await notifyPropertyActiveAgain(input.propertyId);
    } catch (error) {
      console.error("Failed to notify property active again", error);
    }
  }

  return updated;
}
