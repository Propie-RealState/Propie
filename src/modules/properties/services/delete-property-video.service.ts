import { deletePropertyVideoRepository } from "../repositories/delete-property-video.repository";
import { assertCanManageProperty } from "../utils/assert-can-manage-property";
import { deleteFromStorage } from "@/lib/supabase";

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

  const deleted = await deletePropertyVideoRepository({
    videoId,
    propertyId,
  });

  await deleteFromStorage(deleted.video_url);
}
