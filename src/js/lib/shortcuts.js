// Whether a bare-key shortcut belongs to the app or to the control that has focus.
//
// The reading view claims Enter and D. The handler used to refuse both whenever anything
// interactive held focus, which asks the wrong question. A focused button does nothing at all
// with D, so refusing D there took the shortcut away and gained nothing in exchange. Clicking
// "Done, next" leaves that button focused, so the D the hero advertises died on the press after
// the first click, with no feedback saying why. See UX-D-003 in docs/UX_STUDY.md.
//
// Two separate questions decide it. Does the control consume typed characters, in which case no
// bare-key shortcut can be taken from it at all? And would the browser act on this particular
// key, which for Enter means the reader would get two actions from one press?

// Listed inverted on purpose. An <input> whose type is missing or unrecognised falls back to the
// Text state, so naming the types that are not text keeps this in step with the platform rather
// than drifting behind it as new types are added.
const NON_TEXT_INPUT_TYPES = new Set([
  'button', 'checkbox', 'color', 'file', 'hidden', 'image', 'radio', 'range', 'reset', 'submit',
]);

// Input types the browser activates on Enter.
const ENTER_ACTIVATES_TYPES = new Set(['button', 'file', 'image', 'reset', 'submit']);

const tagOf = (el) => String(el?.tagName ?? '').toUpperCase();
const typeOf = (el) => String(el?.type ?? 'text').toLowerCase();

export function isTextEntry(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  const tag = tagOf(el);
  // A closed <select> answers a letter with type-ahead, which spends the keystroke just as
  // surely as a text field does even though nothing is typed into it.
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') return !NON_TEXT_INPUT_TYPES.has(typeOf(el));
  return false;
}

export function activatesOnEnter(el) {
  if (!el) return false;
  const tag = tagOf(el);
  if (tag === 'BUTTON' || tag === 'SUMMARY') return true;
  // An anchor with no href is neither activatable nor in the tab ring, so this branch is
  // defensive rather than reachable: the hero's issue-page link is hidden by the same render
  // that drops its href, and .btn[hidden] is display:none. Kept because "A" without href is a
  // real HTML state and the predicate should not depend on that render staying as it is.
  if (tag === 'A') return Boolean(el.href);
  if (tag === 'INPUT') {
    if (ENTER_ACTIVATES_TYPES.has(typeOf(el))) return true;
    // Implicit submission: Enter on a control inside a form submits the form, so the app must
    // not act as well. The filter radios sit in a fieldset rather than a form today, but that
    // is a fact about the current markup and not one worth depending on.
    return Boolean(el.form);
  }
  return false;
}

export function shortcutAllowed(el, key) {
  if (isTextEntry(el)) return false;
  if (key === 'Enter' && activatesOnEnter(el)) return false;
  return true;
}
