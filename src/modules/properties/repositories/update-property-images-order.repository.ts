import { db } from "@/database/client";

interface UpdatePropertyImagesOrderRepositoryRequest {
  propertyId: string;
  imageIds: string[];
  userId: string;
}

export async function updatePropertyImagesOrderRepository({
  propertyId,
  imageIds,
  userId,
}: UpdatePropertyImagesOrderRepositoryRequest) {
  if (imageIds.length === 0) {
    return;
  }

  const ownerCheck = await db.query(
    `
      SELECT id
      FROM properties
      WHERE id = $1
        AND owner_id = $2
    `,
    [propertyId, userId],
  );

  if (ownerCheck.rows.length === 0) {
    throw new Error("FORBIDDEN");
  }

  const countResult = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM property_images
      WHERE property_id = $1
    `,
    [propertyId],
  );

  const totalImages = countResult.rows[0].count as number;

  const videoCountResult = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM property_videos
      WHERE property_id = $1
    `,
    [propertyId],
  );

  const totalVideos = videoCountResult.rows[0].count as number;

  if (totalVideos > 0) {
    throw new Error("USE_MEDIA_ORDER");
  }

  if (totalImages !== imageIds.length) {
    throw new Error(
      `INCOMPLETE_IMAGE_IDS: expected ${totalImages}, received ${imageIds.length}`,
    );
  }

  if (new Set(imageIds).size !== imageIds.length) {
    throw new Error("DUPLICATE_IMAGE_IDS");
  }

  const orders = imageIds.map((_, index) => index);

  const updateResult = await db.query(
    `
      UPDATE property_images AS pi
      SET display_order = ordered.display_order
      FROM (
        SELECT *
        FROM UNNEST($1::uuid[], $2::int[]) AS t(id, display_order)
      ) AS ordered
      WHERE pi.id = ordered.id
        AND pi.property_id = $3
    `,
    [imageIds, orders, propertyId],
  );

  if (updateResult.rowCount !== imageIds.length) {
    throw new Error("INVALID_IMAGE_IDS");
  }

  const orphanCheck = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM property_images
      WHERE property_id = $1
        AND display_order < 0
    `,
    [propertyId],
  );

  if ((orphanCheck.rows[0].count as number) > 0) {
    throw new Error("ORDER_UPDATE_FAILED");
  }
}
