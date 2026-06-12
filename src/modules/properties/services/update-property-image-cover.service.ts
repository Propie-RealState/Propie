import { updatePropertyImageCoverRepository }
  from "../repositories/property-media.repository";
import { assertCanManageProperty } from "../utils/assert-can-manage-property";

interface UpdatePropertyImageCoverServiceRequest {
  propertyId: string;

  imageId: string;

  userId: string;
}

export async function updatePropertyImageCoverService({
  propertyId,
  imageId,
  userId,
}: UpdatePropertyImageCoverServiceRequest) {
  await assertCanManageProperty(userId, propertyId);

  await updatePropertyImageCoverRepository({
    propertyId,
    imageId,
  });
}