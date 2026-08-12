// The curated-list manifest.
//
// A curated reading list is defined entirely by data: `src/data/curated-lists.json` names the
// order to vendor and the editorial metadata a reader sees before importing it. The vendor
// script reads the manifest and derives both the pinned order file and the catalog entry from
// it, so adding a list means adding a manifest entry, with no application logic changes.
//
// An order comes from exactly one of two places: `sourceUrl` fetches it from an upstream
// publisher over https, or `sourceFile` reads a checklist authored in this repository. The
// second exists because not every reading order has an upstream to point at; an order compiled
// by hand would otherwise have to be published somewhere else first just to be vendored back in.
//
// A malformed entry is a maintainer's mistake, not a reader's, so it is reported with the
// reason rather than dropped: silently vendoring a shorter catalog is how a list goes missing
// without anyone noticing.

import { LIST_TYPES, READING_DEPTHS, safeFile, safeOrderFile } from './catalog.js';

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

const strings = (v) => (Array.isArray(v) ? [...new Set(v.map(str).filter(Boolean))] : []);

// An SPDX expression: identifiers of letters, digits, dot, plus and hyphen, optionally joined by
// AND, OR or WITH. Deliberately not a list of known identifiers, which is the enumeration this
// repository has been bitten by; the shape is what distinguishes a licence from a sentence.
const SPDX = /^[A-Za-z0-9.+-]+(?: (?:AND|OR|WITH) [A-Za-z0-9.+-]+)*$/;

// Orders are fetched over the network at vendor time, so the manifest may only point at https.
function httpsUrl(v) {
  const s = str(v);
  if (!s) return null;
  try {
    return new URL(s).protocol === 'https:' ? s : null;
  } catch {
    return null;
  }
}

function checkEntry(raw, index, seen) {
  const errors = [];
  const at = (msg) => errors.push(`entry ${index}: ${msg}`);

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { entry: null, errors: [`entry ${index}: is not an object`] };
  }

  const id = str(raw.id);
  const name = str(raw.name);
  const out = safeFile(raw.out);
  const sourceUrl = httpsUrl(raw.sourceUrl);
  const sourceFile = safeOrderFile(raw.sourceFile);

  if (!id) at('has no id');
  else if (seen.has(id)) at(`duplicate id "${id}"`);
  if (!name) at('has no name');
  if (!out) at('has no usable output file name (expected a plain *.json name)');
  // Exactly one origin. Accepting both would leave which one actually got vendored decided by
  // the order of checks in another file, and the attribution the reader sees possibly describing
  // the one that lost. Each way of getting it wrong is named separately, because "no source"
  // sends a maintainer looking for a missing line when the real problem is a typo in one.
  if (raw.sourceUrl != null && !sourceUrl) at('has a sourceUrl that is not https');
  if (raw.sourceFile != null && !sourceFile) at('has a sourceFile that is not a plain *.md name');
  if (sourceUrl && sourceFile) at('has both sourceUrl and sourceFile; an order comes from one place');
  else if (!sourceUrl && !sourceFile && raw.sourceUrl == null && raw.sourceFile == null) {
    at('has no sourceUrl or sourceFile to vendor from');
  }
  if (!str(raw.sourceOrigin)) at('has no sourceOrigin');
  // Origin and licence are different claims and were one field until BL-099. Ten of the twelve
  // values that field held were prose about where an order came from, which is not a grant of
  // anything, and the two that named a licence named one the upstream states for its Python
  // distribution rather than for the file vendored here. So the shape is checked: a licence is
  // an SPDX expression and nothing else, which refuses every one of those ten by construction.
  //
  // The type is checked rather than coerced, because coercing loses the one distinction this
  // field exists to keep. `String(true)` is SPDX-shaped and passes, and the value is then stored
  // through str(), which yields null for a non-string. A boolean would have been recorded as "no
  // licence established", which is a claim nobody made.
  if (raw.sourceLicense != null && !(typeof raw.sourceLicense === 'string' && SPDX.test(raw.sourceLicense.trim()))) {
    at('sourceLicense must be an SPDX expression, or null when no licence is conveyed with the order; describe where it came from in sourceOrigin');
  }
  if (!LIST_TYPES.includes(raw.type)) at(`type must be one of ${LIST_TYPES.join(', ')}`);
  if (!READING_DEPTHS.includes(raw.depth)) at(`depth must be one of ${READING_DEPTHS.join(', ')}`);
  if (raw.expect != null && !(Number.isInteger(raw.expect) && raw.expect > 0)) {
    at('expect must be a positive whole number of issues when present');
  }
  // A variant name only means something relative to the story it varies from.
  if (!str(raw.group) && (str(raw.variant) || str(raw.groupName))) {
    at('variant and groupName need a group to belong to');
  }
  // Editorial, so it has to be stated rather than inferred, and a truthy string would make
  // "beginner": "no" mean beginner-friendly.
  if (raw.beginner != null && typeof raw.beginner !== 'boolean') {
    at('beginner must be true or false when present');
  }
  // The issue whose cover represents the order. It has to be a real Marvel issue id; the
  // vendor script additionally checks that the issue is in this order.
  if (raw.coverIssueId != null && !(Number.isInteger(raw.coverIssueId) && raw.coverIssueId > 0)) {
    at('coverIssueId must be a positive whole Marvel issue id when present');
  }
  if (errors.length) return { entry: null, errors };

  return {
    entry: {
      id,
      name,
      out,
      sourceUrl,
      sourceFile,
      // The page a reader can open is not always the raw file we fetch; fall back to the raw
      // URL so attribution is never blank. An order authored here has no upstream page, so it
      // is credited by sourceOrigin alone rather than given a link that goes nowhere.
      sourcePage: httpsUrl(raw.sourcePage) ?? sourceUrl,
      sourceOrigin: str(raw.sourceOrigin),
      sourceLicense: str(raw.sourceLicense),
      description: str(raw.description),
      type: raw.type,
      depth: raw.depth,
      characters: strings(raw.characters),
      keywords: strings(raw.keywords),
      // Optional: ties this order to a story that has more than one reading path.
      group: str(raw.group),
      groupName: str(raw.groupName),
      variant: str(raw.variant),
      // Optional editorial flag: the order opens the story it tells, so a reader can start
      // here without having read something else first.
      beginner: raw.beginner === true,
      // Optional: the issue whose cover stands for the order on a card. Left null, the
      // vendor script uses the first issue in the order that has cover art.
      coverIssueId: Number.isInteger(raw.coverIssueId) && raw.coverIssueId > 0 ? raw.coverIssueId : null,
      expect: Number.isInteger(raw.expect) ? raw.expect : null,
    },
    errors: [],
  };
}

// Returns every valid entry plus every reason an entry was rejected. Callers decide whether a
// partial manifest is acceptable; the vendor script refuses it.
export function parseManifest(raw) {
  const list = Array.isArray(raw?.lists) ? raw.lists : null;
  if (!list) return { entries: [], errors: ['manifest has no "lists" array'] };

  const entries = [];
  const errors = [];
  const seen = new Set();
  list.forEach((item, i) => {
    const { entry, errors: bad } = checkEntry(item, i, seen);
    if (entry) {
      seen.add(entry.id);
      entries.push(entry);
    } else {
      errors.push(...bad);
    }
  });

  return { entries, errors };
}
