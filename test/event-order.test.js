import test from 'node:test';
import assert from 'node:assert/strict';
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
