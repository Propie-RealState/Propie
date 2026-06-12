import { deletePropertyImageRepository } from "../repositories/property-media.repository";
import { assertCanManageProperty } from "../utils/assert-can-manage-property";
import { deleteFromStorage } from "@/lib/supabase";

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

  const deleted = await deletePropertyImageRepository({
    imageId,
    propertyId,
  });

  await Promise.all([
    deleteFromStorage(deleted.image_url),
    deleted.thumb_url ? deleteFromStorage(deleted.thumb_url) : Promise.resolve(),
  ]);
}
