import { deletePropertyVideoRepository } from "../repositories/delete-property-video.repository";
import { assertCanManageProperty } from "../utils/assert-can-manage-property";

interface DeletePropertyVideoServiceRequest {
  videoId: string;
  propertyId: string;
  userId: string;
}

export async function deletePropertyVideoService({
  videoId,
  propertyId,
  userId,
}: DeletePropertyVideoServiceRequest) {
  await assertCanManageProperty(userId, propertyId);

  await deletePropertyVideoRepository({
    videoId,
    propertyId,
  });
}
