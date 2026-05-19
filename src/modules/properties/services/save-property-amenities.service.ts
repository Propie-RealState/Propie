import {
    getPropertyByIdRepository,
  } from "../repositories/get-property-by-id.repository";
  
  import {
    savePropertyAmenitiesRepository,
  } from "../repositories/save-property-amenities.repository";
  
  interface Input {
    propertyId: string;
  
    ownerId: string;
  
    amenities: string[];
  }
  
  export async function savePropertyAmenitiesService({
    propertyId,
    ownerId,
    amenities,
  }: Input) {
  
    // ============================================
    // PROPERTY
    // ============================================
  
    const property =
      await getPropertyByIdRepository(
        propertyId
      );
  
    if (!property) {
      throw new Error(
        "Property not found"
      );
    }
  
    // ============================================
    // OWNER VALIDATION
    // ============================================
  
    if (
      property.owner_id !== ownerId
    ) {
      throw new Error(
        "Forbidden"
      );
    }
  
    // ============================================
    // SAVE
    // ============================================
  
    await savePropertyAmenitiesRepository({
      propertyId,
      amenities,
    });
  }