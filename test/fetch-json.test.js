import test from 'node:test';
import assert from 'node:assert/strict';
import { RateLimiter } from '../src/js/lib/limiter.js';
import { createJsonFetcher, MAX_ATTEMPTS } from '../scripts/lib/fetch-json.mjs';

// Responses are scripted per call so a test can say "503 twice then 200" without a stub library.
// `headers` is a Map because RateLimiter.observe accepts anything with a get().
function scriptedFetch(statuses, { body = { ok: true }, headers = {} } = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    const status = statuses[Math.min(calls.length, statuses.length - 1)];
    calls.push({ url, init });
    return {
      status,
      ok: status >= 200 && status < 300,
      headers: new Map(Object.entries(headers)),
      json: async () => body,
    };
  };
  return { fetchImpl, calls };
}

// A controllable clock, as in test/limiter.test.js: sleeping advances virtual time rather than
// waiting. Without it these tests take 48 seconds of real time, because penalize() pushes
// pausedUntil forward against Date.now() and the limiter then has to sit out the backoff for real.
function fakeClock() {
  let t = 1_000_000;
  return {
    now: () => t,
    advance: (ms) => { t += ms; },
    sleep: async (ms) => { t += ms; },
  };
}

// No real waiting anywhere. Every wait the retry asked for is recorded so the backoff can be
// asserted, and it advances the same clock the limiter is on.
function makeFetcher(statuses, opts = {}) {
  const { fetchImpl, calls } = scriptedFetch(statuses, opts);
  const clock = fakeClock();
  const retryWaits = [];
  const limiter = new RateLimiter({ now: clock.now, sleep: clock.sleep, ...(opts.limiter || {}) });
  const { getJson } = createJsonFetcher({
    limiter,
    fetch: fetchImpl,
    sleep: async (ms) => { retryWaits.push(ms); clock.advance(ms); },
  });
  return { getJson, calls, limiter, retryWaits, clock };
}

// A slot-holding regression makes these tests hang rather than fail, and node:test has no
// default timeout, so a hung run looks like a slow one for ever. Anything that could deadlock
// gets a deadline and reports as a failure.
function withDeadline(work, what) {
  const timer = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`${what} never completed`)), 2000).unref();
  });
  return Promise.race([work, timer]);
}

test('a 200 is returned as parsed JSON after one request', async () => {
  const { getJson, calls } = makeFetcher([200], { body: { total: 7 } });
  assert.deepEqual(await getJson('/series'), { total: 7 });
  assert.equal(calls.length, 1);
});

test('the JSON accept header the API expects is sent', async () => {
  const { getJson, calls } = makeFetcher([200]);
  await getJson('/series');
  assert.deepEqual(calls[0].init, { headers: { accept: 'application/json' } });
});

test('a 429 is retried and the eventual body is returned', async () => {
  const { getJson, calls } = makeFetcher([429, 200], { body: { total: 1 } });
  assert.deepEqual(await getJson('/series'), { total: 1 });
  assert.equal(calls.length, 2, 'the request should have been made twice');
});

test('a 500 is retried, a 404 is not', async () => {
  const server = makeFetcher([500, 200]);
  await server.getJson('/a');
  assert.equal(server.calls.length, 2);

  const missing = makeFetcher([404]);
  await assert.rejects(() => missing.getJson('/b'), /^Error: 404 \/b$/);
  assert.equal(missing.calls.length, 1, 'a 404 is the answer, not a failure to get one');
});

// One request needing two or more retries is enough to deadlock the nested shape this replaced,
// so the exhaustion path is the cheapest regression test there is. It hangs rather than fails
// against that shape, hence the deadline.
test('retries stop at six attempts and the error names the status', async () => {
  const { getJson, calls } = makeFetcher([503]);
  await withDeadline(
    assert.rejects(() => getJson('/c'), /^Error: 503 after retries: \/c$/),
    'the exhausted retry',
  );
  assert.equal(calls.length, MAX_ATTEMPTS);
});

test('each retry backs off longer than the last, and the limiter is paused with it', async () => {
  const { getJson, retryWaits, limiter } = makeFetcher([503]);
  let paused = 0;
  const realPenalize = limiter.penalize.bind(limiter);
  limiter.penalize = (ms) => { paused += 1; realPenalize(ms); };

  await withDeadline(assert.rejects(() => getJson('/d')), 'the backoff sequence');

  assert.equal(retryWaits.length, MAX_ATTEMPTS - 1, 'one backoff between each pair of attempts');
  assert.equal(paused, MAX_ATTEMPTS - 1, 'every backoff also holds back the other requests');
  // backoff() is half fixed and half jittered, so successive floors rather than successive
  // draws are what is guaranteed to grow.
  for (let i = 1; i < retryWaits.length; i += 1) {
    assert.ok(retryWaits[i] > retryWaits[i - 1] / 2, `wait ${i} collapsed to ${retryWaits[i]}`);
  }
});

test('a retry-after header reaches the limiter', async () => {
  const { getJson, limiter, clock } = makeFetcher([429, 200], { headers: { 'retry-after': '3' } });
  await getJson('/e');
  assert.ok(limiter.pausedUntil > clock.now(), 'the limiter should be holding requests back');
});

// The reason the retry is not nested inside limiter.schedule(). Recursing from inside a
// scheduled job holds the concurrency slot while queueing the job that would release it, so at
// concurrency 2 two requests retrying together wait on each other for ever.
test('two requests retrying at once both finish', async () => {
  const { getJson } = makeFetcher([503, 503, 200]);
  await withDeadline(Promise.all([getJson('/f'), getJson('/g')]), 'the concurrent retries');
});

test('a fetch that throws is not swallowed', async () => {
  const clock = fakeClock();
  const limiter = new RateLimiter({ now: clock.now, sleep: clock.sleep });
  const { getJson } = createJsonFetcher({
    limiter,
    fetch: async () => { throw new Error('ECONNRESET'); },
    sleep: clock.sleep,
  });
  await assert.rejects(() => getJson('/h'), /ECONNRESET/);
});
