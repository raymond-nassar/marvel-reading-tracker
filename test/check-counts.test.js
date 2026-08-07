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
  derive,
  numberWord,
  ordinalWord,
} from '../scripts/check-counts.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REAL = readFileSync(join(ROOT, 'PRODUCT_BACKLOG.md'), 'utf8');

// A mutation that silently fails to apply would make its test pass while checking
// nothing, which is the failure mode these tests exist to rule out elsewhere.
function mutate(from, to) {
  assert.ok(REAL.includes(from), `the mutation target is no longer in the document: ${from}`);
  return REAL.replace(from, to);
}

const messages = (findings) => findings.map((f) => f.message).join('\n');

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
  const text = mutate('BL-052, BL-053,', 'BL-052,');
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, /missing BL-053/);
});

test('an id in the delivered list that is not marked Shipped is caught', () => {
  const text = mutate('BL-026, BL-027,', 'BL-017, BL-026, BL-027,');
  const found = checkLedger(derive(text));
  assert.equal(found.length, 1);
  assert.match(found[0].message, /names BL-017, which the table does not mark Shipped/);
});

test('a rank left over from a smaller table is caught in both halves', () => {
  const d = derive(REAL);
  const text = mutate('rank 16 of 36', 'rank 15 of 34');
  const found = checkRanks(derive(text)).filter((f) => f.claim === 'rank 15 of 34');
  assert.equal(found.length, 2);
  assert.match(messages(found), new RegExp(`states a table of 34 rows; the ranked table has ${d.ranked.length}`));
  assert.match(messages(found), /puts BL-026 at rank 15; the table puts it at 16/);
});

test('a rank whose subject comes from the nearest heading is still checked', () => {
  // The Case 1 bullet names no id; the subject is the heading above it. Renaming the
  // heading's id changes which item the claim is about, and the checker must follow.
  const text = mutate(
    '### Case 1: BL-026 is labelled P0 but ranks sixteenth',
    '### Case 1: BL-014 is labelled P0 but ranks sixteenth',
  );
  const found = checkRanks(derive(text));
  assert.ok(found.some((f) => /puts BL-014 at rank 16; the table puts it at 21/.test(f.message)));
});

test('an ordinal spelled out in a heading is checked against the table', () => {
  const text = mutate(
    'BL-026 is labelled P0 but ranks sixteenth',
    'BL-026 is labelled P0 but ranks fifteenth',
  );
  const { findings } = checkAll(text);
  assert.ok(findings.some(
    (f) => /spells BL-026's rank as fifteenth; the table puts it sixteenth/.test(f.message),
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
  const text = mutate('rank 21 of 36. Mid-table', `rank 21 of 34. Mid-table ${FROZEN}`)
    .replace('rank 17 of 36', 'rank 17 of 34');
  const found = checkRanks(derive(text));
  assert.ok(found.some((f) => /states a table of 34 rows/.test(f.message) && f.claim === 'rank 17 of 34'));
  assert.ok(!found.some((f) => f.claim === 'rank 21 of 34'));
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
