import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LATEST_RELEASE_API_URL,
  UPDATE_CHECK_INTERVAL_MS,
  UPDATE_DOWNLOAD_URL,
  UPDATE_RELEASE_NOTES_URL,
  checkForUpdate,
  compareVersions,
  isUpdateCheckDue,
  normaliseReleaseVersion,
} from '../src/js/lib/updateCheck.js';
import { APP_VERSION } from '../src/js/lib/version.js';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const status = (code) => ({ ok: false, status: code, json: async () => ({}) });
const badJson = () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad json'); } });

test('release versions are normalised from tags and rejected when they are not numeric', () => {
  assert.equal(normaliseReleaseVersion('v1.2.3'), '1.2.3');
  assert.equal(normaliseReleaseVersion('1.2.3'), '1.2.3');
  assert.equal(normaliseReleaseVersion('release-1.2.3'), null);
});

test('version comparison is numeric by segment', () => {
  assert.equal(compareVersions('v1.2.0', APP_VERSION), 1);
  assert.equal(compareVersions(`v${APP_VERSION}`, APP_VERSION), 0);
  assert.equal(compareVersions('v1.0.9', APP_VERSION), -1);
  assert.equal(compareVersions('1.10.0', '1.9.0'), 1);
  assert.equal(compareVersions('not-a-version', APP_VERSION), null);
});

test('the daily gate is due with no timestamp, outside the window, or a future timestamp', () => {
  const now = 10 * UPDATE_CHECK_INTERVAL_MS;
  assert.equal(isUpdateCheckDue(0, now), true);
  assert.equal(isUpdateCheckDue(now - UPDATE_CHECK_INTERVAL_MS - 1, now), true);
  assert.equal(isUpdateCheckDue(now + UPDATE_CHECK_INTERVAL_MS, now), true);
});

test('the daily gate is not due inside the window', () => {
  const now = 10 * UPDATE_CHECK_INTERVAL_MS;
  assert.equal(isUpdateCheckDue(now - UPDATE_CHECK_INTERVAL_MS + 1, now), false);
});

test('a newer release reports the constant download and notes links', async () => {
  const result = await checkForUpdate({
    fetchImpl: async () => ok({ tag_name: 'v9.9.9' }),
    now: () => 1234,
  });

  assert.equal(result.status, 'available');
  assert.equal(result.available, true);
  assert.equal(result.localVersion, APP_VERSION);
  assert.equal(result.latestVersion, '9.9.9');
  assert.equal(result.checkedAt, 1234);
  assert.equal(result.downloadUrl, UPDATE_DOWNLOAD_URL);
  assert.equal(result.releaseNotesUrl, UPDATE_RELEASE_NOTES_URL);
});

test('equal and older releases produce nothing to show', async () => {
  const equal = await checkForUpdate({ fetchImpl: async () => ok({ tag_name: `v${APP_VERSION}` }) });
  const older = await checkForUpdate({ fetchImpl: async () => ok({ tag_name: 'v1.0.0' }) });

  assert.equal(equal.status, 'current');
  assert.equal(equal.available, false);
  assert.equal(equal.latestVersion, APP_VERSION);
  assert.equal(older.status, 'current');
  assert.equal(older.available, false);
  assert.equal(older.latestVersion, '1.0.0');
});

test('a not-due check makes no request', async () => {
  let calls = 0;
  const result = await checkForUpdate({
    fetchImpl: async () => { calls += 1; return ok({ tag_name: 'v9.9.9' }); },
    now: () => 5000,
    lastCheckedAt: 5000,
  });

  assert.equal(calls, 0);
  assert.equal(result.status, 'not-due');
  assert.equal(result.available, false);
});

test('the release request is only the latest-release endpoint', async () => {
  const calls = [];
  await checkForUpdate({
    fetchImpl: async (...args) => {
      calls.push(args);
      return ok({ tag_name: `v${APP_VERSION}` });
    },
    now: () => 1,
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], LATEST_RELEASE_API_URL);
  assert.equal(calls[0].length, 1);
});

test('explicit checks bypass the daily gate', async () => {
  let calls = 0;
  const result = await checkForUpdate({
    fetchImpl: async () => { calls += 1; return ok({ tag_name: 'v9.9.9' }); },
    now: () => 5000,
    lastCheckedAt: 5000,
    force: true,
  });

  assert.equal(calls, 1);
  assert.equal(result.status, 'available');
});

test('network and response failures return a silent failure result', async () => {
  const cases = [
    async () => { throw new TypeError('offline'); },
    async () => status(500),
    async () => status(403),
    async () => badJson(),
    async () => ok({ name: 'missing tag' }),
    async () => ok({ tag_name: 'release' }),
  ];

  for (const fetchImpl of cases) {
    const result = await checkForUpdate({ fetchImpl, now: () => 7000 });
    assert.equal(result.status, 'failed');
    assert.equal(result.available, false);
    assert.equal(result.checkedAt, 7000);
  }
});
