import {
    findPropertyByIdRepository,
  } from "../repositories/property-read.repository";
  
  import {
    upsertPropertyLocationRepository,
  } from "../repositories/property-location.repository";

  import {
    geocodeAddressService,
  } from "@/modules/geocoding/services/geocoding.service";
  
  import {
    UpdatePropertyLocationInput,
  } from "../schemas/update-property-location.schema";

  import { assertCanManageProperty } from "../utils/assert-can-manage-property";
  
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
  
    await assertCanManageProperty(
      input.ownerId,
      input.propertyId,
    );
  
    let coordinates:
      | {
          lat: number;
          lng: number;
        }
      | null =
        input.lat !== undefined &&
        input.lng !== undefined
          ? {
              lat:
                input.lat,
              lng:
                input.lng,
            }
          : null;

    if (!coordinates) {
      try {
        const geocode =
          await geocodeAddressService({
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

        coordinates =
          geocode
            ? {
                lat:
                  geocode.lat,
                lng:
                  geocode.lng,
              }
            : null;
      } catch (error) {
        console.warn(
          "property location geocoding failed",
          {
            propertyId:
              input.propertyId,
            error,
          }
        );
      }
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

      lat:
        coordinates?.lat,

      lng:
        coordinates?.lng,
    });
  }
