import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createEmptyState, createList, deleteList, duplicateList, renameList, setActive, addIssuesToList,
  removeFromList, moveItem, moveItemTo, markRead, toggleRead, isRead, markManyRead,
  setOverride, upNext, listProgress, seriesProgress, listItems, pendingIssueIds,
  hydrationOrder, migrate, validateBackup, exportBackup, normalizeIssue, upsertIssue,
  normalizeCover, coverUrl, SCHEMA_VERSION, MAX_NAME, MAX_DESCRIPTION,
} from '../src/js/lib/model.js';

const issue = (id, over = {}) => ({
  issueId: id,
  title: `Issue ${id}`,
  seriesId: 100,
  seriesName: 'Test Series (2013)',
  onSale: '2013-01-01T00:00:00+0000',
  digitalId: id * 2,
  ...over,
});

function withList(items = [1, 2, 3], name = 'L') {
  let s = createList(createEmptyState(), { name });
  const id = s.listOrder[0];
  s = addIssuesToList(s, id, items.map((i) => issue(i))).state;
  return { state: s, id };
}

// ------------------------------------------------------------------ issues

test('normalizeIssue rejects records without a usable id', () => {
  assert.equal(normalizeIssue({ title: 'no id' }), null);
  assert.equal(normalizeIssue({ issueId: 0 }), null);
  assert.equal(normalizeIssue({ issueId: 1.5 }), null);
  assert.equal(normalizeIssue({ issueId: 'abc' }), null);
  assert.equal(normalizeIssue(null), null);
});

// Hand-added issues with no marvel.com URL are given a negative synthetic id. Rejecting those
// meant the entry was silently discarded while the UI reported success.
test('a hand-added issue with a synthetic negative id is accepted', () => {
  const n = normalizeIssue({ issueId: -1738000000000, title: 'Something I own in print' });
  assert.ok(n, 'a synthetic id must not be rejected');
  assert.equal(n.issueId, -1738000000000);
  assert.equal(n.title, 'Something I own in print');
  assert.equal(n.url, null, 'a synthetic id has no marvel.com page, so no link may be invented');
});

test('a hand-added issue actually lands in the list', () => {
  const s = createList(createEmptyState(), { name: 'L' });
  const id = s.listOrder[0];
  const res = addIssuesToList(s, id, [{
    issueId: -1738000000000, title: 'By hand', source: 'manual', hydrated: true,
  }]);
  assert.equal(res.added, 1, 'the entry must be stored, not silently dropped');
  assert.deepEqual(res.state.lists[id].itemIds, [-1738000000000]);
  assert.equal(listItems(res.state, id)[0].title, 'By hand');
});

test('id zero is still refused, including inside a list', () => {
  const s = createList(createEmptyState(), { name: 'L' });
  const id = s.listOrder[0];
  const res = addIssuesToList(s, id, [{ issueId: 0, title: 'nope' }]);
  assert.equal(res.added, 0);
  assert.deepEqual(res.state.lists[id].itemIds, []);
});

test('normalizeIssue carries the rich fields from /issues/{id}', () => {
  const n = normalizeIssue({
    id: 7,
    title: 'T',
    cover: { path: 'http://i.annihil.us/u/x', extension: 'jpg' },
    description: 'A synopsis.',
    pageCount: 32,
    creators: [{ name: 'Jonathan Hickman', role: 'writer' }],
  });
  assert.equal(n.description, 'A synopsis.');
  assert.equal(n.pageCount, 32);
  assert.equal(n.creators[0].name, 'Jonathan Hickman');
  assert.equal(n.cover.path, 'https://i.annihil.us/u/x', 'http must be upgraded to https');
  assert.equal(n.cover.ext, 'jpg');
});

test('cover URLs are built from a variant and never invented', () => {
  const withCover = normalizeIssue({ id: 1, cover: { path: 'https://cdn/x', extension: 'jpg' } });
  assert.equal(coverUrl(withCover, 'portrait_uncanny'), 'https://cdn/x/portrait_uncanny.jpg');
  assert.equal(coverUrl(normalizeIssue({ id: 2 })), null, 'no cover means no URL, not a broken one');
});

test('normalizeCover refuses anything that is not an https URL', () => {
  assert.equal(normalizeCover(null), null);
  assert.equal(normalizeCover({ path: 'javascript:alert(1)', extension: 'jpg' }), null);
  assert.equal(normalizeCover({ extension: 'jpg' }), null);
  assert.equal(normalizeCover({ path: 'https://cdn/x' }).ext, 'jpg', 'extension defaults');
});

test('pageCount only survives when it is a positive number', () => {
  assert.equal(normalizeIssue({ id: 1, pageCount: 0 }).pageCount, null);
  assert.equal(normalizeIssue({ id: 1, pageCount: 'x' }).pageCount, null);
  assert.equal(normalizeIssue({ id: 1, pageCount: '48' }).pageCount, 48);
});

test('upsert merges new detail without erasing what we already had', () => {
  let s = upsertIssue(createEmptyState(), { issueId: 1, title: 'Old', digitalId: 5 });
  s = upsertIssue(s, { issueId: 1, title: 'New', description: 'Added' });
  assert.equal(s.issues[1].title, 'New');
  assert.equal(s.issues[1].description, 'Added');
  assert.equal(s.issues[1].digitalId, 5, 'a later partial record must not blank a known field');
});

// ------------------------------------------------------------------ lists

test('adding the same issue twice is skipped, not duplicated', () => {
  const { state, id } = withList([1, 2]);
  const res = addIssuesToList(state, id, [issue(2), issue(3)]);
  assert.equal(res.added, 1);
  assert.equal(res.skipped, 1);
  assert.deepEqual(res.state.lists[id].itemIds, [1, 2, 3]);
});

test('a batch containing internal duplicates only adds one', () => {
  const { state, id } = withList([]);
  const res = addIssuesToList(state, id, [issue(9), issue(9)]);
  assert.equal(res.added, 1);
});

test('items can be inserted at a position and reordered', () => {
  const { state, id } = withList([1, 2, 3]);
  const inserted = addIssuesToList(state, id, [issue(9)], { at: 1 }).state;
  assert.deepEqual(inserted.lists[id].itemIds, [1, 9, 2, 3]);

  assert.deepEqual(moveItem(inserted, id, 9, -1).lists[id].itemIds, [9, 1, 2, 3]);
  assert.deepEqual(moveItemTo(inserted, id, 9, 3).lists[id].itemIds, [1, 2, 3, 9]);
});

test('moving past either end clamps instead of throwing', () => {
  const { state, id } = withList([1, 2, 3]);
  assert.deepEqual(moveItem(state, id, 1, -5).lists[id].itemIds, [1, 2, 3]);
  assert.deepEqual(moveItem(state, id, 3, 99).lists[id].itemIds, [1, 2, 3]);
});

test('operations on a missing list or item are no-ops', () => {
  const { state, id } = withList([1]);
  assert.equal(moveItem(state, 'nope', 1, 1), state);
  assert.equal(moveItem(state, id, 999, 1), state);
  assert.equal(removeFromList(state, 'nope', 1), state);
  assert.equal(renameList(state, 'nope', 'x'), state);
  assert.equal(setActive(state, 'nope'), state);
});

test('deleting a list keeps read progress and issue metadata', () => {
  const { state, id } = withList([1, 2]);
  const read = markRead(state, 1, true);
  const after = deleteList(read, id);
  assert.equal(after.lists[id], undefined);
  assert.ok(isRead(after, 1), 'progress must outlive the list that referenced it');
  assert.ok(after.issues[1], 'issue metadata must be retained for other lists');
});

test('deleting the active list moves focus to a surviving one', () => {
  let s = createList(createEmptyState(), { name: 'A' });
  s = createList(s, { name: 'B' });
  const [a] = s.listOrder;
  s = setActive(s, a);
  assert.notEqual(deleteList(s, a).active, a);
  assert.ok(deleteList(s, a).active);
});

test('names and descriptions are length-capped', () => {
  const s = createList(createEmptyState(), { name: 'x'.repeat(500), description: 'y'.repeat(5000) });
  const l = s.lists[s.listOrder[0]];
  assert.equal(l.name.length, 200);
  assert.equal(l.description.length, 2000);
});

// ------------------------------------------------------------------ duplicating

test('a duplicate copies the order and keeps sharing read progress', () => {
  const { state, id } = withList([1, 2, 3]);
  const read = markRead(state, 2, true);
  const { state: after, listId: copyId } = duplicateList(read, id);

  assert.notEqual(copyId, id, 'the copy needs its own id');
  assert.deepEqual(after.lists[copyId].itemIds, [1, 2, 3], 'order must survive the copy');
  assert.equal(after.lists[copyId].name, 'L (copy)');
  // The acceptance criterion: read state is global, so progress is shared rather than cloned.
  assert.ok(isRead(after, 2));
  assert.deepEqual(listProgress(after, copyId), { read: 1, total: 3 });
  assert.deepEqual(listProgress(after, id), { read: 1, total: 3 });

  // ...and marking read through the copy is visible in the original.
  const later = markRead(after, 1, true);
  assert.deepEqual(listProgress(later, id), { read: 2, total: 3 });
});

test('editing a duplicate never disturbs the original order', () => {
  const { state, id } = withList([1, 2, 3]);
  const { state: after, listId: copyId } = duplicateList(state, id);

  // A shared itemIds reference would make both of these leak across lists.
  const trimmed = removeFromList(after, copyId, 2);
  assert.deepEqual(trimmed.lists[copyId].itemIds, [1, 3]);
  assert.deepEqual(trimmed.lists[id].itemIds, [1, 2, 3], 'the original must keep every issue');

  const moved = moveItem(trimmed, id, 1, 2);
  assert.deepEqual(moved.lists[id].itemIds, [2, 3, 1]);
  assert.deepEqual(moved.lists[copyId].itemIds, [1, 3], 'the copy must keep its own order');
});

test('the copy sits next to its original rather than at the end', () => {
  let s = createList(createEmptyState(), { name: 'A' });
  s = createList(s, { name: 'B' });
  const [a, b] = s.listOrder;
  const { state: after, listId: copyId } = duplicateList(s, a);
  assert.deepEqual(after.listOrder, [a, copyId, b]);
});

test('duplicating repeatedly produces names you can tell apart', () => {
  const { state, id } = withList([1], 'Civil War');
  const first = duplicateList(state, id);
  const second = duplicateList(first.state, id);
  const third = duplicateList(second.state, id);
  assert.equal(first.state.lists[first.listId].name, 'Civil War (copy)');
  assert.equal(second.state.lists[second.listId].name, 'Civil War (copy 2)');
  assert.equal(third.state.lists[third.listId].name, 'Civil War (copy 3)');
});

// Appending the suffix and slicing afterwards would cut it straight back off, leaving a copy
// indistinguishable from the list it came from.
test('a maximally long name still yields a distinguishable copy', () => {
  const { state, id } = withList([1], 'x'.repeat(MAX_NAME));
  const { state: after, listId: copyId } = duplicateList(state, id);
  const copy = after.lists[copyId];
  assert.ok(copy.name.length <= MAX_NAME);
  assert.ok(copy.name.endsWith(' (copy)'));
  assert.notEqual(copy.name, after.lists[id].name);
});

test('an explicit name is honoured and capped, and a missing list is a no-op', () => {
  const { state, id } = withList([1, 2]);
  const named = duplicateList(state, id, { name: 'Essentials only' });
  assert.equal(named.state.lists[named.listId].name, 'Essentials only');

  const long = duplicateList(state, id, { name: 'z'.repeat(500) });
  assert.equal(long.state.lists[long.listId].name.length, MAX_NAME);

  const missing = duplicateList(state, 'nope');
  assert.equal(missing.listId, null);
  assert.equal(missing.state, state, 'a missing list must not produce a new state object');
});

test('duplicating carries the description and does not steal focus', () => {
  let s = createList(createEmptyState(), { name: 'A', description: 'From Comic Book Herald.' });
  const [a] = s.listOrder;
  s = setActive(s, a);
  const { state: after, listId: copyId } = duplicateList(s, a);
  assert.equal(after.lists[copyId].description, 'From Comic Book Herald.');
  assert.equal(after.active, a, 'the model must leave switching lists to the caller');
});

// createList and renameList both clamp, so an over-long description can only reach the store
// from outside the model: a restored backup, or state written before the limit existed.
// Copying it verbatim would let each duplication carry the oversized value forward instead of
// closing the hole. Shipped in 318d2ea with no test.
test('a duplicate clamps a description that arrived over-long', () => {
  const { state, id } = withList([1]);
  const long = 'd'.repeat(MAX_DESCRIPTION + 500);
  const restored = {
    ...state,
    lists: { ...state.lists, [id]: { ...state.lists[id], description: long } },
  };

  const { state: after, listId: copyId } = duplicateList(restored, id);
  assert.equal(after.lists[copyId].description.length, MAX_DESCRIPTION);
  assert.equal(after.lists[copyId].description, long.slice(0, MAX_DESCRIPTION));
  // Duplicating is not a repair operation: the original is left exactly as it was found.
  assert.equal(after.lists[id].description, long);

  // Copying a copy must not reintroduce it either.
  const second = duplicateList(after, copyId);
  assert.equal(second.state.lists[second.listId].description.length, MAX_DESCRIPTION);
});

test('a duplicate of a list with no description gets an empty one, not "undefined"', () => {
  const { state, id } = withList([1]);
  for (const missing of [undefined, null, 0]) {
    const bare = {
      ...state,
      lists: { ...state.lists, [id]: { ...state.lists[id], description: missing } },
    };
    const { state: after, listId: copyId } = duplicateList(bare, id);
    assert.equal(after.lists[copyId].description, '', `description ${missing} became a string`);
  }
});

// ------------------------------------------------------------------ read state

test('read state is global, so the same issue in two lists is consistent', () => {
  let s = createList(createEmptyState(), { name: 'A' });
  s = createList(s, { name: 'B' });
  const [a, b] = s.listOrder;
  s = addIssuesToList(s, a, [issue(1)]).state;
  s = addIssuesToList(s, b, [issue(1)]).state;

  s = markRead(s, 1, true);
  assert.ok(listItems(s, a)[0].read);
  assert.ok(listItems(s, b)[0].read, 'an issue cannot be read in one list and unread in another');
  assert.equal(listProgress(s, a).read, 1);
  assert.equal(listProgress(s, b).read, 1);
});

test('toggling and bulk marking behave symmetrically', () => {
  const { state } = withList([1, 2, 3]);
  assert.ok(isRead(toggleRead(state, 1), 1));
  assert.equal(isRead(toggleRead(toggleRead(state, 1), 1), 1), false);

  const many = markManyRead(state, [1, 2, 3], true);
  assert.equal(Object.keys(many.read).length, 3);
  assert.equal(Object.keys(markManyRead(many, [1, 2, 3], false).read).length, 0);
});

test('up next returns the first unread in list order', () => {
  const { state, id } = withList([1, 2, 3]);
  assert.equal(upNext(state, id).issueId, 1);
  assert.equal(upNext(markRead(state, 1, true), id).issueId, 2);
  assert.equal(upNext(markManyRead(state, [1, 2, 3], true), id), null);
});

test('series progress counts unique issues once across lists', () => {
  let s = createList(createEmptyState(), { name: 'A' });
  s = createList(s, { name: 'B' });
  const [a, b] = s.listOrder;
  s = addIssuesToList(s, a, [issue(1), issue(2)]).state;
  s = addIssuesToList(s, b, [issue(2), issue(3)]).state;
  s = markRead(s, 2, true);

  const rows = seriesProgress(s);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].tracked, 3, 'issue 2 must not be counted twice');
  assert.equal(rows[0].read, 1);
});

test('overrides can be set and cleared', () => {
  const { state } = withList([1]);
  assert.equal(setOverride(state, 1, 'available').overrides[1], 'available');
  assert.equal(setOverride(setOverride(state, 1, 'available'), 1, null).overrides[1], undefined);
  assert.equal(setOverride(state, 1, 'garbage').overrides[1], undefined);
});

// ------------------------------------------------------------------ hydration

test('pending issues exclude hydrated and hand-added records', () => {
  let s = createList(createEmptyState(), { name: 'L' });
  const id = s.listOrder[0];
  s = addIssuesToList(s, id, [
    { issueId: 1, title: 'imported', hydrated: false, source: 'import' },
    { issueId: 2, title: 'done', hydrated: true, source: 'api' },
    { issueId: 3, title: 'by hand', hydrated: false, source: 'manual' },
  ]).state;
  assert.deepEqual(pendingIssueIds(s), [1]);
});

test('hydration fetches what you are about to read first', () => {
  let s = createList(createEmptyState(), { name: 'L' });
  const id = s.listOrder[0];
  const staged = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    .map((i) => ({ issueId: i, title: `t${i}`, hydrated: false, source: 'import' }));
  s = addIssuesToList(s, id, staged).state;
  s = markManyRead(s, [1, 2], true);

  const order = hydrationOrder(s, id, 2);
  assert.deepEqual(order.slice(0, 3), [3, 4, 5], 'the next unread issues come first');
  assert.equal(order.length, 10, 'everything still gets fetched eventually');
});

// ------------------------------------------------------------------ persistence

test('a v1 backup migrates to global read state', () => {
  const v1 = {
    schemaVersion: 1,
    lists: [{
      name: 'Old',
      items: [
        { issueId: 1, title: 'One', read: true },
        { issueId: 2, title: 'Two', read: false },
      ],
    }],
  };
  const s = migrate(v1);
  assert.equal(s.schemaVersion, SCHEMA_VERSION);
  const id = s.listOrder[0];
  assert.deepEqual(s.lists[id].itemIds, [1, 2]);
  assert.ok(isRead(s, 1));
  assert.equal(isRead(s, 2), false);
});

test('a future schema is refused rather than silently mangled', () => {
  assert.throws(() => migrate({ schemaVersion: 99 }), /Unsupported schema/);
  const res = validateBackup({ schemaVersion: 99 });
  assert.equal(res.ok, false);
  assert.equal(res.state, null);
});

test('validateBackup rejects junk without touching anything', () => {
  for (const bad of [null, 'string', 42, [], { schemaVersion: 2, lists: [] }]) {
    assert.equal(validateBackup(bad).ok, false, `${JSON.stringify(bad)} must be refused`);
  }
});

test('a well-formed backup round-trips', () => {
  const { state, id } = withList([1, 2, 3]);
  const s = markRead(setOverride(state, 2, 'unavailable'), 1, true);
  const res = validateBackup(JSON.parse(JSON.stringify(exportBackup(s))));

  assert.ok(res.ok, res.errors.join(' '));
  assert.deepEqual(res.state.lists[id].itemIds, [1, 2, 3]);
  assert.ok(isRead(res.state, 1));
  assert.equal(res.state.overrides[2], 'unavailable');
});

test('coercion drops corrupt entries instead of failing the whole restore', () => {
  const s = migrate({
    schemaVersion: 2,
    issues: { 1: { issueId: 1, title: 'ok' }, bad: { title: 'no id' } },
    read: { 1: 123, notanumber: 5 },
    overrides: { 1: 'available', 2: 'nonsense' },
    lists: { a: { name: 'A', itemIds: [1, 'x', 2] } },
    listOrder: ['a', 'ghost'],
    active: 'ghost',
  });
  assert.ok(s.issues[1]);
  assert.equal(Object.keys(s.issues).length, 1);
  assert.ok(isRead(s, 1));
  assert.equal(s.overrides[2], undefined);
  assert.deepEqual(s.lists.a.itemIds, [1, 2]);
  assert.deepEqual(s.listOrder, ['a']);
  assert.equal(s.active, 'a', 'a dangling active pointer must be repaired');
});

test('listItems reports placeholders for ids with no metadata yet', () => {
  let s = createList(createEmptyState(), { name: 'L' });
  const id = s.listOrder[0];
  s = addIssuesToList(s, id, [{ issueId: 55, title: 'Known' }]).state;
  s = { ...s, issues: {} };
  const [item] = listItems(s, id);
  assert.equal(item.issueId, 55);
  assert.equal(item.hydrated, false);
  assert.ok(item.title);
});

// Search, series and creator results come from list endpoints, which return neither `cover`
// nor `digitalId`. Such an issue must stay pending so hydration fills those in - otherwise it
// sits in the list with no art and, worse, no way to open it in Marvel Unlimited.
test('an issue added from a list endpoint stays pending until hydrated', async () => {
  const { toIssue } = await import('../src/js/api.js');

  // Exactly the shape the live API returns from /v1/search/issues and /v1/series/{id}/issues.
  const fromList = toIssue({
    id: 52447, title: 'Secret Wars (2015) #1', issueNumber: 1,
    detailUrl: 'https://www.marvel.com/comics/issue/52447/secret_wars_2015_1',
    seriesId: 19648, seriesName: 'Secret Wars (2015)',
    onSaleDate: '2015-05-06', unlimitedDate: '2015-11-09', yearPage: 2015,
  });

  assert.equal(fromList.cover, null, 'list endpoints omit cover');
  assert.equal(fromList.digitalId, null, 'list endpoints omit digitalId');
  assert.equal(fromList.hydrated, false, 'so it must not be treated as complete');

  let s = createList(createEmptyState(), { name: 'From search' });
  const listId = s.listOrder[0];
  s = addIssuesToList(s, listId, [fromList]).state;

  assert.deepEqual(pendingIssueIds(s), [52447], 'hydration must know it still needs details');
  assert.ok(hydrationOrder(s, listId).includes(52447));

  // And once hydrated it drops out of the queue.
  s = upsertIssue(s, { ...fromList, digitalId: 38164, cover: { path: 'http://x/y', extension: 'jpg' }, hydrated: true });
  assert.deepEqual(pendingIssueIds(s), []);
});
