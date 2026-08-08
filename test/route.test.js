import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { VIEWS, formatRoute, parseRoute } from '../src/js/lib/route.js';
import { LIBRARY_VIEWS } from '../src/js/lib/library.js';
import { READING_FILTERS, DEFAULT_FILTER } from '../src/js/lib/readingFilters.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// assert.match prints the whole subject on failure, and main.js is 120 KB, which buries the run.
// These say what was looked for instead.
const has = (text, re, what) => assert.ok(re.test(text), `expected to find ${what}`);
const lacks = (text, re, what) => assert.ok(!re.test(text), `expected not to find ${what}`);

test('every view the rail can reach survives a round trip', () => {
  for (const view of VIEWS) {
    const parsed = parseRoute(formatRoute({ view }));
    assert.deepEqual(parsed, { view, listId: null, filter: null }, `round trip failed for ${view}`);
  }
});

test('the library views are routable, not just the seven typed ones', () => {
  for (const { value } of LIBRARY_VIEWS) {
    assert.ok(VIEWS.includes(value), `${value} is showable but not routable`);
    assert.deepEqual(parseRoute(formatRoute({ view: value })), { view: value, listId: null, filter: null });
  }
});

test('a list id rides along and comes back intact', () => {
  const hash = formatRoute({ view: 'read', listId: 'list-mabc123-x7y2z9' });
  assert.equal(hash, '#/read/list-mabc123-x7y2z9');
  assert.deepEqual(parseRoute(hash), { view: 'read', listId: 'list-mabc123-x7y2z9', filter: null });
});

// createList accepts a caller-supplied id, so an id containing a slash or a space is reachable
// without a bug anywhere. Encoding it is what keeps it from being read back as a third segment.
test('a list id needing escapes survives a round trip', () => {
  for (const id of ['a/b', 'a b', 'a%b', 'a#b', 'ünïcødé', 'a?b']) {
    const parsed = parseRoute(formatRoute({ view: 'read', listId: id }));
    assert.deepEqual(parsed, { view: 'read', listId: id, filter: null }, `round trip failed for ${id}`);
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

// ------------------------------------------------------------------ the reading filter

test('a chosen filter rides along and comes back intact', () => {
  const hash = formatRoute({ view: 'read', listId: 'list-a', filter: 'unread' });
  assert.equal(hash, '#/read/list-a?filter=unread');
  assert.deepEqual(parseRoute(hash), { view: 'read', listId: 'list-a', filter: 'unread' });
});

// The whole reason the filter is a query and not a third path segment. If the default were written
// out, every address the app emits would change shape, and every link shared or bookmarked under
// BL-036 would stop matching the one it writes today.
test('the default filter is written nowhere, so an unfiltered address is unchanged', () => {
  assert.equal(formatRoute({ view: 'read', listId: 'list-a', filter: DEFAULT_FILTER }), '#/read/list-a');
  assert.equal(formatRoute({ view: 'read', listId: 'list-a' }), '#/read/list-a');
  assert.equal(formatRoute({ view: 'about', filter: DEFAULT_FILTER }), '#/about');
});

test('every filter the app offers is routable, so adding one needs no edit here', () => {
  for (const { value } of READING_FILTERS) {
    const parsed = parseRoute(formatRoute({ view: 'read', listId: 'list-a', filter: value }));
    const expected = value === DEFAULT_FILTER ? null : value;
    assert.deepEqual(parsed, { view: 'read', listId: 'list-a', filter: expected }, `round trip failed for ${value}`);
  }
});

// A stale link from an older build names a view the reader can still be taken to, so the filter is
// refused and the route is not. Refusing the whole route would answer a dropped filter by refusing
// to navigate at all, and the address self-corrects on the next sync either way.
test('an unknown filter is dropped without taking the route down with it', () => {
  for (const hash of ['#/read/list-a?filter=bogus', '#/read/list-a?filter=', '#/read/list-a?other=unread', '#/read/list-a?']) {
    assert.deepEqual(parseRoute(hash), { view: 'read', listId: 'list-a', filter: null }, `expected no filter for ${hash}`);
  }
});

test('an unknown filter is never written into an address either', () => {
  assert.equal(formatRoute({ view: 'read', listId: 'list-a', filter: 'bogus' }), '#/read/list-a');
  assert.equal(formatRoute({ view: 'read', listId: 'list-a', filter: 42 }), '#/read/list-a');
});

// createList accepts a caller-supplied id, so an id holding a question mark is reachable without a
// bug anywhere. It arrives here as %3F, which is why parseRoute splits on the first `?` before
// decoding: decoding first would turn that id back into a `?` and cut the path at it.
test('a list id holding a question mark is not read as the start of the filter', () => {
  const hash = formatRoute({ view: 'read', listId: 'a?b', filter: 'unread' });
  assert.equal(hash, '#/read/a%3Fb?filter=unread');
  assert.deepEqual(parseRoute(hash), { view: 'read', listId: 'a?b', filter: 'unread' });
});

test('a filter cannot smuggle in a path segment', () => {
  assert.deepEqual(parseRoute('#/read/list-a?filter=un/read'), { view: 'read', listId: 'list-a', filter: null });
});

test('a filter on a view with no list needs no placeholder in its place', () => {
  const hash = formatRoute({ view: 'progress', filter: 'unread' });
  assert.equal(hash, '#/progress?filter=unread');
  assert.deepEqual(parseRoute(hash), { view: 'progress', listId: null, filter: 'unread' });
});

test('a malformed percent escape is refused rather than throwing', () => {
  assert.equal(parseRoute('#/read/%E0%A4%A'), null);
  assert.equal(parseRoute('#/%'), null);
});

test('a trailing slash reads as no list rather than an empty one', () => {
  assert.deepEqual(parseRoute('#/read/'), { view: 'read', listId: null, filter: null });
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

// Asserting the handler's body, not just that a listener exists. Removing the applyRoute call
// leaves both the listener and the boot read in place, so a check for those two strings alone
// stays green while Back and Forward silently stop working. Measured against that exact mutation.
test('main.js listens for hashchange and acts on the route it reads', () => {
  const main = read('src/js/main.js');
  has(
    main,
    /addEventListener\('hashchange',[^)]*\(\) => \{\s*const route = parseRoute\(location\.hash\);\s*if \(route\) applyRoute\(route, \{ focus: true,/,
    'a hashchange handler that reads the route and applies it with focus',
  );
  has(main, /const bootRoute = parseRoute\(location\.hash\)/, 'the boot read of location.hash');
});

// The passive path must never push. A reader who marks twenty issues read and then presses Back
// once should leave the view they were on, not walk back through twenty identical entries.
test('main.js writes the hash passively with replaceState, not by assignment', () => {
  const main = read('src/js/main.js');
  has(main, /history\.replaceState/, 'a replaceState call for passive syncs');
});

// Choosing a filter is the deliberate act this whole scheme exists for, so it has to push. A
// replace here would leave Back unable to undo a filter change, which is the task BL-037 left open.
test('main.js pushes when a filter is chosen, so Back can undo it', () => {
  const main = read('src/js/main.js');
  has(
    main,
    /radio\.addEventListener\('change',[^)]*\(e\) => \{\s*setFilter\(e\.target\.value\);[\s\S]{0,600}?syncHash\(\{ push: true \}\);/,
    'a filter radio handler that sets the filter and then pushes',
  );
});

// Assigning location.hash fires hashchange, which re-runs applyRoute and moves focus to the view
// heading. For a filter radio that throws the keyboard out of the control just pressed. Measured in
// Edge: pushState fires no hashchange, and Back over an entry it made still does.
test('main.js pushes with pushState rather than by assigning the hash', () => {
  const main = read('src/js/main.js');
  has(main, /history\.pushState\(null, '', next\)/, 'a pushState call for deliberate navigation');
  lacks(main, /location\.hash = /, 'an assignment to location.hash');
});

// The two callers of applyRoute disagree about what an address with no filter means, and the
// disagreement is the point. Back hands over an address this app wrote, and this app omits the
// filter only when it is the default, so absent there means All. Boot may be handed a bookmark made
// before any of this shipped, where absent means nothing at all and the stored setting stands.
test('main.js reads an absent filter as All on Back but as the stored one at boot', () => {
  const main = read('src/js/main.js');
  has(main, /applyRoute\(bootRoute, \{ focus: false, filterIfAbsent: filter \}\)/, 'boot falling back to the restored filter');
  has(main, /applyRoute\(route, \{ focus: true, filterIfAbsent: DEFAULT_FILTER \}\)/, 'hashchange falling back to the default');
});

// One path in and out of the filter, so a route cannot move the rows without moving the radio, and
// a radio cannot move the rows without storing the choice.
test('nothing sets the filter behind setFilter back', () => {
  const main = read('src/js/main.js');
  const body = main.slice(main.indexOf('function setFilter'), main.indexOf('function wireReading'));
  has(body, /settings\.filter = wanted;/, 'setFilter storing the choice');
  has(body, /radio\.checked = true;/, 'setFilter moving the radio');
  has(body, /renderRows\(\);/, 'setFilter re-rendering the rows');
  // wireReading restores from settings before any radio exists to read, and corrects an
  // unrecognised stored value, which is a job setFilter does not have. Every other write is a bug.
  const writes = [...main.matchAll(/^\s*filter = /gm)];
  assert.equal(writes.length, 2, 'the filter is written somewhere other than setFilter and the restore');
});
