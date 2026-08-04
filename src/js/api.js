// Client for the community Marvel metadata API.
// Every request goes through the rate limiter and the IndexedDB cache.

import { RateLimiter, abortError } from './lib/limiter.js';
import { ResponseCache } from './cache.js';

export const DEFAULT_BASE = 'https://marvel.emreparker.com/v1';
export const MAX_LIMIT = 200; // limit=500 returns HTTP 422

export class MarvelApi {
  constructor({ baseUrl = DEFAULT_BASE, limiter, cache, onStatus = () => {} } = {}) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.limiter = limiter ?? new RateLimiter();
    this.cache = cache ?? new ResponseCache({ baseUrl: this.baseUrl });
    this.onStatus = onStatus;
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

  async searchSeries(q, { limit = 50, signal } = {}) {
    const data = await this.get(`/series?q=${encodeURIComponent(q)}&limit=${clampLimit(limit)}`, { signal });
    return data.items ?? [];
  }

  async searchCreators(q, { limit = 50, signal } = {}) {
    const data = await this.get(`/creators?q=${encodeURIComponent(q)}&limit=${clampLimit(limit)}`, { signal });
    return data.items ?? [];
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
