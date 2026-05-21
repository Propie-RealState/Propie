import { db } from "@/database/client";

interface MediaOrderItem {
  id: string;
  type: "image" | "video";
}

interface UpdatePropertyMediaOrderRepositoryRequest {
  propertyId: string;
  media: MediaOrderItem[];
  userId: string;
}

export async function updatePropertyMediaOrderRepository({
  propertyId,
  media,
  userId,
}: UpdatePropertyMediaOrderRepositoryRequest) {
  if (media.length === 0) {
    throw new Error("EMPTY_MEDIA");
  }

  const ownerCheck = await db.query(
    `
      SELECT id
      FROM properties
      WHERE id = $1
        AND owner_id = $2
    `,
    [propertyId, userId],
  );

  if (ownerCheck.rows.length === 0) {
    throw new Error("FORBIDDEN");
  }

  const countResult = await db.query(
    `
      SELECT
        (SELECT COUNT(*)::int FROM property_images WHERE property_id = $1) AS images,
        (SELECT COUNT(*)::int FROM property_videos WHERE property_id = $1) AS videos
    `,
    [propertyId],
  );

  const imageCount = countResult.rows[0].images as number;
  const videoCount = countResult.rows[0].videos as number;
  const totalMedia = imageCount + videoCount;

  if (totalMedia !== media.length) {
    throw new Error(
      `INCOMPLETE_MEDIA: expected ${totalMedia}, received ${media.length}`,
    );
  }

  const seenIds = new Set<string>();
  const imageIds: string[] = [];
  const imageOrders: number[] = [];
  const videoIds: string[] = [];
  const videoOrders: number[] = [];

  for (const [index, item] of media.entries()) {
    if (seenIds.has(item.id)) {
      throw new Error("DUPLICATE_MEDIA_ID");
    }

    seenIds.add(item.id);

    if (item.type === "image") {
      imageIds.push(item.id);
      imageOrders.push(index);
      continue;
    }

    if (item.type === "video") {
      videoIds.push(item.id);
      videoOrders.push(index);
      continue;
    }

    throw new Error("INVALID_MEDIA_TYPE");
  }

  if (imageIds.length !== imageCount) {
    throw new Error("IMAGE_TYPE_MISMATCH");
  }

  if (videoIds.length !== videoCount) {
    throw new Error("VIDEO_TYPE_MISMATCH");
  }

  if (imageIds.length > 0) {
    const imageResult = await db.query(
      `
        UPDATE property_images AS pi
        SET display_order = ordered.display_order
        FROM (
          SELECT *
          FROM UNNEST($1::uuid[], $2::int[]) AS t(id, display_order)
        ) AS ordered
        WHERE pi.id = ordered.id
          AND pi.property_id = $3
      `,
      [imageIds, imageOrders, propertyId],
    );

    if (imageResult.rowCount !== imageIds.length) {
      throw new Error("INVALID_IMAGE_IDS");
    }
  }

  if (videoIds.length > 0) {
    const videoResult = await db.query(
      `
        UPDATE property_videos AS pv
        SET display_order = ordered.display_order
        FROM (
          SELECT *
          FROM UNNEST($1::uuid[], $2::int[]) AS t(id, display_order)
        ) AS ordered
        WHERE pv.id = ordered.id
          AND pv.property_id = $3
      `,
      [videoIds, videoOrders, propertyId],
    );

    if (videoResult.rowCount !== videoIds.length) {
      throw new Error("INVALID_VIDEO_IDS");
    }
  }
}
