import type { PropertyCurrency } from "../schemas/property-currency.schema";

export type { PropertyCurrency } from "../schemas/property-currency.schema";

export const DEFAULT_PROPERTY_CURRENCY: PropertyCurrency = "USD";

export function formatPropertyPriceLabel(
  price: number,
  currency: PropertyCurrency = DEFAULT_PROPERTY_CURRENCY,
): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
