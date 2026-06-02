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
        ) AS videos,

        (
          SELECT row_to_json(t) FROM (
            SELECT
              ou.id AS owner_id,
              opr.first_name AS owner_first_name,
              opr.last_name AS owner_last_name,
              opr.avatar_url AS owner_avatar_url,
              opr.bio AS owner_bio,
              opr.created_at AS owner_member_since,
              COALESCE(ors.total_reviews, 0)::int AS owner_total_reviews,
              COALESCE(ors.average_rating, 0)::float AS owner_average_rating,
              COALESCE(opc.active_count, 0)::int AS owner_active_properties
            FROM users ou
            LEFT JOIN profiles opr ON opr.user_id = ou.id
            LEFT JOIN (
              SELECT
                target_user_id,
                COUNT(*)::int AS total_reviews,
                ROUND(AVG(rating)::numeric, 1)::float AS average_rating
              FROM user_reviews
              GROUP BY target_user_id
            ) ors ON ors.target_user_id = ou.id
            LEFT JOIN (
              SELECT owner_id, COUNT(*) FILTER (WHERE status = 'PUBLISHED')::int AS active_count
              FROM properties
              GROUP BY owner_id
            ) opc ON opc.owner_id = ou.id
            WHERE ou.id = p.owner_id
          ) t
        ) AS owner_info,

        (
          SELECT COALESCE(
            json_agg(
              jsonb_build_object(
                'id', au.id,
                'name', TRIM(CONCAT(apr.first_name, ' ', COALESCE(apr.last_name, ''))),
                'photo', apr.avatar_url,
                'average_rating', COALESCE(ars.average_rating, 0),
                'total_reviews', COALESCE(ars.total_reviews, 0)
              )
            ),
            '[]'
          )
          FROM property_assignments pa2
          INNER JOIN users au ON au.id = pa2.agent_id
          LEFT JOIN profiles apr ON apr.user_id = au.id
          LEFT JOIN (
            SELECT
              target_user_id,
              ROUND(AVG(rating)::numeric, 1)::float AS average_rating,
              COUNT(*)::int AS total_reviews
            FROM user_reviews
            GROUP BY target_user_id
          ) ars ON ars.target_user_id = au.id
          WHERE pa2.property_id = p.id
            AND pa2.is_active = true
        ) AS agents

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
