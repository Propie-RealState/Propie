import {
    FastifyReply,
    FastifyRequest,
  } from "fastify";
  
  import fs from "node:fs";
  
  import path from "node:path";
  
  import { pipeline }
  from "node:stream/promises";
  
  import { v4 as uuid }
  from "uuid";
  
  import {
    createPropertyImageRepository,
  } from "../repositories/create-property-image.repository";
  
  export async function uploadPropertyImagesController(
    request: FastifyRequest<{
      Params: {
        id: string;
      };
    }>,
  
    reply: FastifyReply
  ) {
  
    const parts =
      await request.files();
  
    const uploadedImages =
      [];
  
    for await (
      const file of parts
    ) {
  
      // ================================================
      // EXTENSION
      // ================================================
  
      const extension =
        path.extname(
          file.filename
        );
  
      // ================================================
      // UNIQUE NAME
      // ================================================
  
      const filename =
        `${uuid()}${extension}`;
  
      // ================================================
      // PATH
      // ================================================
  
      const filepath =
        path.join(
          process.cwd(),
          "uploads",
          filename
        );
  
      // ================================================
      // SAVE FILE
      // ================================================
  
      await pipeline(
        file.file,
        fs.createWriteStream(
          filepath
        )
      );
  
      // ================================================
      // URL
      // ================================================
  
      const imageUrl =
        `/uploads/${filename}`;
  
      // ================================================
      // SAVE DB
      // ================================================
  
      const image =
        await createPropertyImageRepository({
          propertyId:
            request.params.id,
  
          imageUrl,
  
          isCover:
            uploadedImages.length === 0,
        });
  
      uploadedImages.push(
        image
      );
    }
  
    return reply.send({
      success: true,
  
      images:
        uploadedImages,
    });
  }