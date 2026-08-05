// The series and creator search path in MarvelApi: loading a vendored index, sharing that load,
// and what happens when it fails. The ranking itself lives in lib/nameIndex.js and is tested in
// nameIndex.test.js; this file is about the loading contract around it.

import test from 'node:test';
import assert from 'node:assert/strict';
import { MarvelApi } from '../src/js/api.js';

const INDEX = {
  kind: 'series',
  generatedAt: '2026-08-05T06:14:00.000Z',
  total: 3,
  items: [[1, 'Civil War (2006 - 2007)', 7], [2, 'Civil War: Front Line (2006)', 11], [3, 'Marvel (2020)', 6]],
};

// Counts calls so the memoisation and the eviction-on-failure can both be observed.
function stubLoader(impl) {
  const loader = async (kind) => {
    loader.calls.push(kind);
    return impl(kind, loader.calls.length);
  };
  loader.calls = [];
  return loader;
}

const names = (result) => result.items.map((i) => i.name);

test('a series search reads the vendored index rather than the API', async () => {
  const loadIndex = stubLoader(() => INDEX);
  const api = new MarvelApi({ loadIndex });

  const result = await api.searchSeries('civil war');
  assert.deepEqual(names(result), ['Civil War (2006 - 2007)', 'Civil War: Front Line (2006)']);
  assert.deepEqual(loadIndex.calls, ['series']);
  // The view needs these to say how much was left out and how old the snapshot is.
  assert.equal(result.matched, 2);
  assert.equal(result.total, 3);
  assert.equal(result.generatedAt, INDEX.generatedAt);
});

test('series and creators load separately, and each index loads only once', async () => {
  const loadIndex = stubLoader(() => INDEX);
  const api = new MarvelApi({ loadIndex });

  await api.searchSeries('civil war');
  await api.searchSeries('marvel');
  await api.searchCreators('civil war');
  assert.deepEqual(loadIndex.calls, ['series', 'creators']);
});

// Opening the card starts the download and the reader types while it is in flight, so the two
// can easily overlap. One file, one request.
test('searches started before the index arrives share the one load', async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const loadIndex = stubLoader(async () => { await gate; return INDEX; });
  const api = new MarvelApi({ loadIndex });

  const both = Promise.all([api.searchSeries('civil war'), api.searchSeries('marvel')]);
  release();
  const [civil, marvel] = await both;

  assert.deepEqual(loadIndex.calls, ['series']);
  assert.equal(names(civil)[0], 'Civil War (2006 - 2007)');
  assert.equal(names(marvel)[0], 'Marvel (2020)');
});

// The whole point of the change. Answering a query with everything is the bug being replaced,
// so an index that will not load has to be an error and never a silent unfiltered list.
test('an index that will not load is an error, not an unfiltered list', async () => {
  const api = new MarvelApi({ loadIndex: stubLoader(() => { throw new Error('offline'); }) });
  await assert.rejects(() => api.searchSeries('civil war'), /offline/);
});

// The failure message tells the reader to search again, so searching again has to actually
// retry rather than replay the original error for the rest of the session.
test('a failed load is retried by searching again, as the message promises', async () => {
  const loadIndex = stubLoader((kind, call) => {
    if (call === 1) throw new Error('offline');
    return INDEX;
  });
  const api = new MarvelApi({ loadIndex });

  await assert.rejects(() => api.searchSeries('civil war'), /offline/);
  const second = await api.searchSeries('civil war');

  assert.equal(names(second)[0], 'Civil War (2006 - 2007)');
  assert.deepEqual(loadIndex.calls, ['series', 'series']);
});

// Warming is only a head start taken when the card opens. A reader who never searches must
// never see an error from it, and it must not poison the index for a later real search.
test('warming swallows its own failure and does not block a later search', async () => {
  const loadIndex = stubLoader((kind, call) => {
    if (call === 1) throw new Error('offline');
    return INDEX;
  });
  const api = new MarvelApi({ loadIndex });

  assert.equal(await api.warmNameIndex('series'), null);
  assert.equal(names(await api.searchSeries('civil war'))[0], 'Civil War (2006 - 2007)');
});

test('a warmed index is reused rather than fetched again by the search', async () => {
  const loadIndex = stubLoader(() => INDEX);
  const api = new MarvelApi({ loadIndex });

  await api.warmNameIndex('series');
  await api.searchSeries('civil war');
  assert.deepEqual(loadIndex.calls, ['series']);
});

// The kind-to-file map in the real loader is the gate, so this exercises the shipped default
// rather than a stub. It rejects before reaching the network, which is why there is no fetch
// here to intercept.
test('an unknown index name is refused by the real loader before any request', async () => {
  const api = new MarvelApi();
  await assert.rejects(() => api.searchNameIndex('publishers', 'marvel'), /Unknown search index "publishers"/);
});
