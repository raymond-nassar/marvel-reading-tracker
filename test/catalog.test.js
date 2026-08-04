import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  parseCatalog, typeLabel, depthLabel, depthHint, catalogCategories, filterByCategory,
  searchCatalog, groupCatalog, variantLabel, LIST_TYPES, READING_DEPTHS, UNCATEGORIZED,
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
    assert.ok(list.characters.length, `${list.id} has no characters to search by`);

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

const sample = parseCatalog({
  lists: [
    {
      id: 'hickman', file: 'hickman.json', name: 'Hickman to Secret Wars — minimal', count: 89,
      type: 'creator-run', depth: 'essential',
      description: 'The essential spine of Jonathan Hickman’s Avengers run.',
      characters: ['Avengers', 'Black Panther'], keywords: ['Jonathan Hickman', 'Secret Wars'],
    },
    {
      id: 'civil-war', file: 'civil_war.json', name: 'Civil War', count: 40,
      type: 'event', depth: 'complete',
      description: 'Registration splits the heroes.',
      characters: ['Iron Man', 'Captain America', 'Spider-Man'], keywords: ['crossover'],
    },
  ],
}).lists;

const ids = (lists) => lists.map((l) => l.id);

test('search matches a list title', () => {
  assert.deepEqual(ids(searchCatalog(sample, 'civil war')), ['civil-war']);
});

test('search matches a character that is not in the title', () => {
  assert.deepEqual(ids(searchCatalog(sample, 'spider-man')), ['civil-war']);
  assert.deepEqual(ids(searchCatalog(sample, 'black panther')), ['hickman']);
});

test('search matches keywords and descriptions', () => {
  assert.deepEqual(ids(searchCatalog(sample, 'crossover')), ['civil-war']);
  assert.deepEqual(ids(searchCatalog(sample, 'registration')), ['civil-war']);
});

test('search ignores case, accents, and punctuation', () => {
  assert.deepEqual(ids(searchCatalog(sample, 'HICKMAN’S')), ['hickman']);
  assert.deepEqual(ids(searchCatalog(sample, 'spiderman')), []);
  assert.deepEqual(ids(searchCatalog(sample, 'spider man')), ['civil-war']);
});

test('extra terms narrow the results instead of widening them', () => {
  assert.deepEqual(ids(searchCatalog(sample, 'secret wars avengers')), ['hickman']);
  assert.deepEqual(ids(searchCatalog(sample, 'secret wars spider-man')), []);
});

test('an empty or whitespace query returns every list', () => {
  assert.equal(searchCatalog(sample, '').length, 2);
  assert.equal(searchCatalog(sample, '   ').length, 2);
  assert.equal(searchCatalog(sample, undefined).length, 2);
});

test('search and category filtering compose', () => {
  assert.deepEqual(ids(searchCatalog(filterByCategory(sample, 'event'), 'iron man')), ['civil-war']);
  assert.deepEqual(ids(searchCatalog(filterByCategory(sample, 'creator-run'), 'iron man')), []);
});

test('characters and keywords are normalised, and rubbish entries are dropped', () => {
  const { lists } = parseCatalog({
    lists: [{
      id: 'x', file: 'x.json', name: 'X', count: 1,
      characters: ['  Namor  ', 'Namor', '', null, 7],
      keywords: 'not-an-array',
    }],
  });
  assert.deepEqual(lists[0].characters, ['Namor']);
  assert.deepEqual(lists[0].keywords, []);
});

test('every reading depth has a label and a plain-English explanation', () => {
  for (const depth of READING_DEPTHS) {
    assert.ok(depthLabel(depth), `${depth} has no label`);
    assert.ok(depthHint(depth), `${depth} has no explanation`);
  }
  assert.equal(depthHint('skim'), null);
});

// ------------------------------------------------------------------ variant grouping

const variants = parseCatalog({
  lists: [
    {
      id: 'cw-essential', file: 'cw_e.json', name: 'Civil War — essential', count: 12,
      type: 'event', depth: 'essential', group: 'civil-war', groupName: 'Civil War',
      variant: 'Essential reading',
    },
    {
      id: 'cw-full', file: 'cw_f.json', name: 'Civil War — complete', count: 90,
      type: 'event', depth: 'complete', group: 'civil-war', groupName: 'Civil War',
      variant: 'Complete reading, with tie-ins',
    },
    { id: 'solo', file: 'solo.json', name: 'Annihilation', count: 30, type: 'event' },
  ],
}).lists;

test('orders for the same event are grouped together under the event name', () => {
  const groups = groupCatalog(variants);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].name, 'Civil War');
  assert.deepEqual(groups[0].lists.map((l) => l.id), ['cw-essential', 'cw-full']);
});

test('a list with no group stays an ungrouped entry', () => {
  const groups = groupCatalog(variants);
  assert.equal(groups[1].name, null);
  assert.deepEqual(groups[1].lists.map((l) => l.id), ['solo']);
});

test('groups keep the order in which their event first appears', () => {
  const reordered = [variants[2], variants[0], variants[1]];
  assert.deepEqual(groupCatalog(reordered).map((g) => g.name), [null, 'Civil War']);
});

test('a lone surviving variant is not given a heading over a single item', () => {
  const groups = groupCatalog([variants[0]]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].name, null);
  assert.equal(groups[0].lists[0].id, 'cw-essential');
});

test('a group falls back to a member name when groupName is missing', () => {
  const { lists } = parseCatalog({
    lists: [
      { id: 'a', file: 'a.json', name: 'Inferno — essential', count: 1, group: 'inferno' },
      { id: 'b', file: 'b.json', name: 'Inferno — complete', count: 2, group: 'inferno' },
    ],
  });
  assert.equal(groupCatalog(lists)[0].name, 'Inferno — essential');
});

test('every variant is named, falling back to depth and then to the list name', () => {
  assert.equal(variantLabel(variants[0]), 'Essential reading');
  const { lists } = parseCatalog({
    lists: [
      { id: 'a', file: 'a.json', name: 'A', count: 1, group: 'g', depth: 'complete' },
      { id: 'b', file: 'b.json', name: 'B', count: 1, group: 'g' },
    ],
  });
  assert.equal(variantLabel(lists[0]), 'Complete reading');
  assert.equal(variantLabel(lists[1]), 'B');
});

test('search matches the event name and the variant name', () => {
  assert.deepEqual(
    searchCatalog(variants, 'civil war tie-ins').map((l) => l.id),
    ['cw-full'],
  );
});

test('the bundled catalog names every variant it groups', async () => {
  const url = new URL('../src/data/catalog.json', import.meta.url);
  const { lists } = parseCatalog(JSON.parse(await readFile(url, 'utf8')));
  for (const group of groupCatalog(lists)) {
    if (!group.name) continue;
    const labels = group.lists.map(variantLabel);
    assert.equal(new Set(labels).size, labels.length, `${group.name} has ambiguous variants`);
  }
});
