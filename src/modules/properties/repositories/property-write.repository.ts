import { db } from "@/database/client";

import type { PropertyLifecycleStatus } from "../constants/property-status.constants";
import { CreatePropertyServiceInput } from "../schemas/create-property.schema";

export async function createPropertyRepository(input: CreatePropertyServiceInput) {
  const result = await db.query(
    `
      INSERT INTO properties (
        owner_id,
        property_type,
        operation_type,
        status
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      )
      RETURNING id
    `,
    [input.ownerId, input.propertyType, input.listingType, "ACTIVE"],
  );

  return {
    propertyId: result.rows[0].id,
  };
}

export async function updatePropertyBasicRepository(input: {
  propertyId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  areaM2: number;
  propertyType: string;
  operationType: string;
}) {
  await db.query(
    `
      UPDATE properties

      SET
        title = $1,
        description = $2,
        price = $3,
        bedrooms = $4,
        bathrooms = $5,
        area_m2 = $6,
        property_type = $7,
        operation_type = $8,
        currency = $9,
        updated_at = now()

      WHERE id = $10
    `,
    [
      input.title,
      input.description,
      input.price,
      input.bedrooms,
      input.bathrooms,
      input.areaM2,
      input.propertyType,
      input.operationType,
      input.currency,
      input.propertyId,
    ],
  );
}

export async function publishPropertyRepository(input: {
  propertyId: string;
  publisherId: string;
  publisherType: "OWNER" | "AGENT";
}) {
  const result = await db.query(
    `
      UPDATE properties
      SET
        status = 'ACTIVE',
        publisher_id = $2,
        publisher_type = $3,
        published_at = now(),
        updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [input.propertyId, input.publisherId, input.publisherType],
  );

  return result.rows[0];
}

export async function updatePropertyStatusRepository(input: {
  propertyId: string;
  status: PropertyLifecycleStatus;
}) {
  const result = await db.query(
    `
      UPDATE properties
      SET
        status = $2,
        updated_at = now()
      WHERE id = $1
      RETURNING *
    `,
    [input.propertyId, input.status],
  );

  return result.rows[0] ?? null;
}
