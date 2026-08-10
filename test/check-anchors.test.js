// The collision these tests are built on is not invented. On 2026-08-08 nineteen lines
// were added to the top of `src/js/lib/model.js`, a re-aiming pass moved twenty-six
// citations of that module, and one landed thirty-eight lines out on top of another. The
// blessed lock carried the result: two entries in `PRODUCT_BACKLOG.md`, both in the
// `item-details` scope, both naming line 640 of the model module, both fingerprinted
// `0c1b3de0385c2af9`, and one of them asserting a claim about `readAt` over a line that
// builds a list. The gate reported zero drift over it, correctly and uselessly, because
// two citations of one line always agree.
//
// The step that should have caught it printed distinct ranges, so it printed that line
// once. It read perfectly well for the claim that did belong to it. Everything below is
// aimed at that: a report of citations must never be keyed by the thing that collapsed.
import test from 'node:test';
import assert from 'node:assert/strict';

import { citations, claimBefore, collisions, pairingLines, pairings, relativeCitations } from '../scripts/check-anchors.mjs';

// The two citations as the lock actually held them, ordinals and all. `fp` matches on
// both because they cite the same line, which is the whole difficulty.
const COLLIDED = [
  {
    key: 'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:640|0',
    anchor: 'src/js/lib/model.js:640',
    claim: '`coerce` writes it at',
    fp: '0c1b3de0385c2af9',
    head: 'lists[k] = {',
    tail: null,
  },
  {
    key: 'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:640|1',
    anchor: 'src/js/lib/model.js:640',
    claim: 'every stored readAt is coerced to a number by',
    fp: '0c1b3de0385c2af9',
    head: 'lists[k] = {',
    tail: null,
  },
];

const lockOf = (cites) => Object.fromEntries(
  cites.map((c) => [c.key, { anchor: c.anchor, fp: c.fp, head: c.head }]),
);

test('a citation blessed against the line it already cites is not reprinted', () => {
  assert.deepEqual(pairings(COLLIDED, lockOf(COLLIDED)), []);
});

test('every citation is its own record, so two sharing a line print twice', () => {
  const pairs = pairings(COLLIDED, {});

  // The assertion that fails on a printer keyed by anchor, range or fingerprint. All
  // three collapse these two to one, and one of them is the false claim.
  assert.equal(pairs.length, 2);
  assert.deepEqual(pairs.map((p) => p.claim), [
    '`coerce` writes it at',
    'every stored readAt is coerced to a number by',
  ]);
  assert.deepEqual(new Set(pairs.map((p) => p.head)), new Set(['lists[k] = {']));
});

test('a citation re-aimed onto a line another already holds is still its own record', () => {
  // The half-migrated state the bless was run in: the first citation had already been
  // re-aimed and blessed, the second arrives on top of it.
  const settled = lockOf([COLLIDED[0]]);
  const pairs = pairings(COLLIDED, settled);

  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].claim, 'every stored readAt is coerced to a number by');
  assert.equal(pairs[0].was, null);
});

test('a citation whose line changed under it is reprinted with the new line', () => {
  const stale = { [COLLIDED[0].key]: { anchor: COLLIDED[0].anchor, fp: 'ffffffffffffffff', head: 'was() {' } };
  const pairs = pairings([COLLIDED[0]], stale);

  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].head, 'lists[k] = {');
  assert.equal(pairs[0].was.head, 'was() {');
});

test('a range prints its last cited line as well as its first', () => {
  const ranged = [{
    key: 'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:640-644|0',
    anchor: 'src/js/lib/model.js:640-644',
    claim: 'the list is rebuilt at',
    fp: 'aaaaaaaaaaaaaaaa',
    head: 'lists[k] = {',
    tail: '};',
  }];

  assert.deepEqual(pairings(ranged, {}), [{
    key: ranged[0].key,
    anchor: ranged[0].anchor,
    claim: 'the list is rebuilt at',
    head: 'lists[k] = {',
    tail: '};',
    why: null,
    was: null,
  }]);
});

test('an unresolvable citation carries its reason rather than a line', () => {
  const broken = [{
    key: 'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:9999|0',
    anchor: 'src/js/lib/model.js:9999',
    claim: 'the coercion lives at',
    fp: null,
    why: 'out of range, file has 700 lines',
  }];

  const pairs = pairings(broken, {});
  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].head, null);
  assert.equal(pairs[0].why, 'out of range, file has 700 lines');
});

test('the collision is noticed on the bless that creates it', () => {
  const clashes = collisions(COLLIDED, lockOf([COLLIDED[0]]));

  assert.equal(clashes.length, 1);
  assert.equal(clashes[0].anchor, 'src/js/lib/model.js:640');
  assert.equal(clashes[0].bucket, 'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:640');
  assert.deepEqual(clashes[0].claims, [
    '`coerce` writes it at',
    'every stored readAt is coerced to a number by',
  ]);
});

// The narrowing that keeps the notice worth reading. Seventeen buckets in the real lock
// hold more than one citation of one anchor in one scope, and all seventeen are correct.
// A notice that fired on them every run would be a thing to scroll past, and scrolling
// past is how the original was waved through.
test('a settled collision is silent, however unlike its claims are', () => {
  assert.deepEqual(collisions(COLLIDED, lockOf(COLLIDED)), []);
});

test('two citations of one line saying the same thing are not a collision', () => {
  const same = COLLIDED.map((c, i) => ({ ...c, claim: i === 0 ? '`coerce` writes it at' : 'coerce writes it at:' }));
  assert.deepEqual(collisions(same, {}), []);
});

test('citations of one anchor in different scopes are not a collision', () => {
  const apart = [
    COLLIDED[0],
    { ...COLLIDED[1], key: 'PRODUCT_BACKLOG.md|reconciliation|src/js/lib/model.js:640|0' },
  ];
  assert.deepEqual(collisions(apart, {}), []);
});

// A citation that opens a wrapped paragraph has no prose before it on its own line, so
// the claim extracts empty. Treating two empties as one claim read as "these agree" when
// nothing had been read, and it really did exempt a live bucket: two citations of the
// reading-filters list, lines 25 to 48 of that module, in one scope, under wholly unlike
// sentences, both beginning their line. An unreadable claim has to be unlike everything,
// itself included.
test('two citations whose claims could not be read are a collision, not an agreement', () => {
  const blank = COLLIDED.map((c) => ({ ...c, claim: '' }));
  assert.equal(collisions(blank, {}).length, 1);
});

// The defect one layer below `pairings`. A printer that collapses by anchor, head or
// fingerprint restores it exactly, and no assertion on returned records can see that.
test('the printed report carries one line per citation, not one per line cited', () => {
  const lines = pairingLines(pairings(COLLIDED, {}));
  const cited = lines.filter((l) => l.includes('->'));

  assert.equal(cited.length, 2);
  assert.equal(cited.filter((l) => l.includes('every stored readAt')).length, 1);
  assert.equal(cited.filter((l) => l.includes('writes it at')).length, 1);
});

test('a range prints the line that closes it, so the whole claim is read', () => {
  const [line] = pairingLines(pairings(
    [{ ...COLLIDED[0], anchor: 'src/js/lib/model.js:640-642', head: 'lists[k] = {', tail: '};' }],
    {},
  )).slice(1);

  assert.match(line, /lists\[k\] = \{ {2}\.\.\. {2}\};/);
});

// A citation the code moved under and one now pointing at different code need different
// amounts of attention, and the new line alone does not distinguish them.
test('a citation whose cited content changed shows what it was blessed against', () => {
  const moved = [{ ...COLLIDED[0], fp: 'ffff', head: 'lists[k] = {' }];
  const stale = { [COLLIDED[0].key]: { anchor: 'src/js/lib/model.js:601', fp: '0c1b3de0385c2af9', head: 'const read = {};' } };

  assert.equal(pairingLines(pairings(moved, stale)).filter((l) => l.includes('const read = {};')).length, 1);
  assert.equal(pairingLines(pairings([{ ...COLLIDED[0], fp: 'ffff' }], lockOf(COLLIDED))).filter((l) => l.includes('was  ->')).length, 0);
});

// BL-071 widened the population past Markdown, and the whole of that decision is which form
// counts as a claim where. In prose both do, because the backlog's Evidence column is bare.
// In code the bare form is a string literal the program computes with, and the fixtures above
// are the proof: one of them names a line past the end of its file on purpose, so collecting
// it would demand the fixture resolve.
//
// Which is why the backticks below are assembled rather than typed. A fixture written with
// them adjacent to a path is indistinguishable from a claim, and five of these enrolled
// themselves as live anchors when they were first written that way, so a fixture citing a
// module would have drifted every time an unrelated module moved. Keeping the path bare in
// the source is the rule under test, applied to the test.
const cite = (path) => '\u0060' + path + '\u0060';

test('a bare citation is collected in prose and ignored in code', () => {
  const line = 'the walker lives at src/js/lib/model.js:640 today';

  assert.equal(citations(line).length, 1);
  assert.equal(citations(line, false).length, 0);
});

test('a backticked citation is collected in both, since a comment makes a claim too', () => {
  const line = `the walker lives at ${cite('src/js/lib/model.js:640')} today`;

  assert.equal(citations(line).length, 1);
  assert.equal(citations(line, false).length, 1);
});

// The one form that has to survive the split untouched. A backticked anchor also satisfies the
// bare pattern's neighbours, and counting it twice puts the coverage assertion permanently out
// of balance, which is the assertion that catches a walker bug.
test('a citation carrying both forms is still counted once', () => {
  const line = `compare ${cite('src/js/lib/model.js:640')} with src/js/lib/model.js:641`;

  assert.deepEqual(citations(line).map((c) => c.start), [640, 641]);
});

// The claim printed beside each line is all BL-070 shipped, and in code it arrives wrapped in
// comment markers. Splicing "//" into the middle of a sentence spends the window on punctuation.
test('a comment marker is stripped from a claim in code and kept in prose', () => {
  const lines = [`// the numbers are stated as text beside it, at ${cite('src/js/main.js:854')} in the rail`];
  const at = lines[0].indexOf('src/js/main.js:854');

  assert.ok(!claimBefore(lines, 0, at, false).includes('//'));
  assert.ok(claimBefore(lines, 0, at, true).includes('//'));
});

// A citation in prose usually closes a sentence. One in a comment routinely opens it, and the
// served-root citation in the shipped-copy test really did print a claim of "//" and nothing else.
test('a claim is read forward when the citation opens the comment', () => {
  const lines = [`// ${cite('server.mjs:12')} resolves the served root to src/, so that is what shipped means`];
  const at = lines[0].indexOf('server.mjs:12');

  assert.match(claimBefore(lines, 0, at, false), /resolves the served root/);
});

// Walking back over wrapped comment lines is what makes a claim readable at all, but a comment
// sitting directly on top of code must not absorb the line above it into the sentence. The
// assertion is an equality rather than a substring: the old walk did absorb the line, and the
// 90-character window then clipped the first two characters off `fileURLToPath`, so a check for
// its absence passed on the broken code by an accident of where the truncation fell.
test('the walk back over a comment stops at the first line that is not one', () => {
  const lines = [
    "const ROOT = resolve(fileURLToPath(new URL('./src', import.meta.url)));",
    '// the hue comes from the series name at',
    `// ${cite('src/js/main.js:434-435')}, so only lightness is the theme's`,
  ];
  const at = lines[2].indexOf('src/js/main.js:434-435');

  assert.equal(claimBefore(lines, 2, at, false), 'the hue comes from the series name at');
});

// The forward read is the one part of the claim walk that is not conditioned on prose, so a
// Markdown table row is the case where forwards and backwards have to agree. Backwards a row is
// refused outright, and a forward read that ran past the cell boundary would attribute the next
// two columns to this one.
test('a forward read in a table row stops at the cell boundary', () => {
  const lines = [`| ${cite('src/js/main.js:12')} | second cell | third cell |`];
  const at = lines[0].indexOf('src/js/main.js:12');

  assert.ok(!claimBefore(lines, 0, at, true).includes('second cell'));
});

// BL-077. The form that started this: a line number with no path in front of it, leaning on a
// full citation earlier in the sentence. Both regexes above begin matching at a filename, so
// neither ever saw one, and the palette script carried a claim thirteen lines wrong under a gate
// reporting no drift. These fixtures are assembled the same way and for a stronger reason than
// the ones above: written literally they would be the very thing the gate now refuses, and this
// file would fail the check it exists to prove.
const rel = (n) => '\u0060:' + n + '\u0060';

test('a line number with no path is found in prose', () => {
  const found = relativeCitations(`the tick sits at ${rel(582)} in the dark theme`);

  assert.deepEqual(found.map((r) => r.ref), [':582']);
});

test('a range with no path is found too, since either form drifts the same way', () => {
  assert.deepEqual(relativeCitations(`and again at ${rel('342-343')} below`).map((r) => r.ref), [':342-343']);
});

// The split BL-071 drew, applied here. A comment is addressed to a reader and a string literal is
// not, and the distinction is load-bearing rather than tidy: the fixtures in this very file put
// this shape inside string literals, so a rule that read them would fail on the tests written to
// prove it. The assertion is that both sides hold, because a rule that fired nowhere in code
// would pass this file for the wrong reason.
test('in code the form counts in a comment and not in a string literal', () => {
  const comment = `  // the tick sits at ${rel(582)} in the dark theme`;
  const literal = `  const fixture = 'the tick sits at ${rel(582)}';`;

  assert.equal(relativeCitations(comment, false).length, 1);
  assert.equal(relativeCitations(literal, false).length, 0);
  assert.equal(relativeCitations(literal, true).length, 1);
});

// A full citation must not be caught by the rule against the short one, or the gate would refuse
// every document it protects. The pairing is the exact shape the palette script writes, which is
// what makes it worth asserting rather than assuming.
test('a citation carrying its path is untouched by the rule against the one without', () => {
  const line = `(${cite('src/styles.css:580')} and ${cite('src/styles.css:582')})`;

  assert.deepEqual(relativeCitations(line), []);
  assert.equal(citations(line).length, 2);
});

// The line number is reported, because a message naming the file and not the line sends a reader
// hunting through a four-hundred-line comment for a colon.
test('each hit reports the line it sits on', () => {
  const text = ['first', 'second', `third, at ${rel(99)}`].join('\n');

  assert.deepEqual(relativeCitations(text).map((r) => r.line), [3]);
});
