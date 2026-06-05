import { apiFetch } from './api';

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

function setFavoriteIds(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event('favorites:changed'));
}

function hasAccessToken() {
  return Boolean(localStorage.getItem('accessToken'));
}

export async function loadFavoritesFromServer(): Promise<string[]> {
  if (!hasAccessToken()) {
    return getFavoriteIds();
  }

  try {
    const localIds = getFavoriteIds();
    const response = await apiFetch('/favorites');
    const serverIds = Array.isArray(response?.data)
      ? response.data.filter((id): id is string => typeof id === 'string')
      : [];

    const merged = [...new Set([...localIds, ...serverIds])];
    setFavoriteIds(merged);

    if (localIds.some((id) => !serverIds.includes(id))) {
      await apiFetch('/favorites/sync', {
        method: 'POST',
        body: JSON.stringify({ propertyIds: merged }),
      });
    }

    return merged;
  } catch {
    return getFavoriteIds();
  }
}

export async function syncLocalFavoritesToServer(): Promise<void> {
  if (!hasAccessToken()) {
    return;
  }

  const localIds = getFavoriteIds();

  if (localIds.length === 0) {
    return;
  }

  try {
    await apiFetch('/favorites/sync', {
      method: 'POST',
      body: JSON.stringify({ propertyIds: localIds }),
    });
  } catch {
    // Keep local favorites if sync fails.
  }
}

export async function toggleFavoriteId(propertyId: string): Promise<string[]> {
  const current = getFavoriteIds();
  const isCurrentlyFavorite = current.includes(propertyId);
  const next = isCurrentlyFavorite
    ? current.filter((id) => id !== propertyId)
    : [...current, propertyId];

  setFavoriteIds(next);

  if (hasAccessToken()) {
    try {
      if (isCurrentlyFavorite) {
        await apiFetch(`/favorites/${propertyId}`, {
          method: 'DELETE',
        });
      } else {
        await apiFetch(`/favorites/${propertyId}`, {
          method: 'POST',
        });
      }
    } catch {
      setFavoriteIds(current);
      return current;
    }
  }

  return next;
}

export function isFavorite(propertyId: string): boolean {
  return getFavoriteIds().includes(propertyId);
}
