export type PropertyType =
  | "HOUSE"
  | "APARTMENT"
  | "LAND"
  | "COMMERCIAL"
  | "OFFICE";
  
export type ListingType =
  | "SALE"
  | "RENT"
  | "TEMPORARY";

export interface PropertyPublishData {
  propertyId: string | null;

  propertyType: PropertyType | null;
  listingType: ListingType | null;

  title: string;
  description: string;

  country: string;
  province: string;
  city: string;
  neighborhood: string;
  address: string;

  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;

  price: number | null;

  images: string[];

  commercializationType?: string;

  amenities: string[];
}