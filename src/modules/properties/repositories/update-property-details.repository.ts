import { db }
  from "@/database/client";

export async function updatePropertyDetailsRepository(
  input: {
    propertyId: string;

    title: string;

    description: string;

    price: number;

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
          title = $1,
          description = $2,
          price = $3,
          bedrooms = $4,
          bathrooms = $5,
          area_m2 = $6,
          updated_at = now()

        WHERE id = $7

        RETURNING *
      `,
      [
        input.title,
        input.description,
        input.price,
        input.bedrooms,
        input.bathrooms,
        input.areaM2,
        input.propertyId,
      ]
    );

  return result.rows[0];
}