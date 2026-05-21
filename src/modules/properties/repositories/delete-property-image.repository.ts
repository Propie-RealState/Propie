import { db } from "@/database/client";

interface DeletePropertyImageRepositoryRequest {
  imageId: string;
  propertyId: string;
  userId: string;
}

export async function deletePropertyImageRepository({
  imageId,
  propertyId,
  userId,
}: DeletePropertyImageRepositoryRequest) {
  const result = await db.query(
    `
      DELETE FROM property_images
      WHERE id = $1
      AND property_id = $2
      AND property_id IN (
        SELECT id
        FROM properties
        WHERE owner_id = $3
      )
    `,
    [imageId, propertyId, userId],
  );

  if (result.rowCount === 0) {
    throw new Error("IMAGE_NOT_FOUND");
  }
}