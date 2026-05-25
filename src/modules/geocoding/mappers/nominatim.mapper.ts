import {
  AddressSuggestion,
  GeocodeResult,
} from "../types/geocoding.types";

type NominatimAddressResponse = {
  place_id?: number;
  lat: string;
  lon: string;
  display_name?: string;
  address?: {
    country?: string;
    state?: string;
    province?: string;
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    neighbourhood?: string;
    neighborhood?: string;
    road?: string;
    pedestrian?: string;
    house_number?: string;
  };
};

export function mapNominatimAddressResponse(
  response: NominatimAddressResponse
): GeocodeResult | null {
  const lat =
    Number(response.lat);

  const lng =
    Number(response.lon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  return {
    lat,
    lng,
    provider:
      "nominatim",
    formattedAddress:
      response.display_name ?? null,
    raw:
      response,
  };
}

export function mapNominatimSuggestionResponse(
  response: NominatimAddressResponse
): AddressSuggestion | null {
  const lat =
    Number(response.lat);

  const lng =
    Number(response.lon);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < -90 ||
    lat > 90 ||
    lng < -180 ||
    lng > 180
  ) {
    return null;
  }

  const address =
    response.address ?? {};

  const road =
    address.road ??
    address.pedestrian ??
    "";

  const houseNumber =
    address.house_number ?? "";

  const streetAddress =
    [road, houseNumber]
      .filter(Boolean)
      .join(" ")
      .trim();

  const city =
    address.city ??
    address.town ??
    address.village ??
    "";

  const province =
    address.state ??
    address.province ??
    "";

  const neighborhood =
    address.neighbourhood ??
    address.neighborhood ??
    address.suburb ??
    "";

  const country =
    address.country ?? "";

  return {
    id:
      response.place_id
        ? String(response.place_id)
        : `${lat}:${lng}`,
    label:
      response.display_name ??
      [streetAddress, neighborhood, city, province, country]
        .filter(Boolean)
        .join(", "),
    country,
    province,
    city,
    neighborhood,
    address:
      streetAddress ||
      response.display_name ||
      "",
    lat,
    lng,
    provider:
      "nominatim",
  };
}
