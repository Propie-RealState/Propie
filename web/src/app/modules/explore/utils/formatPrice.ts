import type { PropertyCurrency } from "../../publish/types/property-publish.types";

export function formatPrice(
  price: string | number,
  currency: PropertyCurrency = "USD",
) {
  const value = Number(price);

  if (Number.isNaN(value)) {
    return String(price);
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}
