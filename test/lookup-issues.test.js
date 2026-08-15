// The vendoring run's lookup pass. Every one of these defends a decision that only shows up in a
// file nobody looks at until months later, so each is written to fail against the pass this
// replaced: one that caught every error alike and warned.

import test from 'node:test';
import assert from 'node:assert/strict';
import { lookupIssues, describeIndeterminate } from '../scripts/lib/lookup-issues.mjs';
import { createJsonFetcher } from '../scripts/lib/fetch-json.mjs';
import { RateLimiter } from '../src/js/lib/limiter.js';

function statusError(status) {
  const err = new Error(`${status} /issues`);
  err.status = status;
  return err;
}

function fetcher(answers) {
  const calls = [];
  return {
    calls,
    getJson: async (url) => {
      calls.push(url);
      const answer = answers[calls.length - 1];
      if (answer instanceof Error) throw answer;
      return answer;
    },
  };
}

const url = (id) => `/issues/${id}`;

test('a lookup that answers puts its metadata in the map and refuses nothing', async () => {
  const { getJson } = fetcher([{ digitalId: 7 }, { digitalId: 8 }]);
  const { meta, refused } = await lookupIssues([1, 2], { getJson, url });
  assert.deepEqual([...meta.keys()], [1, 2]);
  assert.equal(meta.get(2).digitalId, 8);
  assert.equal(refused.size, 0);
});

test('a 404 is recorded as a refusal rather than dropped', async () => {
  const { getJson } = fetcher([{ digitalId: 7 }, statusError(404)]);
  const { meta, refused } = await lookupIssues([1, 2], { getJson, url });
  assert.deepEqual([...meta.keys()], [1], 'a refused issue has no metadata to record');
  assert.deepEqual([...refused], [2]);
});

// The distinction this whole item exists for. Both of these produce an item with every field
// null, and the pass this replaced wrote that item for either.
test('an exhausted retry budget is not a refusal, and stops the run', async () => {
  const { getJson } = fetcher([statusError(503)]);
  await assert.rejects(() => lookupIssues([1], { getJson, url }), (err) => {
    assert.match(err.message, /1 of 1 issue lookups never got an answer/);
    assert.match(err.message, /1: 503 \/issues/);
    return true;
  });
});

test('a lost connection carries no status at all, and stops the run', async () => {
  const { getJson } = fetcher([new TypeError('fetch failed')]);
  await assert.rejects(() => lookupIssues([1], { getJson, url }), /fetch failed/);
});

test('a body that will not parse stops the run', async () => {
  const { getJson } = fetcher([new SyntaxError('Unexpected token < in JSON at position 0')]);
  await assert.rejects(() => lookupIssues([1], { getJson, url }), /Unexpected token/);
});

// A run that stopped at the first failure would report one lost issue per re-run of a job that
// costs several minutes, so the operator has to be told all of them at once.
test('every indeterminate id is named, not just the first, and every id is still tried', async () => {
  const { getJson, calls } = fetcher([statusError(500), { digitalId: 7 }, statusError(500)]);
  await assert.rejects(() => lookupIssues([1, 2, 3], { getJson, url }), (err) => {
    assert.match(err.message, /2 of 3 issue lookups never got an answer/);
    assert.match(err.message, /1: 500 \/issues/);
    assert.match(err.message, /3: 500 \/issues/);
    return true;
  });
  assert.equal(calls.length, 3, 'the pass must not stop at the first failure');
});

// The abort lives inside the lookup rather than beside it precisely so that no caller can write a
// file first. Returning a list of failures for the caller to check would put that back in the
// caller's hands, which is where it was.
test('a run with an indeterminate outcome yields nothing a caller could write', async () => {
  const { getJson } = fetcher([{ digitalId: 7 }, statusError(500)]);
  const result = await lookupIssues([1, 2], { getJson, url }).catch(() => 'threw');
  assert.equal(result, 'threw', 'the successful lookups must not be handed back alongside a failure');
});

test('a refusal on its own does not stop the run, because it is an answer', async () => {
  const { getJson } = fetcher([statusError(404), statusError(404)]);
  const { refused } = await lookupIssues([1, 2], { getJson, url });
  assert.deepEqual([...refused], [1, 2]);
});

test('progress is reported once per id and says which were refused', async () => {
  const { getJson } = fetcher([{ digitalId: 7 }, statusError(404)]);
  const seen = [];
  await lookupIssues([1, 2], { getJson, url, onProgress: (p) => seen.push(p) });
  assert.deepEqual(seen.map((p) => p.done), [1, 2]);
  assert.deepEqual(seen.map((p) => p.refused), [false, true]);
  assert.equal(seen[1].total, 2);
});

// The hole the classification left when it read only rejections. A service that answers 200 with
// nothing usable is not refusing the issue, but the item built from it is byte for byte the item a
// refusal builds, and the app reads that as settled and never asks again. These are written to
// fail against a pass that stores whatever getJson resolves with.
test('a body carrying no metadata is not an answer, and stops the run', async () => {
  const { getJson } = fetcher([{}]);
  await assert.rejects(() => lookupIssues([1], { getJson, url }), (err) => {
    assert.match(err.message, /1 of 1 issue lookups never got an answer/);
    assert.match(err.message, /1: answered with a body carrying no metadata/);
    return true;
  });
});

test('a resolved null or undefined body stops the run rather than counting as answered', async () => {
  await assert.rejects(() => lookupIssues([1], { getJson: fetcher([null]).getJson, url }), /never got an answer/);
  await assert.rejects(() => lookupIssues([2], { getJson: fetcher([undefined]).getJson, url }), /never got an answer/);
});

// seriesId alone is enough, so this must not abort. No shipped item is in that shape today: all
// 1,404 items that pass the predicate carry both ids, so nothing derived from the data would notice
// the rule being narrowed to digitalId alone. Narrowing it reddens this test and nothing else in 957.
test('a body with seriesId but no digitalId is an answer', async () => {
  const { getJson } = fetcher([{ seriesId: 4, title: 'x' }]);
  const { meta, refused } = await lookupIssues([1], { getJson, url });
  assert.equal(meta.get(1).seriesId, 4);
  assert.equal(refused.size, 0);
});

// The one that says it is a hole rather than a preference: an empty body must not be able to
// reach the file as an item indistinguishable from a refusal.
test('a body carrying no metadata is never recorded as a refusal', async () => {
  const { getJson } = fetcher([{}]);
  const outcome = await lookupIssues([1], { getJson, url }).then(
    (r) => ({ refused: [...r.refused], meta: [...r.meta.keys()] }),
    () => 'threw',
  );
  assert.equal(outcome, 'threw', 'an unusable body must not be handed back as either an answer or a refusal');
});

test('the report names every id and says why nothing was written', () => {
  const msg = describeIndeterminate([{ id: 11, reason: 'a' }, { id: 22, reason: 'b' }], 40);
  assert.match(msg, /2 of 40/);
  assert.match(msg, /no file was written/);
  assert.match(msg, /11: a/);
  assert.match(msg, /22: b/);
});

// Everything above builds its own errors, so it would pass even if the fetcher stopped carrying a
// status and every lookup became indeterminate. This drives the real fetcher, which is the only
// place the two halves of the rule meet: one status is an answer and the rest are not.
//
// The clock is faked as in test/fetch-json.test.js. A real one makes the busy case sit out five
// backoffs, about twenty seconds, and a deadlock there would hang rather than fail because
// node:test has no default timeout, hence the deadline on it.
test('driven through the real fetcher, a 404 refuses and a busy service stops the run', async () => {
  const statusFor = new Map([['/issues/1', 404], ['/issues/2', 503]]);
  let clock = 1_000_000;
  const advance = async (ms) => { clock += ms; };
  const { getJson } = createJsonFetcher({
    limiter: new RateLimiter({ now: () => clock, sleep: advance }),
    sleep: advance,
    fetch: async (u) => {
      const status = statusFor.get(u);
      return { status, ok: false, headers: new Map(), json: async () => ({}) };
    },
  });

  const { refused } = await lookupIssues([1], { getJson, url });
  assert.deepEqual([...refused], [1], 'a 404 through the real fetcher must reach the refusal branch');

  const busy = assert.rejects(() => lookupIssues([2], { getJson, url }), /never got an answer/);
  const deadline = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('the busy lookup never completed')), 2000).unref();
  });
  await Promise.race([busy, deadline]);
});
