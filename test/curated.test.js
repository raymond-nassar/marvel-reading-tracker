import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseManifest } from '../src/js/lib/curated.js';
import { parseCatalog } from '../src/js/lib/catalog.js';

const valid = {
  id: 'civil-war',
  name: 'Civil War',
  description: 'Registration splits the heroes.',
  type: 'event',
  depth: 'essential',
  sourceUrl: 'https://example.test/civil_war.md',
  sourcePage: 'https://example.test/civil_war',
  sourceLicense: 'MIT (example)',
  out: 'civil_war.json',
  characters: ['Iron Man'],
  keywords: ['crossover'],
  expect: 40,
};

test('a complete manifest entry is accepted as-is', () => {
  const { entries, errors } = parseManifest({ lists: [valid] });
  assert.deepEqual(errors, []);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].out, 'civil_war.json');
  assert.equal(entries[0].sourcePage, 'https://example.test/civil_war');
  assert.equal(entries[0].expect, 40);
});

test('sourcePage falls back to sourceUrl so attribution is never blank', () => {
  const { entries } = parseManifest({ lists: [{ ...valid, sourcePage: undefined }] });
  assert.equal(entries[0].sourcePage, valid.sourceUrl);
});

test('expect is optional', () => {
  const { entries, errors } = parseManifest({ lists: [{ ...valid, expect: undefined }] });
  assert.deepEqual(errors, []);
  assert.equal(entries[0].expect, null);
});

test('an order can be authored in this repository instead of fetched', () => {
  const local = { ...valid, sourceUrl: undefined, sourcePage: undefined, sourceFile: 'civil_war.md' };
  const { entries, errors } = parseManifest({ lists: [local] });
  assert.deepEqual(errors, []);
  assert.equal(entries[0].sourceFile, 'civil_war.md');
  assert.equal(entries[0].sourceUrl, null);
  // No upstream page to send the reader to, so attribution rests on the license alone rather
  // than on a link that goes nowhere.
  assert.equal(entries[0].sourcePage, null);
});

test('an incomplete entry is reported with its reason, not silently skipped', () => {
  const cases = [
    [{ ...valid, id: '' }, /has no id/],
    [{ ...valid, name: '' }, /has no name/],
    [{ ...valid, out: '../escape.json' }, /output file name/],
    [{ ...valid, sourceUrl: 'http://example.test/x.md' }, /sourceUrl that is not https/],
    [{ ...valid, sourceUrl: 'not a url' }, /sourceUrl that is not https/],
    [{ ...valid, sourceUrl: undefined, sourcePage: undefined }, /no sourceUrl or sourceFile/],
    [{ ...valid, sourceUrl: undefined, sourceFile: '../escape.md' }, /sourceFile that is not a plain/],
    [{ ...valid, sourceUrl: undefined, sourceFile: 'order.json' }, /sourceFile that is not a plain/],
    [{ ...valid, sourceFile: 'order.md' }, /an order comes from one place/],
    [{ ...valid, sourceLicense: null }, /sourceLicense/],
    [{ ...valid, type: 'anthology' }, /type must be one of/],
    [{ ...valid, depth: 'skim' }, /depth must be one of/],
    [{ ...valid, expect: 0 }, /expect must be/],
    [{ ...valid, variant: 'Essential reading' }, /need a group to belong to/],
    [{ ...valid, groupName: 'Civil War' }, /need a group to belong to/],
    [null, /is not an object/],
  ];
  for (const [entry, pattern] of cases) {
    const { entries, errors } = parseManifest({ lists: [entry] });
    assert.equal(entries.length, 0, `accepted ${JSON.stringify(entry)}`);
    assert.match(errors.join('\n'), pattern);
  }
});

test('an order can declare the event variant it belongs to', () => {
  const { entries, errors } = parseManifest({
    lists: [{ ...valid, group: 'civil-war', groupName: 'Civil War', variant: 'Essential reading' }],
  });
  assert.deepEqual(errors, []);
  assert.equal(entries[0].group, 'civil-war');
  assert.equal(entries[0].variant, 'Essential reading');
});

test('a duplicate id is rejected rather than vendored twice', () => {
  const { entries, errors } = parseManifest({ lists: [valid, { ...valid, name: 'Civil War again' }] });
  assert.equal(entries.length, 1);
  assert.match(errors.join('\n'), /duplicate id "civil-war"/);
});

test('a missing or malformed manifest reports an error instead of crashing', () => {
  assert.match(parseManifest(undefined).errors.join(), /no "lists" array/);
  assert.match(parseManifest({ lists: 'nope' }).errors.join(), /no "lists" array/);
});

test('the bundled manifest is valid and describes exactly the bundled catalog', async () => {
  const manifest = JSON.parse(await readFile(new URL('../src/data/curated-lists.json', import.meta.url), 'utf8'));
  const { entries, errors } = parseManifest(manifest);
  assert.deepEqual(errors, []);
  assert.ok(entries.length > 0);

  const catalogRaw = JSON.parse(await readFile(new URL('../src/data/catalog.json', import.meta.url), 'utf8'));
  const { lists } = parseCatalog(catalogRaw);

  assert.deepEqual(entries.map((e) => e.id).sort(), lists.map((l) => l.id).sort());
  for (const entry of entries) {
    const list = lists.find((l) => l.id === entry.id);
    assert.equal(list.file, entry.out, `${entry.id} file drifted from the manifest`);
    assert.equal(list.name, entry.name);
    assert.equal(list.type, entry.type);
    assert.equal(list.depth, entry.depth);
    assert.equal(list.source, entry.sourcePage);
    assert.equal(list.sourceLicense, entry.sourceLicense);
    assert.deepEqual(list.characters, entry.characters);
    assert.deepEqual(list.keywords, entry.keywords);
    assert.equal(list.group, entry.group, `${entry.id} group drifted from the manifest`);
    assert.equal(list.groupName, entry.groupName);
    assert.equal(list.variant, entry.variant);
    if (entry.expect != null) assert.equal(list.count, entry.expect, `${entry.id} count drifted`);
  }
});
