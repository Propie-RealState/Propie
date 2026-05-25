import { db } from '@/database/client';

import {
  hashToken,
} from './session';

export async function logoutSession(
  refreshToken: string
) {

  // ====================================================
  // HASH TOKEN
  // ====================================================

  const refreshTokenHash =
    hashToken(refreshToken);

  // ====================================================
  // FIND SESSION
  // ====================================================

  const sessionResult =
    await db.query(
      `
        SELECT *
        FROM sessions
        WHERE refresh_token_hash = $1
        LIMIT 1
      `,
      [refreshTokenHash]
    );

  const session =
    sessionResult.rows[0];

  // ====================================================
  // VALIDATE SESSION
  // ====================================================

  if (!session) {
    throw new Error(
      'SESSION_NOT_FOUND'
    );
  }

  if (session.is_revoked) {
    throw new Error(
      'SESSION_ALREADY_REVOKED'
    );
  }

  // ====================================================
  // REVOKE SESSION
  // ====================================================

  await db.query(
    `
      UPDATE sessions
      SET is_revoked = true
      WHERE id = $1
    `,
    [session.id]
  );

  // ====================================================
  // RESPONSE
  // ====================================================

  return {
    success: true,
  };
}