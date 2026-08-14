import test from 'node:test';
import assert from 'node:assert/strict';
import { Store, KEY } from '../src/js/storage.js';
import {
  createEmptyState, createList, addIssuesToList, markRead, isRead, exportBackup, migrate,
} from '../src/js/lib/model.js';

// One storage, several stores over it, which is what two tabs on this origin actually are. The
// browser fires a storage event in every tab except the one that wrote, so notify() does the same:
// it is the listener wired in main.js, called by hand because Node has no second tab to hear from.
function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    failReads: false,
    get length() { return map.size; },
    key(i) { return [...map.keys()][i] ?? null; },
    getItem(k) {
      if (this.failReads) throw new Error('unreadable');
      return map.has(k) ? map.get(k) : null;
    },
    setItem(k, v) { map.set(k, String(v)); },
    removeItem(k) { map.delete(k); },
  };
}

function seedState() {
  let s = createList(createEmptyState(), { name: 'Hickman' });
  const id = s.listOrder[0];
  s = addIssuesToList(s, id, [
    { issueId: 1, title: 'One' },
    { issueId: 2, title: 'Two' },
    { issueId: 3, title: 'Three' },
  ]).state;
  return s;
}

// Deliberately tokenless, because this is what a value written before this contract existed looks
// like, and several tests below start from exactly that.
function seedRaw() {
  return JSON.stringify(exportBackup(seedState()));
}

function openTabs(storage, count) {
  const stores = [];
  for (let i = 0; i < count; i += 1) {
    const store = new Store({ storage });
    store.load();
    stores.push(store);
  }
  const notify = (writer) => {
    const raw = storage.getItem(KEY);
    for (const s of stores) if (s !== writer) s.adoptForeignWrite(raw);
  };
  return { stores, notify };
}

function savedState(storage) {
  const raw = storage.getItem(KEY);
  return raw ? migrate(JSON.parse(raw)) : createEmptyState();
}

// --------------------------------------------------------------------- the defect, reproduced

// The loss BL-084 was filed for. Two tabs, both holding the snapshot they loaded, both editing.
// Before the compare-before-write the second write replaced the whole payload, so the first tab's
// issue was simply not read any more and nothing reported it.
test('a stale tab does not overwrite what another tab saved', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b] } = openTabs(storage, 2);

  a.update((s) => markRead(s, 1, true));
  b.update((s) => markRead(s, 2, true));

  const saved = savedState(storage);
  assert.equal(isRead(saved, 1), true, "the first tab's work must survive the second tab's write");
  assert.equal(isRead(saved, 2), false, 'the stale write must not have landed');
  assert.equal(b.lastUpdateOk, false, 'and the tab that lost must be told, not left to assume');
});

test('the refused write leaves the saved data byte for byte as the other tab wrote it', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b] } = openTabs(storage, 2);

  a.update((s) => markRead(s, 1, true));
  const afterA = storage.getItem(KEY);
  b.update((s) => markRead(s, 2, true));

  assert.equal(storage.getItem(KEY), afterA, 'a refused write must not touch the key at all');
});

// The rollback that must not roll back. `previous` is the stale snapshot the refusal was about, so
// restoring it would leave the reader looking at data just established not to be saved, and every
// later edit would be refused for the same reason with no way out but a reload.
test('a refused write leaves the tab holding what is saved, not what it had', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b] } = openTabs(storage, 2);

  a.update((s) => markRead(s, 1, true));
  b.update((s) => markRead(s, 2, true));

  assert.equal(isRead(b.state, 1), true, "the refused tab must have picked up the other tab's work");
  assert.equal(isRead(b.state, 2), false, 'and must not still be showing its own unsaved edit');
});

test('a tab told it lost can make the change again and keep it', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b] } = openTabs(storage, 2);

  a.update((s) => markRead(s, 1, true));
  b.update((s) => markRead(s, 2, true));
  b.update((s) => markRead(s, 2, true));

  const saved = savedState(storage);
  assert.equal(b.lastUpdateOk, true, 'the second attempt is against fresh data and must land');
  assert.equal(isRead(saved, 1), true);
  assert.equal(isRead(saved, 2), true, 'both tabs\u2019 work is saved once the retry goes through');
});

// ------------------------------------------------------------------------- ordinary two tabs

// What the listener buys. With adoption the refusal above never fires at all: each tab edits on top
// of what is actually stored, so alternating edits accumulate instead of competing.
test('two tabs alternating edits lose nothing and never refuse a write', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b], notify } = openTabs(storage, 2);

  a.update((s) => markRead(s, 1, true));
  notify(a);
  b.update((s) => markRead(s, 2, true));
  notify(b);
  a.update((s) => markRead(s, 3, true));
  notify(a);

  const saved = savedState(storage);
  assert.equal(isRead(saved, 1), true);
  assert.equal(isRead(saved, 2), true);
  assert.equal(isRead(saved, 3), true);
  assert.equal(a.lastUpdateOk, true);
  assert.equal(b.lastUpdateOk, true, 'no write should have been refused in the ordinary case');
});

test('a tab that adopts builds its next edit on the value it adopted', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b], notify } = openTabs(storage, 2);

  a.update((s) => markRead(s, 1, true));
  notify(a);

  assert.equal(isRead(b.state, 1), true, 'the adopting tab shows the write it was told about');
  b.update((s) => markRead(s, 2, true));
  assert.equal(b.lastUpdateOk, true, 'and its own edit is no longer stale');
  assert.equal(isRead(savedState(storage), 1), true, 'so nothing was written back over');
});

test('adopting repaints, because a tab showing stale data is the visible half of this defect', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  let repaints = 0;
  const b = new Store({ storage, onChange: () => { repaints += 1; } });
  b.load();
  const a = new Store({ storage });
  a.load();

  a.update((s) => markRead(s, 1, true));
  const before = repaints;
  b.adoptForeignWrite(storage.getItem(KEY));

  assert.equal(repaints, before + 1, 'adoption must notify, or the screen keeps the old data');
});

// ----------------------------------------------------------------------------- whole-state routes

test('an erase in another tab is adopted rather than written back over', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b] } = openTabs(storage, 2);

  a.update((s) => markRead(s, 1, true));
  a.eraseAll();
  // An erase can arrive as a removed key or a cleared origin, and both reach the listener as an
  // absent new value. This is that shape, which the stored-value shape cannot stand in for.
  storage.removeItem(KEY);
  b.adoptForeignWrite(null);

  assert.equal(b.state.listOrder.length, 0, 'the tab must hold the erase, not its own snapshot');
  b.update((s) => markRead(s, 1, true));
  assert.equal(b.lastUpdateOk, true, 'and must be able to write again afterwards');
});

test('a tab that never heard about the erase cannot write its old library back', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b] } = openTabs(storage, 2);

  a.eraseAll();
  b.update((s) => markRead(s, 1, true));

  assert.equal(b.lastUpdateOk, false, 'the stale write must be refused');
  assert.equal(savedState(storage).listOrder.length, 0, 'the erase must still be what is saved');
});

test('a restore in one tab is adopted by the other', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const { stores: [a, b], notify } = openTabs(storage, 2);

  let other = createList(createEmptyState(), { name: 'Replacement' });
  other = addIssuesToList(other, other.listOrder[0], [{ issueId: 42, title: 'Different' }]).state;
  assert.equal(a.restore(JSON.stringify(exportBackup(other))).ok, true);
  notify(a);

  assert.deepEqual(
    Object.values(b.state.lists).map((l) => l.name), ['Replacement'],
    'the other tab shows the restored library',
  );
  b.update((s) => markRead(s, 42, true));
  assert.equal(b.lastUpdateOk, true, 'and its next edit is against the restore, so it lands');
});

// A restore stamps its own token, so the tab that restored is not left comparing against what it
// read at boot and refusing its own next edit.
test('the tab that restored can still write afterwards', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const store = new Store({ storage });
  store.load();

  let other = createList(createEmptyState(), { name: 'Replacement' });
  other = addIssuesToList(other, other.listOrder[0], [{ issueId: 42, title: 'Different' }]).state;
  assert.equal(store.restore(JSON.stringify(exportBackup(other))).ok, true);
  store.update((s) => markRead(s, 42, true));

  assert.equal(store.lastUpdateOk, true);
  assert.equal(isRead(savedState(storage), 42), true);
});

// ------------------------------------------------------------------------------ the blocked tab

test('a blocked tab neither adopts a foreign write nor stops being blocked', () => {
  const storage = fakeStorage({ [KEY]: '{ this is not valid json' });
  const blocked = new Store({ storage });
  blocked.load();
  assert.equal(blocked.blocked, true, 'precondition: the unreadable value latched the store');

  const adopted = blocked.adoptForeignWrite(seedRaw());

  assert.equal(adopted, false, 'the latch is protecting a salvage copy and must not lift itself');
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.state.listOrder.length, 0, 'and its screen must not change under it');
});

test('a value another tab wrote that will not parse is declined rather than adopted', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const store = new Store({ storage });
  store.load();

  const adopted = store.adoptForeignWrite('{ not json either');

  assert.equal(adopted, false);
  assert.equal(store.blocked, false, 'this is not this tab\u2019s incident to latch on');
  assert.equal(store.state.listOrder.length, 1, 'and its own data stays on screen');
});

// ------------------------------------------------------------------------------- the edges

// The upgrade path. A value written before this contract carries no token, and a tab that read it
// expects none, so the two agree and the write goes through. Without this every existing install
// would have refused its first edit.
test('a saved value with no token is written to rather than refused', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const store = new Store({ storage });
  store.load();

  store.update((s) => markRead(s, 1, true));

  assert.equal(store.lastUpdateOk, true);
  assert.equal(isRead(savedState(storage), 1), true);
});

test('a first ever write, with nothing saved at all, is not refused', () => {
  const storage = fakeStorage();
  const store = new Store({ storage });
  store.load();

  store.update(() => markRead(seedState(), 1, true));

  assert.equal(store.lastUpdateOk, true);
  assert.equal(isRead(savedState(storage), 1), true);
});

test('every write is named differently, so no two writes are mistaken for each other', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const store = new Store({ storage });
  store.load();

  store.update((s) => markRead(s, 1, true));
  const first = JSON.parse(storage.getItem(KEY)).writeToken;
  store.update((s) => markRead(s, 2, true));
  const second = JSON.parse(storage.getItem(KEY)).writeToken;

  assert.equal(typeof first, 'string');
  assert.notEqual(first, '', 'an empty token would compare equal to a value that has none');
  assert.notEqual(first, second, 'two writes must be distinguishable');
});

// The token is written first so the check can read a bounded prefix instead of parsing the whole
// payload, which at this origin's ceiling is the difference between free and doubling every write.
test('the token is the first key of the stored value', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const store = new Store({ storage });
  store.load();

  store.update((s) => markRead(s, 1, true));

  assert.equal(Object.keys(JSON.parse(storage.getItem(KEY)))[0], 'writeToken');
  assert.match(storage.getItem(KEY).slice(0, 128), /^\{"writeToken":"[^"]+"/);
});

// The token belongs to the stored value alone. No file on disk changes shape, so BL-085's restore
// validation has nothing new to consider and no backup taken before this item reads differently.
test('a downloaded backup carries no token', () => {
  assert.equal(Object.hasOwn(exportBackup(seedState()), 'writeToken'), false);
  assert.equal(
    Object.hasOwn(migrate(JSON.parse(JSON.stringify({ writeToken: 'x', ...exportBackup(seedState()) }))), 'writeToken'),
    false,
    'and one arriving in a hand-edited file is dropped rather than carried into state',
  );
});

// A read that fails is not a licence to write. What is stored is unknown, and the only certain thing
// about the write is that it would replace it, so this refuses in the direction load() latches in.
test('a storage that will not say what it holds is not written over', () => {
  const storage = fakeStorage({ [KEY]: seedRaw() });
  const store = new Store({ storage });
  store.load();
  const before = storage.getItem(KEY);
  storage.failReads = true;

  store.update((s) => markRead(s, 1, true));

  storage.failReads = false;
  assert.equal(store.lastUpdateOk, false);
  assert.equal(storage.getItem(KEY), before, 'the saved data must be exactly as it was');
});
