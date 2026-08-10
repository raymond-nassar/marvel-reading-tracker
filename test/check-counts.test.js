// These tests mutate the real backlog rather than a fixture. A fixture would prove the
// checker can read a document shaped the way the test author imagined, which is the
// shape it is least likely to meet. Every mutation below is a defect this repository
// has actually shipped or nearly shipped: a ledger count carried forward, an id list
// that lost a member, a rank left over from an earlier table, a detail block that was
// never written, and a block duplicated by an edit that meant to move it.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FROZEN,
  checkAll,
  checkBlocks,
  checkLedger,
  checkRanks,
  checkRepeats,
  derive,
  numberWord,
  ordinalWord,
} from '../scripts/check-counts.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REAL = readFileSync(join(ROOT, 'PRODUCT_BACKLOG.md'), 'utf8');

// Read the line ending rather than assuming one. A Windows checkout converts to CRLF and
// CI does not, so a hardcoded "\r\n" in a mutation target matches nothing on CI and the
// test fails there having passed locally. That happened on the first push of BL-062.
const NL = REAL.includes('\r\n') ? '\r\n' : '\n';

// A mutation that silently fails to apply would make its test pass while checking
// nothing, which is the failure mode these tests exist to rule out elsewhere.
function mutate(from, to) {
  assert.ok(REAL.includes(from), `the mutation target is no longer in the document: ${from}`);
  return REAL.replace(from, to);
}

const messages = (findings) => findings.map((f) => f.message).join('\n');

// The size a rank claim is stated against changes whenever an item is added, so a mutation target
// that spells it out has to be hand-edited every time the table grows, and until someone does the
// test fails for a reason that has nothing to do with the checker. Both of these did, when BL-064
// took the table from 39 rows to 40. Deriving it keeps the mutation aimed at the same claim without
// pinning a number the document is expected to change.
const RANKED = derive(REAL).ranked.length;

// The ledger's id list is rebuilt from the ids the document actually names rather than pinned as a
// literal pair, for the same reason the rank size above is derived. A pinned pair assumes no id
// will ever land between the two, which held only while ids shipped in allocation order. BL-007
// shipping broke it: it is an old id that shipped late, so it sorts to the front and the target
// `below:` followed by the id that used to be first stopped existing. BL-017 is still open and
// would do it again. Rebuilding also sidesteps the sentence wrapping, since a pinned pair matches
// nothing when a line break falls between its two ids.
const LEDGER = /delivered and are marked `Shipped` in the table below:[^.]*\./.exec(REAL);

function mutateLedger(fn) {
  assert.ok(LEDGER, 'the delivered-ledger sentence is no longer in the document');
  const ids = [...LEDGER[0].matchAll(/BL-\d+/g)].map((m) => m[0]);
  const rebuilt = `delivered and are marked \`Shipped\` in the table below: ${fn(ids).join(', ')}.`;
  return { ids, text: mutate(LEDGER[0], rebuilt) };
}

test('the real backlog agrees with the table every figure is derived from', () => {
  const { findings } = checkAll(REAL);
  assert.deepEqual(findings, [], `stated figures disagree with the table:\n${messages(findings)}`);
});

test('the derived shape of the real backlog is internally consistent', () => {
  const d = derive(REAL);
  assert.equal(d.headings.length, d.ranked.length + d.parkedRows.length);
  assert.equal(d.shipped.length, d.status.Shipped);
  assert.equal(new Set(d.headings.map((h) => h.id)).size, d.headings.length);
});

test('a delivered count carried forward is caught, and the derived value is named', () => {
  const d = derive(REAL);
  const stale = numberWord(d.shipped.length - 1);
  const text = mutate(
    `${cap(numberWord(d.shipped.length))} items have since been delivered`,
    `${cap(stale)} items have since been delivered`,
  );
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, new RegExp(`${d.shipped.length} rows are marked Shipped`));
  assert.match(found[0].message, new RegExp(cap(numberWord(d.shipped.length))));
});

test('an id missing from the delivered list is caught and named', () => {
  const { ids, text } = mutateLedger((all) => all.filter((id) => id !== all[1]));
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, new RegExp(`missing ${ids[1]}`));
});

test('an id in the delivered list that is not marked Shipped is caught', () => {
  const open = derive(REAL).ranked.find((r) => r.status !== 'Shipped');
  assert.ok(open, 'every ranked row is Shipped, so this mutation has nothing to add');
  const { text } = mutateLedger((all) => [open.id, ...all]);
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, new RegExp(`names ${open.id}, which the table does not mark Shipped`));
});

// Comparing the two sides as sets is the obvious way to write this check and it is blind
// here, because a duplicate is in neither difference. Caught in review of the commit that
// added the checker, on the argument that the edit which writes an id twice is the same
// one that writes a detail block twice, and that had already happened.
test('an id written twice in the delivered list is caught, though it is in neither difference', () => {
  const { ids, text } = mutateLedger((all) => [all[0], ...all]);
  const d = derive(text);
  const found = checkLedger(d);
  assert.equal(found.length, 1);
  assert.match(found[0].message, new RegExp(`names ${ids[0]} more than once`));
  assert.match(found[0].message, new RegExp(`lists ${d.shipped.length + 1} id\\(s\\) for ${d.shipped.length} Shipped row\\(s\\)`));
});

test('a rank left over from a smaller table is caught in both halves', () => {
  const d = derive(REAL);
  const text = mutate(`rank 18 of ${RANKED}`, 'rank 15 of 34');
  const found = checkRanks(derive(text)).filter((f) => f.claim === 'rank 15 of 34');
  assert.equal(found.length, 2);
  assert.match(messages(found), new RegExp(`states a table of 34 rows; the ranked table has ${d.ranked.length}`));
  assert.match(messages(found), /puts BL-026 at rank 15; the table puts it at 18/);
});

test('a rank whose subject comes from the nearest heading is still checked', () => {
  // The Case 1 bullet names no id; the subject is the heading above it. Renaming the
  // heading's id changes which item the claim is about, and the checker must follow.
  const text = mutate(
    '### Case 1: BL-026 is labelled P0 but ranks eighteenth',
    '### Case 1: BL-014 is labelled P0 but ranks eighteenth',
  );
  const found = checkRanks(derive(text));
  assert.ok(found.some((f) => /puts BL-014 at rank 18; the table puts it at 25/.test(f.message)));
});

test('an ordinal spelled out in a heading is checked against the table', () => {
  const text = mutate(
    'BL-026 is labelled P0 but ranks eighteenth',
    'BL-026 is labelled P0 but ranks fifteenth',
  );
  const { findings } = checkAll(text);
  assert.ok(findings.some(
    (f) => /spells BL-026's rank as fifteenth; the table puts it eighteenth/.test(f.message),
  ));
});

test('a row with no detail block is caught, which is the defect BL-057 closed', () => {
  const text = mutate('**BL-055: Record the drift', 'BL-055: Record the drift');
  const found = checkBlocks(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, /has a table row but no detail block heading/);
  assert.equal(found[0].claim, 'BL-055');
});

test('a detail block with no row is caught', () => {
  const text = mutate('**BL-055: Record the drift', '**BL-999: Invented**\n\nstub\n\n**BL-055: Record the drift');
  const found = checkBlocks(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, /has a detail block heading but no table row/);
  assert.equal(found[0].claim, 'BL-999');
});

// The defect these cover is BL-062: BL-054's block stated the same four lines twice, one
// heading and one row, so every check above it agreed the document was sound.
test('a paragraph stated twice over is caught', () => {
  const line = 'because the radio sits outside both rebuilt containers and was never at risk.';
  const text = mutate(line, `${line}${NL}${line}`);
  const found = checkRepeats(text);
  assert.equal(found.length, 1);
  assert.match(found[0].message, /repeats the line above it word for word/);
});

test('a multi-line repeat is reported at its true length, not as one line', () => {
  const pair = 'scroll position, which never moved, so the third task was already satisfied, and '
    + `changing the filter,${NL}because the radio sits outside both rebuilt containers and was `
    + 'never at risk.';
  const text = mutate(pair, `${pair}${NL}${pair}`);
  const found = checkRepeats(text);
  assert.equal(found.length, 1);
  assert.match(found[0].message, /repeats the 2 lines above it word for word/);
});

// Without this the checker would pair the last line of one paragraph with the first line
// of the next whenever a document happened to repeat a short line across the gap.
test('a repeat separated by a blank line is not a repeat', () => {
  const line = 'because the radio sits outside both rebuilt containers and was never at risk.';
  const text = mutate(line, `${line}${NL}${NL}${line}`);
  assert.deepEqual(checkRepeats(text), []);
});

// A fixed ceiling of 8 shipped in the first draft of this check and would have missed a
// duplicated paragraph purely for being long, which is the defect it exists to catch. The
// bound is derived from the longest blank-free run instead, so this fails if that returns.
test('a repeat longer than any fixed window is still caught', () => {
  const block = Array.from({ length: 12 }, (_, i) => `line ${i} of a long duplicated paragraph`);
  const text = `intro${NL}${NL}${block.join(NL)}${NL}${block.join(NL)}${NL}${NL}outro${NL}`;
  const found = checkRepeats(text);
  assert.equal(found.length, 1);
  assert.match(found[0].message, /repeats the 12 lines above it word for word/);
});

// The point of the check is that it needs no exception list. If the real document ever
// grows a legitimate repeat, this fails and the decision gets made deliberately.
test('the document as committed contains no repeat', () => {
  assert.deepEqual(checkRepeats(REAL), []);
});

// BL-081. The walk above compares a block only against the block touching it, so a copy
// that landed anywhere else was invisible. This is the shape that got past it: BL-075's
// draft repeated six lines 45 further down, which put pre-implementation framing after
// the verification numbers that closed the block.
test('a copy that is not next to its original is caught', () => {
  const block = Array.from({ length: 6 }, (_, i) => `line ${i} of a paragraph that was pasted twice`);
  const filler = Array.from({ length: 45 }, (_, i) => `unrelated sentence number ${i} in between`);
  const text = `intro${NL}${NL}${block.join(NL)}${NL}${NL}${filler.join(NL)}${NL}${NL}${block.join(NL)}${NL}`;
  const found = checkRepeats(text);

  assert.equal(found.length, 1);
  assert.match(found[0].message, /repeats the 6 lines at line 3 word for word/);
});

// Claiming happens at all: a six-line block holds four overlapping three-line windows and
// three four-line windows, so a pass that claimed nothing would report the same paste at
// every descending size. This holds that, and only that. It does not hold which copy is
// claimed, because with two copies claiming only the later one gives the same answer; the
// test below is the one that holds that.
test('one duplication is reported once, not once per window inside it', () => {
  const block = Array.from({ length: 8 }, (_, i) => `line ${i} of a paragraph that was pasted twice`);
  const text = `intro${NL}${NL}${block.join(NL)}${NL}${NL}gap${NL}${NL}${block.join(NL)}${NL}`;
  const found = checkRepeats(text);

  assert.equal(found.length, 1);
  assert.match(found[0].message, /repeats the 8 lines at line 3 word for word/);
});

// Both copies are claimed rather than only the later one, and a third copy is what makes
// the difference visible. Claiming only the later leaves the original unclaimed and free to
// pair again, which reports the same paragraph twice carrying the same origin line number,
// reading as two faults where there is one. Measured on this fixture: 1 finding as shipped,
// 2 with the origin claim removed.
test('a paragraph pasted twice over is one finding, not one per later copy', () => {
  const block = Array.from({ length: 6 }, (_, i) => `line ${i} of a paragraph pasted three times`);
  const gap = (tag) => Array.from({ length: 45 }, (_, i) => `${tag} sentence number ${i} in between`);
  const text = ['intro', '', ...block, '', ...gap('first'), '', ...block, '', ...gap('second'), '', ...block].join(NL);
  const found = checkRepeats(text);

  assert.equal(found.length, 1);
  assert.match(found[0].message, /repeats the 6 lines at line 3 word for word/);
});

// The floor of three is what the corpus measures, and it is load-bearing rather than
// cautious. This document alone states the constraint gate line 25 times, and two-line
// repeats are a table header, a fenced command, a criterion line and a bare fence.
test('a repeat shorter than three lines anywhere in the document is left alone', () => {
  const two = `a repeated first line${NL}and a repeated second line`;
  const text = `intro${NL}${NL}${two}${NL}${NL}middle${NL}${NL}${two}${NL}`;

  assert.deepEqual(checkRepeats(text), []);
});

// The blank-line guard matters more once the copies can be anywhere, because a window
// spanning a paragraph break would pair two unrelated paragraphs sharing a short line.
// The unrelated run of three exists so the pass runs at all: the ceiling is derived from
// the longest blank-free run, and with only the two-line halves present that ceiling is
// two, the loop never starts, and the fixture would prove nothing while passing.
test('a distant repeat spanning a blank line is not a repeat', () => {
  const half = `first half of the block${NL}second half of the block`;
  const spanning = `${half}${NL}${NL}tail line of the block`;
  const runOfThree = `unrelated one${NL}unrelated two${NL}unrelated three`;
  const text = `intro${NL}${NL}${runOfThree}${NL}${NL}${spanning}${NL}${NL}filler${NL}${NL}${spanning}${NL}`;
  const found = checkRepeats(text);

  assert.equal(found.length, 0);
});

// Run against the real document with a real paragraph of it pasted 45 lines further down,
// which is the shape and the distance that got past the gate in BL-075's draft. The
// paragraph is located rather than quoted, so this keeps working as the document changes,
// and the locate step asserts rather than silently finding nothing.
test('the shape that got past the gate is caught by the pass added for it', () => {
  const lines = REAL.split(/\r?\n/);

  let start = -1;
  for (let i = 0; i + 6 <= lines.length && start < 0; i += 1) {
    const window = lines.slice(i, i + 6);
    if (window.every((l) => l.trim() !== '') && (i === 0 || lines[i - 1].trim() === '')) start = i;
  }
  assert.ok(start >= 0, 'no blank-free six-line paragraph found to duplicate');

  const paragraph = lines.slice(start, start + 6);
  const at = start + 6 + 45;
  assert.ok(at < lines.length, 'the document is too short to paste 45 lines below');

  const mutated = [...lines.slice(0, at), '', ...paragraph, '', ...lines.slice(at)].join(NL);
  const found = checkRepeats(mutated);

  assert.equal(found.length, 1);
  assert.match(found[0].message, /repeats the 6 lines at line \d+ word for word/);
  assert.equal(found[0].claim, paragraph[0].trim().slice(0, 60));
});

test('a block duplicated by an edit that meant to move it is caught', () => {
  const text = mutate(
    '**BL-057: Write the detail block',
    '**BL-055: Record the drift in the audited figures instead of letting them go stale**\n\n' +
      'stub\n\n**BL-057: Write the detail block',
  );
  const found = checkBlocks(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, /has 2 detail block headings, so one of them is a copy/);
});

test('the frozen marker exempts a claim about a past state, and only that claim', () => {
  const d = derive(REAL);
  assert.ok(
    d.lines.some((l) => l.includes(FROZEN) && /rank 15 of 28/.test(l)),
    'the historical rank in Appendix B should carry the frozen marker',
  );
  // Removing the marker must fail, or the marker is decoration rather than a control.
  const text = REAL.replace(` ${FROZEN}`, '');
  const found = checkRanks(derive(text));
  assert.equal(found.length, 2);
  assert.match(messages(found), /states a table of 28 rows/);
  assert.match(messages(found), /names BL-028, which is not a row in the ranked table/);
});

test('a frozen marker cannot silence a claim on another line', () => {
  const text = mutate(`rank 25 of ${RANKED}. Mid-table`, `rank 25 of 34. Mid-table ${FROZEN}`)
    .replace(`rank 19 of ${RANKED}`, 'rank 19 of 34');
  const found = checkRanks(derive(text));
  assert.ok(found.some((f) => /states a table of 34 rows/.test(f.message) && f.claim === 'rank 19 of 34'));
  assert.ok(!found.some((f) => f.claim === 'rank 25 of 34'));
});

test('number and ordinal words cover the range the document uses and refuse beyond it', () => {
  assert.equal(numberWord(0), 'zero');
  assert.equal(numberWord(20), 'twenty');
  assert.equal(numberWord(26), 'twenty-six');
  assert.equal(numberWord(30), 'thirty');
  assert.equal(numberWord(61), 'sixty-one');
  assert.equal(numberWord(70), null);
  assert.equal(ordinalWord(1), 'first');
  assert.equal(ordinalWord(16), 'sixteenth');
  assert.equal(ordinalWord(20), 'twentieth');
  assert.equal(ordinalWord(30), 'thirtieth');
  assert.equal(ordinalWord(32), 'thirty-second');
  assert.equal(ordinalWord(70), null);
});

test('a document missing one of its three regions fails loudly rather than silently', () => {
  assert.throws(
    () => derive(REAL.replace('## Item details', '## Item detail')),
    /cannot locate the three regions/,
  );
});

function cap(s) {
  return s[0].toUpperCase() + s.slice(1);
}
