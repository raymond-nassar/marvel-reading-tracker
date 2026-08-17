import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { DEFAULT_PORT, HOST } from '../server.mjs';

// The two files a person who does not program actually opens.
//
// Everything they assert is a way the launchers have of failing silently, on a machine nobody
// here is sitting at. A script that does not change directory first runs from wherever the shell
// started, which on Windows is not the project; a .command with Windows line endings is refused
// by the kernel before its first line runs, naming an interpreter the reader never typed; and a
// port set anywhere in either file would open the app on an address the browser files reading
// progress separately under, which is Constraint 5 and the one failure that looks like data loss.
//
// The whole point of these files is that their reader cannot diagnose them, so the checks are
// here instead.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WINDOWS = 'Start on Windows.cmd';
const MACOS = 'Start on macOS.command';

const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
const read = (name) => readFileSync(join(ROOT, name), 'utf8');

// Both files carry more comment than code, and every one of those comments names the thing the
// line below it does, so a search over the raw text finds the explanation rather than the code.
const codeOf = (name) => read(name)
  .split(/\r?\n/)
  .filter((line) => !/^\s*(rem\b|#|::)/i.test(line))
  .join('\n');

// The blob as git holds it, which is what a clone writes out and what a "Download ZIP" contains.
// Reading the working copy instead would measure this machine's checkout settings.
const staged = (name) => execFileSync('git', ['show', `:${name}`], { cwd: ROOT, maxBuffer: 8e6 });

test('both launchers are tracked, so a download has them', () => {
  const tracked = git(['ls-files']).split(/\r?\n/);
  assert.ok(tracked.includes(WINDOWS), `${WINDOWS} is not tracked`);
  assert.ok(tracked.includes(MACOS), `${MACOS} is not tracked`);
});

test('each launcher moves to its own folder before doing anything else', () => {
  // Windows starts a double-clicked script in whatever folder the shell was in, and macOS starts
  // it in the home directory. Either way `node server.mjs` without this is a "Cannot find module"
  // naming a path the reader never typed.
  //
  // Read with the comments removed, because both files explain this in prose above the line that
  // does it, and prose that mentions the command reads to a plain search as the command itself.
  for (const [name, cd] of [[WINDOWS, 'cd /d "%~dp0"'], [MACOS, 'cd "$(dirname "$0")"']]) {
    const code = codeOf(name);
    const moves = code.indexOf(cd);
    const starts = code.indexOf('node server.mjs');
    assert.ok(moves > -1, `${name} never changes to its own folder`);
    assert.ok(starts > -1, `${name} never starts the server`);
    assert.ok(moves < starts, `${name} starts the server before it moves`);
  }
});

test('each launcher starts the same server the documented command starts', () => {
  // Comments stripped here too. The macOS file names the command in the paragraph explaining why
  // it changes directory first, so reading the raw text would pass for a launcher that talks
  // about starting the server and never does.
  for (const name of [WINDOWS, MACOS]) {
    assert.match(codeOf(name), /\bnode server\.mjs\b/, `${name} does not start server.mjs`);
  }
});

// Constraint 5. A launcher is a new way in, and a new way in that lands on a different address is
// a new empty app for anyone who has been using the old one.
test('neither launcher moves the address the app opens on', () => {
  for (const name of [WINDOWS, MACOS]) {
    const code = codeOf(name);
    assert.doesNotMatch(code, /MRT_PORT/, `${name} sets a port, which moves the stored progress`);
    assert.doesNotMatch(code, /localhost/i, `${name} names localhost, which is a separate bucket`);
    assert.doesNotMatch(
      code,
      new RegExp(String.raw`\b\d{4,5}\b`),
      `${name} contains a port number`,
    );
  }
  // Stated here so the pinning above is anchored to the value it is pinning, rather than to a
  // number written twice and free to disagree.
  assert.equal(DEFAULT_PORT, 8787);
  assert.equal(HOST, '127.0.0.1');
});

test('the mac launcher is executable and free of the endings that would stop it running', () => {
  const [mode] = git(['ls-files', '-s', '--', MACOS]).split(/\s+/);
  assert.equal(mode, '100755', `${MACOS} is not executable in the index, so a clone cannot run it`);

  const blob = staged(MACOS);
  assert.ok(blob.subarray(0, 12).toString('utf8').startsWith('#!/bin/bash'), 'no shebang');
  assert.equal(blob.indexOf(0x0d), -1, `${MACOS} carries a carriage return, which macOS reads as part of the interpreter path`);
});

test('the line endings of both launchers are pinned rather than left to whoever clones', () => {
  const attributes = read('.gitattributes');
  assert.match(attributes, /^\*\.cmd text eol=crlf$/m);
  assert.match(attributes, /^\*\.command text eol=lf$/m);
});

test('the windows launcher survives a file that arrived with Unix endings', () => {
  // cmd.exe has never parsed a multi-line parenthesised block reliably without carriage returns,
  // and the reader this file is for arrives by "Download ZIP", where what the archive holds is
  // not this repository's decision. A file of one-line statements runs the same either way.
  const opensBlock = codeOf(WINDOWS).split('\n').filter((line) => /\($/.test(line.trim()));
  assert.deepEqual(opensBlock, [], 'a parenthesised block is only reliable with CRLF endings');
});

test('each launcher says what to do when the thing it needs is missing', () => {
  // The failure that actually happens: a friend double-clicks before installing Node. Without
  // this the window opens and closes in the same frame and there is nothing at all to read.
  for (const name of [WINDOWS, MACOS]) {
    const text = read(name);
    assert.match(text, /nodejs\.org/, `${name} does not say where to get Node.js`);
    assert.match(text, /pause|read -r -p/, `${name} closes its window before the message can be read`);
  }
});
