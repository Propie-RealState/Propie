import {
    findPropertyByIdRepository,
  } from "../repositories/find-property-by-id.repository";
  
  import {
    updatePropertyBasicRepository,
  } from "../repositories/update-property-basic.repository";
  
  import {
    UpdatePropertyBasicInput,
  } from "../schemas/update-property-basic.schema";
  
  export async function updatePropertyBasicService(
    input: UpdatePropertyBasicInput & {
      propertyId: string;
      ownerId: string;
    }
  ) {
    const property =
      await findPropertyByIdRepository(
        input.propertyId
      );
  
    if (!property) {
      throw new Error(
        "PROPERTY_NOT_FOUND"
      );
    }
  
    if (
      property.owner_id !==
      input.ownerId
    ) {
      throw new Error(
        "FORBIDDEN"
      );
    }
  
    return updatePropertyBasicRepository({
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

      propertyType:
        input.propertyType,

      operationType:
        input.operationType,
    });
  }