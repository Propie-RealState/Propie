import {
    findPropertyByIdRepository,
  } from "../repositories/find-property-by-id.repository";
  
  import {
    upsertPropertyLocationRepository,
  } from "../repositories/upsert-property-location.repository";
  
  import {
    UpdatePropertyLocationInput,
  } from "../schemas/update-property-location.schema";
  
  export async function updatePropertyLocationService(
    input:
      UpdatePropertyLocationInput & {
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
  
    return upsertPropertyLocationRepository({
      propertyId:
        input.propertyId,
  
      country:
        input.country,
  
      province:
        input.province,
  
      city:
        input.city,
  
      neighborhood:
        input.neighborhood,
  
      address:
        input.address,
    });
  }