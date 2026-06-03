import { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { assertCanManageProperty } from "../utils/assert-can-manage-property";
import { createPropertyImageRepository } from "../repositories/create-property-image.repository";
import { countPropertyImagesRepository } from "../repositories/count-property-images.repository";
import { uploadToStorage } from "@/lib/supabase";

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
    const extension = path.extname(file.filename).toLowerCase() || ".jpg";
    const uuid = randomUUID();
    const storagePath = `images/${propertyId}/${uuid}${extension}`;

    const buffer = await file.toBuffer();

    const imageUrl = await uploadToStorage(
      storagePath,
      buffer,
      file.mimetype,
    );

    const image = await createPropertyImageRepository({
      propertyId,
      imageUrl,
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
