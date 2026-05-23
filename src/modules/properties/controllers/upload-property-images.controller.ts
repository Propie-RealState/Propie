import { FastifyReply, FastifyRequest } from "fastify";

import fs from "node:fs";

import path from "node:path";

import { pipeline } from "node:stream/promises";

import { v4 as uuid } from "uuid";

import { assertCanManageProperty } from "../utils/assert-can-manage-property";
import { createPropertyImageRepository } from "../repositories/create-property-image.repository";

import { countPropertyImagesRepository } from "../repositories/count-property-images.repository";

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
    // ================================================
    // EXTENSION
    // ================================================

    const extension = path.extname(file.filename);

    // ================================================
    // UNIQUE NAME
    // ================================================

    const filename = `${uuid()}${extension}`;

    // ================================================
    // PATH
    // ================================================

    const filepath = path.join(process.cwd(), "uploads", filename);

    // ================================================
    // SAVE FILE
    // ================================================

    await pipeline(file.file, fs.createWriteStream(filepath));

    // ================================================
    // URL
    // ================================================

    const imageUrl = `/uploads/${filename}`;

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
