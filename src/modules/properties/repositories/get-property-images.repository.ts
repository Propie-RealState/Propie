import { db }
  from "@/database/client";

export async function getPropertyImagesRepository(
  propertyId: string
) {

  const result =
    await db.query(
      `
        SELECT *

        FROM property_images

        WHERE property_id = $1

        ORDER BY created_at ASC
      `,
      [propertyId]
    );

  return result.rows;
}