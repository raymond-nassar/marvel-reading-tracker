// Application controller.
//
// Rendering follows the "Longbox Focus" design: a rail of reading orders, one hero card for
// the next unread issue, a short cover shelf, and the full order collapsed behind a summary.
// Cover art is optional everywhere: `body.nocovers` swaps every image for a typographic tile.

import {
  createList, deleteList, renameList, setActive, addIssuesToList, removeFromList, moveItem,
  toggleRead, markRead, isRead, upNext, listProgress, seriesProgress, listItems, exportBackup,
  setOverride, pendingIssueIds, createEmptyState, coverUrl,
} from './lib/model.js';
import { parseChecklist, serializeChecklist, isSafeMarvelUrl, issueIdFromUrl, resolveUniqueExact } from './lib/markdown.js';
import { availability, describe, SHORT, STATE } from './lib/availability.js';
import { compareIssues } from './lib/sort.js';
import {
  parseCatalog, typeLabel, depthLabel, depthHint, catalogCategories, filterByCategory, searchCatalog,
  groupCatalog, variantLabel, sourceLink, sourceLabel, updatedLabel,
} from './lib/catalog.js';
import { Store } from './storage.js';
import { MarvelApi, DEFAULT_BASE } from './api.js';
import { ResponseCache } from './cache.js';
import { RateLimiter } from './lib/limiter.js';
import { Hydrator } from './hydrate.js';
import { openIssue as openIssueTab, detailUrl } from './reader.js';

const SETTINGS_KEY = 'mrt.settings';
const RING_CIRCUMFERENCE = 94.2; // 2πr for r=15, matching the SVG in index.html
const SHELF_SIZE = 8;

const $ = (sel) => document.querySelector(sel);
const announcer = $('#announcer');

let settings = loadSettings();
const limiter = new RateLimiter();
let cache = new ResponseCache({ baseUrl: settings.apiBase });
let api = new MarvelApi({ baseUrl: settings.apiBase, limiter, cache, onStatus: onApiStatus });

// A failed write must be visible. The store rolls the change back and reports why, but that
// report was previously discarded here, so the UI would announce "marked read" while the row
// silently reverted on the next paint.
const store = new Store({
  onChange: (_state, err) => {
    renderAll();
    if (err) notify('#save-report', err, 'error');
  },
});
const hydrator = new Hydrator({ api, store, onProgress: renderHydration });

let filter = 'all';
let view = 'read';

// ------------------------------------------------------------------ boot

store.load();
applyCoversSetting();
wireNav();
wireReading();
wireAdd();
wireData();
wireShortcuts();
wireBlockedBanner();
wireCatalogSearch();
renderAll();
checkHealth();
refreshCacheUsage();

if (store.lastError) notify('#save-report', store.lastError, 'error');

// ------------------------------------------------------------------ unreadable-data recovery

// Set once the user has saved a copy of the unreadable data to disk themselves. It is the only
// way out when the browser is too full to hold a second copy, which is exactly the situation
// where the automatic salvage fails.
let downloadedSalvage = false;

function renderBlocked() {
  const banner = $('#blocked-banner');
  banner.hidden = !store.blocked;
  if (store.blocked) $('#blocked-why').textContent = store.lastError ?? '';
  // The pre-restore snapshot outlives a reload, so the undo affordance must be restored on
  // boot rather than only after the restore that created it.
  const undo = $('#btn-undo-restore');
  if (undo) undo.hidden = !store.hasPreRestoreSnapshot();
}

function wireBlockedBanner() {
  $('#btn-download-salvage').addEventListener('click', () => {
    const raw = store.salvagedRaw();
    if (!raw) return notify('#save-report', 'There was nothing left to download.', 'warn');
    const when = new Date().toISOString().slice(0, 10);
    download(`marvel-reading-tracker-unreadable-${when}.json`, raw, 'application/json');
    downloadedSalvage = true;
    announce('Downloaded a copy of the unreadable data.');
  });

  $('#btn-start-fresh').addEventListener('click', () => {
    if (!confirm('Start fresh?\n\nThis replaces the unreadable saved data with an empty tracker. Download a copy first if you have not already.')) return;
    if (store.startFresh({ confirmedDownloaded: downloadedSalvage })) {
      notify('#save-report', 'Started fresh. Saving is working again.', 'ok');
    } else {
      notify('#save-report', store.lastError ?? 'Could not start fresh.', 'error');
    }
  });
}

// ------------------------------------------------------------------ helpers

function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

function announce(msg) {
  announcer.textContent = '';
  // Re-setting after a tick makes screen readers re-announce identical messages.
  setTimeout(() => { announcer.textContent = msg; }, 30);
}

// A success message must never outlive the write it describes. store.update rolls the change
// back when persistence fails, so every announcement has to consult the result first,
// otherwise a screen-reader user hears "List deleted" for a deletion that did not happen.
function announceIfSaved(msg) {
  if (store.lastUpdateOk) announce(msg);
}

function notify(sel, msg, kind = 'ok') {
  const box = $(sel);
  if (!box) return;
  box.replaceChildren(el('p', { class: `notice notice-${kind}`, text: msg }));
  announce(msg);
}

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    return {
      apiBase: typeof raw.apiBase === 'string' && raw.apiBase ? raw.apiBase : DEFAULT_BASE,
      covers: raw.covers !== false,
    };
  } catch {
    return { apiBase: DEFAULT_BASE, covers: true };
  }
}

function saveSettings() {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* non-fatal */ }
}

function activeListId() {
  return store.state.active;
}

function ymd(v) {
  return v ? String(v).slice(0, 10) : '';
}

function seriesOnly(name) {
  return String(name || '').replace(/\s*\(.*\)\s*$/, '');
}

function shortTitle(t) {
  return String(t || '').replace(/\s*\(\d{4}(\s*-\s*\d{4})?\)/, '');
}

// ------------------------------------------------------------------ cover art

// A deterministic hue per series so the typographic fallback still distinguishes runs
// at a glance when cover art is switched off.
function hueOf(s) {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function fallbackStyle(issue) {
  const h = hueOf(issue?.seriesName || issue?.title || '');
  return `background:linear-gradient(155deg,hsl(${h} 42% 26%),hsl(${(h + 40) % 360} 38% 14%));color:hsl(${h} 60% 88%)`;
}

// Wires an <img>/fallback pair. The fallback is shown when there is no cover URL at all,
// or when the image fails to load; `body.nocovers` handles the user's preference in CSS.
function paintCover(img, fb, issue, variant) {
  fb.setAttribute('style', fallbackStyle(issue));
  const url = coverUrl(issue, variant);
  if (!url) {
    img.removeAttribute('src');
    img.hidden = true;
    fb.classList.add('show');
    return;
  }
  img.hidden = false;
  fb.classList.remove('show');
  img.onerror = () => { img.hidden = true; fb.classList.add('show'); };
  img.src = url;
}

function applyCoversSetting() {
  document.body.classList.toggle('nocovers', !settings.covers);
  const btn = $('#btn-covers');
  if (btn) {
    btn.setAttribute('aria-pressed', String(settings.covers));
    $('#covers-label').textContent = settings.covers ? 'Cover art on' : 'Cover art off';
  }
  const opt = $('#opt-covers');
  if (opt) opt.checked = settings.covers;
}

function setCovers(on) {
  settings.covers = Boolean(on);
  saveSettings();
  applyCoversSetting();
  renderReading();
  announce(settings.covers ? 'Cover art on.' : 'Cover art off. Covers are shown as text tiles.');
}

// ------------------------------------------------------------------ navigation

function wireNav() {
  for (const btn of document.querySelectorAll('[data-view]')) {
    btn.addEventListener('click', () => {
      showView(btn.dataset.view);
      if (btn.dataset.open) {
        const d = $(`#${btn.dataset.open}`);
        if (d) {
          for (const other of document.querySelectorAll('#view-add .card[open]')) other.open = false;
          d.open = true;
          d.querySelector('input, textarea, button')?.focus();
        }
      }
    });
  }

  $('#btn-new-list').addEventListener('click', () => {
    const name = prompt('Name for the new list?', 'My reading order');
    if (!name) return;
    // The id has to come from the state the store returned, not from store.state afterwards.
    // A failed write rolls the creation back, and listOrder's last entry would then be an
    // unrelated pre-existing list that we would silently switch the user to while telling
    // them their new list was created.
    const created = store.update((s) => createList(s, { name }));
    if (!store.lastUpdateOk) return;
    const id = created.listOrder[created.listOrder.length - 1];
    store.update((s) => setActive(s, id));
    showView('read');
    announceIfSaved(`Created list ${name}.`);
  });

  $('#btn-covers').addEventListener('click', () => setCovers(!settings.covers));
}

// Moving focus to the new view's heading is what makes the rail usable with a keyboard or a
// screen reader. Without it, focus stays on the rail button and the view change is silent, so
// the next Tab continues from the old position and nothing announces where you now are.
function showView(next, { focus = true } = {}) {
  view = next;
  for (const name of ['read', 'catalog', 'progress', 'add', 'data', 'about']) {
    $(`#view-${name}`).hidden = name !== next;
  }
  for (const btn of document.querySelectorAll('.ri[data-view]')) {
    if (btn.dataset.view === next) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
  renderRail();
  if (next === 'catalog') renderCatalog();
  window.scrollTo({ top: 0 });

  if (!focus) return;
  const section = $(`#view-${next}`);
  const heading = document.getElementById(section.getAttribute('aria-labelledby'));
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

// ------------------------------------------------------------------ rail

function renderRail() {
  const nav = $('#list-nav');
  nav.replaceChildren();
  const { listOrder, lists } = store.state;
  $('#no-lists').hidden = listOrder.length > 0;

  for (const id of listOrder) {
    const list = lists[id];
    const { read, total } = listProgress(store.state, id);
    const pct = total ? (read / total) * 100 : 0;
    const current = view === 'read' && id === activeListId();

    nav.append(el('li', {}, el('button', {
      type: 'button',
      class: 'ri',
      'aria-current': current ? 'true' : null,
      onclick: () => { store.update((s) => setActive(s, id)); showView('read'); },
    }, [
      el('span', { class: 't' }, [
        el('span', { text: list.name }),
        el('span', { class: 'n', text: `${read} / ${total}` }),
      ]),
      el('span', { class: 'bar' }, el('i', { style: `width:${pct.toFixed(1)}%` })),
    ])));
  }
}

// ------------------------------------------------------------------ reading view

function wireReading() {
  for (const radio of document.querySelectorAll('input[name="filter"]')) {
    radio.addEventListener('change', (e) => { filter = e.target.value; renderRows(); });
  }

  $('#btn-rename-list').addEventListener('click', () => {
    const id = activeListId();
    const list = store.state.lists[id];
    if (!list) return;
    const name = prompt('List name', list.name);
    if (!name) return;
    store.update((s) => renameList(s, id, name));
    announceIfSaved(`Renamed to ${name}.`);
  });

  $('#btn-delete-list').addEventListener('click', () => {
    const id = activeListId();
    const list = store.state.lists[id];
    if (!list) return;
    if (!confirm(`Delete "${list.name}"? Your read progress is kept; only the list is removed.`)) return;
    store.update((s) => deleteList(s, id));
    announceIfSaved('List deleted. Reading progress was kept.');
  });

  $('#btn-export-md').addEventListener('click', exportMarkdown);
  $('#btn-hydrate').addEventListener('click', () => hydrator.start(activeListId()));
  $('#btn-cancel-hydrate').addEventListener('click', () => hydrator.cancel());

  $('#btn-hero-read').addEventListener('click', (e) => {
    const issue = upNext(store.state, activeListId());
    if (issue) openInReader(issue, e);
  });

  $('#btn-hero-done').addEventListener('click', () => markCurrentRead());
}

function markCurrentRead() {
  const issue = upNext(store.state, activeListId());
  if (!issue) return;
  // Only announce success if the write actually stuck, because store.update rolls back on failure
  // and the error is surfaced separately by the onChange handler.
  if (!isRead(store.update((s) => markRead(s, issue.issueId, true)), issue.issueId)) return;
  const next = upNext(store.state, activeListId());
  announce(next
    ? `${issue.title} marked read. Next up: ${next.title}.`
    : `${issue.title} marked read. That is the whole order finished.`);
}

function renderReading() {
  const id = activeListId();
  const list = store.state.lists[id];

  $('#no-active-list').hidden = Boolean(list);
  $('#reading-body').hidden = !list;
  $('#ring-wrap').hidden = !list;

  if (!list) {
    $('#order-name').textContent = 'Marvel Reading Tracker';
    $('#order-sub').textContent = 'Curated reading orders, tracked locally, linked into the Unlimited reader.';
    return;
  }

  const { read, total } = listProgress(store.state, id);
  const seriesCount = new Set(
    list.itemIds.map((i) => store.state.issues[i]?.seriesName).filter(Boolean),
  ).size;

  $('#order-name').textContent = list.name;
  $('#order-sub').textContent = [
    `${total} issue${total === 1 ? '' : 's'}`,
    seriesCount ? `${seriesCount} series` : null,
    list.description || null,
  ].filter(Boolean).join(' · ');

  const pct = total ? read / total : 0;
  $('#ring-arc').setAttribute('stroke-dashoffset', String(RING_CIRCUMFERENCE * (1 - pct)));
  $('#ring-label').textContent = `${read} / ${total}`;
  $('#ring-wrap').setAttribute('title', `${Math.round(pct * 100)}% read`);

  renderHero();
  renderShelf();
  renderRows();
  renderHydrateButton();
}

function renderHero() {
  const id = activeListId();
  const issue = upNext(store.state, id);
  const finished = !issue;

  $('#hero').hidden = finished;
  $('#all-read').hidden = !finished;
  $('#shelf-sec').hidden = finished;
  if (finished) return;

  const override = store.state.overrides[issue.issueId];
  const av = availability(issue, { override });
  const position = (store.state.lists[id]?.itemIds.indexOf(issue.issueId) ?? -1) + 1;
  const total = store.state.lists[id]?.itemIds.length ?? 0;

  paintCover($('#hero-img'), $('#hero-fb'), issue, 'portrait_uncanny');
  $('#hero-img').alt = coverUrl(issue, 'portrait_uncanny') ? `Cover of ${issue.title}` : '';
  $('#hero-fs').textContent = seriesOnly(issue.seriesName);
  $('#hero-fn').textContent = issue.number ? `#${issue.number}` : '';

  const bgUrl = settings.covers ? coverUrl(issue, 'detail') : null;
  $('#hero-bg').style.backgroundImage = bgUrl ? `url("${bgUrl}")` : 'none';

  $('#hero-title').textContent = issue.title;

  // Marvel spells it "penciler" with one l, so /penciller/ never matched and /artist/ matched
  // "cover artist" instead, because the hero credited the cover artist and omitted the interior one.
  // Cover credits are excluded: they are not the creative team for the story.
  const credits = (issue.creators ?? [])
    .filter((c) => {
      const role = String(c.role || '');
      return !/cover/i.test(role) && /writer|pencill?er|artist|inker/i.test(role);
    })
    .slice(0, 3)
    .map((c) => c.name);
  $('#hero-by').textContent = [issue.seriesName, credits.join(' & ') || null].filter(Boolean).join(' · ');

  $('#hero-desc').textContent = issue.description
    || (issue.hydrated ? 'No synopsis is recorded for this issue.' : 'Details have not been fetched yet.');

  const avClass = av.state === STATE.EXPECTED || av.state === STATE.OVERRIDE_AVAILABLE ? 'ok'
    : av.state === STATE.SCHEDULED ? 'warn' : '';
  $('#hero-facts').replaceChildren(
    fact('In Unlimited', `${SHORT[av.state]} ${describe(issue, { override })}`, avClass),
    fact('Pages', issue.pageCount ? String(issue.pageCount) : 'Unknown'),
    fact('Released', ymd(issue.onSale) || 'Unknown'),
    fact('Position', total ? `${position} of ${total}` : 'Unknown'),
  );

  const info = $('#btn-hero-info');
  const infoHref = detailUrl(issue);
  info.hidden = !infoHref;
  if (infoHref) {
    info.href = infoHref;
    info.setAttribute('aria-label', `Open the marvel.com page for ${issue.title}`);
  } else {
    info.removeAttribute('href');
  }
}

function fact(key, value, cls = '') {
  return el('div', {}, [
    el('dt', { text: key }),
    el('dd', { class: cls || null, text: value }),
  ]);
}

function renderShelf() {
  const id = activeListId();
  const shelf = $('#shelf');
  shelf.replaceChildren();

  const upcoming = listItems(store.state, id).filter((it) => !it.read).slice(1, SHELF_SIZE + 1);
  $('#shelf-sec').hidden = upcoming.length === 0;
  $('#shelf-note').textContent = `next ${upcoming.length}, in order`;

  for (const it of upcoming) {
    const img = el('img', { alt: '', loading: 'lazy' });
    const fb = el('div', { class: 'tf' }, [
      el('span', { class: 's', text: seriesOnly(it.seriesName) }),
      el('span', { class: 'n', text: it.number ? `#${it.number}` : '?' }),
    ]);
    paintCover(img, fb, it, 'portrait_incredible');

    shelf.append(el('li', { class: 'tile' }, el('button', {
      type: 'button',
      title: `Open ${it.title} in Marvel Unlimited`,
      'aria-label': `Open ${it.title} in Marvel Unlimited`,
      onclick: (e) => openInReader(it, e),
    }, [
      el('div', { class: 'ph' }, [img, fb]),
      el('div', { class: 'lab' }, [
        el('b', { text: shortTitle(it.title) }),
        ymd(it.onSale).slice(0, 4),
      ]),
    ])));
  }
}

function renderRows() {
  const id = activeListId();
  const rows = $('#rows');
  rows.replaceChildren();
  const list = store.state.lists[id];
  if (!list) return;

  const all = listItems(store.state, id);
  const currentId = upNext(store.state, id)?.issueId ?? null;
  const items = all.filter((it) => matchesFilter(it));

  const unread = all.length - all.filter((it) => it.read).length;
  $('#full-count').textContent = `${unread} unread`;

  if (!items.length) {
    rows.append(el('li', { class: 'rail-hint', text: 'Nothing matches this filter.' }));
    return;
  }

  for (const item of items) {
    const override = item.override;
    const av = availability(item, { override });
    const badgeClass = {
      [STATE.EXPECTED]: 'badge-expected',
      [STATE.SCHEDULED]: 'badge-scheduled',
      [STATE.UNKNOWN]: 'badge-unknown',
      [STATE.OVERRIDE_AVAILABLE]: 'badge-override-available',
      [STATE.OVERRIDE_UNAVAILABLE]: 'badge-override-unavailable',
    }[av.state];

    const img = el('img', { alt: '', loading: 'lazy' });
    const fb = el('div', { class: 'rf', text: item.number ? `#${item.number}` : '?' });
    paintCover(img, fb, item, 'portrait_incredible');

    rows.append(el('li', {
      class: `row${item.read ? ' is-read' : ''}${item.issueId === currentId ? ' now' : ''}`,
    }, [
      el('button', {
        type: 'button',
        class: 'cb',
        'aria-pressed': String(item.read),
        'aria-label': `Mark ${item.title} as ${item.read ? 'unread' : 'read'}`,
        onclick: () => {
          store.update((s) => toggleRead(s, item.issueId));
          announceIfSaved(`${item.title} ${isRead(store.state, item.issueId) ? 'marked read' : 'marked unread'}.`);
        },
      }, item.read ? '✓' : ''),
      el('div', { class: 'thumb' }, [img, fb]),
      el('div', {}, [
        el('div', { class: 'rt', text: item.title }),
        el('div', { class: 'rm' }, [
          item.seriesName ? el('span', { text: seriesOnly(item.seriesName) }) : null,
          el('span', {
            class: `badge ${badgeClass}`,
            title: describe(item, { override }),
          }, `${SHORT[av.state]} ${av.state === STATE.EXPECTED ? 'Unlimited' : SHORT_LABEL[av.state] ?? 'unknown'}`),
          !item.hydrated && item.source !== 'manual'
            ? el('span', { class: 'badge badge-pending', title: 'Details not fetched yet' }, 'details pending')
            : null,
          item.source === 'manual' ? el('span', { class: 'badge badge-unknown' }, 'by hand') : null,
          ymd(item.onSale) ? el('span', { text: ymd(item.onSale) }) : null,
        ]),
      ]),
      el('div', { class: 'ract' }, [
        el('button', { type: 'button', class: 'mini', 'aria-label': `Read ${item.title} in Marvel Unlimited`, onclick: (e) => openInReader(item, e) }, 'Read'),
        detailUrl(item)
          ? el('a', { class: 'mini', href: detailUrl(item), target: '_blank', rel: 'noopener noreferrer', 'aria-label': `marvel.com page for ${item.title}` }, 'Info')
          : null,
        el('button', { type: 'button', class: 'mini', 'aria-label': `Move ${item.title} up`, onclick: () => store.update((s) => moveItem(s, id, item.issueId, -1)) }, '↑'),
        el('button', { type: 'button', class: 'mini', 'aria-label': `Move ${item.title} down`, onclick: () => store.update((s) => moveItem(s, id, item.issueId, 1)) }, '↓'),
        el('button', { type: 'button', class: 'mini', 'aria-label': `Change availability for ${item.title}`, onclick: () => cycleOverride(item) }, '⚑'),
        el('button', { type: 'button', class: 'mini mini-danger', 'aria-label': `Remove ${item.title} from this list`, onclick: () => { store.update((s) => removeFromList(s, id, item.issueId)); announceIfSaved(`Removed ${item.title}.`); } }, '✕'),
      ]),
    ]));
  }

  if (items.length !== all.length) {
    rows.append(el('li', { class: 'rail-hint', text: `Showing ${items.length} of ${all.length}.` }));
  }
}

const SHORT_LABEL = {
  [STATE.SCHEDULED]: 'scheduled',
  [STATE.UNKNOWN]: 'unknown',
  [STATE.OVERRIDE_AVAILABLE]: 'yours: available',
  [STATE.OVERRIDE_UNAVAILABLE]: 'yours: not in MU',
};

function matchesFilter(item) {
  if (filter === 'all') return true;
  if (filter === 'read') return item.read;
  if (filter === 'unread') return !item.read;
  if (filter === 'pending') return !item.hydrated && item.source !== 'manual';
  if (filter === 'unlimited') {
    const s = availability(item, { override: item.override }).state;
    return s === STATE.EXPECTED || s === STATE.OVERRIDE_AVAILABLE;
  }
  return true;
}

function cycleOverride(item) {
  const next = item.override === 'available' ? 'unavailable' : item.override === 'unavailable' ? null : 'available';
  store.update((s) => setOverride(s, item.issueId, next));
  announceIfSaved(`${item.title}: ${next ? `marked ${next}` : 'override cleared'}.`);
}

// ------------------------------------------------------------------ shortcuts

function wireShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (view !== 'read' || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = document.activeElement;
    // Never hijack a key the focused control already means something to.
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT|BUTTON|A|SUMMARY)$/.test(t.tagName))) return;
    if (!store.state.lists[activeListId()]) return;

    if (e.key === 'Enter') {
      const issue = upNext(store.state, activeListId());
      if (!issue) return;
      e.preventDefault();
      openInReader(issue, e);
    } else if (e.key === 'd' || e.key === 'D') {
      e.preventDefault();
      markCurrentRead();
    }
  });
}

// ------------------------------------------------------------------ reader deep links

function openInReader(issue, event) {
  event?.preventDefault();
  // window.open must happen synchronously inside the gesture. The digitalId lookup, when one
  // is needed, happens in the opened tab rather than here. See reader.js.
  const res = openIssueTab(issue);
  if (!res.ok) {
    announce(`${issue.title} has no Marvel reference recorded, so it cannot be opened.`);
    return;
  }
  announce(res.target === 'reader'
    ? `Opening ${issue.title} in Marvel Unlimited in a new tab.`
    : `Opening ${issue.title} in a new tab and looking up its Unlimited link.`);
}

// ------------------------------------------------------------------ hydration

function renderHydrateButton() {
  const pending = pendingIssueIds(store.state).length;
  $('#btn-hydrate').hidden = pending === 0 || hydrator.active;
  $('#btn-hydrate').textContent = `Fetch details for ${pending} issue${pending === 1 ? '' : 's'}`;
  $('#btn-cancel-hydrate').hidden = !hydrator.active;
}

function renderHydration(status) {
  const box = $('#hydration-status');
  if (!status || status.phase === 'idle') { box.hidden = true; renderHydrateButton(); return; }
  box.hidden = false;
  if (status.phase === 'running') {
    box.textContent = `Fetching details ${status.done} of ${status.total}…`;
  } else if (status.phase === 'cancelled') {
    box.textContent = `Stopped after ${status.done} of ${status.total}. Progress was kept.`;
    announce('Detail fetching stopped. Progress was kept.');
  } else {
    box.textContent = 'All details fetched.';
    announce('All issue details fetched.');
  }
  renderHydrateButton();
}

// ------------------------------------------------------------------ add view

function wireAdd() {
  $('#form-search').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $('#search-q').value.trim();
    if (!q) return;
    notify('#search-results', 'Searching…', 'ok');
    try {
      const items = await api.searchIssues(q, { limit: 50 });
      renderResults('#search-results', items, (it) => `${it.seriesName ?? ''}${it.onSale ? ` · ${ymd(it.onSale)}` : ''}`);
    } catch (err) {
      notify('#search-results', friendly(err), 'error');
    }
  });

  $('#form-series').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $('#series-q').value.trim();
    if (!q) return;
    notify('#series-results', 'Searching…', 'ok');
    try {
      const series = await api.searchSeries(q, { limit: 40 });
      const box = $('#series-results');
      box.replaceChildren();
      if (!series.length) return notify('#series-results', 'No series matched.', 'warn');
      for (const s of series) {
        box.append(el('div', { class: 'result' }, [
          el('div', { class: 'result-main' }, [
            el('div', { class: 'result-title', text: s.name }),
            el('div', { class: 'result-meta', text: `${s.issueCount ?? '?'} issues` }),
          ]),
          el('button', { type: 'button', class: 'btn', onclick: () => addSeries(s) }, 'Add all issues'),
        ]));
      }
    } catch (err) {
      notify('#series-results', friendly(err), 'error');
    }
  });

  $('#form-creator').addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $('#creator-q').value.trim();
    if (!q) return;
    notify('#creator-results', 'Searching…', 'ok');
    try {
      const creators = await api.searchCreators(q, { limit: 40 });
      const box = $('#creator-results');
      box.replaceChildren();
      if (!creators.length) return notify('#creator-results', 'No creators matched.', 'warn');
      for (const c of creators) {
        box.append(el('div', { class: 'result' }, [
          el('div', { class: 'result-main' }, [
            el('div', { class: 'result-title', text: c.name }),
            el('div', { class: 'result-meta', text: `${c.issueCount ?? '?'} issues` }),
          ]),
          el('button', { type: 'button', class: 'btn btn-g', onclick: () => addCreator(c) }, 'Add all issues'),
        ]));
      }
    } catch (err) {
      notify('#creator-results', friendly(err), 'error');
    }
  });

  $('#form-import').addEventListener('submit', (e) => { e.preventDefault(); doImport(); });
  $('#form-manual').addEventListener('submit', (e) => { e.preventDefault(); doManual(); });
}

function renderResults(sel, items, metaFn) {
  const box = $(sel);
  box.replaceChildren();
  if (!items.length) return notify(sel, 'Nothing matched that search.', 'warn');

  // Name the destination at the point of decision. The same hint sits in the view header, but
  // the results are far enough down the page that it is easy to miss entirely.
  const target = store.state.lists[activeListId()];
  box.append(el('p', {
    class: 'rail-hint',
    text: target
      ? `Adding to “${target.name}”.`
      : 'Adding will start a new list called “My reading order”.',
  }));

  for (const it of items) {
    // The confirmation belongs on the control that was clicked. Previously the only feedback
    // was a screen-reader announcement, so a sighted user had to open the list to find out
    // whether anything had happened.
    const btn = el('button', { type: 'button', class: 'btn' }, 'Add');
    btn.addEventListener('click', () => {
      const res = addToActive([it], `Added ${it.title}.`);
      if (!res.ok) {
        btn.textContent = 'Could not add';
        return;
      }
      btn.disabled = true;
      btn.textContent = res.added ? `Added to ${res.listName}` : 'Already in that list';
    });

    box.append(el('div', { class: 'result' }, [
      el('div', { class: 'result-main' }, [
        el('div', { class: 'result-title', text: it.title }),
        el('div', { class: 'result-meta', text: metaFn(it) }),
      ]),
      btn,
    ]));
  }
}

// Returns null when the list could not be created, rather than an undefined id that would be
// passed downstream as if it were a real list.
function ensureList(name) {
  let id = activeListId();
  if (!id) {
    const created = store.update((s) => createList(s, { name }));
    if (!store.lastUpdateOk) return null;
    id = created.listOrder[created.listOrder.length - 1];
    store.update((s) => setActive(s, id));
  }
  return id;
}

function addToActive(issues, message, { sort = false } = {}) {
  const id = ensureList('My reading order');
  if (!id) return { added: 0, skipped: 0, ok: false, listName: null };
  let added = 0, skipped = 0;
  store.update((s) => {
    const res = addIssuesToList(s, id, issues, { sort });
    added = res.added; skipped = res.skipped;
    return res.state;
  });
  // added/skipped are counted inside the updater, which runs before the write. If the write
  // failed the change was rolled back, so those counts describe nothing that survived.
  if (!store.lastUpdateOk) return { added: 0, skipped: 0, ok: false, listName: null };
  const listName = store.state.lists[id]?.name ?? 'your list';
  announce(`${message} ${added} added${skipped ? `, ${skipped} already in the list` : ''}.`);

  // Search, series and creator results come from list endpoints, which return neither `cover`
  // nor `digitalId`; only /v1/issues/{id} does. Without hydration the issue lands with no art
  // and, worse, no way to open it in Marvel Unlimited, until the user happens to notice the
  // "Fetch details" button. Import already did this; every other add path was missing it.
  // start() is a no-op while a run is in flight, so rapid adds cannot stack up.
  if (added > 0) hydrator.start(id);

  return { added, skipped, ok: true, listName };
}

async function addSeries(series) {
  notify('#series-results', `Loading all issues of ${series.name}…`, 'ok');
  try {
    const issues = await api.seriesIssues(series.id, {
      onProgress: ({ loaded, total }) => announce(`Loaded ${loaded}${total ? ` of ${total}` : ''} issues…`),
    });
    // The API returns series issues newest-first; reading order needs oldest-first.
    const sorted = [...issues].sort(compareIssues);
    const { added, skipped, ok } = addToActive(sorted, `${series.name}:`);
    if (!ok) return notify('#series-results', `${series.name}: nothing was added, because that change could not be saved.`, 'error');
    notify('#series-results', `${series.name}: ${added} issues added${skipped ? `, ${skipped} skipped as duplicates` : ''}.`, 'ok');
  } catch (err) {
    notify('#series-results', friendly(err), 'error');
  }
}

async function addCreator(creator) {
  notify('#creator-results', `Loading issues credited to ${creator.name}…`, 'ok');
  try {
    const issues = await api.creatorIssues(creator.id, {
      onProgress: ({ loaded, total }) => announce(`Loaded ${loaded}${total ? ` of ${total}` : ''} issues…`),
    });
    const sorted = [...issues].sort(compareIssues);
    const { added, skipped, ok } = addToActive(sorted, `${creator.name}:`);
    if (!ok) return notify('#creator-results', `${creator.name}: nothing was added, because that change could not be saved.`, 'error');
    notify('#creator-results',
      `${creator.name}: ${added} added${skipped ? `, ${skipped} duplicates skipped` : ''}. ` +
      'Creator records omit Unlimited dates, so availability shows as unknown until details are fetched.',
      'ok');
  } catch (err) {
    notify('#creator-results', friendly(err), 'error');
  }
}

function doImport() {
  const text = $('#import-text').value;
  if (!text.trim()) return notify('#import-report', 'Paste a reading order first.', 'warn');

  const { entries, unresolved, headings } = parseChecklist(text);
  const box = $('#import-report');
  box.replaceChildren();

  if (!entries.length && !unresolved.length) {
    return notify('#import-report', 'Could not find any issues in that text.', 'warn');
  }

  const intoNew = $('#import-new-list').checked;
  let listId;
  if (intoNew) {
    const name = headings[0] || `Imported ${new Date().toLocaleDateString()}`;
    const created = store.update((s) => createList(s, { name, description: 'Imported from a pasted reading order.' }));
    if (!store.lastUpdateOk) {
      return notify('#import-report', 'Could not create the list, so nothing was imported.', 'error');
    }
    listId = created.listOrder[created.listOrder.length - 1];
    store.update((s) => setActive(s, listId));
  } else {
    listId = ensureList('My reading order');
    if (!listId) return notify('#import-report', 'Could not create a list, so nothing was imported.', 'error');
  }

  // Markdown carries only a title and an id, so metadata starts as pending and is
  // filled in later rather than guessed at now.
  const staged = entries.map((e) => ({
    issueId: e.issueId,
    title: e.title,
    url: e.url,
    source: 'import',
    hydrated: false,
  }));

  let added = 0, skipped = 0;
  store.update((s) => {
    const res = addIssuesToList(s, listId, staged, {});
    added = res.added; skipped = res.skipped;
    let next = res.state;
    for (const e of entries) if (e.read) next = markRead(next, e.issueId, true);
    return next;
  });

  // The counts were taken inside the updater, before the write. A rolled-back write means
  // nothing was imported, whatever they say.
  if (!store.lastUpdateOk) {
    return notify('#import-report', 'Nothing was imported: that change could not be saved.', 'error');
  }

  box.append(el('p', { class: 'notice notice-ok', text: `Imported ${added} issue${added === 1 ? '' : 's'}${skipped ? `, ${skipped} already present` : ''}. Details will be fetched in the background.` }));

  if (unresolved.length) {
    box.append(el('p', { class: 'notice notice-warn', text: `${unresolved.length} line${unresolved.length === 1 ? '' : 's'} had no Marvel issue link. They are listed below rather than dropped, so you can resolve each one deliberately.` }));
    const wrap = el('div', { class: 'results' });
    for (const u of unresolved) wrap.append(unresolvedRow(u, listId));
    box.append(wrap);
  }

  announce(`Imported ${added} issues.`);
  hydrator.start(listId);
}

function unresolvedRow(entry, listId) {
  const row = el('div', { class: 'result' });
  const main = el('div', { class: 'result-main' }, [
    el('div', { class: 'result-title', text: entry.title }),
    el('div', { class: 'result-meta', text: 'No issue link, search to resolve' }),
  ]);
  const btn = el('button', { type: 'button', class: 'btn btn-g' }, 'Find match');
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    try {
      const candidates = await api.searchIssues(entry.title, { limit: 25 });
      const res = resolveUniqueExact(entry.title, candidates);
      if (res.status === 'resolved') {
        // Auto-accept only a single exact normalized match. Anything else is a choice
        // for you to make, because silently picking result #1 files the wrong comic.
        store.update((s) => addIssuesToList(s, listId, [res.match], {}).state);
        if (!store.lastUpdateOk) {
          btn.disabled = false;
          row.append(el('p', { class: 'notice notice-error', text: 'That match could not be saved.' }));
          return;
        }
        if (entry.read) store.update((s) => markRead(s, res.match.issueId, true));
        row.replaceChildren(el('p', { class: 'notice notice-ok', text: `Matched: ${res.match.title}` }));
        announce(`Matched ${entry.title}.`);
        return;
      }
      const choices = el('div', { class: 'results' });
      const list = res.matches.slice(0, 8);
      if (!list.length) {
        row.replaceChildren(el('p', { class: 'notice notice-warn', text: `No candidates found for “${entry.title}”. Add it by hand if you still want to track it.` }));
        return;
      }
      choices.append(el('p', { class: 'rail-hint', text: `Pick the right issue for “${entry.title}”:` }));
      for (const c of list) {
        choices.append(el('div', { class: 'result' }, [
          el('div', { class: 'result-main' }, [
            el('div', { class: 'result-title', text: c.title }),
            el('div', { class: 'result-meta', text: `${c.seriesName ?? ''}${c.onSale ? ` · ${ymd(c.onSale)}` : ''}` }),
          ]),
          el('button', {
            type: 'button', class: 'btn',
            onclick: () => {
              store.update((s) => addIssuesToList(s, listId, [c], {}).state);
              if (!store.lastUpdateOk) {
                row.replaceChildren(el('p', { class: 'notice notice-error', text: `${c.title} could not be saved.` }));
                return;
              }
              if (entry.read) store.update((s) => markRead(s, c.issueId, true));
              row.replaceChildren(el('p', { class: 'notice notice-ok', text: `Added ${c.title}.` }));
              announce(`Added ${c.title}.`);
            },
          }, 'This one'),
        ]));
      }
      row.replaceChildren(choices);
    } catch (err) {
      btn.disabled = false;
      row.append(el('p', { class: 'notice notice-error', text: friendly(err) }));
    }
  });
  row.append(main, btn);
  return row;
}

function doManual() {
  const title = $('#manual-title').value.trim();
  const url = $('#manual-url').value.trim();
  if (!title) return notify('#manual-report', 'A title is required.', 'warn');
  if (url && !isSafeMarvelUrl(url)) {
    return notify('#manual-report', 'That URL is not a marvel.com address. Leave it blank if you do not have one.', 'error');
  }

  // A negative synthetic id for entries with no marvel.com URL; namespaced away from real
  // Marvel ids so the two can never collide.
  const issueId = issueIdFromUrl(url) ?? -Date.now();
  const listId = ensureList('My reading order');
  if (!listId) return notify('#manual-report', 'Could not create a list, so nothing was added.', 'error');

  // Report what actually happened rather than assuming success. This previously announced
  // "Added" even when the entry had been silently discarded.
  let added = 0;
  let skipped = 0;
  store.update((s) => {
    const res = addIssuesToList(s, listId, [{
      issueId,
      title,
      url: url || null,
      source: 'manual',
      hydrated: true,
    }], {});
    added = res.added;
    skipped = res.skipped;
    return res.state;
  });

  if (!store.lastUpdateOk || added === 0) {
    return notify(
      '#manual-report',
      skipped > 0
        ? `“${title}” is already in that list, so nothing was added.`
        : `“${title}” could not be added. Your other lists are unchanged.`,
      skipped > 0 ? 'warn' : 'error',
    );
  }

  $('#manual-title').value = '';
  $('#manual-url').value = '';
  notify('#manual-report', `Added “${title}”. Availability shows as unknown because it is not in the metadata snapshot.`, 'ok');
}

// ------------------------------------------------------------------ curated orders

let catalogLoad = null;
let catalogCategory = 'all';
let catalogQuery = '';
let catalogAnnounceTimer = null;

// Typing in the search box re-renders on every keystroke, so a slow first load could otherwise
// start a second fetch while the first is still in flight and let the two renders finish out of
// order. Sharing one promise keeps every render behind the same load; a failure clears it so
// reopening the view can retry.
function loadCatalog() {
  catalogLoad ??= (async () => {
    // Served from our own origin, so the catalog works with no internet connection.
    const res = await fetch('./data/catalog.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseCatalog(await res.json());
  })().catch((err) => {
    catalogLoad = null;
    throw err;
  });
  return catalogLoad;
}

// The catalog re-renders on every keystroke, so announcing each render would read a fresh result
// count into a screen reader for every letter typed, and each announcement would cut off the one
// before it. Waiting for a pause means the reader hears the result of what they actually typed.
function announceCatalog(msg) {
  clearTimeout(catalogAnnounceTimer);
  catalogAnnounceTimer = setTimeout(() => announce(msg), 500);
}

async function renderCatalog() {
  const box = $('#catalog-results');
  const report = $('#catalog-report');
  box.replaceChildren(el('p', { class: 'rail-hint', text: 'Loading the catalog…' }));
  report.replaceChildren();
  // Tied to the query rather than to a successful load, so the button cannot be left behind
  // offering to clear a search box that an empty or failed catalog still shows.
  $('#catalog-clear').hidden = !catalogQuery;

  let catalog;
  try {
    catalog = await loadCatalog();
  } catch (err) {
    box.replaceChildren();
    notify('#catalog-report', `The catalog could not be loaded: ${err.message}. Your lists are unchanged.`, 'error');
    return;
  }

  // A dropped entry means the bundled data is wrong, not that the list does not exist. Saying
  // so is better than showing a shorter catalog that looks complete.
  if (catalog.dropped) {
    notify(
      '#catalog-report',
      `${catalog.dropped} catalog ${catalog.dropped === 1 ? 'entry is' : 'entries are'} incomplete and cannot be shown.`,
      'warn',
    );
  }

  box.replaceChildren();
  if (!catalog.lists.length) {
    $('#catalog-filters').hidden = true;
    box.append(el('p', { class: 'rail-hint', text: 'No curated reading lists are bundled with this build.' }));
    return;
  }

  // The categories describe the whole catalog, not the current search, so searching never
  // makes a category vanish from the filter under the reader's cursor.
  renderCatalogFilters(catalog.lists);

  // Filtering narrows which lists are shown; every list that is shown keeps the full detail a
  // reader needs to choose, so searching or switching categories never hides a description,
  // reading depth, or issue count.
  const inCategory = filterByCategory(catalog.lists, catalogCategory);
  const shown = searchCatalog(inCategory, catalogQuery);

  if (!shown.length) {
    const where = catalogCategory === 'all' ? '' : ` in ${categoryLabel(catalog.lists, catalogCategory)}`;
    const msg = catalogQuery
      ? `No reading lists match “${catalogQuery}”${where}.`
      : `No reading lists${where || ' in that category'}.`;
    box.append(el('p', { class: 'rail-hint', text: msg }));
    announceCatalog(msg);
    return;
  }

  for (const group of groupCatalog(shown)) {
    // A grouped story is announced once, so the reader sees one decision (which path through
    // this story) instead of two lists that look unrelated.
    if (group.name) {
      box.append(el('div', { class: 'result-group' }, [
        el('h2', { class: 'result-group-h', text: group.name }),
        el('p', {
          class: 'result-meta',
          text: `${group.lists.length} versions of this reading order. Pick how much you want to read.`,
        }),
        ...group.lists.map((list) => catalogRow(list, { variant: true })),
      ]));
      continue;
    }
    box.append(catalogRow(group.lists[0]));
  }

  // The dropped-entry warning already announced itself; a second announcement would replace it.
  if (!catalog.dropped) {
    const where = catalogCategory === 'all' ? '' : ` in ${categoryLabel(catalog.lists, catalogCategory)}`;
    const match = catalogQuery ? ` matching “${catalogQuery}”` : '';
    announceCatalog(`Catalog shows ${shown.length} reading ${shown.length === 1 ? 'list' : 'lists'}${match}${where}.`);
  }
}

// Inside a group the story's name is already the heading, so the row leads with what actually
// differs between the versions, the reading path, rather than repeating the title.
function catalogRow(list, { variant = false } = {}) {
  // The count is derived from the file the reader will actually import, so it is exact and
  // does not need hedging.
  const meta = [typeLabel(list.type), `${list.count} issue${list.count === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
  const depth = depthLabel(list.depth);
  const title = variant ? variantLabel(list) : list.name;
  return el('div', { class: 'result' }, [
    el('div', { class: 'result-main' }, [
      el('div', { class: 'result-title', text: title }),
      el('div', { class: 'result-meta', text: meta }),
      list.description ? el('div', { class: 'result-meta', text: list.description }) : null,
      // How much reading a list represents is the reason a reader picks between two versions
      // of the same story, so it is called out rather than buried in the meta line.
      depth
        ? el('p', { class: 'result-meta' }, [
          el('span', { class: 'pill', text: depth }),
          depthHint(list.depth) ? ` ${depthHint(list.depth)}` : null,
        ])
        : null,
      attributionLine(list),
    ]),
    el('button', {
      class: 'btn btn-p',
      type: 'button',
      // The accessible name always carries the full list name, so a button read out of
      // context never says only "Import Essential reading".
      'aria-label': `Import ${list.name}`,
      onclick: () => importCurated(list.file),
    }, 'Import'),
  ]);
}

// Where an order came from and when it was pinned. A reader deciding whether to trust a curated
// order needs both: the credit tells them who made it, the date bounds how recent it can be.
// The stamp is when the vendor script fetched the order, not when its curator last revised it,
// so it is labelled as a snapshot rather than claiming the list itself was updated that day.
function attributionLine(list) {
  const label = sourceLabel(list);
  const href = sourceLink(list);
  const updated = updatedLabel(list);
  if (!label && !updated) return null;

  const parts = [];
  if (label) {
    parts.push('Source: ');
    parts.push(href
      ? el('a', {
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
        'aria-label': `Source of ${list.name}: ${label}`,
      }, label)
      : el('span', { text: label }));
  }
  if (updated) parts.push(el('span', { text: `${label ? ' · ' : ''}Snapshot taken ${updated}` }));
  return el('p', { class: 'result-meta result-source' }, parts);
}

function wireCatalogSearch() {
  const input = $('#catalog-q');
  // Submitting is a no-op because results already track what has been typed; without this the
  // form would reload the page and throw the reader back to an empty catalog.
  $('#form-catalog-search').addEventListener('submit', (e) => e.preventDefault());
  input.addEventListener('input', () => {
    catalogQuery = input.value.trim();
    renderCatalog();
  });
  $('#catalog-clear').addEventListener('click', () => {
    input.value = '';
    catalogQuery = '';
    input.focus();
    renderCatalog();
  });
}

function categoryLabel(lists, key) {
  return catalogCategories(lists).find((c) => c.key === key)?.label ?? 'that category';
}

function renderCatalogFilters(lists) {
  const box = $('#catalog-filters');
  const categories = catalogCategories(lists);

  // One category is no choice at all, so the filter would only add noise.
  box.hidden = categories.length < 2;
  if (box.hidden) {
    catalogCategory = 'all';
    return;
  }

  // A category can disappear when the bundled data changes; falling back to "all" keeps the
  // reader looking at a populated catalog instead of a permanently empty one.
  if (catalogCategory !== 'all' && !categories.some((c) => c.key === catalogCategory)) {
    catalogCategory = 'all';
  }

  const options = [{ key: 'all', label: 'All', count: lists.length }, ...categories];

  // Selecting a category re-renders the view. Rebuilding the radios then would destroy the
  // one the reader just activated and drop keyboard focus out of the filter, so when the
  // options are unchanged we only move the selection.
  const existing = [...box.querySelectorAll('input[name="catalog-category"]')];
  if (existing.length === options.length && existing.every((r, i) => r.value === options[i].key)) {
    for (const radio of existing) radio.checked = radio.value === catalogCategory;
    return;
  }

  box.replaceChildren(
    el('legend', { class: 'visually-hidden', text: 'Filter the catalog by category' }),
    ...options.map(({ key, label, count }) => el('label', { class: 'fp' }, [
      el('input', {
        type: 'radio',
        name: 'catalog-category',
        value: key,
        checked: key === catalogCategory,
        onchange: () => { catalogCategory = key; renderCatalog(); },
      }),
      el('span', { text: `${label} (${count})` }),
    ])),
  );
}

async function importCurated(file) {
  try {
    // Served from our own origin, so this works with no internet connection.
    const res = await fetch(`./data/${file}`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const order = await res.json();

    const created = store.update((s) => createList(s, { name: order.name, description: order.description }));
    if (!store.lastUpdateOk) {
      alert('That curated order could not be saved, so nothing was imported.');
      return;
    }
    const listId = created.listOrder[created.listOrder.length - 1];
    let added = 0;
    store.update((s) => {
      const r = addIssuesToList(s, listId, order.items.map((i) => ({ ...i, source: 'curated', hydrated: true })), {});
      added = r.added;
      return r.state;
    });
    if (!store.lastUpdateOk) {
      alert('The list was created but its issues could not be saved.');
      return;
    }
    store.update((s) => setActive(s, listId));
    showView('read');
    announce(`Imported ${order.name}: ${added} issues. Any issues you had already read stay read.`);
  } catch (err) {
    alert(`Could not load that curated order: ${err.message}`);
  }
}

// ------------------------------------------------------------------ progress

function renderProgress() {
  const box = $('#series-progress');
  const rows = seriesProgress(store.state);
  box.replaceChildren();
  if (!rows.length) {
    box.append(el('p', { class: 'rail-hint', text: 'Nothing tracked yet.' }));
    return;
  }
  for (const r of rows) {
    const pct = r.tracked ? Math.round((r.read / r.tracked) * 100) : 0;
    box.append(el('div', { class: 'result' }, [
      el('div', { class: 'result-main' }, [
        el('div', { class: 'result-title', text: r.seriesName }),
        el('div', { class: 'result-meta', text: `${r.read} of ${r.tracked} tracked issues read (${pct}%)` }),
      ]),
      el('progress', { max: String(Math.max(1, r.tracked)), value: String(r.read) }),
    ]));
  }
}

// ------------------------------------------------------------------ data view

function exportMarkdown() {
  const id = activeListId();
  const list = store.state.lists[id];
  if (!list) return notify('#restore-report', 'No list is selected.', 'warn');
  const md = serializeChecklist({
    name: list.name,
    description: list.description,
    items: listItems(store.state, id),
  });
  download(`${slug(list.name)}.md`, md, 'text/markdown');
  announce('Markdown checklist downloaded.');
}

function wireData() {
  $('#api-base').value = settings.apiBase;
  $('#opt-covers').addEventListener('change', (e) => setCovers(e.target.checked));

  $('#btn-export-json').addEventListener('click', () => {
    download('marvel-reading-tracker-backup.json', JSON.stringify(exportBackup(store.state), null, 2), 'application/json');
    announce('Backup downloaded.');
  });

  $('#btn-export-md-2').addEventListener('click', exportMarkdown);

  $('#restore-file').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const res = store.restore(text);
    if (res.ok) {
      notify('#restore-report', 'Restored. Your previous data was snapshotted, so this can be undone once.', 'ok');
      $('#btn-undo-restore').hidden = false;
    } else {
      notify('#restore-report', `Restore refused, nothing was changed: ${res.errors.join(' ')}`, 'error');
    }
    e.target.value = '';
  });

  $('#btn-undo-restore').addEventListener('click', () => {
    const res = store.undoRestore();
    notify('#restore-report', res.ok ? 'Restore undone.' : `Could not undo: ${res.errors.join(' ')}`, res.ok ? 'ok' : 'error');
  });

  $('#form-settings').addEventListener('submit', (e) => {
    e.preventDefault();
    const value = $('#api-base').value.trim().replace(/\/+$/, '');
    try {
      const u = new URL(value);
      if (u.protocol !== 'https:' && u.hostname !== '127.0.0.1' && u.hostname !== 'localhost') {
        throw new Error('Use https, or a local address.');
      }
    } catch (err) {
      return notify('#restore-report', `That API URL is not usable: ${err.message}`, 'error');
    }
    settings.apiBase = value;
    saveSettings();
    cache = new ResponseCache({ baseUrl: value });
    api = new MarvelApi({ baseUrl: value, limiter, cache, onStatus: onApiStatus });
    hydrator.api = api;
    notify('#restore-report', 'API URL saved. Cached data from the previous URL is kept separate.', 'ok');
    checkHealth();
  });

  $('#btn-clear-cache').addEventListener('click', async () => {
    await cache.clear();
    await refreshCacheUsage();
    notify('#restore-report', 'Cached metadata cleared. Lists and reading progress are untouched.', 'ok');
  });

  $('#btn-wipe').addEventListener('click', () => {
    if (!confirm('Erase every list and all reading progress in this browser? Export a backup first if you are not sure.')) return;
    store.update(() => createEmptyState());
    cache.clear();
    announceIfSaved('All local data erased.');
  });
}

async function refreshCacheUsage() {
  try {
    const u = await cache.usage();
    $('#cache-usage').textContent = u.count
      ? `${u.count} cached responses, about ${(u.bytes / 1024 / 1024).toFixed(2)} MB of a ${(u.budget / 1024 / 1024).toFixed(0)} MB budget.`
      : 'Nothing cached yet.';
  } catch {
    $('#cache-usage').textContent = 'Cache unavailable in this browser. The app still works, just with more network requests.';
  }
}

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = el('a', { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function slug(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'list';
}

// ------------------------------------------------------------------ status

async function checkHealth() {
  const pill = $('#api-status');
  pill.className = 'pill pill-muted';
  pill.textContent = 'Checking API…';
  try {
    const h = await api.health();
    pill.className = 'pill pill-ok';
    pill.textContent = `API OK · ${Number(h.issue_count ?? 0).toLocaleString()} issues`;
  } catch {
    pill.className = 'pill pill-warn';
    pill.textContent = 'API unreachable. Lists and progress still work';
  }
}

function onApiStatus(s) {
  if (s?.kind === 'backoff') {
    announce(`The metadata service asked us to slow down. Waiting ${Math.round(s.ms / 1000)} seconds.`);
  }
  renderQueue();
}

function renderQueue() {
  const pill = $('#queue-status');
  const depth = limiter.depth;
  pill.hidden = depth === 0;
  pill.textContent = depth ? `${depth} request${depth === 1 ? '' : 's'} queued` : '';
}

function friendly(err) {
  if (err?.name === 'AbortError') return 'Cancelled.';
  if (err?.status === 404) return 'Not found in the metadata snapshot.';
  if (err?.transient) return 'The metadata service is busy. Try again in a moment.';
  if (err instanceof TypeError) return 'Could not reach the metadata service. Check your connection; your saved lists still work.';
  return err?.message || 'Something went wrong.';
}

// ------------------------------------------------------------------ render

function renderAll() {
  renderRail();
  renderReading();
  renderProgress();
  renderQueue();
  const list = store.state.lists[activeListId()];
  $('#add-target').textContent = list
    ? `Anything you add goes into “${list.name}”.`
    : 'Anything you add will start a new list.';
  // Kept in renderAll so the banner cannot go stale. In particular a successful restore
  // clears the block, and leaving the banner up would push the user toward "Start fresh",
  // which would then wipe the backup they had just restored.
  renderBlocked();
}

setInterval(renderQueue, 1000);
