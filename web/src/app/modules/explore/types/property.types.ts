import type { PropertyCurrency } from "../../publish/types/property-publish.types";

export interface Property {
  id: string;

  title: string;

  location: string;

  price: string;

  currency: PropertyCurrency;

  propertyType: string;

  operationType: string;

  coverImage: string | null;

  rooms?: number;

  bathrooms?: number;

  sqm?: number;
}
