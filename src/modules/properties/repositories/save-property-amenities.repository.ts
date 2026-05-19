import { db }
from "@/database/client";

interface Input {
  propertyId: string;

  amenities: string[];
}

export async function savePropertyAmenitiesRepository({
  propertyId,
  amenities,
}: Input) {

  // ============================================
  // DELETE OLD
  // ============================================

  await db.query(
    `
      DELETE FROM property_amenities

      WHERE property_id = $1
    `,
    [propertyId]
  );

  // ============================================
  // INSERT NEW
  // ============================================

  for (const amenity of amenities) {

    await db.query(
      `
        INSERT INTO property_amenities (
          property_id,
          amenity
        )

        VALUES (
          $1,
          $2
        )
      `,
      [
        propertyId,
        amenity,
      ]
    );
  }
}