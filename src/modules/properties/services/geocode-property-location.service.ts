import {
  geocodeAddressService,
} from "@/modules/geocoding/services/geocoding.service";

import {
  getPropertyLocationRepository,
} from "../repositories/get-property-location.repository";

import {
  updatePropertyCoordinatesRepository,
} from "../repositories/update-property-coordinates.repository";

export async function geocodePropertyLocationService(
  propertyId: string
) {
  const location =
    await getPropertyLocationRepository(
      propertyId
    );

  if (
    !location ||
    location.has_coordinates
  ) {
    return location;
  }

  try {
    const geocode =
      await geocodeAddressService({
        country:
          location.country,
        province:
          location.province,
        city:
          location.city,
        neighborhood:
          location.neighborhood,
        address:
          location.address,
      });

    if (!geocode) {
      console.warn(
        "property publish geocoding returned no result",
        {
          propertyId,
        }
      );

      return location;
    }

    return updatePropertyCoordinatesRepository({
      propertyId,
      lat:
        geocode.lat,
      lng:
        geocode.lng,
    });
  } catch (error) {
    console.warn(
      "property publish geocoding failed",
      {
        propertyId,
        error,
      }
    );

    return location;
  }
}
