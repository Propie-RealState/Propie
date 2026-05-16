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
        address
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )

      ON CONFLICT (property_id)

      DO UPDATE SET
        country = EXCLUDED.country,
        province = EXCLUDED.province,
        city = EXCLUDED.city,
        neighborhood = EXCLUDED.neighborhood,
        address = EXCLUDED.address,
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
    ]
  );

  return result.rows[0];
}