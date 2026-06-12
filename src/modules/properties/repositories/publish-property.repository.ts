import { db }
  from "@/database/client";

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