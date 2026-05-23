import { db }
from "@/database/client";

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
  propertyId: string
): Promise<PropertyLocationRow | null> {
  const result =
    await db.query(
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
      [propertyId]
    );

  return result.rows[0] ?? null;
}
