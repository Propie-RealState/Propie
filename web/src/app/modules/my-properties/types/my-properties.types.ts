export type PropertyStatus =
  | "ACTIVE"
  | "PAUSED"
  | "RESERVED"
  | "FINALIZED";

export type PublisherType = "OWNER" | "AGENT";

export type MyPropertyAccessType =
  | "OWNER"
  | "PUBLISHER"
  | "ASSIGNED_AGENT";

export type MyProperty = {
  id: string;
  title: string;
  price: number;
  currency: string;
  property_type: string;
  operation_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  status: PropertyStatus;
  publisher_id: string | null;
  publisher_type: PublisherType | null;
  publisher_name: string | null;
  published_at: string | null;
  access_type: MyPropertyAccessType;
  city: string | null;
  province: string | null;
  cover_image: string | null;
};

export type OwnedProperty = MyProperty;
