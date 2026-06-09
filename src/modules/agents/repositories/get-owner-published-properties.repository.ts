import { db } from "@/database/client";

export async function getOwnerPublishedPropertiesRepository(ownerId: string) {
  const result = await db.query(
    `
      SELECT
        p.id,
        p.title,
        p.price,
        p.currency,
        p.property_type,
        p.operation_type,
        p.bedrooms,
        p.bathrooms,
        p.area_m2,
        l.city,
        l.province,
        COALESCE(pi.thumb_url, pi.image_url) AS cover_image
      FROM properties p
      LEFT JOIN property_locations l
        ON l.property_id = p.id
      LEFT JOIN property_images pi
        ON pi.property_id = p.id
        AND pi.is_cover = true
      WHERE p.owner_id = $1
        AND p.status = 'PUBLISHED'
      ORDER BY p.published_at DESC NULLS LAST, p.created_at DESC
    `,
    [ownerId],
  );

  return result.rows;
}
