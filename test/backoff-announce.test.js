// What a reader hears while the metadata service is refusing to answer.
//
// BL-124 was found while verifying BL-090 in Edge: a service stubbed to answer 503 produced four
// announcements for one request and the first two were identical, "Waiting 1 seconds" twice. Two
// faults on one line, a repeat and a plural, and the repeat needed a decision the plural did not.
// The policy half is held here against the sentence; the reachability half is held against a
// stubbed service that answers 503, because the only thing that makes the repeat matter is how
// many times a real run reaches it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { backoffAnnouncer } from '../src/js/main.js';
import { MarvelApi } from '../src/js/api.js';
import { RateLimiter } from '../src/js/lib/limiter.js';

function heard() {
  const said = [];
  const announce = backoffAnnouncer((m) => said.push(m));
  return { said, announce };
}

const backoff = (ms) => ({ kind: 'backoff', ms, status: 503 });

// The plural half, and the smaller of the two. It is fixed here rather than on its own because it
// lives inside the same template string as the count the dedupe reads.
test('one second is one second, and everything else is seconds', () => {
  const { said, announce } = heard();
  announce(backoff(1000));
  announce({ kind: 'ok' });
  announce(backoff(3000));
  assert.deepEqual(said, [
    'The metadata service asked us to slow down. Waiting 1 second.',
    'The metadata service asked us to slow down. Waiting 3 seconds.',
  ]);
});

// The reported sequence, replayed. 1, 1, 3, 6 is what one request against the stub produced, and
// three sentences is what a reader should have heard.
test('the sequence that raised this item speaks three times, not four', () => {
  const { said, announce } = heard();
  for (const ms of [900, 1200, 3400, 6200]) announce(backoff(ms));
  assert.deepEqual(said.map((s) => s.slice(s.indexOf('Waiting'))), [
    'Waiting 1 second.',
    'Waiting 3 seconds.',
    'Waiting 6 seconds.',
  ]);
});

// The decision the item asked for, and the half a guard keyed on the wait alone cannot make. A
// wait that has been heard is silent for as long as the service stays silent, and audible again as
// soon as it has answered, because those are two different stalls and the second is news.
test('an answer from the service ends the stall, so the same wait is heard again', () => {
  const { said, announce } = heard();
  announce(backoff(1000));
  announce(backoff(1000));
  assert.equal(said.length, 1, 'the second is the same stall, so it is not news');

  announce({ kind: 'ok', status: 200 });
  announce(backoff(1000));
  assert.equal(said.length, 2, 'and after an answer the same wait is a different stall');
});

// Not monotonic, which is why this is a set rather than the last-value guard passive announcements
// use. Attempt 0 of the next request draws from the smallest band again, so a guard remembering
// only the previous wait would let a repeat through the moment the waits came back down.
test('a wait already heard stays silent even after a longer one, within one stall', () => {
  const { said, announce } = heard();
  for (const ms of [800, 3000, 700, 6000, 900]) announce(backoff(ms));
  assert.deepEqual(said.map((s) => s.slice(s.indexOf('Waiting'))), [
    'Waiting 1 second.',
    'Waiting 3 seconds.',
    'Waiting 6 seconds.',
  ]);
});

// A 404 is an answer. It is not a welcome one, and the point of reporting it is that the service
// is responding rather than that the response was useful, which is the only thing that can tell
// this policy a run of backoffs has ended.
test('any answer ends the stall, including a refusal', () => {
  const { said, announce } = heard();
  announce(backoff(1000));
  announce({ kind: 'ok', status: 404 });
  announce(backoff(1000));
  assert.equal(said.length, 2);
});

test('a status this policy has no sentence for says nothing and clears nothing', () => {
  const { said, announce } = heard();
  announce(backoff(1000));
  announce(undefined);
  announce({ kind: 'queue', depth: 3 });
  announce(backoff(1000));
  assert.equal(said.length, 1, 'the unknown statuses neither spoke nor ended the stall');
});

// The floor, pinned across two modules. backoff(0) draws from [500, 1000), so the smallest wait
// the limiter can produce rounds to 1 rather than to 0, and "Waiting 0 seconds" is unreachable
// rather than merely unobserved. A change to that band on one side would fail here rather than
// ship a sentence saying the app is waiting no time at all.
test('the smallest wait the limiter can produce is announced as one second, never zero', () => {
  const limiter = new RateLimiter();
  const draws = Array.from({ length: 200 }, () => limiter.backoff(0));
  assert.ok(Math.min(...draws) >= 500, 'attempt 0 draws from [500, 1000)');

  const { said, announce } = heard();
  announce(backoff(Math.min(...draws)));
  assert.deepEqual(said, ['The metadata service asked us to slow down. Waiting 1 second.']);
});

// ---------------------------------------------------------------------------------------------
// Against a stubbed service, because the count is the whole point.

// A controllable clock, as in test/fetch-json.test.js and test/limiter.test.js. Without it these
// take about fifteen seconds of real time each: the retry chain waits between attempts and
// penalize() pushes the limiter's own pause against the same clock.
function fakeClock() {
  let t = 1_000_000;
  return { now: () => t, sleep: async (ms) => { t += ms; } };
}

// Scripted per call rather than one status for every call, so a test can say "503 until it is
// not". Headers are a Map because RateLimiter.observe accepts anything with a get().
function stubService(statuses) {
  const calls = [];
  const fetchImpl = async (url) => {
    const status = statuses[Math.min(calls.length, statuses.length - 1)];
    calls.push({ url, status });
    return {
      status,
      ok: status >= 200 && status < 300,
      headers: new Map(),
      json: async () => ({ issue_count: 1 }),
    };
  };
  return { fetchImpl, calls };
}

function clientAnnouncing(statuses, backoffs) {
  const clock = fakeClock();
  const { fetchImpl, calls } = stubService(statuses);
  const said = [];
  const announce = backoffAnnouncer((m) => said.push(m));
  const limiter = new RateLimiter({ now: clock.now, sleep: clock.sleep });
  // backoff() draws at random inside each attempt's band, so any count asserted against the real
  // draw is a coin toss: the four reachable attempts can round to four distinct integers as easily
  // as to two. Scripting the draw is what makes the reported sequence reproducible rather than
  // likely. The property that holds for every draw is asserted below against the real one.
  if (backoffs) limiter.backoff = (attempt) => backoffs[Math.min(attempt, backoffs.length - 1)];
  const api = new MarvelApi({
    limiter,
    fetch: fetchImpl,
    sleep: clock.sleep,
    onStatus: announce,
  });
  return { api, said, calls };
}

// The measurement the item was raised on, reproduced without a browser. Five calls, because the
// client gives up on the fifth rather than backing off a fifth time, and the draw is the one that
// was measured: 900, 1200, 3400 and 6200 milliseconds, whose first two both round to one second.
test('a service that only answers 503 is announced fewer times than it is asked', async () => {
  const { api, said, calls } = clientAnnouncing([503], [900, 1200, 3400, 6200]);

  await assert.rejects(() => api.health(), /Service is busy \(HTTP 503\)/);

  assert.equal(calls.length, 5, 'four backoffs and the attempt that gives up');
  assert.deepEqual(said, [
    'The metadata service asked us to slow down. Waiting 1 second.',
    'The metadata service asked us to slow down. Waiting 3 seconds.',
    'The metadata service asked us to slow down. Waiting 6 seconds.',
  ]);
});

// The same run against the real draw, asserting only what is true of every draw. A scripted
// sequence proves the reported case; this proves there is no sequence the guard lets through.
test('nothing is said twice inside one stall, whatever the draw happens to be', async () => {
  for (let i = 0; i < 50; i += 1) {
    const { api, said } = clientAnnouncing([503]);
    await assert.rejects(() => api.health());
    assert.deepEqual([...new Set(said)], said, `run ${i} repeated a sentence`);
    for (const s of said) assert.doesNotMatch(s, /Waiting 1 seconds/, 'the plural has to agree');
  }
});

// The other half of the same run, and the one the guard could get wrong in the direction that
// costs a reader information: two separate stalls have to sound like two, not like one. Both
// stalls open on attempt 0, which draws from [500, 1000) and so always rounds to one second, which
// is what makes the count below exact rather than a range.
test('a stall that ends and starts again is heard again, in the client', async () => {
  const { api, said } = clientAnnouncing([503, 503, 200, 503, 503, 200]);

  assert.deepEqual(await api.health(), { issue_count: 1 }, 'the third attempt answers');
  const first = said.length;
  assert.ok(first >= 1, 'the stall itself has to be audible');

  assert.deepEqual(await api.health(), { issue_count: 1 }, 'and so does the sixth');
  const oneSecond = said.filter((s) => s.endsWith('Waiting 1 second.'));
  assert.equal(oneSecond.length, 2, 'once per stall: silent inside one, audible across two');
});

// Announcements are silence-by-default here, so a policy that never speaks would pass every
// count assertion above. This is the one that fails if it stops speaking at all.
test('a stalled service is still audible, because the guard is a limit and not a mute', async () => {
  const { api, said } = clientAnnouncing([503]);
  await assert.rejects(() => api.health());
  assert.ok(said.length >= 1, 'a stall the reader cannot hear is the fault this must not become');
  assert.match(said[0], /^The metadata service asked us to slow down\. Waiting \d+ seconds?\.$/);
});

// The answer signal is a contract between two modules, and the test above would still pass if
// api.js reported it on a cache hit or not at all, because health() does not use the cache. This
// asks the client directly what it reports and when.
test('the client reports an answer for a response and reports none when it gives up', async () => {
  const clock = fakeClock();
  const answered = [];
  const api = new MarvelApi({
    limiter: new RateLimiter({ now: clock.now, sleep: clock.sleep }),
    fetch: stubService([503, 200]).fetchImpl,
    sleep: clock.sleep,
    onStatus: (s) => answered.push(s.kind),
  });
  await api.health();
  assert.deepEqual(answered, ['backoff', 'ok'], 'one backoff, then the answer that ends it');

  const gaveUp = [];
  const api2 = new MarvelApi({
    limiter: new RateLimiter({ now: clock.now, sleep: clock.sleep }),
    fetch: stubService([503]).fetchImpl,
    sleep: clock.sleep,
    onStatus: (s) => gaveUp.push(s.kind),
  });
  await assert.rejects(() => api2.health());
  assert.deepEqual([...new Set(gaveUp)], ['backoff'], 'giving up is not an answer');
});

// Everything above holds the policy and the client. None of it holds that the view uses either,
// and that gap is the one BL-113 was caught by: a call site can go back to composing the sentence
// inline and every assertion above stays green.
test('the view announces through the policy, not through a template at the call site', () => {
  const src = readFileSync(new URL('../src/js/main.js', import.meta.url), 'utf8');
  const sentence = 'The metadata service asked us to slow down.';

  assert.equal(
    src.split(sentence).length - 1,
    1,
    'a second copy means a call site is composing the sentence again',
  );
  const policy = src.indexOf('export function backoffAnnouncer');
  assert.ok(policy !== -1, 'the policy has to still be exported, or nothing above tests the app');
  assert.ok(src.indexOf(sentence) > policy, 'and the sentence has to sit inside it');
  assert.match(src, /function onApiStatus\(s\) \{\r?\n\s+announceBackoff\(s\);/);
});

// The client half of the same gap. api.js reporting the answer is what ends a stall, and a change
// that dropped the report would leave every policy test above green and make the guard permanent.
test('the client reports the answer from inside the request, past the retry branch', () => {
  const src = readFileSync(new URL('../src/js/api.js', import.meta.url), 'utf8');
  const busy = src.indexOf("this.onStatus({ kind: 'backoff'");
  const answered = src.indexOf("this.onStatus({ kind: 'ok'");
  assert.ok(busy !== -1 && answered !== -1, 'both reports have to exist');
  assert.ok(answered > busy, 'the answer is reported after the branch that refuses to call it one');
  assert.ok(answered < src.indexOf('if (res.status === 404)'), 'and before any answer is refused');
});
