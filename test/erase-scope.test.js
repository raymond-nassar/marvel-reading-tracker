// What erasing everything reaches, and what it says it reaches.
//
// BL-113 asked which of two promises should win: the erase dialog's claim that it clears
// everything this browser has stored, or the salvage family's rule that nothing but the reader
// removes a copy of data the app could not read. The rule won, so these hold the wording to what
// the route actually does. The behaviour half is in test/storage.test.js, next to the other
// eraseAll tests, because it is a claim about the store rather than about the copy.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { eraseDialogBody, eraseOutcome } from '../src/js/main.js';

// Only the fields the wording reads. A real copy carries chars, at and live as well, and none of
// them changes a sentence: what is said depends on how many there are, not on what is in them.
const copy = (key) => ({ key });
const one = [copy('mrt.state.salvage')];
const two = [copy('mrt.state.salvage'), copy('mrt.state.salvage.1700000000000')];

const HEADING = 'Copies kept after a failed read';

test('with nothing kept aside the dialog still claims everything, because then it is true', () => {
  const body = eraseDialogBody([]);
  assert.match(body, /clears everything this browser has stored for the tracker/);
  assert.match(body, /It cannot be undone\.$/);
  assert.doesNotMatch(body, /kept aside/, 'and it does not raise a subject the reader has no copies in');
});

// The defect the item names. The sentence was true of every state the app can be in except the one
// where something survives, which is the only state in which anyone is misled by it.
test('the dialog stops claiming everything once a copy is being kept aside', () => {
  const body = eraseDialogBody(one);
  assert.doesNotMatch(body, /everything this browser has stored/);
  assert.match(body, /clears every list and all reading progress/);
  assert.match(body, /does not reach it/);
  assert.match(body, /It cannot be undone\.$/, 'the warning is narrowed, not dropped');
});

// Where, not merely whether. A reader told something survived and not told where it is has been
// given a worry rather than a choice, and the copies have their own Remove on the same screen.
test('the dialog says where what survives can be found', () => {
  assert.match(eraseDialogBody(one), new RegExp(`"${HEADING}" above`));
  assert.match(eraseDialogBody(one), /own Remove button/);
});

test('one copy and several copies are counted and agreed with', () => {
  const single = eraseDialogBody(one);
  assert.match(single, /One copy of data this app could not read is kept aside/);
  assert.match(single, /It stays under/);
  assert.match(single, /with its own Remove button/);

  const several = eraseDialogBody(two);
  assert.match(several, /2 copies of data this app could not read are kept aside/);
  assert.match(several, /They stay under/);
  assert.match(several, /with their own Remove button/);
});

// The third answer, and the one a boolean would lose. renderSalvage() already refuses to report an
// empty list when storage declined to enumerate, on the grounds that a refusal to say is not a
// statement that there is nothing. The same refusal must not become a promise here, and it is the
// only direction of this wording that can be wrong in a way that costs the reader data.
test('a browser that will not list its storage is not a browser saying there is nothing', () => {
  const body = eraseDialogBody(null);
  assert.doesNotMatch(body, /everything this browser has stored/);
  assert.match(body, /will not let the app list what else it has stored/);
  assert.match(body, /is not reached/);
});

test('an erase that left nothing behind says so plainly', () => {
  assert.equal(eraseOutcome(false, []), 'All local data erased.');
});

// Byte for byte what shipped before BL-113, because that clause was already right and the item is
// about a different survivor. Pinned rather than assumed: this message is now composed from parts,
// and a composition is exactly where a sentence quietly acquires an extra space or loses a stop.
test('the snapshot sentence is unchanged when the snapshot is the only thing left', () => {
  assert.equal(
    eraseOutcome(true, []),
    'Lists and reading progress erased. One copy could not be removed and is still in this browser, '
      + 'behind "Undo last restore".',
  );
});

test('a salvage copy that survives is named in the message, not only in the dialog', () => {
  const said = eraseOutcome(false, one);
  assert.doesNotMatch(said, /All local data erased/);
  assert.match(said, new RegExp(`One copy kept after a failed read is still here, under "${HEADING}"`));
});

// The two survivors are independent: the snapshot goes when its removal lands, the salvage copies
// never go. So all four combinations are reachable and the message cannot be a choice between two
// strings. This is the combination a ternary cannot express at all.
test('both survivors are reported when both survive', () => {
  const said = eraseOutcome(true, two);
  assert.match(said, /^Lists and reading progress erased\./);
  assert.match(said, /"Undo last restore"/);
  assert.match(said, /2 copies kept after a failed read are still here/);
});

test('a storage that will not enumerate is reported as not having said, in the message too', () => {
  const said = eraseOutcome(false, null);
  assert.doesNotMatch(said, /All local data erased/);
  assert.match(said, /will not list what else it has stored/);
});

// Both sentences send the reader to a heading by name, and a name is a claim about another file.
// Read it from the page rather than trusting it: renaming that section would otherwise leave two
// sentences directing a reader to a heading that is not there, and nothing would notice. The order
// check is the other half of the same claim, because the dialog says "above".
test('the heading the wording names is the heading the page has, and it is above the button', () => {
  const html = readFileSync(new URL('../src/index.html', import.meta.url), 'utf8');
  const heading = html.indexOf(`<h2>${HEADING}</h2>`);
  const button = html.indexOf('id="btn-wipe"');
  assert.ok(heading !== -1, `the page must carry the heading the dialog names: ${HEADING}`);
  assert.ok(button !== -1, 'and the button whose dialog names it');
  assert.ok(heading < button, 'the dialog says "above", so the section has to be above');
  assert.ok(eraseDialogBody(one).includes(`"${HEADING}"`));
  assert.ok(eraseOutcome(false, one).includes(`"${HEADING}"`));
});
// Everything above holds what the two functions say. None of it holds that the button uses them,
// and that gap is not hypothetical: the first version of this file was run against a mutant that
// put the old sentence back at the call site, and every assertion above stayed green. So these
// two read the shipped module, which is what test/shipped-copy.test.js already does for the copy
// that lives outside JavaScript, and for the same reason.
//
// The count is the load-bearing half rather than the match. Reverting the call site does not
// remove the policy, it adds a second copy of the sentence beside it, so a test that only asked
// whether the sentence exists somewhere would pass on the mutant it was written to catch.
test('the erase dialog is built by the policy, not by a literal at the button', () => {
  const src = readFileSync(new URL('../src/js/main.js', import.meta.url), 'utf8');
  const claim = 'This clears everything this browser has stored for the tracker.';

  assert.equal(src.split(claim).length - 1, 1, 'a second copy means a call site is claiming it inline again');
  const policy = src.indexOf('export function eraseDialogBody');
  const next = src.indexOf('export function eraseOutcome');
  const at = src.indexOf(claim);
  assert.ok(policy !== -1 && next > policy, 'the two policies must both still be there, in order');
  assert.ok(at > policy && at < next, 'and the claim has to sit inside the branch that earns it');
  assert.match(src, /body: eraseDialogBody\(store\.salvageCopies\(\)\)/);
});

// The same shape for the message, and the same reason. Asked of storage at the call site rather
// than reusing what the dialog was built from, because the dialog stays open for as long as the
// reader leaves it and another tab can take or remove a copy in that time.
test('the erase message is composed at the button from what storage says then', () => {
  const src = readFileSync(new URL('../src/js/main.js', import.meta.url), 'utf8');
  const plain = "'All local data erased.'";

  assert.equal(src.split(plain).length - 1, 1, 'a second copy means the button is choosing a string again');
  assert.ok(src.indexOf(plain) > src.indexOf('export function eraseOutcome'));
  assert.match(src, /announceIfSaved\(eraseOutcome\(snapshotKept, store\.salvageCopies\(\)\)\)/);
});

// The list the two sentences above send the reader to is painted on arrival at that screen, and
// the erase happens without an arrival because the button is on it. A refused erase can create
// the first copy this browser has held, so the surface naming copies has to be rebuilt before
// the message that names them is said. test/storage.test.js holds the store half of that.
test('the erase route repaints the salvage list, and does it before it speaks', () => {
  const src = readFileSync(new URL('../src/js/main.js', import.meta.url), 'utf8');
  const handler = src.indexOf("$('#btn-wipe')");
  assert.ok(handler !== -1, 'the button has to still be wired');
  const repaint = src.indexOf('renderSalvage();', handler);
  const speak = src.indexOf('announceIfSaved(eraseOutcome(', handler);
  assert.ok(repaint !== -1, 'the erase route has to rebuild the list it now describes');
  assert.ok(repaint < speak, 'and rebuild it before describing it, or the two disagree on screen');
});
