import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { VIEWS, formatRoute, parseRoute } from '../src/js/lib/route.js';
import { LIBRARY_VIEWS } from '../src/js/lib/library.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// assert.match prints the whole subject on failure, and main.js is 120 KB, which buries the run.
// These say what was looked for instead.
const has = (text, re, what) => assert.ok(re.test(text), `expected to find ${what}`);
const lacks = (text, re, what) => assert.ok(!re.test(text), `expected not to find ${what}`);

test('every view the rail can reach survives a round trip', () => {
  for (const view of VIEWS) {
    const parsed = parseRoute(formatRoute({ view }));
    assert.deepEqual(parsed, { view, listId: null }, `round trip failed for ${view}`);
  }
});

test('the library views are routable, not just the seven typed ones', () => {
  for (const { value } of LIBRARY_VIEWS) {
    assert.ok(VIEWS.includes(value), `${value} is showable but not routable`);
    assert.deepEqual(parseRoute(formatRoute({ view: value })), { view: value, listId: null });
  }
});

test('a list id rides along and comes back intact', () => {
  const hash = formatRoute({ view: 'read', listId: 'list-mabc123-x7y2z9' });
  assert.equal(hash, '#/read/list-mabc123-x7y2z9');
  assert.deepEqual(parseRoute(hash), { view: 'read', listId: 'list-mabc123-x7y2z9' });
});

// createList accepts a caller-supplied id, so an id containing a slash or a space is reachable
// without a bug anywhere. Encoding it is what keeps it from being read back as a third segment.
test('a list id needing escapes survives a round trip', () => {
  for (const id of ['a/b', 'a b', 'a%b', 'a#b', 'ünïcødé', 'a?b']) {
    const parsed = parseRoute(formatRoute({ view: 'read', listId: id }));
    assert.deepEqual(parsed, { view: 'read', listId: id }, `round trip failed for ${id}`);
  }
});

test('the skip link target is not a route', () => {
  assert.equal(parseRoute('#main'), null);
});

// #main alone does not prove the prefix guard: strip the guard and "#main" still parses to nothing,
// because "ain" is not a view. What the guard really stops is a foreign anchor whose third
// character onwards happens to spell a view, which without it would be adopted as that view.
test('a foreign anchor is refused even when it spells a view name past the prefix', () => {
  for (const hash of ['#zread', '#ahome', '#-about', '#!/read']) {
    assert.equal(parseRoute(hash), null, `expected null for ${hash}`);
  }
});

// The claim above is only worth anything while index.html really ships that link, so this reads it
// rather than trusting the test's own memory of it.
test('index.html still ships the #main skip link the parser is guarding against', () => {
  const html = read('src/index.html');
  has(html, /class="skip-link" href="#main"/, 'the skip link');
  has(html, /<main id="main"/, 'the skip link target');
});

test('anything that is not one of our routes is refused', () => {
  for (const hash of ['', '#', '#/', '#main', '#read', '#!/read', '/read', 'read', '#//read']) {
    assert.equal(parseRoute(hash), null, `expected null for ${JSON.stringify(hash)}`);
  }
});

test('a hash that is not a string is refused rather than thrown at', () => {
  for (const hash of [null, undefined, 42, {}, []]) {
    assert.equal(parseRoute(hash), null);
  }
});

test('an unknown view is refused, so a renamed view degrades to the fallback', () => {
  assert.equal(parseRoute('#/settings'), null);
  assert.equal(parseRoute('#/read2'), null);
  assert.equal(parseRoute('#/READ'), null);
});

test('a third segment is refused rather than quietly ignored', () => {
  assert.equal(parseRoute('#/read/list-a/extra'), null);
});

test('a malformed percent escape is refused rather than throwing', () => {
  assert.equal(parseRoute('#/read/%E0%A4%A'), null);
  assert.equal(parseRoute('#/%'), null);
});

test('a trailing slash reads as no list rather than an empty one', () => {
  assert.deepEqual(parseRoute('#/read/'), { view: 'read', listId: null });
});

test('formatting an unknown view yields nothing to write', () => {
  assert.equal(formatRoute({ view: 'nope' }), '');
  assert.equal(formatRoute({}), '');
  assert.equal(formatRoute(), '');
});

// main.js cannot be imported here, because it reads `document` at module scope. Its wiring is
// checked as text, which is the convention the library view tests already use.
test('main.js takes its view list from the route module rather than keeping a second copy', () => {
  const main = read('src/js/main.js');
  has(main, /import \{[^}]*VIEWS[^}]*\} from '\.\/lib\/route\.js'/, 'VIEWS imported from route.js');
  lacks(main, /const VIEWS = \[/, 'a second VIEWS declaration in main.js');
});

test('main.js listens for hashchange and restores the route at boot', () => {
  const main = read('src/js/main.js');
  has(main, /addEventListener\('hashchange'/, "a 'hashchange' listener");
  has(main, /parseRoute\(location\.hash\)/, 'the boot read of location.hash');
});

// The passive path must never push. A reader who marks twenty issues read and then presses Back
// once should leave the view they were on, not walk back through twenty identical entries.
test('main.js writes the hash passively with replaceState, not by assignment', () => {
  const main = read('src/js/main.js');
  has(main, /history\.replaceState/, 'a replaceState call for passive syncs');
});
