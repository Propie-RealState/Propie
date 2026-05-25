export type GeocodeAddressInput = {
  country?: string | null;
  province?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  address?: string | null;
};

export type GeocodeCoordinates = {
  lat: number;
  lng: number;
};

export type GeocodeResult = GeocodeCoordinates & {
  provider: "nominatim";
  formattedAddress: string | null;
  raw: unknown;
};

export type AddressSuggestion = GeocodeCoordinates & {
  id: string;
  label: string;
  country: string;
  province: string;
  city: string;
  neighborhood: string;
  address: string;
  provider: "nominatim";
};

export type GeocodingClient = {
  geocodeAddress(input: GeocodeAddressInput): Promise<GeocodeResult | null>;
  searchAddress(query: string, limit?: number): Promise<AddressSuggestion[]>;
};
