import { db }
from "@/database/client";

export async function findPropertyByIdRepository(
  propertyId: string
) {

  const result =
    await db.query(
      `
        SELECT
          p.*,

          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'image_url', pi.image_url,
                'is_cover', pi.is_cover,
                'created_at', pi.created_at
              )
            ) FILTER (
              WHERE pi.id IS NOT NULL
            ),
            '[]'
          ) AS images

        FROM properties p

        LEFT JOIN property_images pi
          ON pi.property_id = p.id

        WHERE p.id = $1

        GROUP BY p.id

        LIMIT 1
      `,
      [propertyId]
    );

  return result.rows[0] ?? null;
}