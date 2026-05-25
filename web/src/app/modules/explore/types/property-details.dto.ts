export interface PropertyImageDTO {
    id: string;
  
    image_url: string;
  
    is_cover: boolean;
  
    created_at: string;
  }
  
  export interface PropertyDetailsDTO {
    id: string;
  
    owner_id: string;
  
    title: string | null;
  
    description: string | null;
  
    property_type: string;
  
    operation_type: string;
  
    price: string | null;
  
    bedrooms: number | null;
  
    bathrooms: number | null;
  
    area_m2: number | null;
  
    status: string;
  
    created_at: string;
  
    updated_at: string;
  
    published_at: string | null;
  
    country?: string | null;
  
    province?: string | null;
  
    city?: string | null;
  
    neighborhood?: string | null;
  
    address?: string | null;
  
    latitude?: number | null;
  
    longitude?: number | null;
  
    images: PropertyImageDTO[];
  }