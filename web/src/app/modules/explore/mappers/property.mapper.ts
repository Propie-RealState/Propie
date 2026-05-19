import type { PropertyDTO } from "../types/property.dto";
import type { Property } from "../types/property.types";

export function mapPropertyDtoToProperty(
  property: PropertyDTO
): Property {
  return {
    id: property.id,

    title: property.title,

    location: [
      property.city,
      property.province,
    ]
      .filter(Boolean)
      .join(", "),

    price: property.price,

    propertyType: property.property_type,

    operationType: property.operation_type,

    coverImage: property.cover_image
      ? `http://localhost:3000${property.cover_image}`
      : null,

    image: property.cover_image
      ? `http://localhost:3000${property.cover_image}`
      : "",

    rooms: property.bedrooms || 0,

    bathrooms: property.bathrooms || 0,

    sqm: property.area_m2 || 0,

    isNew: false,

    type:
      property.operation_type === "SALE"
        ? "venta"
        : "alquiler",

    distance: "",
  };
}