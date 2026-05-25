import {
  AddressSuggestion,
  GeocodeAddressInput,
  GeocodingClient,
  GeocodeResult,
} from "../types/geocoding.types";

import {
  mapNominatimAddressResponse,
  mapNominatimSuggestionResponse,
} from "../mappers/nominatim.mapper";

type CacheEntry = {
  expiresAt: number;
  result: GeocodeResult | null;
};

type SuggestionsCacheEntry = {
  expiresAt: number;
  result: AddressSuggestion[];
};

const cache =
  new Map<string, CacheEntry>();

const suggestionsCache =
  new Map<string, SuggestionsCacheEntry>();

let nextAllowedRequestAt =
  0;

function buildAddressQuery(
  input: GeocodeAddressInput
) {
  return [
    input.address,
    input.neighborhood,
    input.city,
    input.province,
    input.country,
  ]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ");
}

async function waitForRateLimit() {
  const now =
    Date.now();

  const waitMs =
    Math.max(
      0,
      nextAllowedRequestAt - now
    );

  if (waitMs > 0) {
    await new Promise((resolve) =>
      setTimeout(resolve, waitMs)
    );
  }

  nextAllowedRequestAt =
    Date.now() + 1100;
}

export class NominatimClient
  implements GeocodingClient
{
  private readonly baseUrl =
    "https://nominatim.openstreetmap.org/search";

  private readonly userAgent =
    process.env.NOMINATIM_USER_AGENT ??
    "Propie/1.0 (backend@propie.local)";

  async geocodeAddress(
    input: GeocodeAddressInput
  ): Promise<GeocodeResult | null> {
    const query =
      buildAddressQuery(input);

    if (!query) {
      return null;
    }

    const cacheKey =
      query.toLowerCase();

    const cached =
      cache.get(cacheKey);

    if (
      cached &&
      cached.expiresAt > Date.now()
    ) {
      return cached.result;
    }

    await waitForRateLimit();

    const url =
      new URL(this.baseUrl);

    url.searchParams.set(
      "q",
      query
    );

    url.searchParams.set(
      "format",
      "jsonv2"
    );

    url.searchParams.set(
      "limit",
      "1"
    );

    url.searchParams.set(
      "addressdetails",
      "1"
    );

    const response =
      await fetch(url, {
        headers: {
          "User-Agent":
            this.userAgent,
          Accept:
            "application/json",
        },
      });

    if (!response.ok) {
      throw new Error(
        `NOMINATIM_${response.status}`
      );
    }

    const data =
      (await response.json()) as unknown[];

    const first =
      data[0] as
        | Parameters<
            typeof mapNominatimAddressResponse
          >[0]
        | undefined;

    const result =
      first
        ? mapNominatimAddressResponse(first)
        : null;

    cache.set(
      cacheKey,
      {
        result,
        expiresAt:
          Date.now() + 1000 * 60 * 60 * 24,
      }
    );

    return result;
  }

  async searchAddress(
    query: string,
    limit = 5
  ): Promise<AddressSuggestion[]> {
    const normalizedQuery =
      query.trim();

    if (normalizedQuery.length < 3) {
      return [];
    }

    const safeLimit =
      Math.min(
        Math.max(limit, 1),
        8
      );

    const cacheKey =
      `${normalizedQuery.toLowerCase()}:${safeLimit}`;

    const cached =
      suggestionsCache.get(cacheKey);

    if (
      cached &&
      cached.expiresAt > Date.now()
    ) {
      return cached.result;
    }

    await waitForRateLimit();

    const url =
      new URL(this.baseUrl);

    url.searchParams.set(
      "q",
      normalizedQuery
    );

    url.searchParams.set(
      "format",
      "jsonv2"
    );

    url.searchParams.set(
      "limit",
      String(safeLimit)
    );

    url.searchParams.set(
      "addressdetails",
      "1"
    );

    url.searchParams.set(
      "countrycodes",
      "ar"
    );

    const response =
      await fetch(url, {
        headers: {
          "User-Agent":
            this.userAgent,
          Accept:
            "application/json",
        },
      });

    if (!response.ok) {
      throw new Error(
        `NOMINATIM_${response.status}`
      );
    }

    const data =
      (await response.json()) as Array<
        Parameters<
          typeof mapNominatimSuggestionResponse
        >[0]
      >;

    const result =
      data
        .map(mapNominatimSuggestionResponse)
        .filter(
          (
            suggestion
          ): suggestion is AddressSuggestion =>
            Boolean(suggestion)
        );

    suggestionsCache.set(
      cacheKey,
      {
        result,
        expiresAt:
          Date.now() + 1000 * 60 * 60,
      }
    );

    return result;
  }
}
