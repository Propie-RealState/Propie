const STORAGE_KEY = 'propie_favorite_property_ids';

export function getFavoriteIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

export function toggleFavoriteId(propertyId: string): string[] {
  const current = getFavoriteIds();
  const next = current.includes(propertyId)
    ? current.filter((id) => id !== propertyId)
    : [...current, propertyId];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('favorites:changed'));

  return next;
}

export function isFavorite(propertyId: string): boolean {
  return getFavoriteIds().includes(propertyId);
}
