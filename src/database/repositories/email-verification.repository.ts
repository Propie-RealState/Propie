import { db } from "../client";

type EmailVerificationTokenRow = {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  verified_at: string | null;
};

export async function invalidateEmailVerificationTokensForUser(
  userId: string,
): Promise<void> {
  await db.query(
    `
      UPDATE email_verification_tokens
      SET verified_at = COALESCE(verified_at, now())
      WHERE user_id = $1
        AND verified_at IS NULL
    `,
    [userId],
  );
}

export async function createEmailVerificationToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  await db.query(
    `
      INSERT INTO email_verification_tokens (
        user_id,
        token,
        expires_at
      )
      VALUES ($1, $2, $3)
    `,
    [input.userId, input.tokenHash, input.expiresAt.toISOString()],
  );
}

export async function findValidEmailVerificationToken(input: {
  userId: string;
  tokenHash: string;
}): Promise<EmailVerificationTokenRow | null> {
  const result = await db.query<EmailVerificationTokenRow>(
    `
      SELECT
        id,
        user_id,
        token,
        expires_at,
        verified_at
      FROM email_verification_tokens
      WHERE user_id = $1
        AND token = $2
        AND verified_at IS NULL
        AND expires_at > now()
      LIMIT 1
    `,
    [input.userId, input.tokenHash],
  );

  return result.rows[0] ?? null;
}

export async function findLatestEmailVerificationToken(
  userId: string,
): Promise<EmailVerificationTokenRow | null> {
  const result = await db.query<EmailVerificationTokenRow>(
    `
      SELECT
        id,
        user_id,
        token,
        expires_at,
        verified_at
      FROM email_verification_tokens
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `,
    [userId],
  );

  return result.rows[0] ?? null;
}

export async function markEmailVerificationTokenUsed(
  tokenId: string,
): Promise<void> {
  await db.query(
    `
      UPDATE email_verification_tokens
      SET verified_at = now()
      WHERE id = $1
    `,
    [tokenId],
  );
}
