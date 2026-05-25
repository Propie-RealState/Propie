import { db }
  from "@/database/client";

export async function getPropertyByIdRepository(
  propertyId: string
) {

  const result =
    await db.query(
      `
        SELECT *
        FROM properties
        WHERE id = $1
        LIMIT 1
      `,
      [propertyId]
    );

  return result.rows[0] ?? null;
}