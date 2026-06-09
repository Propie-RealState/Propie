import { z } from "zod";

export const PropertyCurrencySchema = z.enum(["USD", "ARS"]);

export type PropertyCurrency = z.infer<typeof PropertyCurrencySchema>;

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
