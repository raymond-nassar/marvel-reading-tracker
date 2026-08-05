// Rate limiter for marvel.emreparker.com.
// Upstream allows 60 requests/minute with a burst of 30. We stay clear of both with two
// exact rolling windows rather than a token bucket: a bucket sized 45 refilling at 45/min
// can emit 45 immediately and still refill inside the same minute, breaching the cap.

export const WINDOWS = [
  { max: 45, ms: 60_000 },
  { max: 20, ms: 10_000 },
];

export class RateLimiter {
  constructor({ windows = WINDOWS, now = () => Date.now(), sleep = defaultSleep, concurrency = 2 } = {}) {
    this.windows = windows.map((w) => ({ ...w, hits: [] }));
    this.now = now;
    this.sleep = sleep;
    this.concurrency = concurrency;
    this.queue = [];
    this.active = 0;
    this.pausedUntil = 0;
  }

  get depth() {
    return this.queue.length + this.active;
  }

  prune() {
    const t = this.now();
    for (const w of this.windows) {
      while (w.hits.length && t - w.hits[0] >= w.ms) w.hits.shift();
    }
  }

  // Milliseconds until a request may be issued. 0 means now.
  waitMs() {
    this.prune();
    const t = this.now();
    let wait = Math.max(0, this.pausedUntil - t);
    for (const w of this.windows) {
      if (w.hits.length >= w.max) {
        wait = Math.max(wait, w.hits[w.hits.length - w.max] + w.ms - t);
      }
    }
    return wait;
  }

  record() {
    const t = this.now();
    for (const w of this.windows) w.hits.push(t);
  }

  // Accepts a Headers object or a plain header map.
  observe(headers) {
    if (!headers) return;
    const get = (k) => (typeof headers.get === 'function' ? headers.get(k) : headers[k]);
    const retry = get('retry-after');
    if (retry != null && retry !== '') {
      const secs = Number(retry);
      if (Number.isFinite(secs)) this.pausedUntil = Math.max(this.pausedUntil, this.now() + secs * 1000);
    }
    const remaining = Number(get('x-ratelimit-remaining'));
    if (Number.isFinite(remaining) && remaining <= 1) {
      this.pausedUntil = Math.max(this.pausedUntil, this.now() + 2000);
    }
  }

  backoff(attempt) {
    const base = Math.min(30_000, 1000 * 2 ** attempt);
    return base / 2 + Math.random() * (base / 2);
  }

  penalize(ms) {
    this.pausedUntil = Math.max(this.pausedUntil, this.now() + ms);
  }

  schedule(job, { signal } = {}) {
    return new Promise((resolve, reject) => {
      const entry = { job, resolve, reject, signal };
      if (signal?.aborted) return reject(abortError());
      signal?.addEventListener?.('abort', () => {
        const i = this.queue.indexOf(entry);
        if (i >= 0) {
          this.queue.splice(i, 1);
          reject(abortError());
        }
      });
      this.queue.push(entry);
      this.pump();
    });
  }

  async pump() {
    if (this.active >= this.concurrency) return;
    const entry = this.queue.shift();
    if (!entry) return;
    this.active += 1;
    try {
      if (entry.signal?.aborted) throw abortError();
      let wait = this.waitMs();
      while (wait > 0) {
        // The sleep must be interruptible. An entry that has already left the queue is no
        // longer reachable by the abort listener in schedule(), so a plain sleep would keep a
        // cancelled request parked for the whole rate-limit window, long enough for the user
        // to start a second run that then races the first.
        await this.sleepOrAbort(wait, entry.signal);
        if (entry.signal?.aborted) throw abortError();
        wait = this.waitMs();
      }
      this.record();
      entry.resolve(await entry.job());
    } catch (err) {
      entry.reject(err);
    } finally {
      this.active -= 1;
      this.pump();
    }
  }

  sleepOrAbort(ms, signal) {
    if (!signal) return this.sleep(ms);
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        signal.removeEventListener?.('abort', finish);
        resolve();
      };
      signal.addEventListener?.('abort', finish, { once: true });
      this.sleep(ms).then(finish);
    });
  }

  clear() {
    const pending = this.queue.splice(0, this.queue.length);
    for (const e of pending) e.reject(abortError());
  }
}

export function abortError() {
  const e = new Error('Aborted');
  e.name = 'AbortError';
  return e;
}

function defaultSleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
