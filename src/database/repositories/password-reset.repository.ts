import { db } from "../client";

type PasswordResetTokenRow = {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
};

export async function invalidatePasswordResetTokensForUser(
  userId: string,
): Promise<void> {
  await db.query(
    `
      UPDATE password_reset_tokens
      SET used_at = COALESCE(used_at, now())
      WHERE user_id = $1
        AND used_at IS NULL
    `,
    [userId],
  );
}

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await db.query(
    `
      INSERT INTO password_reset_tokens (
        user_id,
        token,
        expires_at
      )
      VALUES ($1, $2, $3)
    `,
    [input.userId, input.tokenHash, input.expiresAt.toISOString()],
  );
}

export async function findValidPasswordResetToken(
  tokenHash: string,
): Promise<PasswordResetTokenRow | null> {
  const result = await db.query<PasswordResetTokenRow>(
    `
      SELECT
        id,
        user_id,
        token,
        expires_at,
        used_at
      FROM password_reset_tokens
      WHERE token = $1
        AND used_at IS NULL
        AND expires_at > now()
      LIMIT 1
    `,
    [tokenHash],
  );

  return result.rows[0] ?? null;
}

export async function markPasswordResetTokenUsed(
  tokenId: string,
): Promise<void> {
  await db.query(
    `
      UPDATE password_reset_tokens
      SET used_at = now()
      WHERE id = $1
    `,
    [tokenId],
  );
}
