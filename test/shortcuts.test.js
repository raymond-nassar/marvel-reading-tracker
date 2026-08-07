import test from 'node:test';
import assert from 'node:assert/strict';

import { isTextEntry, activatesOnEnter, shortcutAllowed } from '../src/js/lib/shortcuts.js';

// Elements are described rather than constructed. The three functions read tagName, type,
// isContentEditable, href and form and nothing else, so a plain object is the whole contract
// and the tests do not need a DOM to state it.
const el = (tagName, extra = {}) => ({ tagName, ...extra });

test('a text field consumes the keystroke, so the app takes nothing from it', () => {
  assert.equal(isTextEntry(el('INPUT', { type: 'text' })), true);
  assert.equal(isTextEntry(el('TEXTAREA')), true);
  assert.equal(shortcutAllowed(el('INPUT', { type: 'text' }), 'd'), false);
  assert.equal(shortcutAllowed(el('TEXTAREA'), 'Enter'), false);
});

test('every search box in the app is text entry', () => {
  // Five of the app's inputs are type="search" rather than type="text", and the reading view's
  // own filter sits beside them, so treating only "text" as typing would leak D into all five.
  assert.equal(isTextEntry(el('INPUT', { type: 'search' })), true);
  assert.equal(isTextEntry(el('INPUT', { type: 'url' })), true);
});

test('an unknown or missing input type is treated as text, the way the platform treats it', () => {
  assert.equal(isTextEntry(el('INPUT')), true);
  assert.equal(isTextEntry(el('INPUT', { type: 'quantum' })), true);
});

test('a select is text entry, because a letter is type-ahead there', () => {
  assert.equal(isTextEntry(el('SELECT')), true);
  assert.equal(shortcutAllowed(el('SELECT'), 'd'), false);
});

test('contentEditable is text entry whatever the tag says', () => {
  assert.equal(isTextEntry(el('DIV', { isContentEditable: true })), true);
  assert.equal(shortcutAllowed(el('DIV', { isContentEditable: true }), 'd'), false);
});

test('a button is not text entry, so D still works while one holds focus', () => {
  // The defect this module exists to fix. Clicking "Done, next" leaves that button focused, and
  // the old guard refused every shortcut there, so the advertised D died after the first click.
  const doneButton = el('BUTTON');
  assert.equal(isTextEntry(doneButton), false);
  assert.equal(shortcutAllowed(doneButton, 'd'), true);
  assert.equal(shortcutAllowed(doneButton, 'D'), true);
});

test('a checkbox and a radio keep their letters, because neither spends one', () => {
  // The reading view's filter is five radios. Focusing one used to kill D as well.
  assert.equal(isTextEntry(el('INPUT', { type: 'radio' })), false);
  assert.equal(shortcutAllowed(el('INPUT', { type: 'radio' }), 'd'), true);
  assert.equal(shortcutAllowed(el('INPUT', { type: 'checkbox' }), 'd'), true);
});

test('Enter is left to whatever the browser would activate, so one press is never two actions', () => {
  assert.equal(activatesOnEnter(el('BUTTON')), true);
  assert.equal(activatesOnEnter(el('SUMMARY')), true);
  assert.equal(activatesOnEnter(el('A', { href: 'https://marvel.com' })), true);
  for (const target of [el('BUTTON'), el('SUMMARY'), el('A', { href: 'https://marvel.com' })]) {
    assert.equal(shortcutAllowed(target, 'Enter'), false);
    assert.equal(shortcutAllowed(target, 'd'), true, 'only Enter is spoken for');
  }
});

test('an anchor with no href activates on nothing, so Enter stays with the app', () => {
  // The hero's issue-page link drops its href when the issue has no marvel.com page.
  assert.equal(activatesOnEnter(el('A')), false);
  assert.equal(shortcutAllowed(el('A'), 'Enter'), true);
});

test('a file input activates on Enter even though it takes no letters', () => {
  assert.equal(isTextEntry(el('INPUT', { type: 'file' })), false);
  assert.equal(activatesOnEnter(el('INPUT', { type: 'file' })), true);
  assert.equal(shortcutAllowed(el('INPUT', { type: 'file' }), 'Enter'), false);
  assert.equal(shortcutAllowed(el('INPUT', { type: 'file' }), 'd'), true);
});

test('a control inside a form leaves Enter alone, because Enter submits the form', () => {
  const radioInForm = el('INPUT', { type: 'radio', form: { id: 'form-home-q' } });
  assert.equal(activatesOnEnter(radioInForm), true);
  assert.equal(shortcutAllowed(radioInForm, 'Enter'), false);
  assert.equal(shortcutAllowed(radioInForm, 'd'), true);
});

test('a plain container holds no keys at all', () => {
  for (const target of [el('BODY'), el('DIV'), el('LI'), el('OL')]) {
    assert.equal(isTextEntry(target), false);
    assert.equal(activatesOnEnter(target), false);
    assert.equal(shortcutAllowed(target, 'Enter'), true);
    assert.equal(shortcutAllowed(target, 'd'), true);
  }
});

test('no focused element at all is not a reason to refuse', () => {
  // document.activeElement is null in a document that has not been interacted with.
  assert.equal(isTextEntry(null), false);
  assert.equal(activatesOnEnter(null), false);
  assert.equal(shortcutAllowed(null, 'Enter'), true);
  assert.equal(shortcutAllowed(undefined, 'd'), true);
});

test('tag and type comparisons do not depend on how the caller cased them', () => {
  assert.equal(isTextEntry(el('input', { type: 'TEXT' })), true);
  assert.equal(activatesOnEnter(el('button')), true);
  assert.equal(isTextEntry(el('textarea')), true);
  // The cases above hold whether or not the type is folded, because an unrecognised type falls
  // back to text anyway. Only a type that is meant to be recognised can show the difference.
  assert.equal(isTextEntry(el('INPUT', { type: 'RADIO' })), false);
  assert.equal(activatesOnEnter(el('INPUT', { type: 'FILE' })), true);
});

// The two sets are the whole of the module's knowledge, and a member removed from either is a
// silent behaviour change: an input would start swallowing D, or Enter would fire twice on one
// press. Review found that 11 of the 15 members had no test that would fail if they were deleted,
// so every member is named here rather than a representative few. The inputs carry no form, so
// nothing is covered for them by the implicit-submission fallback.
test('every non-text input type is exempt from text entry, one by one', () => {
  for (const type of ['button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit']) {
    assert.equal(isTextEntry(el('INPUT', { type })), false, `${type} should not be text entry`);
    assert.equal(shortcutAllowed(el('INPUT', { type }), 'd'), true, `d should survive ${type}`);
  }
});

test('every input type the browser activates on Enter stands Enter down, one by one', () => {
  for (const type of ['button', 'file', 'image', 'reset', 'submit']) {
    assert.equal(activatesOnEnter(el('INPUT', { type })), true, `${type} should activate on Enter`);
    assert.equal(shortcutAllowed(el('INPUT', { type }), 'Enter'), false, `Enter should stand down on ${type}`);
    // D is unaffected: only the browser's own use of the key is being avoided.
    assert.equal(shortcutAllowed(el('INPUT', { type }), 'd'), true, `d should survive ${type}`);
  }
});

test('an input type the browser does not activate on Enter leaves Enter to the app', () => {
  // The counterpart to the test above: without this, deleting the whole set would still pass.
  for (const type of ['checkbox', 'radio', 'range', 'color']) {
    assert.equal(activatesOnEnter(el('INPUT', { type })), false, `${type} should not activate on Enter`);
    assert.equal(shortcutAllowed(el('INPUT', { type }), 'Enter'), true, `Enter should survive ${type}`);
  }
});
