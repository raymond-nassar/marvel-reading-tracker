// The curated-list manifest.
//
// A curated reading list is defined entirely by data: `src/data/curated-lists.json` names the
// upstream order to vendor and the editorial metadata a reader sees before importing it. The
// vendor script reads the manifest and derives both the pinned order file and the catalog
// entry from it, so adding a list means adding a manifest entry — no application logic changes.
//
// A malformed entry is a maintainer's mistake, not a reader's, so it is reported with the
// reason rather than dropped: silently vendoring a shorter catalog is how a list goes missing
// without anyone noticing.

import { LIST_TYPES, READING_DEPTHS, safeFile } from './catalog.js';

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

const strings = (v) => (Array.isArray(v) ? [...new Set(v.map(str).filter(Boolean))] : []);

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

  if (!id) at('has no id');
  else if (seen.has(id)) at(`duplicate id "${id}"`);
  if (!name) at('has no name');
  if (!out) at('has no usable output file name (expected a plain *.json name)');
  if (!sourceUrl) at('has no https sourceUrl to vendor from');
  if (!str(raw.sourceLicense)) at('has no sourceLicense');
  if (!LIST_TYPES.includes(raw.type)) at(`type must be one of ${LIST_TYPES.join(', ')}`);
  if (!READING_DEPTHS.includes(raw.depth)) at(`depth must be one of ${READING_DEPTHS.join(', ')}`);
  if (raw.expect != null && !(Number.isInteger(raw.expect) && raw.expect > 0)) {
    at('expect must be a positive whole number of issues when present');
  }
  // A variant name only means something relative to the story it varies from.
  if (!str(raw.group) && (str(raw.variant) || str(raw.groupName))) {
    at('variant and groupName need a group to belong to');
  }
  if (errors.length) return { entry: null, errors };

  return {
    entry: {
      id,
      name,
      out,
      sourceUrl,
      // The page a reader can open is not always the raw file we fetch; fall back to the raw
      // URL so attribution is never blank.
      sourcePage: httpsUrl(raw.sourcePage) ?? sourceUrl,
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
