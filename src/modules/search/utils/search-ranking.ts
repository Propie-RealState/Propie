import { normalizeSearchText } from "./normalize-search-text";

export function rankSearchMatch(
  haystack: string,
  needle: string,
): number {
  const normalizedHaystack =
    normalizeSearchText(haystack);
  const normalizedNeedle =
    normalizeSearchText(needle);

  if (!normalizedNeedle) {
    return 0;
  }

  if (normalizedHaystack === normalizedNeedle) {
    return 100;
  }

  if (normalizedHaystack.startsWith(normalizedNeedle)) {
    return 80;
  }

  const words = normalizedHaystack.split(" ");

  if (
    words.some((word) =>
      word.startsWith(normalizedNeedle),
    )
  ) {
    return 60;
  }

  if (normalizedHaystack.includes(normalizedNeedle)) {
    return 40;
  }

  return 0;
}

export function sortBySearchRank<T>(
  items: T[],
  needle: string,
  getHaystack: (item: T) => string,
  getPopularity?: (item: T) => number,
): T[] {
  return [...items].sort((left, right) => {
    const rankDelta =
      rankSearchMatch(getHaystack(right), needle) -
      rankSearchMatch(getHaystack(left), needle);

    if (rankDelta !== 0) {
      return rankDelta;
    }

    const popularityDelta =
      (getPopularity?.(right) ?? 0) -
      (getPopularity?.(left) ?? 0);

    return popularityDelta;
  });
}
