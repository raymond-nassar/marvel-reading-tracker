import test from 'node:test';
import assert from 'node:assert/strict';

import { ResponseCache } from '../src/js/cache.js';

// `src/js/lib/cachePolicy.js` is already covered by `test/cache-reader.test.js`. What was not
// covered is the class that calls it, because it talks to IndexedDB and IndexedDB is not in Node.
// The whole of the header comment on `src/js/cache.js` is a claim about failure: caching is an
// optimisation and losing it must never break the app. Every branch that claim rests on was
// unexercised, which is the worst place in the module for coverage to stop.
//
// The double is written here rather than installed, matching `test/fetch-json.test.js`, which
// scripts its own responses "without a stub library". Constraint 4 would permit a dev dependency;
// none is needed, and a fake small enough to read is worth more than a faithful one nobody checks.

// Real IndexedDB hands back a request object and fires its callbacks later, which is why `idbReq`
// can attach `onsuccess` on the line after the call that produced the request. A fake that
// resolved synchronously would run the handler before it existed and hang every test, so the
// deferral is load-bearing rather than incidental fidelity.
class FakeRequest {
  constructor() {
    this.onsuccess = null;
    this.onerror = null;
    this.onupgradeneeded = null;
    this.onblocked = null;
    this.result = undefined;
    this.error = null;
  }

  succeed(result) {
    this.result = result;
    queueMicrotask(() => this.onsuccess?.());
  }

  fail(error) {
    this.error = error;
    queueMicrotask(() => this.onerror?.());
  }
}

function fakeIndexedDB({ openFails = false, openThrows = false, openBlocked = false, failOps = [] } = {}) {
  const stores = new Map();
  const log = [];
  const failing = new Set(failOps);

  function storeApi(name) {
    const data = stores.get(name);
    const run = (op, fn) => {
      log.push(op);
      const req = new FakeRequest();
      if (failing.has(op)) req.fail(new Error(`${op} failed`));
      else req.succeed(fn());
      return req;
    };
    // Real IndexedDB structured-clones on the way in and on the way out, so a caller never holds a
    // reference into the store and mutating what `get` handed back changes nothing on disk. Sharing
    // the reference instead is not a harmless simplification: `get` in src/js/cache.js sets
    // `lastAccess` on the entry it just read and then persists it with a `put` it deliberately does
    // not await, and against a shared reference the assignment alone appears to have persisted. The
    // test asserting a read refreshes the access time passed with that `put` deleted, so the LRU
    // ordering eviction depends on was pinned by nothing. Cloning is what makes it fail.
    const clone = (v) => (v === undefined ? undefined : structuredClone(v));
    return {
      get: (key) => run('get', () => clone(data.get(key))),
      put: (entry) => run('put', () => data.set(entry.key, clone(entry))),
      getAll: () => run('getAll', () => [...data.values()].map(clone)),
      delete: (key) => run('delete', () => data.delete(key)),
      clear: () => run('clear', () => data.clear()),
    };
  }

  const db = {
    objectStoreNames: { contains: (n) => stores.has(n) },
    createObjectStore(name) {
      stores.set(name, new Map());
      return { createIndex: () => {} };
    },
    transaction(name) {
      if (!stores.has(name)) throw new Error(`no store ${name}`);
      const tx = { error: new Error('aborted'), onabort: null };
      tx.objectStore = () => storeApi(name);
      return tx;
    },
  };

  const idb = {
    open() {
      if (openThrows) throw new Error('blocked by policy');
      log.push('open');
      const req = new FakeRequest();
      req.result = db;
      queueMicrotask(() => {
        if (openFails) return req.onerror?.();
        if (openBlocked) return req.onblocked?.();
        req.onupgradeneeded?.();
        req.onsuccess?.();
      });
      return req;
    },
  };

  return { idb, stores, log };
}

// Sets the global for one test and takes it away again, so a test that forgets cannot leave a
// fake in place for the next one and make a later failure look like a pass.
async function withIdb(opts, fn) {
  const fake = fakeIndexedDB(opts);
  globalThis.indexedDB = fake.idb;
  try {
    return await fn(fake);
  } finally {
    delete globalThis.indexedDB;
  }
}

function newCache(over = {}) {
  return new ResponseCache({ baseUrl: 'https://example.test/v1', schemaVersion: 2, ...over });
}

test('the store is created on first open and reused rather than created again', async () => {
  await withIdb({}, async ({ stores, log }) => {
    const cache = newCache();
    await cache.open();
    assert.equal(stores.has('responses'), true);
    await cache.open();
    assert.equal(log.filter((op) => op === 'open').length, 1, 'the database was opened twice');
  });
});

// The four ways opening can fail are four separate branches and each one resolves null rather
// than rejecting. A rejection here would propagate out of every get and set in the app.
test('a database that refuses to open degrades to no cache rather than an error', async () => {
  for (const opts of [{ openFails: true }, { openThrows: true }, { openBlocked: true }]) {
    await withIdb(opts, async () => {
      const cache = newCache();
      assert.equal(await cache.open(), null, `open() resolved a database for ${JSON.stringify(opts)}`);
      assert.equal(await cache.get('/issues/1'), null);
      assert.equal(await cache.set('/issues/1', { id: 1 }), undefined);
      assert.deepEqual(await cache.entries(), []);
      assert.deepEqual(await cache.usage(), { count: 0, bytes: 0, budget: cache.budget });
      // true rather than undefined: a store that would not open holds nothing, so a caller asking
      // "is it empty now" has its answer. Reporting failure here would make the one-time synopsis
      // purge retry on every boot in a browser where it can never succeed.
      assert.equal(await cache.clear(), true);
    });
  }
});

// `available` is read in the constructor, so a page with no IndexedDB at all never reaches the
// open path. Worth pinning separately: it is the branch a private window takes.
test('no IndexedDB at all is not an error either', async () => {
  assert.equal(typeof globalThis.indexedDB, 'undefined');
  const cache = newCache();
  assert.equal(cache.available, false);
  assert.equal(await cache.open(), null);
  assert.equal(await cache.get('/issues/1'), null);
  assert.deepEqual(await cache.usage(), { count: 0, bytes: 0, budget: cache.budget });
});

test('a value survives a round trip and a miss reads as a miss', async () => {
  await withIdb({}, async () => {
    const cache = newCache();
    assert.equal(await cache.get('/issues/7'), null);
    await cache.set('/issues/7', { id: 7, title: 'Seven' });
    assert.deepEqual(await cache.get('/issues/7'), { id: 7, title: 'Seven' });
  });
});

// Two caches differing only in schema version must not read each other's entries. This is what
// stops a build that changed the stored shape from being handed the old shape.
test('entries are scoped by base URL and schema version', async () => {
  await withIdb({}, async () => {
    await newCache().set('/issues/7', 'v2 value');
    assert.equal(await newCache({ schemaVersion: 3 }).get('/issues/7'), null);
    assert.equal(await newCache({ baseUrl: 'https://other.test/v1' }).get('/issues/7'), null);
    assert.equal(await newCache().get('/issues/7'), 'v2 value');
  });
});

test('an expired entry reads as a miss', async () => {
  await withIdb({}, async ({ stores }) => {
    const cache = newCache();
    await cache.set('/search?q=x', ['stale']);
    const store = stores.get('responses');
    const [entry] = [...store.values()];
    entry.storedAt = Date.now() - (entry.ttl + 1000);
    assert.equal(await cache.get('/search?q=x'), null);
  });
});

// Reading touches lastAccess so that eviction can order by it, and that write is deliberately not
// awaited. The point of the test is that the read still resolves the value: a caller must never
// wait on, or fail because of, bookkeeping.
test('reading refreshes the access time without the caller waiting on it', async () => {
  await withIdb({}, async ({ stores }) => {
    const cache = newCache();
    await cache.set('/issues/7', { id: 7 });
    const store = stores.get('responses');
    const key = [...store.keys()][0];
    store.get(key).lastAccess = 1000;

    assert.deepEqual(await cache.get('/issues/7'), { id: 7 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    assert.ok(store.get(key).lastAccess > 1000, 'lastAccess was not refreshed');
  });
});

test('a read whose bookkeeping write fails still returns the value', async () => {
  await withIdb({}, async ({ stores }) => {
    const cache = newCache();
    await cache.set('/issues/7', { id: 7 });
    // Swap the store for one whose put rejects, after the entry is already in place.
    const saved = new Map(stores.get('responses'));
    await withIdb({ failOps: ['put'] }, async ({ stores: s2 }) => {
      s2.set('responses', saved);
      const c2 = newCache();
      await c2.open();
      assert.deepEqual(await c2.get('/issues/7'), { id: 7 });
    });
  });
});

test('a write that fails is swallowed rather than thrown at the caller', async () => {
  await withIdb({ failOps: ['put'] }, async () => {
    const cache = newCache();
    await assert.doesNotReject(() => cache.set('/issues/7', { id: 7 }));
    assert.equal(await cache.get('/issues/7'), null);
  });
});

// entries() is what the settings screen and usage() both read. It must not carry the cached
// bodies with it, or reporting how much room the cache uses would load the whole cache to do it.
test('entries reports the bookkeeping and not the cached bodies', async () => {
  await withIdb({}, async () => {
    const cache = newCache();
    await cache.set('/issues/7', { id: 7, huge: 'x'.repeat(500) });
    const [entry] = await cache.entries();
    assert.deepEqual(
      Object.keys(entry).sort(),
      ['bytes', 'key', 'lastAccess', 'storedAt', 'ttl'],
    );
    assert.equal('value' in entry, false, 'entries() leaked the cached body');
    assert.ok(entry.bytes > 500);
  });
});

test('usage totals what is stored and reports the budget it is measured against', async () => {
  await withIdb({}, async () => {
    const cache = newCache({ budget: 4096 });
    await cache.set('/issues/7', { id: 7 });
    await cache.set('/issues/8', { id: 8 });
    const usage = await cache.usage();
    assert.equal(usage.count, 2);
    assert.equal(usage.budget, 4096);
    const entries = await cache.entries();
    assert.equal(usage.bytes, entries.reduce((n, e) => n + e.bytes, 0));
  });
});

// The order matters and is not obvious from reading `set`: room is made for the incoming entry
// before it is written, so a write can never push the cache over its budget even briefly.
test('room is made before the new entry is written, not after', async () => {
  await withIdb({}, async ({ log }) => {
    const cache = newCache({ budget: 300 });
    await cache.set('/issues/1', { blob: 'a'.repeat(200) });
    log.length = 0;
    await cache.set('/issues/2', { blob: 'b'.repeat(200) });

    const firstPut = log.indexOf('put');
    const firstDelete = log.indexOf('delete');
    assert.notEqual(firstDelete, -1, 'nothing was evicted to make room');
    assert.ok(firstDelete < firstPut, `evicted after writing: ${log.join(',')}`);

    assert.equal(await cache.get('/issues/1'), null, 'the older entry was not evicted');
    assert.deepEqual(await cache.get('/issues/2'), { blob: 'b'.repeat(200) });
  });
});

test('a failed eviction does not stop the write it was making room for', async () => {
  await withIdb({ failOps: ['delete'] }, async () => {
    const cache = newCache({ budget: 300 });
    await cache.set('/issues/1', { blob: 'a'.repeat(200) });
    await assert.doesNotReject(() => cache.set('/issues/2', { blob: 'b'.repeat(200) }));
    assert.deepEqual(await cache.get('/issues/2'), { blob: 'b'.repeat(200) });
  });
});

test('clearing empties the cache and leaves it usable', async () => {
  await withIdb({}, async () => {
    const cache = newCache();
    await cache.set('/issues/7', { id: 7 });
    assert.equal(await cache.clear(), true, 'a clear that worked has to say so');
    assert.deepEqual(await cache.entries(), []);
    assert.equal(await cache.get('/issues/7'), null);
    await cache.set('/issues/8', { id: 8 });
    assert.deepEqual(await cache.get('/issues/8'), { id: 8 });
  });
});

// Still swallowed, because a failed clear must not propagate out of a settings button or out of
// boot. What changed is that it is now reported instead of discarded: the one-time synopsis purge
// writes a marker saying the store has been emptied, and a clear that failed silently would let
// that marker be written over prose still sitting there, with no second attempt ever made.
test('a clear that fails is reported to the caller rather than thrown or discarded', async () => {
  await withIdb({ failOps: ['clear'] }, async () => {
    const cache = newCache();
    await cache.set('/issues/7', { id: 7 });
    let outcome;
    await assert.doesNotReject(async () => { outcome = await cache.clear(); });
    assert.equal(outcome, false);
    assert.equal((await cache.entries()).length, 1, 'and the entry it could not remove is still there');
  });
});
