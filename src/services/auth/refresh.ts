import { db } from '../../database/client';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from './jwt';

import {
  hashToken,
} from './session';

export async function refreshSession(
  refreshToken: string
) {
  try {

    // ====================================================
    // VERIFY JWT
    // ====================================================

    const payload =
      verifyRefreshToken(
        refreshToken
      );

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
        'INVALID_SESSION'
      );
    }

    if (session.is_revoked) {
      throw new Error(
        'SESSION_REVOKED'
      );
    }

    if (
      new Date(session.expires_at)
      < new Date()
    ) {
      throw new Error(
        'SESSION_EXPIRED'
      );
    }

    // ====================================================
    // REVOKE OLD SESSION
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
    // GENERATE NEW TOKENS
    // ====================================================

    const newAccessToken =
      generateAccessToken({
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      });

    const newRefreshToken =
      generateRefreshToken({
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
      });

    // ====================================================
    // SAVE NEW SESSION
    // ====================================================

    await db.query(
      `
      INSERT INTO sessions (
        user_id,
        refresh_token_hash,
        expires_at
      )
      VALUES (
        $1,
        $2,
        NOW() + interval '30 days'
      )
    `,
      [
        payload.sub,
        hashToken(newRefreshToken),
      ]
    );

    // ====================================================
    // RESPONSE
    // ====================================================

    return {
      accessToken:
        newAccessToken,

      refreshToken:
        newRefreshToken,
    };
  } catch (error) {
    throw new Error(
      'INVALID_REFRESH_TOKEN'
    );
  }
}