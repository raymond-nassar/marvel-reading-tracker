// Client for the community Marvel metadata API.
// Every request goes through the rate limiter and the IndexedDB cache.

import { RateLimiter, abortError } from './lib/limiter.js';
import { ResponseCache } from './cache.js';
import { DEFAULT_LIMIT, parseNameIndex, searchNames } from './lib/nameIndex.js';

export const DEFAULT_BASE = 'https://marvel.emreparker.com/v1';
export const MAX_LIMIT = 200; // limit=500 returns HTTP 422

// Series and creators are searched locally against a vendored index, because the API ignores
// `q` on those two routes. See lib/nameIndex.js and scripts/vendor-index.mjs.
const INDEXES = {
  series: { file: 'series-index.json', label: 'series' },
  creators: { file: 'creators-index.json', label: 'creator' },
};

export class MarvelApi {
  constructor({ baseUrl = DEFAULT_BASE, limiter, cache, onStatus = () => {}, loadIndex } = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.limiter = limiter ?? new RateLimiter();
    this.cache = cache ?? new ResponseCache({ baseUrl: this.baseUrl });
    this.onStatus = onStatus;
    this.loadIndex = loadIndex ?? fetchNameIndex;
    this.indexes = new Map();
  }

  get queueDepth() {
    return this.limiter.depth;
  }

  async get(path, { signal, cache = true, attempt = 0 } = {}) {
    if (cache) {
      const hit = await this.cache.get(path);
      if (hit) return hit;
    }

    const run = async () => {
      const res = await fetch(this.baseUrl + path, {
        headers: { accept: 'application/json' },
        signal,
      });
      this.limiter.observe(res.headers);

      if (res.status === 429 || res.status >= 500) {
        if (attempt >= 4) throw new ApiError(`Service is busy (HTTP ${res.status}).`, res.status, true);
        const wait = this.limiter.backoff(attempt);
        this.limiter.penalize(wait);
        this.onStatus({ kind: 'backoff', ms: wait, status: res.status });
        throw new RetrySignal(wait);
      }
      if (res.status === 404) throw new ApiError('Not found.', 404, false);
      if (!res.ok) throw new ApiError(`Request failed (HTTP ${res.status}).`, res.status, false);
      return res.json();
    };

    try {
      const data = await this.limiter.schedule(run, { signal });
      if (cache) await this.cache.set(path, data);
      return data;
    } catch (err) {
      if (err instanceof RetrySignal) {
        await sleep(err.wait, signal);
        return this.get(path, { signal, cache, attempt: attempt + 1 });
      }
      throw err;
    }
  }

  health(opts) {
    return this.get('/health', { cache: false, ...opts });
  }

  async searchIssues(q, { limit = 50, signal } = {}) {
    const data = await this.get(
      `/search/issues?q=${encodeURIComponent(q)}&limit=${clampLimit(limit)}`,
      { signal },
    );
    return (data.items ?? []).map(toIssue);
  }

  async issue(id, opts = {}) {
    const data = await this.get(`/issues/${Number(id)}`, opts);
    return toIssue(data);
  }

  // Series and creator search is local, not a request.
  //
  // `/series?q=…` and `/creators?q=…` accept the parameter and silently ignore it: the response
  // is identical to the unfiltered one. Sending it anyway is what made "Add a whole series" and
  // "Browse a creator" answer every query with the alphabetical head of the collection ("#O",
  // "#X", "A CO" for a creator search of "Hickman"), each row wired to a one-click "Add all
  // issues". So the two collections are vendored into src/data/ and filtered here instead.
  //
  // Unlike searchIssues these return an envelope rather than a bare array, because a local
  // search knows how many names actually matched and when its snapshot was taken, and the view
  // has to be able to say "40 of 312" rather than implying the other 272 do not exist.
  async searchNameIndex(kind, q, { limit = DEFAULT_LIMIT } = {}) {
    const index = await this.nameIndex(kind);
    const { items, matched } = searchNames(index.entries, q, { limit });
    return { items, matched, limit, generatedAt: index.generatedAt, total: index.total };
  }

  searchSeries(q, opts) {
    return this.searchNameIndex('series', q, opts);
  }

  searchCreators(q, opts) {
    return this.searchNameIndex('creators', q, opts);
  }

  // One shared load per index, so two searches started in quick succession cannot fetch the
  // same file twice. A failure drops the entry so a later search retries rather than replaying
  // the original error forever.
  nameIndex(kind) {
    let pending = this.indexes.get(kind);
    if (!pending) {
      pending = this.loadIndex(kind).then(parseNameIndex);
      pending.catch(() => {
        if (this.indexes.get(kind) === pending) this.indexes.delete(kind);
      });
      this.indexes.set(kind, pending);
    }
    return pending;
  }

  // Lets a view start the download when the reader opens the search, instead of making the
  // first search wait for it. Failures are the caller's to ignore: this is only a head start.
  warmNameIndex(kind) {
    return this.nameIndex(kind).catch(() => null);
  }

  // Pages to completion. Guarded so a misbehaving `has_next` cannot loop forever.
  async allPages(path, { signal, onProgress, maxPages = 60 } = {}) {
    const out = [];
    let offset = 0;
    for (let page = 0; page < maxPages; page += 1) {
      const sep = path.includes('?') ? '&' : '?';
      const data = await this.get(`${path}${sep}limit=${MAX_LIMIT}&offset=${offset}`, { signal });
      const items = data.items ?? [];
      out.push(...items);
      onProgress?.({ loaded: out.length, total: data.total ?? null });
      if (!data.has_next || items.length === 0) break;
      offset += items.length;
      if (data.total != null && out.length >= data.total) break;
    }
    return out;
  }

  async seriesIssues(seriesId, opts = {}) {
    const items = await this.allPages(`/series/${Number(seriesId)}/issues`, opts);
    return items.map(toIssue);
  }

  async creatorIssues(creatorId, opts = {}) {
    const items = await this.allPages(`/creators/${Number(creatorId)}/issues`, opts);
    // Creator responses omit detailUrl and unlimitedDate; toIssue reconstructs the URL and
    // leaves availability `unknown` rather than implying the issue is not in Unlimited.
    return items.map(toIssue);
  }
}

// Maps an API record to the app's issue shape. Fields the endpoint does not return stay null,
// and `hydrated` records whether we have the fields the UI needs.
export function toIssue(raw) {
  if (!raw) return null;
  const issueId = Number(raw.id ?? raw.issueId);
  return {
    issueId,
    title: raw.title ?? `Issue ${issueId}`,
    number: raw.issueNumber ?? null,
    url: raw.detailUrl ?? `https://www.marvel.com/comics/issue/${issueId}/`,
    seriesId: raw.seriesId ?? null,
    seriesName: raw.seriesName ?? null,
    onSale: raw.onSaleDate ?? null,
    mu: raw.unlimitedDate ?? null,
    digitalId: raw.digitalId ?? null,
    // Only /v1/issues/{id} returns these; list endpoints omit them entirely.
    cover: raw.cover ?? null,
    description: raw.description ?? null,
    pageCount: raw.pageCount ?? null,
    creators: Array.isArray(raw.creators) ? raw.creators : null,
    source: 'api',
    hydrated: raw.digitalId != null,
  };
}

export class ApiError extends Error {
  constructor(message, status, transient) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.transient = transient;
  }
}

// Loads a vendored index from our own origin.
//
// The URL is resolved against this module rather than the page, so it does not depend on which
// HTML file is open or how deep it sits. A failure is reported as a failure: falling back to an
// unfiltered list would put us straight back to answering "Hickman" with "#O".
async function fetchNameIndex(kind) {
  const spec = INDEXES[kind];
  if (!spec) throw new Error(`Unknown search index "${kind}".`);

  const unavailable = (reason) => new ApiError(
    `The ${spec.label} index could not be loaded (${reason}), so ${spec.label} search is unavailable. ` +
    'Reload the page to try again.',
    null,
    false,
  );

  let res;
  try {
    // no-cache, not no-store: the browser still keeps the file, it just revalidates before
    // reusing it, so re-running the vendor script is picked up on the next load rather than
    // whenever a heuristic decides. That guarantee is worth having because the index is a
    // snapshot the view puts a date on, and a stale one would make the view's date a lie.
    // server.mjs sends an ETag, so revalidating an unchanged index costs a 304, not 345 KB.
    // This matches how main.js loads catalog.json and the reading orders.
    res = await fetch(new URL(`../data/${spec.file}`, import.meta.url), { cache: 'no-cache' });
  } catch {
    throw unavailable('it could not be fetched');
  }
  if (!res.ok) throw unavailable(`HTTP ${res.status}`);
  try {
    return await res.json();
  } catch {
    throw unavailable('it is not valid JSON');
  }
}

class RetrySignal {
  constructor(wait) {
    this.wait = wait;
  }
}

function clampLimit(n) {
  return Math.max(1, Math.min(MAX_LIMIT, Number(n) || 20));
}

function sleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError());
    const t = setTimeout(resolve, ms);
    signal?.addEventListener?.('abort', () => {
      clearTimeout(t);
      reject(abortError());
    });
  });
}
