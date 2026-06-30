export interface PropertyImageDTO {
    id: string;
  
    image_url: string;

    thumb_url?: string | null;
  
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

    currency?: string | null;
  
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

    allow_chat?: boolean | null;

    accepts_agent_participation?: boolean | null;

    publisher_info?: {
      publisher_id: string;
      publisher_type: "OWNER" | "AGENT";
      publisher_name: string | null;
    } | null;

    agents?: PropertyAgentDTO[] | null;

    owner_info?: PropertyOwnerInfoDTO | null;
  }

  export interface PropertyAgentDTO {
    id: string;
    name: string | null;
    photo: string | null;
    average_rating: number;
    total_reviews: number;
  }

  export interface PropertyOwnerInfoDTO {
    owner_id: string;
    owner_first_name: string | null;
    owner_last_name: string | null;
    owner_avatar_url: string | null;
    owner_bio: string | null;
    owner_member_since: string | null;
    owner_total_reviews: number;
    owner_average_rating: number;
    owner_active_properties: number;
  }