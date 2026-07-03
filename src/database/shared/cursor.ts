import { z } from "zod";

/**
 * Keyset (cursor) pagination helpers.
 *
 * The cursor is an opaque, base64url-encoded JSON payload carrying the
 * ordering key of the last row returned: (created_at, id). Clients must
 * treat it as a black box — they only echo `nextCursor` back to fetch the
 * following page. Encoding both fields (never created_at alone) keeps the
 * order total and stable even when timestamps collide.
 */

export type Cursor = {
  createdAt: string;
  id: string;
};

const CursorPayloadSchema = z.object({
  // ISO timestamp of the last row's created_at.
  c: z.string().min(1),
  // UUID of the last row's id (tiebreaker).
  i: z.string().uuid(),
});

export function encodeCursor(cursor: Cursor): string {
  const payload = JSON.stringify({
    c: cursor.createdAt,
    i: cursor.id,
  });

  return Buffer.from(payload, "utf8").toString("base64url");
}

/**
 * Decodes an opaque cursor. Returns null for any malformed / tampered
 * input so callers can reject with a 400 instead of leaking internals.
 */
export function decodeCursor(raw: string): Cursor | null {
  try {
    const json = Buffer.from(raw, "base64url").toString("utf8");
    const parsed = CursorPayloadSchema.safeParse(JSON.parse(json));

    if (!parsed.success) {
      return null;
    }

    const createdAt = new Date(parsed.data.c);

    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    return {
      createdAt: parsed.data.c,
      id: parsed.data.i,
    };
  } catch {
    return null;
  }
}

export type KeysetPage<T> = {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
};

/**
 * Builds a keyset page from `limit + 1` fetched rows. Fetching one extra
 * row is how we know whether a next page exists without a COUNT query.
 * `getKey` extracts the ordering key from the last returned row.
 */
export function buildKeysetPage<T>(
  rows: T[],
  limit: number,
  getKey: (row: T) => Cursor,
): KeysetPage<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const last = items[items.length - 1];

  return {
    items,
    hasMore,
    nextCursor: last ? encodeCursor(getKey(last)) : null,
  };
}
