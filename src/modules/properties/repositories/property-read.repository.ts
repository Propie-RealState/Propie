import { db } from "@/database/client";

import { exploreVisibilitySql } from "../constants/property-status.constants";
import {
  MapViewportQuery,
  NearbyPropertiesQuery,
} from "../types/property-map.types";

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

export async function getPropertyByIdRepository(propertyId: string) {
  const result = await db.query(
    `
        SELECT *
        FROM properties
        WHERE id = $1
        LIMIT 1
      `,
    [propertyId],
  );

  return result.rows[0] ?? null;
}

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
              'thumb_url', pi.thumb_url,
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
              SELECT owner_id, COUNT(*) FILTER (WHERE status = 'ACTIVE' AND published_at IS NOT NULL)::int AS active_count
              FROM properties
              GROUP BY owner_id
            ) opc ON opc.owner_id = ou.id
            WHERE ou.id = p.owner_id
          ) t
        ) AS owner_info,

        (
          SELECT COALESCE(pc.allow_chat, true)
          FROM property_commercialization pc
          WHERE pc.property_id = p.id
          LIMIT 1
        ) AS allow_chat,

        (
          SELECT row_to_json(t) FROM (
            SELECT
              pu.id AS publisher_id,
              p.publisher_type,
              TRIM(CONCAT(ppr.first_name, ' ', COALESCE(ppr.last_name, ''))) AS publisher_name
            FROM users pu
            LEFT JOIN profiles ppr ON ppr.user_id = pu.id
            WHERE pu.id = p.publisher_id
          ) t
        ) AS publisher_info,

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
              ORDER BY aa.updated_at DESC
            ),
            '[]'
          )
          FROM agent_applications aa
          INNER JOIN users au ON au.id = aa.agent_id
          LEFT JOIN profiles apr ON apr.user_id = au.id
          LEFT JOIN (
            SELECT
              target_user_id,
              ROUND(AVG(rating)::numeric, 1)::float AS average_rating,
              COUNT(*)::int AS total_reviews
            FROM user_reviews
            GROUP BY target_user_id
          ) ars ON ars.target_user_id = au.id
          WHERE aa.property_id = p.id
            AND aa.status = 'ACCEPTED'
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

const CLUSTER_ZOOM_THRESHOLD = 15;

function gridSizeForZoom(zoom: number) {
  if (zoom <= 7) {
    return 0.5;
  }

  if (zoom <= 9) {
    return 0.2;
  }

  if (zoom <= 11) {
    return 0.08;
  }

  if (zoom <= 13) {
    return 0.03;
  }

  return 0.01;
}

function buildFilterSql(
  input: Pick<
    MapViewportQuery,
    "operationType" | "propertyType" | "minPrice" | "maxPrice"
  >,
  values: unknown[],
) {
  const filters = [
    "p.published_at IS NOT NULL AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')",
    "pl.coordinates IS NOT NULL",
  ];

  if (input.operationType) {
    values.push(input.operationType);
    filters.push(`p.operation_type = $${values.length}`);
  }

  if (input.propertyType) {
    values.push(input.propertyType);
    filters.push(`p.property_type = $${values.length}`);
  }

  if (input.minPrice !== undefined) {
    values.push(input.minPrice);
    filters.push(`p.price >= $${values.length}`);
  }

  if (input.maxPrice !== undefined) {
    values.push(input.maxPrice);
    filters.push(`p.price <= $${values.length}`);
  }

  return filters.join("\n          AND ");
}

export async function getMapPropertiesRepository(input: MapViewportQuery) {
  const values: unknown[] = [
    input.swlng,
    input.swlat,
    input.nelng,
    input.nelat,
  ];

  const filters = buildFilterSql(input, values);

  if (input.zoom >= CLUSTER_ZOOM_THRESHOLD) {
    const result = await db.query(
      `
          WITH bounds AS (
            SELECT ST_MakeEnvelope(
              $1,
              $2,
              $3,
              $4,
              4326
            ) AS geom
          )
          SELECT
            'property' AS type,
            p.id,
            ST_Y(pl.coordinates::geometry) AS lat,
            ST_X(pl.coordinates::geometry) AS lng,
            p.price,
            p.currency,
            p.operation_type,
            p.property_type,
            p.bedrooms,
            COALESCE(pl.neighborhood, pl.city) AS location_label,
            cover.cover_image
          FROM properties p
          INNER JOIN property_locations pl
            ON pl.property_id = p.id
          LEFT JOIN LATERAL (
            SELECT COALESCE(pi.thumb_url, pi.image_url) AS cover_image
            FROM property_images pi
            WHERE pi.property_id = p.id
            ORDER BY pi.is_cover DESC, pi.display_order ASC, pi.created_at ASC
            LIMIT 1
          ) cover ON true
          CROSS JOIN bounds b
          WHERE ${filters}
            AND pl.coordinates::geometry && b.geom
            AND ST_Intersects(
              pl.coordinates::geometry,
              b.geom
            )
          ORDER BY p.price ASC NULLS LAST
          LIMIT 1000
        `,
      values,
    );

    return result.rows;
  }

  values.push(gridSizeForZoom(input.zoom));

  const result = await db.query(
    `
        WITH bounds AS (
          SELECT ST_MakeEnvelope(
            $1,
            $2,
            $3,
            $4,
            4326
          ) AS geom
        ),
        visible AS (
          SELECT
            p.id,
            p.price,
            p.currency,
            p.operation_type,
            p.property_type,
            pl.coordinates::geometry AS geom,
            ST_SnapToGrid(
              pl.coordinates::geometry,
              $${values.length}
            ) AS cluster_geom
          FROM properties p
          INNER JOIN property_locations pl
            ON pl.property_id = p.id
          CROSS JOIN bounds b
          WHERE ${filters}
            AND pl.coordinates::geometry && b.geom
            AND ST_Intersects(
              pl.coordinates::geometry,
              b.geom
            )
        ),
        grouped AS (
          SELECT
            cluster_geom,
            COUNT(*)::integer AS count,
            ST_Centroid(
              ST_Collect(geom)
            ) AS center_geom,
            MIN(id::text) AS sample_id,
            MIN(price) AS sample_price,
            MIN(operation_type) AS sample_operation_type,
            MIN(property_type) AS sample_property_type
          FROM visible
          GROUP BY cluster_geom
        )
        SELECT
          CASE
            WHEN count = 1 THEN 'property'
            ELSE 'cluster'
          END AS type,
          CASE
            WHEN count = 1 THEN sample_id
            ELSE NULL
          END AS id,
          CASE
            WHEN count = 1 THEN NULL
            ELSE md5(
              ST_AsText(cluster_geom)
            )
          END AS cluster_id,
          ST_Y(center_geom) AS lat,
          ST_X(center_geom) AS lng,
          CASE
            WHEN count = 1 THEN sample_price
            ELSE NULL
          END AS price,
          CASE
            WHEN count = 1 THEN sample_operation_type
            ELSE NULL
          END AS operation_type,
          CASE
            WHEN count = 1 THEN sample_property_type
            ELSE NULL
          END AS property_type,
          CASE
            WHEN count = 1 THEN (
              SELECT p.bedrooms
              FROM properties p
              WHERE p.id::text = sample_id
            )
            ELSE NULL
          END AS bedrooms,
          CASE
            WHEN count = 1 THEN (
              SELECT COALESCE(pl.neighborhood, pl.city)
              FROM property_locations pl
              WHERE pl.property_id::text = sample_id
            )
            ELSE NULL
          END AS location_label,
          CASE
            WHEN count = 1 THEN (
              SELECT COALESCE(pi.thumb_url, pi.image_url)
              FROM property_images pi
              WHERE pi.property_id::text = sample_id
              ORDER BY pi.is_cover DESC, pi.display_order ASC, pi.created_at ASC
              LIMIT 1
            )
            ELSE NULL
          END AS cover_image,
          CASE
            WHEN count = 1 THEN NULL
            ELSE count
          END AS count
        FROM grouped
        ORDER BY count DESC NULLS LAST
        LIMIT 1000
      `,
    values,
  );

  return result.rows;
}

function buildNearbyFilterSql(
  input: Pick<
    NearbyPropertiesQuery,
    "operationType" | "propertyType" | "minPrice" | "maxPrice"
  >,
  values: unknown[],
) {
  const filters = [
    "p.published_at IS NOT NULL AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')",
    "pl.coordinates IS NOT NULL",
  ];

  if (input.operationType) {
    values.push(input.operationType);
    filters.push(`p.operation_type = $${values.length}`);
  }

  if (input.propertyType) {
    values.push(input.propertyType);
    filters.push(`p.property_type = $${values.length}`);
  }

  if (input.minPrice !== undefined) {
    values.push(input.minPrice);
    filters.push(`p.price >= $${values.length}`);
  }

  if (input.maxPrice !== undefined) {
    values.push(input.maxPrice);
    filters.push(`p.price <= $${values.length}`);
  }

  return filters.join("\n          AND ");
}

export async function getNearbyPropertiesRepository(
  input: NearbyPropertiesQuery,
) {
  const values: unknown[] = [input.lng, input.lat, input.radius];

  const filters = buildNearbyFilterSql(input, values);

  values.push(input.limit);
  const limitParam = values.length;

  values.push(input.offset);
  const offsetParam = values.length;

  const result = await db.query(
    `
        WITH origin AS (
          SELECT ST_SetSRID(
            ST_MakePoint($1, $2),
            4326
          )::geography AS geog
        )
        SELECT
          p.id,
          ST_Y(pl.coordinates::geometry) AS lat,
          ST_X(pl.coordinates::geometry) AS lng,
          p.price,
          p.currency,
          p.operation_type,
          p.property_type,
          ST_Distance(
            pl.coordinates,
            origin.geog
          ) AS distance_meters
        FROM properties p
        INNER JOIN property_locations pl
          ON pl.property_id = p.id
        CROSS JOIN origin
        WHERE ${filters}
          AND ST_DWithin(
            pl.coordinates,
            origin.geog,
            $3
          )
        ORDER BY distance_meters ASC
        LIMIT $${limitParam}
        OFFSET $${offsetParam}
      `,
    values,
  );

  return result.rows;
}

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
