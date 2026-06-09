import React, { memo, useMemo, useState } from "react";

import { MapPropertyCardMedia } from "./MapPropertyCardMedia";
import type { PropertyPin } from "../types/map.types";
import {
  formatMapPrice,
  formatOperationType,
  formatPropertyType,
} from "../utils/map-format";

type SnapPoint =
  | "peek"
  | "half"
  | "full";

type Props = {
  properties: PropertyPin[];
  selectedPropertyId?: string;
  loading: boolean;
  onSelectProperty: (property: PropertyPin) => void;
  onOpenProperty: (property: PropertyPin) => void;
};

const snapClass:
  Record<SnapPoint, string> = {
    peek:
      "is-peek",
    half:
      "is-half",
    full:
      "is-full",
  };

export const MapBottomSheet = memo(
  function MapBottomSheet({
    properties,
    selectedPropertyId,
    loading,
    onSelectProperty,
    onOpenProperty,
  }: Props) {
    const [snap, setSnap] =
      useState<SnapPoint>("peek");
    const [dragStart, setDragStart] =
      useState<number | null>(null);

    const label =
      useMemo(() => {
        if (loading) {
          return "Actualizando mapa...";
        }

        if (properties.length === 0) {
          return "No hay propiedades visibles";
        }

        return `${properties.length} propiedades visibles`;
      }, [loading, properties.length]);

    return (
      <section
        className={`propie-map-bottom-sheet ${snapClass[snap]}`}
        onPointerDown={(event) => setDragStart(event.clientY)}
        onPointerUp={(event) => {
          if (dragStart === null) {
            return;
          }

          const delta =
            event.clientY - dragStart;

          if (delta < -40) {
            setSnap(
              snap === "peek"
                ? "half"
                : "full"
            );
          }

          if (delta > 40) {
            setSnap(
              snap === "full"
                ? "half"
                : "peek"
            );
          }

          setDragStart(null);
        }}
      >
        <button
          aria-label="Cambiar altura de resultados"
          className="propie-map-sheet-handle"
          onClick={() =>
            setSnap(
              snap === "peek"
                ? "half"
                : snap === "half"
                  ? "full"
                  : "peek"
            )
          }
          type="button"
        />

        <div className="propie-map-sheet-header">
          <strong>{label}</strong>
        </div>

        <div className="propie-map-sheet-list">
          {loading &&
            Array.from({
              length:
                3,
            }).map((_, index) => (
              <div
                className="propie-map-sheet-skeleton"
                key={index}
              />
            ))}

          {!loading &&
            properties.map((property) => {
              const locationLabel =
                property.location?.trim() ||
                "Ubicación no especificada";
              const bedroomsLabel =
                property.bedrooms &&
                property.bedrooms > 0
                  ? `${property.bedrooms} dorm.`
                  : null;

              return (
                <article
                  className={`propie-map-sheet-card${
                    selectedPropertyId === property.id
                      ? " is-selected"
                      : ""
                  }`}
                  key={property.id}
                  onClick={() => onSelectProperty(property)}
                >
                  <MapPropertyCardMedia
                    alt={`Portada de ${formatPropertyType(property.propertyType)} en ${locationLabel}`}
                    coverImage={property.coverImage}
                  />

                  <div className="propie-map-sheet-card-body">
                    <div className="propie-map-sheet-card-copy">
                      <strong>{formatMapPrice(property.price, property.currency)}</strong>
                      <span>
                        {formatOperationType(property.operationType)} ·{" "}
                        {formatPropertyType(property.propertyType)}
                        {bedroomsLabel ? ` · ${bedroomsLabel}` : ""}
                      </span>
                      <p className="propie-map-sheet-card-location">
                        {locationLabel}
                      </p>
                    </div>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenProperty(property);
                      }}
                      type="button"
                    >
                      Ver
                    </button>
                  </div>
                </article>
              );
            })}
        </div>
      </section>
    );
  },
);
