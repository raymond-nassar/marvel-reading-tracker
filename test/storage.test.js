import test from 'node:test';
import assert from 'node:assert/strict';
import { Store, KEY } from '../src/js/storage.js';
import { createEmptyState, createList, addIssuesToList, markRead, isRead, exportBackup } from '../src/js/lib/model.js';

// Minimal localStorage stand-in. `failWrites` simulates a full quota; `failKey` fails only
// writes to one key, which is the realistic near-quota shape: copying the whole state aside
// doubles the footprint and throws, while overwriting it with a small empty state succeeds.
function fakeStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    map,
    failWrites: false,
    failKey: null,
    getItem(k) { return map.has(k) ? map.get(k) : null; },
    setItem(k, v) {
      if (this.failWrites || (this.failKey && k.startsWith(this.failKey))) {
        const e = new Error('quota');
        e.name = 'QuotaExceededError';
        throw e;
      }
      map.set(k, String(v));
    },
    removeItem(k) { map.delete(k); },
  };
}

function goodBackup() {
  let s = createList(createEmptyState(), { name: 'Hickman' });
  const id = s.listOrder[0];
  s = addIssuesToList(s, id, [{ issueId: 1, title: 'One' }, { issueId: 2, title: 'Two' }]).state;
  s = markRead(s, 1, true);
  return JSON.stringify(exportBackup(s));
}

// ---------------------------------------------------------------- the data-loss regression

// This is the defect that mattered most: a failed load fell back to empty state, and the very
// next user action persisted that empty state over the intact original. Reading must never be
// able to destroy.
test('unreadable saved data is never overwritten by subsequent edits', () => {
  const original = goodBackup();
  const storage = fakeStorage({ [KEY]: '{ this is not valid json' });
  const store = new Store({ storage });

  store.load();
  assert.equal(store.blocked, true, 'the store must latch read-only');
  assert.match(store.lastError, /NOT been changed/i);

  // Simulate the user carrying on regardless.
  store.update((s) => createList(s, { name: 'New list' }));
  store.update((s) => markRead(s, 99, true));

  assert.equal(storage.getItem(KEY), '{ this is not valid json',
    'the unreadable original must still be on disk, untouched');
  assert.ok(storage.getItem('mrt.state.salvage'), 'a salvage copy must exist');
  assert.equal(store.salvagedRaw(), '{ this is not valid json');

  // And the same must hold for the realistic trigger: a schema from a newer build.
  const newer = fakeStorage({ [KEY]: JSON.stringify({ schemaVersion: 99, lists: {} }) });
  const s2 = new Store({ storage: newer });
  s2.load();
  assert.equal(s2.blocked, true);
  s2.update((s) => createList(s, { name: 'x' }));
  assert.equal(JSON.parse(newer.getItem(KEY)).schemaVersion, 99, 'newer-schema data must survive');

  void original;
});

test('start fresh is the only way out, and it is deliberate', () => {
  const storage = fakeStorage({ [KEY]: 'corrupt' });
  const store = new Store({ storage });
  store.load();
  assert.equal(store.blocked, true);

  assert.equal(store.startFresh(), true);
  assert.equal(store.blocked, false);
  assert.equal(store.lastError, null);
  assert.equal(storage.getItem('mrt.state.salvage'), 'corrupt', 'the original is still recoverable');

  // Saving works again.
  store.update((s) => createList(s, { name: 'Fresh' }));
  assert.equal(JSON.parse(storage.getItem(KEY)).listOrder.length, 1);
});

test('a second failed load does not clobber the first salvage copy', () => {
  const storage = fakeStorage({ [KEY]: 'original-corrupt' });
  const store = new Store({ storage });
  store.load();
  storage.setItem(KEY, 'later-and-worse');
  store.load();
  assert.equal(storage.getItem('mrt.state.salvage'), 'original-corrupt');
});

// ---------------------------------------------------------------- recovery-path regressions

// The escape hatch must not be able to destroy the thing it exists to protect. Copying the
// state doubles this origin's footprint, so a state near the quota is exactly the case where
// the salvage write throws — and that is precisely when the banner is telling the user to
// press "Start fresh".
test('start fresh refuses when no copy of the unreadable data survives', () => {
  const storage = fakeStorage({ [KEY]: 'corrupt-and-precious' });
  const store = new Store({ storage });
  store.load();
  assert.equal(store.blocked, true);

  storage.map.delete('mrt.state.salvage'); // the boot-time salvage did not land
  storage.failWrites = true;

  assert.equal(store.startFresh(), false, 'must refuse without a verified copy');
  assert.equal(store.blocked, true, 'and must stay latched');
  assert.equal(storage.getItem(KEY), 'corrupt-and-precious', 'the original must survive');
  assert.match(store.lastError, /Download a copy/i);
});

// ...but refusing must not be a dead end. Once the user has saved the file themselves, the
// hatch has to open even though storage is still too full to hold a second copy.
test('start fresh proceeds once the user has downloaded a copy themselves', () => {
  const storage = fakeStorage({ [KEY]: 'corrupt' });
  storage.failKey = 'mrt.state.salvage';
  const store = new Store({ storage });
  store.load();

  assert.equal(store.blocked, true);
  assert.equal(storage.getItem('mrt.state.salvage'), null, 'the copy could not be made');
  assert.equal(store.salvagedRaw(), 'corrupt', 'so the download falls back to the live value');
  assert.equal(store.startFresh(), false, 'and the blind hatch stays shut');

  assert.equal(store.startFresh({ confirmedDownloaded: true }), true);
  assert.equal(store.blocked, false);
  assert.deepEqual(JSON.parse(storage.getItem(KEY)).listOrder, []);
});

// A stale salvage from an old incident must not be presented as the current data, and must not
// stop the current incident from being saved.
test('a second, unrelated incident is salvaged and offered accurately', () => {
  const storage = fakeStorage({ [KEY]: 'incident-one' });
  const first = new Store({ storage });
  first.load();
  assert.equal(storage.getItem('mrt.state.salvage'), 'incident-one');

  // Months later: the user has resolved incident one and accumulated real progress, which then
  // becomes unreadable in its own right.
  storage.setItem(KEY, 'months-of-real-progress-now-unreadable');
  const second = new Store({ storage });
  second.load();

  assert.equal(second.blocked, true);
  assert.equal(second.salvagedRaw(), 'months-of-real-progress-now-unreadable',
    'the user must be offered THIS incident, not the old blob');
  assert.equal(storage.getItem('mrt.state.salvage'), 'incident-one',
    'and the earlier copy must not be clobbered');

  const archived = [...storage.map.entries()]
    .filter(([k]) => k.startsWith('mrt.state.salvage.'))
    .map(([, v]) => v);
  assert.deepEqual(archived, ['months-of-real-progress-now-unreadable']);

  assert.equal(second.startFresh(), true);
  assert.ok([...storage.map.values()].includes('months-of-real-progress-now-unreadable'),
    'a copy must still exist after starting fresh');
});

test('update reports whether the change was actually saved', () => {
  const storage = fakeStorage({ [KEY]: goodBackup() });
  const store = new Store({ storage });
  store.load();

  store.update((s) => createList(s, { name: 'Saved' }));
  assert.equal(store.lastUpdateOk, true);

  storage.failWrites = true;
  const before = store.state;
  store.update((s) => createList(s, { name: 'Not saved' }));
  assert.equal(store.lastUpdateOk, false, 'callers must be able to suppress the success message');
  assert.equal(store.state, before, 'and the change must be rolled back');
});

test('a clean load leaves the store writable', () => {
  const storage = fakeStorage({ [KEY]: goodBackup() });
  const store = new Store({ storage });
  store.load();
  assert.equal(store.blocked, false);
  assert.equal(store.lastError, null);
  assert.ok(isRead(store.state, 1), 'existing progress must survive a normal load');
});

test('an empty storage is a first run, not a failure', () => {
  const store = new Store({ storage: fakeStorage() });
  store.load();
  assert.equal(store.blocked, false);
  assert.equal(store.lastError, null);
});

// ---------------------------------------------------------------- failed writes are reported

test('a failed write is rolled back and reported, not silently swallowed', () => {
  const storage = fakeStorage({ [KEY]: goodBackup() });
  const seen = [];
  const store = new Store({ storage, onChange: (_s, err) => seen.push(err) });
  store.load();

  storage.failWrites = true;
  const before = store.state;
  const after = store.update((s) => markRead(s, 2, true));

  assert.equal(after, before, 'in-memory state must roll back');
  assert.equal(isRead(store.state, 2), false, 'the UI must not show progress that was not saved');
  assert.match(seen.at(-1), /storage is full/i, 'the reason must reach the caller');
});

test('the change handler receives null when a write succeeds', () => {
  const seen = [];
  const store = new Store({ storage: fakeStorage(), onChange: (_s, err) => seen.push(err) });
  store.load();
  store.update((s) => createList(s, { name: 'A' }));
  assert.equal(seen.at(-1), null);
});

// ---------------------------------------------------------------- restore

test('a malformed backup changes nothing', () => {
  const storage = fakeStorage({ [KEY]: goodBackup() });
  const store = new Store({ storage });
  store.load();
  const before = storage.getItem(KEY);

  assert.equal(store.restore('not json').ok, false);
  assert.equal(store.restore(JSON.stringify({ schemaVersion: 99 })).ok, false);
  assert.equal(storage.getItem(KEY), before, 'disk must be untouched by a rejected restore');
  assert.ok(isRead(store.state, 1), 'in-memory state must be untouched too');
});

test('a restore can be undone once, and the snapshot survives a reload', () => {
  const storage = fakeStorage({ [KEY]: goodBackup() });
  const store = new Store({ storage });
  store.load();

  let other = createList(createEmptyState(), { name: 'Replacement' });
  other = addIssuesToList(other, other.listOrder[0], [{ issueId: 42, title: 'Different' }]).state;

  assert.equal(store.restore(JSON.stringify(exportBackup(other))).ok, true);
  assert.equal(isRead(store.state, 1), false, 'the restore took effect');
  assert.equal(store.hasPreRestoreSnapshot(), true);

  // A fresh Store, as after a page reload, must still see the snapshot.
  const reloaded = new Store({ storage });
  reloaded.load();
  assert.equal(reloaded.hasPreRestoreSnapshot(), true,
    'the undo affordance must be recoverable after a reload');

  assert.equal(reloaded.undoRestore().ok, true);
  assert.ok(isRead(reloaded.state, 1), 'the original progress is back');
});

test('a successful restore clears a blocked store', () => {
  const storage = fakeStorage({ [KEY]: 'corrupt' });
  const store = new Store({ storage });
  store.load();
  assert.equal(store.blocked, true);

  assert.equal(store.restore(goodBackup()).ok, true);
  assert.equal(store.blocked, false);
  store.update((s) => createList(s, { name: 'works again' }));
  assert.equal(JSON.parse(storage.getItem(KEY)).listOrder.length, 2);
});
