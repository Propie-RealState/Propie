import {
    findPropertyByIdRepository,
  } from "../repositories/find-property-by-id.repository";
  
  export async function findPropertyByIdService(
    propertyId: string
  ) {
    const property =
      await findPropertyByIdRepository(
        propertyId
      );
  
    return property;
  }