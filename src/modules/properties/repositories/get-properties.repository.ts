import { db } from "@/database/client";

export async function getPropertiesRepository() {
  const result = await db.query(`
    SELECT
      p.id,
      p.title,
      p.price,
      p.property_type,
      p.operation_type,
      p.bedrooms,
      p.bathrooms,
      p.area_m2,
      l.city,
      l.province,

      pi.image_url AS cover_image

    FROM properties p

    LEFT JOIN property_locations l
      ON l.property_id = p.id

    LEFT JOIN property_images pi
      ON pi.property_id = p.id
      AND pi.is_cover = true

    WHERE p.status = 'PUBLISHED'

    ORDER BY p.created_at DESC
  `);

  return result.rows;
}
