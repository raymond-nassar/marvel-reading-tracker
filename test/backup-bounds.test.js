import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  validateBackup, normalizeIssue, normalizeCover,
  MAX_NAME, MAX_DESCRIPTION, MAX_URL, MAX_ISSUES, MAX_LISTS, MAX_BACKUP_BYTES,
} from '../src/js/lib/model.js';
import { describeSize, backupFileRefusal } from '../src/js/main.js';

// A backup is the one input to this app that a person can hand-edit, and until these caps existed
// every one of them was applied on the way in and skipped on the way back. The numbers below are
// the ones measured against the twelve shipped orders: the longest real title is 72 characters,
// the longest description 800, and the longest cover path 58, so nothing here refuses real data.

const long = (n) => 'x'.repeat(n);

const restore = (backup) => validateBackup({
  schemaVersion: 2, lists: {}, issues: {}, read: {}, notes: {}, overrides: {}, ...backup,
});

test('a restored issue is capped the same way a created one is', () => {
  const v = restore({
    issues: {
      1: {
        issueId: 1,
        title: long(50000),
        seriesName: long(50000),
        description: long(50000),
        creators: [{ name: long(50000), role: long(50000) }],
      },
    },
  });
  assert.equal(v.ok, true);
  const issue = v.state.issues[1];
  assert.equal(issue.title.length, MAX_NAME);
  assert.equal(issue.seriesName.length, MAX_NAME);
  assert.equal(issue.description.length, MAX_DESCRIPTION);
  assert.equal(issue.creators[0].name.length, MAX_NAME);
  assert.equal(issue.creators[0].role.length, MAX_NAME);
});

test('a restored list name and description are capped the same way a created one is', () => {
  const v = restore({
    lists: { a: { id: 'a', name: long(50000), description: long(50000), itemIds: [] } },
  });
  assert.equal(v.ok, true);
  assert.equal(v.state.lists.a.name.length, MAX_NAME);
  assert.equal(v.state.lists.a.description.length, MAX_DESCRIPTION);
});

// Truncating a link produces a link to the wrong page, which is worse than no link, so the two
// URL-shaped fields drop rather than slice. Nothing in the app renders an absent link.
test('an over-long issue url is dropped rather than truncated', () => {
  const issue = normalizeIssue({ issueId: 1, title: 'T', url: `https://x.example/${long(MAX_URL)}` });
  assert.equal(issue.url, null);
});

test('an over-long cover path is refused rather than truncated', () => {
  assert.equal(normalizeCover({ path: `https://x.example/${long(MAX_URL)}`, extension: 'jpg' }), null);
});

test('a real url and cover of ordinary length still survive', () => {
  const issue = normalizeIssue({
    issueId: 1,
    title: 'Ultimate Black Panther (2024) #22',
    url: 'https://www.marvel.com/comics/issue/1',
    cover: { path: 'http://i.annihil.us/u/prod/marvel/i/mg/6/60/abcdef0123456', extension: 'jpg' },
  });
  assert.equal(issue.url, 'https://www.marvel.com/comics/issue/1');
  assert.equal(issue.cover.path, 'https://i.annihil.us/u/prod/marvel/i/mg/6/60/abcdef0123456');
  assert.equal(issue.cover.ext, 'jpg');
});

test('a cover extension is bounded, so a padded one cannot ride in on the filename', () => {
  assert.equal(normalizeCover({ path: 'https://x.example/a', extension: long(50000) }).ext.length <= 8, true);
});

test('a backup declaring more issues than the app can hold is refused before it is built', () => {
  const issues = {};
  const read = {};
  for (let i = 1; i <= MAX_ISSUES + 1; i += 1) { issues[i] = { issueId: i, title: 'T' }; read[i] = true; }
  const v = restore({ issues, read });
  assert.equal(v.ok, false);
  assert.equal(v.state, null);
  assert.ok(v.errors.some((e) => e.includes(String(MAX_ISSUES + 1)) && e.includes(String(MAX_ISSUES))),
    'the refusal names both the declared count and the ceiling');
});

test('a backup declaring more lists than the app can hold is refused', () => {
  const lists = {};
  for (let i = 0; i <= MAX_LISTS; i += 1) lists[`l${i}`] = { id: `l${i}`, name: 'L', itemIds: [] };
  const v = restore({ lists });
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => e.includes('lists')));
});

test('one list declaring more issues than the app can hold is refused', () => {
  const itemIds = Array.from({ length: MAX_ISSUES + 1 }, (_, i) => i + 1);
  const v = restore({ lists: { a: { id: 'a', name: 'L', itemIds } } });
  assert.equal(v.ok, false);
  assert.equal(v.state, null);
});

// The ceiling has to sit above anything the app could itself have written, or it would refuse a
// backup this app produced. Twelve shipped orders come to 507 unique issues, so the honest worst
// case is a twentieth of the ceiling.
test('the largest backup the ceilings permit still restores', () => {
  const issues = {};
  for (let i = 1; i <= MAX_ISSUES; i += 1) issues[i] = { issueId: i, title: 'T' };
  const v = restore({ issues });
  assert.equal(v.ok, true);
  assert.equal(Object.keys(v.state.issues).length, MAX_ISSUES);
});

test('the file-size ceiling sits well above the largest backup this app can write', () => {
  // 1,560,536 characters, measured with all twelve orders imported, every issue read and every
  // issue annotated to the note cap. Four-byte characters throughout would make that about 4.6 MB.
  assert.ok(MAX_BACKUP_BYTES > 1560536 * 4, 'the ceiling must clear the worst honest backup in four-byte characters');
  assert.ok(MAX_BACKUP_BYTES <= 16 * 1024 * 1024, 'a ceiling this generous stops being a bound');
});

test('a file at the ceiling is read and one above it is refused by name and size', () => {
  assert.equal(backupFileRefusal({ size: MAX_BACKUP_BYTES }), null);
  assert.equal(backupFileRefusal({ size: 1560536 }), null, 'the worst honest backup must still be read');
  const refusal = backupFileRefusal({ size: MAX_BACKUP_BYTES + 1 });
  assert.ok(refusal, 'a file over the ceiling must be refused');
  assert.match(refusal, /8\.0 MB/);
  assert.match(refusal, /nothing was changed/);
});

test('a file whose size the browser will not report is read rather than refused', () => {
  // Refusing on an unreadable size would block a restore for a reason the person cannot act on,
  // and the parse that follows already refuses anything that is not a backup.
  assert.equal(backupFileRefusal({}), null);
  assert.equal(backupFileRefusal({ size: NaN }), null);
});

test('the size a refusal reports is readable, and an unknown one says so', () => {
  assert.equal(describeSize(512), '512 bytes');
  assert.equal(describeSize(1536), '1.5 KB');
  assert.equal(describeSize(MAX_BACKUP_BYTES), '8.0 MB');
  assert.equal(describeSize(undefined), 'an unknown size');
  assert.equal(describeSize(-1), 'an unknown size');
});

// The guard is worth nothing if it runs after the read it exists to avoid, so the order of the two
// statements is the property under test, not the presence of either. Both positions are taken
// inside the handler rather than in the whole file: measured before this narrowing, the search hit
// the function's own definition eight hundred lines above and passed with the call deleted.
test('the restore handler asks the size before it reads the file', () => {
  const handler = restoreHandlerSource();
  const guard = handler.indexOf('backupFileRefusal(');
  const read = handler.indexOf('await file.text()');
  assert.ok(guard >= 0, 'the handler must consult the size guard');
  assert.ok(read >= 0, 'the handler must read the file');
  assert.ok(guard < read, 'the size guard must come before the file is read into memory');
});

test('the restore handler clears the picker when it refuses, so the same file can be re-picked', () => {
  const handler = restoreHandlerSource();
  const guard = handler.indexOf('backupFileRefusal(');
  const read = handler.indexOf('await file.text()');
  assert.match(handler.slice(guard, read), /e\.target\.value = ''/);
});

function restoreHandlerSource() {
  const main = readMain();
  const at = main.indexOf("$('#restore-file').addEventListener");
  assert.ok(at > 0, 'the restore file picker handler was not found, so this proves nothing');
  return main.slice(at);
}

function readMain() {
  return readFileSync(new URL('../src/js/main.js', import.meta.url), 'utf8');
}
