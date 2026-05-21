import { deletePropertyVideoRepository } from "../repositories/delete-property-video.repository";

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
  await deletePropertyVideoRepository({
    videoId,
    propertyId,
    userId,
  });
}
