import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

// A workflow step runs third-party code on a runner holding a token for this repository.
// `actions/checkout@v7` is not a version, it is a subscription: the tag is a pointer its owner
// can move, so the build agrees in advance to run whatever they publish next. Pinning a full
// commit revision is what turns that back into a decision someone made once and can be shown to
// have made.
//
// The three properties below are each cheap to lose in a one-line edit and invisible when lost,
// which is why they are held here rather than by the comments beside them.

// Every workflow the repository has, not the one this was written against. An enumeration is a
// list someone has to remember to extend, and a second workflow added later is exactly when the
// pinning discipline would lapse unnoticed. `git ls-files` is how the anchors gate enumerates for
// the same reason, and it inherits the same property: it sees tracked files only. That is right
// here, because a contributor's new workflow reaches CI tracked or not at all, but it means a
// local run cannot judge a file that has not been added yet.
function workflowFiles() {
  const out = execFileSync('git', ['ls-files', '.github/workflows'], { encoding: 'utf8' });
  return out.split(/\r?\n/).filter((line) => /\.ya?ml$/.test(line));
}

const files = workflowFiles().map((path) => ({ path, text: readFileSync(path, 'utf8') }));

// `uses:` in either position: a step opener or a key on its own line.
function usesLines(text) {
  return text.split(/\r?\n/)
    .map((line, index) => ({ line, number: index + 1 }))
    .filter(({ line }) => /^\s*(- )?uses:/.test(line));
}

test('the repository has workflows to check, so a rename cannot empty this file silently', () => {
  assert.ok(files.length > 0, 'git ls-files found at least one workflow');
  const total = files.reduce((sum, f) => sum + usesLines(f.text).length, 0);
  assert.ok(total > 0, `the workflows call at least one action, found ${total}`);
});

test('every action is pinned to a full commit revision, never a tag or a branch', () => {
  for (const { path, text } of files) {
    for (const { line, number } of usesLines(text)) {
      const ref = /uses:\s*(\S+)/.exec(line)[1];
      // A local or reusable-workflow path has no `@` and is not a third-party pin.
      if (!ref.includes('@')) continue;
      const after = ref.slice(ref.indexOf('@') + 1);
      assert.match(
        after,
        /^[0-9a-f]{40}$/,
        `${path} line ${number} calls ${ref}, whose reference "${after}" is not a 40-character `
        + 'commit revision. A tag or branch is a pointer its owner can move after review',
      );
    }
  }
});

test('every pinned revision carries a readable version comment, so the pin is reviewable', () => {
  for (const { path, text } of files) {
    for (const { line, number } of usesLines(text)) {
      if (!/@[0-9a-f]{40}/.test(line)) continue;
      assert.match(
        line,
        /@[0-9a-f]{40}\s+# v\d+\.\d+\.\d+$/,
        `${path} line ${number} pins a revision with no trailing "# vX.Y.Z" comment. Without it `
        + 'nobody can tell what was pinned, and Dependabot has nothing to rewrite when it bumps it',
      );
    }
  }
});

test('no checkout leaves its token behind in the git config', () => {
  const checkouts = [];
  for (const { path, text } of files) {
    const lines = text.split(/\r?\n/);
    lines.forEach((line, index) => {
      if (!/^\s*- uses:\s*actions\/checkout@/.test(line)) return;
      // The step runs to the next line at or below the opener's indentation.
      const indent = /^(\s*)- /.exec(line)[1].length;
      const body = [];
      for (let i = index + 1; i < lines.length; i += 1) {
        const next = lines[i];
        if (next.trim() === '') continue;
        const nextIndent = /^(\s*)/.exec(next)[1].length;
        if (nextIndent <= indent) break;
        body.push(next);
      }
      checkouts.push({ path, number: index + 1, body: body.join('\n') });
    });
  }

  assert.ok(checkouts.length > 0, 'at least one checkout step was found to check');
  for (const { path, number, body } of checkouts) {
    assert.match(
      body,
      /persist-credentials:\s*false/,
      `the checkout at ${path} line ${number} does not set persist-credentials: false, so its `
      + 'token is written into the git config where every later step can read it',
    );
  }
});

test('no install step runs the dependency graph lifecycle scripts', () => {
  const installs = [];
  for (const { path, text } of files) {
    text.split(/\r?\n/).forEach((line, index) => {
      if (/\bnpm (ci|install)\b/.test(line)) installs.push({ path, number: index + 1, line });
    });
  }

  assert.ok(installs.length > 0, 'at least one install command was found to check');
  for (const { path, number, line } of installs) {
    assert.match(
      line,
      /--ignore-scripts/,
      `${path} line ${number} installs without --ignore-scripts. A manifest is contributor `
      + 'editable, so an install script is arbitrary code a pull request can run before review',
    );
  }
});

// The claim in the workflow's own comment, which is the one thing here a reader is asked to take
// on trust. Measured at the time of pinning: 0 of 91. If a package with an install script ever
// enters the lockfile this turns red, which is the moment the decision above needs revisiting
// rather than a moment to discover it silently stopped being free.
test('the locked graph declares no install scripts, which is what makes ignoring them free', () => {
  const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
  const packages = Object.entries(lock.packages ?? {});
  assert.ok(packages.length > 0, 'the lockfile lists packages');
  const withScripts = packages.filter(([, meta]) => meta.hasInstallScript).map(([name]) => name);
  assert.deepEqual(
    withScripts,
    [],
    `${withScripts.length} of ${packages.length} locked packages declare an install script `
    + `(${withScripts.join(', ')}). Ignoring scripts now changes what gets installed, so the `
    + 'workflow comment claiming it costs nothing is no longer true and the tooling needs a look',
  );
});
