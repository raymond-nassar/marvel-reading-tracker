import test from 'node:test';
import assert from 'node:assert/strict';
import { RateLimiter, WINDOWS, abortError } from '../src/js/lib/limiter.js';

// A controllable clock. `sleep` advances virtual time instead of waiting, so the dual-window
// behaviour is asserted exactly rather than by timing a real run.
function fakeClock() {
  let t = 1_000_000;
  return {
    now: () => t,
    advance: (ms) => { t += ms; },
    sleep: async (ms) => { t += ms; },
  };
}

test('limiter allows a burst up to the short window, then makes callers wait', async () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep, concurrency: 1 });
  const short = WINDOWS[1];

  for (let i = 0; i < short.max; i += 1) {
    assert.equal(rl.waitMs(), 0, `request ${i + 1} should not wait`);
    rl.record();
  }
  assert.ok(rl.waitMs() > 0, 'the request past the short window must wait');
});

test('short window reopens once its interval has elapsed', () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep });
  const short = WINDOWS[1];

  for (let i = 0; i < short.max; i += 1) rl.record();
  assert.ok(rl.waitMs() > 0);

  clock.advance(short.ms);
  assert.equal(rl.waitMs(), 0, 'hits older than the window must be pruned');
});

test('long window still constrains after the short window has drained', () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep });
  const [long, short] = WINDOWS;

  // Spend the whole minute allowance in short bursts, advancing past each short window.
  for (let i = 0; i < long.max; i += 1) {
    rl.record();
    if ((i + 1) % short.max === 0) clock.advance(short.ms);
  }

  assert.ok(rl.waitMs() > 0, 'the 60s cap must bind even when the 10s window is clear');
});

test('never exceeds either window across a long simulated run', async () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep, concurrency: 1 });
  const stamps = [];

  for (let i = 0; i < 120; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await rl.schedule(async () => { stamps.push(clock.now()); });
  }

  for (const w of WINDOWS) {
    for (let i = 0; i + w.max < stamps.length; i += 1) {
      const span = stamps[i + w.max] - stamps[i];
      assert.ok(span >= w.ms, `${w.max + 1} requests inside ${w.ms}ms breaches the ${w.max}/${w.ms}ms window`);
    }
  }
});

test('Retry-After header pauses the limiter', () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep });

  rl.observe(new Map([['retry-after', '5']]));
  assert.ok(rl.waitMs() >= 5000, 'Retry-After must be honoured');

  clock.advance(5000);
  assert.equal(rl.waitMs(), 0);
});

test('observe accepts a Headers-like object and a plain map', () => {
  const clock = fakeClock();
  const a = new RateLimiter({ now: clock.now, sleep: clock.sleep });
  a.observe({ get: (k) => (k === 'retry-after' ? '3' : null) });
  assert.ok(a.waitMs() >= 3000);

  const b = new RateLimiter({ now: clock.now, sleep: clock.sleep });
  b.observe({ 'retry-after': '2' });
  assert.ok(b.waitMs() >= 2000);
});

test('a near-exhausted quota header backs off pre-emptively', () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep });
  rl.observe({ 'x-ratelimit-remaining': '0' });
  assert.ok(rl.waitMs() > 0);
});

test('malformed Retry-After is ignored rather than poisoning the clock', () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep });
  rl.observe({ 'retry-after': 'Wed, 21 Oct 2015 07:28:00 GMT' });
  assert.equal(rl.waitMs(), 0);
  assert.ok(Number.isFinite(rl.pausedUntil));
});

test('backoff grows but stays bounded', () => {
  const rl = new RateLimiter();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const ms = rl.backoff(attempt);
    assert.ok(ms > 0 && ms <= 30_000, `attempt ${attempt} produced ${ms}`);
  }
});

test('queued jobs run and resolve in order at concurrency 1', async () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep, concurrency: 1 });
  const seen = [];
  await Promise.all([1, 2, 3].map((n) => rl.schedule(async () => { seen.push(n); return n; })));
  assert.deepEqual(seen, [1, 2, 3]);
});

test('a rejected job does not stall the queue', async () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep, concurrency: 1 });

  await assert.rejects(rl.schedule(async () => { throw new Error('boom'); }), /boom/);
  assert.equal(await rl.schedule(async () => 'ok'), 'ok');
  assert.equal(rl.depth, 0, 'the active counter must be released on failure');
});

test('aborting a queued job rejects it and leaves the queue usable', async () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep, concurrency: 1 });
  const ctl = new AbortController();

  let release;
  const blocker = rl.schedule(() => new Promise((r) => { release = r; }));
  const pending = rl.schedule(async () => 'never', { signal: ctl.signal });
  ctl.abort();

  await assert.rejects(pending, (e) => e.name === 'AbortError');
  release('done');
  assert.equal(await blocker, 'done');
});

test('scheduling with an already-aborted signal rejects immediately', async () => {
  const rl = new RateLimiter();
  const ctl = new AbortController();
  ctl.abort();
  await assert.rejects(rl.schedule(async () => 'x', { signal: ctl.signal }), (e) => e.name === 'AbortError');
});

test('clear rejects everything still queued', async () => {
  const clock = fakeClock();
  const rl = new RateLimiter({ now: clock.now, sleep: clock.sleep, concurrency: 1 });

  let release;
  const blocker = rl.schedule(() => new Promise((r) => { release = r; }));
  const queued = rl.schedule(async () => 'x');
  rl.clear();

  await assert.rejects(queued, (e) => e.name === 'AbortError');
  release('done');
  await blocker;
});

test('abortError is shaped so callers can detect cancellation', () => {
  const e = abortError();
  assert.equal(e.name, 'AbortError');
  assert.ok(e instanceof Error);
});
