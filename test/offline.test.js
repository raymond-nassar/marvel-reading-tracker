import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { COVER_IMAGE_HOST } from '../src/js/lib/coverHost.js';
import { registerOffline, SKIPPED, WORKER_URL } from '../src/js/lib/offline.js';

// The offline worker decides, for every request the page makes, whether to answer it and what
// from. None of that is reachable from a unit test in the ordinary way: a service worker has no
// exports and runs in a global that Node does not have. So the file is written to reach
// everything through `self`, and these tests hand it a whole world and then pull its levers.
//
// What is being defended, in order of how much it would cost to get wrong:
//
//   1. Nothing from another origin is ever stored. Cover images come from Marvel's CDN and issue
//      metadata from the third-party service, and Repository Constraint 1 forbids this project
//      from keeping comic image bytes. A worker is the one place in this codebase that could
//      breach that by accident, because caching everything is the obvious way to write one.
//   2. A failed cache write never becomes a failed page. The store exists to protect the reader
//      from losing the app, and the shape to fear is the protection itself taking it away.
//   3. The network is asked first, every time. Nobody running the server can be served a stale
//      page by this file.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WORKER_FILE = join(ROOT, 'src', 'sw.js');
const ORIGIN = 'http://127.0.0.1:8787';

function makeResponse(status = 200, body = 'ok') {
  return { status, body, clone() { return makeResponse(status, body); } };
}

// Enough of the Cache API to answer what the worker asks of it. Names map to a store of
// url -> response, which is what makes both the eviction test and the match test readable.
function makeCaches(initial = {}) {
  const named = new Map(Object.entries(initial).map(([k, v]) => [k, new Map(Object.entries(v))]));
  const calls = { put: [], deleted: [], opened: [] };
  return {
    calls,
    named,
    putFails: false,
    async keys() { return [...named.keys()]; },
    async delete(name) { calls.deleted.push(name); return named.delete(name); },
    async open(name) {
      calls.opened.push(name);
      if (!named.has(name)) named.set(name, new Map());
      const store = named.get(name);
      const outer = this;
      return {
        put: async (request, response) => {
          if (outer.putFails) throw new Error('quota exceeded');
          calls.put.push(request.url);
          store.set(request.url, response);
        },
      };
    },
    async match(request) {
      for (const store of named.values()) {
        if (store.has(request.url)) return store.get(request.url);
      }
      return undefined;
    },
  };
}

function makeWorld({ fetch: fetchImpl, caches } = {}) {
  const listeners = new Map();
  const world = {
    location: { origin: ORIGIN },
    addEventListener: (type, fn) => listeners.set(type, fn),
    skipWaiting: () => { world.skipWaited = true; },
    clients: { claim: async () => { world.claimed = true; } },
    caches: caches ?? makeCaches(),
    fetch: fetchImpl ?? (async () => makeResponse()),
    skipWaited: false,
    claimed: false,
    listeners,
  };
  return world;
}

// A fresh evaluation per test. Module records are cached by URL, so the query is what stops the
// second test in this file from re-using the first test's world.
//
// `self` stays installed after the load rather than being restored around it, because the worker
// reads it when a handler runs and not when the file is evaluated. Restoring it immediately gave
// eight tests a TypeError about reading `location` of undefined, which is the honest answer to a
// worker asked to run with no world at all. Every firing below re-installs its own, so the tests
// do not depend on the order they run in.
let loads = 0;
async function loadWorker(world) {
  globalThis.self = world;
  await import(`${pathToFileURL(WORKER_FILE).href}?load=${loads++}`);
  return world;
}

function fireFetch(world, url, init = {}) {
  globalThis.self = world;
  const request = { url, method: init.method ?? 'GET' };
  let answered = null;
  world.listeners.get('fetch')({ request, respondWith: (p) => { answered = p; } });
  return answered;
}

async function fireActivate(world) {
  globalThis.self = world;
  const waits = [];
  world.listeners.get('activate')({ waitUntil: (p) => waits.push(p) });
  await Promise.all(waits);
}

function fireInstall(world) {
  globalThis.self = world;
  let waited = false;
  world.listeners.get('install')({ waitUntil: () => { waited = true; } });
  return waited;
}

test('a request to another origin is left entirely alone, so no cover byte can be stored', async () => {
  const world = await loadWorker(makeWorld());
  const cover = fireFetch(world, `https://${COVER_IMAGE_HOST}/u/prod/marvel/i/mg/6/60/abc.jpg`);
  assert.equal(cover, null, 'the worker answered for a cover image');

  const api = fireFetch(world, 'https://marvel.example.com/issues/6482');
  assert.equal(api, null, 'the worker answered for the metadata service');

  assert.deepEqual(world.caches.calls.put, [], 'something was stored');
});

test('a request that is not a GET is left alone', async () => {
  const world = await loadWorker(makeWorld());
  assert.equal(fireFetch(world, `${ORIGIN}/`, { method: 'POST' }), null);
});

test('a same-origin request is answered from the network and the answer is kept', async () => {
  const fresh = makeResponse(200, 'fresh');
  const world = await loadWorker(makeWorld({ fetch: async () => fresh }));

  const got = await fireFetch(world, `${ORIGIN}/data/catalog.json`);
  assert.equal(got, fresh, 'the reply did not come from the network');
  assert.deepEqual(world.caches.calls.put, [`${ORIGIN}/data/catalog.json`]);
});

// The claim the whole strategy rests on, and the one that would fail silently. A cache-first
// worker is the shape people reach for, and it works perfectly until somebody edits a file: the
// server is running, it answers correctly, and the reader is shown yesterday's copy anyway with
// nothing on screen to say so. Written after a deliberately cache-first version of the worker
// passed every other test in this file.
test('a page that is in the cache is still fetched afresh while the server is answering', async () => {
  const stale = makeResponse(200, 'yesterday');
  const fresh = makeResponse(200, 'today');
  const caches = makeCaches({ 'mrt-offline-v1': { [`${ORIGIN}/`]: stale } });
  let fetched = 0;
  const world = await loadWorker(makeWorld({
    caches,
    fetch: async () => { fetched += 1; return fresh; },
  }));

  const got = await fireFetch(world, `${ORIGIN}/`);
  assert.equal(fetched, 1, 'the network was never asked');
  assert.equal(got.body, 'today', 'the cached copy was served while the server was running');
  assert.equal(caches.named.get('mrt-offline-v1').get(`${ORIGIN}/`).body, 'today', 'the stored copy was left stale');
});

test('a reply that is not a 200 is returned but not kept', async () => {
  for (const status of [206, 204, 404, 500]) {
    const world = await loadWorker(makeWorld({ fetch: async () => makeResponse(status, 'partial') }));
    const got = await fireFetch(world, `${ORIGIN}/data/catalog.json`);
    assert.equal(got.status, status);
    assert.deepEqual(world.caches.calls.put, [], `a ${status} was stored`);
  }
});

test('with the server stopped, the page comes back from the cache', async () => {
  const saved = makeResponse(200, 'yesterday');
  const caches = makeCaches({ 'mrt-offline-v1': { [`${ORIGIN}/`]: saved } });
  const world = await loadWorker(makeWorld({
    caches,
    fetch: async () => { throw new TypeError('Failed to fetch'); },
  }));

  const got = await fireFetch(world, `${ORIGIN}/`);
  assert.equal(got, saved, 'the cached page was not served');
});

test('with the server stopped and nothing cached, the browser gets its own failure back', async () => {
  const world = await loadWorker(makeWorld({
    fetch: async () => { throw new TypeError('Failed to fetch'); },
  }));

  await assert.rejects(fireFetch(world, `${ORIGIN}/never-visited.json`), /Failed to fetch/);
});

// The one this file is most for. The store exists so a reader cannot lose the app; a store whose
// failure loses them the app is worse than no store at all.
test('a cache that refuses the write still hands back the page that was fetched', async () => {
  const caches = makeCaches();
  caches.putFails = true;
  const fresh = makeResponse(200, 'fresh');
  const world = await loadWorker(makeWorld({ caches, fetch: async () => fresh }));

  const got = await fireFetch(world, `${ORIGIN}/`);
  assert.equal(got, fresh, 'a full disk took the page away');
});

test('activation clears this worker\'s old caches and nothing else on the origin', async () => {
  const caches = makeCaches({
    'mrt-offline-v0': { [`${ORIGIN}/old`]: makeResponse() },
    'mrt-offline-v1': { [`${ORIGIN}/`]: makeResponse() },
    'something-else': { [`${ORIGIN}/other`]: makeResponse() },
  });
  const world = await loadWorker(makeWorld({ caches }));
  await fireActivate(world);

  assert.deepEqual(caches.calls.deleted, ['mrt-offline-v0']);
  assert.ok(caches.named.has('something-else'), 'a cache belonging to something else was deleted');
  assert.ok(world.claimed, 'the worker did not take over the open page');
});

test('installation does not wait for a list of files it would have to keep complete', async () => {
  const world = await loadWorker(makeWorld());
  assert.equal(fireInstall(world), false, 'install fetches something, which is a list that can fall behind');
  assert.ok(world.skipWaited);
});

// ------------------------------------------------------------------ registration

test('the worker is asked for relative to the page, so it takes the whole app as its scope', () => {
  assert.equal(WORKER_URL, './sw.js');
  const html = readFileSync(join(ROOT, 'src', 'index.html'), 'utf8');
  assert.match(html, /<script type="module" src="\.\/js\/app\.js"><\/script>/);
});

test('a browser with no service worker support boots the app anyway', async () => {
  const result = await registerOffline({ navigator: {} });
  assert.deepEqual(result, { ok: false, reason: SKIPPED.unsupported });
});

test('an origin the browser does not trust is named rather than attempted', async () => {
  let asked = false;
  const scope = {
    isSecureContext: false,
    navigator: { serviceWorker: { register: async () => { asked = true; } } },
  };
  const result = await registerOffline(scope);
  assert.deepEqual(result, { ok: false, reason: SKIPPED.insecure });
  assert.equal(asked, false, 'registration was attempted on an origin that would refuse it');
});

test('a registration that fails is reported, not thrown, so the app still runs', async () => {
  const scope = {
    isSecureContext: true,
    navigator: { serviceWorker: { register: async () => { throw new Error('bad MIME type'); } } },
  };
  const result = await registerOffline(scope);
  assert.equal(result.ok, false);
  assert.match(result.reason, /bad MIME type/);
});

test('a registration that succeeds asks for the worker at the address the page can reach', async () => {
  const asked = [];
  const scope = {
    isSecureContext: true,
    navigator: { serviceWorker: { register: async (url) => { asked.push(url); return {}; } } },
  };
  const result = await registerOffline(scope);
  assert.deepEqual(result, { ok: true, reason: null });
  assert.deepEqual(asked, ['./sw.js']);
});

test('the server hands the worker back as JavaScript, which is what registration requires', async () => {
  const { createStaticServer, HOST } = await import('../server.mjs');
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(0, HOST, resolve));
  try {
    const port = server.address().port;
    const res = await fetch(`http://${HOST}:${port}/sw.js`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/javascript/);
    const body = await res.text();
    assert.equal(body, readFileSync(WORKER_FILE, 'utf8'));
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
