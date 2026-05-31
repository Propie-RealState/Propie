import "maplibre-gl/dist/maplibre-gl.css";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Map, {
  GeolocateControl,
  MapRef,
  NavigationControl,
} from "react-map-gl/maplibre";
import { ArrowLeft, LocateFixed, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { MapBottomSheet } from "../components/MapBottomSheet";
import { MapErrorState } from "../components/MapErrorState";
import { MapFiltersBar } from "../components/MapFiltersBar";
import { MapMarkers } from "../components/MapMarkers";
import { useMapProperties } from "../hooks/useMapProperties";
import { useUserGeolocation } from "../hooks/useUserGeolocation";
import { useMapStore } from "../stores/useMapStore";
import type {
  ClusterPin,
  MapBounds,
  PropertyPin,
} from "../types/map.types";
import "./property-map.css";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

function getBoundsFromMap(
  map: MapRef
): MapBounds {
  const bounds =
    map.getMap().getBounds();

  const northEast =
    bounds.getNorthEast();
  const southWest =
    bounds.getSouthWest();

  return {
    nelat:
      northEast.lat,
    nelng:
      northEast.lng,
    swlat:
      southWest.lat,
    swlng:
      southWest.lng,
  };
}

export default function PropertyMap() {
  const navigate =
    useNavigate();
  const mapRef =
    useRef<MapRef | null>(null);
  const initialLocationRequestedRef =
    useRef(false);
  const userInteractedRef =
    useRef(false);
  const programmaticMoveRef =
    useRef(false);

  const persistedViewport =
    useMapStore((state) => state.viewport);
  const selectedProperty =
    useMapStore((state) => state.selectedProperty);
  const setViewport =
    useMapStore((state) => state.setViewport);
  const setBounds =
    useMapStore((state) => state.setBounds);
  const setSelectedProperty =
    useMapStore((state) => state.setSelectedProperty);
  const setSelectedCluster =
    useMapStore((state) => state.setSelectedCluster);
  const setHasMovedSinceSearch =
    useMapStore((state) => state.setHasMovedSinceSearch);
  const hasMovedSinceSearch =
    useMapStore((state) => state.hasMovedSinceSearch);

  const [viewState, setViewState] =
    useState({
      latitude:
        persistedViewport.latitude,
      longitude:
        persistedViewport.longitude,
      zoom:
        persistedViewport.zoom,
      bearing:
        0,
      pitch:
        0,
    });

  const {
    items,
    properties,
    loading,
    error,
    reload,
  } = useMapProperties();

  const {
    locate,
    locating,
  } = useUserGeolocation();

  const commitViewport =
    useCallback(() => {
      const map =
        mapRef.current;

      if (!map) {
        return;
      }

      const center =
        map.getCenter();
      const zoom =
        map.getZoom();

      setViewport({
        latitude:
          center.lat,
        longitude:
          center.lng,
        zoom,
      });

      setBounds(
        getBoundsFromMap(map)
      );
    }, [
      setBounds,
      setViewport,
    ]); 

  const applyLocation =
    useCallback(
      (input: {
        lat: number;
        lng: number;
        zoom: number;
        animated: boolean;
      }) => {
        programmaticMoveRef.current =
          true;

        setViewState((current) => ({
          ...current,
          latitude:
            input.lat,
          longitude:
            input.lng,
          zoom:
            input.zoom,
          bearing:
            0,
          pitch:
            0,
        }));

        setViewport({
          latitude:
            input.lat,
          longitude:
            input.lng,
          zoom:
            input.zoom,
        });

        if (
          input.animated &&
          mapRef.current
        ) {
          mapRef.current.flyTo({
            center: [
              input.lng,
              input.lat,
            ],
            zoom:
              input.zoom,
            duration:
              520,
            essential:
              true,
          });
        }

        window.setTimeout(() => {
          programmaticMoveRef.current =
            false;
        }, 650);
      },
      [setViewport],
    );

  useEffect(() => {
    if (initialLocationRequestedRef.current) {
      return;
    }

    initialLocationRequestedRef.current =
      true;

    locate().then((location) => {
      if (userInteractedRef.current) {
        return;
      }

      applyLocation({
        lat:
          location.lat,
        lng:
          location.lng,
        zoom:
          13,
        animated:
          false,
      });
    });
  }, [
    applyLocation,
    locate,
  ]);

  const flyTo =
    useCallback(
      (input: {
        lat: number;
        lng: number;
        zoom?: number;
      }) => {
        programmaticMoveRef.current =
          true;

        mapRef.current?.flyTo({
          center: [
            input.lng,
            input.lat,
          ],
          zoom:
            input.zoom,
          duration:
            520,
          essential:
            true,
        });

        window.setTimeout(() => {
          programmaticMoveRef.current =
            false;
        }, 650);
      },
      [],
    );

  const handlePropertyClick =
    useCallback(
      (property: PropertyPin) => {
        setSelectedProperty(property);
        flyTo({
          lat:
            property.lat,
          lng:
            property.lng,
          zoom:
            Math.max(
              viewState.zoom,
              15
            ),
        });
      },
      [
        flyTo,
        setSelectedProperty,
        viewState.zoom,
      ],
    );

  const handleClusterClick =
    useCallback(
      (cluster: ClusterPin) => {
        setSelectedCluster(cluster);
        flyTo({
          lat:
            cluster.lat,
          lng:
            cluster.lng,
          zoom:
            Math.min(
              viewState.zoom + 2,
              18
            ),
        });
      },
      [
        flyTo,
        setSelectedCluster,
        viewState.zoom,
      ],
    );

  const openProperty =
    useCallback(
      (property: PropertyPin) => {
        setSelectedProperty(property);
        navigate(
          `/propiedad/${property.id}`,
          {
            state: {
              backTo:
                "/mapa",
            },
          }
        );
      },
      [
        navigate,
        setSelectedProperty,
      ],
    );

  const selectedPropertyId =
    selectedProperty?.id;

  const mapLoading =
    loading && items.length === 0;

  const controls =
    useMemo(
      () => (
        <>
          <NavigationControl
            position="bottom-right"
            showCompass={false}
          />
          <GeolocateControl
            position="bottom-right"
            showAccuracyCircle={false}
            trackUserLocation={false}
          />
        </>
      ),
      [],
    );

  return (
    <main className="propie-map-screen">
      <Map
        {...viewState}
        attributionControl={false}
        dragRotate={false}
        mapStyle={MAP_STYLE}
        maxPitch={0}
        minZoom={3}
        onLoad={commitViewport}
        onMove={(event) => {
          if (!programmaticMoveRef.current) {
            userInteractedRef.current =
              true;
          }

          setViewState({
            ...event.viewState,
            bearing:
              0,
            pitch:
              0,
          });
          if (!programmaticMoveRef.current) {
            setHasMovedSinceSearch(true);
          }
        }}
        onMoveEnd={commitViewport}
        onZoomEnd={commitViewport}
        pitchWithRotate={false}
        ref={mapRef}
        reuseMaps
        style={{
          height:
            "100%",
          width:
            "100%",
        }}
      >
        {controls}
        <MapMarkers
          items={items}
          onClusterClick={handleClusterClick}
          onPropertyClick={handlePropertyClick}
        />
      </Map>

      <div className="propie-map-topbar">
        <button
          aria-label="Volver a explorar"
          className="propie-map-icon-button"
          onClick={() => navigate("/explore")}
          type="button"
        >
          <ArrowLeft size={20} />
        </button>

        <MapFiltersBar />
      </div>

      <button
        className="propie-map-location-button"
        disabled={locating}
        onClick={async () => {
          const location =
            await locate();

          applyLocation({
            lat:
              location.lat,
            lng:
              location.lng,
            zoom:
              13,
            animated:
              true,
          });

          reload();
        }}
        type="button"
      >
        <LocateFixed size={18} />
        {locating ? "Ubicando" : "Mi zona"}
      </button>

      {hasMovedSinceSearch && (
        <button
          className="propie-map-search-area"
          onClick={reload}
          type="button"
        >
          <Search size={16} />
          Buscar en esta area
        </button>
      )}

      {mapLoading && (
        <div className="propie-map-loading">
          Cargando propiedades...
        </div>
      )}

      {error && (
        <MapErrorState
          message={error}
          onRetry={reload}
        />
      )}

      <MapBottomSheet
        loading={loading}
        onOpenProperty={openProperty}
        onSelectProperty={handlePropertyClick}
        properties={properties}
        selectedPropertyId={selectedPropertyId}
      />
    </main>
  );
}
