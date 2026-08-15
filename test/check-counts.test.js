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
  WORD,
  checkAll,
  checkBlocks,
  checkLedger,
  checkOrdinalHeadings,
  checkRanks,
  checkRepeats,
  derive,
  numberWord,
  ordinalWord,
  wordNumber,
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

// The rank an item holds moves whenever a row is filed above it, which is the same failure the
// derived size above was written to end, arriving one column over. Three of these were pinned and
// all three broke at once when BL-103 and BL-104 were filed above BL-026: the tests failed for a
// reason that had nothing to do with the checker, which is exactly what the note above forbids.
const RANKS = new Map(derive(REAL).ranked.map((r, i) => [r.id, i + 1]));

function rankOf(id) {
  const rank = RANKS.get(id);
  assert.ok(rank, `${id} is no longer a row in the ranked table`);
  return rank;
}

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

// The four tests above all aim at the roadmap's opening paragraph, which is the sentence
// BL-059 was written to. The five below aim at the second one, which makes the same two
// statements about a cohort of the table and was prose. Replaying every revision that
// carried it scores it wrong in 2 of 17, both on 2026-08-13, and wrong in both halves at
// once: nine stated against eight Ready, and eight ids listed for nine Shipped rows.
const COHORT = /(BL-\d+(?:,\s+BL-\d+)*\s+and\s+BL-\d+)\s+have\s+since\s+been\s+delivered,/.exec(REAL);

// The cohort's range, its statuses and its id list are all read from the document, for the
// same reason the whole-table ledger's are. Every one of them changes as the items in the
// range ship, and a pinned copy would fail for a reason that is not the checker's.
const RANGE = /(BL-\d+) through (BL-\d+), come from/.exec(REAL);

function cohortRows() {
  assert.ok(RANGE, 'the cohort range is no longer stated in the roadmap');
  const [lo, hi] = [RANGE[1], RANGE[2]].map((id) => Number(id.slice(3)));
  const d = derive(REAL);
  return [...d.ranked, ...d.parkedRows].filter((r) => {
    const n = Number(r.id.slice(3));
    return n >= lo && n <= hi;
  });
}

function mutateCohort(fn) {
  assert.ok(COHORT, 'the cohort delivered sentence is no longer in the document');
  const ids = [...COHORT[0].matchAll(/BL-\d+/g)].map((m) => m[0]);
  const rebuilt = `${fn(ids).join(', ')} have since been delivered,`;
  return { ids, text: mutate(COHORT[0], rebuilt) };
}

test('a cohort status count carried forward is caught, and the cohort is named', () => {
  const ready = cohortRows().filter((r) => r.status === 'Ready').length;
  const text = mutate(
    `${cap(numberWord(ready))} of them are still \`Ready\``,
    `${cap(numberWord(ready + 7))} of them are still \`Ready\``,
  );
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(
    found[0].message,
    new RegExp(`${ready} rows in ${RANGE[1]} through ${RANGE[2]} are marked Ready, so this should read ${cap(numberWord(ready))}`),
  );
});

// The status name is read from the backticks rather than assumed to be `Ready`, so the
// same sentence written about any other status is checked too. Nothing in the document
// makes that claim today, which is the point: a checker that only knows the statuses now
// in use is the enumeration this repository keeps paying for.
test('a cohort count is checked against whatever status the sentence names', () => {
  const ready = cohortRows().filter((r) => r.status === 'Ready').length;
  const dropped = cohortRows().filter((r) => r.status === 'Dropped').length;
  const text = mutate(
    `${cap(numberWord(ready))} of them are still \`Ready\``,
    `${cap(numberWord(ready))} of them are still \`Dropped\``,
  );
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, new RegExp(`${dropped} rows in .* are marked Dropped`));
});

test('an id missing from the cohort delivered list is caught and named', () => {
  const { ids, text } = mutateCohort((all) => all.filter((id) => id !== all[1]));
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, new RegExp(`missing ${ids[1]}`));
  assert.match(found[0].message, new RegExp(`Shipped row\\(s\\) in ${RANGE[1]} through ${RANGE[2]}`));
});

// The two paragraphs put their id lists on opposite sides of the phrase that carries the
// claim: the first introduces its list with a colon after, the second runs its list in
// before. Reading the sentence the phrase sits in covers both, and this test is what says
// so, because a checker anchored on either side alone passes the other paragraph blind.
test('an open id claimed as delivered is caught in the cohort paragraph too', () => {
  const open = cohortRows().find((r) => r.status !== 'Shipped');
  assert.ok(open, 'every row in the cohort is Shipped, so this mutation has nothing to add');
  const { text } = mutateCohort((all) => [open.id, ...all]);
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, new RegExp(`names ${open.id}, which the table does not mark Shipped`));
});

// A document that describes its own checks writes the shape of a sentence without making
// it, and BL-105's block does exactly that three times. Two things keep those from being
// read as claims. This is the first: the region above the table is the only place a cohort
// is introduced, so nothing below it is a ledger claim however closely it reads as one.
test('a sentence below the table that reads like a ledger claim is not one', () => {
  const at = REAL.indexOf('## The backlog');
  const quoted = /(\w+) of them are still `Ready`/.exec(REAL.slice(at));
  assert.ok(quoted, 'nothing below the table quotes the cohort status shape');
  const ready = cohortRows().filter((r) => r.status === 'Ready').length;
  const wrong = `${cap(numberWord(ready + 3))} of them are still \`Ready\``;
  const text = REAL.slice(0, at) + REAL.slice(at).replace(quoted[0], wrong);
  assert.ok(text !== REAL, 'the mutation did not apply');
  assert.deepEqual(checkLedger(derive(text)), []);
});

// And this is the second: a figure is a claim only when it is written as a number word.
// It is what lets a paragraph above the table quote the shape, which the roadmap does not
// do today but which the checker should not make impossible. The skip runs in the safe
// direction, since a figure that has gone stale is still a number word.
test('a ledger sentence whose figure is not a number word states nothing to check', () => {
  const ready = cohortRows().filter((r) => r.status === 'Ready').length;
  const text = mutate(
    `${cap(numberWord(ready))} of them are still \`Ready\``,
    'Several of them are still `Ready`',
  );
  assert.deepEqual(checkLedger(derive(text)), []);
});

// The same guard on the other shape, which the region scoping cannot stand in for once the
// quotation is written above the table rather than below it. Without it the quoted sentence
// is read as a claim listing no ids at all, and the finding names the whole table. Measured:
// removing the guard alone leaves every test here passing until this one exists.
test('the delivered shape quoted above the table is not read as a delivered claim', () => {
  const text = mutate(
    '`CHANGELOG.md` carries the',
    'The shape being checked is "N items have since been delivered". `CHANGELOG.md` carries the',
  );
  assert.deepEqual(checkLedger(derive(text)), []);
});

// The two tests above rebuild the id list on one line, which destroys the very line break
// the flattening exists to read across, so neither can fail without it. Review measured
// that: joining the roadmap with a newline instead of a space leaves the whole suite green
// and the gate reporting the document clean, while the historical defect this item was
// raised about goes undetected. Dropping an id from the line the sentence wraps on is the
// mutation that keeps the wrap, and it is the one that holds the flattening up.
//
// The wrapped line is found from the sentence's own span rather than from the words it
// happens to break between. Pinning the break to a phrase pins the sentence's wrapping,
// and adding one id to the list moves it: BL-098 did exactly that, and this test failed
// for a reason that had nothing to do with what it checks.
test('an id dropped from the line the cohort sentence wraps on is caught', () => {
  assert.ok(COHORT, 'the cohort delivered sentence is no longer in the document');
  const lines = REAL.split(NL);
  const before = REAL.slice(0, COHORT.index).split(NL).length - 1;
  const after = REAL.slice(0, COHORT.index + COHORT[0].length).split(NL).length - 1;
  assert.ok(after > before, 'the cohort sentence no longer wraps, so this mutation exercises nothing');
  // The final line the sentence spans is excluded, and the line chosen has to carry more than
  // one id. Both are about the mutation applying at all: the list's last id is written after
  // "and" rather than followed by ", ", so dropping it is a no-op, and the tail of the sentence
  // carries no id to drop.
  const w = [...Array(after - before).keys()]
    .map((i) => before + i)
    .reverse()
    .find((i) => (lines[i].match(/BL-\d+/g) ?? []).length > 1);
  assert.ok(w !== undefined, 'no wrapped line carries an id this can drop');
  const ids = [...lines[w].matchAll(/BL-\d+/g)].map((m) => m[0]);
  lines[w] = lines[w].replace(`${ids[0]}, `, '');
  assert.notEqual(lines[w], REAL.split(NL)[w], 'the mutation did not apply');
  const found = checkLedger(derive(lines.join(NL)));
  assert.equal(found.length, 1);
  assert.match(found[0].message, new RegExp(`missing ${ids[0]}`));
});

// An opening ledger the checker cannot read a figure in used to be skipped whole, id list
// and all, with nothing said. Review measured the cost against the version this replaced:
// writing the count as a digit and dropping an id from the list gave two findings there and
// none here. The skip is still right, because a sentence stating no figure lists no ids; it
// is the silence that was wrong.
test('an opening ledger whose figure cannot be read is reported rather than skipped', () => {
  const d = derive(REAL);
  const text = mutate(
    `${cap(numberWord(d.shipped.length))} items have since been delivered`,
    `${d.shipped.length} items have since been delivered`,
  );
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.equal(found[0].claim, 'the delivered ledger');
  assert.match(found[0].message, /neither that count nor its id list is being checked/);
});

test('a rank left over from a smaller table is caught in both halves', () => {
  const d = derive(REAL);
  const rank = rankOf('BL-026');
  const text = mutate(`rank ${rank} of ${RANKED}`, 'rank 15 of 34');
  const found = checkRanks(derive(text)).filter((f) => f.claim === 'rank 15 of 34');
  assert.equal(found.length, 2);
  assert.match(messages(found), new RegExp(`states a table of 34 rows; the ranked table has ${d.ranked.length}`));
  assert.match(messages(found), new RegExp(`puts BL-026 at rank 15; the table puts it at ${rank}`));
});

test('a rank whose subject comes from the nearest heading is still checked', () => {
  // The Case 1 bullet names no id; the subject is the heading above it. Renaming the
  // heading's id changes which item the claim is about, and the checker must follow.
  const rank = rankOf('BL-026');
  const text = mutate(
    `### Case 1: BL-026 is labelled P0 but ranks ${ordinalWord(rank)}`,
    `### Case 1: BL-014 is labelled P0 but ranks ${ordinalWord(rank)}`,
  );
  const found = checkRanks(derive(text));
  assert.ok(found.some(
    (f) => new RegExp(`puts BL-014 at rank ${rank}; the table puts it at ${rankOf('BL-014')}`).test(f.message),
  ));
});

test('an ordinal spelled out in a heading is checked against the table', () => {
  const stated = ordinalWord(rankOf('BL-026'));
  const wrong = ordinalWord(rankOf('BL-026') + 1);
  const text = mutate(
    `BL-026 is labelled P0 but ranks ${stated}`,
    `BL-026 is labelled P0 but ranks ${wrong}`,
  );
  const { findings } = checkAll(text);
  assert.ok(findings.some(
    (f) => new RegExp(`spells BL-026's rank as ${wrong}; the table puts it ${stated}`).test(f.message),
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
  const marked = rankOf('BL-014');
  const subject = rankOf('BL-027');
  const text = mutate(`rank ${marked} of ${RANKED}. Mid-table`, `rank ${marked} of 34. Mid-table ${FROZEN}`)
    .replace(`rank ${subject} of ${RANKED}`, `rank ${subject} of 34`);
  const found = checkRanks(derive(text));
  assert.ok(found.some((f) => /states a table of 34 rows/.test(f.message) && f.claim === `rank ${subject} of 34`));
  assert.ok(!found.some((f) => f.claim === `rank ${marked} of 34`));
});

test('number and ordinal words cover the range the document uses and refuse beyond it', () => {
  assert.equal(numberWord(0), 'zero');
  assert.equal(numberWord(20), 'twenty');
  assert.equal(numberWord(26), 'twenty-six');
  assert.equal(numberWord(30), 'thirty');
  assert.equal(numberWord(61), 'sixty-one');
  assert.equal(numberWord(70), 'seventy');
  assert.equal(numberWord(99), 'ninety-nine');
  assert.equal(numberWord(100), 'a hundred');
  assert.equal(numberWord(101), 'a hundred and one');
  assert.equal(numberWord(110), 'a hundred and ten');
  assert.equal(numberWord(193), 'a hundred and ninety-three');
  assert.equal(numberWord(200), null);
  assert.equal(ordinalWord(1), 'first');
  assert.equal(ordinalWord(16), 'sixteenth');
  assert.equal(ordinalWord(20), 'twentieth');
  assert.equal(ordinalWord(30), 'thirtieth');
  assert.equal(ordinalWord(32), 'thirty-second');
  assert.equal(ordinalWord(70), 'seventieth');
  assert.equal(ordinalWord(92), 'ninety-second');
  assert.equal(ordinalWord(100), 'hundredth');
  assert.equal(ordinalWord(101), 'a hundred and first');
  assert.equal(ordinalWord(134), 'a hundred and thirty-fourth');
  assert.equal(ordinalWord(200), null);
});

// The wording above ninety-nine is a choice, and the wrong choice fails silently: "one
// hundred and ninety-three" is correct English that would never equal what the document
// says, so every comparison against it would read as drift in the document rather than in
// the checker. This pins the spelling to the one place the backlog already uses it.
test('the hundreds are spelled the way the backlog already spells them', () => {
  assert.ok(
    REAL.includes(numberWord(193)),
    `the backlog does not spell 193 as "${numberWord(193)}"`,
  );
});

// A constructed document, against this file's standing preference for mutating the real one,
// and deliberately: what is under test is a size the real backlog has not reached. It holds a
// hundred ranked rows today, so the widest figure it can state is "hundredth", which is a single
// token and reads correctly even under the pattern this replaced. The defect only appears one
// row further on, where the word becomes a phrase.
//
// Every reader of a number word is exercised here rather than only the one that raised it,
// because they failed in three different ways and two of them were silent: the rank heading
// reported drift no wording could satisfy, the delivered count skipped the claim and took the
// whole id list with it, and the Ready count read "two" out of "a hundred and two" and compared
// 2 against 102, which reports the figure the document already states as the figure it should
// have said.
function documentStating(shipped, ready) {
  const ids = [];
  for (let i = 1; i <= shipped + ready; i += 1) ids.push(`BL-${String(i).padStart(3, '0')}`);
  const row = (id, status) => `| ${id} | t | Defect | EP-01 | none | 1 | 1 | 1 | 1 | 1.0 | none | Measured | ${status} | src/js/main.js:1 |`;
  const header = [
    '| ID | Title | Type | Epic | Depends | U | T | R | E | WSJF | P | Conf | Status | Evidence |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |',
  ];
  return {
    ids,
    text: [
      '# Product backlog',
      '',
      `${cap(numberWord(shipped))} items have since been delivered and are marked \`Shipped\` in the table below: ${ids.slice(0, shipped).join(', ')}.`,
      `${cap(numberWord(ready))} of them are still \`Ready\`.`,
      '',
      '## The backlog',
      '',
      ...header,
      ...ids.map((id, i) => row(id, i < shipped ? 'Shipped' : 'Ready')),
      '',
      '### Parked',
      '',
      ...header,
      '',
      '## Item details',
      '',
    ].join('\n'),
  };
}

test('a figure above ninety-nine that the document states correctly is not reported as drift', () => {
  const { ids, text } = documentStating(100, 2);
  const d = derive(text);
  assert.equal(d.ranked.length, 102);
  assert.equal(d.shipped.length, 100);

  const doc = `${text}\n### Case 1: ${ids[100]} is labelled P0 but ranks ${ordinalWord(101)}\n`;
  assert.match(doc, / ranks a hundred and first/, 'the heading under test is not the phrase form');
  assert.deepEqual(checkOrdinalHeadings(derive(doc)), []);
  assert.deepEqual(checkLedger(derive(doc)), []);
});

test('a figure above ninety-nine that the document states wrongly is still caught', () => {
  // The widened patterns have to reach further without becoming permissive, and each of the
  // three is wrong here by one, which is the smallest error any of them can carry.
  const { ids, text } = documentStating(100, 2);
  const wrongLedger = text
    .replace(`${cap(numberWord(100))} items`, `${cap(numberWord(101))} items`)
    .replace(`${cap(numberWord(2))} of them`, `${cap(numberWord(102))} of them`);
  const found = checkLedger(derive(wrongLedger));
  assert.match(messages(found), /should read A hundred/);
  assert.match(messages(found), /should read Two/);

  const doc = `${text}\n### Case 1: ${ids[100]} is labelled P0 but ranks ${ordinalWord(102)}\n`;
  const headings = checkOrdinalHeadings(derive(doc));
  assert.equal(headings.length, 1);
  assert.match(messages(headings), new RegExp(`spells ${ids[100]}'s rank as a hundred and second`));
});

// The ceiling is the reason the table has to stay ahead of the document rather than level
// with it. These two assertions fail the moment the backlog grows past what the words
// reach, which is a build failure rather than a checker that stops checking, and that is
// the whole point of refusing instead of falling back to digits.
test('the words reach past every figure the document actually states', () => {
  const d = derive(REAL);
  assert.notEqual(numberWord(d.shipped.length), null);
  assert.notEqual(ordinalWord(d.ranked.length), null);
});

// The two assertions above pin how far the words are written, and on their own that is half a
// guarantee. Extending the writers past ninety-nine left all three readers still stopping there,
// and both assertions stayed green throughout, because neither of them looks at a reader. The
// readers are held to the writers here instead of to a number, so extending one without the other
// is what goes red rather than the next document that states the figure.
test('every word the checker writes can be read back by the checker', () => {
  const shape = new RegExp(`^${WORD}$`);
  let n = 0;
  for (; numberWord(n) !== null; n += 1) {
    assert.match(numberWord(n), shape, `the patterns cannot match numberWord(${n})`);
    assert.equal(wordNumber(numberWord(n)), n, `wordNumber cannot read numberWord(${n})`);
    assert.match(ordinalWord(n), shape, `the patterns cannot match ordinalWord(${n})`);
  }
  // A reader that stopped early would satisfy the loop above by never being asked, so the
  // distance covered is asserted rather than assumed.
  assert.ok(n > 100, `the words stop at ${n - 1}, which is below the size the table has reached`);
  assert.equal(ordinalWord(n), null, 'the two words must run out together');
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
