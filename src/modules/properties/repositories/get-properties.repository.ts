import { db } from "@/database/client";

import { exploreVisibilitySql } from "../constants/property-status.constants";

export async function getPropertiesRepository() {
  const result = await db.query(`
    SELECT *
    FROM (
      SELECT DISTINCT ON (p.id)
        p.id,
        p.title,
        p.price,
        p.currency,
        p.property_type,
        p.operation_type,
        p.bedrooms,
        p.bathrooms,
        p.area_m2,
        p.created_at,
        l.city,
        l.province,
        COALESCE(pi.thumb_url, pi.image_url) AS cover_image
      FROM properties p
      LEFT JOIN property_locations l
        ON l.property_id = p.id
      LEFT JOIN property_images pi
        ON pi.property_id = p.id
        AND pi.is_cover = true
      WHERE ${exploreVisibilitySql("p")}
      ORDER BY p.id, p.created_at DESC
    ) published
    ORDER BY created_at DESC
  `);

  return result.rows;
}
