import { db } from "@/database/client";

export async function cleanupSessions() {

    // ====================================================
    // DELETE EXPIRED SESSIONS
    // ====================================================

    const result =
        await db.query(
            `
        DELETE FROM sessions
        WHERE expires_at < NOW()
      `
        );

    return {
        deletedCount:
            result.rowCount ?? 0,
    };
}

