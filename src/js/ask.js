// In-page naming and confirmation, replacing prompt() and confirm().
//
// The browser's own dialogs were the wrong tool three times over: they cannot be styled or
// announced through the app's own live region, they block the whole page, and a browser that
// has been told to suppress them returns false from confirm() without asking, so a destructive
// action would quietly fail rather than be confirmed.
//
// One <dialog> serves every question. The focus trap, the Escape key and returning focus to
// whatever opened it are the browser's job, which is the same reason the curated-order preview
// is built this way.

const OK = 'ok';

let pending = null;

function parts() {
  return {
    dlg: document.getElementById('ask'),
    form: document.getElementById('ask-form'),
    title: document.getElementById('ask-title'),
    body: document.getElementById('ask-body'),
    field: document.getElementById('ask-field'),
    label: document.getElementById('ask-label'),
    input: document.getElementById('ask-input'),
    areaField: document.getElementById('ask-area-field'),
    areaLabel: document.getElementById('ask-area-label'),
    area: document.getElementById('ask-area'),
    ok: document.getElementById('ask-ok'),
    cancel: document.getElementById('ask-cancel'),
  };
}

// Called once at start-up. The close listener lives here rather than being added per question,
// so a question that is answered twice, by submitting as Escape is pressed, cannot resolve twice.
export function wireAsk() {
  const { dlg, cancel, input, area } = parts();
  if (!dlg) return;
  cancel.addEventListener('click', () => dlg.close(''));
  dlg.addEventListener('close', () => {
    const settle = pending;
    pending = null;
    // The typed value is read here, while the dialog is closing, rather than by the caller
    // after it has awaited: the field is shared, so the next question would otherwise be able
    // to overwrite an answer that had not been read yet.
    if (settle) settle({ ok: dlg.returnValue === OK, value: input.value, area: area ? area.value : '' });
  });
}

// Resolves when the reader answers. Escape and Cancel both count as backing out, which is what
// makes the destructive default "no".
function open({ title, body, confirmLabel, prefill = null, inputLabel = '', multiline = false }) {
  const { dlg, title: h, body: p, field, label, input, areaField, areaLabel, area, ok } = parts();
  if (!dlg || pending) return Promise.resolve({ ok: false, value: '', area: '' });

  h.textContent = title;
  p.textContent = body;
  p.hidden = !body;
  ok.textContent = confirmLabel;

  const asksForText = prefill !== null && !multiline;
  const asksForNote = prefill !== null && multiline;
  field.hidden = !asksForText;
  input.required = asksForText;
  label.textContent = asksForText ? inputLabel : '';
  input.value = asksForText ? prefill : '';

  // Never required. An emptied note is the reader deleting it, which is a real answer and has to
  // be submittable; `required` would refuse the submit and leave them with no way to clear it.
  if (areaField) {
    areaField.hidden = !asksForNote;
    areaLabel.textContent = asksForNote ? inputLabel : '';
    area.value = asksForNote ? prefill : '';
  }

  // Cleared rather than trusted to be. Escape closes the dialog without touching returnValue
  // in browsers that predate the change making it "", so a question answered with Escape
  // would otherwise inherit the "ok" left behind by the last one that was confirmed. That
  // turns a cancelled deletion into a deletion.
  dlg.returnValue = '';

  const answered = new Promise((resolve) => { pending = resolve; });
  try {
    dlg.showModal();
  } catch {
    // An already-open dialog throws. Leaving `pending` set would wedge every later question,
    // because open() refuses to run while one is outstanding.
    pending = null;
    return Promise.resolve({ ok: false, value: '', area: '' });
  }
  if (asksForText) input.select();
  if (asksForNote) area.select();
  return answered;
}

export async function askConfirm({ title, body = '', confirmLabel = 'Confirm' }) {
  const { ok } = await open({ title, body, confirmLabel });
  return ok;
}

// Resolves the typed name, or null if the reader backed out. An all-whitespace name resolves
// null rather than being saved, matching what every caller already guarded against when this
// was prompt().
export async function askText({ title, body = '', label, value = '', confirmLabel = 'Save' }) {
  const { ok, value: typed } = await open({ title, body, confirmLabel, prefill: value, inputLabel: label });
  return ok ? typed.trim() || null : null;
}

// Returns the typed note, or null if the reader backed out. Unlike askText, an emptied field
// resolves to "" rather than null, because clearing a note and cancelling are different answers
// and the caller has to be able to tell them apart. askText cannot: it folds both to null, which
// is correct for a name, since a list with no name is not a thing the reader can ask for.
export async function askNote({ title, body = '', label, value = '', confirmLabel = 'Save note' }) {
  const { ok, area } = await open({
    title, body, confirmLabel, prefill: value, inputLabel: label, multiline: true,
  });
  return ok ? area.trim() : null;
}
