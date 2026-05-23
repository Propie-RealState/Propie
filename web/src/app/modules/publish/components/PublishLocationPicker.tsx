import "maplibre-gl/dist/maplibre-gl.css";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Map, {
  Marker,
} from "react-map-gl/maplibre";
import { Loader2, MapPin, Search } from "lucide-react";

import { useAddressAutocomplete } from "../hooks/useAddressAutocomplete";
import type { AddressSuggestion } from "../types/address-suggestion.types";
import "./publish-location-picker.css";

type LocationValue = {
  country: string;
  province: string;
  city: string;
  neighborhood: string;
  address: string;
  lat: number | null;
  lng: number | null;
};

type Props = {
  value: LocationValue;
  onChange: (value: LocationValue) => void;
};

const CORDOBA = {
  lat: -31.4201,
  lng: -64.1888,
};

type MarkerDragEvent = {
  lngLat: {
    lat: number;
    lng: number;
  };
};

function cleanLocationValue(
  suggestion: AddressSuggestion
): LocationValue {
  return {
    country:
      suggestion.country || "Argentina",
    province:
      suggestion.province || "Cordoba",
    city:
      suggestion.city || "Cordoba",
    neighborhood:
      suggestion.neighborhood || "Centro",
    address:
      suggestion.address || suggestion.label,
    lat:
      suggestion.lat,
    lng:
      suggestion.lng,
  };
}

export function PublishLocationPicker({
  value,
  onChange,
}: Props) {
  const [query, setQuery] =
    useState(value.address);
  const [open, setOpen] =
    useState(false);

  const {
    items,
    loading,
    error,
  } = useAddressAutocomplete(query);

  const marker =
    useMemo(
      () => ({
        lat:
          value.lat ?? CORDOBA.lat,
        lng:
          value.lng ?? CORDOBA.lng,
      }),
      [
        value.lat,
        value.lng,
      ],
    );

  const [viewState, setViewState] =
    useState({
      latitude:
        marker.lat,
      longitude:
        marker.lng,
      zoom:
        value.lat && value.lng
          ? 15
          : 12,
      bearing:
        0,
      pitch:
        0,
    });

  useEffect(() => {
    setQuery(value.address);
  }, [value.address]);

  useEffect(() => {
    setViewState((current) => ({
      ...current,
      latitude:
        marker.lat,
      longitude:
        marker.lng,
      zoom:
        value.lat && value.lng
          ? Math.max(current.zoom, 15)
          : current.zoom,
      bearing:
        0,
      pitch:
        0,
    }));
  }, [
    marker.lat,
    marker.lng,
    value.lat,
    value.lng,
  ]);

  const selectSuggestion =
    useCallback(
      (suggestion: AddressSuggestion) => {
        const next =
          cleanLocationValue(suggestion);

        onChange(next);
        setQuery(next.address);
        setOpen(false);
      },
      [onChange],
    );

  const updateMarker =
    useCallback(
      (lat: number, lng: number) => {
        onChange({
          ...value,
          lat,
          lng,
          country:
            value.country || "Argentina",
          province:
            value.province || "Cordoba",
          city:
            value.city || "Cordoba",
          neighborhood:
            value.neighborhood || "Centro",
          address:
            value.address || query,
        });
      },
      [
        onChange,
        query,
        value,
      ],
    );

  return (
    <div className="publish-location-picker">
      <div className="publish-location-search">
        <Search
          className="publish-location-search-icon"
          size={18}
        />
        <input
          autoComplete="street-address"
          onBlur={() => {
            window.setTimeout(
              () => setOpen(false),
              160
            );
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            onChange({
              ...value,
              address:
                event.target.value,
            });
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar direccion..."
          type="text"
          value={query}
        />

        {loading && (
          <Loader2
            className="publish-location-loader"
            size={18}
          />
        )}

        {open && (
          <div className="publish-location-suggestions">
            {error && (
              <div className="publish-location-suggestion-state">
                {error}
              </div>
            )}

            {!error &&
              !loading &&
              query.trim().length >= 3 &&
              items.length === 0 && (
                <div className="publish-location-suggestion-state">
                  Sin resultados. Ajustá el pin en el mapa.
                </div>
              )}

            {items.map((item) => (
              <button
                key={item.id}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSuggestion(item);
                }}
                type="button"
              >
                <strong>{item.address || item.label}</strong>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="publish-location-map">
        <Map
          {...viewState}
          attributionControl={false}
          dragRotate={false}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          maxPitch={0}
          minZoom={3}
          onClick={(event) => {
            updateMarker(
              event.lngLat.lat,
              event.lngLat.lng
            );
          }}
          onMove={(event) => {
            setViewState({
              ...event.viewState,
              bearing:
                0,
              pitch:
                0,
            });
          }}
          pitchWithRotate={false}
          reuseMaps
        >
          <Marker
            anchor="bottom"
            draggable
            latitude={marker.lat}
            longitude={marker.lng}
            onDragEnd={(event: MarkerDragEvent) => {
              updateMarker(
                event.lngLat.lat,
                event.lngLat.lng
              );
            }}
          >
            <div className="publish-location-pin">
              <MapPin
                fill="#4417E6"
                size={34}
              />
            </div>
          </Marker>
        </Map>
      </div>

      <div className="publish-location-meta">
        <span>
          {value.lat && value.lng
            ? `${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
            : "Seleccioná una direccion o mové el pin"}
        </span>
      </div>
    </div>
  );
}
