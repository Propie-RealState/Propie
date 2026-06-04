import { db }
from "@/database/client";

import {
  MapViewportQuery,
} from "../types/property-map.types";

const CLUSTER_ZOOM_THRESHOLD =
  15;

function gridSizeForZoom(
  zoom: number
) {
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
    | "operationType"
    | "propertyType"
    | "minPrice"
    | "maxPrice"
  >,
  values: unknown[]
) {
  const filters = [
    "p.status = 'PUBLISHED'",
    "pl.coordinates IS NOT NULL",
  ];

  if (input.operationType) {
    values.push(input.operationType);
    filters.push(
      `p.operation_type = $${values.length}`
    );
  }

  if (input.propertyType) {
    values.push(input.propertyType);
    filters.push(
      `p.property_type = $${values.length}`
    );
  }

  if (input.minPrice !== undefined) {
    values.push(input.minPrice);
    filters.push(
      `p.price >= $${values.length}`
    );
  }

  if (input.maxPrice !== undefined) {
    values.push(input.maxPrice);
    filters.push(
      `p.price <= $${values.length}`
    );
  }

  return filters.join("\n          AND ");
}

export async function getMapPropertiesRepository(
  input: MapViewportQuery
) {
  const values: unknown[] = [
    input.swlng,
    input.swlat,
    input.nelng,
    input.nelat,
  ];

  const filters =
    buildFilterSql(input, values);

  if (
    input.zoom >=
    CLUSTER_ZOOM_THRESHOLD
  ) {
    const result =
      await db.query(
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
        values
      );

    return result.rows;
  }

  values.push(
    gridSizeForZoom(input.zoom)
  );

  const result =
    await db.query(
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
      values
    );

  return result.rows;
}
