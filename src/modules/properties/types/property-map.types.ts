export type MapFilters = {
  operationType?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type MapViewportQuery = MapFilters & {
  nelat: number;
  nelng: number;
  swlat: number;
  swlng: number;
  zoom: number;
};

export type NearbyPropertiesQuery = MapFilters & {
  lat: number;
  lng: number;
  radius: number;
  limit: number;
  offset: number;
};

export type PropertyPin = {
  type: "property";
  id: string;
  lat: number;
  lng: number;
  price: number;
  currency: string;
  operationType: string;
  propertyType: string;
  coverImage: string | null;
  bedrooms?: number;
  location: string | null;
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

export type NearbyPropertyResult =
  PropertyPin & {
    distanceMeters: number;
  };
