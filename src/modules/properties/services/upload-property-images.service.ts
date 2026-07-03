import type { MultipartFile } from "@fastify/multipart";

import { FileValidationError } from "@/lib/storage/file-validation";
import { toImageMediaDescriptor } from "../utils/media-descriptor";
import { uploadPropertyImageService } from "./upload-property-image.service";

type UploadPropertyImagesInput = {
  propertyId: string;
  files: AsyncIterable<MultipartFile>;
  existingImagesCount: number;
};

export async function uploadPropertyImagesService(
  input: UploadPropertyImagesInput,
) {
  const uploadedImages = [];
  let uploadIndex = 0;

  for await (const file of input.files) {
    const rawBuffer = await file.toBuffer();

    try {
      const image = await uploadPropertyImageService({
        propertyId: input.propertyId,
        rawBuffer,
        mimetype: file.mimetype,
        filename: file.filename,
        isCover:
          input.existingImagesCount === 0 && uploadIndex === 0,
      });

      uploadedImages.push(toImageMediaDescriptor(image));
      uploadIndex += 1;
    } catch (error) {
      if (error instanceof FileValidationError) {
        throw error;
      }

      throw error;
    }
  }

  return uploadedImages;
}
