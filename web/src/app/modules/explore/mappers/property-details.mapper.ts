import type {
    PropertyAgentDTO,
    PropertyDetailsDTO,
    PropertyImageDTO,
    PropertyOwnerInfoDTO,
  } from "../types/property-details.dto";
import type { PropertyCurrency } from "../../publish/types/property-publish.types";
import { resolveMediaUrl } from "../../../../lib/api-base";

function normalizeCurrency(
  currency: string | null | undefined,
): PropertyCurrency {
  return currency === "ARS" ? "ARS" : "USD";
}
  
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

      publisherId: property.publisher_info?.publisher_id ?? null,
      publisherType: property.publisher_info?.publisher_type ?? null,
      publisherName: property.publisher_info?.publisher_name ?? null,
  
      title:
        property.title ||
        "Propiedad sin título",
  
      description:
        property.description ||
        "Sin descripción",
  
      propertyType: property.property_type,
  
      operationType: property.operation_type,
  
      price: Number(property.price || 0),

      currency: normalizeCurrency(property.currency),

      bedrooms: property.bedrooms || 0,
  
      bathrooms: property.bathrooms || 0,
  
      areaM2: property.area_m2 || 0,
  
      status: property.status,

      allowChat: property.allow_chat ?? true,

      acceptsAgentParticipation:
        property.accepts_agent_participation ?? true,
  
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
  
      agents: (property.agents ?? []).map((a: PropertyAgentDTO) => ({
        id: a.id,
        name: a.name ?? "",
        photo: resolveMediaUrl(a.photo) ?? undefined,
        rating: a.average_rating ?? 0,
        totalReviews: a.total_reviews ?? 0,
        activeListings: 1,
      })),

      ownerInfo: property.owner_info
        ? {
            id: (property.owner_info as PropertyOwnerInfoDTO).owner_id,
            firstName: (property.owner_info as PropertyOwnerInfoDTO).owner_first_name,
            lastName: (property.owner_info as PropertyOwnerInfoDTO).owner_last_name,
            avatarUrl: resolveMediaUrl(
              (property.owner_info as PropertyOwnerInfoDTO).owner_avatar_url,
            ),
            bio: (property.owner_info as PropertyOwnerInfoDTO).owner_bio,
            memberSince: (property.owner_info as PropertyOwnerInfoDTO).owner_member_since,
            totalReviews: (property.owner_info as PropertyOwnerInfoDTO).owner_total_reviews ?? 0,
            averageRating: (property.owner_info as PropertyOwnerInfoDTO).owner_average_rating ?? 0,
            activeProperties: (property.owner_info as PropertyOwnerInfoDTO).owner_active_properties ?? 0,
          }
        : null,
    };
  }
