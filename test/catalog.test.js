import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  parseCatalog, typeLabel, depthLabel, catalogCategories, filterByCategory,
  LIST_TYPES, READING_DEPTHS, UNCATEGORIZED,
} from '../src/js/lib/catalog.js';

test('parses a well-formed catalog entry', () => {
  const { lists, dropped } = parseCatalog({
    lists: [{
      id: 'hickman-minimal',
      file: 'hickman_minimal.json',
      name: 'Hickman to Secret Wars — minimal',
      description: 'The essential spine.',
      type: 'creator-run',
      depth: 'essential',
      count: 89,
      source: 'https://example.com/order.md',
      sourceLicense: 'MIT',
      updatedAt: '2026-08-04T06:14:48.695Z',
    }],
  });
  assert.equal(dropped, 0);
  assert.equal(lists.length, 1);
  assert.equal(lists[0].count, 89);
  assert.equal(lists[0].type, 'creator-run');
});

test('entries missing what a reader needs to choose are dropped, and counted', () => {
  const { lists, dropped } = parseCatalog({
    lists: [
      { id: 'a', name: 'A', count: 1 },                       // no file
      { id: 'b', file: 'b.json', count: 1 },                  // no name
      { id: 'c', file: 'c.json', name: 'C' },                 // no count
      { id: 'd', file: 'd.json', name: 'D', count: -1 },      // impossible count
      null,
    ],
  });
  assert.equal(lists.length, 0);
  assert.equal(dropped, 5);
});

test('duplicate ids are dropped rather than shown twice', () => {
  const entry = { id: 'x', file: 'x.json', name: 'X', count: 3 };
  const { lists, dropped } = parseCatalog({ lists: [entry, { ...entry, name: 'X again' }] });
  assert.equal(lists.length, 1);
  assert.equal(dropped, 1);
  assert.equal(lists[0].name, 'X');
});

test('a curated file name that could escape the data directory is rejected', () => {
  for (const file of ['../secrets.json', 'a/b.json', 'https://evil.test/x.json', 'x.js', '.json']) {
    const { lists, dropped } = parseCatalog({ lists: [{ id: 'x', file, name: 'X', count: 1 }] });
    assert.equal(lists.length, 0, `accepted ${file}`);
    assert.equal(dropped, 1);
  }
});

test('unknown type and depth values become null instead of being displayed', () => {
  const { lists } = parseCatalog({
    lists: [{ id: 'x', file: 'x.json', name: 'X', count: 1, type: 'anthology', depth: 'skim' }],
  });
  assert.equal(lists[0].type, null);
  assert.equal(lists[0].depth, null);
  assert.equal(typeLabel(null), 'Reading list');
  assert.equal(depthLabel(null), null);
  assert.equal(typeLabel('event'), 'Event');
  assert.equal(depthLabel('essential'), 'Essential reading');
});

test('a missing or malformed catalog yields an empty list, not a crash', () => {
  assert.deepEqual(parseCatalog(undefined), { lists: [], dropped: 0 });
  assert.deepEqual(parseCatalog({ lists: 'nope' }), { lists: [], dropped: 0 });
});

test('the bundled catalog is valid and its counts match the vendored orders', async () => {
  const url = new URL('../src/data/catalog.json', import.meta.url);
  const { lists, dropped } = parseCatalog(JSON.parse(await readFile(url, 'utf8')));
  assert.equal(dropped, 0);
  assert.ok(lists.length > 0);

  for (const list of lists) {
    assert.ok(LIST_TYPES.includes(list.type), `${list.id} has no valid type`);
    assert.ok(READING_DEPTHS.includes(list.depth), `${list.id} has no valid depth`);
    assert.ok(list.source, `${list.id} has no attribution`);
    assert.ok(list.updatedAt, `${list.id} has no last-updated date`);

    const order = JSON.parse(await readFile(new URL(`../src/data/${list.file}`, import.meta.url), 'utf8'));
    assert.equal(list.count, order.items.length, `${list.id} count is out of date`);
    assert.equal(list.id, order.id);
  }
});

test('categories are derived from the lists, with counts and a stable order', () => {
  const { lists } = parseCatalog({
    lists: [
      { id: 'a', file: 'a.json', name: 'A', count: 1, type: 'era' },
      { id: 'b', file: 'b.json', name: 'B', count: 1, type: 'event' },
      { id: 'c', file: 'c.json', name: 'C', count: 1, type: 'event' },
      { id: 'd', file: 'd.json', name: 'D', count: 1 },
    ],
  });
  assert.deepEqual(catalogCategories(lists), [
    { key: 'event', label: 'Event', count: 2 },
    { key: 'era', label: 'Era', count: 1 },
    { key: 'other', label: 'Other', count: 1 },
  ]);
});

test('filtering narrows the lists without altering them, and “all” keeps every list', () => {
  const { lists } = parseCatalog({
    lists: [
      { id: 'a', file: 'a.json', name: 'A', count: 1, type: 'era', description: 'An era.' },
      { id: 'b', file: 'b.json', name: 'B', count: 1, type: 'event' },
    ],
  });
  const eras = filterByCategory(lists, 'era');
  assert.deepEqual(eras.map((l) => l.id), ['a']);
  assert.equal(eras[0].description, 'An era.', 'details must survive filtering');
  assert.equal(eras[0], lists[0]);

  assert.equal(filterByCategory(lists, 'all').length, 2);
  assert.equal(filterByCategory(lists, null).length, 2);
});

test('lists with an unusable type are grouped under “other”, never hidden', () => {
  const { lists } = parseCatalog({
    lists: [{ id: 'a', file: 'a.json', name: 'A', count: 1, type: 'anthology' }],
  });
  assert.deepEqual(filterByCategory(lists, UNCATEGORIZED).map((l) => l.id), ['a']);
});

test('an unknown category matches nothing rather than everything', () => {
  const { lists } = parseCatalog({ lists: [{ id: 'a', file: 'a.json', name: 'A', count: 1, type: 'era' }] });
  assert.deepEqual(filterByCategory(lists, 'event'), []);
});
