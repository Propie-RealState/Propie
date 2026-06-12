import { db } from "@/database/client";

export async function countPropertyImagesRepository(propertyId: string) {
  const result = await db.query(
    `
        SELECT COUNT(*)::int as total

        FROM property_images

        WHERE property_id = $1
      `,
    [propertyId],
  );

  return result.rows[0].total;
}

interface CreatePropertyImageInput {
  propertyId: string;
  imageUrl: string;
  thumbUrl?: string | null;
  isCover?: boolean;
}

export async function createPropertyImageRepository({
  propertyId,
  imageUrl,
  thumbUrl = null,
  isCover = false,
}: CreatePropertyImageInput) {
  const orderResult = await db.query(
    `
        SELECT COALESCE(
          MAX(display_order),
          -1
        ) as max_order

        FROM (
          SELECT display_order
          FROM property_images
          WHERE property_id = $1

          UNION ALL

          SELECT display_order
          FROM property_videos
          WHERE property_id = $1
        ) media_orders
      `,
    [propertyId],
  );

  const nextOrder = Number(orderResult.rows[0].max_order) + 1;

  const result = await db.query(
    `
        INSERT INTO property_images (
          property_id,
          image_url,
          thumb_url,
          is_cover,
          display_order
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )

        RETURNING *
      `,
    [propertyId, imageUrl, thumbUrl, isCover, nextOrder],
  );

  return result.rows[0];
}

export async function deletePropertyImageRepository({
  imageId,
  propertyId,
}: {
  imageId: string;
  propertyId: string;
}) {
  const result = await db.query(
    `
      DELETE FROM property_images
      WHERE id = $1
        AND property_id = $2
      RETURNING image_url, thumb_url
    `,
    [imageId, propertyId],
  );

  if (result.rowCount === 0) {
    throw new Error("IMAGE_NOT_FOUND");
  }

  return result.rows[0] as { image_url: string; thumb_url: string | null };
}

export async function getPropertyImagesRepository(propertyId: string) {
  const result = await db.query(
    `
        SELECT *

        FROM property_images

        WHERE property_id = $1

        ORDER BY display_order ASC
      `,
    [propertyId],
  );

  return result.rows;
}

export async function updatePropertyImageCoverRepository({
  propertyId,
  imageId,
}: {
  propertyId: string;
  imageId: string;
}) {
  await db.query(
    `
      UPDATE property_images
      SET is_cover = false
      WHERE property_id = $1
    `,
    [propertyId],
  );

  await db.query(
    `
      UPDATE property_images
      SET is_cover = true
      WHERE id = $1
        AND property_id = $2
    `,
    [imageId, propertyId],
  );
}

export async function updatePropertyImagesOrderRepository({
  propertyId,
  imageIds,
}: {
  propertyId: string;
  imageIds: string[];
}) {
  if (imageIds.length === 0) {
    return;
  }

  const countResult = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM property_images
      WHERE property_id = $1
    `,
    [propertyId],
  );

  const totalImages = countResult.rows[0].count as number;

  const videoCountResult = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM property_videos
      WHERE property_id = $1
    `,
    [propertyId],
  );

  const totalVideos = videoCountResult.rows[0].count as number;

  if (totalVideos > 0) {
    throw new Error("USE_MEDIA_ORDER");
  }

  if (totalImages !== imageIds.length) {
    throw new Error(
      `INCOMPLETE_IMAGE_IDS: expected ${totalImages}, received ${imageIds.length}`,
    );
  }

  if (new Set(imageIds).size !== imageIds.length) {
    throw new Error("DUPLICATE_IMAGE_IDS");
  }

  const orders = imageIds.map((_, index) => index);

  const updateResult = await db.query(
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
    [imageIds, orders, propertyId],
  );

  if (updateResult.rowCount !== imageIds.length) {
    throw new Error("INVALID_IMAGE_IDS");
  }

  const orphanCheck = await db.query(
    `
      SELECT COUNT(*)::int AS count
      FROM property_images
      WHERE property_id = $1
        AND display_order < 0
    `,
    [propertyId],
  );

  if ((orphanCheck.rows[0].count as number) > 0) {
    throw new Error("ORDER_UPDATE_FAILED");
  }
}

interface MediaOrderItem {
  id: string;
  type: "image" | "video";
}

export async function updatePropertyMediaOrderRepository({
  propertyId,
  media,
}: {
  propertyId: string;
  media: MediaOrderItem[];
}) {
  if (media.length === 0) {
    throw new Error("EMPTY_MEDIA");
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

export async function deletePropertyVideoRepository({
  videoId,
  propertyId,
}: {
  videoId: string;
  propertyId: string;
}) {
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

export async function createPropertyVideoRepository({
  propertyId,
  videoUrl,
}: {
  propertyId: string;
  videoUrl: string;
}) {
  const orderResult = await db.query(
    `
        SELECT COALESCE(
          MAX(display_order),
          -1
        ) as max_order

        FROM (
          SELECT display_order
          FROM property_images
          WHERE property_id = $1

          UNION ALL

          SELECT display_order
          FROM property_videos
          WHERE property_id = $1
        ) media_orders
      `,
    [propertyId],
  );

  const nextOrder = Number(orderResult.rows[0].max_order) + 1;

  const result = await db.query(
    `
      INSERT INTO property_videos (
        property_id,
        video_url,
        display_order
      )

      VALUES (
        $1,
        $2,
        $3
      )

      RETURNING *
    `,
    [propertyId, videoUrl, nextOrder],
  );

  return result.rows[0];
}
