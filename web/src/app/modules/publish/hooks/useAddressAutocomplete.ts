import { useEffect, useRef, useState } from "react";

import { useDebouncedValue } from "../../map/hooks/useDebouncedValue";
import { searchAddressSuggestions } from "../services/address-geocoding.service";
import type { AddressSuggestion } from "../types/address-suggestion.types";

export function useAddressAutocomplete(
  query: string
) {
  const debouncedQuery =
    useDebouncedValue(
      query,
      450
    );

  const abortRef =
    useRef<AbortController | null>(null);

  const [items, setItems] =
    useState<AddressSuggestion[]>([]);
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const trimmed =
      debouncedQuery.trim();

    abortRef.current?.abort();

    if (trimmed.length < 3) {
      setItems([]);
      setError(null);
      setLoading(false);
      return;
    }

    const controller =
      new AbortController();

    abortRef.current =
      controller;

    setLoading(true);
    setError(null);

    searchAddressSuggestions(
      trimmed,
      controller.signal
    )
      .then((response) => {
        setItems(response.items);
      })
      .catch((requestError) => {
        if (
          requestError instanceof DOMException &&
          requestError.name === "AbortError"
        ) {
          return;
        }

        setItems([]);
        setError(
          "No pudimos buscar direcciones. Podés ubicar el pin manualmente."
        );
      })
      .finally(() => {
        if (
          abortRef.current === controller
        ) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  return {
    items,
    loading,
    error,
  };
}
