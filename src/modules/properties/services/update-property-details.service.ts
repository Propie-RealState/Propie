import {
    getPropertyByIdRepository,
  } from "../repositories/get-property-by-id.repository";
  
  import {
    updatePropertyDetailsRepository,
  } from "../repositories/update-property-details.repository";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";
  
  export async function updatePropertyDetailsService(
    input: {
      propertyId: string;
  
      ownerId: string;
  
      title: string;
  
      description: string;
  
      price: number;
  
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
  
    await assertCanManageProperty(
      input.ownerId,
      input.propertyId,
    );
  
    return updatePropertyDetailsRepository({
      propertyId:
        input.propertyId,
  
      title:
        input.title,
  
      description:
        input.description,
  
      price:
        input.price,
  
      bedrooms:
        input.bedrooms,
  
      bathrooms:
        input.bathrooms,
  
      areaM2:
        input.areaM2,
    });
  }