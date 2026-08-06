import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { APP_VERSION } from '../src/js/lib/version.js';

// The app has no build step, so the version the UI shows is a hand-written constant in
// src/js/lib/version.js while the version npm and any release tag use lives in
// package.json. Nothing mechanical keeps those two honest, and a build that reports a
// number it is not makes every bug report against it misleading. These tests are that
// mechanism: they run in CI, so the pair cannot drift silently.

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('the version the UI reports matches package.json', () => {
  assert.equal(APP_VERSION, pkg.version);
});

test('the version is a plain three-part semantic version', () => {
  // Not a general semver check. The release process tags `v<version>` and the About view
  // prints the string raw, so anything with a pre-release or build suffix would need both
  // of those looked at again first.
  assert.match(APP_VERSION, /^\d+\.\d+\.\d+$/);
});
