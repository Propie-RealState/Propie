import { db } from "@/database/client";

export async function canManageProperty(
  userId: string,
  propertyId: string,
): Promise<boolean> {
  const result = await db.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM properties p
        WHERE p.id = $2
          AND (
            p.owner_id = $1
            OR EXISTS (
              SELECT 1
              FROM property_assignments pa
              WHERE pa.property_id = p.id
                AND pa.agent_id = $1
                AND pa.is_active = true
            )
          )
      ) AS can_manage
    `,
    [userId, propertyId],
  );

  return result.rows[0]?.can_manage === true;
}
