import { db }
from "@/database/client";

export async function countPropertyImagesRepository(
  propertyId: string,
) {

  const result =
    await db.query(
      `
        SELECT COUNT(*)::int as total

        FROM property_images

        WHERE property_id = $1
      `,
      [propertyId],
    );

  return result.rows[0].total;
}