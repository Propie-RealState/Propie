import { db } from "@/database/client";

import {
  NOTIFICATION_TYPES,
  type CreateNotificationInput,
} from "../types/notification.types";
import { getNotificationPreferencesRepository } from "../repositories/notifications.repository";
import {
  createNotifications,
} from "./notification.service";
import {
  findFavoriteUserIdsByPropertyRepository,
  findUsersNearPropertyRepository,
} from "../repositories/notifications.repository";
import {
  DEFAULT_PROPERTY_CURRENCY,
  formatPropertyPriceLabel,
  type PropertyCurrency,
} from "@/modules/properties/types/property-currency.types";

function uniqueUserIds(userIds: string[]) {
  return [...new Set(userIds)];
}

async function getPropertySummary(propertyId: string) {
  const result = await db.query(
    `
      SELECT
      p.id,
      p.title,
      p.price,
      p.currency,
      p.owner_id,
        pl.city,
        pl.neighborhood
      FROM properties p
      LEFT JOIN property_locations pl
        ON pl.property_id = p.id
      WHERE p.id = $1
      LIMIT 1
    `,
    [propertyId],
  );

  return result.rows[0] ?? null;
}

function buildLocationLabel(property: {
  city?: string | null;
  neighborhood?: string | null;
}) {
  return [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ") || "tu zona";
}

export async function notifyNewPropertyNearby(propertyId: string) {
  const property = await getPropertySummary(propertyId);

  if (!property) {
    return [];
  }

  const userIds = uniqueUserIds(
    await findUsersNearPropertyRepository({
      propertyId,
      excludeUserId: property.owner_id,
    }),
  );

  if (userIds.length === 0) {
    return [];
  }

  const locationLabel = buildLocationLabel(property);
  const title = "Nueva propiedad cerca tuyo";
  const body = `${property.title || "Una propiedad"} en ${locationLabel}`;

  const inputs: CreateNotificationInput[] = userIds.map((userId) => ({
    userId,
    type: NOTIFICATION_TYPES.NEW_PROPERTY_NEARBY,
    title,
    body,
    entityType: "property",
    entityId: propertyId,
    metadata: {
      propertyTitle: property.title,
      price: property.price,
      currency: property.currency ?? "USD",
    },
  }));

  return createNotifications(inputs);
}

export async function notifyPropertyPublished(propertyId: string) {
  await notifyNewPropertyNearby(propertyId);
}

export async function notifyFavoriteUsersOfPropertyChange(input: {
  propertyId: string;
  type:
    | typeof NOTIFICATION_TYPES.PROPERTY_PRICE_CHANGED
    | typeof NOTIFICATION_TYPES.PROPERTY_UPDATED
    | typeof NOTIFICATION_TYPES.PROPERTY_FAVORITE_UPDATED;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  excludeUserId?: string;
}) {
  const userIds = uniqueUserIds(
    await findFavoriteUserIdsByPropertyRepository(input.propertyId),
  ).filter((userId) => userId !== input.excludeUserId);

  if (userIds.length === 0) {
    return [];
  }

  const inputs: CreateNotificationInput[] = userIds.map((userId) => ({
    userId,
    type: input.type,
    title: input.title,
    body: input.body,
    entityType: "property",
    entityId: input.propertyId,
    metadata: input.metadata ?? {},
  }));

  return createNotifications(inputs);
}

export async function notifyPropertyPriceChanged(input: {
  propertyId: string;
  oldPrice: number;
  newPrice: number;
  oldCurrency?: PropertyCurrency;
  newCurrency?: PropertyCurrency;
  excludeUserId?: string;
}) {
  const property = await getPropertySummary(input.propertyId);
  const newCurrency =
    input.newCurrency ??
    property?.currency ??
    DEFAULT_PROPERTY_CURRENCY;
  const oldCurrency =
    input.oldCurrency ??
    property?.currency ??
    DEFAULT_PROPERTY_CURRENCY;
  const title = "Cambio de precio";
  const propertyTitle = property?.title || "Una propiedad guardada";
  const newPriceLabel = formatPropertyPriceLabel(
    input.newPrice,
    newCurrency,
  );
  const oldPriceLabel = formatPropertyPriceLabel(
    input.oldPrice,
    oldCurrency,
  );

  let body: string;
  const priceChanged = input.oldPrice !== input.newPrice;
  const currencyChanged = oldCurrency !== newCurrency;

  if (priceChanged && currencyChanged) {
    body = `${propertyTitle} ahora cuesta ${newPriceLabel} (antes ${oldPriceLabel})`;
  } else if (currencyChanged) {
    body = `${propertyTitle} ahora se publica en ${newCurrency} (${newPriceLabel})`;
  } else {
    body = `${propertyTitle} ahora cuesta ${newPriceLabel}`;
  }

  return notifyFavoriteUsersOfPropertyChange({
    propertyId: input.propertyId,
    type: NOTIFICATION_TYPES.PROPERTY_PRICE_CHANGED,
    title,
    body,
    metadata: {
      oldPrice: input.oldPrice,
      newPrice: input.newPrice,
      oldCurrency,
      newCurrency,
      propertyTitle: property?.title ?? null,
    },
    excludeUserId: input.excludeUserId,
  });
}

export async function notifyPropertyUpdated(input: {
  propertyId: string;
  excludeUserId?: string;
}) {
  const property = await getPropertySummary(input.propertyId);
  const title = "Propiedad actualizada";
  const body = `${property?.title || "Una propiedad guardada"} tiene novedades`;

  return notifyFavoriteUsersOfPropertyChange({
    propertyId: input.propertyId,
    type: NOTIFICATION_TYPES.PROPERTY_FAVORITE_UPDATED,
    title,
    body,
    metadata: {
      propertyTitle: property?.title ?? null,
    },
    excludeUserId: input.excludeUserId,
  });
}

export async function notifyOwnerAgentApplicationReceived(input: {
  ownerId: string;
  propertyId: string;
  applicationId: string;
  agentName: string;
  propertyTitle: string | null;
}) {
  return createNotifications([
    {
      userId: input.ownerId,
      type: NOTIFICATION_TYPES.AGENT_APPLICATION_RECEIVED,
      title: "Nueva solicitud de agente",
      body: `${input.agentName} quiere trabajar en ${input.propertyTitle || "tu propiedad"}`,
      entityType: "agent_application",
      entityId: input.applicationId,
      metadata: {
        propertyId: input.propertyId,
        agentName: input.agentName,
        propertyTitle: input.propertyTitle,
      },
    },
  ]);
}

export async function notifyAgentApplicationStatus(input: {
  agentId: string;
  applicationId: string;
  propertyId: string;
  propertyTitle: string | null;
  status: "ACCEPTED" | "REJECTED";
}) {
  const accepted = input.status === "ACCEPTED";

  return createNotifications([
    {
      userId: input.agentId,
      type: accepted
        ? NOTIFICATION_TYPES.AGENT_APPLICATION_ACCEPTED
        : NOTIFICATION_TYPES.AGENT_APPLICATION_REJECTED,
      title: accepted
        ? "Solicitud aceptada"
        : "Solicitud rechazada",
      body: accepted
        ? `Tu solicitud para ${input.propertyTitle || "la propiedad"} fue aceptada`
        : `Tu solicitud para ${input.propertyTitle || "la propiedad"} fue rechazada`,
      entityType: "agent_application",
      entityId: input.applicationId,
      metadata: {
        propertyId: input.propertyId,
        propertyTitle: input.propertyTitle,
        status: input.status,
      },
    },
  ]);
}

export async function notifyMessageReceived(input: {
  recipientUserId: string;
  conversationId: string;
  senderName: string;
  preview: string;
}) {
  return notifyPropertyConversationMessage({
    conversationId: input.conversationId,
    propertyId: null,
    senderName: input.senderName,
    preview: input.preview,
    recipientUserIds: [input.recipientUserId],
  });
}

export async function notifyPropertyConversationMessage(input: {
  conversationId: string;
  propertyId: string | null;
  senderName: string;
  preview: string;
  recipientUserIds: string[];
}) {
  if (input.recipientUserIds.length === 0) {
    return [];
  }

  const enabledRecipientUserIds = [];

  for (const userId of input.recipientUserIds) {
    const preferences = await getNotificationPreferencesRepository(userId);

    if (preferences?.messages_enabled ?? true) {
      enabledRecipientUserIds.push(userId);
    }
  }

  if (enabledRecipientUserIds.length === 0) {
    return [];
  }

  const inputs: CreateNotificationInput[] =
    enabledRecipientUserIds.map((userId) => ({
      userId,
      type: NOTIFICATION_TYPES.MESSAGE_RECEIVED,
      title: "Nuevo mensaje",
      body: `${input.senderName}: ${input.preview}`,
      entityType: "property_conversation",
      entityId: input.conversationId,
      metadata: {
        senderName: input.senderName,
        preview: input.preview,
        propertyId: input.propertyId,
      },
    }));

  return createNotifications(inputs);
}
