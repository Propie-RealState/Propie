import { db }
from "@/database/client";

type Input = {
  propertyId: string;
  lat: number;
  lng: number;
};

export async function updatePropertyCoordinatesRepository(
  input: Input
) {
  const result =
    await db.query(
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
      [
        input.propertyId,
        input.lat,
        input.lng,
      ]
    );

  return result.rows[0] ?? null;
}
