import test from 'node:test';
import assert from 'node:assert/strict';

// `src/js/ask.js` replaced `prompt()` and `confirm()` and had no test at all. Its comments name
// four separate ways it can go wrong, and every one of them is a path that only runs when
// something has already happened out of order: a question answered twice, a question answered
// while another is outstanding, a dialog that refuses to open, and a return value left behind by
// the previous question. The repository's instructions say that is where the risk is, and until
// now none of it was covered.
//
// The module keeps one `pending` at module scope, so each test imports its own copy through a
// cache-busting query rather than sharing one and inheriting the last test's half-answered state.
let freshCount = 0;
async function freshAsk() {
  freshCount += 1;
  return import(`../src/js/ask.js?case=${freshCount}`);
}

function makeElement(extra = {}) {
  const listeners = new Map();
  return {
    textContent: '',
    hidden: false,
    value: '',
    required: false,
    selected: 0,
    select() {
      this.selected += 1;
    },
    addEventListener(type, fn) {
      if (!listeners.has(type)) listeners.set(type, []);
      listeners.get(type).push(fn);
    },
    fire(type) {
      for (const fn of listeners.get(type) ?? []) fn();
    },
    ...extra,
  };
}

// A <dialog> closed by the Cancel button carries a return value; one closed with Escape does not
// touch `returnValue` in the browsers the module's comment is written against. Keeping those two
// distinct is the whole point of the double, because it is the difference the stale-value bug
// turns on.
function makeDialog() {
  const dlg = makeElement({
    returnValue: '',
    isOpen: false,
    showModalCalls: 0,
    showModal() {
      this.showModalCalls += 1;
      if (this.isOpen) throw new Error('dialog is already open');
      this.isOpen = true;
    },
    close(value) {
      if (value !== undefined) this.returnValue = value;
      this.isOpen = false;
      this.fire('close');
    },
    pressEscape() {
      this.isOpen = false;
      this.fire('close');
    },
  });
  return dlg;
}

function installDom({ withDialog = true } = {}) {
  const parts = {
    ask: withDialog ? makeDialog() : null,
    'ask-form': makeElement(),
    'ask-title': makeElement(),
    'ask-body': makeElement(),
    'ask-field': makeElement(),
    'ask-label': makeElement(),
    'ask-input': makeElement(),
    'ask-ok': makeElement(),
    'ask-cancel': makeElement(),
  };
  globalThis.document = { getElementById: (id) => parts[id] ?? null };
  return parts;
}

function clearDom() {
  delete globalThis.document;
}

// A question that is never settled is the failure mode most of these tests are hunting: drop the
// line that clears `pending` on a failed open, or the one that clears it before settling, and a
// question's promise stays unsettled forever. Awaited directly that hangs the run rather than
// failing it, and `node --test` applies no per-test timeout of its own, so the job would be killed
// hours later having reported nothing. Every question promise is awaited through here instead.
function within(promise, label, ms = 2000) {
  let timer;
  const capped = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms waiting for ${label}`)), ms);
  });
  return Promise.race([Promise.resolve(promise).finally(() => clearTimeout(timer)), capped]);
}

async function wired(opts) {
  const parts = installDom(opts);
  const ask = await freshAsk();
  ask.wireAsk();
  return { ...ask, parts, dlg: parts.ask, input: parts['ask-input'] };
}

test('a confirmed question resolves yes and a cancelled one resolves no', async () => {
  try {
    const { askConfirm, dlg } = await wired();

    const yes = askConfirm({ title: 'Delete this list?', confirmLabel: 'Delete' });
    dlg.close('ok');
    assert.equal(await within(yes, 'yes to settle'), true);

    const no = askConfirm({ title: 'Delete this list?', confirmLabel: 'Delete' });
    dlg.close('');
    assert.equal(await within(no, 'no to settle'), false);
  } finally {
    clearDom();
  }
});

test('the Cancel button backs out without the caller wiring anything per question', async () => {
  try {
    const { askConfirm, dlg, parts } = await wired();
    const answer = askConfirm({ title: 'Start fresh?', confirmLabel: 'Start fresh' });
    parts['ask-cancel'].fire('click');
    assert.equal(dlg.isOpen, false);
    assert.equal(await within(answer, 'answer to settle'), false);
  } finally {
    clearDom();
  }
});

// This is the failure the `dlg.returnValue = ''` line exists to stop, and it is the one with
// teeth: the destructive question is the one people answer with Escape, so inheriting "ok" from
// the last confirmed question turns a cancelled deletion into a deletion.
test('Escape after a confirmed question does not inherit the previous yes', async () => {
  try {
    const { askConfirm, dlg } = await wired();

    const first = askConfirm({ title: 'Rename', confirmLabel: 'Save' });
    dlg.close('ok');
    assert.equal(await within(first, 'first to settle'), true);
    assert.equal(dlg.returnValue, 'ok', 'the double is not reproducing a sticky returnValue');

    const second = askConfirm({ title: 'Delete everything', confirmLabel: 'Delete' });
    dlg.pressEscape();
    assert.equal(await within(second, 'second to settle'), false, 'Escape was read as a confirmation');
  } finally {
    clearDom();
  }
});

// The close listener is added once in `wireAsk` rather than per question, so that a question
// answered by submitting as Escape arrives cannot settle its promise twice.
test('a question closed twice settles once and leaves the next one answerable', async () => {
  try {
    const { askConfirm, dlg } = await wired();

    let settled = 0;
    const answer = askConfirm({ title: 'Delete this list?', confirmLabel: 'Delete' });
    answer.then(() => { settled += 1; });

    dlg.close('ok');
    dlg.close('');
    await within(answer, 'answer to settle');
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(settled, 1);
    assert.equal(await within(answer, 'answer to settle'), true, 'the second close changed an answer already given');

    const next = askConfirm({ title: 'Another', confirmLabel: 'Yes' });
    dlg.close('ok');
    assert.equal(await within(next, 'next to settle'), true, 'the dialog was wedged by the double close');
  } finally {
    clearDom();
  }
});

// One field serves every question, so the typed value is read while the dialog closes rather than
// by the caller after it has awaited. Overwriting the field before the caller reads it must not
// change the answer already given.
test('an answer already given cannot be overwritten by the next question', async () => {
  try {
    const { askText, dlg, input } = await wired();

    const first = askText({ title: 'Rename', label: 'Name', value: 'Old' });
    input.value = 'Typed by the reader';
    dlg.close('ok');

    // The next question resets the shared field before anyone reads the first answer.
    const second = askText({ title: 'Rename again', label: 'Name', value: 'Something else' });
    assert.equal(await within(first, 'first to settle'), 'Typed by the reader');

    dlg.close('');
    assert.equal(await within(second, 'second to settle'), null);
  } finally {
    clearDom();
  }
});

// `open()` refuses to run while a question is outstanding, so if a dialog that fails to open left
// `pending` set, every later question in the session would resolve no without ever being asked.
test('a dialog that refuses to open backs out without wedging every later question', async () => {
  try {
    const { askConfirm, dlg } = await wired();
    dlg.isOpen = true;

    assert.equal(await within(askConfirm({ title: 'Delete', confirmLabel: 'Delete' }), 'the question to settle'), false);
    assert.equal(dlg.showModalCalls, 1);

    dlg.isOpen = false;
    const next = askConfirm({ title: 'Delete', confirmLabel: 'Delete' });
    dlg.close('ok');
    assert.equal(await within(next, 'next to settle'), true, 'the failed open wedged the next question');
  } finally {
    clearDom();
  }
});

test('a second question asked while one is outstanding backs out rather than replacing it', async () => {
  try {
    const { askConfirm, dlg } = await wired();

    const first = askConfirm({ title: 'First', confirmLabel: 'Yes' });
    assert.equal(await within(askConfirm({ title: 'Second', confirmLabel: 'Yes' }), 'the question to settle'), false);
    assert.equal(dlg.showModalCalls, 1, 'the second question opened the dialog over the first');

    dlg.close('ok');
    assert.equal(await within(first, 'first to settle'), true, 'the first question lost its answer to the second');
  } finally {
    clearDom();
  }
});

test('asking on a page with no dialog resolves no rather than throwing', async () => {
  try {
    const { askConfirm, askText, wireAsk } = await wired({ withDialog: false });
    assert.doesNotThrow(() => wireAsk());
    assert.equal(await within(askConfirm({ title: 'Delete', confirmLabel: 'Delete' }), 'the question to settle'), false);
    assert.equal(await within(askText({ title: 'Rename', label: 'Name' }), 'the question to settle'), null);
  } finally {
    clearDom();
  }
});

test('a name is trimmed, and one that is only spaces is refused rather than saved', async () => {
  try {
    const { askText, dlg, input } = await wired();

    const trimmed = askText({ title: 'Rename', label: 'Name', value: 'Old' });
    input.value = '  Uncanny X-Men  ';
    dlg.close('ok');
    assert.equal(await within(trimmed, 'trimmed to settle'), 'Uncanny X-Men');

    const blank = askText({ title: 'Rename', label: 'Name', value: 'Old' });
    input.value = '   ';
    dlg.close('ok');
    assert.equal(await within(blank, 'blank to settle'), null, 'an all-whitespace name was accepted');
  } finally {
    clearDom();
  }
});

test('backing out of a name question discards whatever was typed', async () => {
  try {
    const { askText, dlg, input } = await wired();
    const answer = askText({ title: 'Rename', label: 'Name', value: 'Old' });
    input.value = 'Typed then abandoned';
    dlg.pressEscape();
    assert.equal(await within(answer, 'answer to settle'), null);
  } finally {
    clearDom();
  }
});

// A confirmation and a name question use the same dialog, so the field has to be shown, required
// and selected for one and hidden and not required for the other. Left required while hidden, the
// form would refuse to submit with nothing on screen explaining why.
test('the field is shown and selected for a name, and hidden and optional for a confirmation', async () => {
  try {
    const { askConfirm, askText, dlg, parts, input } = await wired();

    const named = askText({ title: 'Rename', body: 'Pick a name', label: 'Name', value: 'Old' });
    assert.equal(parts['ask-field'].hidden, false);
    assert.equal(input.required, true);
    assert.equal(input.value, 'Old');
    assert.equal(input.selected, 1, 'the prefilled name was not selected for overtyping');
    assert.equal(parts['ask-label'].textContent, 'Name');
    assert.equal(parts['ask-body'].hidden, false);
    dlg.close('');
    await within(named, 'named to settle');

    const confirmed = askConfirm({ title: 'Delete this list?', confirmLabel: 'Delete' });
    assert.equal(parts['ask-field'].hidden, true);
    assert.equal(input.required, false);
    assert.equal(input.value, '');
    assert.equal(parts['ask-title'].textContent, 'Delete this list?');
    assert.equal(parts['ask-ok'].textContent, 'Delete');
    assert.equal(parts['ask-body'].hidden, true, 'an empty body left an empty paragraph on screen');
    dlg.close('');
    await within(confirmed, 'confirmed to settle');
  } finally {
    clearDom();
  }
});
