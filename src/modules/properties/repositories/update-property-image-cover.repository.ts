import { db } from "@/database/client";

interface UpdatePropertyImageCoverRepositoryRequest {
  propertyId: string;

  imageId: string;

  userId: string;
}

export async function updatePropertyImageCoverRepository({
  propertyId,
  imageId,
  userId,
}: UpdatePropertyImageCoverRepositoryRequest) {

  // ============================================
  // RESET CURRENT COVER
  // ============================================

  await db.query(
    `
      UPDATE property_images
      SET is_cover = false
      WHERE property_id = $1
      AND property_id IN (
        SELECT id
        FROM properties
        WHERE owner_id = $2
      )
    `,
    [propertyId, userId],
  );

  // ============================================
  // SET NEW COVER
  // ============================================

  await db.query(
    `
      UPDATE property_images
      SET is_cover = true
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
}