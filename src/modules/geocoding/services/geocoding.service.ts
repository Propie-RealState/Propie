import {
  NominatimClient,
} from "../clients/nominatim.client";

import {
  GeocodeAddressInput,
  GeocodeResult,
  AddressSuggestion,
} from "../types/geocoding.types";

const geocodingClient =
  new NominatimClient();

export async function geocodeAddressService(
  input: GeocodeAddressInput
): Promise<GeocodeResult | null> {
  return geocodingClient.geocodeAddress(
    input
  );
}

export async function searchAddressSuggestionsService(
  query: string,
  limit?: number
): Promise<AddressSuggestion[]> {
  return geocodingClient.searchAddress(
    query,
    limit
  );
}
