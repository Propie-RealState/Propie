import { db } from "@/database/client";

interface DeletePropertyImageRepositoryRequest {
  imageId: string;
  propertyId: string;
}

export async function deletePropertyImageRepository({
  imageId,
  propertyId,
}: DeletePropertyImageRepositoryRequest) {
  const result = await db.query(
    `
      DELETE FROM property_images
      WHERE id = $1
        AND property_id = $2
    `,
    [imageId, propertyId],
  );

  if (result.rowCount === 0) {
    throw new Error("IMAGE_NOT_FOUND");
  }
}