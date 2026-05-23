import { db }
from "@/database/client";

import {
  UpdatePropertyLocationInput,
} from "../schemas/update-property-location.schema";

export async function upsertPropertyLocationRepository(
  input:
    UpdatePropertyLocationInput & {
      propertyId: string;
    }
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
    ]
  );

  return result.rows[0];
}
