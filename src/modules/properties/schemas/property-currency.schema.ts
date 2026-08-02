import { z } from "zod";

export const PropertyCurrencySchema = z.enum(["USD", "ARS"]);

export type PropertyCurrency = z.infer<typeof PropertyCurrencySchema>;
