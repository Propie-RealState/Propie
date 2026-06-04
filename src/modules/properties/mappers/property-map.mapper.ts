import {
  ClusterPin,
  MapResult,
  NearbyPropertyResult,
  PropertyPin,
} from "../types/property-map.types";

type MapRow = {
  type: "property" | "cluster";
  id?: string;
  cluster_id?: string;
  lat: string | number;
  lng: string | number;
  price?: string | number;
  operation_type?: string;
  property_type?: string;
  count?: string | number;
  cover_image?: string | null;
  bedrooms?: string | number | null;
  location_label?: string | null;
};

type NearbyRow = {
  id: string;
  lat: string | number;
  lng: string | number;
  price: string | number;
  operation_type: string;
  property_type: string;
  distance_meters: string | number;
  cover_image?: string | null;
  bedrooms?: string | number | null;
  location_label?: string | null;
};

export function mapPropertyPinRow(
  row: MapRow | NearbyRow
): PropertyPin | NearbyPropertyResult {
  const pin = {
    type:
      "property" as const,
    id:
      String(row.id),
    lat:
      Number(row.lat),
    lng:
      Number(row.lng),
    price:
      Number(row.price),
    operationType:
      row.operation_type ?? "",
    propertyType:
      row.property_type ?? "",
    coverImage:
      row.cover_image ?? null,
    bedrooms:
      row.bedrooms === undefined ||
      row.bedrooms === null
        ? undefined
        : Number(row.bedrooms),
    location:
      row.location_label ?? null,
  };

  if ("distance_meters" in row) {
    return {
      ...pin,
      distanceMeters:
        Number(row.distance_meters),
    };
  }

  return pin;
}

export function mapClusterPinRow(
  row: MapRow
): ClusterPin {
  return {
    type:
      "cluster",
    clusterId:
      String(row.cluster_id),
    lat:
      Number(row.lat),
    lng:
      Number(row.lng),
    count:
      Number(row.count),
  };
}

export function mapMapResultRow(
  row: MapRow
): MapResult {
  if (row.type === "cluster") {
    return mapClusterPinRow(row);
  }

  return mapPropertyPinRow(row);
}
