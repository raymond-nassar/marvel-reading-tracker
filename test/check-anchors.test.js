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

import { PROSE, blankEdgeOf, citations, claimBefore, collisions, commentSyntax, failing, firstTime, nearMisses, pairingLines, pairings, relativeCitations, relativeVerdict, scopeRenames } from '../scripts/check-anchors.mjs';

const JS = commentSyntax('a.mjs');

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
  assert.equal(citations(line, JS).length, 0);
});

test('a backticked citation is collected in both, since a comment makes a claim too', () => {
  const line = `the walker lives at ${cite('src/js/lib/model.js:640')} today`;

  assert.equal(citations(line).length, 1);
  assert.equal(citations(line, JS).length, 1);
});

// The one form that has to survive the split untouched. A backticked anchor also satisfies the
// bare pattern's neighbours, and counting it twice puts the coverage assertion permanently out
// of balance, which is the assertion that catches a walker bug.
test('a citation carrying both forms is still counted once', () => {
  const line = `compare ${cite('src/js/lib/model.js:640')} with src/js/lib/model.js:641`;

  assert.deepEqual(citations(line).map((c) => c.start), [640, 641]);
});

// BL-104. Both patterns above begin at a filename ending in one of seven extensions, so a file
// whose whole name is its suffix was not a citation at all, and this repository cites one twice.
// Widening the shape was measured and refused: an extensionless pattern matches 105 further
// strings here, all of them contrast ratios, the served origin and a container tag, and none a
// citation. So the tracked list decides, and these two hold the direction that decision runs in.
const IGNORED = new Set(['.gitignore']);

test('an extensionless path is collected in both forms once it names a tracked file', () => {
  const ticked = `the runtime artifacts are held out at ${cite('.gitignore:12-13')} today`;
  const bare = 'the runtime artifacts are held out at .gitignore:12-13 today';

  assert.deepEqual(citations(ticked, PROSE, IGNORED).map((c) => c.file), ['.gitignore']);
  assert.deepEqual(citations(bare, PROSE, IGNORED).map((c) => c.start), [12]);
  assert.equal(citations(ticked, JS, IGNORED).length, 1);
  assert.equal(citations(bare, JS, IGNORED).length, 0);
});

// The half that keeps the widening from costing anything. A ratio and an origin are the two
// shapes prose here actually produces, at 105 hits between them, and both must stay out.
test('an extensionless path nothing tracks is not a citation, whatever its shape', () => {
  const ratio = `contrast reaches ${cite('4.5:1')} against the surface`;
  const origin = `served from ${cite('127.0.0.1:8787')} throughout`;

  assert.equal(citations(ratio, PROSE, IGNORED).length, 0);
  assert.equal(citations(origin, PROSE, IGNORED).length, 0);
  assert.equal(citations(`held out at ${cite('.gitignore:12-13')}`, PROSE, new Set()).length, 0);
});

// With no list there is nothing to be sure of, so a caller holding a fragment of text and no
// repository gets the old answer rather than a guess. Every fixture above this line relies on it.
test('an extensionless path is left alone when there is no list to check it against', () => {
  const line = `the runtime artifacts are held out at ${cite('.gitignore:12-13')} today`;

  assert.equal(citations(line).length, 0);
  assert.equal(citations(line, PROSE, null).length, 0);
});

// The whole of BL-104's third criterion, and the assertion that falsifies is the first. Before
// this widening the collector returned nothing for the line below, so `found` was empty, nothing
// was compared and the verdict was a pass while the claim went stale. Drift is not separately
// wired for this shape: being collected is what puts a citation inside the comparison that
// already exists, which is why proving collection proves the rest.
test('a citation of an ignore file drifts when the lines it names move', () => {
  const doc = `the runtime artifacts are held out at ${cite('.gitignore:12-13')} today`;
  const key = 'PRODUCT_BACKLOG.md|repository-hygiene|.gitignore:12-13|0';
  const blessed = { [key]: { anchor: '.gitignore:12-13', fp: 'blessed', head: '*.log' } };

  const found = citations(doc, PROSE, IGNORED).map((c) => ({
    key,
    anchor: `${c.file}:${c.start}-${c.end}`,
    claim: 'the runtime artifacts are held out at',
    fp: 'moved',
    head: 'tmp/',
  }));

  assert.equal(found.length, 1);
  assert.equal(pairings(found, blessed).length, 1);
  assert.equal(failing({ drifted: pairings(found, blessed).length }), true);
});

// BL-104's second criterion. The near-miss notice exists so that a citation nothing gates is at
// least visible, and its first rule begins at a name followed by a dot, so it failed on the
// dot-named shape for the same reason the collectors did. These three hold both sides of the
// line it now draws, and the third holds the noise it must not make: 105 strings here are
// extensionless and citation-shaped, and a notice on all of them is a notice nobody reads.
test('a citation of a dot-named file nothing tracks is named as a near miss', () => {
  const line = `held out at ${cite('.npmrc:3')} since the start`;

  const why = nearMisses(line, PROSE, new Set()).map((m) => m.why);

  assert.deepEqual(why, ['dot-named file that is not tracked']);
});

test('the same citation says nothing once the file it names is tracked', () => {
  const line = `held out at ${cite('.gitignore:12-13')} since the start`;

  assert.equal(nearMisses(line, PROSE, IGNORED).length, 0);
  assert.equal(nearMisses(line, PROSE, new Set()).length, 1);
});

test('a ratio and an origin are not near misses, however citation-shaped they read', () => {
  const line = `contrast reaches ${cite('4.5:1')} on ${cite('127.0.0.1:8787')} throughout`;

  assert.deepEqual(nearMisses(line, PROSE, new Set()), []);
});

// The claim printed beside each line is all BL-070 shipped, and in code it arrives wrapped in
// comment markers. Splicing "//" into the middle of a sentence spends the window on punctuation.
test('a comment marker is stripped from a claim in code and kept in prose', () => {
  const lines = [`// the numbers are stated as text beside it, at ${cite('src/js/main.js:854')} in the rail`];
  const at = lines[0].indexOf('src/js/main.js:854');

  assert.ok(!claimBefore(lines, 0, at, JS).includes('//'));
  assert.ok(claimBefore(lines, 0, at, PROSE).includes('//'));
});

// A citation in prose usually closes a sentence. One in a comment routinely opens it, and the
// served-root citation in the shipped-copy test really did print a claim of "//" and nothing else.
test('a claim is read forward when the citation opens the comment', () => {
  const lines = [`// ${cite('server.mjs:12')} resolves the served root to src/, so that is what shipped means`];
  const at = lines[0].indexOf('server.mjs:12');

  assert.match(claimBefore(lines, 0, at, JS), /resolves the served root/);
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

  assert.equal(claimBefore(lines, 2, at, JS), 'the hue comes from the series name at');
});

// The forward read is the one part of the claim walk that is not conditioned on prose, so a
// Markdown table row is the case where forwards and backwards have to agree. Backwards a row is
// refused outright, and a forward read that ran past the cell boundary would attribute the next
// two columns to this one.
test('a forward read in a table row stops at the cell boundary', () => {
  const lines = [`| ${cite('src/js/main.js:12')} | second cell | third cell |`];
  const at = lines[0].indexOf('src/js/main.js:12');

  assert.ok(!claimBefore(lines, 0, at, PROSE).includes('second cell'));
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

  assert.equal(relativeCitations(comment, JS).length, 1);
  assert.equal(relativeCitations(literal, JS).length, 0);
  assert.equal(relativeCitations(literal, PROSE).length, 1);
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

// The rule is about what may be written, so it binds the tree being written and not one that
// already shipped. Refusing under --ref would make every revision holding the form unqueryable
// for drift, which is the single thing --ref is for.
test('the form is refused against the working tree', () => {
  assert.equal(relativeVerdict(2, null), 'fatal');
});

test('the same form is only named against a revision, which cannot be edited to satisfy it', () => {
  assert.equal(relativeVerdict(2, 'origin/main'), 'notice');
});

test('a tree with no hits says nothing either way', () => {
  assert.equal(relativeVerdict(0, null), 'none');
  assert.equal(relativeVerdict(0, 'origin/main'), 'none');
});

// A blank first or last line is the one defect in a range that reading the print cannot
// find, because the print is built from the fingerprint and the fingerprint drops blank
// lines before it takes a head. The reader is shown a line that reads correctly for the
// claim while the range blessed around it is a line wider than the claim.
test('a range that begins on a blank line is named, and one that ends on one is too', () => {
  const lines = ['alpha', '', 'beta', 'gamma', ''];

  assert.equal(blankEdgeOf(lines, 2, 4), 'begins on a blank line');
  assert.equal(blankEdgeOf(lines, 3, 5), 'ends on a blank line');
  assert.equal(blankEdgeOf(lines, 2, 5), 'begins and ends on a blank line');
  assert.equal(blankEdgeOf(lines, 3, 4), null);
});

// Whitespace counts as blank. A range closing on a line of spaces reads as closing on
// nothing, and the rule is about what the range covers rather than what it contains.
test('a line of whitespace closes a range as blank', () => {
  assert.equal(blankEdgeOf(['alpha', '   '], 1, 2), 'ends on a blank line');
});

// A single-line anchor never reaches the rule: a blank one has no body to fingerprint and
// is refused earlier as blank lines only, so answering here would be a second verdict on
// a citation already rejected.
test('a single-line anchor is not a range and is left alone', () => {
  assert.equal(blankEdgeOf(['', 'beta'], 1, 1), null);
});

// The whole of the first-time rule is that both the key and the content must be unknown.
// Testing the key alone calls every re-aim new, which buries the citations that genuinely
// were never checked under the dozens that the gate has already agreed about.
const FRESH = {
  key: 'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:700|0',
  anchor: 'src/js/lib/model.js:700',
  claim: 'the new claim at',
  fp: 'aaaa1111bbbb2222',
  head: 'const fresh = 1;',
  tail: null,
};

test('a citation the lock has never held, under key or content, is first time', () => {
  assert.deepEqual(firstTime([FRESH], {}).map((f) => f.key), [FRESH.key]);
});

test('a re-aim is not first time, because its fingerprint is one the gate already agreed to', () => {
  const blessed = {
    'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:640|0': {
      anchor: 'src/js/lib/model.js:640',
      fp: FRESH.fp,
      head: FRESH.head,
    },
  };

  assert.deepEqual(firstTime([FRESH], blessed), []);
});

test('a citation already under its own key is not first time', () => {
  const blessed = { [FRESH.key]: { anchor: FRESH.anchor, fp: FRESH.fp, head: FRESH.head } };

  assert.deepEqual(firstTime([FRESH], blessed), []);
});

// An unresolvable citation is refused before the bless prints anything, so calling it
// first time would put a citation that cannot be read into the list of ones to read.
test('a citation that does not resolve is not reported as first time', () => {
  assert.deepEqual(firstTime([{ ...FRESH, fp: null }], {}), []);
});

// The mark has to survive the same collapse the report itself was built to survive. Two
// first-time citations of one anchor must be marked twice, or the reader reads one line
// and believes they have read both.
test('every first-time citation is marked, including two that share an anchor', () => {
  const fresh = new Set(COLLIDED.map((c) => c.key));
  const marked = pairingLines(pairings(COLLIDED, {}), fresh).filter((l) => l.includes('NEW  '));

  assert.equal(marked.length, 2);
  assert.equal(marked.filter((l) => l.includes('every stored readAt')).length, 1);
  assert.equal(marked.filter((l) => l.includes('writes it at')).length, 1);
});

test('a citation the gate has seen before carries no mark', () => {
  const fresh = new Set([COLLIDED[0].key]);
  const lines = pairingLines(pairings(COLLIDED, {}), fresh);

  assert.equal(lines.filter((l) => l.includes('NEW  ')).length, 1);
  assert.equal(lines.filter((l) => l.includes('1 is marked NEW')).length, 1);
});

test('a report with nothing new says nothing about new, rather than saying none', () => {
  assert.equal(pairingLines(pairings(COLLIDED, {})).filter((l) => l.includes('NEW')).length, 0);
});

// The fingerprint half is asked at the citation's own site, not across the corpus, and
// these two are the reason. Identical lines are ordinary here rather than exotic: two
// guards in the hydrator are written the same way, and 176 of the 492 entries blessed
// when this was written carried a fingerprint some other entry also carried. A
// corpus-wide test reads a claim nobody has ever checked as already checked the moment
// its lines happen to match one of them, anywhere, and the collision notice cannot stand
// in for it because that is scoped to one document, scope and anchor.
test('a first sighting in another document is not excused by content blessed elsewhere', () => {
  const elsewhere = {
    'docs/ARCHITECTURE.md|the-store|src/js/lib/model.js:640|0': {
      anchor: 'src/js/lib/model.js:640',
      fp: FRESH.fp,
      head: FRESH.head,
    },
  };

  assert.deepEqual(firstTime([FRESH], elsewhere).map((f) => f.key), [FRESH.key]);
  assert.deepEqual(collisions([FRESH], elsewhere), []);
});

test('a first sighting in another scope of one document is not excused either', () => {
  const otherScope = {
    'PRODUCT_BACKLOG.md|appendix-b|src/js/lib/model.js:640|0': {
      anchor: 'src/js/lib/model.js:640',
      fp: FRESH.fp,
      head: FRESH.head,
    },
  };

  assert.deepEqual(firstTime([FRESH], otherScope).map((f) => f.key), [FRESH.key]);
});

// The suppression that is kept has to be kept exactly, or the rule trades one kind of
// noise for another: a re-aim holds its document, its scope and its ordinal and moves
// only the anchor, so it must stay unmarked under the narrower test as well.
test('a re-aim at its own site stays unmarked under the narrower test', () => {
  const sameSite = {
    'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:640|0': {
      anchor: 'src/js/lib/model.js:640',
      fp: FRESH.fp,
      head: FRESH.head,
    },
  };

  assert.deepEqual(firstTime([FRESH], sameSite), []);
});

// The ordinal is part of the site, and dropping it would reintroduce the collapse this
// report was built to survive, one layer up. A second citation of a line the scope
// already cites is a first sighting of its own: nobody has read that sentence against
// that line, however often the line itself has been read.
test('a second citation of a line already blessed in that scope is a first sighting', () => {
  const blessed = {
    'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:700|0': {
      anchor: FRESH.anchor,
      fp: FRESH.fp,
      head: FRESH.head,
    },
  };
  const second = { ...FRESH, key: 'PRODUCT_BACKLOG.md|item-details|src/js/lib/model.js:700|1' };

  assert.deepEqual(firstTime([second], blessed).map((f) => f.key), [second.key]);
});

// BL-079. Everything below is the only evidence this change has, and that is worth saying
// plainly rather than dressing up. Measured over the whole tree, widening the comment syntax
// changes nothing the gate collects, prints or records today: 20 citations outside Markdown
// before and after, 0 claims different, 0 new lock entries, 0 new notices and 0 new refusals.
// The hole is real and is closed before it is used, so a test is the only thing that can show
// the difference and a test that passes either way would show nothing.

test('the comment opener is keyed on the path, and Markdown is prose', () => {
  assert.equal(commentSyntax('README.md'), PROSE);
  assert.equal(commentSyntax('.github/workflows/ci.yml').open.source, commentSyntax('.gitignore').open.source);
  assert.equal(commentSyntax('src/index.html').open.test('  <!-- a note -->'), true);
  assert.equal(commentSyntax('package.json').open, null);
  assert.equal(commentSyntax('run.cmd').open.test(':: a note'), true);
  assert.equal(commentSyntax('src/js/main.js').open.test('// a note'), true);
  assert.equal(commentSyntax('LICENSE').open.source, commentSyntax('src/styles.css').open.source);
});

// The only comments in the one batch script this repository has open with `rem`, and the first
// assertion this change shipped tested `::` alone. It passed against a pattern that misses every
// comment in the file it was written for: measured, a `::`-only opener returns false on
// `rem Marvel Reading Tracker - start the local app.`, which is a line of that script. The
// uppercase and `remove` cases are here because the `/i` flag and the word boundary each carried
// no case either, and a stripper that fires on `remove` eats the first word of the sentence.
test('a batch comment opens with rem as well as ::, and rem is a whole word', () => {
  const cmd = commentSyntax('run.cmd');
  const lines = [`rem the app is started from here, at ${cite('run.cmd:6')}`];
  const at = lines[0].indexOf('run.cmd:6');

  assert.equal(cmd.open.test('rem Marvel Reading Tracker - start the local app.'), true);
  assert.equal(cmd.open.test('REM an upper case comment'), true);
  assert.equal(cmd.open.test('remove the temporary file'), false);
  assert.equal(claimBefore(lines, 0, at, cmd), 'the app is started from here, at');
});

// The gate reads the workflow file, and a hash opened nothing there before this. A relative
// citation written into a workflow comment was invisible to the rule that refuses the form,
// which is the same silence BL-071 widened the population to end.
test('a relative citation in a workflow comment is found, and one in a value is not', () => {
  const comment = `  # the concurrency group is set at ${rel(15)} above`;
  const value = `  run: echo 'set at ${rel(15)}'`;
  const yml = commentSyntax('.github/workflows/ci.yml');

  assert.equal(relativeCitations(comment, yml).length, 1);
  assert.equal(relativeCitations(value, yml).length, 0);
  assert.equal(relativeCitations(comment, commentSyntax('a.mjs')).length, 0);
});

test('a hash is stripped from a claim in a workflow comment', () => {
  // The fixture says "never null" on purpose. `bare` guards a null closer with `?? /(?:)$/`,
  // and hash syntax is the shape whose closer is null, so without the guard `replace(null, '')`
  // coerces to the substring "null" and deletes it from the claim. Measured: the guarded form
  // returns "a null claim" and the unguarded form returns "a  claim". No other fixture contains
  // the word, so removing the guard was a silent pass before this.
  const lines = [`  # the trigger is scoped to main, never null, at ${cite('.github/workflows/ci.yml:15')} deliberately`];
  const at = lines[0].indexOf('.github/workflows/ci.yml:15');
  const claim = claimBefore(lines, 0, at, commentSyntax('.github/workflows/ci.yml'));

  assert.ok(!claim.includes('#'));
  assert.match(claim, /the trigger is scoped to main, never null, at/);
});

// The half fix this change nearly shipped. A YAML comment necessarily opens with a hash and a
// space, which is also the Markdown heading shape, so an unscoped heading test ends the walk on
// the very lines the widening exists to let it read. Recognising them and then terminating on
// them looks finished and reads as a one-line claim.
//
// The fixture is unindented deliberately, and the first draft of it was not. Indented, the
// heading pattern never matches, because it anchors the hash to the start of the line, so the
// test passed with the scoping removed and proved nothing. Top-level workflow comments are
// written at column zero, which is the case that matters and the case that fails.
test('a workflow comment above another does not end the walk as a heading', () => {
  const lines = [
    '# the push trigger is scoped to main alone, so a branch with no',
    `# pull request correctly produces no run, at ${cite('.github/workflows/ci.yml:15')}`,
  ];
  const at = lines[1].indexOf('.github/workflows/ci.yml:15');

  assert.match(claimBefore(lines, 1, at, commentSyntax('.github/workflows/ci.yml')), /scoped to main alone/);
});

test('an HTML comment carries a claim and its marker is stripped', () => {
  const lines = [`  <!-- the reader launches from here, at ${cite('src/index.html:132')} -->`];
  const at = lines[0].indexOf('src/index.html:132');
  const claim = claimBefore(lines, 0, at, commentSyntax('src/index.html'));

  assert.ok(!claim.includes('<!--'));
  assert.match(claim, /the reader launches from here, at/);
});

// That fixture never reaches the closing marker, and the first draft of this change had no test
// that did. Its backward text is 32 characters, over the floor `claimBefore` returns at, so the
// read stops on its own line and both assertions above pass with the closer removed. Reaching it
// takes a citation early enough on its line to send the walk up to the line before. Measured:
// without the closer the claim reads "the reader launches from here --> at", with the marker of
// one line spliced into the middle of the sentence the next line finishes.
test('a closing HTML marker is stripped from the line above a citation', () => {
  const lines = [
    '  <!-- the reader launches from here -->',
    `  <!-- at ${cite('src/index.html:132')} -->`,
  ];
  const at = lines[1].indexOf('src/index.html:132');
  const claim = claimBefore(lines, 1, at, commentSyntax('src/index.html'));

  assert.ok(!claim.includes('-->'));
  assert.match(claim, /the reader launches from here at/);
});

// Why the syntaxes are keyed on the path rather than unioned into one pattern. A hash opens a
// comment in YAML and a private class field in JavaScript, and two scripts here already open
// with a hashbang. Under a union all three would be read as sentences addressed to a reader
// and the stripper would splice the remainder of the field declaration into a claim.
test('a hash in JavaScript is not a comment, and an asterisk in JSON is not one either', () => {
  const js = commentSyntax('src/js/lib/model.js');
  const field = `  #count = 0; // set at ${rel(12)}`;

  assert.equal(js.open.test('#!/usr/bin/env node'), false);
  assert.equal(js.open.test('  #count = 0;'), false);
  assert.equal(relativeCitations(field, js).length, 0);
  assert.equal(commentSyntax('src/data/catalog.json').open, null);
  assert.equal(relativeCitations(`  "note": "*star at ${rel(12)}"`, commentSyntax('src/data/catalog.json')).length, 0);
});

// The rename these tests are built on is not invented either. Filing BL-080 pushed BL-007
// down one rank, the heading naming that rank was reworded, and two citations of the view
// module moved scope from `...ranks-forty-fif` to `...ranks-forty-six` with their anchors
// and their content untouched. The gate reported two losses and two additions, and two
// people in two sessions each reasoned out by hand that neither was real.
const RENAMED_FROM = 'PRODUCT_BACKLOG.md|bl-007-ranks-forty-fif|src/js/main.js:116|0';
const RENAMED_TO = {
  key: 'PRODUCT_BACKLOG.md|bl-007-ranks-forty-six|src/js/main.js:116|0',
  anchor: 'src/js/main.js:116',
  claim: 'the refusal is withdrawn on the falling edge at',
  fp: '7d21a4c9e0b83f16',
  head: '    if (wasBlocked && !store.blocked) {',
  tail: null,
};
const RENAME_LOCK = {
  [RENAMED_FROM]: { anchor: 'src/js/main.js:116', fp: '7d21a4c9e0b83f16', head: '    if (wasBlocked && !store.blocked) {' },
};

test('an addition and a loss differing only in scope pair as one rename', () => {
  const pairs = scopeRenames([RENAMED_TO], [RENAMED_FROM], RENAME_LOCK);

  assert.equal(pairs.length, 1);
  assert.equal(pairs[0].from, RENAMED_FROM);
  assert.equal(pairs[0].to.key, RENAMED_TO.key);
  assert.equal(pairs[0].fromScope, 'bl-007-ranks-forty-fif');
  assert.equal(pairs[0].toScope, 'bl-007-ranks-forty-six');
});

// The pair is reported and not absorbed. A run whose only finding is a recognised rename
// still fails, so a genuine loss cannot hide behind a real rename in the same run. An
// earlier version of this asserted that `scopeRenames` had not mutated the arrays passed
// to it, which is true of any pure function and could not have failed if the verdict
// itself changed. A review pointed that out. This one reads the verdict.
test('a run whose only finding is a rename still fails', () => {
  const pairs = scopeRenames([RENAMED_TO], [RENAMED_FROM], RENAME_LOCK);

  assert.equal(pairs.length, 1);
  assert.equal(failing({ drifted: 0, unkeyed: 1, gone: 1 }), true);
  assert.equal(failing({ drifted: 0, unkeyed: 0, gone: 0 }), false);
});

// The counts the verdict reads are the raw ones, so subtracting a recognised rename from
// either of them is what this is here to forbid.
test('discounting a recognised rename from either count would pass a failing run', () => {
  assert.equal(failing({ unkeyed: 1 - 1, gone: 1 - 1 }), false);
  assert.equal(failing({ unkeyed: 1, gone: 1 }), true);
});

// A blank edge is only fatal when the run is not comparing against a named ref, since a
// historical tree cannot be edited to fix one.
test('a blank edge fails a working run and not a historical one', () => {
  assert.equal(failing({ edged: 1, ref: null }), true);
  assert.equal(failing({ edged: 1, ref: 'origin/main' }), false);
});

// The identity alone cannot tell these apart, and that is the point. The ordinal counts
// within one scope, so two citations of one anchor under two headings both carry ordinal
// 0 and both fingerprint the same lines. Without the falsifier a citation genuinely
// deleted from a section that still exists is explained away by an unrelated new citation
// of the same lines elsewhere in the document.
test('a loss from a section that still exists is not a rename', () => {
  const elsewhere = { ...RENAMED_TO, key: 'PRODUCT_BACKLOG.md|the-backlog#BL-082|src/js/main.js:116|0' };
  const live = new Set(['PRODUCT_BACKLOG.md|bl-007-ranks-forty-fif']);

  assert.equal(scopeRenames([elsewhere], [RENAMED_FROM], RENAME_LOCK).length, 1);
  assert.deepEqual(scopeRenames([elsewhere], [RENAMED_FROM], RENAME_LOCK, live), []);
});

// A heading that was genuinely renamed leaves nothing behind, so the falsifier has to let
// that case through while rejecting the one above.
test('a loss from a section that no longer exists is still a rename', () => {
  const live = new Set(['PRODUCT_BACKLOG.md|bl-007-ranks-forty-six', 'PRODUCT_BACKLOG.md|item-details']);

  assert.equal(scopeRenames([RENAMED_TO], [RENAMED_FROM], RENAME_LOCK, live).length, 1);
});

// The falsifier is scoped per document. Another document keeping a section of the same
// name says nothing about this one, and treating the scope name as global would refuse
// every rename of a heading whose slug happens to be shared.
test('a section of the same name in another document does not block the pairing', () => {
  const live = new Set(['docs/UX_STUDY.md|bl-007-ranks-forty-fif']);

  assert.equal(scopeRenames([RENAMED_TO], [RENAMED_FROM], RENAME_LOCK, live).length, 1);
});

// The fingerprint is what makes the pairing a statement of fact rather than a guess. Same
// heading rename, same anchor, but the lines behind it now say something else: that is a
// citation whose claim has to be read again, and calling it a rename would say it need
// not be.
test('a scope rename over content that changed is not a rename', () => {
  const moved = { ...RENAMED_TO, fp: 'ffffffffffffffff' };

  assert.deepEqual(scopeRenames([moved], [RENAMED_FROM], RENAME_LOCK), []);
});

// Two anchors that resolve to nothing are not equal, they are both unreadable. Matching
// them would pair citations whose content nobody can compare, which is the one case the
// fingerprint test exists to exclude.
test('two unresolvable anchors do not pair with each other', () => {
  const missing = { ...RENAMED_TO, fp: null, head: null, why: 'file not found' };
  const lock = { [RENAMED_FROM]: { anchor: 'src/js/main.js:116', fp: null, head: null } };

  assert.deepEqual(scopeRenames([missing], [RENAMED_FROM], lock), []);
});

// The count of one on each side is kept from the re-aim pairing, and for the same reason.
// Where two candidates match one identity there is no fact saying which loss explains
// which addition, so the report says nothing rather than picking.
test('two candidates on one side refuse to pair rather than guess', () => {
  const second = { ...RENAMED_TO, key: 'PRODUCT_BACKLOG.md|bl-007-ranks-forty-sev|src/js/main.js:116|0' };

  assert.deepEqual(scopeRenames([RENAMED_TO, second], [RENAMED_FROM], RENAME_LOCK), []);
});

// The document is held rather than dropped, or a citation genuinely lost from one document
// would be explained away by an unrelated new citation of the same lines in another.
test('a loss in one document is not explained by an addition in another', () => {
  const elsewhere = { ...RENAMED_TO, key: 'docs/ARCHITECTURE.md|the-write-path|src/js/main.js:116|0' };

  assert.deepEqual(scopeRenames([elsewhere], [RENAMED_FROM], RENAME_LOCK), []);
});
