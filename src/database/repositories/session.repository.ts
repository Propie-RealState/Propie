import { db } from '@/database/client';



// ========================================================
// SESSION ROW
// ========================================================

type SessionRow = {
  id: string;

  user_id: string;

  refresh_token_hash: string;

  ip_address: string | null;

  user_agent: string | null;

  expires_at: string;

  is_revoked: boolean;

  created_at: string;
};



// ========================================================
// SESSION
// ========================================================

export type Session = {
  id: string;

  userId: string;

  refreshTokenHash: string;

  ipAddress: string | null;

  userAgent: string | null;

  expiresAt: string;

  isRevoked: boolean;

  createdAt: string;
};



// ========================================================
// MAPPER
// ========================================================

function mapSessionRowToSession(
  row: SessionRow
): Session {
  return {
    id: row.id,

    userId: row.user_id,

    refreshTokenHash:
      row.refresh_token_hash,

    ipAddress:
      row.ip_address,

    userAgent:
      row.user_agent,

    expiresAt:
      row.expires_at,

    isRevoked:
      row.is_revoked,

    createdAt:
      row.created_at,
  };
}



// ========================================================
// CREATE SESSION
// ========================================================

export async function createSession(
  input: {
    userId: string;

    refreshTokenHash: string;

    expiresAt: Date;

    ipAddress?: string;

    userAgent?: string;
  }
): Promise<Session> {
  const result =
    await db.query<SessionRow>(
      `
        INSERT INTO sessions (
          user_id,
          refresh_token_hash,
          expires_at,
          ip_address,
          user_agent
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5
        )
        RETURNING *
      `,
      [
        input.userId,

        input.refreshTokenHash,

        input.expiresAt,

        input.ipAddress ?? null,

        input.userAgent ?? null,
      ]
    );

  return mapSessionRowToSession(
    result.rows[0]
  );
}



// ========================================================
// FIND SESSION BY TOKEN HASH
// ========================================================

export async function findSessionByTokenHash(
  refreshTokenHash: string
): Promise<Session | null> {
  const result =
    await db.query<SessionRow>(
      `
        SELECT *
        FROM sessions
        WHERE refresh_token_hash = $1
        LIMIT 1
      `,
      [refreshTokenHash]
    );

  if (
    result.rows.length === 0
  ) {
    return null;
  }

  return mapSessionRowToSession(
    result.rows[0]
  );
}



// ========================================================
// FIND SESSION BY ID
// ========================================================

export async function findSessionById(
  sessionId: string
): Promise<Session | null> {
  const result =
    await db.query<SessionRow>(
      `
        SELECT *
        FROM sessions
        WHERE id = $1
        LIMIT 1
      `,
      [sessionId]
    );

  if (
    result.rows.length === 0
  ) {
    return null;
  }

  return mapSessionRowToSession(
    result.rows[0]
  );
}



// ========================================================
// REVOKE SESSION
// ========================================================

export async function revokeSession(
  sessionId: string
): Promise<void> {
  await db.query(
    `
      UPDATE sessions
      SET
        is_revoked = true
      WHERE id = $1
    `,
    [sessionId]
  );
}



// ========================================================
// REVOKE ALL USER SESSIONS
// ========================================================

export async function revokeAllUserSessions(
  userId: string
): Promise<void> {
  await db.query(
    `
      UPDATE sessions
      SET
        is_revoked = true
      WHERE user_id = $1
    `,
    [userId]
  );
}

export async function deleteAllUserSessions(
  userId: string,
): Promise<void> {
  await db.query(
    `
      DELETE FROM sessions
      WHERE user_id = $1
    `,
    [userId],
  );
}



// ========================================================
// DELETE EXPIRED SESSIONS
// ========================================================

export async function deleteExpiredSessions(): Promise<number> {
  const result = await db.query(
    `
      DELETE FROM sessions
      WHERE expires_at < now()
    `,
  );

  return result.rowCount ?? 0;
}