import { db } from "@/database/client";

import { UpdatePropertyLocationInput } from "../schemas/update-property-location.schema";

export type PropertyLocationRow = {
  property_id: string;
  country: string | null;
  province: string | null;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  latitude: string | null;
  longitude: string | null;
  has_coordinates: boolean;
};

export async function getPropertyLocationRepository(
  propertyId: string,
): Promise<PropertyLocationRow | null> {
  const result = await db.query(
    `
        SELECT
          property_id,
          country,
          province,
          city,
          neighborhood,
          address,
          latitude,
          longitude,
          coordinates IS NOT NULL AS has_coordinates
        FROM property_locations
        WHERE property_id = $1
        LIMIT 1
      `,
    [propertyId],
  );

  return result.rows[0] ?? null;
}

export async function upsertPropertyLocationRepository(
  input: UpdatePropertyLocationInput & {
    propertyId: string;
  },
) {
  const result = await db.query(
    `
      INSERT INTO property_locations (
        property_id,
        country,
        province,
        city,
        neighborhood,
        address,
        latitude,
        longitude,
        coordinates
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        CASE
          WHEN $7::numeric IS NOT NULL
            AND $8::numeric IS NOT NULL
          THEN ST_SetSRID(
            ST_MakePoint(
              $8::double precision,
              $7::double precision
            ),
            4326
          )::geography
          ELSE NULL
        END
      )

      ON CONFLICT (property_id)

      DO UPDATE SET
        country = EXCLUDED.country,
        province = EXCLUDED.province,
        city = EXCLUDED.city,
        neighborhood = EXCLUDED.neighborhood,
        address = EXCLUDED.address,
        latitude = COALESCE(
          EXCLUDED.latitude,
          property_locations.latitude
        ),
        longitude = COALESCE(
          EXCLUDED.longitude,
          property_locations.longitude
        ),
        coordinates = COALESCE(
          EXCLUDED.coordinates,
          property_locations.coordinates
        ),
        updated_at = now()

      RETURNING *
    `,
    [
      input.propertyId,
      input.country,
      input.province,
      input.city,
      input.neighborhood,
      input.address,
      input.lat ?? null,
      input.lng ?? null,
    ],
  );

  return result.rows[0];
}

export async function updatePropertyCoordinatesRepository(input: {
  propertyId: string;
  lat: number;
  lng: number;
}) {
  const result = await db.query(
    `
        UPDATE property_locations
        SET
          latitude = $2,
          longitude = $3,
          coordinates = ST_SetSRID(
            ST_MakePoint($3, $2),
            4326
          )::geography,
          updated_at = now()
        WHERE property_id = $1
        RETURNING *
      `,
    [input.propertyId, input.lat, input.lng],
  );

  return result.rows[0] ?? null;
}
