import { db } from "@/database/client";

export async function findPropertyByIdRepository(propertyId: string) {
  const result = await db.query(
    `
      SELECT
        p.*,

        pl.country,
        pl.province,
        pl.city,
        pl.neighborhood,
        pl.address,
        pl.latitude,
        pl.longitude,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pi.id,
              'type', 'image',
              'image_url', pi.image_url,
              'is_cover', pi.is_cover,
              'display_order', pi.display_order,
              'created_at', pi.created_at
            )
          ) FILTER (
            WHERE pi.id IS NOT NULL
          ),
          '[]'
        ) AS images,

        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'id', pv.id,
              'type', 'video',
              'video_url', pv.video_url,
              'display_order', pv.display_order,
              'created_at', pv.created_at
            )
          ) FILTER (
            WHERE pv.id IS NOT NULL
          ),
          '[]'
        ) AS videos

      FROM properties p

      LEFT JOIN property_images pi
        ON pi.property_id = p.id

      LEFT JOIN property_videos pv
        ON pv.property_id = p.id

      LEFT JOIN property_locations pl
        ON pl.property_id = p.id

      WHERE p.id = $1

      GROUP BY
        p.id,
        pl.country,
        pl.province,
        pl.city,
        pl.neighborhood,
        pl.address,
        pl.latitude,
        pl.longitude

      LIMIT 1
    `,
    [propertyId],
  );
  const property = result.rows[0];

  if (!property) {
    return null;
  }

  const media = [...property.images, ...property.videos].sort(
    (a: any, b: any) => a.display_order - b.display_order,
  );

  property.media = media;

  return property;
}
