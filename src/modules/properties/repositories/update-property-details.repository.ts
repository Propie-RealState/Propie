import { db }
  from "@/database/client";

export async function updatePropertyDetailsRepository(
  input: {
    propertyId: string;

    bedrooms: number;

    bathrooms: number;

    areaM2: number;
  }
) {
  const result =
    await db.query(
      `
        UPDATE properties
        SET
          bedrooms = $1,
          bathrooms = $2,
          area_m2 = $3,
          updated_at = now()
        WHERE id = $4
        RETURNING *
      `,
      [
        input.bedrooms,
        input.bathrooms,
        input.areaM2,
        input.propertyId,
      ]
    );

  return result.rows[0];
}