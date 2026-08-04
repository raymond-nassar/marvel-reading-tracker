// Cache policy — pure, testable, no IndexedDB.
// Durable user state lives in localStorage; this governs the disposable API response cache
// so it can never grow until it threatens progress persistence.

export const DEFAULT_BUDGET_BYTES = 4 * 1024 * 1024;

export const TTL = {
  issue: 30 * 24 * 60 * 60 * 1000, // per-issue metadata is effectively immutable
  series: 7 * 24 * 60 * 60 * 1000,
  search: 60 * 60 * 1000, // short: results change as the snapshot updates
  creators: 7 * 24 * 60 * 60 * 1000,
  health: 60 * 1000,
  default: 60 * 60 * 1000,
};

// Scoped by base URL and schema version so switching to a self-hosted mirror, or shipping a
// new record shape, can never serve stale entries from the previous configuration.
export function cacheKey({ baseUrl, schemaVersion, path }) {
  return `${baseUrl}|v${schemaVersion}|${path}`;
}

export function ttlFor(path) {
  if (/^\/?issues\/\d+/.test(path)) return TTL.issue;
  if (path.startsWith('/series')) return TTL.series;
  if (path.startsWith('/search')) return TTL.search;
  if (path.startsWith('/creators')) return TTL.creators;
  if (path.startsWith('/health')) return TTL.health;
  return TTL.default;
}

export function isExpired(entry, now = Date.now()) {
  if (!entry) return true;
  if (!Number.isFinite(entry.storedAt) || !Number.isFinite(entry.ttl)) return true;
  return now - entry.storedAt >= entry.ttl;
}

export function sizeOf(value) {
  try {
    return JSON.stringify(value).length * 2; // UTF-16 code units, close enough for budgeting
  } catch {
    return 0;
  }
}

// Returns the keys to drop: expired entries first, then least-recently-accessed, until the
// total fits the budget with room for the incoming entry.
export function selectEvictions(entries, { budget = DEFAULT_BUDGET_BYTES, incoming = 0, now = Date.now() } = {}) {
  const evict = [];
  let total = entries.reduce((n, e) => n + (e.bytes || 0), 0) + incoming;

  const expired = entries.filter((e) => isExpired(e, now));
  for (const e of expired) {
    evict.push(e.key);
    total -= e.bytes || 0;
  }

  if (total <= budget) return evict;

  const live = entries
    .filter((e) => !evict.includes(e.key))
    .sort((a, b) => (a.lastAccess || a.storedAt || 0) - (b.lastAccess || b.storedAt || 0));

  for (const e of live) {
    if (total <= budget) break;
    evict.push(e.key);
    total -= e.bytes || 0;
  }
  return evict;
}
