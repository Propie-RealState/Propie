export type MapMode =
  | "explore"
  | "nearby";

export type MapBounds = {
  nelat: number;
  nelng: number;
  swlat: number;
  swlng: number;
};

export type MapFilters = {
  operationType?: "SALE" | "RENT" | "TEMPORARY";
  propertyType?: "HOUSE" | "APARTMENT" | "LAND" | "COMMERCIAL" | "OFFICE";
  minPrice?: number;
  maxPrice?: number;
};

export type MapViewport = {
  latitude: number;
  longitude: number;
  zoom: number;
};

export type PropertyPin = {
  type: "property";
  id: string;
  lat: number;
  lng: number;
  price: number;
  operationType: string;
  propertyType: string;
};

export type ClusterPin = {
  type: "cluster";
  clusterId: string;
  lat: number;
  lng: number;
  count: number;
};

export type MapResult =
  | PropertyPin
  | ClusterPin;

export type PropertiesMapResponse = {
  items: MapResult[];
};

export type NearbyProperty =
  PropertyPin & {
    distanceMeters: number;
  };

export type NearbyPropertiesResponse = {
  items: NearbyProperty[];
  limit: number;
  offset: number;
};
