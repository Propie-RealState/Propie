import { FastifyReply, FastifyRequest } from "fastify";

import { assertCanManageProperty } from "../utils/assert-can-manage-property";
import { createPropertyImageRepository } from "../repositories/create-property-image.repository";

import { countPropertyImagesRepository } from "../repositories/count-property-images.repository";
import { savePropertyImageFromMultipart } from "../services/upload-property-images.service";

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

  const parts = await request.files();
  const existingImagesCount =
  await countPropertyImagesRepository(
    request.params.id,
  );  
  const uploadedImages = [];

  for await (const file of parts) {
    const imageUrl = await savePropertyImageFromMultipart(
      request.params.id,
      file,
    );

    // ================================================
    // SAVE DB
    // ================================================

    const image = await createPropertyImageRepository({
      propertyId: request.params.id,

      imageUrl,

      isCover:
      existingImagesCount === 0 &&
      uploadedImages.length === 0
    });

    uploadedImages.push(image);
  }

  return reply.send({
    success: true,

    images: uploadedImages,
  });
}
