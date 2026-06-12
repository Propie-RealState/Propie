import {
    getPropertyByIdRepository,
  } from "../repositories/property-read.repository";
  
  import {
    savePropertyAmenitiesRepository,
  } from "../repositories/save-property-amenities.repository";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";
  
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
  
    await assertCanManageProperty(
      ownerId,
      propertyId,
    );
  
    // ============================================
    // SAVE
    // ============================================
  
    await savePropertyAmenitiesRepository({
      propertyId,
      amenities,
    });
  }