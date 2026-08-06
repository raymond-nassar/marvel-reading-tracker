import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedApiBase } from '../src/js/lib/apiBase.js';

// The app lets the reader point it at their own metadata service, so this predicate is the
// only thing standing between that setting and where the app sends requests. It is shared by
// the settings form in src/js/main.js and the launch page in src/open.js, which previously
// each carried their own copy and drifted into the same defect. These tests exist so a
// third caller, or an edit to the rule, cannot quietly reopen it.

test('https is allowed for any host, because the reader chooses their own service', () => {
  assert.equal(isAllowedApiBase('https://marvel.emreparker.com/v1'), true);
  assert.equal(isAllowedApiBase('https://localhost'), true);
});

test('plain http is allowed only against the machine the app runs on', () => {
  assert.equal(isAllowedApiBase('http://127.0.0.1:8787/v1'), true);
  assert.equal(isAllowedApiBase('http://localhost:8787'), true);
});

test('the IPv6 loopback is refused, because CSP cannot express it', () => {
  // `[::1]` really is the local machine, but connect-src has no syntax for an IPv6
  // literal and Chrome discards `http://[::1]:*` as an invalid source. Accepting it
  // would store a base that is then blocked at fetch time. See src/js/lib/apiBase.js.
  assert.equal(isAllowedApiBase('http://[::1]:8787'), false);
});

test('plain http to anywhere else is refused', () => {
  assert.equal(isAllowedApiBase('http://marvel.emreparker.com/v1'), false);
  assert.equal(isAllowedApiBase('http://evil.example.com'), false);
});

test('a host that merely starts with localhost is not loopback', () => {
  // `localhost.evil.example.com` resolves wherever its owner points it.
  assert.equal(isAllowedApiBase('http://localhost.evil.example.com'), false);
  assert.equal(isAllowedApiBase('http://127.0.0.1.evil.example.com'), false);
});

test('a scheme that is neither http nor https is refused even on loopback', () => {
  // This is the defect the shared rule was written to close. The previous check read
  // `protocol !== 'https:' && hostname !== 'localhost'`, so naming a loopback host
  // satisfied the second clause and the scheme stopped being checked at all.
  assert.equal(isAllowedApiBase('ftp://localhost'), false);
  assert.equal(isAllowedApiBase('ftp://127.0.0.1'), false);
  assert.equal(isAllowedApiBase('ws://localhost:8787'), false);
  assert.equal(isAllowedApiBase('file://localhost/etc/passwd'), false);
});

test('schemes that carry code rather than an address are refused', () => {
  assert.equal(isAllowedApiBase('javascript:alert(1)'), false);
  assert.equal(isAllowedApiBase('data:text/html,<script>alert(1)</script>'), false);
});

test('anything that is not a parseable absolute URL is refused', () => {
  assert.equal(isAllowedApiBase(''), false);
  assert.equal(isAllowedApiBase('   '), false);
  assert.equal(isAllowedApiBase('marvel.emreparker.com/v1'), false, 'no scheme means no decision can be made');
  assert.equal(isAllowedApiBase('/v1'), false);
  assert.equal(isAllowedApiBase(null), false);
  assert.equal(isAllowedApiBase(undefined), false);
  assert.equal(isAllowedApiBase({}), false);
});

test('the scheme and host are matched case-insensitively', () => {
  // The URL parser lowercases both, so this holds without the rule doing it again.
  assert.equal(isAllowedApiBase('HTTP://LOCALHOST:8787'), true);
  assert.equal(isAllowedApiBase('HTTPS://MARVEL.EMREPARKER.COM/v1'), true);
  assert.equal(isAllowedApiBase('FTP://LOCALHOST'), false);
});
