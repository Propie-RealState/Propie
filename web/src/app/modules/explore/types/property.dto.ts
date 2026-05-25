export interface PropertyDTO {
    id: string;
  
    title: string;
  
    price: string;
  
    property_type: string;
  
    operation_type: string;
  
    city: string | null;
  
    province: string | null;
  
    cover_image: string | null;
  
    bedrooms?: number | null;
  
    bathrooms?: number | null;
  
    area_m2?: number | null;
  }