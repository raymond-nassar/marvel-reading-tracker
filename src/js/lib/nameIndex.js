// Local name search over a vendored index.
//
// The upstream API has no name search for series or creators: `/series?q=…` and
// `/creators?q=…` accept the parameter and ignore it, returning the alphabetical head of the
// whole collection whatever you type. See scripts/vendor-index.mjs. The collections are small
// and change rarely, so they are vendored into src/data/ at build time and searched here.
//
// Pure and browser-free, like the rest of src/js/lib: no fetch, no DOM, no IndexedDB.

// The tuple positions in a vendored index file. Records are stored as [id, name, issueCount]
// rather than objects because the 6,990 series are 345 KB that way against 516 KB as objects,
// and the browser downloads the file whole.
export const INDEX_FIELDS = ['id', 'name', 'issueCount'];

export const DEFAULT_LIMIT = 40;

// Readers type what they remember ("civil war", "hickman") rather than exact titles, and should
// not have to reproduce punctuation or accents. This deliberately matches the folding used by
// the curated-catalog search in lib/catalog.js, so the two search boxes behave the same way.
export function foldName(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function readRecord(raw) {
  // Tuples are what the vendor script writes; objects are accepted too so a file that is
  // hand-inspected and re-saved in the obvious shape still loads.
  if (Array.isArray(raw)) {
    const [id, name, issueCount] = raw;
    return { id, name, issueCount };
  }
  if (raw && typeof raw === 'object') {
    return { id: raw.id, name: raw.name, issueCount: raw.issueCount };
  }
  return null;
}

function normalizeEntry(raw) {
  const rec = readRecord(raw);
  if (!rec) return null;

  // Tested against the raw value rather than through Number(), because Number(null) is 0: a
  // record with no id would become series 0, and a record with no count would claim a 60-issue
  // run is empty. Both are worse than dropping the record.
  if (!Number.isInteger(rec.id)) return null;

  const name = typeof rec.name === 'string' ? rec.name.trim() : '';
  if (!name) return null;

  // How much "Add all issues" is about to add is the one number that makes that button safe to
  // press, so a missing count is carried as null and shown as unknown rather than as zero.
  const issueCount = Number.isInteger(rec.issueCount) && rec.issueCount >= 0 ? rec.issueCount : null;

  // Folded once here rather than on every keystroke: 6,990 names are folded in a few
  // milliseconds, but doing it per search would repeat that for every query of the session.
  const folded = foldName(name);
  return { id: rec.id, name, issueCount, folded, title: titleOf(folded) };
}

// A series is named "Civil War (2006 - 2007)", and nobody types the years. Dropping the
// trailing numbers leaves the part a reader actually means, so a search for "Civil War" can
// tell the series called Civil War from the one called Civil War: Front Line. Creator names
// carry no such suffix, so this is a no-op for them. A name that is nothing but numbers
// ("2001 (1976)") keeps its folded form rather than collapsing to nothing.
function titleOf(folded) {
  const stripped = folded.replace(/(\s+\d+)+$/, '').trim();
  return stripped || folded;
}

// Returns the usable entries plus how many records had to be dropped, so a caller can say the
// index is incomplete instead of quietly searching less than it claims to.
export function parseNameIndex(raw) {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  const entries = [];
  const seen = new Set();
  let dropped = 0;

  for (const item of items) {
    const entry = normalizeEntry(item);
    if (!entry || seen.has(entry.id)) {
      dropped += 1;
      continue;
    }
    seen.add(entry.id);
    entries.push(entry);
  }

  return {
    entries,
    dropped,
    kind: typeof raw?.kind === 'string' ? raw.kind : null,
    generatedAt: typeof raw?.generatedAt === 'string' ? raw.generatedAt : null,
    apiBase: typeof raw?.apiBase === 'string' ? raw.apiBase : null,
    // What the API said the collection held when the file was built, which is not necessarily
    // how many records survived parsing.
    total: Number.isInteger(raw?.total) ? raw.total : entries.length,
  };
}

// How well a name answers the query, lowest first. A reader searching "hickman" means the
// person called Hickman, not every name with those letters somewhere inside it, so a whole-word
// hit outranks a mid-word one, and a name that *is* the query outranks everything.
const EXACT = 0, TITLE = 1, PREFIX = 2, WORD = 3, INSIDE = 4, TERMS_ONLY = 5;

function rank(entry, phrase) {
  if (entry.folded === phrase) return EXACT;
  // "Civil War (2006 - 2007)" is the series called Civil War; "Civil War: Front Line" is a
  // different series that merely starts with those words.
  if (entry.title === phrase) return TITLE;
  if (entry.folded.startsWith(`${phrase} `)) return PREFIX;
  const at = entry.folded.indexOf(phrase);
  if (at < 0) return TERMS_ONLY;
  return entry.folded[at - 1] === ' ' ? WORD : INSIDE;
}

// Ranked, capped, and honest about how much was left out.
//
// `matched` is the number of names that matched, not the number returned: with 6,990 series a
// broad query like "spider" matches hundreds, and showing 40 of them without saying so would
// leave a reader believing the rest do not exist.
//
// An empty query returns nothing rather than everything. Returning the whole collection is
// precisely the behaviour this module exists to replace.
export function searchNames(entries, query, { limit = DEFAULT_LIMIT } = {}) {
  const all = Array.isArray(entries) ? entries : [];
  const phrase = foldName(query);
  const terms = phrase.split(' ').filter(Boolean);
  if (!terms.length) return { items: [], matched: 0, total: all.length };

  const hits = [];
  for (const entry of all) {
    // Every term has to appear, so adding words narrows the results instead of widening them.
    if (!terms.every((term) => entry.folded.includes(term))) continue;
    hits.push({ entry, score: rank(entry, phrase) });
  }

  // The larger body of work first within a rank. Two names can match a query equally well, and
  // when they do the size of the run is a real property of the data rather than a guess about
  // intent: someone searching "hickman" means the writer with 395 credits, not the letterer
  // with one, and someone adding a whole "spider" series more likely wants a long run than a
  // one-shot collection. Then the shorter name, because less extra text is the more literal
  // answer, and finally the name itself so the order is fully determined and a query never
  // renders differently twice.
  hits.sort((a, b) =>
    a.score - b.score ||
    (b.entry.issueCount ?? 0) - (a.entry.issueCount ?? 0) ||
    a.entry.name.length - b.entry.name.length ||
    (a.entry.name < b.entry.name ? -1 : a.entry.name > b.entry.name ? 1 : 0));

  const cap = Math.max(1, Number(limit) || DEFAULT_LIMIT);
  return {
    items: hits.slice(0, cap).map(({ entry }) => ({
      id: entry.id,
      name: entry.name,
      issueCount: entry.issueCount,
    })),
    matched: hits.length,
    total: all.length,
  };
}
