import { apiFetch } from "../../../../lib/api";

import type {
  AddressSuggestionsResponse,
} from "../types/address-suggestion.types";

export async function searchAddressSuggestions(
  query: string,
  signal?: AbortSignal
): Promise<AddressSuggestionsResponse> {
  const params =
    new URLSearchParams({
      query,
      limit:
        "5",
    });

  return apiFetch(
    `/geocoding/search?${params.toString()}`,
    {
      signal,
    },
  );
}
