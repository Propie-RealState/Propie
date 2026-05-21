import { db } from "@/database/client";

interface CreatePropertyVideoRepositoryRequest {
  propertyId: string;

  videoUrl: string;
}

export async function createPropertyVideoRepository({
  propertyId,
  videoUrl,
}: CreatePropertyVideoRepositoryRequest) {

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
  // INSERT VIDEO
  // ============================================

  const result = await db.query(
    `
      INSERT INTO property_videos (
        property_id,
        video_url,
        display_order
      )

      VALUES (
        $1,
        $2,
        $3
      )

      RETURNING *
    `,
    [
      propertyId,
      videoUrl,
      nextOrder,
    ],
  );

  return result.rows[0];
}