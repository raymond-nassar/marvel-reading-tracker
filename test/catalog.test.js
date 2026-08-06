import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  parseCatalog, typeLabel, depthLabel, depthHint, catalogCategories, filterByCategory,
  searchCatalog, groupCatalog, variantLabel, sourceLink, sourceLabel, updatedLabel,
  safeOrderFile, LIST_TYPES, READING_DEPTHS, UNCATEGORIZED,
  catalogFacets, filterByFacet, facetLabel, isShortOrder, catalogCoverUrl,
  readingTimeLabel, MINUTES_PER_ISSUE, SHORT_ORDER_MAX,
} from '../src/js/lib/catalog.js';

test('safeOrderFile accepts a plain markdown name and nothing that escapes the orders folder', () => {
  assert.equal(safeOrderFile('new-ultimate-universe.md'), 'new-ultimate-universe.md');
  assert.equal(safeOrderFile('  spaced.md  '), 'spaced.md');
  for (const bad of [
    '../escape.md', 'orders/nested.md', 'C:\\abs.md', '/abs.md', '.hidden.md',
    'order.json', 'order', 'order.md.json', 'https://example.test/x.md', '', null, undefined, 42,
  ]) {
    assert.equal(safeOrderFile(bad), null, `accepted ${JSON.stringify(bad)}`);
  }
});

test('parses a well-formed catalog entry', () => {
  const { lists, dropped } = parseCatalog({
    lists: [{
      id: 'hickman-minimal',
      file: 'hickman_minimal.json',
      name: 'Hickman to Secret Wars: minimal',
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
    // What matters is that the reader always sees where an order came from. A list compiled in
    // this repository has no upstream page to link to, so its license carries the credit.
    assert.ok(sourceLabel(list), `${list.id} has no attribution`);
    assert.ok(list.updatedAt, `${list.id} has no last-updated date`);
    assert.ok(list.characters.length, `${list.id} has no characters to search by`);

    const order = JSON.parse(await readFile(new URL(`../src/data/${list.file}`, import.meta.url), 'utf8'));
    assert.equal(list.count, order.items.length, `${list.id} count is out of date`);
    assert.equal(list.id, order.id);

    // The card art has to belong to the order it represents. A cover pinned from an issue
    // that is not in the file is how a catalog ends up illustrated with the wrong comic.
    assert.ok(list.coverIssueId, `${list.id} has no representative issue for its cover`);
    const rep = order.items.find((i) => i.issueId === list.coverIssueId);
    assert.ok(rep, `${list.id} cover issue ${list.coverIssueId} is not in ${list.file}`);
    assert.deepEqual(list.cover, rep.cover, `${list.id} cover does not match its representative issue`);
    // Marvel serves http in the API payload; anything pinned must already be https or it is
    // blocked as mixed content the moment the app is served over TLS.
    assert.match(list.cover.path, /^https:\/\//, `${list.id} cover is not https`);
  }
});

test('every catalog cover resolves to a variant URL the browser can request', async () => {
  const url = new URL('../src/data/catalog.json', import.meta.url);
  const { lists } = parseCatalog(JSON.parse(await readFile(url, 'utf8')));
  for (const list of lists) {
    assert.match(
      catalogCoverUrl(list),
      /^https:\/\/.+\/portrait_incredible\.(jpg|png|gif)$/,
      `${list.id} does not produce a usable cover URL`,
    );
  }
});

test('an entry with no usable cover falls back rather than requesting a broken image', () => {
  const { lists } = parseCatalog({
    lists: [
      { id: 'x', file: 'x.json', name: 'X', count: 1 },
      // Marvel's own payload is http; anything that cannot be served over TLS is dropped
      // rather than rendered as a mixed-content image that silently fails to load.
      { id: 'y', file: 'y.json', name: 'Y', count: 1, cover: { path: 'ftp://cdn.test/y', ext: 'jpg' }, coverIssueId: 0 },
    ],
  });
  assert.equal(lists[0].cover, null);
  assert.equal(lists[0].coverIssueId, null);
  assert.equal(catalogCoverUrl(lists[0]), null);
  assert.equal(lists[1].cover, null);
  assert.equal(lists[1].coverIssueId, null);
  assert.equal(catalogCoverUrl(lists[1]), null);
});

test('beginner-friendliness is recorded, not inferred, so only an explicit true counts', () => {
  const { lists } = parseCatalog({
    lists: [
      { id: 'a', file: 'a.json', name: 'A', count: 1, beginner: true },
      { id: 'b', file: 'b.json', name: 'B', count: 1, beginner: 'yes' },
      { id: 'c', file: 'c.json', name: 'C', count: 1 },
    ],
  });
  assert.deepEqual(lists.map((l) => l.beginner), [true, false, false]);
  assert.deepEqual(filterByFacet(lists, 'beginner').map((l) => l.id), ['a']);
});

test('facets cover the ways a reader chooses, and never offer one that matches nothing', () => {
  const lists = parseCatalog({
    lists: [
      { id: 'a', file: 'a.json', name: 'A', count: 8, type: 'event', beginner: true },
      { id: 'b', file: 'b.json', name: 'B', count: 200, type: 'creator-run' },
    ],
  }).lists;

  const facets = catalogFacets(lists);
  assert.deepEqual(facets.map((f) => f.key), ['all', 'beginner', 'type:event', 'type:creator-run', 'short']);
  assert.deepEqual(facets.map((f) => f.count), [2, 1, 1, 1, 1]);
  // Plural, because a chip labels a set rather than a single list.
  assert.equal(facetLabel(lists, 'type:event'), 'Events');

  assert.deepEqual(filterByFacet(lists, 'all').map((l) => l.id), ['a', 'b']);
  assert.deepEqual(filterByFacet(lists, 'short').map((l) => l.id), ['a']);
  assert.deepEqual(filterByFacet(lists, 'type:creator-run').map((l) => l.id), ['b']);

  // Nothing is short here, so the chip that would lead to an empty grid is not offered.
  const long = parseCatalog({ lists: [{ id: 'c', file: 'c.json', name: 'C', count: 400, type: 'era' }] }).lists;
  assert.equal(catalogFacets(long).some((f) => f.key === 'short'), false);
  assert.equal(catalogFacets(long).some((f) => f.key === 'beginner'), false);
});

test('a stale facet matches nothing rather than quietly widening to everything', () => {
  const { lists } = parseCatalog({ lists: [{ id: 'a', file: 'a.json', name: 'A', count: 3 }] });
  assert.deepEqual(filterByFacet(lists, 'type:motion-comic'), []);
  assert.deepEqual(filterByFacet(lists, 'nonsense'), []);
  assert.equal(facetLabel(lists, 'nonsense'), 'that filter');
});

test('an order under twenty issues is short; exactly twenty is not, as the label says', () => {
  assert.equal(isShortOrder({ count: 19 }), true);
  assert.equal(isShortOrder({ count: SHORT_ORDER_MAX }), false);
  assert.equal(isShortOrder({ count: null }), false);
  assert.equal(isShortOrder({}), false);
});

test('reading time is stated in round units and never for an unknown count', () => {
  assert.equal(readingTimeLabel(1), 'about 20 minutes');
  assert.equal(readingTimeLabel(4), 'about 80 minutes');
  assert.equal(readingTimeLabel(5), 'about 2 hours');
  assert.equal(readingTimeLabel(0), null);
  assert.equal(readingTimeLabel(null), null);
  // The assumption behind the estimate is a constant callers can show, not a hidden number.
  assert.equal(MINUTES_PER_ISSUE, 20);
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
      id: 'hickman', file: 'hickman.json', name: 'Hickman to Secret Wars: minimal', count: 89,
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
  assert.deepEqual(ids(searchCatalog(sample, 'spider man')), ['civil-war']);
});

// "spiderman" and "xmen" are how these names are typed at least as often as the hyphenated
// spelling. Folding punctuation to a space alone returned nothing for them, which reads as
// "we do not have that list" rather than "you punctuated it differently".
test('a name typed without its punctuation still finds the list', () => {
  assert.deepEqual(ids(searchCatalog(sample, 'spiderman')), ['civil-war']);
  assert.deepEqual(ids(searchCatalog(sample, 'SpiderMan')), ['civil-war']);
  assert.deepEqual(ids(searchCatalog(sample, 'ironman')), ['civil-war']);
  assert.deepEqual(ids(searchCatalog(sample, 'captainamerica')), ['civil-war']);
  assert.deepEqual(ids(searchCatalog(sample, 'blackpanther')), ['hickman']);
});

test('extra terms narrow the results instead of widening them', () => {
  assert.deepEqual(ids(searchCatalog(sample, 'secret wars avengers')), ['hickman']);
  assert.deepEqual(ids(searchCatalog(sample, 'secret wars spider-man')), []);
  // The de-punctuated form must not let a multi-word query match by running the words together
  // across unrelated fields, which would turn a narrowing query into a widening one.
  assert.deepEqual(ids(searchCatalog(sample, 'secretwars spiderman')), []);
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
      id: 'cw-essential', file: 'cw_e.json', name: 'Civil War: essential', count: 12,
      type: 'event', depth: 'essential', group: 'civil-war', groupName: 'Civil War',
      variant: 'Essential reading',
    },
    {
      id: 'cw-full', file: 'cw_f.json', name: 'Civil War: complete', count: 90,
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
      { id: 'a', file: 'a.json', name: 'Inferno: essential', count: 1, group: 'inferno' },
      { id: 'b', file: 'b.json', name: 'Inferno: complete', count: 2, group: 'inferno' },
    ],
  });
  assert.equal(groupCatalog(lists)[0].name, 'Inferno: essential');
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

// ------------------------------------------------------------------ attribution

test('a source is linked only when it is a real https address', () => {
  assert.equal(sourceLink({ source: 'https://example.com/order.md' }), 'https://example.com/order.md');
  assert.equal(sourceLink({ source: 'javascript:alert(1)' }), null);
  assert.equal(sourceLink({ source: 'http://example.com/order.md' }), null);
  assert.equal(sourceLink({ source: 'Comic Book Herald' }), null);
  assert.equal(sourceLink({}), null);
});

test('attribution falls back to the source when no license is recorded', () => {
  assert.equal(sourceLabel({ sourceLicense: 'MIT', source: 'https://example.com' }), 'MIT');
  assert.equal(sourceLabel({ source: 'https://example.com' }), 'https://example.com');
  assert.equal(sourceLabel({}), null);
});

test('a last-updated date is shown only when it is a real date', () => {
  assert.equal(updatedLabel({ updatedAt: '2026-08-04T06:14:48.695Z' }, 'en-GB'), '4 Aug 2026');
  assert.equal(updatedLabel({ updatedAt: 'sometime last year' }), null);
  assert.equal(updatedLabel({}), null);
});

// The stamp is a UTC instant, so it has to render as the same day everywhere. Formatted in
// local time, an early-morning UTC stamp slips to the previous day across the Americas, and
// two readers comparing the same catalog would see different dates.
test('the snapshot date is the same day in every timezone', () => {
  const early = { updatedAt: '2026-08-04T00:30:00.000Z' };
  const late = { updatedAt: '2026-08-04T23:30:00.000Z' };
  const saved = process.env.TZ;
  try {
    for (const tz of ['UTC', 'America/Los_Angeles', 'America/New_York', 'Asia/Tokyo', 'Pacific/Kiritimati']) {
      process.env.TZ = tz;
      assert.equal(updatedLabel(early, 'en-GB'), '4 Aug 2026', `early stamp in ${tz}`);
      assert.equal(updatedLabel(late, 'en-GB'), '4 Aug 2026', `late stamp in ${tz}`);
    }
  } finally {
    if (saved == null) delete process.env.TZ;
    else process.env.TZ = saved;
  }
});

test('every bundled catalog entry carries attribution and a last-updated date', async () => {
  const url = new URL('../src/data/catalog.json', import.meta.url);
  const { lists } = parseCatalog(JSON.parse(await readFile(url, 'utf8')));
  assert.ok(lists.length);
  for (const list of lists) {
    assert.ok(sourceLabel(list), `${list.id} has no attribution`);
    assert.ok(updatedLabel(list, 'en-GB'), `${list.id} has no last-updated date`);
  }
});
