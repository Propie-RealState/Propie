import { db } from "@/database/client";

interface UpdatePropertyImageCoverRepositoryRequest {
  propertyId: string;

  imageId: string;
}

export async function updatePropertyImageCoverRepository({
  propertyId,
  imageId,
}: UpdatePropertyImageCoverRepositoryRequest) {

  // ============================================
  // RESET CURRENT COVER
  // ============================================

  await db.query(
    `
      UPDATE property_images
      SET is_cover = false
      WHERE property_id = $1
    `,
    [propertyId],
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
    `,
    [imageId, propertyId],
  );
}