import {
    getPropertyByIdRepository,
  } from "../repositories/get-property-by-id.repository";
  
  import {
    getPropertyImagesRepository,
  } from "../repositories/get-property-images.repository";
  
  import {
    publishPropertyRepository,
  } from "../repositories/publish-property.repository";

  import {
    geocodePropertyLocationService,
  } from "./geocode-property-location.service";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";

  import {
    notifyPropertyPublished,
  } from "@/modules/notifications/services/notification-dispatch.service";
  
  type Input = {
    ownerId: string;
  
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
  
    await assertCanManageProperty(
      input.ownerId,
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
  
    const publishedProperty =
      await publishPropertyRepository(
        input.propertyId
      );

    try {
      await notifyPropertyPublished(input.propertyId);
    } catch (error) {
      console.error("Failed to dispatch publish notifications", error);
    }
  
    return publishedProperty;
  }
