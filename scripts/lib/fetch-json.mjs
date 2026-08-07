// The rate-limited JSON fetch shared by the build scripts.
//
// This was three byte-identical copies, in scripts/vendor-index.mjs, scripts/vendor-orders.mjs
// and scripts/build-event-order.mjs, each pairing a module-level RateLimiter with the same
// retry. Three copies of a retry is three places for a rate-limit fix to be applied twice.
//
// Build-time only, so it lives here rather than under src/js/lib: nothing in this file is
// served to the browser.

import { RateLimiter } from '../../src/js/lib/limiter.js';

// Six attempts in total, the initial one plus five retries, which is what the copies did with
// `attempt >= 5`. At the limiter's own backoff that is a little over half a minute of trying
// before a page is called lost.
export const MAX_ATTEMPTS = 6;

function defaultSleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// The retry is deliberately outside limiter.schedule() rather than inside it.
//
// The copies recursed from within the scheduled job: getJson called limiter.schedule, and the
// retry branch called getJson again while the outer job still held its concurrency slot. Each
// retry therefore took a slot without releasing the one below it, and pump() returns early once
// active reaches concurrency, so the job that would release a slot sat in the queue behind the
// job waiting for it.
//
// Measured against the original shape at its default concurrency of 2: one request needing one
// retry completes, one request needing two retries hangs with active 2 and queued 1, and two
// requests each needing one retry hang with active 2 and queued 2. Nothing times out; the script
// simply stops. Two nested retries is not an exotic case, and 429s arrive in bursts because
// upstream rate limiting is what produces them, so both shapes are reachable in an ordinary run.
//
// Scheduling each attempt separately means the slot is released while backing off, which is also
// the only way the backoff can be paced by the limiter's own windows.
export function createJsonFetcher({
  limiter = new RateLimiter(),
  fetch: fetchImpl = globalThis.fetch,
  sleep = defaultSleep,
  maxAttempts = MAX_ATTEMPTS,
} = {}) {
  async function attemptOnce(url) {
    const res = await fetchImpl(url, { headers: { accept: 'application/json' } });
    limiter.observe(res.headers);
    if (res.status === 429 || res.status >= 500) return { retry: true, status: res.status };
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return { retry: false, body: await res.json() };
  }

  async function getJson(url) {
    for (let attempt = 0; ; attempt += 1) {
      const outcome = await limiter.schedule(() => attemptOnce(url));
      if (!outcome.retry) return outcome.body;
      if (attempt >= maxAttempts - 1) throw new Error(`${outcome.status} after retries: ${url}`);
      const wait = limiter.backoff(attempt);
      limiter.penalize(wait);
      await sleep(wait);
    }
  }

  return { getJson, limiter };
}
