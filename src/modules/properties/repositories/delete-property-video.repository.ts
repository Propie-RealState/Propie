import { db } from "@/database/client";

interface DeletePropertyVideoRepositoryRequest {
  videoId: string;
  propertyId: string;
  userId: string;
}

export async function deletePropertyVideoRepository({
  videoId,
  propertyId,
  userId,
}: DeletePropertyVideoRepositoryRequest) {
  const result = await db.query(
    `
      DELETE FROM property_videos
      WHERE id = $1
        AND property_id = $2
        AND property_id IN (
          SELECT id
          FROM properties
          WHERE owner_id = $3
        )
    `,
    [videoId, propertyId, userId],
  );

  if (result.rowCount === 0) {
    throw new Error("VIDEO_NOT_FOUND");
  }
}
