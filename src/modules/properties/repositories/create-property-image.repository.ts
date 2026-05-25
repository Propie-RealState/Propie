import { db }
from "@/database/client";

interface Input {
  propertyId: string;

  imageUrl: string;

  isCover?: boolean;
}

export async function createPropertyImageRepository({
  propertyId,
  imageUrl,
  isCover = false,
}: Input) {

  // ============================================
  // GET NEXT GLOBAL DISPLAY ORDER
  // ============================================

  const orderResult =
    await db.query(
      `
        SELECT COALESCE(
          MAX(display_order),
          -1
        ) as max_order

        FROM (
          SELECT display_order
          FROM property_images
          WHERE property_id = $1

          UNION ALL

          SELECT display_order
          FROM property_videos
          WHERE property_id = $1
        ) media_orders
      `,
      [propertyId],
    );

  const nextOrder =
    Number(
      orderResult.rows[0].max_order,
    ) + 1;

  // ============================================
  // INSERT IMAGE
  // ============================================

  const result =
    await db.query(
      `
        INSERT INTO property_images (
          property_id,
          image_url,
          is_cover,
          display_order
        )

        VALUES (
          $1,
          $2,
          $3,
          $4
        )

        RETURNING *
      `,
      [
        propertyId,
        imageUrl,
        isCover,
        nextOrder,
      ]
    );

  return result.rows[0];
}