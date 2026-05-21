import { updatePropertyImagesOrderRepository } from "../repositories/update-property-images-order.repository";

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
  await updatePropertyImagesOrderRepository({
    propertyId,
    imageIds,
    userId,
  });
}
