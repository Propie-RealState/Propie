import { db } from "@/database/client";
import { deleteExpiredSessions } from "@/database/repositories/session.repository";

const CONSUMED_VERIFICATION_TOKEN_RETENTION_DAYS = 7;

export async function cleanupSessions() {
    const deletedCount = await deleteExpiredSessions();

    return {
        deletedCount,
    };
}

export async function cleanupExpiredVerificationTokens() {
    const result = await db.query(
        `
      DELETE FROM email_verification_tokens
      WHERE expires_at < NOW()
         OR (
           verified_at IS NOT NULL
           AND verified_at < NOW() - ($1 || ' days')::interval
         )
    `,
        [CONSUMED_VERIFICATION_TOKEN_RETENTION_DAYS],
    );

    return {
        deletedCount: result.rowCount ?? 0,
    };
}

