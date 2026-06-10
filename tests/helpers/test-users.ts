import { randomUUID } from "node:crypto";

import { db } from "@/database/client";

type UserRole = "CLIENT" | "OWNER" | "AGENT";

export async function createTestUser(role: UserRole) {
  const suffix = randomUUID().slice(0, 8);

  const result = await db.query<{ id: string }>(
    `
      INSERT INTO users (
        first_name,
        last_name,
        email,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [
      "Test",
      role,
      `test-${role.toLowerCase()}-${suffix}@propie.test`,
      "test-hash",
      role,
    ],
  );

  return result.rows[0].id;
}
