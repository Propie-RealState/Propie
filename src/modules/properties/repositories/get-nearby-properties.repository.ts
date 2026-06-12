import { db }
from "@/database/client";

import {
  NearbyPropertiesQuery,
} from "../types/property-map.types";

function buildNearbyFilterSql(
  input: Pick<
    NearbyPropertiesQuery,
    | "operationType"
    | "propertyType"
    | "minPrice"
    | "maxPrice"
  >,
  values: unknown[]
) {
  const filters = [
    "p.published_at IS NOT NULL AND p.status IN ('ACTIVE', 'PAUSED', 'RESERVED')",
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

export async function getNearbyPropertiesRepository(
  input: NearbyPropertiesQuery
) {
  const values: unknown[] = [
    input.lng,
    input.lat,
    input.radius,
  ];

  const filters =
    buildNearbyFilterSql(
      input,
      values
    );

  values.push(input.limit);
  const limitParam =
    values.length;

  values.push(input.offset);
  const offsetParam =
    values.length;

  const result =
    await db.query(
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
      values
    );

  return result.rows;
}
