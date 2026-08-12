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
// nothing is searching for one, and the repair to a refused sentence is to name the covers rather
// than to drop a true word. That is not quite the clean asymmetry it was once claimed to be: five
// of the eleven refusals below repair by moving a parenthetical to the end of the sentence, which
// adds nothing and removes nothing. The refused sentences are listed with their repairs at the foot
// of this file rather than counted here, because a count in prose is a claim nothing checks. An
// absence of false positives is not a property any instrument of this kind will have; knowing which
// ones, by name, is.
//
// What this does not catch is a window that makes the cease-claim and acknowledges the requests
// in the same breath, which is a contradiction rather than an overclaim, and is a thing for a
// reader to catch. Saying otherwise would be the same overclaim one level up. Two passages of that
// shape are listed at the foot of this file as expected escapes, so closing one turns the suite red
// rather than passing silently.
//
// The other limit is that "a window about the covers switch" is itself an enumeration, and moving
// the enumeration from the lie to the switch does not abolish it. Review escaped the requirement
// four times by writing "without cover art" and "disable the images", which reached no pattern
// here, and twice more once "without" was added, by walking past its gap and by naming the images
// rather than the covers. Widening this list is close to monotone but not free: bare "images" and
// "pictures" are here because "disable the images" is how the escape was written, and they cost a
// true sentence that pairs one of them with a hiding word, which has to be reworded rather than
// qualified. "without" is deliberately not in that list for the same reason, and is matched only
// next to a covers term.
//
// "covers" is also a verb, and the collision is not theoretical: "a backup covers every list you
// keep, and nothing in it is hidden from you" was demanded an acknowledgement it has no business
// carrying. Every reading of it as our noun is followed by a preposition or a verb, so what follows
// tells the two apart. What follows the verb is an enumeration and not a rule, which is worth being
// plain about, because "covers everything you keep" and "covers what you keep" are outside the list
// below and are read as the noun. That direction is the affordable one: a word missing here refuses
// a true sentence that then has to be reworded, rather than excusing a false one.
const COVERS =
  /\b(?:cover art|cover images?|cover pictures?|artwork|images?|pictures?|cover|covers(?!\s+(?:a|an|the|every|everything|everyone|all|anything|any|each|both|most|whatever|what|your|my|its|their|you|us)\b))\b/i;
const TURNED_OFF =
  /\b(?:off|hidden|hide|hides|hiding|unchecked|unchecking|unticked|unticking|disable|disabled|disabling|suppress(?:ed|es|ing)?|no longer shown)\b/i;
// Thirty characters, not twenty: "without ever showing you the cover art" needs twenty-two, and
// review walked out through the gap at twenty. "the images" earns its place separately, because
// "without the images, no request goes out" is the switch and "a plain JSON file without images"
// is not, and the article is the only thing that tells them apart.
const WITHOUT_COVERS =
  /\bwithout\b[^.;]{0,30}\b(?:cover art|covers?|cover images?|cover pictures?|artwork|the images?|the pictures?)\b/i;
const SWITCHED =
  /\b(?:switch\w*|turn\w*|toggl\w*|uncheck\w*|untick\w*|disabl\w*|hid(?:e|es|den|ing))\b[^.]{0,40}\boff\b/i;
const CLEARED =
  /\b(?:clear|clears|cleared|clearing|uncheck\w*|untick\w*)\b[^.]{0,25}\b(?:checkbox|check box|box|tick)\b/i;

// The forms the truth is actually written in. A form missing here fails a true sentence, and the
// repair is to say it more plainly rather than to say less. That is the direction worth having,
// though it is not absolute: one refusal at the foot of this file repairs by reordering.
//
// Every branch has to name a request, and the acknowledgement has to be about the covers. Neither
// is tidiness. Review pardoned three lies with a true clause about something else entirely sitting
// beside them, because "unchanged", "regardless" and "as before" carry no subject of their own:
// "switching cover art off stops them being requested, and your notes are unchanged" passed.
//
// Punctuation was tried first as the fix and is the wrong instrument. Measured against the 42 true
// sentences at the foot of this file, refusing a gap that crosses a comma refuses 5 of them, "the
// image is requested, regardless" among them; refusing one that crosses a conjunction refuses 2, and
// a comma splice still walks through needing neither. Those two figures were 7 and 4 for two rounds,
// which was the count against a smaller corpus and read as though it were a property of the
// instruments rather than of what they were run against. What actually separates the two cases is
// the subject: "your notes" is a different one, "regardless" is not a subject at all. So the gap
// crosses anything short of a full stop, and the tie is to the subject instead.
const ASKED =
  '(?:requests?|requested|sends?|sent|fetch(?:es|ed|ing)?|downloads?|downloaded|asks?|asked|asking)';
const NOT_STOP =
  "(?:cannot|can't|can not|could not|couldn't|does not|doesn't|do not|don't|did not|didn't|will not|won't|would not|wouldn't)\\s+(?:stop|mean|prevent|reduce|change|halt|cancel)\\w*";
const UNCHANGED =
  '(?:unchanged|regardless|anyway|(?:exactly )?as before|all the same|no different|continues?|carry on|carries on)';
// This branch stands alone, with no request word beside it, so it has to carry one itself. Left
// bare as "the same number", it pardoned "every list keeps the same number of issues".
const SAME_REQUESTS = '\\bthe same (?:number of )?(?:requests?|fetches|downloads?)\\b';
const GAP = '[^.;]';
const ACKNOWLEDGES = new RegExp(
  [
    `\\bstill\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\b${NOT_STOP}\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\bwithout stopping\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\bno (?:reduction|change|fewer|difference)\\b${GAP}{0,40}\\b${ASKED}\\b`,
    `\\b(?:nothing changes?|changes? nothing)\\b${GAP}{0,40}\\b${ASKED}\\b`,
    SAME_REQUESTS,
    `\\b${ASKED}\\b${GAP}{0,30}\\b${UNCHANGED}\\b`,
    `\\b${UNCHANGED}\\b${GAP}{0,30}\\b${ASKED}\\b`,
  ].join('|'),
  'i',
);

// Which clause is doing the asserting. A trailing clause that makes its own assertion has to name
// the covers itself; one that is a bare adverbial hangs off the clause before it and takes that
// clause's subject. That is the difference between "no cover is requested, your notes are
// unchanged" and "the image is requested, regardless", which are identical to any rule written
// about the punctuation between them.
//
// Deciding that by looking for a finite verb was the obvious way round and it was the wrong way
// round. A finite verb is an open class, so a verb missing from the list made the trailing clause
// look adverbial, the subject was inherited from the lie's own half, and the lie passed. Nothing
// was refused to signal it. Review demonstrated it with "loads", "look", "survive" and "behaves",
// each of which had been caught by the instrument before. So the test is inverted: a trailing
// clause asserts unless it is one of the listed subjectless fragments. Now a fragment missing from
// the list refuses a true sentence, which is loud, repairable, and listed at the foot of this file.
//
// "unchanged" is deliberately not in that list, and it is the one entry where the two directions
// collide. "The requests for covers are, in fact, unchanged" and "no cover is requested, unchanged"
// have the same shape exactly: a head naming the covers and a bare "unchanged" behind a comma.
// Admitting it accepts the first and pardons the second. Refusing it costs the first, which is
// repaired by moving "in fact" to the front of the sentence.
//
// The reference is narrow for the same reason. "them", "they", "these" and "those" stand in for the
// covers; "one" and "each" do not, they are quantifiers, and this repository writes about lists with
// them. Leaving them in pardoned "no cover is requested, and each of your lists is unchanged". The
// price of taking them out is one true sentence, "though each one is requested", which is repaired
// by writing "though each cover is requested".
//
// Walking left instead, so that a subject separated from its verb by a parenthetical could be
// found, was measured and rejected. "The covers, even when hidden, continue to be requested" is a
// real sentence and it is refused. But a leftward walk lends a subject across clause boundaries in
// both directions, and against this corpus it pardons 19 of the 56 false sentences while accepting
// all 11 refusals. A rule that recovers eleven true sentences by excusing nineteen false ones is the
// second instrument returning under a new name.
const ABOUT_COVERS =
  /\b(?:cover art|covers?|cover images?|cover pictures?|artwork|images?|pictures?|them|they|these|those)\b/i;
const ADVERBIAL_ONLY =
  /^\s*(?:and |but |though |although |yet |or |so |even )*(?:regardless|anyway|(?:exactly )?as before|all the same|no different|as always|in fact|even so|either way)\s*$/i;
const CLAUSE_BREAK = /[.;,]/;

function clauseAround(text, index) {
  let start = index;
  while (start > 0 && !CLAUSE_BREAK.test(text[start - 1])) start -= 1;
  let end = index;
  while (end < text.length && !CLAUSE_BREAK.test(text[end])) end += 1;
  return text.slice(start, end);
}

function acknowledges(text) {
  const scan = new RegExp(ACKNOWLEDGES.source, 'gi');
  for (let found = scan.exec(text); found; found = scan.exec(text)) {
    const head = clauseAround(text, found.index);
    const tail = clauseAround(text, found.index + found[0].length - 1);
    const asserting = tail !== head && !ADVERBIAL_ONLY.test(tail) ? tail : head;
    if (ABOUT_COVERS.test(asserting)) return true;
  }
  return false;
}

function aboutTheSwitch(window) {
  return (
    (COVERS.test(window) && TURNED_OFF.test(window)) ||
    SWITCHED.test(window) ||
    CLEARED.test(window) ||
    WITHOUT_COVERS.test(window)
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
      if (aboutTheSwitch(window) && !acknowledges(context)) return window;
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

// The corpus. Everything above is an instrument, and an instrument nobody can re-run is an
// assertion. These four lists were built by eight rounds of review trying to break the rule, and
// until now they lived in a scratch file outside the repository while both the changelog and the
// backlog said a proof would disagree with anyone who closed an escape. Nothing could. They are
// here now, so the claim is true and the counts in those documents are derived rather than
// remembered.
//
// Two of the lists record costs rather than successes, and they are the point of the exercise. A
// check that reports only what it catches is the one that grew the overclaims this item exists to
// undo.

// Written to be true, and every one must pass. Ten are the repaired forms of refusals below. Eight
// must never be treated as being about the covers switch at all, four of them because they use
// "covers" as an ordinary verb.
const HONEST_SENTENCES = [
  'Turning covers off does not mean nothing is requested.',
  'Switch covers off and nothing changes: every cover is requested exactly as before.',
  'Even with cover art off there is no reduction in requests.',
  'Turning cover art off changes nothing about what is requested.',
  'Switching cover art off cannot stop the requests.',
  'Switch covers off and the app still sends requests for every cover.',
  'With cover art off the app still sends the same requests.',
  'Switch covers off and every cover becomes a plain typographic tile, but the image behind it is still requested.',
  'Cover images load directly from Marvel\u2019s own servers. They can be hidden, but they are still requested.',
  'switching cover art off hides the covers but does not stop them being requested',
  'Show cover art',
  'Covers are loaded straight from Marvel\u2019s own servers using the address the metadata API reports.',
  'Turn covers off and the app requests every one of them regardless.',
  'Hiding the covers does not prevent the requests.',
  'Switch covers off and the app requests every one of them anyway.',
  'Without cover art the app still requests every cover.',
  'Cover art is requested from Marvel\u2019s image servers as it appears, so those servers see which issues are on screen; switching cover art off hides the covers but does not stop them being requested.',
  'Switch covers off and every cover becomes a tile. The image is requested, regardless.',
  'Switch covers off and every cover becomes a tile. The image is requested, as before.',
  'Switch covers off and every cover becomes a tile. The image behind it is requested, exactly as before.',
  'Turn cover art off and the app still asks for the image.',
  'Turn cover art off and the requests to Marvel\u2019s image servers continue.',
  'Switch covers off and every cover becomes a tile, but the image is requested and the traffic to Marvel is unchanged.',
  'Switch covers off and every cover becomes a tile. The image is requested and unchanged.',
  'Switch covers off and every cover becomes a tile. The image is requested although you never see it, exactly as before.',
  'Switch covers off and every cover becomes a tile. The image is requested, though hidden, as before.',
  'Switch covers off and nothing on screen is a picture; the requests for the covers are unchanged.',
  'Switch covers off and every cover becomes a tile, but the same requests for covers are made.',
  'Switch covers off and every cover becomes a tile, but the same number of requests for covers goes out.',
  'Switch covers off and no cover is shown, though each cover is requested exactly as before.',
  'Switch covers off and every cover becomes a tile. In fact, the requests for covers are unchanged.',
  'switching cover art off hides the covers, and every cover is requested regardless.',
  'The covers continue to be requested, even when hidden.',
  'Covers are requested regardless, whether shown or hidden.',
  'Cover art is still requested once you switch it off.',
  'The image behind each tile is requested exactly as before, hidden or not.',
  'A backup is a plain JSON file without images.',
  'The tracker works without pictures if you prefer.',
  'A backup covers every list you keep, and nothing in it is hidden from you.',
  'A backup covers everything you keep, and nothing in it is hidden from you.',
  'A backup covers what you keep, and nothing in it is hidden from you.',
  'The export covers anything you have hidden.',
];
// Written to be false, and every one must be caught. Each claims or implies that switching the
// covers off stops the requests. Grouped by the review round that produced them, because the
// grouping is the evidence that each repair was needed rather than imagined.
const DISHONEST_SENTENCES = [
  'Switching cover art off stops the downloads.',
  'Turning cover art off stops the fetches.',
  'Cover art off means no cover requests.',
  "Switch covers off and Marvel's servers are never asked for them.",
  'Switch it off and the requests stop.',
  'Cover art off means nothing is downloaded.',
  'You can switch covers off. Then nothing is requested.',
  'Toggle covers off and the images are no longer fetched.',
  'With cover art off the fetching ceases.',
  'Switching covers off prevents the loading.',
  'Switch covers off and no cover is requested; the page still loads instantly.',
  'Turn covers off and no cover is ever requested, so the list still loads faster.',
  'Unchecking Show cover art means the images are never requested.',
  'Clear the checkbox and no cover is downloaded.',
  'With cover art disabled, no request is made.',
  'Hide the covers and Marvel is never asked for them.',
  'Switch covers off to save bandwidth.',
  'Turning cover art off keeps Marvel from seeing which issues you open.',
  'Without cover art, every cover becomes a plain typographic tile and nothing is requested.',
  'Disable the images and nothing is downloaded.',
  'Cover images load directly from Marvel\u2019s own servers. Without cover art none is requested.',
  'Without cover art, no cover images are downloaded.',
  'Switch covers off and no cover is requested. The address stored is unchanged.',
  'switching cover art off stops them being requested, and your notes are unchanged',
  'Turning cover art off stops the covers being downloaded, and your lists are unchanged.',
  'Switch covers off and nothing is requested. There is no change to your lists.',
  'Switch covers off and nothing is requested. Your lists open exactly as before.',
  'Switch covers off and nothing is requested. Your progress is kept regardless.',
  'Switch covers off and nothing is requested. The tiles look fine anyway.',
  'Switch covers off and nothing is requested. Switching it does not change what you have saved.',
  // A true clause about the metadata requests, pardoning a false one about the covers. Closed by
  // requiring the acknowledgement to be about the covers.
  'Switch covers off and no cover is requested; the details are still fetched.',
  'switching cover art off stops them being requested. The details are still fetched either way.',
  'Turning cover art off stops the covers being requested. The details are still downloaded.',
  // Comma splices and coordinators, which no rule about punctuation ever reached.
  'Switch covers off and no cover is requested, your notes are unchanged.',
  'Switch covers off and no cover is requested, the address stored is unchanged.',
  'Switch covers off and no cover is requested, so the address stored is unchanged.',
  'Switch covers off and no cover is requested. Every list keeps the same number of issues.',
  // The evasions a wider reference would have opened, kept shut by the narrow one.
  'Switch covers off and no cover is requested; the requests to the metadata service are unchanged.',
  'Switch covers off and no cover is requested, though the requests for titles are unchanged.',
  // Two escapes through "without", one past the twenty-character gap and one past the list.
  'Without ever showing you the cover art, nothing is requested.',
  'Without the images, no request goes out to Marvel.',
  // Trailing clauses whose verb was missing from the finite-verb list this round deleted. Every
  // one was caught by the instrument two rounds ago and pardoned by its replacement, which is why
  // the default is now the other way round.
  'Switch covers off and no cover is requested, and the page loads exactly as before.',
  'Switch covers off and no cover is requested, and your saved lists look no different.',
  'Switching cover art off stops them being requested, and your notes survive unchanged.',
  'Turning cover art off stops the covers being requested, and the reader link behaves exactly as before.',
  // Quantifiers read as covers pronouns. This repository writes about lists with "each".
  'Switch covers off and no cover is requested, and each of your lists is unchanged.',
  'Switch covers off and no cover is requested, each list is unchanged.',
  'Switch covers off and no cover is requested; the details are still fetched for each issue.',
  // Bare trailing fragments, built to abuse each entry admitted to ADVERBIAL_ONLY. If one of these
  // passes, a word in that list is inheriting a subject from the clause that told the lie.
  'Switch covers off and no cover is requested, hidden.',
  'Switch covers off and no cover is requested, hidden or not.',
  'Switch covers off and no cover is requested, though hidden.',
  'Switch covers off and no cover is requested, whether shown or hidden.',
  'Switch covers off and no cover is requested, unchanged.',
  'Switch covers off and no cover is requested, in fact.',
  'Switch covers off and no cover is requested, either way.',
  // Recorded as an unclosable escape for two rounds, on the reasoning that binding the
  // acknowledgement to a covers noun would convict the shipped copy. Admitting the pronouns
  // alongside the nouns convicts none of it, and this is caught.
  'Switch covers off and no cover is requested, with the address stored unchanged.',
];
// The two passages this instrument does not catch. Both say a true thing and a false thing in one
// breath, and the true half is what excuses the false one. The first splits them across a full
// stop, which no rule about clauses inside a sentence can reach. The second hangs the true clause
// off the lie with no subject of its own, so it is read as an adverbial of the lie's subject, which
// is exactly what it looks like. A passage that contradicts itself needs a reader, and claiming
// otherwise would be the overclaim this whole item exists to undo.
//
// They are asserted as escaping so that closing one turns this red. That is not a wish for them to
// stay open: a round that closes one should say so and move it up into the list above. What must
// not happen is closing one silently, which is how a limit stops being recorded.
const RECORDED_ESCAPES = [
  'They can be hidden, and then they are not requested at all. Titles and dates are still fetched.',
  'Switch covers off and no cover is requested, or your notes sent, as before.',
];

// True sentences this instrument refuses, with the repair beside each. They fall into three classes,
// and the third is the interesting one.
//
// Four say "the requests" without saying which requests, and two lean on "one" or "each" as a
// pronoun for the covers, which this instrument deliberately does not read as one because "each of
// your lists is unchanged" pardoned a lie with it. All six are repaired by naming the covers, so
// they cost a word.
//
// The other five do name the covers, in the same sentence, but not in the clause that makes the
// assertion: a parenthetical or a coordinator sits between the subject and its verb, leaving clauses
// like "continue to be requested" and "is still requested" with no subject in them at all. Walking
// left to find the subject would accept all five, and it was measured against this corpus: it also
// pardons 19 of the 56 sentences below and accepts all 11 of these refusals, because a leftward walk
// lends a subject across clause boundaries in whichever direction happens to help. All five repair by
// moving the parenthetical to the end, which adds nothing and removes nothing, and is why the comment
// at the head of this file no longer claims every repair adds a word.
//
// Each repaired form is in HONEST_SENTENCES, so this list cannot be satisfied by wording nobody
// would write. Two refusals share a repair, so the eleven have ten distinct repaired forms.
const RECORDED_REFUSALS = [
  ['Switch covers off and nothing on screen is a picture; the requests are unchanged.',
    'Switch covers off and nothing on screen is a picture; the requests for the covers are unchanged.'],
  ['Switch covers off and every cover becomes a tile, but the same requests are made.',
    'Switch covers off and every cover becomes a tile, but the same requests for covers are made.'],
  ['Switch covers off and every cover becomes a tile, but the same number of requests goes out.',
    'Switch covers off and every cover becomes a tile, but the same number of requests for covers goes out.'],
  ['Switch covers off and every cover becomes a tile. The requests are, in fact, unchanged.',
    'Switch covers off and every cover becomes a tile. In fact, the requests for covers are unchanged.'],
  ['Switch covers off and no cover is shown, though each one is requested exactly as before.',
    'Switch covers off and no cover is shown, though each cover is requested exactly as before.'],
  ['Switch covers off and every cover becomes a tile. The requests for covers are, in fact, unchanged.',
    'Switch covers off and every cover becomes a tile. In fact, the requests for covers are unchanged.'],
  ['switching cover art off hides the covers, and every one is requested regardless.',
    'switching cover art off hides the covers, and every cover is requested regardless.'],
  ['The covers, even when hidden, continue to be requested.',
    'The covers continue to be requested, even when hidden.'],
  ['Covers, whether shown or hidden, are requested regardless.',
    'Covers are requested regardless, whether shown or hidden.'],
  ['Cover art, once you switch it off, is still requested.',
    'Cover art is still requested once you switch it off.'],
  ['The image behind each tile, hidden or not, is requested exactly as before.',
    'The image behind each tile is requested exactly as before, hidden or not.'],
];

test('every sentence written to be true is accepted', () => {
  for (const sentence of HONEST_SENTENCES) {
    assert.equal(unacknowledged(sentence), null, `refused a true sentence: ${sentence}`);
  }
});

test('every sentence written to be false is caught', () => {
  for (const sentence of DISHONEST_SENTENCES) {
    assert.notEqual(unacknowledged(sentence), null, `pardoned a false sentence: ${sentence}`);
  }
});

test('the escapes this instrument does not close are still open, and still only these', () => {
  for (const sentence of RECORDED_ESCAPES) {
    assert.equal(
      unacknowledged(sentence),
      null,
      `this escape is now caught, which is good: move it into DISHONEST_SENTENCES and say so in the item, rather than deleting it from here: ${sentence}`,
    );
  }
});

test('the true sentences this instrument refuses are still refused, and each repair works', () => {
  for (const [refused, repaired] of RECORDED_REFUSALS) {
    assert.notEqual(
      unacknowledged(refused),
      null,
      `this refusal is now accepted, which is good: move it into HONEST_SENTENCES and say so in the item: ${refused}`,
    );
    assert.equal(unacknowledged(repaired), null, `the recorded repair does not work: ${repaired}`);
    assert.ok(
      HONEST_SENTENCES.includes(repaired),
      `the repair must also be held as a true sentence: ${repaired}`,
    );
  }
});

// The comment above HONEST_SENTENCES states two counts, and a count in prose is a claim nothing
// checks, which is the defect the whole corpus was landed to end. So they are asserted here. Both
// failures are instructions rather than verdicts: a sentence that stops being read as a covers
// window may well belong in the list, but the comment then has to say so.
test('the structural counts claimed above the corpus are the counts it has', () => {
  const notAboutSwitch = HONEST_SENTENCES.filter((sentence) => {
    const parts = sentence.split(/(?<=[.!?])\s+/);
    for (let i = 0; i < parts.length; i += 1) {
      for (const j of [i, i + 1]) {
        if (j < parts.length && aboutTheSwitch(parts.slice(i, j + 1).join(' '))) return false;
      }
    }
    return true;
  });
  assert.equal(
    notAboutSwitch.length,
    8,
    `the comment above HONEST_SENTENCES says eight of them are not about the covers switch, and ${notAboutSwitch.length} are: ${notAboutSwitch.join(' | ')}`,
  );

  const repairs = new Set(RECORDED_REFUSALS.map(([, repaired]) => repaired));
  assert.equal(
    repairs.size,
    10,
    `the comment above HONEST_SENTENCES says ten of them are repaired forms, and there are ${repairs.size} distinct repairs`,
  );
});
