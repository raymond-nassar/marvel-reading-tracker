// The curated-list catalog.
//
// The catalog is data, not code: `src/data/catalog.json` is generated alongside the vendored
// orders so its counts cannot drift from the files they describe, and adding a new curated
// list means adding data only. Everything the UI shows before an import happens comes from
// here, so an entry that is missing what a reader needs to choose safely (a name, a file to
// import, or a truthful issue count) is rejected rather than rendered half-blank.

export const LIST_TYPES = ['event', 'character-run', 'creator-run', 'era'];
export const READING_DEPTHS = ['essential', 'complete', 'tie-ins'];

const TYPE_LABELS = {
  event: 'Event',
  'character-run': 'Character run',
  'creator-run': 'Creator run',
  era: 'Era',
};

const DEPTH_LABELS = {
  essential: 'Essential reading',
  complete: 'Complete reading',
  'tie-ins': 'Tie-ins',
};

// Plain English, because "essential" and "complete" only mean something to readers who
// already know the convention. This is what tells someone how much reading they are choosing.
const DEPTH_HINTS = {
  essential: 'The core issues only — the shortest path through the story.',
  complete: 'Every issue, including tie-ins and side stories.',
  'tie-ins': 'The tie-in issues that surround a main story.',
};

export function typeLabel(type) {
  return TYPE_LABELS[type] ?? 'Reading list';
}

export function depthLabel(depth) {
  return DEPTH_LABELS[depth] ?? null;
}

export function depthHint(depth) {
  return DEPTH_HINTS[depth] ?? null;
}

const str = (v) => (typeof v === 'string' && v.trim() ? v.trim() : null);

const strings = (v) => (Array.isArray(v) ? [...new Set(v.map(str).filter(Boolean))] : []);

// A curated file is fetched from our own origin by name, so it must stay a plain file name.
// Anything with a path separator or traversal segment is treated as invalid data.
function safeFile(v) {
  const s = str(v);
  if (!s) return null;
  return /^[A-Za-z0-9._-]+\.json$/.test(s) && !s.startsWith('.') ? s : null;
}

function normalizeEntry(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const id = str(raw.id);
  const name = str(raw.name);
  const file = safeFile(raw.file);
  const count = Number.isInteger(raw.count) && raw.count >= 0 ? raw.count : null;
  if (!id || !name || !file || count == null) return null;

  return {
    id,
    name,
    file,
    count,
    description: str(raw.description),
    type: LIST_TYPES.includes(raw.type) ? raw.type : null,
    depth: READING_DEPTHS.includes(raw.depth) ? raw.depth : null,
    characters: strings(raw.characters),
    keywords: strings(raw.keywords),
    source: str(raw.source),
    sourceLicense: str(raw.sourceLicense),
    updatedAt: str(raw.updatedAt),
  };
}

// Returns the usable entries plus a count of entries that had to be dropped, so the view can
// tell the reader that the catalog is incomplete instead of quietly showing fewer lists.
export function parseCatalog(raw) {
  const entries = Array.isArray(raw?.lists) ? raw.lists : [];
  const lists = [];
  const seen = new Set();
  let dropped = 0;

  for (const entry of entries) {
    const list = normalizeEntry(entry);
    if (!list || seen.has(list.id)) {
      dropped += 1;
      continue;
    }
    seen.add(list.id);
    lists.push(list);
  }

  return { lists, dropped };
}

// Categories are derived from the lists themselves, so a category never appears with nothing
// behind it and a newly added list type shows up without a code change. Lists whose type is
// missing or unrecognised are grouped under "other" rather than being hidden.
export const UNCATEGORIZED = 'other';

export function catalogCategories(lists) {
  const counts = new Map();
  for (const list of lists) {
    const key = list.type ?? UNCATEGORIZED;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  // Keep the declared type order stable regardless of the manifest's order, with "other" last.
  const order = [...LIST_TYPES, UNCATEGORIZED];
  return order
    .filter((key) => counts.has(key))
    .map((key) => ({ key, label: key === UNCATEGORIZED ? 'Other' : typeLabel(key), count: counts.get(key) }));
}

export function filterByCategory(lists, category) {
  if (!category || category === 'all') return lists;
  return lists.filter((list) => (list.type ?? UNCATEGORIZED) === category);
}

// ------------------------------------------------------------------ search

// Readers type what they remember — "civil war", "spider-man", "hickman" — not exact titles,
// and they should not have to reproduce accents or punctuation to find a list. Every term has
// to match somewhere, so extra words narrow the results instead of widening them.
function fold(v) {
  return String(v ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function haystack(list) {
  return fold([
    list.name,
    list.description,
    typeLabel(list.type),
    depthLabel(list.depth),
    ...list.characters,
    ...list.keywords,
  ].filter(Boolean).join(' '));
}

export function searchCatalog(lists, query) {
  const terms = fold(query).split(' ').filter(Boolean);
  if (!terms.length) return lists;
  return lists.filter((list) => {
    const text = haystack(list);
    return terms.every((term) => text.includes(term));
  });
}
