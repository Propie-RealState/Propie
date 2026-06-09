import type { PropertyCurrency } from "../../publish/types/property-publish.types";

export function formatMapPrice(
  price: number,
  currency: PropertyCurrency = "USD",
) {
  if (price >= 1000000) {
    return `${currency} ${(price / 1000000).toFixed(1)}M`;
  }

  if (price >= 1000) {
    return `${currency} ${Math.round(price / 1000)}k`;
  }

  return `${currency} ${Math.round(price)}`;
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
