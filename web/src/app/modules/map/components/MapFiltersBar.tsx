import React, { memo, useCallback } from "react";

import { useMapStore } from "../stores/useMapStore";
import type { MapFilters } from "../types/map.types";

const propertyTypes: Array<{
  label: string;
  value: NonNullable<MapFilters["propertyType"]>;
}> = [
  {
    label:
      "Casa",
    value:
      "HOUSE",
  },
  {
    label:
      "Depto",
    value:
      "APARTMENT",
  },
  {
    label:
      "Terreno",
    value:
      "LAND",
  },
  {
    label:
      "Comercial",
    value:
      "COMMERCIAL",
  },
];

export const MapFiltersBar = memo(
  function MapFiltersBar() {
    const filters =
      useMapStore((state) => state.filters);
    const setFilters =
      useMapStore((state) => state.setFilters);
    const clearFilters =
      useMapStore((state) => state.clearFilters);

    const setOperation =
      useCallback(
        (operationType?: MapFilters["operationType"]) => {
          setFilters({
            operationType,
          });
        },
        [setFilters],
      );

    const setPropertyType =
      useCallback(
        (propertyType?: MapFilters["propertyType"]) => {
          setFilters({
            propertyType,
          });
        },
        [setFilters],
      );

    const updateMinPrice =
      useCallback(
        (value: string) => {
          setFilters({
            minPrice:
              value
                ? Number(value)
                : undefined,
          });
        },
        [setFilters],
      );

    const updateMaxPrice =
      useCallback(
        (value: string) => {
          setFilters({
            maxPrice:
              value
                ? Number(value)
                : undefined,
          });
        },
        [setFilters],
      );

    return (
      <div className="propie-map-filters">
        <button
          className={!filters.operationType ? "is-active" : ""}
          onClick={() => setOperation(undefined)}
          type="button"
        >
          Todos
        </button>
        <button
          className={filters.operationType === "RENT" ? "is-active" : ""}
          onClick={() => setOperation("RENT")}
          type="button"
        >
          Alquiler
        </button>
        <button
          className={filters.operationType === "SALE" ? "is-active" : ""}
          onClick={() => setOperation("SALE")}
          type="button"
        >
          Venta
        </button>

        <span className="propie-map-filter-divider" />

        {propertyTypes.map((type) => (
          <button
            className={filters.propertyType === type.value ? "is-active" : ""}
            key={type.value}
            onClick={() =>
              setPropertyType(
                filters.propertyType === type.value
                  ? undefined
                  : type.value
              )
            }
            type="button"
          >
            {type.label}
          </button>
        ))}

        <input
          aria-label="Precio minimo"
          inputMode="numeric"
          onChange={(event) => updateMinPrice(event.target.value)}
          placeholder="Min USD"
          type="number"
          value={filters.minPrice ?? ""}
        />
        <input
          aria-label="Precio maximo"
          inputMode="numeric"
          onChange={(event) => updateMaxPrice(event.target.value)}
          placeholder="Max USD"
          type="number"
          value={filters.maxPrice ?? ""}
        />

        <button
          className="propie-map-clear-filter"
          onClick={clearFilters}
          type="button"
        >
          Limpiar
        </button>
      </div>
    );
  },
);
