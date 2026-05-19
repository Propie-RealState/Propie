import { db }
from "@/database/client";

interface Input {
  propertyId: string;

  imageUrl: string;

  isCover?: boolean;
}

export async function createPropertyImageRepository({
  propertyId,
  imageUrl,
  isCover = false,
}: Input) {

  const result =
    await db.query(
      `
        INSERT INTO property_images (
          property_id,
          image_url,
          is_cover
        )

        VALUES (
          $1,
          $2,
          $3
        )

        RETURNING *
      `,
      [
        propertyId,
        imageUrl,
        isCover,
      ]
    );

  return result.rows[0];
}