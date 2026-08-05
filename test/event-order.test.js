import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { EVENTS, normalizeSeriesRows, nameMatches } from '../scripts/build-event-order.mjs';

// The completeness audit reads a series index that may be column-oriented, and a reader that
// cannot see names is indistinguishable from a catalogue with nothing in it: both match zero
// series, find zero unaccounted, and report success. These tests pin the reader, because the
// failure they guard against only appears once a committed index exists and is silent when it does.

const columnar = {
  kind: 'series',
  total: 3,
  fields: ['id', 'name', 'issueCount'],
  items: [
    [1067, 'Civil War (2006 - 2007)', 7],
    [26024, ' Superior Spider-Man Vol. 2: Otto-matic (2019)', 1],
    [31377, 'King In Black: Black Panther (2021)', 1],
  ],
};

test('a column-oriented index is mapped through its fields header', () => {
  const { items, why } = normalizeSeriesRows(columnar);
  assert.equal(why, null);
  assert.equal(items.length, 3);
  assert.deepEqual(items[0], { id: 1067, name: 'Civil War (2006 - 2007)', issueCount: 7 });
});

test('names survive the mapping, so the audit can still match events', () => {
  const { items } = normalizeSeriesRows(columnar);
  // Reading .name off an unmapped tuple yields undefined and matches nothing, which is the
  // shape of the bug: a clean audit that looked at an empty list.
  assert.equal(items.filter((s) => nameMatches(s.name, 'Civil War')).length, 1);
  assert.equal(items.filter((s) => nameMatches(s.name, 'King in Black')).length, 1);
});

test('tuple rows with no fields header are refused rather than scanned', () => {
  const { items, why } = normalizeSeriesRows({ items: [[1067, 'Civil War (2006 - 2007)', 7]] });
  assert.equal(items, null);
  assert.match(why, /carry an id and a name/);
});

test('a record-oriented index is read as-is', () => {
  const { items, why } = normalizeSeriesRows({ items: [{ id: 1067, name: 'Civil War (2006 - 2007)' }] });
  assert.equal(why, null);
  assert.equal(items[0].name, 'Civil War (2006 - 2007)');
});

test('an index of the wrong shape is refused', () => {
  assert.equal(normalizeSeriesRows({ total: 6990 }).items, null);
  assert.match(normalizeSeriesRows({ total: 6990 }).why, /no array of series/);
});

test('matching is on whole words, so an event does not swallow a longer name', () => {
  assert.ok(nameMatches('Civil War: Front Line (2006)', 'Civil War'));
  assert.ok(nameMatches('Civil War II (2016)', 'Civil War'));
  assert.ok(!nameMatches('Civil Warriors (1994)', 'Civil War'));
  assert.ok(!nameMatches(undefined, 'Civil War'));
});

// Selection is by explicit id, so a series in both lists is a contradiction the audit should never
// have to discover upstream.
test('no series is both included in and excluded from the same event', () => {
  for (const event of EVENTS) {
    const excluded = new Set(Object.values(event.excluded).flat());
    for (const id of event.series) {
      assert.ok(!excluded.has(id), `${event.id}: ${id} is listed as both included and excluded`);
    }
  }
});

test('every event declares its main series among the series it includes', () => {
  for (const event of EVENTS) {
    assert.ok(event.series.includes(event.main), `${event.id}: main series ${event.main} is not included`);
  }
});

// Marvel returns some titles with doubled or leading whitespace ("King In Black: Black Panther
// (2021)" arrives with two spaces, and the series catalogue contains a leading-space name). Both
// generators normalise it on ingest, which means the committed text deliberately differs from the
// raw upstream string. That is the fix, not corruption -- so this pins it, because the obvious way
// to "repair" an apparent mismatch against the API is to put the doubled space back.
//
// Deliberately limited to titles and series names. Marvel's `description` is their prose and
// double-spaces after sentences; a sweep of src/data will find doubled spaces there and that is
// upstream copy left intact, not a gap in this check.
const ORDERS = new URL('../src/data/orders/', import.meta.url);
const PINNED = ['house_of_m', 'civil_war', 'annihilation', 'secret_invasion', 'king_in_black'];

test('committed checklists carry no doubled whitespace', async () => {
  let lines = 0;
  for (const file of await readdir(ORDERS)) {
    const text = await readFile(new URL(file, ORDERS), 'utf8');
    for (const line of text.split('\n')) {
      lines += 1;
      assert.ok(!/\S\s{2,}\S/.test(line), `${file}: doubled whitespace in ${JSON.stringify(line)}`);
    }
  }
  // A reader that finds nothing would otherwise pass this without checking anything.
  assert.ok(lines > 100, `expected the committed orders to have content, read ${lines} lines`);
});

test('pinned titles are trimmed and free of doubled whitespace', async () => {
  let checked = 0;
  for (const name of PINNED) {
    const url = new URL(`../src/data/${name}.json`, import.meta.url);
    const { items } = JSON.parse(await readFile(url, 'utf8'));
    assert.ok(Array.isArray(items) && items.length, `${name}: no items to check`);
    for (const item of items) {
      for (const key of ['title', 'seriesName']) {
        const value = item[key];
        if (typeof value !== 'string') continue;
        checked += 1;
        assert.equal(value, value.trim(), `${name}: untrimmed ${key} ${JSON.stringify(value)}`);
        assert.ok(!/\s{2,}/.test(value), `${name}: doubled whitespace in ${key} ${JSON.stringify(value)}`);
      }
    }
  }
  assert.equal(checked, 300, `expected 150 items with a title and a series name, checked ${checked} strings`);
});
