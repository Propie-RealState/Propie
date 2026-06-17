const STORAGE_KEY = 'propie_last_viewed_property';

export function setLastViewedProperty(propertyId: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, propertyId);
  } catch {
    // sessionStorage may be unavailable
  }
}

export function getLastViewedPropertyId(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getLastViewedPropertyPath(): string | null {
  const id = getLastViewedPropertyId();
  return id ? `/propiedad/${id}` : null;
}
