import { db } from "@/database/client";
import {
  EXPLORE_VISIBLE_STATUSES,
  type PropertyLifecycleStatus,
} from "@/modules/properties/constants/property-status.constants";

/**
 * Lightweight visibility probe for media authorization.
 * Avoids loading the full property graph on every anonymous /media/* request.
 */
export async function isPropertyMediaPubliclyVisible(
  propertyId: string,
): Promise<boolean> {
  const result = await db.query<{ visible: boolean }>(
    `
      SELECT
        published_at IS NOT NULL
        AND status = ANY($2::text[]) AS visible
      FROM properties
      WHERE id = $1
      LIMIT 1
    `,
    [propertyId, EXPLORE_VISIBLE_STATUSES as PropertyLifecycleStatus[]],
  );

  return result.rows[0]?.visible === true;
}
