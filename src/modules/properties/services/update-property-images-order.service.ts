import { updatePropertyImagesOrderRepository } from "../repositories/property-media.repository";
import { assertCanManageProperty } from "../utils/assert-can-manage-property";

interface UpdatePropertyImagesOrderServiceRequest {
  propertyId: string;
  imageIds: string[];
  userId: string;
}

export async function updatePropertyImagesOrderService({
  propertyId,
  imageIds,
  userId,
}: UpdatePropertyImagesOrderServiceRequest) {
  await assertCanManageProperty(userId, propertyId);

  await updatePropertyImagesOrderRepository({
    propertyId,
    imageIds,
  });
}
