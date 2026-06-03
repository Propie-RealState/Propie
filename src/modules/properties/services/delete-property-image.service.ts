import { deletePropertyImageRepository } from "../repositories/delete-property-image.repository";
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

  await deleteFromStorage(deleted.image_url);
}
