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
    // The year this order's reading starts, or null when it ranges across the timeline rather
    // than sitting at a point on it. What the catalog is ordered by; see sortCatalog.
    timeline: Number.isInteger(raw.timeline) && raw.timeline >= 1939 ? raw.timeline : null,
  };
}

// The catalog is a shelf, and a shelf has an order. Left to the manifest's own, it is the order
// the lists happened to be added in, which put the 2004 story that begins the modern Avengers era
// after the 2020 one that ends it. Sorting by the year each order's reading starts puts the shared
// story back in the sequence it was told, which is the order a reader works through it in.
//
// An order with no year is not undated, it is unplaceable: a best-of that opens in 2004 and then
// works back to 1966 sits at no point on the timeline, and giving it one would claim something
// false. Those follow the dated run rather than being scattered through it, so the shelf reads as
// the story first and the retrospectives after.
//
// The sort is stable, so orders that begin in the same year keep the manifest's order, and two
// reading paths through one story stay together where their group expects them.
export function sortCatalog(lists) {
  return [...lists].sort((a, b) => {
    if (a.timeline === b.timeline) return 0;
    if (a.timeline == null) return 1;
    if (b.timeline == null) return -1;
    return a.timeline - b.timeline;
  });
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

  // Sorted here rather than in each view, because the home grid shows only the first handful and
  // the catalog shows them all: two call sites ordering differently would mean the shelf a reader
  // skims and the shelf they search were not the same shelf.
  //
  // Paths are passed through unvalidated because `pathPlacements` resolves them against the lists
  // that survived, and a path naming an entry this function just dropped is one it will skip. The
  // manifest is where a path is checked; by the time it is in the generated catalog it has been.
  return { lists: sortCatalog(lists), paths: Array.isArray(raw?.paths) ? raw.paths : [], dropped };
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
  const facets = [{ key: 'all', label: 'All', count: countStories(all) }];

  const beginner = countStories(all.filter(isBeginnerOrder));
  if (beginner) facets.push({ key: 'beginner', label: 'Beginner-friendly', count: beginner });

  for (const c of catalogCategories(all)) {
    facets.push({
      key: `type:${c.key}`,
      label: c.key === UNCATEGORIZED ? 'Other' : (TYPE_FACET_LABELS[c.key] ?? typeLabel(c.key)),
      count: countStories(filterByCategory(all, c.key)),
    });
  }

  // Reading in collected editions is a way of collecting, not a kind of story, so it cuts
  // across the type chips rather than sitting inside one. It is listed only when such an order
  // exists, like every other facet here.
  const trade = countStories(all.filter(isTradeOrder));
  if (trade) facets.push({ key: 'trade', label: 'By collected edition', count: trade });

  const short = countStories(all.filter(isShortOrder));
  if (short) facets.push({ key: 'short', label: `Short (under ${SHORT_ORDER_MAX} issues)`, count: short });

  return facets;
}

// How many stories a set of orders amounts to. The shelf shows one card per story, so a chip
// counting orders would promise more cards than the grid then holds: eight events, six cards.
export function countStories(lists) {
  const keys = new Set();
  for (const list of Array.isArray(lists) ? lists : []) keys.add(storyKey(list));
  return keys.size;
}

// The identity of the story an order is a path through. A story with no group is its own story,
// which is why the key falls back to the list's id, and the prefix keeps a list id from colliding
// with a group name that happens to match it.
//
// Shared rather than written out at each site because three places now depend on two orders
// agreeing about whether they are the same story: the story count, the shelf's grouping, and the
// reading path's placement. Two copies of this expression is two chances for them to disagree.
export function storyKey(list) {
  return list?.group ?? `list:${list?.id}`;
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
      groups.push({ key: storyKey(list), name: null, lists: [list] });
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

  return groups.map((g) => (g.lists.length > 1
    ? { ...g, lists: orderPaths(g.lists) }
    : { ...g, name: null }));
}

// The paths through one story, shortest commitment first. Ordered by the declared reading depths
// rather than by issue count, which is the same ladder for five of the six bundled groups and the
// right answer for the sixth: the two Ultimate orders differ in format rather than in length, and
// six issues between them would otherwise decide which one a reader is offered first. Sorting is
// stable, so paths sharing a depth keep the order the catalog gave them, and a depth the manifest
// does not declare sorts last rather than ahead of the ones that do.
function orderPaths(lists) {
  return [...lists].sort((a, b) => depthRank(a) - depthRank(b));
}

function depthRank(list) {
  const i = READING_DEPTHS.indexOf(list.depth);
  return i < 0 ? READING_DEPTHS.length : i;
}

// Which path a story shows before the reader picks one. A story already in the library is shown at
// the path it was added as: a card offering to add a second path while the reader already owns
// another is a card disagreeing with its own button, and it is how the same story gets added twice.
// Otherwise the shallowest, which is the least reading to commit to and is one click from the rest.
//
// `owns` is passed in rather than read here, because this module knows about the catalog and
// nothing about the reader's library.
export function defaultPath(group, owns = () => false) {
  const lists = group?.lists ?? [];
  return lists.find((list) => owns(list)) ?? lists[0] ?? null;
}

// The reader's own choice, if it still names a path this story has. A stored choice outlives the
// catalog it was made against: a search can narrow a story to one path, and a data change can
// remove the path entirely, so a choice that no longer matches is dropped in favour of the default
// rather than leaving the card showing nothing.
export function pickPath(group, chosenId, owns) {
  const lists = group?.lists ?? [];
  return lists.find((list) => list.id === chosenId) ?? defaultPath(group, owns);
}

// What distinguishes this order from its siblings. Falls back to the reading depth, then the
// list's own name, so a variant is never presented as an unlabelled duplicate.
export function variantLabel(list) {
  return list.variant ?? depthLabel(list.depth) ?? list.name;
}

// ------------------------------------------------------------------ reading paths

// Where each story sits on a named reading path. A path is the one thing the catalog could not
// say before: `group` records two orders as two readings of the *same* story, which is the
// opposite relationship, so nothing stated that one story is read after another.
//
// Returns a map keyed by story rather than answering one story at a time, because the shelf draws
// nineteen rows and resolving each one against every path would be the same work nineteen times.
//
// Keyed on the story, not the order, so switching between two readings of one story cannot change
// the answer. That is what makes the placement safe to compute once, outside the row's repaint:
// House of M is step three whichever of its two readings the reader picks.
export function pathPlacements(paths, lists) {
  const placements = new Map();
  const all = Array.isArray(lists) ? lists : [];
  if (!Array.isArray(paths) || !all.length) return placements;

  const storyName = new Map();
  const storyOfOrder = new Map();
  for (const list of all) {
    const key = storyKey(list);
    // The story's name, taken the way the shelf takes it, so a stop reads "House of M" rather
    // than naming one particular reading of it.
    if (!storyName.has(key)) storyName.set(key, list.groupName ?? list.name);
    storyOfOrder.set(list.id, key);
  }

  for (const path of paths) {
    const id = str(path?.id);
    const name = str(path?.name);
    if (!id || !name) continue;

    // A step naming an order the catalog dropped resolves to nothing and is skipped, and the
    // remaining stops are numbered over what survived. `parseCatalog` drops entries it cannot
    // use, so a path valid when it was written can arrive here with a hole in it. Telling a
    // reader they are at step 4 of 10 when the app can only show nine of them states a total it
    // cannot account for; showing 4 of 9 is at least a shelf they can count.
    const stops = [];
    for (const step of Array.isArray(path?.steps) ? path.steps : []) {
      const key = storyOfOrder.get(str(step));
      if (!key || stops.some((s) => s.key === key)) continue;
      stops.push({ key, name: storyName.get(key) });
    }
    // One stop is not a sequence, and the reader learns nothing from "step 1 of 1".
    if (stops.length < 2) continue;

    stops.forEach((stop, i) => {
      // A story reachable from two paths keeps the first that names it. Arbitrary, but stable,
      // and the alternative is a row whose position changes with the manifest's ordering.
      if (placements.has(stop.key)) return;
      placements.set(stop.key, {
        pathId: id,
        pathName: name,
        position: i + 1,
        total: stops.length,
        previous: i > 0 ? stops[i - 1] : null,
        next: i < stops.length - 1 ? stops[i + 1] : null,
      });
    });
  }

  return placements;
}

// The year an order's reading starts, as a phrase. Null means the order ranges across the
// timeline rather than sitting on it, which is what a best-of does, so it yields nothing rather
// than "unknown": seven of the 26 bundled orders are in that state and none of them is undated by
// accident.
export function timelineLabel(list) {
  const year = list?.timeline;
  return Number.isInteger(year) ? `Starts ${year}` : null;
}

// ------------------------------------------------------------------ shelf sections

// The shelf's two halves. A reader who does not know where to start is choosing between two
// different kinds of reading, and until now the shelf offered them as one undifferentiated list
// whose boundary was real but unexplained: the year sort already puts every character run last,
// because none of them carries a year, and nothing on the page said why they sat together.
//
// Keyed on `type` rather than on whether an order carries a `timeline` year. Today those two rules
// produce the same split, but that is a property of the data as it stands rather than a rule
// anything enforces, and a dated character run would silently land in the shared story.
//
// `creator-run` sits with the shared story rather than with the character runs, on the evidence
// rather than on the label. Both bundled creator-run orders are one story, Hickman's Avengers, and
// that story is stop 8 of the modern Avengers path. Filing it under the spotlights would take a
// stop out of the middle of the sequence and put it in the half the sequence does not run through.
const SPOTLIGHT_TYPES = new Set(['character-run']);

export const SHELF_SECTIONS = [
  {
    key: 'story',
    heading: 'The shared story',
    blurb: 'Events and eras in the order they happened. These build on each other, so if you want a route through them, look for the Start here badge and follow the steps from there.',
  },
  {
    key: 'spotlight',
    heading: 'Character spotlights',
    blurb: 'Everything worth reading about one hero or team, in one place. These stand on their own, so you can begin with whichever character you already like.',
  },
];

// Which half a story belongs to. Every one of its readings has to be a spotlight, not merely one of
// them: a story carrying even one shared-universe order stays in the shared story, which is the
// side that cannot cut a reading path in two. No bundled story mixes types today, so the rule
// decides nothing yet. It decides what happens the first time one does.
export function sectionKey(story) {
  const lists = Array.isArray(story?.lists) ? story.lists : [];
  return lists.length && lists.every((l) => SPOTLIGHT_TYPES.has(l?.type)) ? 'spotlight' : 'story';
}

// The shelf, divided, in the order the sections are declared and with each section's own order left
// exactly as it arrived. Sorting already placed the rows; this only says where the boundary is.
//
// An empty section is dropped rather than rendered with a heading and nothing under it, so a search
// or a facet that narrows the shelf to one kind of reading still names the kind it is showing.
export function shelfSections(stories) {
  const all = Array.isArray(stories) ? stories : [];
  return SHELF_SECTIONS
    .map((section) => ({ ...section, stories: all.filter((s) => sectionKey(s) === section.key) }))
    .filter((section) => section.stories.length);
}
