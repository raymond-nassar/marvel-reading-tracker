import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateBackup, normalizeIssue, normalizeCover, exportBackup,
  MAX_NAME, MAX_DESCRIPTION, MAX_URL, MAX_ISSUES, MAX_LISTS, MAX_MARKERS, MAX_BACKUP_BYTES,
} from '../src/js/lib/model.js';
import { createEmptyState, createList } from '../src/js/lib/model.js';
import { Store } from '../src/js/storage.js';
import { describeSize, backupFileRefusal } from '../src/js/main.js';

// A backup is the one input to this app that a person can hand-edit, and until these caps existed
// every one of them was applied on the way in and skipped on the way back. The numbers below are
// the ones measured against the twelve shipped orders: the longest real title is 72 characters,
// the longest description 800, and the longest cover path 58, so nothing here refuses real data.

const long = (n) => 'x'.repeat(n);

const restore = (backup) => validateBackup({
  schemaVersion: 2, lists: {}, issues: {}, read: {}, notes: {}, overrides: {}, ...backup,
});

test('a restored issue is capped the same way a created one is', () => {
  const v = restore({
    issues: {
      1: {
        issueId: 1,
        title: long(50000),
        seriesName: long(50000),
        description: long(50000),
        creators: [{ name: long(50000), role: long(50000) }],
      },
    },
  });
  assert.equal(v.ok, true);
  const issue = v.state.issues[1];
  assert.equal(issue.title.length, MAX_NAME);
  assert.equal(issue.seriesName.length, MAX_NAME);
  assert.equal(issue.description.length, MAX_DESCRIPTION);
  assert.equal(issue.creators[0].name.length, MAX_NAME);
  assert.equal(issue.creators[0].role.length, MAX_NAME);
});

test('a restored list name and description are capped the same way a created one is', () => {
  const v = restore({
    lists: { a: { id: 'a', name: long(50000), description: long(50000), itemIds: [] } },
  });
  assert.equal(v.ok, true);
  assert.equal(v.state.lists.a.name.length, MAX_NAME);
  assert.equal(v.state.lists.a.description.length, MAX_DESCRIPTION);
});

// Truncating a link produces a link to the wrong page, which is worse than no link, so the two
// URL-shaped fields drop rather than slice. Nothing in the app renders an absent link.
test('an over-long issue url is dropped rather than truncated', () => {
  const issue = normalizeIssue({ issueId: 1, title: 'T', url: `https://x.example/${long(MAX_URL)}` });
  assert.equal(issue.url, null);
});

test('an over-long cover path is refused rather than truncated', () => {
  // The host is the allowed one, so length is what refuses this. Written against a rejected host
  // the assertion would still pass and would no longer measure the bound it names.
  assert.equal(normalizeCover({ path: `https://i.annihil.us/${long(MAX_URL)}`, extension: 'jpg' }), null);
});

test('a real url and cover of ordinary length still survive', () => {
  const issue = normalizeIssue({
    issueId: 1,
    title: 'Ultimate Black Panther (2024) #22',
    url: 'https://www.marvel.com/comics/issue/1',
    cover: { path: 'http://i.annihil.us/u/prod/marvel/i/mg/6/60/abcdef0123456', extension: 'jpg' },
  });
  assert.equal(issue.url, 'https://www.marvel.com/comics/issue/1');
  assert.equal(issue.cover.path, 'https://i.annihil.us/u/prod/marvel/i/mg/6/60/abcdef0123456');
  assert.equal(issue.cover.ext, 'jpg');
});

test('a cover extension is bounded, so a padded one cannot ride in on the filename', () => {
  assert.equal(normalizeCover({ path: 'https://i.annihil.us/a', extension: long(50000) }).ext.length <= 8, true);
});

// The list order is filtered for membership, not uniqueness, so a repeated valid id was carried
// once per repetition. 300,000 entries naming one list fitted in a 1.14 mebibyte file, cleared
// every ceiling, and made the rail append a node per entry on every update.
test('a listOrder repeating one valid id collapses to a single entry', () => {
  const v = restore({
    lists: { a: { id: 'a', name: 'L', itemIds: [] } },
    listOrder: Array.from({ length: 50000 }, () => 'a'),
  });
  assert.equal(v.ok, true);
  assert.deepEqual(v.state.listOrder, ['a']);
});

// The dedupe is a Set and the membership filter is a property lookup, so the two disagreed on
// everything that was not already a string: the lookup coerces its key, the Set compares identity.
// An entry of [1] stringifies to "1", so it named a list keyed "1" and passed, and every copy was a
// fresh identity, so a dedupe added to stop exactly this kept all 300,000 of them. The worst shape
// measured was 2,796,179 entries of [] against a list keyed "", in a file two bytes inside the guard.
test('a listOrder repeating a non-string that names a valid list collapses too', () => {
  const v = restore({
    lists: { 1: { id: '1', name: 'L', itemIds: [] } },
    listOrder: Array.from({ length: 50000 }, () => [1]),
  });
  assert.equal(v.ok, true);
  // The length first, and on its own, because deepEqual renders both operands into its message and
  // with the filter removed the left one is 50,000 arrays. Node built that diff until the process
  // ran out of memory, which reports as the whole file failing rather than as this claim failing,
  // and a suite that cannot say which claim broke is the failure this file's own proof warns about.
  assert.equal(v.state.listOrder.length, 1, 'every copy survived, so the filter is not collapsing them');
  assert.deepEqual(v.state.listOrder, ['1'], 'what the app writes is strings, and so is what it reads back');
});

test('a listOrder still orders the lists it names, and still gains the ones it omits', () => {
  const v = restore({
    lists: {
      a: { id: 'a', name: 'A', itemIds: [] },
      b: { id: 'b', name: 'B', itemIds: [] },
      c: { id: 'c', name: 'C', itemIds: [] },
    },
    listOrder: ['c', 'a', 'c'],
  });
  assert.equal(v.ok, true);
  assert.deepEqual(v.state.listOrder, ['c', 'a', 'b']);
});

// Five string fields were capped and seven scalars were not, so one issue could carry a
// seven-million-character state past every count ceiling and the file guard together.
test('every scalar an issue carries is bounded, not only the ones the view renders long', () => {
  const v = restore({
    issues: {
      1: {
        issueId: 1, title: 'T',
        number: long(50000), seriesId: long(50000), onSale: long(50000), mu: long(50000),
        digitalId: long(50000), source: long(50000), hydrated: long(50000),
      },
    },
  });
  assert.equal(v.ok, true);
  const issue = v.state.issues[1];
  for (const field of ['number', 'seriesId', 'onSale', 'mu', 'digitalId', 'source', 'hydrated']) {
    assert.equal(issue[field].length, MAX_NAME, `${field} must be bounded`);
  }
  assert.ok(JSON.stringify(v.state).length < 5000, 'one issue must not be able to build an unbounded state');
});

test('an ordinary scalar passes through the bound untouched', () => {
  const issue = normalizeIssue({
    issueId: 1, title: 'T', number: 22, seriesId: 30000, digitalId: 60000,
    onSale: '2024-01-01T00:00:00-0500', mu: '2024-04-01T00:00:00-0400', source: 'api', hydrated: true,
  });
  assert.equal(issue.number, 22);
  assert.equal(issue.seriesId, 30000);
  assert.equal(issue.digitalId, 60000);
  assert.equal(issue.onSale, '2024-01-01T00:00:00-0500');
  assert.equal(issue.mu, '2024-04-01T00:00:00-0400');
  assert.equal(issue.source, 'api');
  assert.equal(issue.hydrated, true);
});

test('a backup declaring more issues than the app can hold is refused before it is built', () => {
  const issues = {};
  const read = {};
  for (let i = 1; i <= MAX_ISSUES + 1; i += 1) { issues[i] = { issueId: i, title: 'T' }; read[i] = true; }
  const v = restore({ issues, read });
  assert.equal(v.ok, false);
  assert.equal(v.state, null);
  assert.ok(v.errors.some((e) => e.includes(String(MAX_ISSUES + 1)) && e.includes(String(MAX_ISSUES))),
    'the refusal names both the declared count and the ceiling');
});

test('a backup declaring more lists than the app can hold is refused', () => {
  const lists = {};
  for (let i = 0; i <= MAX_LISTS; i += 1) lists[`l${i}`] = { id: `l${i}`, name: 'L', itemIds: [] };
  const v = restore({ lists });
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => e.includes('lists')));
});

test('one list declaring more issues than the app can hold is refused', () => {
  const itemIds = Array.from({ length: MAX_ISSUES + 1 }, (_, i) => i + 1);
  const v = restore({ lists: { a: { id: 'a', name: 'L', itemIds } } });
  assert.equal(v.ok, false);
  assert.equal(v.state, null);
});

// The ceiling has to sit above anything the app could itself have written, or it would refuse a
// backup this app produced, and undoing a restore feeds the pre-restore snapshot back through this
// same check, so a ceiling set too low would refuse a recovery of the app's own data. A first draft
// took the hydrated issue at 923 characters as the floor; the cheapest coerced issue costs 267
// characters at the margin, so the most generous origin a browser grants holds about 39,300 of
// them. The count below is above that and still far under the ceiling.
test('a tracker larger than any origin can hold still restores, because the ceiling is not a quota', () => {
  const issues = {};
  const itemIds = [];
  for (let i = 1; i <= 40000; i += 1) {
    issues[i] = {
      issueId: i, title: `S (2024) #${i}`, url: `https://www.marvel.com/comics/issue/${i}/`,
      source: 'import', hydrated: false,
    };
    itemIds.push(i);
  }
  const v = restore({ issues, lists: { a: { id: 'a', name: 'L', itemIds } } });
  assert.equal(v.ok, true);
  assert.equal(Object.keys(v.state.issues).length, 40000);
  assert.equal(v.state.lists.a.itemIds.length, 40000);
});

// Nothing pinned the comparison itself. Changing `n > cap` to `n >= cap` left the whole suite green,
// and that mutation refuses a backup holding exactly as many as it says it holds, which is the false
// refusal the ceiling exists to avoid. The values are zeroes because the count is taken before
// coercion, so a map of 250,000 of them costs one pass over the keys and builds nothing.
test('a backup holding exactly the ceiling is accepted, because the ceiling is the last count allowed', () => {
  const issues = {};
  for (let i = 1; i <= MAX_ISSUES; i += 1) issues[i] = 0;
  assert.equal(restore({ issues }).ok, true);
  const lists = {};
  for (let i = 1; i <= MAX_LISTS; i += 1) lists[`l${i}`] = 0;
  assert.equal(restore({ lists }).ok, true);
});

test('one over the ceiling is refused, so the bound is the count and not the shape', () => {
  const issues = {};
  for (let i = 1; i <= MAX_ISSUES + 1; i += 1) issues[i] = 0;
  assert.equal(restore({ issues }).ok, false);
  const lists = {};
  for (let i = 1; i <= MAX_LISTS + 1; i += 1) lists[`l${i}`] = 0;
  assert.equal(restore({ lists }).ok, false);
});

// A version 1 backup has no issues map at all: it carries whole issue objects inside each list's
// items, and migrate turns every one of them into an issue. Counting the issues map alone therefore
// scored a v1 file at zero however large it was, and 50,000 items in a 1.50 mebibyte file cleared
// every check and built 50,000 issues in 3.8 seconds.
test('a version 1 backup is counted too, though it carries its issues inside its lists', () => {
  const items = Array.from({ length: MAX_ISSUES + 1 }, () => 0);
  const v = validateBackup({ schemaVersion: 1, lists: { a: { id: 'a', name: 'L', items } } });
  assert.equal(v.ok, false);
  assert.equal(v.state, null);
  assert.ok(v.errors.some((e) => e.includes('inside its lists')));
});

test('the version 1 count is the total across lists, because one issues map is what they become', () => {
  const half = Math.ceil((MAX_ISSUES + 1) / 2);
  const v = validateBackup({
    schemaVersion: 1,
    lists: {
      a: { id: 'a', name: 'A', items: Array.from({ length: half }, () => 0) },
      b: { id: 'b', name: 'B', items: Array.from({ length: half }, () => 0) },
    },
  });
  assert.equal(v.ok, false, 'neither list is over the ceiling on its own, and together they are');
});

test('an ordinary version 1 backup still restores', () => {
  const v = validateBackup({
    schemaVersion: 1,
    lists: { a: { name: 'Imported', items: [{ issueId: 1, title: 'A' }, { issueId: 2, title: 'B', read: true }] } },
  });
  assert.equal(v.ok, true);
  assert.equal(Object.keys(v.state.issues).length, 2);
  assert.equal(v.state.read[2] != null, true);
});

// The backfill under the dedupe was `listOrder.includes(id)` inside a loop over every list, which is
// quadratic. At the old ceiling of 1,000 lists that cost 3 milliseconds; at 250,000 it cost 26.6
// seconds, on a 5.38 mebibyte file that clears the size guard and every count check, so raising the
// ceiling froze the tab before a byte was written. Timing is too fragile to assert closely, so the
// size is picked to put the two forms far apart and the budget in the gap: this whole test takes 397
// milliseconds through the Set and about seven seconds through Array.includes, so the budget below
// has seven times the headroom it needs and the quadratic form misses it by more than twice.
test('lists are backfilled into the order in time that does not grow with their square', () => {
  const lists = {};
  for (let i = 0; i < 120000; i += 1) lists[`l${i}`] = { name: 'L' };
  const started = Date.now();
  const v = restore({ lists });
  assert.equal(v.ok, true);
  assert.equal(v.state.listOrder.length, 120000);
  assert.equal(new Set(v.state.listOrder).size, 120000);
  assert.equal(v.state.listOrder[0], 'l0');
  assert.ok(Date.now() - started < 3000, 'the quadratic form took about seven seconds on this input');
});

// The other half of the clause the ceiling has to satisfy. A ceiling above anything an eight
// mebibyte file could declare would never fire, and the figure for that was quoted wrong too: 355,000
// where the crossing point is 374,382. A marginal rate taken on a few thousand records is
// self-referential, because at 400,000 issues the ids are six digits and not four. So this asserts
// the claim itself, on the cheapest shape that still coerces, rather than any rate derived from it.
test('the count ceiling is reachable inside a file the size guard permits, so it is not dead code', () => {
  const issues = {};
  for (let i = 1; i <= MAX_ISSUES + 1; i += 1) issues[i] = { id: i };
  const v2 = { schemaVersion: 2, issues };
  assert.ok(JSON.stringify(v2).length <= MAX_BACKUP_BYTES,
    'a file declaring one over the ceiling has to clear the size guard, or the count never runs');
  assert.equal(validateBackup(v2).ok, false, 'and having cleared it, has to be refused by the count');

  const items = [];
  for (let i = 1; i <= MAX_ISSUES + 1; i += 1) items.push({ id: i });
  const v1 = { schemaVersion: 1, lists: { a: { name: 'L', items } } };
  assert.ok(JSON.stringify(v1).length <= MAX_BACKUP_BYTES, 'the same has to hold for the version 1 carrier');
  const refused = validateBackup(v1);
  assert.equal(refused.ok, false);
  // Named, because ok:false is also what a collapse further in produces, and that is exactly what
  // this assertion was quietly settling for: with the count removed it still passed, on a stack
  // overflow from the insert below.
  assert.ok(refused.errors.some((e) => e.includes('inside its lists')),
    'refused by the count it declares, not by something giving out later');
});

// A bound above the point where the code gives out is not a bound. The version 1 route hands every
// carried issue to one call, and that call copied the whole issues map per issue and then inserted
// them all as arguments, so the ceiling it was given was one the path could not reach: 120,000 items
// took 22.7 seconds and 250,000, which every check admits, took 96 before failing with "Maximum call
// stack size exceeded" as its refusal text. Both are linear now, and the same input takes 127
// milliseconds. Asserted at the ceiling itself, because that is the number the checks promise.
test('a version 1 backup at the ceiling restores, rather than giving out on the way in', () => {
  const items = [];
  for (let i = 1; i <= MAX_ISSUES; i += 1) items.push({ issueId: i, title: 'T' });
  const started = Date.now();
  const v = validateBackup({ schemaVersion: 1, lists: { a: { name: 'L', items } } });
  assert.equal(v.ok, true, v.errors?.join(' '));
  assert.equal(Object.keys(v.state.issues).length, MAX_ISSUES);
  assert.equal(v.state.lists[v.state.listOrder[0]].itemIds.length, MAX_ISSUES);
  assert.ok(Date.now() - started < 20000, 'the quadratic form took 96 seconds on this input');
});

// The fixture above carries one list and no read flag, and a version 1 backup is defined by the
// other two: migrate's own comment says v1 stored full item objects inside each list with a per-list
// `read` boolean. So the one shape that was pinned was the only one that missed the two copies still
// being made per element, in createList and in markRead. Measured before this was fixed: 5,000 empty
// lists is 0.17 of a mebibyte, two per cent of the size guard, and took 16.8 seconds, while 80,000
// items carrying `read` took 9.3 at 3.19. Both curves quadrupled on each doubling. Fixed, they are
// 12 and 26 milliseconds.
//
// Both are asserted at the count ceiling rather than at the size the old code choked on, and the
// list shape carries no name so that 250,000 of them still fit inside the size guard, which for a
// named list binds ten lists early, at 249,990.
test('a version 1 backup at the list ceiling restores, rather than crawling through it', () => {
  const lists = {};
  for (let i = 0; i < MAX_LISTS; i += 1) lists[`l${i}`] = { items: [] };
  const backup = { schemaVersion: 1, lists };
  assert.ok(JSON.stringify(backup).length <= MAX_BACKUP_BYTES,
    'a fixture the size guard would refuse proves nothing about the counts behind it');
  const started = Date.now();
  const v = validateBackup(backup);
  assert.equal(v.ok, true, v.errors?.join(' '));
  assert.equal(v.state.listOrder.length, MAX_LISTS);
  // Not a restatement of the line above. Each list is given a generated id, and a repeated id
  // silently drops a list from the map while leaving the order the right length. This was written
  // first as "measured at this ceiling: none collide", on one clean run. It was 96 per cent true:
  // the mint was random per id and the fixed route is fast enough to put about 610 of them in each
  // millisecond stamp, which is 78 million same-stamp pairs against 36^6, so 4 of 60 runs lost a
  // list. newId counts up now, so this is an invariant rather than a good draw, and the assertion
  // is what holds it to that.
  assert.equal(Object.keys(v.state.lists).length, MAX_LISTS, 'two lists were given the same id');
  assert.ok(Date.now() - started < 20000, 'the quadratic form took 16.8 seconds on a fiftieth of this');
});

test('a version 1 backup whose items carry the read flag restores at the ceiling too', () => {
  const items = [];
  for (let i = 1; i <= MAX_ISSUES; i += 1) items.push({ issueId: i, read: 1 });
  const backup = { schemaVersion: 1, lists: { a: { name: 'L', items } } };
  assert.ok(JSON.stringify(backup).length <= MAX_BACKUP_BYTES,
    'a fixture the size guard would refuse proves nothing about the counts behind it');
  const started = Date.now();
  const v = validateBackup(backup);
  assert.equal(v.ok, true, v.errors?.join(' '));
  assert.equal(Object.keys(v.state.issues).length, MAX_ISSUES);
  // The read map is the one the old code copied per marker, so its size is what this test is about.
  assert.equal(Object.keys(v.state.read).length, MAX_ISSUES);
  assert.ok(Date.now() - started < 20000, 'the quadratic form took 9.3 seconds on a third of this');
});

// Stated as arithmetic because this is the clause the ceiling has to satisfy, and the first draft
// failed it by a factor of three and a half while reading as though it had been checked. The floor
// is measured here rather than quoted, because quoting is how it went wrong twice: the first draft
// quoted 923, the second quoted 292 and 185, and a review quoted 233 and 137. The costs are 267 and
// 127. Differenced between two sizes so the fixed part of the file drops out, and taken on
// exportBackup because that is the form storage writes to the origin.
test('the count ceiling sits above what the most generous origin could hold', () => {
  const marginalCost = (build) => {
    const size = (n) => JSON.stringify(exportBackup(build(n))).length;
    return (size(6000) - size(2000)) / 4000;
  };
  const cheapestIssues = (n) => {
    const issues = {};
    for (let i = 1; i <= n; i += 1) issues[i] = { issueId: i, title: '', number: '', seriesName: '' };
    const v = restore({ issues });
    assert.equal(Object.keys(v.state.issues).length, n, 'a shape that does not survive coercion is not a floor');
    return v.state;
  };
  const cheapestLists = (n) => {
    const lists = {};
    for (let i = 0; i < n; i += 1) lists[String.fromCharCode(0x100 + i)] = { name: '' };
    const v = restore({ lists });
    assert.equal(Object.keys(v.state.lists).length, n, 'a shape that does not survive coercion is not a floor');
    return v.state;
  };
  // The three below were governed by MAX_ISSUES for four rounds while only the two above were ever
  // measured, and all three failed the clause: at the margin a read marker costs 9 characters, an
  // override 19 and a note 11, against an issue's 267. Checked here where they are applied, because
  // asserting the clause for two of the five maps it governs is how it went unnoticed.
  const cheapestReads = (n) => {
    const read = {};
    for (let i = 1; i <= n; i += 1) read[i] = 1;
    const v = restore({ read });
    assert.equal(Object.keys(v.state.read).length, n, 'a shape that does not survive coercion is not a floor');
    return v.state;
  };
  const cheapestOverrides = (n) => {
    const overrides = {};
    for (let i = 1; i <= n; i += 1) overrides[i] = 'available';
    const v = restore({ overrides });
    assert.equal(Object.keys(v.state.overrides).length, n, 'a shape that does not survive coercion is not a floor');
    return v.state;
  };
  const cheapestNotes = (n) => {
    const notes = {};
    for (let i = 1; i <= n; i += 1) notes[i] = 'x';
    const v = restore({ notes });
    assert.equal(Object.keys(v.state.notes).length, n, 'a shape that does not survive coercion is not a floor');
    return v.state;
  };
  const mostGenerousOrigin = 10 * 1024 * 1024;
  assert.ok(MAX_ISSUES > mostGenerousOrigin / marginalCost(cheapestIssues),
    'a ceiling below what the origin holds would refuse a tracker a user can reach by importing');
  assert.ok(MAX_LISTS > mostGenerousOrigin / marginalCost(cheapestLists),
    'the same argument applies to lists, which are created without a cap');
  assert.ok(MAX_MARKERS > mostGenerousOrigin / marginalCost(cheapestReads),
    'a read marker is a number against an issue id, so the origin holds far more of them than issues');
  assert.ok(MAX_MARKERS > mostGenerousOrigin / marginalCost(cheapestOverrides),
    'an availability override is one of two short words, so the same argument applies');
  assert.ok(MAX_MARKERS > mostGenerousOrigin / marginalCost(cheapestNotes),
    'a note is capped in length but a one-character note is cheaper than any issue');
});

// The arithmetic above is the clause; this is what breaching it did to a reader, and it is here
// because every defect these reviews have found was an assertion standing next to the claim rather
// than on it. Driven through the real Store so the refusal has to survive persist, the pre-restore
// snapshot and undoRestore, which is the path that turns a strict ceiling into lost data: the app
// accepts a tracker at the ceiling, saves it one entry larger without complaint, and then refuses
// to give that back. Notes are the map used because they are the cheapest of the three the ceiling
// governed while nobody had measured them.
test('a tracker the app agreed to hold can still be recovered after a restore', () => {
  const map = new Map();
  const storage = {
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: (k) => { map.delete(k); },
  };
  const withNotes = (n) => {
    const notes = {};
    for (let i = 1; i <= n; i += 1) notes[i] = 'x';
    return JSON.stringify({ ...exportBackup(createList(createEmptyState(), { name: 'Everything' })), notes });
  };

  const store = new Store({ storage });
  store.load();
  assert.equal(store.restore(withNotes(MAX_ISSUES)).ok, true, 'a tracker at the old ceiling is accepted');
  store.update((s) => ({ ...s, notes: { ...s.notes, 999999: 'one more' } }));
  assert.equal(Object.keys(store.state.notes).length, MAX_ISSUES + 1, 'and the app saves it one larger');

  assert.equal(store.restore(withNotes(3)).ok, true);
  const undone = store.undoRestore();
  assert.equal(undone.ok, true, undone.errors?.join(' '));
  assert.equal(Object.keys(store.state.notes).length, MAX_ISSUES + 1,
    'the ceiling refused the reader their own data back, which is the loss it was raised to prevent');
});

test('the file-size ceiling sits well above the largest backup this app can write', () => {
  // 1,560,536 characters, measured with all twelve orders imported, every issue read and every
  // issue annotated to the note cap. Four-byte characters throughout make that 6,242,144 bytes.
  assert.ok(MAX_BACKUP_BYTES > 1560536 * 4, 'the ceiling must clear the worst honest backup in four-byte characters');
  assert.ok(MAX_BACKUP_BYTES <= 16 * 1024 * 1024, 'a ceiling this generous stops being a bound');
});

test('a file at the ceiling is read and one above it is refused by name and size', () => {
  assert.equal(backupFileRefusal({ size: MAX_BACKUP_BYTES }), null);
  assert.equal(backupFileRefusal({ size: 1560536 }), null, 'the worst honest backup must still be read');
  const refusal = backupFileRefusal({ size: MAX_BACKUP_BYTES + 1 });
  assert.ok(refusal, 'a file over the ceiling must be refused');
  assert.match(refusal, /8\.0 MB/);
  assert.match(refusal, /nothing was changed/);
});

test('a file whose size the browser will not report is read rather than refused', () => {
  // Refusing on an unreadable size would block a restore for a reason the person cannot act on,
  // and the parse that follows already refuses anything that is not a backup.
  assert.equal(backupFileRefusal({}), null);
  assert.equal(backupFileRefusal({ size: NaN }), null);
});

test('the size a refusal reports is readable, and an unknown one says so', () => {
  assert.equal(describeSize(512), '512 bytes');
  assert.equal(describeSize(1536), '1.5 KB');
  assert.equal(describeSize(MAX_BACKUP_BYTES), '8.0 MB');
  assert.equal(describeSize(undefined), 'an unknown size');
  assert.equal(describeSize(-1), 'an unknown size');
});

// The guard is worth nothing if it runs after the read it exists to avoid, so the order of the two
// statements is the property under test, not the presence of either. Both positions are taken
// inside the handler rather than in the whole file: measured before this narrowing, the search hit
// the function's own definition eight hundred lines above and passed with the call deleted.
test('the restore handler asks the size before it reads the file', () => {
  const handler = restoreHandlerSource();
  const guard = handler.indexOf('backupFileRefusal(');
  const read = handler.indexOf('await file.text()');
  assert.ok(guard >= 0, 'the handler must consult the size guard');
  assert.ok(read >= 0, 'the handler must read the file');
  assert.ok(guard < read, 'the size guard must come before the file is read into memory');
});

test('the restore handler clears the picker when it refuses, so the same file can be re-picked', () => {
  const handler = restoreHandlerSource();
  const guard = handler.indexOf('backupFileRefusal(');
  const read = handler.indexOf('await file.text()');
  assert.match(handler.slice(guard, read), /e\.target\.value = ''/);
});

function restoreHandlerSource() {
  const main = readMain();
  const at = main.indexOf("$('#restore-file').addEventListener");
  assert.ok(at > 0, 'the restore file picker handler was not found, so this proves nothing');
  return main.slice(at);
}

function readMain() {
  return readFileSync(new URL('../src/js/main.js', import.meta.url), 'utf8');
}
