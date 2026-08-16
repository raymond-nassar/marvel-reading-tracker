// BL-134: a synopsis can be fetched and shown, and cannot be kept.
//
// The promise this file defends is narrow and absolute, so it is worth stating before the tests
// that check it: prose fetched from the metadata service reaches the screen and nothing else. Not
// mrt.state.v2, not a backup, not the response cache, not the browser's own cache.
//
// Four separate mechanisms make that true and none of them is a spare. normalizeIssue drops the
// field, so no persistence path carries it. withoutSynopsis strips it before a cache write, so the
// app's own store never holds it. no-store on the request stops the browser keeping a copy the app
// cannot reach. And the runner writes nothing at all, including the 404 that the metadata hydrator
// records, because a feature whose promise is that it stores nothing must not change stored data as
// a side effect of being used.
//
// The most dangerous code here is the code that runs when something has gone wrong: the guards that
// stop a cancelled run tearing down its replacement, and the purge that must not record success it
// did not have. Those get the most tests, for the reason the repository instructions give.

import test from 'node:test';
import assert from 'node:assert/strict';

import { SessionSynopsis, SynopsisRunner, NO_SYNOPSIS } from '../src/js/synopsis.js';
import { withoutSynopsis, MarvelApi } from '../src/js/api.js';
import { purgeStaleCache } from '../src/js/main.js';
import {
  addIssuesToList, createEmptyState, createList, markRead, markDetailsRefused,
  hydrationOrder, synopsisOrder, lookaheadPriority,
} from '../src/js/lib/model.js';

function stateWith(ids, { read = [], manual = [], refused = [] } = {}) {
  let state = createList(createEmptyState(), { name: 'Order' });
  const listId = state.listOrder[0];
  const items = ids.map((id) => ({
    issueId: id,
    title: `Issue ${id}`,
    source: manual.includes(id) ? 'manual' : 'import',
  }));
  state = addIssuesToList(state, listId, items).state;
  for (const id of read) state = markRead(state, id, true);
  for (const id of refused) state = markDetailsRefused(state, id);
  return { state, listId };
}

function fakeStore(initial) {
  return {
    state: initial,
    writes: 0,
    update(fn) {
      this.state = fn(this.state);
      this.writes += 1;
      return this.state;
    },
  };
}

function instantApi(answer) {
  const asked = [];
  const opts = [];
  return {
    asked,
    opts,
    async issue(issueId, options = {}) {
      asked.push(issueId);
      opts.push(options);
      return answer(issueId);
    },
  };
}

function controllableApi() {
  const calls = [];
  return {
    calls,
    get asked() {
      return calls.map((c) => c.issueId);
    },
    issue(issueId) {
      let record;
      const promise = new Promise((resolve, reject) => {
        record = { issueId, resolve, fail: reject };
      });
      calls.push(record);
      return promise;
    },
  };
}

const settled = () => new Promise((r) => setTimeout(r, 0));

function within(promise, label, ms = 2000) {
  let timer;
  const capped = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms waiting for ${label}`)), ms);
  });
  return Promise.race([Promise.resolve(promise).finally(() => clearTimeout(timer)), capped]);
}

const withProse = (id) => ({ issueId: id, title: `Issue ${id}`, description: `Synopsis for ${id}.` });

const notFound = () => {
  const err = new Error('Not found.');
  err.status = 404;
  throw err;
};

// ---------------------------------------------------------------- the session store

test('a fetched synopsis is held only in the session store, which starts empty', () => {
  const session = new SessionSynopsis();
  assert.equal(session.size, 0);
  assert.equal(session.text(1), null);
  assert.equal(session.known(1), false, 'an unasked issue must not read as answered');
});

// The three states have to stay apart. "Not asked" is what makes an issue join a queue; "asked and
// answered with nothing" is what keeps it out of the next one; and prose is what gets displayed.
// Folding the middle one into either of the others costs a request per issue per session, or shows
// a reader a blank where a sentence belongs.
test('asked-and-empty is a different answer from not-asked-yet', () => {
  const session = new SessionSynopsis();
  session.record(7, '');
  assert.equal(session.known(7), true);
  assert.equal(session.get(7), NO_SYNOPSIS);
  assert.equal(session.text(7), null, 'an empty answer is not text to display');

  session.record(8, '   ');
  assert.equal(session.get(8), NO_SYNOPSIS, 'whitespace is not a synopsis');

  session.record(9, 'Real prose.');
  assert.equal(session.text(9), 'Real prose.');
});

// 63 curated issues already carry detailsRefused, written by the metadata hydrator when the service
// answered 404. An issue the service has no record of has no synopsis either, so a run that ignored
// the field would spend 63 requests per session learning what the tracker wrote down months ago.
test('issues the service has already refused are seeded as known negatives', () => {
  const { state } = stateWith([1, 2, 3], { refused: [2] });
  const session = new SessionSynopsis();
  session.seedFrom(state);
  assert.equal(session.known(2), true);
  assert.equal(session.get(2), NO_SYNOPSIS);
  assert.equal(session.known(1), false, 'seeding must not claim anything about issues that were never refused');
});

// Read, never written. This is the one field the feature touches that also lives in saved state,
// and the direction is the whole of the promise.
test('seeding reads the refusal without writing anything back', () => {
  const { state } = stateWith([1, 2], { refused: [2] });
  const before = JSON.stringify(state);
  new SessionSynopsis().seedFrom(state);
  assert.equal(JSON.stringify(state), before, 'seeding mutated saved state');
});

test('prose already held is not overwritten by a later seed', () => {
  const { state } = stateWith([1], { refused: [1] });
  const session = new SessionSynopsis();
  session.record(1, 'Typed in from somewhere else.');
  session.seedFrom(state);
  assert.equal(session.text(1), 'Typed in from somewhere else.');
});

// ---------------------------------------------------------------- the ordering helper

// The bug this helper exists to prevent, stated as a test. Applying the predicate after the slice
// is correct on a first run and wrong on every one after it: the priority group shrinks as issues
// get answered, and the shortfall is made up from the remainder, which is not in reading order.
test('the lookahead counts issues that are actually wanted, not issues that happen to be first', () => {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const done = new Set([1, 2, 3]);
  const got = lookaheadPriority(ids, (id) => !done.has(id), 8);
  assert.deepEqual(got, [4, 5, 6, 7, 8, 9, 10, 11, 12], 'the group must still hold nine ids after three are answered');
  assert.equal(got.length, 9);
});

test('a lookahead of 8 means the current issue plus the next eight', () => {
  const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  assert.deepEqual(lookaheadPriority(ids, () => true, 8), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

test('a shorter list than the lookahead yields the list, not a padded one', () => {
  assert.deepEqual(lookaheadPriority([1, 2], () => true, 8), [1, 2]);
  assert.deepEqual(lookaheadPriority([], () => true, 8), []);
});

// hydrationOrder now shares the helper, so its first-run behaviour is pinned here rather than left
// to be noticed later. This is the case the old implementation got right, and it still has to hold.
test('hydration still asks for what you are about to read first', () => {
  const { state, listId } = stateWith([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], { read: [1, 2] });
  const order = hydrationOrder(state, listId, 2);
  assert.deepEqual(order.slice(0, 3), [3, 4, 5]);
  assert.equal(order.length, 10, 'everything still gets fetched eventually');
});

// ---------------------------------------------------------------- the synopsis queue

test('the queue is bounded by the list, and puts the next unread issues first', () => {
  const { state, listId } = stateWith([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], { read: [1, 2] });
  const queue = synopsisOrder(state, listId, () => true, 8);
  assert.deepEqual(queue.slice(0, 9), [3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.equal(queue.length, 12, 'read issues are fetched too, just not first');
});

test('hand-added issues are left out, having no upstream record to ask about', () => {
  const { state, listId } = stateWith([1, 2, 3], { manual: [2] });
  assert.deepEqual(synopsisOrder(state, listId, () => true, 8), [1, 3]);
});

test('a list that is not there yields no queue rather than throwing', () => {
  const { state } = stateWith([1]);
  assert.deepEqual(synopsisOrder(state, 'nope', () => true, 8), []);
});

// ---------------------------------------------------------------- the run

test('a run fetches every issue in the list and holds each synopsis in memory', async () => {
  const { state, listId } = stateWith([1, 2, 3]);
  const store = fakeStore(state);
  const session = new SessionSynopsis();
  const api = instantApi(withProse);
  const runner = new SynopsisRunner({ api, store, session, onProgress: () => {} });

  await within(runner.start(listId), 'the run to finish');

  assert.deepEqual(api.asked, [1, 2, 3]);
  assert.equal(session.text(2), 'Synopsis for 2.');
  assert.equal(runner.active, false);
});

// The single most important assertion in this file. A run that wrote anything would put the prose
// back into the file BL-130 removed it from, one issue at a time.
test('a complete run costs no write to saved state at all', async () => {
  const { state, listId } = stateWith([1, 2, 3]);
  const store = fakeStore(state);
  const before = JSON.stringify(store.state);
  const runner = new SynopsisRunner({ api: instantApi(withProse), store, session: new SessionSynopsis() });

  await within(runner.start(listId), 'the run to finish');

  assert.equal(store.writes, 0, 'a synopsis run wrote to saved state');
  assert.equal(JSON.stringify(store.state), before, 'saved state changed during a synopsis run');
});

// Counting writes rather than comparing state, because the two catch different mistakes: a write of
// an identical object leaves the comparison passing while still costing a localStorage round trip
// in the real store, and a 404 handler copied from Hydrator is exactly the shape that does that.
test('a 404 is remembered for the session and written nowhere', async () => {
  const { state, listId } = stateWith([1, 2]);
  const store = fakeStore(state);
  const session = new SessionSynopsis();
  const api = instantApi((id) => (id === 1 ? notFound() : withProse(id)));
  const runner = new SynopsisRunner({ api, store, session });

  await within(runner.start(listId), 'the run to finish');

  assert.equal(session.get(1), NO_SYNOPSIS, 'the refusal was not remembered, so it will be asked again');
  assert.equal(store.writes, 0, 'the refusal was persisted');
  assert.notEqual(store.state.issues[1].detailsRefused, true, 'a synopsis run marked an issue refused');
});

// The other half of that claim: a busy service says nothing about the issue, so it stays unknown and
// a later run asks again. Folding the two together would make one upstream hiccup permanent for the
// session.
test('a transient failure leaves the issue unknown rather than recorded as empty', async () => {
  const { state, listId } = stateWith([1, 2]);
  const session = new SessionSynopsis();
  const api = instantApi((id) => {
    if (id === 1) throw new Error('502 from upstream');
    return withProse(id);
  });
  const runner = new SynopsisRunner({ api, store: fakeStore(state), session });

  await within(runner.start(listId), 'the run to finish');

  assert.equal(session.known(1), false, 'a busy service was recorded as having no synopsis');
  assert.equal(session.text(2), 'Synopsis for 2.', 'and the queue carried on regardless');
});

// A cached entry has had its description stripped by the time a run reads it, so a cached read would
// answer "no synopsis" for an issue that has one, and a cached write would put back what the strip
// just removed. Both halves are the same option, which is why one assertion covers it.
test('every lookup in a run goes past the cache in both directions', async () => {
  const { state, listId } = stateWith([1, 2]);
  const api = instantApi(withProse);
  const runner = new SynopsisRunner({ api, store: fakeStore(state), session: new SessionSynopsis() });

  await within(runner.start(listId), 'the run to finish');

  assert.equal(api.opts.length, 2);
  for (const opt of api.opts) assert.equal(opt.cache, false, 'a synopsis lookup was allowed to use the cache');
});

test('a second run asks only about what the first one did not answer', async () => {
  const { state, listId } = stateWith([1, 2, 3]);
  const store = fakeStore(state);
  const session = new SessionSynopsis();
  const first = instantApi(withProse);
  await within(new SynopsisRunner({ api: first, store, session }).start(listId), 'the first run');

  const second = instantApi(withProse);
  await within(new SynopsisRunner({ api: second, store, session }).start(listId), 'the second run');

  assert.deepEqual(second.asked, [], 'the second run re-fetched prose it already had');
});

test('an issue already refused in saved state is never asked about', async () => {
  const { state, listId } = stateWith([1, 2, 3], { refused: [2] });
  const api = instantApi(withProse);
  const runner = new SynopsisRunner({ api, store: fakeStore(state), session: new SessionSynopsis() });

  await within(runner.start(listId), 'the run to finish');

  assert.deepEqual(api.asked, [1, 3], 'a request was spent on an issue the tracker already knew was refused');
});

test('nothing left to ask about reports idle rather than starting a run', async () => {
  const { state, listId } = stateWith([1], { refused: [1] });
  const seen = [];
  const runner = new SynopsisRunner({
    api: instantApi(withProse), store: fakeStore(state), session: new SessionSynopsis(), onProgress: (p) => seen.push(p),
  });
  await within(runner.start(listId), 'the run to finish');
  assert.deepEqual(seen.map((p) => p.phase), ['idle']);
});

test('a second start while one is running is ignored rather than doubling the queue', async () => {
  const { state, listId } = stateWith([1, 2, 3]);
  const api = controllableApi();
  const runner = new SynopsisRunner({ api, store: fakeStore(state), session: new SessionSynopsis() });

  const run = runner.start(listId);
  await settled();
  const ignored = runner.start(listId);
  await settled();
  assert.equal(api.calls.length, 1, 'the second start issued its own lookups');
  await within(ignored, 'the ignored start to return');

  for (let i = 0; i < 3; i += 1) {
    api.calls[i].resolve(withProse(api.calls[i].issueId));
    await settled();
  }
  await within(run, 'the run to finish');
});

test('cancelling keeps what already arrived and stops asking for more', async () => {
  const { state, listId } = stateWith([1, 2, 3]);
  const session = new SessionSynopsis();
  const api = controllableApi();
  const seen = [];
  const runner = new SynopsisRunner({ api, store: fakeStore(state), session, onProgress: (p) => seen.push({ ...p }) });

  const run = runner.start(listId);
  await settled();
  api.calls[0].resolve(withProse(1));
  await settled();
  runner.cancel();
  api.calls[1].resolve(withProse(2));
  await within(run, 'the run to unwind');

  assert.equal(session.text(1), 'Synopsis for 1.', 'the completed lookup was thrown away');
  assert.equal(runner.active, false);
  assert.equal(seen.at(-1).phase, 'cancelled');
  assert.equal(api.calls.length, 2, 'a lookup was issued after cancelling');
});

test('cancelling before anything is running reports cancelled rather than throwing', () => {
  const seen = [];
  const runner = new SynopsisRunner({
    api: instantApi(withProse), store: fakeStore(createEmptyState()), session: new SessionSynopsis(), onProgress: (p) => seen.push(p),
  });
  assert.doesNotThrow(() => runner.cancel());
  assert.deepEqual(seen.map((p) => p.phase), ['cancelled']);
});

// The two guards copied from Hydrator, and the reason they are copied rather than assumed
// unnecessary. A lookup issued by a cancelled run can still come back normally, because aborting
// does not un-issue a request already waiting its turn in the rate limiter.
test('a straggler from a cancelled run does not count towards the run that replaced it', async () => {
  const { state, listId } = stateWith([1, 2, 3]);
  const api = controllableApi();
  const seen = [];
  const runner = new SynopsisRunner({
    api, store: fakeStore(state), session: new SessionSynopsis(), onProgress: (p) => seen.push({ ...p }),
  });

  const first = runner.start(listId);
  await settled();
  runner.cancel();
  const second = runner.start(listId);
  await settled();
  assert.equal(runner.active, true, 'the replacement run did not start');
  seen.length = 0;

  api.calls[0].resolve(withProse(1));
  await settled();
  await within(first, 'the cancelled run to unwind');

  assert.equal(runner.done, 0, 'the straggler advanced the replacement run\'s counter');
  assert.deepEqual(seen, [], 'the straggler reported progress against the replacement run');

  for (let i = 1; i < api.calls.length; i += 1) {
    api.calls[i].resolve(withProse(api.calls[i].issueId));
    await settled();
  }
  await within(second, 'the replacement run to finish');
});

test('a cancelled run unwinding late cannot tear down the run that replaced it', async () => {
  const { state, listId } = stateWith([1, 2, 3]);
  const api = controllableApi();
  const runner = new SynopsisRunner({ api, store: fakeStore(state), session: new SessionSynopsis() });

  const first = runner.start(listId);
  await settled();
  runner.cancel();
  const second = runner.start(listId);
  await settled();
  const replacement = runner.controller;

  api.calls[0].fail(Object.assign(new Error('aborted'), { name: 'AbortError' }));
  await settled();
  await within(first, 'the cancelled run to unwind');

  assert.equal(runner.active, true, 'the old run cleared the new run\'s running flag');
  assert.equal(runner.controller, replacement, 'the old run cleared the new run\'s controller');

  for (let i = 1; i < api.calls.length; i += 1) {
    api.calls[i].resolve(withProse(api.calls[i].issueId));
    await settled();
  }
  await within(second, 'the replacement run to finish');
});

// ---------------------------------------------------------------- the cache strip

test('an issue record loses its synopsis and keeps everything else', () => {
  const stripped = withoutSynopsis({ id: 7, title: 'T', description: 'Prose.', digitalId: 42 });
  assert.equal('description' in stripped, false);
  assert.equal(stripped.title, 'T');
  assert.equal(stripped.digitalId, 42);
});

test('a search response loses the synopsis on every item', () => {
  const stripped = withoutSynopsis({ items: [{ id: 1, description: 'A.' }, { id: 2, description: 'B.' }] });
  assert.deepEqual(stripped.items.map((i) => 'description' in i), [false, false]);
  assert.deepEqual(stripped.items.map((i) => i.id), [1, 2]);
});

// The reason the strip checks the shape rather than removing the key wherever it appears. This one
// cache serves /health, /series, /creators and /search/issues, and a description on any of those
// means something else. A strip by key would have removed it, and the damage would have surfaced
// somewhere with nothing to connect it back to the synopsis feature.
test('a description that is not an issue synopsis survives the strip', () => {
  const service = { status: 'ok', description: 'The metadata service, version 3.' };
  assert.deepEqual(withoutSynopsis(service), service);

  const series = { seriesId: 19648, description: 'An editorial blurb this project wrote.' };
  assert.deepEqual(withoutSynopsis(series), series);
});

test('the strip leaves an unaffected response as the object it already was', () => {
  const untouched = { id: 7, title: 'T' };
  assert.equal(withoutSynopsis(untouched), untouched, 'an unaffected response was copied for nothing');
});

test('the strip does not choke on what a service might return instead of an object', () => {
  assert.equal(withoutSynopsis(null), null);
  assert.equal(withoutSynopsis(undefined), undefined);
  assert.equal(withoutSynopsis('text'), 'text');
});

// ---------------------------------------------------------------- what reaches the wire and the cache

function fakeResponse(body) {
  return {
    ok: true,
    status: 200,
    headers: { get: () => null },
    json: async () => body,
  };
}

function recordingCache() {
  return {
    written: [],
    async get() { return null; },
    async set(path, value) { this.written.push({ path, value }); },
  };
}

test('the caller gets the synopsis and the cache gets a copy without it', async () => {
  const cache = recordingCache();
  const init = [];
  const api = new MarvelApi({
    cache,
    fetch: async (_url, options) => { init.push(options); return fakeResponse({ id: 7, title: 'T', description: 'Prose.' }); },
  });

  const issue = await api.issue(7);
  assert.equal(issue.description, 'Prose.', 'the caller must still get the prose it asked for');
  assert.equal(cache.written.length, 1);
  assert.equal('description' in cache.written[0].value, false, 'the cache was given the prose');
});

// The browser's own cache is the one store this app can neither read nor clear, so the directive is
// the only thing standing between a fetched synopsis and a copy on disk that outlives the tab.
test('every request carries no-store, so the browser keeps no copy either', async () => {
  const init = [];
  const api = new MarvelApi({
    cache: recordingCache(),
    fetch: async (_url, options) => { init.push(options); return fakeResponse({ id: 7 }); },
  });

  await api.issue(7);
  assert.equal(init.length, 1);
  assert.equal(init[0].cache, 'no-store');
});

// ---------------------------------------------------------------- the one-time purge

const okCache = () => ({ cleared: 0, async clear() { this.cleared += 1; return true; } });
const brokenCache = () => ({ cleared: 0, async clear() { this.cleared += 1; return false; } });

test('the purge runs once and then never again', async () => {
  const cache = okCache();
  assert.deepEqual(await purgeStaleCache(cache, 0, 1), { ran: true, cleared: true });
  assert.deepEqual(await purgeStaleCache(cache, 1, 1), { ran: false, cleared: false });
  assert.equal(cache.cleared, 1);
});

// The finding this was written for. clear() used to swallow its own failure and return nothing, so
// the caller would advance the marker over prose still sitting in the store, permanently, because
// the marker is exactly what stops the retry. Reporting the outcome is what makes the retry possible.
test('a purge that failed is not recorded as done, so the next boot tries again', async () => {
  const cache = brokenCache();
  assert.deepEqual(await purgeStaleCache(cache, 0, 1), { ran: true, cleared: false });
  assert.deepEqual(await purgeStaleCache(cache, 0, 1), { ran: true, cleared: false });
  assert.equal(cache.cleared, 2, 'a failed purge was not retried');
});

test('a marker from a newer build is left alone rather than treated as behind', async () => {
  const cache = okCache();
  assert.deepEqual(await purgeStaleCache(cache, 5, 1), { ran: false, cleared: false });
  assert.equal(cache.cleared, 0);
});
