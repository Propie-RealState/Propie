import {
    getPropertyByIdRepository,
  } from "../repositories/get-property-by-id.repository";
  
  import {
    updatePropertyDetailsRepository,
  } from "../repositories/update-property-details.repository";
  
  export async function updatePropertyDetailsService(
    input: {
      propertyId: string;
  
      ownerId: string;
  
      bedrooms: number;
  
      bathrooms: number;
  
      areaM2: number;
    }
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
        "Forbidden"
      );
    }
  
    return updatePropertyDetailsRepository({
      propertyId:
        input.propertyId,
  
      bedrooms:
        input.bedrooms,
  
      bathrooms:
        input.bathrooms,
  
      areaM2:
        input.areaM2,
    });
  }