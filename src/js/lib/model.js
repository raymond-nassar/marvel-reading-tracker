// Normalized application state.
//
// Read state is GLOBAL, keyed by issue id, not stored per list. The bundled Hickman minimal
// (89 issues) and full (219 issues) orders overlap heavily; per-list read flags would let the
// same issue be simultaneously read and unread, and would double-count series progress.
//
// Lists therefore hold ordered ID references only, and every issue's metadata is stored once.

import { compareIssues } from './sort.js';

export const SCHEMA_VERSION = 2;

// The list map is keyed by ids that come from a restored backup, so a reader whose file happens to
// contain a list called `__proto__` or `constructor` used to lose it. An ordinary object answers
// `lists[id]` from its prototype for those names, so the list read back as something that was never
// stored, and writing `lists.__proto__ = list` invoked the setter instead of storing a member. It
// is a null-prototype map now, which has no inherited names to collide with and no setter to invoke.
//
// The helpers exist because the map is produced in eleven places and `{ ...Object.create(null) }` is
// an ordinary object again, so a single `Object.create(null)` in one place evaporates on the reader's
// first rename. A list of sites that must each be written correctly is the same defect as a list of
// sites that must each be guarded, so the rebuild goes through these rather than through a spread,
// and a test scans `src/js` to keep the next site added from reintroducing it.
const emptyLists = () => Object.create(null);
const cloneLists = (lists) => Object.assign(Object.create(null), lists);
const withList = (lists, id, list) => {
  const next = cloneLists(lists);
  next[id] = list;
  return next;
};

export function createEmptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    issues: {},
    read: {},
    overrides: {},
    // Keyed by issue id, and global for the same reason read state is: the bundled minimal and
    // full orders overlap heavily, so a note attached to one path through an issue would be
    // invisible on the other while the reader was looking at the same comic.
    notes: {},
    lists: emptyLists(),
    listOrder: [],
    active: null,
  };
}

export function newId(prefix = 'list') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------- issues

// A hand-added issue with no marvel.com URL gets a negative synthetic id (see doManual), which
// is namespaced away from real Marvel ids. Rejecting those here silently discarded the entry
// while the UI reported success, so negatives are accepted; only 0 and non-integers are refused.
export function normalizeIssue(input) {
  const issueId = Number(input?.issueId ?? input?.id);
  if (!Number.isInteger(issueId) || issueId === 0) return null;
  const synthetic = issueId < 0;
  return {
    issueId,
    title: String(input.title ?? `Issue ${issueId}`).slice(0, MAX_NAME),
    number: clampScalar(input.number ?? null),
    // A synthetic id has no marvel.com page, so inventing one would produce a dead link.
    url: clampUrl(input.url ?? input.detailUrl ?? (synthetic ? null : `https://www.marvel.com/comics/issue/${issueId}/`)),
    seriesId: clampScalar(input.seriesId ?? null),
    seriesName: input.seriesName == null ? null : String(input.seriesName).slice(0, MAX_NAME),
    onSale: clampScalar(input.onSale ?? input.onSaleDate ?? null),
    mu: clampScalar(input.mu ?? input.unlimitedDate ?? null),
    digitalId: clampScalar(input.digitalId ?? null),
    // Rich fields, only present on /v1/issues/{id}; list endpoints omit them.
    // `cover` is { path, ext } WITHOUT the variant suffix; the view appends `/{variant}.{ext}`.
    // We store the URL only and never the image bytes: the browser fetches covers directly
    // from Marvel's own CDN, so this app neither copies nor redistributes artwork.
    cover: normalizeCover(input.cover),
    description: input.description == null ? null : String(input.description).slice(0, MAX_DESCRIPTION),
    pageCount: Number(input.pageCount) > 0 ? Number(input.pageCount) : null,
    creators: Array.isArray(input.creators)
      ? input.creators
        .filter((c) => c && typeof c.name === 'string')
        .slice(0, 24)
        .map((c) => ({ name: String(c.name).slice(0, MAX_NAME), role: String(c.role ?? '').slice(0, MAX_NAME) }))
      : null,
    source: clampScalar(input.source ?? 'api'),
    // "pending" means imported from Markdown and not yet enriched. The UI shows this
    // honestly rather than guessing at missing fields.
    hydrated: clampScalar(input.hydrated ?? (input.digitalId != null || input.seriesId != null)),
  };
}

// Accepts the API's { path, extension } as well as our stored { path, ext }.
// Marvel's CDN serves https, but the API reports http; upgrade it so the browser
// does not block the image as mixed content.
export function normalizeCover(cover) {
  if (!cover || typeof cover !== 'object') return null;
  const path = typeof cover.path === 'string' ? cover.path.replace(/^http:\/\//i, 'https://') : null;
  const ext = cover.ext ?? cover.extension ?? 'jpg';
  if (!path || !/^https:\/\//i.test(path)) return null;
  // Truncating a URL would produce a link to nothing, so an over-long one is refused outright the
  // same way a non-https one is. The longest real cover path across every shipped order is 58.
  if (path.length > MAX_URL) return null;
  return { path, ext: String(ext).replace(/[^a-z0-9]/gi, '').slice(0, 8) || 'jpg' };
}

// A truncated link is a link to the wrong page, so an over-long one becomes no link at all and the
// view falls back to showing no external link rather than a broken one.
function clampUrl(url) {
  if (url == null) return null;
  const s = String(url);
  return s.length > MAX_URL ? null : s;
}

// The scalar fields carry a date, an id, a short code or a flag, and every one of them was passed
// through from a backup untouched, so a hand-edited file put a seven-million-character string where
// a number belongs and cleared every count ceiling with a single issue. Numbers, booleans and nulls
// pass unchanged; a string is held to the name cap, which is more than twice the longest real value
// any of these fields takes. Truncating rather than refusing is right here because none of them is a
// link, so a shortened value is a wrong label rather than a page that does not exist.
function clampScalar(v) {
  return typeof v === 'string' && v.length > MAX_NAME ? v.slice(0, MAX_NAME) : v;
}

// Builds a displayable cover URL. Returns null when there is no cover, so callers
// fall back to the typographic tile rather than requesting a broken image.
export function coverUrl(issue, variant = 'portrait_uncanny') {
  const c = normalizeCover(issue?.cover);
  return c ? `${c.path}/${variant}.${c.ext}` : null;
}

export function upsertIssue(state, input) {
  const issue = normalizeIssue(input);
  if (!issue) return state;
  const prev = state.issues[issue.issueId];
  const merged = prev ? { ...prev, ...stripNulls(issue), hydrated: issue.hydrated || prev.hydrated } : issue;
  return { ...state, issues: { ...state.issues, [issue.issueId]: merged } };
}

function stripNulls(o) {
  const out = {};
  for (const [k, v] of Object.entries(o)) if (v != null) out[k] = v;
  return out;
}

export function getIssue(state, issueId) {
  return state.issues[Number(issueId)] ?? null;
}

// ---------------------------------------------------------------- lists

export const MAX_NAME = 200;
export const MAX_DESCRIPTION = 2000;
export const MAX_NOTE = 2000;

// Measured across all 751 issue records in the twelve shipped orders before these caps were
// applied to the import and restore paths: the longest title is 72 characters, the longest series
// name 79, the longest description 800, the longest detail URL 110, the longest cover path 58, the
// longest creator name 22 and the longest role 16. The caps above and below therefore sit at least
// twice above anything real, so nothing this app has ever displayed is truncated by them.
export const MAX_URL = 500;

// Ceilings rather than budgets, and derived from the cheapest record this app can write rather than
// the richest, because the check must never refuse a backup the app itself produced. A first draft
// took the hydrated issue at 923 characters as the floor and set the ceiling at ten thousand. The
// floor is far below that: a coerced issue is a fixed thirteen fields whether or not any of them
// carries text, so the cheapest costs 267 characters at the margin in the form storage writes, and
// the cheapest list costs 127. The most generous origin any browser grants is 10,485,760
// characters, so no tracker this app can save holds more than about 39,300 issues or 82,600 lists,
// and that first ceiling would have refused a tracker a user could reach by importing. Restoring is
// not the only caller: undoing a restore feeds the pre-restore snapshot back through this same
// check, so a ceiling below what the app can hold would have refused a recovery of the app's own
// data. The ceiling here is six times the issues holdable and three times the lists, and below the
// 355,000 issues an eight mebibyte file can declare, so it still refuses counts absurd on their face.
export const MAX_ISSUES = 250000;
export const MAX_LISTS = 250000;

// Checked against the file's declared size before a byte of it is read, so a file picked by mistake
// costs nothing to refuse. The heaviest backup this app can write is 1,560,536 characters as
// downloaded, measured with all twelve orders imported, every issue read and every issue annotated
// to the note cap. Written entirely in four-byte characters that same backup would be 6,242,144
// bytes, a little under six mebibytes, so eight leaves room above anything honest while still
// refusing a file picked in error before it is loaded into memory.
export const MAX_BACKUP_BYTES = 8 * 1024 * 1024;

// A collected edition's name is a book title, so it needs far less room than a list name, and
// capping it keeps a corrupted or hostile order file from writing an unbounded string into
// storage once per issue.
export const MAX_COLLECTION = 200;

// The collected edition an issue belongs to, as a map from issue id to edition name.
//
// It lives on the list rather than on the issue because the same issue can sit in an ordinary
// issue order and in a trade order at the same time, and only the trade order knows it as part
// of a book. Issues are stored once and shared between lists, so writing it there would leak a
// trade order's structure into every other list holding that issue.
//
// Only ids the list actually holds are kept. A stale entry is invisible until the same issue is
// added back, at which point it would reappear in a book the reader never put it in.
function normalizeCollectedIn(raw, itemIds) {
  const ids = new Set(itemIds);
  const out = {};
  for (const [k, v] of Object.entries(raw ?? {})) {
    const id = Number(k);
    if (!ids.has(id) || typeof v !== 'string' || !v.trim()) continue;
    out[id] = v.trim().slice(0, MAX_COLLECTION);
  }
  return out;
}

export function createList(state, { name, description = '', id = newId(), itemIds = [], catalogId = null, note = '', collectedIn = {} } = {}) {
  const listId = id;
  const ids = dedupe(itemIds.map(Number).filter((n) => Number.isInteger(n) && n !== 0));
  const list = {
    id: listId,
    name: String(name || 'Untitled list').slice(0, MAX_NAME),
    description: String(description || '').slice(0, MAX_DESCRIPTION),
    // The reader's own text about this order, kept apart from `description`, which holds the
    // curated order's authored blurb and is shown in the catalog card and the preview. Letting a
    // note overwrite that would destroy text the reader never wrote and cannot get back.
    note: normalizeNote(note),
    created: Date.now(),
    // Which catalog entry this list was imported from, when it was. It is what lets the
    // catalog show "in library" instead of offering to import a second copy, so it has to
    // survive a reload rather than being tracked only in memory.
    catalogId: catalogId ? String(catalogId).slice(0, MAX_NAME) : null,
    itemIds: ids,
    collectedIn: normalizeCollectedIn(collectedIn, ids),
  };
  return {
    ...state,
    lists: withList(state.lists, listId, list),
    listOrder: [...state.listOrder, listId],
    active: state.active ?? listId,
  };
}

export function renameList(state, listId, name, description) {
  const list = state.lists[listId];
  if (!list) return state;
  const next = { ...list, name: String(name ?? list.name).slice(0, MAX_NAME) };
  if (description !== undefined) next.description = String(description).slice(0, MAX_DESCRIPTION);
  return { ...state, lists: withList(state.lists, listId, next) };
}

// Returns { state, listId } because the caller needs the copy's id, and the usual trick of
// reading the last entry of listOrder does not work here: the copy is inserted next to its
// original rather than appended.
//
// Read progress is deliberately NOT copied. It is global, keyed by issue id (see the note at
// the top of this file), so the copy shares it with the original automatically: marking an
// issue read in either one shows it read in both. That is the point of duplicating an event
// order to try a different path through it, and it is why the copy needs its own itemIds
// array rather than a shared reference, so reordering one list never disturbs the other.
export function duplicateList(state, listId, { name } = {}) {
  const source = state.lists[listId];
  if (!source) return { state, listId: null };

  const id = newId();
  const copy = {
    id,
    name: name ? String(name).slice(0, MAX_NAME) : copyName(state, source.name),
    description: String(source.description || '').slice(0, MAX_DESCRIPTION),
    // The note travels with the copy. Duplicating an order is how a reader tries a different path
    // through it, and what they wrote about the order is still true of the copy.
    note: source.note ?? '',
    created: Date.now(),
    // A duplicate is the reader's own working copy, so it does not inherit the claim to be
    // the catalog import. Otherwise two lists would answer to the same catalog entry and
    // "in library" would point at whichever was found first.
    catalogId: null,
    itemIds: [...source.itemIds],
    // The copy is the same books in the same order, so it carries the same edition names. A
    // reader duplicating a trade order to reshuffle it would otherwise get a flat issue list
    // and no way to see which volume anything came from.
    collectedIn: { ...(source.collectedIn ?? {}) },
  };

  const listOrder = [...state.listOrder];
  const at = listOrder.indexOf(listId);
  listOrder.splice(at < 0 ? listOrder.length : at + 1, 0, id);

  return {
    state: { ...state, lists: withList(state.lists, id, copy), listOrder, active: state.active ?? id },
    listId: id,
  };
}

// "X" becomes "X (copy)", then "X (copy 2)" on the next duplication, so repeated copies stay
// tellable apart in the rail. The base is trimmed to make room for the suffix: appending first
// and slicing afterwards would cut the suffix off a maximally long name, producing a copy whose
// name was identical to the original.
function copyName(state, base) {
  const taken = new Set(Object.values(state.lists).map((l) => l.name));
  const fit = (suffix) => base.slice(0, MAX_NAME - suffix.length).trimEnd() + suffix;
  let candidate = fit(' (copy)');
  for (let n = 2; taken.has(candidate) && n <= 999; n += 1) candidate = fit(` (copy ${n})`);
  return candidate;
}

export function deleteList(state, listId) {
  if (!state.lists[listId]) return state;
  const lists = cloneLists(state.lists);
  delete lists[listId];
  const listOrder = state.listOrder.filter((id) => id !== listId);
  const active = state.active === listId ? (listOrder[0] ?? null) : state.active;
  // Issue metadata and read state intentionally survive: the same issues may be in other
  // lists, and progress should never be destroyed by deleting a list.
  return { ...state, lists, listOrder, active };
}

// Puts a deleted list back where it was. The caller holds the removed list object and the
// index it occupied, because `deleteList` is the only thing that knows both and neither
// survives in the state afterwards.
//
// Read progress is not a consideration in either direction. It is global and keyed by issue
// id, so deleting a list never touched it and restoring one never has to put it back.
//
// A list whose id is present again is not restored, and neither is one whose catalog entry is
// already answered. Undo is offered for the rest of the session, so the buffer can outlive the
// deletion by a long way: an undone restore can bring the same id back, and a second import can
// bring the same order back under a new id. Splicing the stale copy in on top of either would
// destroy work rather than recover it, or leave two lists claiming one catalog entry, which is
// exactly the state `duplicateList` strips `catalogId` to avoid.
export function restoreList(state, list, { index = null, active = false } = {}) {
  if (!list?.id || state.lists[list.id]) return state;
  if (list.catalogId && listForCatalogId(state, list.catalogId)) return state;
  const listOrder = [...state.listOrder];
  const at = Number.isInteger(index) && index >= 0 && index <= listOrder.length ? index : listOrder.length;
  listOrder.splice(at, 0, list.id);
  return {
    ...state,
    lists: withList(state.lists, list.id, list),
    listOrder,
    active: active || state.active == null ? list.id : state.active,
  };
}

export function setActive(state, listId) {
  return state.lists[listId] ? { ...state, active: listId } : state;
}

// The list a catalog entry was imported into, if it is still there. Deleting the list is
// what puts an order back on offer, so this is read from state rather than remembered.
export function listForCatalogId(state, catalogId) {
  if (!catalogId) return null;
  for (const id of state.listOrder) {
    if (state.lists[id]?.catalogId === catalogId) return state.lists[id];
  }
  return null;
}

// ---------------------------------------------------------------- items

export function addIssuesToList(state, listId, inputs, { at = null, sort = false } = {}) {
  const list = state.lists[listId];
  if (!list) return { state, added: 0, skipped: 0 };

  let next = state;
  const incoming = [];
  // Which collected edition each incoming issue belongs to. Read from the input rather than
  // from the stored issue, because normalizeIssue drops it on purpose: it describes this
  // list's structure, not the issue.
  const editions = new Map();
  for (const input of inputs) {
    const issue = normalizeIssue(input);
    if (!issue) continue;
    next = upsertIssue(next, issue);
    incoming.push(issue.issueId);
    if (typeof input?.collectedIn === 'string' && input.collectedIn.trim()) {
      editions.set(issue.issueId, input.collectedIn.trim().slice(0, MAX_COLLECTION));
    }
  }

  const ordered = sort
    ? [...incoming].sort((a, b) => compareIssues(next.issues[a], next.issues[b]))
    : incoming;

  const existing = new Set(list.itemIds);
  const fresh = dedupe(ordered).filter((id) => !existing.has(id));
  const skipped = ordered.length - fresh.length;

  const itemIds = [...list.itemIds];
  const index = at == null ? itemIds.length : clamp(at, 0, itemIds.length);
  itemIds.splice(index, 0, ...fresh);

  // Only the issues actually added take an edition name. An issue the list already held keeps
  // the edition it was added under, so re-importing an order cannot move an issue into a
  // different book than the one the reader has been working through.
  const collectedIn = { ...(list.collectedIn ?? {}) };
  for (const id of fresh) {
    const name = editions.get(id);
    if (name) collectedIn[id] = name;
  }

  return {
    state: { ...next, lists: withList(next.lists, listId, { ...list, itemIds, collectedIn }) },
    added: fresh.length,
    skipped,
  };
}

export function removeFromList(state, listId, issueId) {
  const list = state.lists[listId];
  if (!list) return state;
  const id = Number(issueId);
  const itemIds = list.itemIds.filter((n) => n !== id);
  if (itemIds.length === list.itemIds.length) return state;
  // Dropped with the issue. Left behind, it would put the issue back into a book it had been
  // removed from the moment it was added again, and grow storage for a list that no longer
  // holds it.
  const collectedIn = { ...(list.collectedIn ?? {}) };
  delete collectedIn[id];
  return { ...state, lists: withList(state.lists, listId, { ...list, itemIds, collectedIn }) };
}

export function moveItem(state, listId, issueId, delta) {
  const list = state.lists[listId];
  if (!list) return state;
  const itemIds = [...list.itemIds];
  const from = itemIds.indexOf(Number(issueId));
  if (from < 0) return state;
  const to = clamp(from + delta, 0, itemIds.length - 1);
  if (to === from) return state;
  itemIds.splice(to, 0, ...itemIds.splice(from, 1));
  return { ...state, lists: withList(state.lists, listId, { ...list, itemIds }) };
}

export function moveItemTo(state, listId, issueId, index) {
  const list = state.lists[listId];
  if (!list) return state;
  const from = list.itemIds.indexOf(Number(issueId));
  if (from < 0) return state;
  return moveItem(state, listId, issueId, clamp(index, 0, list.itemIds.length - 1) - from);
}

// ---------------------------------------------------------------- read state

// The timestamp is coerced here rather than only in `coerce`, because `coerce` runs on the v2
// branch of `migrate` alone. The v1 branch reaches read state through this function instead, so a
// v1 backup carrying `readAt: "banana"` used to land unchanged in the read map and reach the
// screen as "Invalid Date". Written the same way `coerce` writes it, so a value restored from a
// v1 backup and the same value reloaded from storage cannot disagree.
export function markRead(state, issueId, read = true, at = Date.now()) {
  const id = Number(issueId);
  if (!Number.isInteger(id)) return state;
  const next = { ...state.read };
  if (read) next[id] = Number(at) || Date.now();
  else delete next[id];
  return { ...state, read: next };
}

export function toggleRead(state, issueId) {
  return markRead(state, issueId, !isRead(state, issueId));
}

export function isRead(state, issueId) {
  return Object.prototype.hasOwnProperty.call(state.read, Number(issueId));
}

export function markManyRead(state, issueIds, read = true) {
  let next = state;
  for (const id of issueIds) next = markRead(next, id, read);
  return next;
}

export function setOverride(state, issueId, value) {
  const id = Number(issueId);
  const overrides = { ...state.overrides };
  if (value === 'available' || value === 'unavailable') overrides[id] = value;
  else delete overrides[id];
  return { ...state, overrides };
}

// ---------------------------------------------------------------- notes

// Trimmed and capped, and an empty result deletes rather than storing "". That keeps "has a note"
// a presence check at every call site, and stops a note the reader cleared from riding along in
// every future backup as an empty string.
export function normalizeNote(text) {
  return String(text ?? '').trim().slice(0, MAX_NOTE);
}

export function setIssueNote(state, issueId, text) {
  const id = Number(issueId);
  if (!Number.isInteger(id) || id === 0) return state;
  const note = normalizeNote(text);
  const notes = { ...state.notes };
  if (note) notes[id] = note;
  else delete notes[id];
  return { ...state, notes };
}

export function issueNote(state, issueId) {
  return state.notes?.[Number(issueId)] ?? '';
}

// The list's note lives on the list object rather than in a second map, because it dies with the
// list. An issue note outlives every list that introduced the issue, exactly as read state does.
export function setListNote(state, listId, text) {
  const list = state.lists[listId];
  if (!list) return state;
  return { ...state, lists: withList(state.lists, listId, { ...list, note: normalizeNote(text) }) };
}

// ---------------------------------------------------------------- derived

export function upNext(state, listId) {
  const list = state.lists[listId];
  if (!list) return null;
  const id = list.itemIds.find((i) => !isRead(state, i));
  return id == null ? null : (state.issues[id] ?? { issueId: id, title: `Issue ${id}` });
}

export function listProgress(state, listId) {
  const list = state.lists[listId];
  if (!list) return { read: 0, total: 0 };
  const total = list.itemIds.length;
  const read = list.itemIds.reduce((n, id) => n + (isRead(state, id) ? 1 : 0), 0);
  return { read, total };
}

// Aggregated over UNIQUE issue ids, so an issue in two lists counts once. Given a listId it counts
// that list alone; a reader inside one crossover was otherwise shown totals inflated by every other
// list they had imported, which is the number they are least able to act on.
export function seriesProgress(state, listId = null) {
  const tracked = new Set();
  if (listId == null) {
    for (const id of state.listOrder) {
      for (const issueId of state.lists[id]?.itemIds ?? []) tracked.add(issueId);
    }
  } else {
    for (const issueId of state.lists[listId]?.itemIds ?? []) tracked.add(issueId);
  }
  const bySeries = new Map();
  for (const id of tracked) {
    const issue = state.issues[id];
    const key = issue?.seriesId ?? `unknown:${issue?.seriesName ?? 'Unsorted'}`;
    if (!bySeries.has(key)) {
      bySeries.set(key, {
        seriesId: issue?.seriesId ?? null,
        seriesName: issue?.seriesName ?? 'Unknown series',
        tracked: 0,
        read: 0,
      });
    }
    const row = bySeries.get(key);
    row.tracked += 1;
    if (isRead(state, id)) row.read += 1;
  }
  return [...bySeries.values()].sort((a, b) => a.seriesName.localeCompare(b.seriesName));
}

// Which of the reader's lists an issue is in, named, in rail order. Read state and issue
// metadata both outlive the list that introduced them, by the deliberate choice recorded above
// `deleteList`, so an issue can be read and belong to nothing at all. The Library views are the
// first surface that can say so, and they can only say it if this returns nothing rather than
// guessing at a list.
export function listsContaining(state, issueId) {
  const id = Number(issueId);
  const names = [];
  for (const listId of state.listOrder) {
    const list = state.lists[listId];
    if (list?.itemIds.includes(id)) names.push(list.name);
  }
  return names;
}

// The one row shape both Library views render, so a row that renders in one renders in the other.
// The fallback matches `listItems`: an id with no metadata is shown as itself rather than dropped,
// because a read record for an issue the app has otherwise forgotten is exactly what these views
// exist to make visible.
function libraryRow(state, issueId) {
  const id = Number(issueId);
  const issue = state.issues[id] ?? { issueId: id, title: `Issue ${id}`, hydrated: false, source: 'unknown' };
  return {
    ...issue,
    read: isRead(state, id),
    readAt: state.read[id] ?? null,
    lists: listsContaining(state, id),
  };
}

// Newest first, because the question this answers is what you have been reading, and the timestamp
// `markRead` already stores is the only ordering the data supports. The tie break is explicit
// rather than left to key order: `markManyRead` calls `markRead` in a loop, each with its own
// `Date.now()`, so a bulk mark produces runs of equal timestamps, and integer-like keys enumerate
// ascending, which would sort an arbitrary half of one bulk mark above the other.
export function readIssues(state) {
  return Object.keys(state.read)
    .map((id) => libraryRow(state, id))
    .sort((a, b) => (b.readAt ?? 0) - (a.readAt ?? 0) || a.issueId - b.issueId);
}

// By title rather than by id. A hand-added entry with a marvel.com URL keeps that issue's real id
// and one without gets a negative synthetic id from the clock, so the two kinds cannot be ordered
// against each other by id at all: every entry of the second kind would sort below every entry of
// the first for no reason a reader could see.
export function manualIssues(state) {
  return Object.values(state.issues)
    .filter((issue) => issue.source === 'manual')
    .map((issue) => libraryRow(state, issue.issueId))
    .sort((a, b) => String(a.title).localeCompare(String(b.title)));
}

export function pendingIssueIds(state) {
  const tracked = new Set();
  for (const listId of state.listOrder) {
    for (const id of state.lists[listId]?.itemIds ?? []) tracked.add(id);
  }
  return [...tracked].filter((id) => {
    const issue = state.issues[id];
    return issue && !issue.hydrated && issue.source !== 'manual';
  });
}

// Hydration priority: whatever you are about to read, plus a short lookahead.
export function hydrationOrder(state, listId, lookahead = 5) {
  const pending = new Set(pendingIssueIds(state));
  const priority = [];
  const list = state.lists[listId];
  if (list) {
    const unread = list.itemIds.filter((id) => !isRead(state, id));
    for (const id of unread.slice(0, lookahead + 1)) if (pending.has(id)) priority.push(id);
  }
  const rest = [...pending].filter((id) => !priority.includes(id));
  return [...priority, ...rest];
}

// ---------------------------------------------------------------- persistence shape

export function migrate(raw) {
  if (!raw || typeof raw !== 'object') return createEmptyState();
  const version = Number(raw.schemaVersion ?? 1);

  if (version === SCHEMA_VERSION) return coerce(raw);

  if (version < 2) {
    // v1 stored full item objects inside each list, with a per-list `read` boolean.
    // Collapse to global read state; if an issue was read anywhere, it is read.
    let next = createEmptyState();
    const lists = Array.isArray(raw.lists) ? raw.lists : Object.values(raw.lists ?? {});
    for (const oldList of lists) {
      const items = Array.isArray(oldList?.items) ? oldList.items : [];
      next = createList(next, {
        name: oldList?.name ?? 'Imported list',
        description: oldList?.description ?? '',
      });
      const listId = next.listOrder[next.listOrder.length - 1];
      const res = addIssuesToList(next, listId, items);
      next = res.state;
      for (const it of items) {
        if (it?.read) next = markRead(next, it.issueId ?? it.id, true, it.readAt ?? Date.now());
      }
    }
    return next;
  }

  // Newer than we understand: refuse rather than silently mangling it.
  throw new Error(`Unsupported schema version ${version}; this build understands ${SCHEMA_VERSION}.`);
}

function coerce(raw) {
  const base = createEmptyState();
  const issues = {};
  for (const v of Object.values(raw.issues ?? {})) {
    const n = normalizeIssue(v);
    if (n) issues[n.issueId] = n;
  }
  const read = {};
  for (const [k, v] of Object.entries(raw.read ?? {})) {
    const id = Number(k);
    if (Number.isInteger(id)) read[id] = Number(v) || Date.now();
  }
  const overrides = {};
  for (const [k, v] of Object.entries(raw.overrides ?? {})) {
    if (v === 'available' || v === 'unavailable') overrides[Number(k)] = v;
  }
  // Measured before this line existed: a note set on an issue was gone on the next page load,
  // because this function rebuilds state field by field and anything it does not name is dropped.
  // The same is true of the list's note below.
  const notes = {};
  for (const [k, v] of Object.entries(raw.notes ?? {})) {
    const id = Number(k);
    const note = normalizeNote(v);
    if (Number.isInteger(id) && id !== 0 && note) notes[id] = note;
  }
  const lists = emptyLists();
  for (const [k, v] of Object.entries(raw.lists ?? {})) {
    if (!v || typeof v !== 'object') continue;
    const itemIds = dedupe((Array.isArray(v.itemIds) ? v.itemIds : []).map(Number).filter((n) => Number.isInteger(n) && n !== 0));
    lists[k] = {
      id: k,
      name: String(v.name ?? 'Untitled list').slice(0, MAX_NAME),
      description: String(v.description ?? '').slice(0, MAX_DESCRIPTION),
      note: normalizeNote(v.note),
      created: Number(v.created) || Date.now(),
      catalogId: typeof v.catalogId === 'string' && v.catalogId ? v.catalogId.slice(0, MAX_NAME) : null,
      itemIds,
      // Rebuilt rather than carried across, so a hand-edited backup cannot name issues the
      // list does not hold. A list saved before trade orders existed simply has none, which is
      // why this is not a schema version bump: the field's absence is a valid state, not an
      // older shape needing migration.
      collectedIn: normalizeCollectedIn(v.collectedIn, itemIds),
    };
  }
  // Deduplicated because the filter tests membership rather than uniqueness, so one valid id
  // repeated survived once per repetition: 300,000 entries naming a single list fitted in a
  // 1.14 mebibyte file, cleared every ceiling, and made the rail append 300,000 nodes on every
  // update. Deduplicated, the order is bounded by the number of lists, which is already capped.
  const listOrder = dedupe((Array.isArray(raw.listOrder) ? raw.listOrder : Object.keys(lists)).filter((id) => lists[id]));
  // Backfilled through a Set rather than Array.includes, which made this loop quadratic in the
  // number of lists. That cost 3 milliseconds while the ceiling was 1,000 and 26.6 seconds once it
  // was 250,000, on a 5.38 mebibyte file that clears the size guard and every count check, so the
  // tab froze before a byte was written. The same input takes 125 milliseconds through a Set, and
  // the order it produces is the one Array.includes produced.
  const seen = new Set(listOrder);
  for (const id of Object.keys(lists)) if (!seen.has(id)) listOrder.push(id);

  return {
    ...base,
    issues,
    read,
    overrides,
    notes,
    lists,
    listOrder,
    active: lists[raw.active] ? raw.active : (listOrder[0] ?? null),
  };
}

// Structural validation for restore. Returns { ok, errors, state }.
export function validateBackup(raw) {
  const errors = [];
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, errors: ['Backup is not an object.'], state: null };
  }
  if (raw.schemaVersion == null) errors.push('Missing schemaVersion.');
  if (Number(raw.schemaVersion) > SCHEMA_VERSION) {
    errors.push(`Backup schema ${raw.schemaVersion} is newer than this app (${SCHEMA_VERSION}).`);
  }
  if (raw.lists != null && (typeof raw.lists !== 'object' || Array.isArray(raw.lists))) {
    errors.push('lists must be an object.');
  }
  if (raw.issues != null && (typeof raw.issues !== 'object' || Array.isArray(raw.issues))) {
    errors.push('issues must be an object.');
  }
  if (raw.read != null && (typeof raw.read !== 'object' || Array.isArray(raw.read))) {
    errors.push('read must be an object.');
  }
  if (raw.notes != null && (typeof raw.notes !== 'object' || Array.isArray(raw.notes))) {
    errors.push('notes must be an object.');
  }
  if (errors.length) return { ok: false, errors, state: null };

  // Counted before coercion, because coercion is what builds the oversized object: an issue costs
  // 23.6 characters at its cheapest in a file and 280 once coerced, an amplification of nearly
  // twelve. The ceiling sits above anything this app can hold, so a tracker too large for the
  // origin is still accepted here and still refused by the write, with the honest quota message it
  // already had. What this buys is refusing a file whose declared counts are absurd on their face,
  // for one pass over the keys, before coercion allocates for them.
  for (const [label, value, cap] of [
    ['issues', raw.issues, MAX_ISSUES],
    ['read markers', raw.read, MAX_ISSUES],
    ['availability overrides', raw.overrides, MAX_ISSUES],
    ['notes', raw.notes, MAX_ISSUES],
    ['lists', raw.lists, MAX_LISTS],
  ]) {
    if (!value || typeof value !== 'object') continue;
    const n = Object.keys(value).length;
    if (n > cap) errors.push(`Backup declares ${n} ${label}, and this app holds at most ${cap}.`);
  }
  if (raw.lists && typeof raw.lists === 'object' && !Array.isArray(raw.lists)) {
    // A version 1 backup has no top-level issues map: it carries whole issue objects inside each
    // list's `items`, which migrate reads and turns into exactly that many issues. The loop above
    // therefore scored a v1 file at zero however large it was, and 50,000 items in a 1.50 mebibyte
    // file built 50,000 issues in 3.8 seconds. Summed rather than checked per list, because one map
    // is what they become.
    let carried = 0;
    for (const v of Object.values(raw.lists)) {
      const n = Array.isArray(v?.itemIds) ? v.itemIds.length : 0;
      if (Array.isArray(v?.items)) carried += v.items.length;
      if (n > MAX_ISSUES) {
        errors.push(`One list declares ${n} issues, and this app holds at most ${MAX_ISSUES} in a list.`);
        break;
      }
    }
    if (carried > MAX_ISSUES) {
      errors.push(`Backup declares ${carried} issues inside its lists, and this app holds at most ${MAX_ISSUES}.`);
    }
  }
  if (errors.length) return { ok: false, errors, state: null };

  try {
    return { ok: true, errors: [], state: migrate(raw) };
  } catch (err) {
    return { ok: false, errors: [err.message], state: null };
  }
}

export function exportBackup(state) {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'marvel-reading-tracker',
    issues: state.issues,
    read: state.read,
    overrides: state.overrides,
    // Named explicitly, like every other key here. This function does not spread, so a map it
    // does not name never reaches the backup file or localStorage at all. Measured: without this
    // line an issue note was absent from the exported JSON, not merely dropped on the way back in.
    notes: state.notes ?? {},
    lists: state.lists,
    listOrder: state.listOrder,
    active: state.active,
  };
}

export function listItems(state, listId) {
  const list = state.lists[listId];
  if (!list) return [];
  const editions = list.collectedIn ?? {};
  return list.itemIds.map((id) => ({
    ...(state.issues[id] ?? { issueId: id, title: `Issue ${id}`, hydrated: false, source: 'unknown' }),
    read: isRead(state, id),
    override: state.overrides[id] ?? null,
    note: issueNote(state, id),
    collectedIn: editions[id] ?? null,
  }));
}

// The collected editions a list is divided into, in reading order, each with its own progress.
//
// Editions are runs of consecutive items rather than a grouping of the whole list, because
// itemIds is the reading order and the reader may reorder it. A book split in two by a move
// shows as two runs, which is the truth about the order they are now in; silently regrouping
// them would show a reading order the list does not have.
//
// Returns [] for a list with no editions at all, so a caller can tell "not a trade order" from
// "a trade order whose books are all empty" without inspecting the items.
export function listCollections(state, listId) {
  const items = listItems(state, listId);
  const runs = [];
  for (const item of items) {
    const last = runs[runs.length - 1];
    if (last && last.name === item.collectedIn) last.items.push(item);
    else runs.push({ name: item.collectedIn, items: [item] });
  }
  if (!runs.some((r) => r.name)) return [];
  return runs.map((run) => ({
    name: run.name,
    items: run.items,
    total: run.items.length,
    read: run.items.filter((i) => i.read).length,
  }));
}

// ---------------------------------------------------------------- helpers

function dedupe(arr) {
  return [...new Set(arr)];
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}
