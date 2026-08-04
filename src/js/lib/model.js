// Normalized application state.
//
// Read state is GLOBAL, keyed by issue id, not stored per list. The bundled Hickman minimal
// (89 issues) and full (219 issues) orders overlap heavily; per-list read flags would let the
// same issue be simultaneously read and unread, and would double-count series progress.
//
// Lists therefore hold ordered ID references only, and every issue's metadata is stored once.

import { compareIssues } from './sort.js';

export const SCHEMA_VERSION = 2;

export function createEmptyState() {
  return {
    schemaVersion: SCHEMA_VERSION,
    issues: {},
    read: {},
    overrides: {},
    lists: {},
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
    title: String(input.title ?? `Issue ${issueId}`),
    number: input.number ?? null,
    // A synthetic id has no marvel.com page, so inventing one would produce a dead link.
    url: input.url ?? input.detailUrl ?? (synthetic ? null : `https://www.marvel.com/comics/issue/${issueId}/`),
    seriesId: input.seriesId ?? null,
    seriesName: input.seriesName ?? null,
    onSale: input.onSale ?? input.onSaleDate ?? null,
    mu: input.mu ?? input.unlimitedDate ?? null,
    digitalId: input.digitalId ?? null,
    // Rich fields, only present on /v1/issues/{id} — list endpoints omit them.
    // `cover` is { path, ext } WITHOUT the variant suffix; the view appends `/{variant}.{ext}`.
    // We store the URL only and never the image bytes: the browser fetches covers directly
    // from Marvel's own CDN, so this app neither copies nor redistributes artwork.
    cover: normalizeCover(input.cover),
    description: input.description ?? null,
    pageCount: Number(input.pageCount) > 0 ? Number(input.pageCount) : null,
    creators: Array.isArray(input.creators)
      ? input.creators
        .filter((c) => c && typeof c.name === 'string')
        .slice(0, 24)
        .map((c) => ({ name: String(c.name), role: String(c.role ?? '') }))
      : null,
    source: input.source ?? 'api',
    // "pending" means imported from Markdown and not yet enriched. The UI shows this
    // honestly rather than guessing at missing fields.
    hydrated: input.hydrated ?? (input.digitalId != null || input.seriesId != null),
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
  return { path, ext: String(ext).replace(/[^a-z0-9]/gi, '') || 'jpg' };
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

export function createList(state, { name, description = '', id = newId(), itemIds = [] } = {}) {
  const listId = id;
  const list = {
    id: listId,
    name: String(name || 'Untitled list').slice(0, 200),
    description: String(description || '').slice(0, 2000),
    created: Date.now(),
    itemIds: dedupe(itemIds.map(Number).filter((n) => Number.isInteger(n) && n !== 0)),
  };
  return {
    ...state,
    lists: { ...state.lists, [listId]: list },
    listOrder: [...state.listOrder, listId],
    active: state.active ?? listId,
  };
}

export function renameList(state, listId, name, description) {
  const list = state.lists[listId];
  if (!list) return state;
  const next = { ...list, name: String(name ?? list.name).slice(0, 200) };
  if (description !== undefined) next.description = String(description).slice(0, 2000);
  return { ...state, lists: { ...state.lists, [listId]: next } };
}

export function deleteList(state, listId) {
  if (!state.lists[listId]) return state;
  const lists = { ...state.lists };
  delete lists[listId];
  const listOrder = state.listOrder.filter((id) => id !== listId);
  const active = state.active === listId ? (listOrder[0] ?? null) : state.active;
  // Issue metadata and read state intentionally survive: the same issues may be in other
  // lists, and progress should never be destroyed by deleting a list.
  return { ...state, lists, listOrder, active };
}

export function setActive(state, listId) {
  return state.lists[listId] ? { ...state, active: listId } : state;
}

// ---------------------------------------------------------------- items

export function addIssuesToList(state, listId, inputs, { at = null, sort = false } = {}) {
  const list = state.lists[listId];
  if (!list) return { state, added: 0, skipped: 0 };

  let next = state;
  const incoming = [];
  for (const input of inputs) {
    const issue = normalizeIssue(input);
    if (!issue) continue;
    next = upsertIssue(next, issue);
    incoming.push(issue.issueId);
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

  return {
    state: { ...next, lists: { ...next.lists, [listId]: { ...list, itemIds } } },
    added: fresh.length,
    skipped,
  };
}

export function removeFromList(state, listId, issueId) {
  const list = state.lists[listId];
  if (!list) return state;
  const itemIds = list.itemIds.filter((id) => id !== Number(issueId));
  return { ...state, lists: { ...state.lists, [listId]: { ...list, itemIds } } };
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
  return { ...state, lists: { ...state.lists, [listId]: { ...list, itemIds } } };
}

export function moveItemTo(state, listId, issueId, index) {
  const list = state.lists[listId];
  if (!list) return state;
  const from = list.itemIds.indexOf(Number(issueId));
  if (from < 0) return state;
  return moveItem(state, listId, issueId, clamp(index, 0, list.itemIds.length - 1) - from);
}

// ---------------------------------------------------------------- read state

export function markRead(state, issueId, read = true, at = Date.now()) {
  const id = Number(issueId);
  if (!Number.isInteger(id)) return state;
  const next = { ...state.read };
  if (read) next[id] = at;
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

// Aggregated over UNIQUE issue ids across every list, so an issue in two lists counts once.
export function seriesProgress(state) {
  const tracked = new Set();
  for (const listId of state.listOrder) {
    for (const id of state.lists[listId]?.itemIds ?? []) tracked.add(id);
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
  for (const [k, v] of Object.entries(raw.issues ?? {})) {
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
  const lists = {};
  for (const [k, v] of Object.entries(raw.lists ?? {})) {
    if (!v || typeof v !== 'object') continue;
    lists[k] = {
      id: k,
      name: String(v.name ?? 'Untitled list'),
      description: String(v.description ?? ''),
      created: Number(v.created) || Date.now(),
      itemIds: dedupe((Array.isArray(v.itemIds) ? v.itemIds : []).map(Number).filter((n) => Number.isInteger(n) && n !== 0)),
    };
  }
  const listOrder = (Array.isArray(raw.listOrder) ? raw.listOrder : Object.keys(lists)).filter((id) => lists[id]);
  for (const id of Object.keys(lists)) if (!listOrder.includes(id)) listOrder.push(id);

  return {
    ...base,
    issues,
    read,
    overrides,
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
    lists: state.lists,
    listOrder: state.listOrder,
    active: state.active,
  };
}

export function listItems(state, listId) {
  const list = state.lists[listId];
  if (!list) return [];
  return list.itemIds.map((id) => ({
    ...(state.issues[id] ?? { issueId: id, title: `Issue ${id}`, hydrated: false, source: 'unknown' }),
    read: isRead(state, id),
    override: state.overrides[id] ?? null,
  }));
}

// ---------------------------------------------------------------- helpers

function dedupe(arr) {
  return [...new Set(arr)];
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}
