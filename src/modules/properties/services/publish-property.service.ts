import {
    getPropertyByIdRepository,
  } from "../repositories/get-property-by-id.repository";
  
  import {
    getPropertyImagesRepository,
  } from "../repositories/get-property-images.repository";
  
  import {
    publishPropertyRepository,
  } from "../repositories/publish-property.repository";
  
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
  
    if (
      property.owner_id !==
      input.ownerId
    ) {
      throw new Error(
        "Unauthorized"
      );
    }
  
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
  
    const publishedProperty =
      await publishPropertyRepository(
        input.propertyId
      );
  
    return publishedProperty;
  }