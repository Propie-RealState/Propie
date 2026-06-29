import { FastifyReply, FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";

import { uploadToStorage } from "@/lib/supabase";
import { FileValidationError, validateImageUpload } from "@/lib/storage/file-validation";
import {
  countPropertyImagesRepository,
  createPropertyImageRepository,
} from "../repositories/property-media.repository";
import { deletePropertyImageService } from "../services/delete-property-image.service";
import { deletePropertyVideoService } from "../services/delete-property-video.service";
import { processPropertyImage } from "../services/process-property-image.service";
import { updatePropertyImageCoverService } from "../services/update-property-image-cover.service";
import { updatePropertyImagesOrderService } from "../services/update-property-images-order.service";
import { updatePropertyMediaOrderService } from "../services/update-property-media-order.service";
import { savePropertyVideoFromMultipart } from "../services/upload-property-videos.service";
import { assertCanManageProperty } from "../utils/assert-can-manage-property";

export async function uploadPropertyImagesController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  await assertCanManageProperty(request.user.id, request.params.id);

  const propertyId = request.params.id;
  const parts = request.files();

  const existingImagesCount =
    await countPropertyImagesRepository(propertyId);

  const uploadedImages = [];

  for await (const file of parts) {
    const rawBuffer = await file.toBuffer();

    try {
      validateImageUpload({
        mimetype: file.mimetype,
        size: rawBuffer.length,
        filename: file.filename,
      });
    } catch (error) {
      if (error instanceof FileValidationError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      throw error;
    }

    const uuid = randomUUID();
    const fullPath = `images/${propertyId}/${uuid}.webp`;
    const thumbPath = `images/${propertyId}/${uuid}_thumb.webp`;

    const { fullBuffer, thumbBuffer } = await processPropertyImage(rawBuffer);

    const [imagePath, thumbPathStored] = await Promise.all([
      uploadToStorage(fullPath, fullBuffer, "image/webp"),
      uploadToStorage(thumbPath, thumbBuffer, "image/webp"),
    ]);

    const image = await createPropertyImageRepository({
      propertyId,
      imageUrl: imagePath,
      thumbUrl: thumbPathStored,
      isCover: existingImagesCount === 0 && uploadedImages.length === 0,
    });

    uploadedImages.push(image);
  }

  return reply.send({
    success: true,
    images: uploadedImages,
  });
}

export async function deletePropertyImageController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
      imageId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const userId = request.user.id;

  const { propertyId, imageId } = request.params;

  await deletePropertyImageService({
    imageId,
    propertyId,
    userId,
  });

  return reply.status(204).send();
}

export async function uploadPropertyVideosController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const { propertyId } = request.params;
    const userId = request.user.id;

    await assertCanManageProperty(userId, propertyId);

    const uploadedVideos = [];

    for await (const file of request.files()) {
      const video = await savePropertyVideoFromMultipart(propertyId, file);

      uploadedVideos.push(video);
    }

    if (uploadedVideos.length === 0) {
      return reply.status(400).send({
        message: "No se envió ningún archivo (key: files, type: File)",
      });
    }

    return reply.status(201).send({ videos: uploadedVideos });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FORBIDDEN") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      if (error.message === "INVALID_VIDEO_FORMAT") {
        return reply.status(400).send({
          message: "Formato no permitido. Usá mp4, mov, webm o m4v",
        });
      }

      if (error instanceof FileValidationError) {
        return reply.status(400).send({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      const err = error as Error & { code?: string };

      if (err.code === "FST_REQ_FILE_TOO_LARGE") {
        return reply.status(413).send({
          message: "El video supera el límite de 100 MB",
        });
      }
    }

    throw error;
  }
}

export async function deletePropertyVideoController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
      videoId: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    await deletePropertyVideoService({
      videoId: request.params.videoId,
      propertyId: request.params.propertyId,
      userId: request.user.id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === "VIDEO_NOT_FOUND") {
      return reply.status(404).send({ message: "Video not found" });
    }

    throw error;
  }
}

export async function updatePropertyImagesOrderController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };
    Body: {
      imageIds: string[];
    };
  }>,
  reply: FastifyReply,
) {
  try {
    await updatePropertyImagesOrderService({
      propertyId: request.params.propertyId,
      imageIds: request.body.imageIds,
      userId: request.user.id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FORBIDDEN") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      if (error.message.startsWith("INCOMPLETE_IMAGE_IDS")) {
        return reply.status(400).send({
          code: "INCOMPLETE_IMAGE_IDS",
          message: error.message.replace("INCOMPLETE_IMAGE_IDS: ", ""),
        });
      }

      if (error.message === "USE_MEDIA_ORDER") {
        return reply.status(400).send({
          code: "USE_MEDIA_ORDER",
          message:
            "Esta propiedad tiene videos. Usá PATCH /media/order con [{ id, type }, ...]",
        });
      }

      if (error.message === "DUPLICATE_IMAGE_IDS") {
        return reply.status(400).send({
          code: "DUPLICATE_IMAGE_IDS",
          message: "imageIds tiene UUIDs repetidos",
        });
      }

      if (error.message === "INVALID_IMAGE_IDS") {
        return reply.status(400).send({
          code: "INVALID_IMAGE_IDS",
          message:
            "Algún UUID no existe en esta propiedad o no es válido (revisá variables de Postman)",
        });
      }
    }

    throw error;
  }
}

function isValidMediaItem(
  item: unknown,
): item is { id: string; type: "image" | "video" } {
  if (!item || typeof item !== "object") {
    return false;
  }

  const { id, type } = item as { id?: unknown; type?: unknown };

  return (
    typeof id === "string" &&
    id.length > 0 &&
    (type === "image" || type === "video")
  );
}

export async function updatePropertyMediaOrderController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
    };
    Body: {
      media: {
        id: string;
        type: "image" | "video";
      }[];
    };
  }>,
  reply: FastifyReply,
) {
  const media = request.body?.media;

  if (!Array.isArray(media)) {
    return reply.status(400).send({
      code: "INVALID_BODY",
      message:
        'El body debe ser { "media": [{ "id": "uuid", "type": "image"|"video" }, ...] }',
    });
  }

  if (media.length === 0) {
    return reply.status(400).send({
      code: "EMPTY_MEDIA",
      message: "El array media no puede estar vacío",
    });
  }

  if (!media.every(isValidMediaItem)) {
    return reply.status(400).send({
      code: "INVALID_MEDIA_TYPE",
      message:
        "Cada item necesita id (string) y type (image o video). No envíes solo UUIDs",
    });
  }

  try {
    await updatePropertyMediaOrderService({
      propertyId: request.params.propertyId,
      media,
      userId: request.user.id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FORBIDDEN") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      if (error.message.startsWith("INCOMPLETE_MEDIA")) {
        return reply.status(400).send({
          code: "INCOMPLETE_MEDIA",
          message: error.message.replace("INCOMPLETE_MEDIA: ", ""),
        });
      }

      if (
        error.message === "DUPLICATE_MEDIA_ID" ||
        error.message === "IMAGE_TYPE_MISMATCH" ||
        error.message === "VIDEO_TYPE_MISMATCH"
      ) {
        return reply.status(400).send({
          code: error.message,
          message:
            "Cada item necesita id + type correcto (image/video), sin repetir IDs",
        });
      }

      if (
        error.message === "INVALID_IMAGE_IDS" ||
        error.message === "INVALID_VIDEO_IDS"
      ) {
        return reply.status(400).send({
          code: error.message,
          message: "Algún id no existe en esta propiedad o el type no coincide",
        });
      }
    }

    throw error;
  }
}

export async function updatePropertyImageCoverController(
  request: FastifyRequest<{
    Params: {
      propertyId: string;
      imageId: string;
    };
  }>,
  reply: FastifyReply,
) {
  const userId = request.user.id;

  const { propertyId, imageId } = request.params;

  await updatePropertyImageCoverService({
    propertyId,
    imageId,
    userId,
  });

  return reply.status(204).send();
}
