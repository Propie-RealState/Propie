import { updatePropertyImageCoverRepository }
  from "../repositories/update-property-image-cover.repository";

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
  await updatePropertyImageCoverRepository({
    propertyId,
    imageId,
    userId,
  });
}