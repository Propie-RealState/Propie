import React, { memo, useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";

import { useMapStore } from "../stores/useMapStore";
import type {
  ClusterPin,
  MapResult,
  PropertyPin,
} from "../types/map.types";
import { formatMapPrice } from "../utils/map-format";

type Props = {
  items: MapResult[];
  onClusterClick: (cluster: ClusterPin) => void;
  onPropertyClick: (property: PropertyPin) => void;
};

const PropertyMarker = memo(
  function PropertyMarker({
    property,
    selected,
    onClick,
  }: {
    property: PropertyPin;
    selected: boolean;
    onClick: (property: PropertyPin) => void;
  }) {
    return (
      <Marker
        latitude={property.lat}
        longitude={property.lng}
        anchor="bottom"
      >
        <button
          className={`propie-map-price-marker${selected ? " is-selected" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onClick(property);
          }}
          type="button"
        >
          {formatMapPrice(property.price, property.currency)}
        </button>
      </Marker>
    );
  },
);

const ClusterMarker = memo(
  function ClusterMarker({
    cluster,
    onClick,
  }: {
    cluster: ClusterPin;
    onClick: (cluster: ClusterPin) => void;
  }) {
    const size =
      Math.min(
        64,
        Math.max(
          42,
          34 + Math.log(cluster.count + 1) * 8
        )
      );

    return (
      <Marker
        latitude={cluster.lat}
        longitude={cluster.lng}
        anchor="center"
      >
        <button
          className="propie-map-cluster-marker"
          onClick={(event) => {
            event.stopPropagation();
            onClick(cluster);
          }}
          style={{
            width:
              size,
            height:
              size,
          }}
          type="button"
        >
          {cluster.count}
        </button>
      </Marker>
    );
  },
);

export const MapMarkers = memo(
  function MapMarkers({
    items,
    onClusterClick,
    onPropertyClick,
  }: Props) {
    const selectedPropertyId =
      useMapStore(
        (state) => state.selectedProperty?.id
      );

    const markers =
      useMemo(
        () =>
          items.map((item) => {
            if (item.type === "cluster") {
              return (
                <ClusterMarker
                  key={`cluster-${item.clusterId}`}
                  cluster={item}
                  onClick={onClusterClick}
                />
              );
            }

            return (
              <PropertyMarker
                key={`property-${item.id}`}
                property={item}
                selected={selectedPropertyId === item.id}
                onClick={onPropertyClick}
              />
            );
          }),
        [
          items,
          onClusterClick,
          onPropertyClick,
          selectedPropertyId,
        ],
      );

    return <>{markers}</>;
  },
);
