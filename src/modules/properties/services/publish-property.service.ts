import {
    getPropertyByIdRepository,
  } from "../repositories/property-read.repository";
  
  import {
    getPropertyImagesRepository,
  } from "../repositories/property-media.repository";
  
  import {
    publishPropertyRepository,
  } from "../repositories/property-write.repository";

  import {
    geocodePropertyLocationService,
  } from "./geocode-property-location.service";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";

  import {
    notifyPropertyPublished,
  } from "@/modules/notifications/services/notification-dispatch.service";

  import { PROPERTY_EVENT_TYPES } from "../constants/property-status.constants";
  import { insertPropertyEventRepository } from "../repositories/property-events.repository";
  import type { PublisherType } from "../constants/property-status.constants";
  
  type Input = {
    userId: string;
    publisherType: PublisherType;
    propertyId: string;
  };
  
  export async function publishPropertyService(
    input: Input
  ) {
  
    const property =
      await getPropertyByIdRepository(
        input.propertyId
      );
  
    if (!property) {
      throw new Error(
        "Property not found"
      );
    }

    if (property.published_at) {
      throw new Error("Property already published");
    }

    await assertCanManageProperty(
      input.userId,
      input.propertyId,
    );
  
    // =====================================================
    // VALIDATIONS
    // =====================================================
  
    if (!property.title) {
      throw new Error(
        "Title required"
      );
    }
  
    if (!property.description) {
      throw new Error(
        "Description required"
      );
    }
  
    if (!property.price) {
      throw new Error(
        "Price required"
      );
    }
  
    const images =
      await getPropertyImagesRepository(
        input.propertyId
      );
  
    if (
      !images ||
      images.length === 0
    ) {
      throw new Error(
        "At least one image required"
      );
    }
  
    // =====================================================
    // PUBLISH
    // =====================================================

    await geocodePropertyLocationService(
      input.propertyId
    );
  
    const publishedProperty = await publishPropertyRepository({
      propertyId: input.propertyId,
      publisherId: input.userId,
      publisherType: input.publisherType,
    });

    await insertPropertyEventRepository({
      propertyId: input.propertyId,
      actorId: input.userId,
      eventType: PROPERTY_EVENT_TYPES.PUBLISHED,
      payload: {
        publisherType: input.publisherType,
      },
    });

    try {
      await notifyPropertyPublished(input.propertyId);
    } catch (error) {
      console.error("Failed to dispatch publish notifications", error);
    }
  
    return publishedProperty;
  }
