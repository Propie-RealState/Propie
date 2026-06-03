import { db } from "@/database/client";

export async function getMyPropertiesRepository(userId: string) {
  const result = await db.query(
    `
    SELECT DISTINCT ON (p.id)
      p.id,
      p.title,
      p.price,
      p.property_type,
      p.operation_type,
      p.bedrooms,
      p.bathrooms,
      p.area_m2,
      p.status,
      CASE
        WHEN p.owner_id = $1 THEN 'OWNER'
        ELSE 'ASSIGNED_AGENT'
      END AS access_type,
  
      l.city,
      l.province,
  
      COALESCE(pi.thumb_url, pi.image_url) AS cover_image
  
    FROM properties p
  
    LEFT JOIN property_locations l
      ON l.property_id = p.id
  
    LEFT JOIN property_images pi
      ON pi.property_id = p.id
      AND pi.is_cover = true

    LEFT JOIN property_assignments pa
      ON pa.property_id = p.id
      AND pa.agent_id = $1
      AND pa.is_active = true
  
    WHERE p.owner_id = $1
      OR pa.agent_id = $1
  
    ORDER BY p.id, p.created_at DESC
  `,
    [userId],
  );
  return result.rows;
}
