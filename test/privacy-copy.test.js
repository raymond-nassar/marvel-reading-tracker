import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The network privacy claim is written in three places: a subtitle on Backup and settings, the
// About view's "Your data" section, and the README. Nothing joined them up, so each could be
// edited while reading only one third of what a reader ends up believing, and they drifted into
// disagreeing. The app said nothing is uploaded; the README said correctly that details and
// covers are downloaded.
//
// The absolute is the easy sentence to write and the hard one to keep true, because every new
// outbound request falsifies it silently. So this holds all three to the same shape: name the
// promises that are kept, and name the requests that are made, in every place the subject comes
// up. It fails in both directions, which is the point, since deleting the qualification would
// otherwise read as tightening the promise.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const read = (p) => readFileSync(join(ROOT, p), 'utf8');

// Prose as a reader sees it: comments and tags dropped, whitespace collapsed.
function prose(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function section(html, startsWith, endsWith) {
  const from = html.indexOf(startsWith);
  assert.notEqual(from, -1, `the markup must still carry ${startsWith}`);
  const to = html.indexOf(endsWith, from + startsWith.length);
  assert.notEqual(to, -1, `${startsWith} must still be followed by ${endsWith}`);
  return prose(html.slice(from, to));
}

// Every surface that tells a reader where their data goes. The README is one of them: it is the
// document a new reader starts from and the only one they see before running anything.
function surfaces() {
  const html = read('src/index.html');
  return [
    ['the About view', section(html, '<h3>Your data</h3>', '<h3>This build</h3>')],
    ['the README', read('README.md').split('## Run it on your computer')[0]],
  ];
}

// Kept, and stated as kept. Each is a promise the code actually honours: no account exists, no
// analytics or tracking is loaded, and neither read state nor notes is ever sent.
const PROMISES = [
  ['there is no account', /no account/i],
  ['there is no analytics or tracking', /no analytics|analytics or tracking|tracking of any kind/i],
  ['progress is never sent', /progress[^.]*never sent|never sent[^.]*progress/i],
];

// Made, and stated as made. A surface that lists the promises and omits these is the absolute
// this item was filed to remove, however carefully the promises themselves are worded. Naming
// the requests is not enough on its own: the README named both downloads and still told a
// reader their lists were never sent, so what the requests disclose has to be stated too.
const REQUESTS = [
  ['metadata is fetched', /metadata|comics database/i],
  ['covers are fetched from Marvel', /cover/i],
  ['the requests disclose which issues', /which issues|issues you are looking at|issue numbers/i],
];

test('every surface that makes the privacy claim keeps the promises and names the requests', () => {
  for (const [where, text] of surfaces()) {
    for (const [what, said] of PROMISES) {
      assert.match(text, said, `${where} must still say ${what}`);
    }
    for (const [what, said] of REQUESTS) {
      assert.match(text, said, `${where} promises without saying ${what}, which is the absolute`);
    }
  }
});

// The absolute itself, in the forms it has actually been written in here. "Nothing is uploaded"
// was on two screens while the README described the two downloads on the same subject, and
// "no server sees your reading progress" claims something the code cannot promise: hydration is
// ordered by what you have not read yet, so the order of those requests is derived from progress
// even though the progress itself never leaves. The last pattern is the README's own version,
// which named both downloads and then promised the lists were not sent, when the issue numbers
// in a list are precisely what a request for that issue's details or cover carries.
const ABSOLUTES = [
  /nothing is uploaded/i,
  /no server sees/i,
  /nothing (?:is )?(?:ever )?(?:sent|leaves)(?! is)/i,
  /(?:never sent|not sent|never leaves)[^.]*\blists?\b/i,
];

test('no surface reinstates an unqualified claim that nothing is sent', () => {
  for (const [where, text] of surfaces()) {
    for (const absolute of ABSOLUTES) {
      assert.doesNotMatch(text, absolute, `${where} must not claim ${absolute}`);
    }
  }
});

// The narrow promises are still allowed to be absolute, because they are true without
// qualification: a theme choice and a reading position genuinely never go anywhere. Losing this
// would make the rule above look satisfiable by deleting the promises instead of qualifying the
// claim, which is the failure it exists to prevent.
test('a promise about one thing may still be absolute, and one still is', () => {
  const html = read('src/index.html');
  const theme = section(html, '<h2>Theme</h2>', '<h2>Metadata source</h2>');
  assert.match(theme, /never sent anywhere/i, 'the theme setting genuinely never leaves');
  assert.doesNotMatch(theme, /nothing is uploaded/i, 'but it is a promise about the setting only');
});
