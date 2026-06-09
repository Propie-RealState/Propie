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

export type PropertyCurrency = "USD" | "ARS";

export const PROPERTY_CURRENCIES: PropertyCurrency[] = ["USD", "ARS"];

export type PublishMode = "create" | "edit";

export interface PropertyPublishData {
  publishMode: PublishMode | null;

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
  lat: number | null;
  lng: number | null;

  bedrooms: number | null;
  bathrooms: number | null;
  areaM2: number | null;

  price: number | null;

  currency: PropertyCurrency;

  images: string[];

  commercializationType?: string;

  amenities: string[];
}
