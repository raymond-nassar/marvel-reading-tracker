import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  foldName, parseNameIndex, searchNames, INDEX_FIELDS, DEFAULT_LIMIT,
} from '../src/js/lib/nameIndex.js';

const index = (rows, extra = {}) => parseNameIndex({ fields: INDEX_FIELDS, items: rows, ...extra });
const names = (result) => result.items.map((i) => i.name);

// ------------------------------------------------------------------ folding

test('folding ignores case, accents and punctuation, so a reader need not reproduce them', () => {
  assert.equal(foldName('Civil War (2006 - 2007)'), 'civil war 2006 2007');
  assert.equal(foldName('Araña: Here Comes The Spider-Girl'), 'arana here comes the spider girl');
  assert.equal(foldName('  Spider-Man/Deadpool  '), 'spider man deadpool');
  assert.equal(foldName('#O'), 'o');
  assert.equal(foldName(null), '');
  assert.equal(foldName(undefined), '');
});

// ------------------------------------------------------------------ parsing

test('records are read as tuples, and equally as objects', () => {
  const tuples = index([[1, 'Civil War (2006)', 7]]);
  const objects = index([{ id: 1, name: 'Civil War (2006)', issueCount: 7 }]);
  assert.deepEqual(
    tuples.entries.map(({ id, name, issueCount }) => ({ id, name, issueCount })),
    objects.entries.map(({ id, name, issueCount }) => ({ id, name, issueCount })),
  );
});

test('unusable records are dropped and counted rather than searched as blanks', () => {
  const { entries, dropped } = index([
    [1, 'Keep Me (2001)', 3],
    [null, 'No id', 1],
    [2, '', 1],
    [3, '   ', 1],
    [1.5, 'Fractional id', 1],
    ['x', 'Text id', 1],
    null,
    'not a record',
  ]);
  assert.deepEqual(names(searchNames(entries, 'e', { limit: 10 })), ['Keep Me (2001)']);
  assert.equal(entries.length, 1);
  assert.equal(dropped, 7);
});

test('a duplicate id is dropped rather than shown twice', () => {
  const { entries, dropped } = index([[1, 'Civil War (2006)', 7], [1, 'Civil War again', 7]]);
  assert.equal(entries.length, 1);
  assert.equal(dropped, 1);
});

// A count is what tells a reader how much "Add all issues" is about to add, so a missing one is
// carried as unknown. Reporting it as 0 would describe a 60-issue run as empty.
test('a missing or impossible issue count becomes null, never zero', () => {
  const { entries } = index([[1, 'A', null], [2, 'B', -4], [3, 'C', 'lots'], [4, 'D', 0]]);
  assert.deepEqual(entries.map((e) => e.issueCount), [null, null, null, 0]);
});

test('the file’s own metadata is carried through for the view to show', () => {
  const parsed = index([[1, 'A', 1]], {
    kind: 'series', generatedAt: '2026-08-05T06:09:19.993Z', apiBase: 'https://example.test/v1', total: 6990,
  });
  assert.equal(parsed.kind, 'series');
  assert.equal(parsed.generatedAt, '2026-08-05T06:09:19.993Z');
  assert.equal(parsed.apiBase, 'https://example.test/v1');
  assert.equal(parsed.total, 6990, 'the total the API reported, not how many records survived parsing');
});

test('a file with nothing usable in it parses to an empty index rather than throwing', () => {
  for (const raw of [null, undefined, {}, { items: null }, { items: 'nope' }]) {
    const parsed = parseNameIndex(raw);
    assert.deepEqual(parsed.entries, []);
    assert.equal(parsed.total, 0);
  }
});

// ------------------------------------------------------------------ searching

// The whole point of this module. `/series?q=` and `/creators?q=` ignore the query and return
// the alphabetical head of the collection, which is how "Hickman" used to render "#O", "#X",
// "A CO", each with a one-click "Add all issues" button. Returning everything for a query that
// matches nothing is the exact failure being replaced, so it must never be the fallback.
test('a query that matches nothing returns nothing, never the whole collection', () => {
  const { entries } = index([[1, 'Civil War (2006)', 7], [2, 'House of M (2005)', 8]]);
  const result = searchNames(entries, 'asdfqwerzz');
  assert.deepEqual(result.items, []);
  assert.equal(result.matched, 0);
  assert.equal(result.total, 2, 'the caller can still say how much was searched');
});

test('an empty query returns nothing rather than everything', () => {
  const { entries } = index([[1, 'Civil War (2006)', 7], [2, 'House of M (2005)', 8]]);
  for (const q of ['', '   ', null, undefined, '---', '()']) {
    assert.deepEqual(searchNames(entries, q).items, [], `“${q}” listed the collection`);
  }
});

test('every term must match, so extra words narrow the results', () => {
  const { entries } = index([
    [1, 'New Avengers (2013 - 2015)', 33],
    [2, 'New Warriors (1990)', 75],
    [3, 'Avengers (1963)', 402],
  ]);
  assert.equal(searchNames(entries, 'new').matched, 2);
  assert.equal(searchNames(entries, 'avengers').matched, 2);
  assert.deepEqual(names(searchNames(entries, 'new avengers')), ['New Avengers (2013 - 2015)']);
  // Order is not significance: both words are present either way.
  assert.deepEqual(names(searchNames(entries, 'avengers new')), ['New Avengers (2013 - 2015)']);
});

test('a whole-word match outranks one buried inside another word', () => {
  const { entries } = index([[1, 'Spectacular Warlock (1975)', 2], [2, 'Civil War (2006)', 7]]);
  assert.deepEqual(names(searchNames(entries, 'war')), ['Civil War (2006)', 'Spectacular Warlock (1975)']);
});

// Series names carry a year the reader is not expected to type, so "Civil War" has to be able
// to tell the series called Civil War from the one called Civil War: Front Line.
test('the series actually named the query comes before one that merely starts with it', () => {
  const { entries } = index([
    [1, 'Civil War: Front Line (2006 - 2007)', 11],
    [2, 'Civil War II (2016)', 9],
    [3, 'Civil War (2006 - 2007)', 7],
    [4, 'Civil War (2015)', 5],
  ]);
  assert.deepEqual(names(searchNames(entries, 'Civil War')), [
    'Civil War (2006 - 2007)',
    'Civil War (2015)',
    'Civil War: Front Line (2006 - 2007)',
    'Civil War II (2016)',
  ]);
});

test('a name that is exactly the query wins outright', () => {
  const { entries } = index([[1, 'Marvel Team-Up (1972)', 150], [2, 'Marvel Team-Up', 1]]);
  assert.equal(names(searchNames(entries, 'marvel team-up'))[0], 'Marvel Team-Up');
});

// A creator with 395 credits and one with a single credit can match a query equally well. The
// size of the run is a real property of the data, and it is what makes "Hickman" answer with
// Jonathan Hickman instead of a letterer nobody was looking for.
test('within an equally good match, the larger body of work comes first', () => {
  const { entries } = index([[1, 'Rye Hickman', 1], [2, 'Jonathan Hickman', 395]]);
  assert.deepEqual(names(searchNames(entries, 'Hickman')), ['Jonathan Hickman', 'Rye Hickman']);
});

test('an unknown issue count sorts below a known one rather than ahead of it', () => {
  const { entries } = index([[1, 'Alpha Run', null], [2, 'Beta Run', 4]]);
  assert.deepEqual(names(searchNames(entries, 'run')), ['Beta Run', 'Alpha Run']);
});

test('the same query renders the same order twice, even for identical records', () => {
  const rows = [[1, 'Same Name (2001)', 3], [2, 'Same Name (2001)', 3], [3, 'Same Name (2001)', 3]];
  const { entries } = index(rows);
  const once = searchNames(entries, 'same name');
  const again = searchNames(index([...rows].reverse()).entries, 'same name');
  assert.deepEqual(names(once), names(again));
});

// Showing 40 of 312 without saying so tells the reader the other 272 do not exist.
test('results are capped but the true match count is reported', () => {
  const { entries } = index(Array.from({ length: 120 }, (_, i) => [i + 1, `Spider Title ${i + 1} (2001)`, i]));
  const result = searchNames(entries, 'spider', { limit: 40 });
  assert.equal(result.items.length, 40);
  assert.equal(result.matched, 120);
  assert.equal(result.total, 120);

  assert.equal(searchNames(entries, 'spider').items.length, DEFAULT_LIMIT);
  assert.equal(searchNames(entries, 'spider', { limit: 5 }).items.length, 5);
  // A nonsense limit falls back rather than returning nothing.
  for (const bad of [0, -3, null, 'lots']) {
    assert.ok(searchNames(entries, 'spider', { limit: bad }).items.length > 0, `limit ${bad} returned nothing`);
  }
});

test('results carry only what the view renders', () => {
  const { entries } = index([[1, 'Civil War (2006)', 7]]);
  assert.deepEqual(searchNames(entries, 'civil').items, [{ id: 1, name: 'Civil War (2006)', issueCount: 7 }]);
});

test('searching a missing or malformed index is empty rather than an exception', () => {
  for (const bad of [null, undefined, 'nope', {}]) {
    assert.deepEqual(searchNames(bad, 'civil war'), { items: [], matched: 0, total: 0 });
  }
});

// ------------------------------------------------------------------ the vendored files

// These are the searches named in the bug report. They ran against the live API and returned
// "#O", "#X", "A CO". Asserting them against the real shipped files is what proves the fix, and
// what will catch a regenerated index that has silently lost its usefulness.
for (const [file, kind, expectedTotal] of [
  ['series-index.json', 'series', 6990],
  ['creators-index.json', 'creators', 4341],
]) {
  test(`the vendored ${kind} index is complete and parses without loss`, async () => {
    const url = new URL(`../src/data/${file}`, import.meta.url);
    const parsed = parseNameIndex(JSON.parse(await readFile(url, 'utf8')));
    assert.equal(parsed.dropped, 0, 'a shipped index must have nothing unusable in it');
    assert.equal(parsed.kind, kind);
    assert.equal(parsed.entries.length, parsed.total);
    assert.equal(parsed.total, expectedTotal, 'run npm run vendor:index and update this expectation');
    assert.ok(parsed.generatedAt, 'the view shows the snapshot date, so it has to be there');
    assert.ok(parsed.apiBase, 'which API the snapshot came from is part of the record');
  });
}

test('"Hickman" finds Jonathan Hickman, which is the bug this index exists to fix', async () => {
  const url = new URL('../src/data/creators-index.json', import.meta.url);
  const { entries } = parseNameIndex(JSON.parse(await readFile(url, 'utf8')));
  const result = searchNames(entries, 'Hickman', { limit: 40 });

  assert.equal(result.items[0].name, 'Jonathan Hickman');
  assert.ok(result.items[0].issueCount > 100);
  // The old behaviour: the alphabetical head of all 4,341 creators, whatever you typed.
  for (const wrong of ['#O', '#X', 'A CO']) {
    assert.ok(!names(result).includes(wrong), `${wrong} came back for a search for Hickman`);
  }
  assert.ok(result.matched < 10, `“Hickman” matched ${result.matched} creators, which is not a search`);
});

test('"Civil War" finds the Civil War series, and a nonsense query finds nothing', async () => {
  const url = new URL('../src/data/series-index.json', import.meta.url);
  const { entries } = parseNameIndex(JSON.parse(await readFile(url, 'utf8')));

  const civil = searchNames(entries, 'Civil War', { limit: 40 });
  assert.equal(civil.items[0].name, 'Civil War (2006 - 2007)');
  assert.ok(civil.matched > civil.items.length, 'this query should be capped, and say so');

  // Every result has to contain what was asked for. Anything else is the old bug.
  for (const item of civil.items) assert.match(foldName(item.name), /civil.*war|war.*civil/);

  assert.equal(searchNames(entries, 'zzqx not a marvel series').matched, 0);
});
