import { db }
from "@/database/client";

import {
  UpdatePropertyBasicInput,
} from "../schemas/update-property-basic.schema";

export async function updatePropertyBasicRepository(
  input: UpdatePropertyBasicInput & {
    propertyId: string;
  }
) {
  const result = await db.query(
    `
      UPDATE properties
      SET
        title = $1,
        description = $2,
        price = $3,
        updated_at = now()
      WHERE id = $4
      RETURNING *
    `,
    [
      input.title,
      input.description,
      input.price,
      input.propertyId,
    ]
  );

  return result.rows[0] ?? null;
}