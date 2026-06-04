const PROPERTY_TYPE_LABELS: Record<string, string> = {
  HOUSE: "casa",
  APARTMENT: "departamento depto",
  LAND: "terreno lote",
  COMMERCIAL: "comercial local",
  OFFICE: "oficina",
  ROOM: "habitacion cuarto",
};

const OPERATION_TYPE_LABELS: Record<string, string> = {
  SALE: "venta",
  RENT: "alquiler",
  TEMPORARY: "temporario temporal alquiler temporario",
};

const AMENITY_LABELS: Record<string, string> = {
  POOL: "pileta piscina",
  PATIO: "patio",
  BALCONY: "balcon",
  PETS: "mascotas",
  SECURITY: "seguridad",
  GARAGE: "cochera garage",
  GARDEN: "jardin",
  ELEVATOR: "ascensor",
};

export function propertyTypeSearchText(
  propertyType: string | null,
): string {
  if (!propertyType) {
    return "";
  }

  return `${propertyType} ${PROPERTY_TYPE_LABELS[propertyType] ?? ""}`;
}

export function operationTypeSearchText(
  operationType: string | null,
): string {
  if (!operationType) {
    return "";
  }

  return `${operationType} ${OPERATION_TYPE_LABELS[operationType] ?? ""}`;
}

export function amenitySearchText(
  amenity: string | null,
): string {
  if (!amenity) {
    return "";
  }

  return `${amenity} ${AMENITY_LABELS[amenity] ?? amenity.toLowerCase()}`;
}
