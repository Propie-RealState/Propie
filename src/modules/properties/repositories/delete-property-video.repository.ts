import { db } from "@/database/client";

interface DeletePropertyVideoRepositoryRequest {
  videoId: string;
  propertyId: string;
}

export async function deletePropertyVideoRepository({
  videoId,
  propertyId,
}: DeletePropertyVideoRepositoryRequest) {
  const result = await db.query(
    `
      DELETE FROM property_videos
      WHERE id = $1
        AND property_id = $2
      RETURNING video_url
    `,
    [videoId, propertyId],
  );

  if (result.rowCount === 0) {
    throw new Error("VIDEO_NOT_FOUND");
  }

  return result.rows[0] as { video_url: string };
}
