import { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";

import { assertCanManageProperty } from "../utils/assert-can-manage-property";
import { createPropertyImageRepository } from "../repositories/create-property-image.repository";
import { countPropertyImagesRepository } from "../repositories/count-property-images.repository";
import { uploadToStorage } from "@/lib/supabase";
import { processPropertyImage } from "../services/process-property-image.service";

export async function uploadPropertyImagesController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,

  reply: FastifyReply,
) {
  await assertCanManageProperty(
    request.user.id,
    request.params.id,
  );

  const propertyId = request.params.id;
  const parts = request.files();

  const existingImagesCount =
    await countPropertyImagesRepository(propertyId);

  const uploadedImages = [];

  for await (const file of parts) {
    const uuid = randomUUID();
    const fullPath = `images/${propertyId}/${uuid}.webp`;
    const thumbPath = `images/${propertyId}/${uuid}_thumb.webp`;

    const rawBuffer = await file.toBuffer();
    const { fullBuffer, thumbBuffer } = await processPropertyImage(rawBuffer);

    const [imageUrl, thumbUrl] = await Promise.all([
      uploadToStorage(fullPath, fullBuffer, "image/webp"),
      uploadToStorage(thumbPath, thumbBuffer, "image/webp"),
    ]);

    const image = await createPropertyImageRepository({
      propertyId,
      imageUrl,
      thumbUrl,
      isCover:
        existingImagesCount === 0 &&
        uploadedImages.length === 0,
    });

    uploadedImages.push(image);
  }

  return reply.send({
    success: true,
    images: uploadedImages,
  });
}
