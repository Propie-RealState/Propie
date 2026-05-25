import { create } from "zustand";
import { persist } from "zustand/middleware";

import type {
  ClusterPin,
  MapBounds,
  MapFilters,
  MapMode,
  MapViewport,
  PropertyPin,
} from "../types/map.types";

type MapState = {
  viewport: MapViewport;
  bounds: MapBounds | null;
  filters: MapFilters;
  selectedProperty: PropertyPin | null;
  selectedCluster: ClusterPin | null;
  mapMode: MapMode;
  lastUserLocation: {
    lat: number;
    lng: number;
  } | null;
  hasMovedSinceSearch: boolean;
  setViewport: (viewport: MapViewport) => void;
  setBounds: (bounds: MapBounds | null) => void;
  setFilters: (filters: Partial<MapFilters>) => void;
  clearFilters: () => void;
  setSelectedProperty: (property: PropertyPin | null) => void;
  setSelectedCluster: (cluster: ClusterPin | null) => void;
  setMapMode: (mode: MapMode) => void;
  setLastUserLocation: (location: { lat: number; lng: number } | null) => void;
  setHasMovedSinceSearch: (value: boolean) => void;
};

const CORDOBA_VIEWPORT: MapViewport = {
  latitude: -31.4201,
  longitude: -64.1888,
  zoom: 12,
};

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      viewport:
        CORDOBA_VIEWPORT,
      bounds:
        null,
      filters:
        {},
      selectedProperty:
        null,
      selectedCluster:
        null,
      mapMode:
        "explore",
      lastUserLocation:
        null,
      hasMovedSinceSearch:
        false,
      setViewport:
        (viewport) =>
          set({
            viewport,
          }),
      setBounds:
        (bounds) =>
          set({
            bounds,
          }),
      setFilters:
        (filters) =>
          set((state) => ({
            filters: {
              ...state.filters,
              ...filters,
            },
          })),
      clearFilters:
        () =>
          set({
            filters: {},
          }),
      setSelectedProperty:
        (selectedProperty) =>
          set({
            selectedProperty,
            selectedCluster:
              null,
          }),
      setSelectedCluster:
        (selectedCluster) =>
          set({
            selectedCluster,
            selectedProperty:
              null,
          }),
      setMapMode:
        (mapMode) =>
          set({
            mapMode,
          }),
      setLastUserLocation:
        (lastUserLocation) =>
          set({
            lastUserLocation,
          }),
      setHasMovedSinceSearch:
        (hasMovedSinceSearch) =>
          set({
            hasMovedSinceSearch,
          }),
    }),
    {
      name:
        "propie-map-state",
      partialize:
        (state) => ({
          viewport:
            state.viewport,
          bounds:
            state.bounds,
          filters:
            state.filters,
          selectedProperty:
            state.selectedProperty,
          selectedCluster:
            state.selectedCluster,
          mapMode:
            state.mapMode,
          lastUserLocation:
            state.lastUserLocation,
        }),
    },
  ),
);
