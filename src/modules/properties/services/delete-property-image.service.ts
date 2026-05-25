import { deletePropertyImageRepository } from "../repositories/delete-property-image.repository";
import { assertCanManageProperty } from "../utils/assert-can-manage-property";

interface DeletePropertyImageServiceRequest {
  imageId: string;
  propertyId: string;
  userId: string;
}

export async function deletePropertyImageService({
  imageId,
  propertyId,
  userId,
}: DeletePropertyImageServiceRequest) {
  await assertCanManageProperty(userId, propertyId);

  await deletePropertyImageRepository({
    imageId,
    propertyId,
  });
}