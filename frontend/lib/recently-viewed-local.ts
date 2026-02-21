const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 20;

export function getLocalRecentlyViewed(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function addLocalRecentlyViewed(productId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalRecentlyViewed().filter((id) => id !== productId);
    const updated = [productId, ...current].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage errors
  }
}

export function clearLocalRecentlyViewed(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}
