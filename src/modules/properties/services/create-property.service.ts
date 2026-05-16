import {
    CreatePropertyServiceInput,
  } from "../schemas/create-property.schema";
  
  import {
    createPropertyRepository,
  } from "../repositories/create-property.repository";
  
  export async function createPropertyService(
    input: CreatePropertyServiceInput
  ) {
    const result =
      await createPropertyRepository({
        ownerId: input.ownerId,
        propertyType: input.propertyType,
        listingType: input.listingType,
      });
  
    return result;
  }