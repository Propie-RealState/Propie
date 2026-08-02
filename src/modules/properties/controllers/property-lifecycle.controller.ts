import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import {
  CreatePropertyInput,
  CreatePropertySchema,
} from "../schemas/create-property.schema";
import { UpdatePropertyAmenitiesInput } from "../schemas/update-property-amenities.schema";
import {
  UpdatePropertyBasicInput,
  updatePropertyBasicSchema,
} from "../schemas/update-property-basic.schema";
import { UpdatePropertyCommercializationInput } from "../schemas/update-property-commercialization.schema";
import { UpdatePropertyLocationInput } from "../schemas/update-property-location.schema";
import { UpdatePropertyStatusSchema } from "../schemas/update-property-status.schema";
import { createPropertyService } from "../services/create-property.service";
import { publishPropertyService } from "../services/publish-property.service";
import { savePropertyAmenitiesService } from "../services/save-property-amenities.service";
import { savePropertyCommercializationService } from "../services/save-property-commercialization.service";
import { updatePropertyBasicService } from "../services/update-property-basic.service";
import { updatePropertyLocationService } from "../services/update-property-location.service";
import { updatePropertyStatusService, PropertyStatusTransitionError } from "../services/update-property-status.service";
import {
  PropertyForbiddenError,
  PropertyNotFoundError,
  softDeletePropertyService,
} from "../services/soft-delete-property.service";
import { PropertyDeletedError } from "../utils/assert-property-owner";

export async function createPropertyController(
  request: FastifyRequest<{
    Body: CreatePropertyInput;
  }>,
  reply: FastifyReply,
) {
  let body: CreatePropertyInput;

  try {
    body = CreatePropertySchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          details: error.flatten(),
        },
      });
    }

    throw error;
  }

  const result = await createPropertyService({
    ownerId: request.user.id,
    propertyType: body.propertyType,
    listingType: body.listingType,
  });

  return reply.status(201).send(result);
}

export async function updatePropertyBasicController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: UpdatePropertyBasicInput;
  }>,
  reply: FastifyReply,
) {
  let body: UpdatePropertyBasicInput;

  try {
    body = updatePropertyBasicSchema.parse(request.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          details: error.flatten(),
        },
      });
    }

    throw error;
  }

  try {
    await updatePropertyBasicService({
      propertyId: request.params.id,
      ownerId: request.user.id,
      title: body.title,
      description: body.description,
      price: body.price,
      currency: body.currency,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      areaM2: body.areaM2,
      propertyType: body.propertyType,
      operationType: body.operationType,
    });

    return reply.status(200).send({ ok: true });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PROPERTY_NOT_FOUND") {
        return reply.status(404).send({
          message: "Property not found",
        });
      }

      if (error.message === "FORBIDDEN") {
        return reply.status(403).send({
          message: "Forbidden",
        });
      }
    }

    throw error;
  }
}

export async function updatePropertyLocationController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: UpdatePropertyLocationInput;
  }>,
  reply: FastifyReply,
) {
  try {
    const location = await updatePropertyLocationService({
      propertyId: request.params.id,
      ownerId: request.user.id,
      country: request.body.country,
      province: request.body.province,
      city: request.body.city,
      neighborhood: request.body.neighborhood,
      address: request.body.address,
      lat: request.body.lat,
      lng: request.body.lng,
    });

    return reply.send(location);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PROPERTY_NOT_FOUND") {
        return reply.status(404).send({
          message: "Property not found",
        });
      }

      if (error.message === "FORBIDDEN") {
        return reply.status(403).send({
          message: "Forbidden",
        });
      }
    }

    throw error;
  }
}

export async function savePropertyAmenitiesController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: UpdatePropertyAmenitiesInput;
  }>,
  reply: FastifyReply,
) {
  await savePropertyAmenitiesService({
    propertyId: request.params.id,
    ownerId: request.user.id,
    amenities: request.body.amenities,
  });

  return reply.send({
    success: true,
  });
}

export async function savePropertyCommercializationController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
    Body: UpdatePropertyCommercializationInput;
  }>,
  reply: FastifyReply,
) {
  const user = request.user;

  const commercialization = await savePropertyCommercializationService({
    ownerId: user.id,
    propertyId: request.params.id,
    commercializationType: request.body.commercializationType,
  });

  return reply.send({
    success: true,
    commercialization,
  });
}

export async function publishPropertyController(
  request: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  reply: FastifyReply,
) {
  try {
    const user = request.user;

    const publisherType = user.role === "AGENT" ? "AGENT" : "OWNER";

    const property = await publishPropertyService({
      userId: user.id,
      publisherType,
      propertyId: request.params.id,
    });

    return reply.send({
      success: true,
      property,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Property already published") {
      return reply.status(409).send({
        success: false,
        error: {
          code: "ALREADY_PUBLISHED",
          message: error.message,
        },
      });
    }

    throw error;
  }
}

export async function updatePropertyStatusController(
  request: FastifyRequest<{
    Params: { id: string };
    Body: unknown;
  }>,
  reply: FastifyReply,
) {
  try {
    const body = UpdatePropertyStatusSchema.parse(request.body);

    const property = await updatePropertyStatusService({
      userId: request.user.id,
      propertyId: request.params.id,
      status: body.status,
    });

    return reply.send({ success: true, property });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return reply.status(403).send({ message: "Forbidden" });
    }

    if (
      error instanceof PropertyDeletedError
      || (error instanceof Error && error.message === "Property not found")
    ) {
      return reply.status(404).send({ message: "Property not found" });
    }

    if (
      error instanceof PropertyStatusTransitionError
      || (error instanceof Error
        && error.name === "PropertyStatusTransitionError")
    ) {
      return reply.status(400).send({
        success: false,
        error: {
          code: "INVALID_STATUS_TRANSITION",
          message: error instanceof Error ? error.message : "Invalid transition",
        },
      });
    }

    throw error;
  }
}

export async function softDeletePropertyController(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply,
) {
  try {
    await softDeletePropertyService({
      propertyId: request.params.id,
      userId: request.user.id,
    });

    return reply.status(204).send();
  } catch (error) {
    if (error instanceof PropertyNotFoundError) {
      return reply.status(404).send({ message: "Property not found" });
    }

    if (error instanceof PropertyForbiddenError) {
      return reply.status(403).send({
        message: "Only the property owner can delete this property.",
      });
    }

    throw error;
  }
}
