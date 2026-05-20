import { deletePropertyImageRepository } from "../repositories/delete-property-image.repository";

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
  await deletePropertyImageRepository({
    imageId,
    userId, 
    propertyId,
  });
}