export function formatMapPrice(
  price: number
) {
  if (price >= 1000000) {
    return `USD ${(price / 1000000).toFixed(1)}M`;
  }

  if (price >= 1000) {
    return `USD ${Math.round(price / 1000)}k`;
  }

  return `USD ${Math.round(price)}`;
}

export function formatOperationType(
  operationType: string
) {
  if (operationType === "SALE") {
    return "Venta";
  }

  if (operationType === "RENT") {
    return "Alquiler";
  }

  if (operationType === "TEMPORARY") {
    return "Temporal";
  }

  return operationType;
}

export function formatPropertyType(
  propertyType: string
) {
  const labels:
    Record<string, string> = {
      HOUSE:
        "Casa",
      APARTMENT:
        "Depto",
      LAND:
        "Terreno",
      COMMERCIAL:
        "Comercial",
      OFFICE:
        "Oficina",
    };

  return labels[propertyType] ?? propertyType;
}
