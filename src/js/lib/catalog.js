// The curated-list catalog.
//
// The catalog is data, not code: `src/data/catalog.json` is generated alongside the vendored
// orders so its counts cannot drift from the files they describe, and adding a new curated
// list means adding data only. Everything the UI shows before an import happens comes from
// here, so an entry that is missing what a reader needs to choose safely (a name, a file to
// import, or a truthful issue count) is rejected rather than rendered half-blank.

import { normalizeCover } from './model.js';

export const LIST_TYPES = ['event', 'character-run', 'creator-run', 'era'];
export const READING_DEPTHS = ['essential', 'complete', 'tie-ins'];

// What "short" means on a filter chip. Twenty issues is roughly a weekend, and it is the
// boundary that separates the self-contained events in the bundled catalog from the runs.
export const SHORT_ORDER_MAX = 20;

const TYPE_LABELS = {
  event: 'Event',
  'character-run': 'Character run',
  'creator-run': 'Creator run',
  era: 'Era',
};

// The chip form. A filter names a set, so it reads as a plural.
const TYPE_FACET_LABELS = {
  event: 'Events',
  'character-run': 'Character runs',
  'creator-run': 'Creator runs',
  era: 'Eras',
};

const DEPTH_LABELS = {
  essential: 'Essential reading',
  complete: 'Complete reading',
  'tie-ins': 'Tie-ins',
};

// Plain English, because "essential" and "complete" only mean something to readers who
// already know the convention. This is what tells someone how much reading they are choosing.
const DEPTH_HINTS = {
  essential: 'The core issues only, the shortest path through the story.',
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

// Attribution is only trustworthy if the reader can follow it, and only safe if what we
// render as a link is really a web address. Anything else (a bare name, a `javascript:` URL)
// is still shown as attribution text, so the credit is never dropped, but never linked.
export function sourceLink(list) {
  const s = str(list?.source);
  if (!s) return null;
  try {
    return new URL(s).protocol === 'https:' ? s : null;
  } catch {
    return null;
  }
}

// Where an order came from, in the reader's words. This is provenance, not terms: it says who
// compiled the order and from what, which is the credit the curators are owed. It was one field
// with the licence until BL-099, and ten of the twelve values it held were sentences like this
// one rather than a grant, so reading it as a licence was reading it wrong.
//
// The fallback chain is widest last, so a list written before the split still shows something
// rather than dropping the credit entirely.
export function sourceLabel(list) {
  return str(list?.sourceOrigin) ?? str(list?.sourceLicense) ?? str(list?.source);
}

// The licence conveyed with the vendored order, when one is. Null is the ordinary answer and
// means nobody granted anything for this file, not that it is unencumbered. See
// `docs/DATA_PROVENANCE.md` for what this project's own MIT grant does and does not reach.
export function sourceLicense(list) {
  return str(list?.sourceLicense);
}

// A curated order is a snapshot, so its age is the reader's only signal that a recent event
// may be missing. An unparseable date is treated as no date rather than shown as "Invalid Date".
//
// The stamp records the UTC instant the order was vendored, so it is formatted in UTC too.
// Formatting it in the reader's zone would render the same snapshot as two different days
// depending on where they are: a 06:14Z stamp reads as the previous day anywhere west of
// UTC-6:14, which is all of the Americas.
export function updatedLabel(list, locale) {
  const s = str(list?.updatedAt);
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

const strings = (v) => (Array.isArray(v) ? [...new Set(v.map(str).filter(Boolean))] : []);

// A curated file is fetched from our own origin by name, so it must stay a plain file name.
// Anything with a path separator or traversal segment is treated as invalid data.
export function safeFile(v) {
  const s = str(v);
  if (!s) return null;
  return /^[A-Za-z0-9._-]+\.json$/.test(s) && !s.startsWith('.') ? s : null;
}

// The markdown for an order authored in this repository is read from a fixed directory at
// vendor time. It is validated the same way as the output name so a manifest can never reach
// outside that directory, whatever it asks for.
export function safeOrderFile(v) {
  const s = str(v);
  if (!s) return null;
  return /^[A-Za-z0-9._-]+\.md$/.test(s) && !s.startsWith('.') ? s : null;
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
    // How many collected editions the order is divided into, or 0 for an ordinary issue order.
    // A trade order is a different kind of reading commitment, so the number a reader weighs is
    // the number of books, not only the number of issues.
    collections: Number.isInteger(raw.collections) && raw.collections > 0 ? raw.collections : 0,
    description: str(raw.description),
    type: LIST_TYPES.includes(raw.type) ? raw.type : null,
    depth: READING_DEPTHS.includes(raw.depth) ? raw.depth : null,
    characters: strings(raw.characters),
    keywords: strings(raw.keywords),
    source: str(raw.source),
    sourceOrigin: str(raw.sourceOrigin),
    sourceLicense: str(raw.sourceLicense),
    updatedAt: str(raw.updatedAt),
    // Two orders for the same story are a choice between reading paths, not two unrelated
    // lists. `group` names the story they share; `variant` names this particular path.
    group: str(raw.group),
    groupName: str(raw.groupName),
    variant: str(raw.variant),
    // A representative issue, so a card can show art before anything is imported. Both
    // fields come from the vendored Marvel metadata for an issue that is actually in the
    // order, never from a hand-picked image: `cover` is the CDN base the browser appends a
    // variant to, exactly as issue covers work everywhere else in the app.
    //
    // Positive only, matching the manifest validation in curated.js. A negative id is not a
    // Marvel issue, but it is truthy, so accepting one here would let a corrupted catalog
    // reach the preview lookup as a plausible-looking id rather than being rejected as data.
    coverIssueId: Number.isInteger(raw.coverIssueId) && raw.coverIssueId > 0 ? raw.coverIssueId : null,
    cover: normalizeCover(raw.cover),
    // An editorial judgement, recorded as data rather than guessed from the issue count:
    // true means the order opens the story it tells, so no prior reading is assumed beyond
    // general familiarity with the characters.
    beginner: raw.beginner === true,
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

// ------------------------------------------------------------------ facets

// Facets are what the landing page and the catalog page both filter by. They are a superset
// of the type categories: a reader choosing what to start does not think only in Marvel's
// taxonomy, they also think "something short" or "something I can follow cold". Each facet
// is derived from the lists themselves and dropped when nothing matches it, so a chip never
// leads to an empty grid.

export function isShortOrder(list) {
  return Number.isInteger(list?.count) && list.count < SHORT_ORDER_MAX;
}

export function isBeginnerOrder(list) {
  return list?.beginner === true;
}

export function catalogFacets(lists) {
  const all = Array.isArray(lists) ? lists : [];
  const facets = [{ key: 'all', label: 'All', count: all.length }];

  const beginner = all.filter(isBeginnerOrder).length;
  if (beginner) facets.push({ key: 'beginner', label: 'Beginner-friendly', count: beginner });

  for (const c of catalogCategories(all)) {
    facets.push({
      key: `type:${c.key}`,
      label: c.key === UNCATEGORIZED ? 'Other' : (TYPE_FACET_LABELS[c.key] ?? typeLabel(c.key)),
      count: c.count,
    });
  }

  // Reading in collected editions is a way of collecting, not a kind of story, so it cuts
  // across the type chips rather than sitting inside one. It is listed only when such an order
  // exists, like every other facet here.
  const trade = all.filter(isTradeOrder).length;
  if (trade) facets.push({ key: 'trade', label: 'By collected edition', count: trade });

  const short = all.filter(isShortOrder).length;
  if (short) facets.push({ key: 'short', label: `Short (under ${SHORT_ORDER_MAX} issues)`, count: short });

  return facets;
}

export function filterByFacet(lists, key) {
  const all = Array.isArray(lists) ? lists : [];
  if (!key || key === 'all') return all;
  if (key === 'beginner') return all.filter(isBeginnerOrder);
  if (key === 'trade') return all.filter(isTradeOrder);
  if (key === 'short') return all.filter(isShortOrder);
  if (key.startsWith('type:')) return filterByCategory(all, key.slice(5));
  // An unknown facet matches nothing rather than everything, so a stale saved filter can
  // never quietly widen into the whole catalog.
  return [];
}

export function facetLabel(lists, key) {
  return catalogFacets(lists).find((f) => f.key === key)?.label ?? 'that filter';
}

// ------------------------------------------------------------------ covers

// The catalog's own cover, built the same way an issue cover is. Returns null when the
// entry has no representative issue, so the card falls back to a typographic tile rather
// than requesting a broken image.
export function catalogCoverUrl(list, variant = 'portrait_incredible') {
  const c = normalizeCover(list?.cover);
  return c ? `${c.path}/${variant}.${c.ext}` : null;
}

// Roughly how much reading an order is. Twenty minutes an issue is an assumption, so every
// caller states it next to the number rather than presenting the total as a measurement.
export const MINUTES_PER_ISSUE = 20;

export function readingTimeLabel(count) {
  if (!Number.isInteger(count) || count <= 0) return null;
  const minutes = count * MINUTES_PER_ISSUE;
  if (minutes < 90) return `about ${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  return `about ${hours} hour${hours === 1 ? '' : 's'}`;
}

// What an order is divided into, when it is divided into anything. Returns null for an
// ordinary issue order so a caller renders nothing rather than "0 collected editions".
export function collectionsLabel(list) {
  const n = list?.collections;
  if (!Number.isInteger(n) || n <= 0) return null;
  return `${n} collected edition${n === 1 ? '' : 's'}`;
}

export function isTradeOrder(list) {
  return Number.isInteger(list?.collections) && list.collections > 0;
}

// ------------------------------------------------------------------ search

// Readers type what they remember ("civil war", "spider-man", "hickman") rather than exact titles,
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

// Folding punctuation to a space is right for phrases but wrong for the names readers actually
// type: "spiderman" and "xmen" are at least as common as "Spider-Man" and "X-Men", and against a
// spaced haystack they match nothing at all. Each term is therefore also tested against a form
// with the separators removed. Keeping both forms rather than only the squeezed one means a
// multi-word query still has to match word by word, so "secret wars" cannot be satisfied by an
// unrelated run of letters.
const squeeze = (folded) => folded.replace(/ /g, '');

function haystack(list) {
  return fold([
    list.name,
    list.groupName,
    list.variant,
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
    const squeezed = squeeze(text);
    return terms.every((term) => text.includes(term) || squeezed.includes(term));
  });
}

// ------------------------------------------------------------------ variants

// A reader choosing between "essential" and "complete" is making one decision about a single
// story, so the two orders are presented together under the story's name rather than as
// unrelated catalog entries. A list with no group, or the only surviving member of its group
// after filtering, stays a plain entry, because a heading over one item is noise.
export function groupCatalog(lists) {
  const groups = [];
  const byKey = new Map();

  for (const list of lists) {
    const key = list.group;
    if (!key) {
      groups.push({ key: `list:${list.id}`, name: null, lists: [list] });
      continue;
    }
    const existing = byKey.get(key);
    if (existing) {
      existing.lists.push(list);
      continue;
    }
    // The group takes its name from its first member, so a group is never nameless.
    const group = { key, name: list.groupName ?? list.name, lists: [list] };
    byKey.set(key, group);
    groups.push(group);
  }

  return groups.map((g) => (g.lists.length > 1 ? g : { ...g, name: null }));
}

// What distinguishes this order from its siblings. Falls back to the reading depth, then the
// list's own name, so a variant is never presented as an unlabelled duplicate.
export function variantLabel(list) {
  return list.variant ?? depthLabel(list.depth) ?? list.name;
}
