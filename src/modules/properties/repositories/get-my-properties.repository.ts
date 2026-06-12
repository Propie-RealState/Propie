import { db } from "@/database/client";

export async function getMyPropertiesRepository(userId: string) {
  const result = await db.query(
    `
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
      p.status,
      p.publisher_id,
      p.publisher_type,
      p.published_at,
      TRIM(CONCAT(pub_pr.first_name, ' ', COALESCE(pub_pr.last_name, ''))) AS publisher_name,
      CASE
        WHEN p.owner_id = $1 THEN 'OWNER'
        WHEN p.publisher_id = $1 THEN 'PUBLISHER'
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

    LEFT JOIN profiles pub_pr
      ON pub_pr.user_id = p.publisher_id

    WHERE p.owner_id = $1
      OR p.publisher_id = $1
      OR (
        p.status <> 'FINALIZED'
        AND EXISTS (
          SELECT 1
          FROM agent_applications aa
          WHERE aa.property_id = p.id
            AND aa.agent_id = $1
            AND aa.status = 'ACCEPTED'
        )
      )
  
    ORDER BY p.id, p.created_at DESC
  `,
    [userId],
  );
  return result.rows;
}
