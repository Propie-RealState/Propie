import { db }
  from "@/database/client";

export async function publishPropertyRepository(
  propertyId: string
) {

  const result =
    await db.query(
      `
        UPDATE properties

        SET
          status = 'PUBLISHED',

          published_at = now(),

          updated_at = now()

        WHERE id = $1

        RETURNING *
      `,
      [propertyId]
    );

  return result.rows[0];
}