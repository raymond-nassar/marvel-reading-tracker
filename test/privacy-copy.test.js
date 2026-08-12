import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The network privacy claim is written in six places: a subtitle on Backup and settings, the
// About view's "Your data" section, the README, the security policy, the Cover art card and the
// About view's "Metadata and links only" card. Nothing joined them up, so each could be edited
// while reading only one sixth of what a reader ends up believing, and
// they drifted into disagreeing. The app said nothing is uploaded; the README said correctly that
// details and covers are downloaded; the policy named the downloads and said only that the hosts
// saw "that a request was made", which is the same understatement one level quieter.
//
// The absolute is the easy sentence to write and the hard one to keep true, because every new
// outbound request falsifies it silently. So this holds them to the same shape: name the
// promises that are kept, and name the requests that are made, in every place the subject comes
// up. It fails in both directions, which is the point, since deleting the qualification would
// otherwise read as tightening the promise.
//
// The three full statements carry both halves. The subtitle and the two cards are summaries
// with no room for the requests, so they are held to the absolutes alone. Only the subtitle had
// broken that half; the cards are here because they are where the claim is most natural to
// write, which review demonstrated twice by finding it half written in both.

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

// Markdown between two headings, with the closing heading asserted the way section() asserts its
// delimiter. Slicing on a heading that has been renamed silently returns the whole document, and
// a rule that is satisfied somewhere else in a 500-line file then passes for the wrong reason.
function between(md, startsWith, endsWith) {
  const from = md.indexOf(startsWith);
  assert.notEqual(from, -1, `the document must still carry ${startsWith}`);
  const to = md.indexOf(endsWith, from + startsWith.length);
  assert.notEqual(to, -1, `${startsWith} must still be followed by ${endsWith}`);
  return md.slice(from, to);
}

// Every surface that tells a reader where their data goes. The README is one of them: it is the
// document a new reader starts from and the only one they see before running anything. The
// security policy is another, and the README sends readers to it, so a weaker version of the
// claim there is the same defect in the place a careful reader checks second.
function surfaces() {
  const html = read('src/index.html');
  return [
    ['the About view', section(html, '<h3>Your data</h3>', '<h3>This build</h3>')],
    ['the README', between(read('README.md'), '### Your data stays with you', '## Run it on your computer')],
    ['the security policy', between(read('SECURITY.md'), '## What already reduces risk here', '- The development server')],
  ];
}

// The Backup and settings subtitle is a fourth site of the same claim, and it is where the
// absolute was actually found: it read "Nothing is uploaded." A subtitle has no room to name
// the requests, so holding it to the full shape would only force the qualification somewhere
// it cannot go. It is held to the absolutes instead, which is the half a one-line summary can
// break on its own, and the half it did break.
//
// The Cover art card is the fifth, and it is the natural home of the covers overclaim because
// it is the card that owns the switch. Review found the rule forbidding that claim could not
// reach it: the extraction stopped short of the card at both ends.
//
// The "Metadata and links only" card is the sixth, four cards above the corrected one on the
// same screen, and it said cover images "load directly from Marvel's own servers and can be
// switched off". Two predicates on one subject, the first about loading, so the second reads as
// though the loading is what stops. That is the implication this item spent three rounds
// removing from five other sentences, surviving in the one place nothing reached.
function claimSites() {
  const html = read('src/index.html');
  return [
    ...surfaces(),
    ['the Backup and settings subtitle', section(html, '<h1 id="data-h">', '</div></div>')],
    ['the Cover art card', section(html, '<h2>Cover art</h2>', '</div>')],
    ['the metadata and links card', section(html, '<h3>Metadata and links only</h3>', '</p>')],
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
//
// The disclosure rule needs the verb as well as the noun. "which issues" on its own is a phrase
// this app has every reason to use about itself, so a review showed the disclosing sentence
// could be deleted and the rule still met by a feature bullet describing what the app tracks.
const REQUESTS = [
  ['metadata is fetched', /(?:sends|asks|downloads)[^.]*(?:metadata API|comics database)/i],
  ['the app contacts the API on startup', /(?:starts|opening (?:the app|it))[^.]*reachable/i],
  ['covers are fetched from Marvel', /cover[^.]*Marvel'?s? (?:own )?image servers/i],
  [
    'the requests disclose which issues',
    /(?:sees?|reveals?|discloses?)[^.]*(?:which issues|issues you are looking at|issue numbers)/i,
  ],
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
// in a list are precisely what a request for that issue's details or cover carries. It reads in
// both directions because the promise is as natural to write after the noun as before it, and a
// one-directional pattern let "your lists are never sent anywhere" through.
//
// The last is a different shape of the same error and the one this item shipped by accident: a
// setting was said to stop the cover requests. It does not. setCovers writes a class and
// re-renders, paintCoverUrl assigns img.src with no reference to the setting, and display: none
// does not cancel a fetch. Measured in Edge with the setting off from the first paint: 8
// requests to i.annihil.us, the same 8 as with it on. It is written both ways round and with
// either name for the setting, because the card that owns the switch calls it "covers" and the
// About view calls it "cover art".
//
// The pronoun pair is there because a sentence-scoped pattern is evaded by a full stop. "Your
// lists are yours alone. They are never sent anywhere." is the same promise as the one that was
// removed, and the single-sentence forms miss it entirely.
const ABSOLUTES = [
  /nothing[^.]{0,30}\bis uploaded\b/i,
  /no server sees/i,
  /nothing (?:is )?(?:ever )?(?:sent|leaves)(?! is)/i,
  /(?:never sent|not sent|ever sent|never leaves?)[^.]*\blists?\b/i,
  /\blists?\b[^.]*(?:never sent|not sent|ever sent|never leaves?)/i,
  /\blists?\b[^.]*\.\s*(?:and )?(?:they|these|those)\b[^.]*(?:never sent|not sent|ever sent|never leaves?)/i,
];

// The covers claim needs a different instrument, and the two attempts before this one are the
// argument for its shape. Both looked for the lie, and both lost on the same two sides at once.
//
// A list of patterns for the lie was evaded six ways in a minute, by saying "downloads" or
// "fetches" instead of "requests", by putting a word between "no" and "requests", and by writing
// "switch it off". The same list rejected the most direct honest sentence there is, "the app
// still sends requests", because "ends?" matches inside "sends". Reading sentences instead of
// tokens did no better: requiring a cease-claim meant treating every "no", "nothing" and "never"
// near a request noun as a lie, which is how honest denials are written, so seven true sentences
// were reported as lies, "cannot stop the requests" among them. Pardoning a window that said
// "still" then let three lies through, because "the page still loads instantly" is true and has
// nothing to do with the covers.
//
// A check whose cheapest repair is to weaken the copy is worse than no check, and both attempts
// had that property. So this stops looking for the lie. A window that is about the covers switch
// must acknowledge that the requests continue. There is no lie vocabulary left to evade, since
// nothing is searching for one, and no true sentence can fail for being true, since the only way
// to fail is to leave the acknowledgement out. Every repair is an addition of the truth.
//
// What this does not catch is a window that makes the cease-claim and acknowledges the requests
// in the same breath, which is a contradiction rather than an overclaim, and is a thing for a
// reader to catch. Saying otherwise would be the same overclaim one level up.
//
// The other limit is that "a window about the covers switch" is itself an enumeration, and moving
// the enumeration from the lie to the switch does not abolish it. Review escaped the requirement
// four times by writing "without cover art" and "disable the images", which never reach it. The
// difference from the instruments before is that widening this list is monotone: it can only
// demand the acknowledgement in more places, never accuse a sentence of lying.
const COVERS = /\b(?:cover art|covers?|cover images?|artwork|images?|pictures?)\b/i;
const TURNED_OFF =
  /\b(?:off|hidden|hide|hides|hiding|unchecked|unchecking|unticked|unticking|disable|disabled|disabling|without|suppress(?:ed|es|ing)?|no longer shown)\b/i;
const SWITCHED =
  /\b(?:switch\w*|turn\w*|toggl\w*|uncheck\w*|untick\w*|disabl\w*|hid(?:e|es|den|ing))\b[^.]{0,40}\boff\b/i;
const CLEARED =
  /\b(?:clear|clears|cleared|clearing|uncheck\w*|untick\w*)\b[^.]{0,25}\b(?:checkbox|check box|box|tick)\b/i;

// The forms the truth is actually written in. A form missing here fails a true sentence, and the
// repair is to say it more plainly, never to say less: that asymmetry is the whole design.
//
// Every branch has to name a request, and the gap may not cross a clause boundary. Neither is
// tidiness. Review pardoned three lies with a true clause about something else entirely sitting
// beside them, because "unchanged", "regardless" and "as before" carry no subject: "switching
// cover art off stops them being requested, and your notes are unchanged" passed. Requiring the
// noun left two of those alive, since "requested, and your notes are unchanged" puts the two
// within twenty-one characters of each other. A comma or a semicolon starts a new clause, and an
// acknowledgement in a different clause is about a different subject. All four shipped
// acknowledgements put the noun a few words from the phrase with nothing between.
const ASKED = '(?:requests?|requested|sends?|sent|fetch(?:es|ed|ing)?|downloads?|downloaded|asked|asking)';
const NOT_STOP =
  "(?:cannot|can't|can not|could not|couldn't|does not|doesn't|do not|don't|did not|didn't|will not|won't|would not|wouldn't)\\s+(?:stop|mean|prevent|reduce|change|halt|cancel)\\w*";
const UNCHANGED = '(?:unchanged|regardless|anyway|as before|all the same|no different)';
const GAP = '[^.,;]';
const ACKNOWLEDGES = new RegExp(
  [
    `\\bstill\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\b${NOT_STOP}\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\bwithout stopping\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\bno (?:reduction|change|fewer|difference)\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\b(?:nothing changes?|changes? nothing)\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\b${ASKED}\\b${GAP}{0,30}\\b${UNCHANGED}\\b`,
    `\\b${UNCHANGED}\\b${GAP}{0,30}\\b${ASKED}\\b`,
  ].join('|'),
  'i',
);

function aboutTheSwitch(window) {
  return (
    (COVERS.test(window) && TURNED_OFF.test(window)) ||
    SWITCHED.test(window) ||
    CLEARED.test(window)
  );
}

// Windows of two sentences are read as well as single ones, because a full stop evaded the
// lists promise the same way. The acknowledgement is looked for in the neighbouring sentences
// too: "Switch covers off and every cover becomes a tile. The image is still requested." is a
// perfectly ordinary way to write it, and demanding both halves of one sentence would fail it.
function unacknowledged(text) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  for (let i = 0; i < sentences.length; i += 1) {
    for (const j of [i, i + 1]) {
      if (j >= sentences.length) continue;
      const window = sentences.slice(i, j + 1).join(' ');
      const context = sentences.slice(Math.max(0, i - 1), j + 2).join(' ');
      if (aboutTheSwitch(window) && !ACKNOWLEDGES.test(context)) return window;
    }
  }
  return null;
}

test('no surface reinstates an unqualified claim that nothing is sent', () => {
  for (const [where, text] of claimSites()) {
    for (const absolute of ABSOLUTES) {
      assert.doesNotMatch(text, absolute, `${where} must not claim ${absolute}`);
    }
    assert.equal(
      unacknowledged(text),
      null,
      `${where} writes about the covers switch without saying the covers are still requested`,
    );
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
