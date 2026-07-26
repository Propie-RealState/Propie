import type { MapResult } from "../types/map.types";

/** Total properties represented by map results (pins + cluster members). */
export function countVisibleMapProperties(
  items: readonly MapResult[],
): number {
  return items.reduce((total, item) => {
    if (item.type === "cluster") {
      return total + item.count;
    }

    return total + 1;
  }, 0);
}
