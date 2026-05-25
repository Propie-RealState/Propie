export interface Property {
  id: string;

  title: string;

  location: string;

  price: string;

  propertyType: string;

  operationType: string;

  coverImage: string | null;

  rooms?: number;

  bathrooms?: number;

  sqm?: number;
}