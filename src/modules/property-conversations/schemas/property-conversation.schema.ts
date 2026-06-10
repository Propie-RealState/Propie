import { z } from "zod";

export const StartConversationSchema = z.object({
  propertyId: z.string().uuid(),
});

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(4000),
});

export const ListMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const ConversationIdParamsSchema = z.object({
  id: z.string().uuid(),
});
