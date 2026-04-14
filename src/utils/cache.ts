const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

export function cacheGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`cache:${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(`cache:${key}`);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  try {
    const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };
    localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
  } catch {
    // localStorage may be full or unavailable — silently ignore
  }
}

export function cacheDelete(key: string): void {
  localStorage.removeItem(`cache:${key}`);
}

export function cacheClear(prefix?: string): void {
  const keys = Object.keys(localStorage).filter((k) =>
    prefix ? k.startsWith(`cache:${prefix}`) : k.startsWith('cache:'),
  );
  keys.forEach((k) => localStorage.removeItem(k));
}
