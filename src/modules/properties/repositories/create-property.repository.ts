import { db }
from "@/database/client";

import {
  CreatePropertyServiceInput,
} from "../schemas/create-property.schema";

export async function createPropertyRepository(
  input: CreatePropertyServiceInput
) {
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
    [
      input.ownerId,
      input.propertyType,
      input.listingType,
      "DRAFT",
    ]
  );

  return {
    propertyId: result.rows[0].id,
  };
}