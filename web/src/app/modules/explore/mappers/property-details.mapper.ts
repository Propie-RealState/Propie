import type {
    PropertyDetailsDTO,
    PropertyImageDTO,
  } from "../types/property-details.dto";
import { resolveMediaUrl } from "../../../../lib/api-base";
  
  export function mapPropertyDetails(
    property: PropertyDetailsDTO
  ) {
    const images =
      property.images?.map(
        (image: PropertyImageDTO) => ({
          id: image.id,
  
          url: resolveMediaUrl(image.image_url) ?? "",
  
          isCover: image.is_cover,
        })
      ) || [];
  
    const coverImage =
      images.find((img) => img.isCover)?.url ||
      images[0]?.url ||
      "";
  
    return {
      id: property.id,
  
      ownerId: property.owner_id,
  
      title:
        property.title ||
        "Propiedad sin título",
  
      description:
        property.description ||
        "Sin descripción",
  
      propertyType: property.property_type,
  
      operationType: property.operation_type,
  
      price: Number(property.price || 0),
  
      bedrooms: property.bedrooms || 0,
  
      bathrooms: property.bathrooms || 0,
  
      areaM2: property.area_m2 || 0,
  
      status: property.status,
  
      createdAt: property.created_at,
  
      updatedAt: property.updated_at,
  
      publishedAt: property.published_at,
  
      location: {
        country: property.country || "",
  
        province: property.province || "",
  
        city: property.city || "",
  
        neighborhood:
          property.neighborhood || "",
  
        address: property.address || "",
  
        latitude: property.latitude || null,
  
        longitude: property.longitude || null,
      },
  
      images,
  
      coverImage,
  
      views: 0,
  
      favorites: 0,
  
      agents: [],
    };
  }
