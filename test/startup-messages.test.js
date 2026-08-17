// The words a reader sees when the tracker will not start.
//
// These are tested because the packaged Windows archive changed who reads them. Until the archive
// existed, every reader of these lines had cloned the repository, so they had npm and a terminal
// and `npm start` was sound advice. The archive carries a runtime and the app and nothing else,
// which is the point of it, and the reader it was built for has installed nothing at all. Advice
// naming a tool that is absent from the download is advice that cannot be followed.
//
// Verified by extraction rather than assumed: the built archive holds 100 files and no
// package.json, so there is no `npm start` in it to run.

import test from 'node:test';
import assert from 'node:assert/strict';

import { HOST, DEFAULT_PORT, badPortMessage, busyPortMessage } from '../server.mjs';

const busy = () => busyPortMessage(HOST, DEFAULT_PORT).join('\n');
const bad = () => badPortMessage('nonsense').join('\n');

// The archive has no package.json, so npm is not a thing its reader can run. This is the assertion
// that fails on the old copy: it printed `set MRT_PORT=8788 && npm start` on the busy port and
// `set MRT_PORT=8787 && npm start` on an unusable one.
test('no startup failure message tells the reader to run npm', () => {
  for (const [name, text] of [['busy port', busy()], ['unusable port', bad()]]) {
    assert.doesNotMatch(text, /\bnpm\b/, `the ${name} message names npm, which the archive does not carry`);
  }
});

// The other half, and the reason this is a defect rather than a wording preference. Reading
// progress is stored by the browser against the exact origin it was saved at, so a reader who
// follows advice to move the port opens an app with nothing in it and has every reason to think
// their reading is gone. test/launcher.test.js forbids the launcher from setting MRT_PORT for this
// same reason; the advice the server prints is held to the rule the launcher already obeys.
test('the busy-port message does not offer a different port as the way out', () => {
  const text = busy();
  assert.doesNotMatch(text, /MRT_PORT/, 'the busy-port message offers a port change, which moves the stored progress');
  assert.doesNotMatch(text, /\b8788\b/, 'the busy-port message names another port to move to');
});

// Refusing is not enough on its own. A reader told only "do not" will do it anyway unless the
// message says what it costs, so the warning has to name the consequence.
test('the busy-port message says what moving the port would cost', () => {
  const text = busy();
  assert.match(text, /different port/, 'the message does not mention a different port at all');
  assert.match(text, /nothing in it/, 'the message does not say the other port opens empty');
});

// The advice that was always correct, and the first thing to try. This is the common case: the
// tracker is already running, and the reader should open it rather than start a second one.
test('the busy-port message points at the address that is already serving', () => {
  const text = busy();
  assert.match(text, new RegExp(`http://${HOST}:${DEFAULT_PORT}/`), 'the message does not name the address to open');
  assert.match(text, /already in use/, 'the message does not say the port is in use');
});

// The case the reader who reported this actually hit: the port was held by a stale server pointed
// at a folder that no longer existed, so the address in the line above answered "Not found". The
// message has to allow for the holder not being the tracker, or that reader is told to open a page
// that will not work and given nothing else to try.
test('the busy-port message covers the port being held by something that is not the tracker', () => {
  const text = busy();
  assert.match(text, /does not show the tracker/, 'the message assumes the holder is the tracker');
  assert.match(text, /Close that\n?\s*program/, 'the message does not say to close the other program');
});

// A message is only useful if it is readable in a console window that the launcher does not widen.
// Eighty is the width cmd.exe opens at by default, and a line past it wraps mid-sentence.
test('every startup failure line fits an unwidened console window', () => {
  for (const [name, lines] of [['busy port', busyPortMessage(HOST, DEFAULT_PORT)], ['unusable port', badPortMessage('nonsense')]]) {
    for (const line of lines) {
      assert.ok(line.length <= 80, `${name} line is ${line.length} characters and wraps: ${line}`);
    }
  }
});

// The unusable-port branch is reached only by someone who set MRT_PORT themselves, so it has to
// tell them how to undo that. Clearing it is the fix; naming a specific number to set instead is
// how the old copy sent a reader to a different origin while trying to help.
test('the unusable-port message tells the reader to clear the variable', () => {
  const text = bad();
  assert.match(text, /clear it/, 'the message does not say to clear MRT_PORT');
  assert.match(text, /"nonsense"/, 'the message does not quote back the value that was rejected');
});
