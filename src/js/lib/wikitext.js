// Reading facts out of Marvel Fandom wikitext.
//
// The vendored metadata snapshot stops at 2025-10-29, so an issue published after that has no
// release date, no page count and no credits anywhere in this app. The reader types the title in
// by hand and gets a bare row. This module turns a wiki page's raw wikitext into the same handful
// of fields the metadata API would have supplied, so the hand-entry form can offer to fill them.
//
// It is pure on purpose. Everything here is a string in and a plain object out, with no fetch and
// no DOM, so the parsing can be tested against fixture wikitext without a network. The request
// half lives beside it in wiki.js.
//
// Two rules shape the whole file:
//
//   * Only bare facts leave here. A date, a count and a person's name in a credit role are facts,
//     and facts are not copyrightable, so reading them carries no share-alike obligation. Wiki
//     PROSE is CC BY-SA and would attach one to anything it landed in. So admission is by an
//     allowlist of field names rather than by exclusion: a page can grow a new prose field and
//     this module will not notice it exists. `Quotation`, `Appearing1` and `StoryTitle1` are
//     dropped because they are not on the list, not because anything here names them.
//   * `MarvelUnlimitedID` is Marvel's ISSUE id and NOT the digital book id the reader opens. It is
//     read, because an issue id builds the official marvel.com page for a comic the snapshot has
//     never heard of, and that page is live: 129648 answers 200 while an invented id answers 404,
//     both measured on 2026-08-19. It is named `marvelIssueId` here so that nothing downstream can
//     mistake it for a book id. It cannot reach Marvel Unlimited, and the service that converts an
//     issue id into a book id answers 404 for every post-snapshot issue, which is the whole reason
//     the reader is asked to paste an address instead.

const COMIC_TEMPLATE = 'Marvel Database:Comic Template';
const VOLUME_TEMPLATE = 'Marvel Database:Volume Template';

// The same cap normalizeIssue applies, so nothing is collected here that would be silently
// dropped on the way into storage.
const MAX_CREDITS = 24;

// The allowlist, in two halves because the wiki names credits per story and per creator:
// `Writer1_2` is the second writer of the first story. Both halves are exact, so a field has to
// be asked for by name to be read at all.
const SCALAR_FIELDS = new Map([
  ['ReleaseDate', 'releaseDate'],
  ['Pages', 'pages'],
  ['MarvelUnlimitedID', 'marvelIssueId'],
]);

// Marvel spells it "penciler" with one l, and the hero's own credit filter already matches that
// spelling, so the role strings written here are the ones that survive to the screen.
const CREDIT_ROLES = new Map([
  ['Writer', 'writer'],
  ['Penciler', 'penciler'],
  ['Inker', 'inker'],
  ['Colorist', 'colorist'],
  ['Letterer', 'letterer'],
  ['Editor', 'editor'],
]);

// Story index and creator index, both required. This is what keeps `Image1_Artist1` out: the
// cover artist is credited in the same shape but ends in a word, and a cover credit is not the
// creative team for the story. `Editor-in-Chief` is excluded by the same pattern.
//
// It is the first of two guards rather than the only one, which is worth knowing before deleting
// either. Measured: loosening this to admit a trailing word reddens nothing, because `image` is
// not a role in the map above and the credit is dropped there instead.
const CREDIT_FIELD = /^([A-Za-z]+)(\d+)_(\d+)$/;

const MONTHS = new Map(
  ['january', 'february', 'march', 'april', 'may', 'june', 'july',
    'august', 'september', 'october', 'november', 'december']
    .map((name, i) => [name, i + 1]),
);

// Wiki page titles read "X-Men Vol 7 26", which is not Marvel's own "X-Men (2024) #26". The
// volume marker is what makes the split safe: without it "Amazing Spider-Man 2026 annual" would
// have to be guessed at, and a guessed series name is worse than none.
const PAGE_TITLE = /^(.+ Vol \d+) (\d+[A-Za-z]*)$/;

// Returns the inside of the first `{{Name ...}}` block, or null. Scans for the matching close
// rather than searching for `}}`, because every one of these templates contains nested templates
// and the first `}}` in the text belongs to one of them.
export function templateBody(wikitext, name) {
  const text = String(wikitext ?? '');
  const open = new RegExp(`\\{\\{\\s*${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
  const at = text.search(open);
  if (at < 0) return null;

  const from = at + text.slice(at).match(open)[0].length;
  let depth = 1;
  for (let i = from; i < text.length - 1; i += 1) {
    if (text[i] === '{' && text[i + 1] === '{') { depth += 1; i += 1; continue; }
    if (text[i] === '}' && text[i + 1] === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(from, i);
      i += 1;
    }
  }
  // An unclosed template is a truncated or malformed page. Reading the rest of the file as though
  // it were template fields would invent facts, so nothing is returned.
  return null;
}

// A page for a series rather than an issue. The search returns these mixed in with the issues,
// and they carry a title that looks right and no release date at all.
export function isVolumePage(wikitext) {
  return templateBody(wikitext, VOLUME_TEMPLATE) !== null;
}

// Splits a template body on its own `|` separators. Depth-aware on both pairs, because a real
// page carries `Appearing1` values shaped like `{{a|[[Someone]]}}` and a naive split on `|` cuts
// those in half and leaves the tail looking like a field name.
export function splitFields(body) {
  const text = String(body ?? '');
  const out = new Map();
  let brace = 0;
  let bracket = 0;
  let start = 0;

  const take = (end) => {
    const part = text.slice(start, end);
    const eq = part.indexOf('=');
    if (eq > 0) {
      const key = part.slice(0, eq).trim();
      // Last write wins, matching MediaWiki's own behaviour for a repeated parameter.
      if (key) out.set(key, part.slice(eq + 1));
    }
    start = end + 1;
  };

  for (let i = 0; i < text.length; i += 1) {
    if (text.startsWith('<!--', i)) {
      const close = text.indexOf('-->', i);
      i = close < 0 ? text.length : close + 2;
      continue;
    }
    if (text.startsWith('{{', i)) { brace += 1; i += 1; continue; }
    if (text.startsWith('}}', i)) { brace = Math.max(0, brace - 1); i += 1; continue; }
    if (text.startsWith('[[', i)) { bracket += 1; i += 1; continue; }
    if (text.startsWith(']]', i)) { bracket = Math.max(0, bracket - 1); i += 1; continue; }
    if (text[i] === '|' && brace === 0 && bracket === 0) take(i);
  }
  take(text.length);
  return out;
}

// Turns one raw field value into plain text. Order matters: comments first because they can sit
// inside anything, then links so `[[Target|Display]]` keeps the display half, then templates,
// which are removed whole rather than unwrapped so that a value made entirely of markup comes out
// empty and is dropped instead of contributing a template name as though it were a person.
export function cleanValue(raw) {
  return String(raw ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<ref[^>]*\/>/gi, ' ')
    .replace(/<ref[\s\S]*?<\/ref>/gi, ' ')
    .replace(/\[\[([^\][|]*)\|([^\][]*)\]\]/g, '$2')
    .replace(/\[\[([^\][]*)\]\]/g, '$1')
    .replace(/\{\{[^{}]*\}\}/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/'{2,}/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// "March 4, 2026" is the shape the wiki writes, and older pages write the same date as
// "[[March 4]], [[2026]]", which is the same string once the links are resolved. Anything else is
// refused rather than guessed at: a wrong release date is displayed as fact.
export function releaseDateToIso(raw) {
  const text = cleanValue(raw);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return text;

  const named = text.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (!named) return null;
  const month = MONTHS.get(named[1].toLowerCase());
  const day = Number(named[2]);
  if (!month || day < 1 || day > 31) return null;
  return `${named[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Series and number, or two nulls. Never a partial answer: a title that does not carry the volume
// marker gives no reliable split, and half a guess would still be shown as a fact.
export function titleParts(pageTitle) {
  const m = String(pageTitle ?? '').trim().match(PAGE_TITLE);
  return m ? { seriesName: m[1], number: m[2] } : { seriesName: null, number: null };
}

// Marvel's own issue id, which builds the official page for the comic. Exact or nothing: this ends
// up in a link, and a link built from a half-read number opens somebody else's comic.
export function positiveId(raw) {
  const text = String(raw ?? '').trim();
  return /^\d+$/.test(text) && Number(text) > 0 ? Number(text) : null;
}

// Every credit on the page, in the order the page writes them, which is already writer first and
// editor last. Deduplicated because a creator credited on two stories of the same issue is one
// person, and the hero shows three names.
export function credits(fields) {
  const out = [];
  const seen = new Set();
  for (const [key, raw] of fields) {
    const m = key.match(CREDIT_FIELD);
    if (!m) continue;
    const role = CREDIT_ROLES.get(m[1]);
    if (!role) continue;
    const name = cleanValue(raw);
    if (!name) continue;
    const id = `${role}\u0000${name.toLowerCase()}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ name, role });
    if (out.length >= MAX_CREDITS) break;
  }
  return out;
}

// The whole of what this module offers a caller: the fields normalizeIssue will keep, and nothing
// else. Returns null for anything that is not an issue page, which is how a series page from the
// search gets rejected.
export function issueFacts(wikitext, pageTitle) {
  const body = templateBody(wikitext, COMIC_TEMPLATE);
  if (body === null) return null;

  const fields = splitFields(body);

  // Read through the allowlist rather than by reaching into `fields` directly, so the list is
  // what the code does and not a comment describing what it once did.
  const admitted = new Map();
  for (const [name, as] of SCALAR_FIELDS) {
    if (fields.has(name)) admitted.set(as, fields.get(name));
  }

  const pageCountRaw = cleanValue(admitted.get('pages') ?? '');
  const { seriesName, number } = titleParts(pageTitle);

  return {
    onSale: releaseDateToIso(admitted.get('releaseDate') ?? ''),
    pageCount: /^\d+$/.test(pageCountRaw) && Number(pageCountRaw) > 0 ? Number(pageCountRaw) : null,
    // All digits and positive, or nothing. A page carrying a placeholder, a range or a note where
    // the id should be must not turn into a link to whatever comic that text happens to parse as.
    marvelIssueId: positiveId(cleanValue(admitted.get('marvelIssueId') ?? '')),
    creators: credits(fields),
    seriesName,
    number,
  };
}
