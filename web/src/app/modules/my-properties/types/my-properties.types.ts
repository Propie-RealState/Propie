export type PropertyStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "PAUSED";

export interface OwnedProperty {
  id: string;
  title: string;
  price: string;
  currency?: string | null;
  property_type: string;
  operation_type: string;
  bedrooms: number;
  bathrooms: number;
  area_m2: string;
  status: PropertyStatus;
  access_type?: "OWNER" | "ASSIGNED_AGENT";
  city: string | null;
  cover_image: string | null;
}
