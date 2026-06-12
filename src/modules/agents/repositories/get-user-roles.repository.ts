import { db } from "@/database/client";

export type UserRoleRow = {
  id: string;
  role: string;
};

export async function getUserRolesByIdsRepository(
  userIds: string[],
): Promise<UserRoleRow[]> {
  const result = await db.query<UserRoleRow>(
    `SELECT id, role FROM users WHERE id = ANY($1)`,
    [userIds],
  );

  return result.rows;
}
