import { afterAll, describe, it, expect } from "vitest";

import { db } from "@/database/client";

const EXPECTED_TABLES = [
  "property_conversations",
  "property_conversation_messages",
  "property_conversation_participant_states",
] as const;

describe("property conversations schema", () => {
  afterAll(async () => {
    await db.end();
  });

  it("creates all property conversation tables", async () => {
    const result = await db.query<{ table_name: string }>(
      `
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = ANY($1::text[])
      `,
      [EXPECTED_TABLES],
    );

    const found = result.rows.map((row) => row.table_name).sort();
    expect(found).toEqual([...EXPECTED_TABLES].sort());
  });
});
