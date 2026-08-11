// Application controller.
//
// Rendering follows the "Longbox Focus" design: a rail of reading orders, one hero card for
// the next unread issue, a short cover shelf, and the full order collapsed behind a summary.
// Cover art is optional everywhere: `body.nocovers` swaps every image for a typographic tile.

import {
  createList, deleteList, restoreList, duplicateList, renameList, setActive, addIssuesToList, removeFromList, moveItem,
  toggleRead, markRead, isRead, upNext, listProgress, seriesProgress, listItems, exportBackup,
  setOverride, pendingIssueIds, createEmptyState, coverUrl, listForCatalogId, SCHEMA_VERSION,
  setIssueNote, setListNote,
} from './lib/model.js';
import { parseChecklist, serializeChecklist, isSafeMarvelUrl, issueIdFromUrl, resolveUniqueExact } from './lib/markdown.js';
import { LIBRARY_VIEWS } from './lib/library.js';
import { availability, describe, localDayString, SHORT, STATE } from './lib/availability.js';
import { compareIssues } from './lib/sort.js';
import {
  parseCatalog, typeLabel, depthLabel, depthHint, catalogFacets, filterByFacet, facetLabel,
  searchCatalog, groupCatalog, variantLabel, sourceLink, sourceLabel, updatedLabel,
  catalogCoverUrl, readingTimeLabel, collectionsLabel,
} from './lib/catalog.js';
import { Store } from './storage.js';
import { MarvelApi, DEFAULT_BASE } from './api.js';
import { ResponseCache } from './cache.js';
import { RateLimiter } from './lib/limiter.js';
import { Hydrator } from './hydrate.js';
import { openIssue as openIssueTab, detailUrl } from './reader.js';
import { APP_VERSION } from './lib/version.js';
import { isAllowedApiBase } from './lib/apiBase.js';
import { shortcutAllowed } from './lib/shortcuts.js';
import { READING_FILTERS, DEFAULT_FILTER, matchesReadingFilter } from './lib/readingFilters.js';
import { DEFAULT_THEME, themeAttribute, normaliseTheme } from './lib/theme.js';
import { VIEWS, formatRoute, parseRoute } from './lib/route.js';
import { askConfirm, askText, askNote, wireAsk } from './ask.js';

const SETTINGS_KEY = 'mrt.settings';
const SIDEBAR_KEY = 'sidebar.collapsed';
const RING_CIRCUMFERENCE = 94.2; // 2πr for r=15, matching the SVG in index.html
const SHELF_SIZE = 8;
// The landing page shows this many cards and then hands the rest to the catalog page, so
// it stays a page you can take in at a glance however far the catalog grows.
const HOME_GRID_CAP = 12;
// Above this many orders, scanning stops being enough and the reader needs to type.
const HOME_FILTER_THRESHOLD = 12;
// Below this viewport width the rail collapses on its own; a manual toggle then wins until
// the breakpoint is crossed again.
const RAIL_BREAKPOINT = 1000;
// What the hero's heading says when there is no next issue to name. The hero is hidden in
// that state, so this is never read aloud or seen; it exists so the heading is never empty.
// It has to match the text in index.html, which is what the document starts out holding.
const HERO_NO_ISSUE = 'Nothing up next';
// The same for the landing page's continue card, whose heading also names its section. Both
// have to match the text index.html starts out holding.
const CONTINUE_NO_LIST = 'Continue reading';

const $ = (sel) => document.querySelector(sel);
// Read on use rather than at module load. This one query was the only thing this module did to
// the document while it was being evaluated, and it was what made the file impossible to import
// in Node: the ReferenceError landed before any test body ran, so no double could be installed
// early enough to prevent it. Resolved once per announcement rather than cached, because
// announcements are user-paced and a lookup costs nothing beside the 30ms wait below.
const announcer = () => $('#announcer');

const settings = loadSettings();
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

// One filter, shared by every list, and it now survives a reload. Per list was considered and
// rejected: the filter already crossed lists within a session, so making it per list would have
// changed behaviour a reader has today as well as adding state that grows with the library. A
// reader who sets Unread has said how they want to read, not how they want to read one order.
// Its restored value is applied in wireReading(), which runs before the first render.
let filter = DEFAULT_FILTER;
let view = 'read';

// ------------------------------------------------------------------ unreadable-data recovery

// Set once the user has saved a copy of the unreadable data to disk themselves. It is the only
// way out when the browser is too full to hold a second copy, which is exactly the situation
// where the automatic salvage fails.
let downloadedSalvage = false;

// The banner as the last render left it, so its withdrawal can take the notices that were about
// it. While the banner is up, everything the save report can hold is about the block: a refused
// write, the refusal to start fresh, and the empty-download warning are its only writers in that
// state. So the moment saving works again, whatever is still in there points at a banner that is
// no longer on screen. A restore is the path that exposed this, because it reports its own
// success to the restore pane and leaves the save report untouched.
let blockedBannerWasUp = false;

function renderBlocked() {
  const banner = $('#blocked-banner');
  banner.hidden = !store.blocked;
  // Painted from the reason the read failed rather than from the newest error, so a write
  // refused while blocked no longer displaces the one thing on this screen that the standing
  // copy cannot know. Written only when it differs, because this runs on every render and
  // assigning an identical string still replaces the text node inside a role="alert", which
  // invites the same sentence to be read out again on every save the reader makes.
  const why = $('#blocked-why');
  const reason = store.blockedReason ?? '';
  if (why.textContent !== reason) why.textContent = reason;
  // Below the hide, so a cleared reason is never on screen: the banner has already gone by the
  // time the text it held is emptied.
  if (blockedBannerWasUp && !store.blocked) $('#save-report').replaceChildren();
  blockedBannerWasUp = store.blocked;
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

  $('#btn-start-fresh').addEventListener('click', async () => {
    const yes = await askConfirm({
      title: 'Start fresh?',
      body: 'This replaces the unreadable saved data with an empty tracker. Download a copy first if you have not already.',
      confirmLabel: 'Start fresh',
    });
    if (!yes) return;
    // Not reported on failure: both failing exits assign lastError and then call onChange,
    // which already notifies here. Measured in Edge, 2 identical strings per refusal, now 1.
    if (store.startFresh({ confirmedDownloaded: downloadedSalvage })) {
      notify('#save-report', 'Started fresh. Saving is working again.', 'ok');
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
    // Presentation goes through the CSSOM, never a style attribute. Writing a style
    // attribute is what `style-src-attr` blocks under the Content-Security-Policy the
    // server sends, so `style` here takes an object of declarations.
    else if (k === 'style') for (const [p, pv] of Object.entries(v)) node.style.setProperty(p, pv);
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  for (const c of [].concat(children)) {
    if (c == null) continue;
    node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return node;
}

// A list rebuilt with replaceChildren destroys the node that had focus, and the browser drops focus
// to <body>. Measured in Edge with the full order disclosure open: focus a row's checkbox, click it,
// read document.activeElement immediately afterwards, and it reports BODY. A reader working down
// the order lost their place on every mark-read, every reorder and every removal. The hero escapes
// this because its buttons are static markup the re-render leaves in place, which is why the focus
// work in BL-026 stopped where it did.
//
// A node cannot be restored, because the node is gone. What is restored is the identity the node
// carried: which thing the control acts on, and which action it is. Both are written onto every
// control these lists build, so the same pair can be found again in the rebuilt DOM. That thing is
// an issue in the reading lists, a reading order in the rail and a catalog entry on the home grid.
// The key is only ever compared against controls in the same container, so one attribute serves all
// three; it was named `issue` while the reading lists were the only caller, which stopped being
// true in BL-058.
//
// `primary` is the action to land on when that pair no longer exists anywhere, which happens when
// the row is filtered away by the very act that was performed on it. Landing on the same action in
// the row that took its place would put focus on a destructive control the reader did not aim at:
// Enter auto-repeats on a held key, so restoring "Remove" under a finger already on Enter can
// delete the next issue too. The row's primary control is the honest landing instead.
//
// Capture and restore are separate functions because one caller cannot use them around a single
// rebuild. Adding from the home grid disables the button it was launched from, and disabling a
// focused control blurs it there and then, so by the time the grid rebuilds there is nothing left
// to read. That caller captures before the disable. Everyone else wants the pair together, which is
// what preservingFocus still is.

// Entries that carry no control are the filter hint and the "showing n of m" footer. Counting
// them would aim the ordinal at a line that has nothing to focus.
const focusEntries = (container) => [...container.children].filter((n) => n.querySelector('[data-act]'));

function captureFocus(container) {
  const prior = container.contains(document.activeElement) ? document.activeElement : null;
  return {
    container,
    act: prior?.dataset.act ?? null,
    key: prior?.dataset.key ?? null,
    ordinal: prior ? focusEntries(container).indexOf(prior.closest('li')) : -1,
  };
}

function restoreFocus(held, { primary, fallback } = {}) {
  if (!held?.act) return;
  const { container, act, key, ordinal } = held;
  const controls = [...container.querySelectorAll('[data-act]')];
  const exact = controls.find((c) => c.dataset.key === key && c.dataset.act === act) ?? null;
  const remaining = focusEntries(container);
  const heir = ordinal < 0 || remaining.length === 0
    ? null
    : remaining[Math.min(ordinal, remaining.length - 1)];
  const target = exact
    ?? heir?.querySelector(`[data-act="${primary}"]`)
    ?? fallback?.()
    ?? null;
  // The control the reader was already on is by definition where they were looking, so scrolling it
  // into view can only move the page under them. Anything else is somewhere they have not looked
  // yet, so the browser is left to bring it into view.
  target?.focus({ preventScroll: target === exact });
}

function preservingFocus(container, rebuild, opts) {
  const held = captureFocus(container);
  rebuild();
  restoreFocus(held, opts);
}

function announce(msg) {
  // Resolved once and reused, so both writes land on the same element even if the document
  // changes under us between them.
  const node = announcer();
  node.textContent = '';
  // Re-setting after a tick makes screen readers re-announce identical messages.
  setTimeout(() => { node.textContent = msg; }, 30);
}

// A success message must never outlive the write it describes. store.update rolls the change
// back when persistence fails, so every announcement has to consult the result first,
// otherwise a screen-reader user hears "List deleted" for a deletion that did not happen.
function announceIfSaved(msg) {
  if (store.lastUpdateOk) announce(msg);
}

// A message goes down exactly one channel. Writing into a container that is itself a live
// region and also copying the text into the announcer made a screen reader say everything
// twice, so the announcer is used only where the message has no live surface of its own.
//
// This is decided by reading the container rather than from a list of ids kept here, so
// marking a container as a live region later cannot quietly reintroduce the double-speak.
function isLive(node) {
  for (let n = node; n && n.getAttribute; n = n.parentElement) {
    const live = n.getAttribute('aria-live');
    if (live && live !== 'off') return true;
    if (['alert', 'status', 'log'].includes(n.getAttribute('role'))) return true;
  }
  return false;
}

// The catalog is loaded once and shown in two views, so a failure is one condition reported into
// whichever pane the reader is at. Keying it by the condition rather than by the pane is what lets
// a later success clear it wherever it was placed.
const CATALOG_LOAD = 'catalog-load';

// The stored API base is checked once at boot, so the complaint about a bad one is a single
// condition that outlives whichever view the reader happens to land on, and it is cleared by
// saving a usable base rather than by anything that happens in a particular pane.
const API_BASE_REJECTED = 'api-base-rejected';

// alert() reached the reader wherever they were; a pane fixed in one view does not. With
// a curated import in flight, three ways the named pane went unseen were measured: the
// reader switched view, so the pane was inside a hidden one and nothing appeared at all;
// the preview dialog was still open, so the pane sat behind its backdrop and outside the
// top layer; and the grid was scrolled, so the pane was 87px above the viewport.
//
// Each notice is remembered rather than only written into the page, because where it belongs can
// change after it is written. The reader can leave the view while a curated import is still in
// flight, and 219-issue orders make that window real, or a dialog can open over the pane. Placing
// every outstanding notice from this record is what keeps one message in exactly one place;
// moving the nodes about instead left a copy behind in the pane the message started in, and with
// two outstanding it kept whichever came first in the markup rather than the newer one.
const notices = new Map();

// #app-report is above every view, so it is the only pane always available to a message whose own
// pane the reader cannot see. Seven of the nine views carry no pane of their own.
function overflowPane() {
  const box = $('#app-report');
  return box?.offsetParent ? box : null;
}

function placeNotices() {
  const overflow = overflowPane();
  // Every dialog here is opened with showModal(), so an open one is the top layer and anything
  // behind it is inert and dimmed regardless of where it sits on the page.
  const modalPane = $('dialog[open]')?.querySelector('.report') ?? null;
  const placed = new Map();
  const claims = new Map();

  for (const [, note] of notices) {
    const own = $(note.sel);
    if (!own) continue;
    let box = own;
    // A notice carrying a control stays in its own pane. Moving a message into the modal makes it
    // readable where the reader is looking; moving a button there makes it pressable in a context
    // that has nothing to do with it, and acting on it can navigate the inert page behind the
    // dialog to a view the reader never asked for.
    if (modalPane && !note.action) box = modalPane;
    // offsetParent is null only under a display:none ancestor, which is how a view that is not
    // the current one is hidden.
    else if (!own.offsetParent) box = overflow ?? own;
    placed.set(note.sel, box);
    // Later wins a shared pane, and notices is kept in order of arrival, so what the reader sees
    // is the newest of two outstanding messages rather than whichever pane comes first.
    claims.set(box, note);
  }

  // A message already readable in a view's own pane must not be repeated in the shared one. The
  // same sentence twice on one screen is the visual form of the double-speak BL-027 removed.
  if (overflow && claims.has(overflow)) {
    const dup = [...claims].some(([box, note]) => box !== overflow && note.msg === claims.get(overflow).msg);
    if (dup) claims.delete(overflow);
  }

  for (const pane of document.querySelectorAll('.report')) {
    const note = claims.get(pane);
    pane.replaceChildren(...(note ? [noticeEl(note)] : []));
  }
  return placed;
}

// A notice with an action is a paragraph with a button in it rather than a message and a separate
// control, so that the offer is announced with the words that explain it and so that re-rendering
// the notice cannot leave the button behind in a pane the message has left.
function noticeEl({ msg, kind, action }) {
  return el('p', { class: `notice notice-${kind}${action ? ' notice-act' : ''}` }, [
    el('span', { class: 'grow', text: msg }),
    action ? el('button', { type: 'button', class: 'quiet', onclick: action.onClick }, action.label) : null,
  ]);
}

// The key is what a notice is cleared by, and it defaults to the pane so that most callers need
// not think about it. It is separate so that a condition reported into more than one pane, such as
// a catalog load, can be cleared wherever it ended up.
//
// `action` puts a button in the notice, for a message that offers a way back such as the undo
// after a delete.
function notify(sel, msg, kind = 'ok', key = sel, action = null) {
  const own = $(sel);
  if (!own) return;
  // Only the general notice panes move. #save-report sits above every view and is assertive
  // because a persistence failure must not be missed, and the result panes are read alongside the
  // form that filled them, so relocating either would lose the context that makes it actionable
  // and would quietly change which channel it goes out on.
  if (!own.classList.contains('report')) {
    own.replaceChildren(noticeEl({ msg, kind, action }));
    if (!isLive(own)) announce(spoken(msg, action));
    return;
  }
  // Re-inserted rather than overwritten in place, because a Map keeps a key at its original
  // position and arrival order is what decides the newest message.
  notices.delete(key);
  notices.set(key, { sel, msg, kind, action });
  const box = placeNotices().get(sel) ?? own;
  // Nothing else scrolls a pane into view, and "nearest" is a no-op once it is fully visible, so
  // this moves the page only when the message would otherwise be missed.
  box.scrollIntoView?.({ block: 'nearest' });
  if (!isLive(box)) announce(spoken(msg, action));
}

// A button that is never spoken is a button a screen reader user cannot know to look for, and the
// undo is the whole point of the message it sits in.
function spoken(msg, action) {
  return action ? `${msg} ${action.label} is available.` : msg;
}

function clearNotice(key) {
  notices.delete(key);
  placeNotices();
}

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const stored = typeof raw.apiBase === 'string' && raw.apiBase ? raw.apiBase.trim().replace(/\/+$/, '') : DEFAULT_BASE;
    // A stored base is not a checked base. It was written by whatever build was installed at the
    // time, survives every upgrade after it, and is one devtools edit away from being anything at
    // all, so the rule is applied on the way out of storage as well as on the way in. MarvelApi
    // throws on a base it will not use, and that constructor runs before anything is on screen,
    // so falling back is the only option that leaves a usable app. It is reported rather than
    // done quietly, because it changes which service the reader is talking to.
    const ok = isAllowedApiBase(stored);
    return {
      apiBase: ok ? stored : DEFAULT_BASE,
      covers: raw.covers !== false,
      // An unknown value falls back to following the system rather than to a fixed theme, so a
      // settings file from a future build that adds a theme degrades to the reader's own
      // preference instead of overriding it.
      theme: normaliseTheme(raw.theme),
      // Not checked against the filters that exist here, because that is a question about the
      // document rather than about storage. wireReading() answers it and writes the answer back,
      // which is why a value of the wrong type is passed through rather than coerced: coercing it
      // would produce something a radio matches, and the repair would never fire.
      filter: raw.filter === undefined ? 'all' : raw.filter,
      rejectedApiBase: ok ? null : stored,
    };
  } catch {
    return { apiBase: DEFAULT_BASE, covers: true, theme: DEFAULT_THEME, filter: 'all', rejectedApiBase: null };
  }
}

function saveSettings() {
  // Only the real settings are written. rejectedApiBase is a report about this boot, and
  // persisting it would turn a one-off complaint into part of the stored record.
  //
  // The refused value is written back rather than the fallback, because this is not only called
  // by the form that changes the base. setCovers() calls it too, so toggling cover art would
  // otherwise overwrite whatever the reader had configured with the default they were given
  // instead, unrecoverably and without saying so: the settings field already shows the fallback,
  // so there would be nothing left on screen holding the old value.
  const apiBase = settings.rejectedApiBase ?? settings.apiBase;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ apiBase, covers: settings.covers, theme: settings.theme, filter: settings.filter }));
  } catch { /* non-fatal */ }
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

function fallbackHue(issue) {
  return hueOf(issue?.seriesName || issue?.title || '');
}

// Wires an <img>/fallback pair. The fallback is shown when there is no cover URL at all,
// or when the image fails to load; `body.nocovers` handles the user's preference in CSS.
function paintCover(img, fb, issue, variant) {
  paintCoverUrl(img, fb, coverUrl(issue, variant), fallbackHue(issue));
}

// The hue is passed in rather than derived, because a catalog card's cover belongs to a
// reading order, not to a single issue.
function paintCoverUrl(img, fb, url, hue) {
  // Set the hue as a custom property rather than writing a style attribute. Assigning a
  // style attribute is what `style-src-attr` blocks under the server's Content-Security-
  // Policy, and it fired on every cover paint; setting a property through the CSSOM is
  // not a policy violation, so the gradient in styles.css does the drawing.
  fb.style.setProperty('--h', String(hue));
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
  // There is a toggle on the reading view and another on the landing page, and they are one
  // setting, so both are written rather than whichever happens to be on screen.
  for (const btn of document.querySelectorAll('[data-covers-toggle]')) {
    btn.setAttribute('aria-pressed', String(settings.covers));
    const label = btn.querySelector('.covers-label');
    if (label) label.textContent = settings.covers ? 'Cover art on' : 'Cover art off';
  }
  const opt = $('#opt-covers');
  if (opt) opt.checked = settings.covers;
}

function setCovers(on) {
  settings.covers = Boolean(on);
  saveSettings();
  applyCoversSetting();
  renderReading();
  renderHome();
  announce(settings.covers ? 'Cover art on.' : 'Cover art off. Covers are shown as text tiles.');
}

// ------------------------------------------------------------------ theme

function applyThemeSetting() {
  const attr = themeAttribute(settings.theme);
  if (attr) document.documentElement.setAttribute('data-theme', attr);
  else document.documentElement.removeAttribute('data-theme');
  // The meta tag tells the browser what to paint the scrollbars and form controls before any CSS
  // applies. Left saying "dark" it contradicts a light page for the first frame.
  const meta = document.querySelector('meta[name="color-scheme"]');
  if (meta) meta.setAttribute('content', attr ?? 'dark light');
  const opt = $('#opt-theme');
  if (opt) opt.value = settings.theme;
}

function setTheme(next) {
  settings.theme = normaliseTheme(next);
  saveSettings();
  applyThemeSetting();
  announce(
    settings.theme === 'system'
      ? 'Theme follows your system setting.'
      : `Theme set to ${settings.theme}.`,
  );
}

// No matchMedia listener. One was written here, and deleting it changed nothing a browser could
// show: with the stylesheet carrying its own `prefers-color-scheme` block, a reader on 'system'
// already sees the page follow a live preference change with no JavaScript involved. The listener
// only ever called applyThemeSetting(), and for 'system' every one of that function's effects is a
// no-op: the attribute is already absent, the meta tag already says "dark light", and the control
// already reads 'system'. It was found by mutation, not by review: removing it left a browser
// check that was written to catch exactly that still reporting a pass.

// ------------------------------------------------------------------ sidebar

// Collapsed means a 48px icon rail, not a hidden pane: nothing leaves the tab order and no
// destination becomes unreachable. See docs/ux/sidebar-flow.md.
let railed = false;
// Tracked so the responsive rule fires only when the breakpoint is actually crossed. Without
// it every resize event would re-apply the default and undo a deliberate toggle.
let wasNarrow = null;

function loadRailed() {
  try {
    const raw = localStorage.getItem(SIDEBAR_KEY);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
  } catch { /* private mode; fall through to the responsive default */ }
  return null;
}

// Only a deliberate toggle is a preference, so persisting is opt-in. The responsive rule and
// the first-run default also move the sidebar, and writing those to storage would let the act
// of resizing a window overwrite a choice the reader actually made.
function setRailed(next, { announceIt = false, persist = false } = {}) {
  railed = Boolean(next);
  $('#shell').classList.toggle('railed', railed);
  const toggle = $('#btn-rail-toggle');
  toggle.setAttribute('aria-expanded', String(!railed));
  toggle.title = railed ? 'Expand sidebar (Ctrl+\\)' : 'Collapse sidebar (Ctrl+\\)';
  if (!railed) hideRailTip();
  if (persist) {
    try { localStorage.setItem(SIDEBAR_KEY, String(railed)); } catch { /* non-fatal */ }
  }
  if (announceIt) announce(railed ? 'Sidebar collapsed.' : 'Sidebar expanded.');
}

function wireSidebar() {
  const saved = loadRailed();
  wasNarrow = window.innerWidth < RAIL_BREAKPOINT;
  // A saved choice is a deliberate one and outranks the responsive default, so a reader who
  // expanded the sidebar on a narrow window does not find it collapsed again on every visit.
  // The default itself is not written back: until the reader touches the toggle there is no
  // preference to record, and recording one would freeze the first window size they happened
  // to open the app at.
  setRailed(saved !== null ? saved : wasNarrow);

  $('#btn-rail-toggle').addEventListener('click', () => setRailed(!railed, { announceIt: true, persist: true }));

  document.addEventListener('keydown', (e) => {
    // Ctrl+\ and nothing else: the sidebar is chrome, so its shortcut must not fight a
    // text field the way the single-letter reading shortcuts would.
    if (e.key !== '\\' || !e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    setRailed(!railed, { announceIt: true, persist: true });
  });

  window.addEventListener('resize', () => {
    const isNarrow = window.innerWidth < RAIL_BREAKPOINT;
    // Only on the crossing. Applying this on every resize event would undo a toggle the
    // reader had just made, and a window drag fires hundreds of them.
    if (isNarrow === wasNarrow) return;
    wasNarrow = isNarrow;
    // A narrow window has no room for the full sidebar, so it always collapses. Widening
    // restores what the reader chose rather than assuming they want it open, so dragging a
    // window wide does not undo a deliberate collapse.
    setRailed(isNarrow || (loadRailed() ?? false));
  });

  wireRailTips();
}

// The rail is a scroll container, so a tooltip drawn inside it would be clipped at 48px.
// One fixed-position element outside the rail avoids that. It is decorative: the button's
// own label stays in the DOM as its accessible name, visually hidden in rail mode.
function wireRailTips() {
  const rail = $('#sidebar');
  const show = (e) => {
    const target = e.target instanceof Element ? e.target.closest('.ri, .brand, .pill') : null;
    if (!target || !railed) return hideRailTip();
    const text = (target.dataset.tip || target.textContent || '').trim();
    if (!text) return hideRailTip();
    const tip = $('#rail-tip');
    tip.textContent = text;
    tip.hidden = false;
    const box = target.getBoundingClientRect();
    tip.style.setProperty('left', `${Math.round(box.right + 8)}px`);
    tip.style.setProperty('top', `${Math.round(box.top + box.height / 2 - tip.offsetHeight / 2)}px`);
  };
  rail.addEventListener('pointerover', show);
  rail.addEventListener('pointerout', hideRailTip);
  // Focus as well as hover, or the rail is unusable to anyone navigating by keyboard.
  rail.addEventListener('focusin', show);
  rail.addEventListener('focusout', hideRailTip);
  window.addEventListener('scroll', hideRailTip, true);
}

function hideRailTip() {
  const tip = $('#rail-tip');
  if (tip) tip.hidden = true;
}

// ------------------------------------------------------------------ navigation

function wireNav() {
  for (const btn of document.querySelectorAll('[data-view]')) {
    btn.addEventListener('click', () => {
      // A click on the rail is the archetypal navigation, so this is the one that has to leave a
      // history entry for Back to come back to.
      showView(btn.dataset.view, { push: true });
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

  for (const btn of ['#btn-new-list', '#esc-new-list']) {
    $(btn).addEventListener('click', newEmptyList);
  }

  for (const btn of document.querySelectorAll('[data-covers-toggle]')) {
    btn.addEventListener('click', () => setCovers(!settings.covers));
  }
}

async function newEmptyList() {
  const name = await askText({
    title: 'New reading list',
    label: 'Name for the new list',
    value: 'My reading order',
    confirmLabel: 'Create list',
  });
  if (!name) return;
  // The id has to come from the state the store returned, not from store.state afterwards.
  // A failed write rolls the creation back, and listOrder's last entry would then be an
  // unrelated pre-existing list that we would silently switch the user to while telling
  // them their new list was created.
  const created = store.update((s) => createList(s, { name }));
  if (!store.lastUpdateOk) return;
  const id = created.listOrder[created.listOrder.length - 1];
  store.update((s) => setActive(s, id));
  showView('read', { push: true });
  announceIfSaved(`Created list ${name}.`);
}

// Every section the rail can reach now lives in lib/route.js, so that one list backs both what
// showView can display and what a URL can address.

// The URL is written from the state, never the other way round, except at boot and on a Back press.
// Nothing may be written before boot has had its chance to read the incoming hash: renderAll runs
// once before the route is restored, and an ungated sync there would overwrite the very address the
// reader arrived on.
let routeReady = false;

// `push` separates a deliberate navigation from a passive correction, and the distinction is what
// keeps Back usable. A reader who marks twenty issues read must not have to press Back twenty times
// to leave the view, so every passive sync replaces.
//
// Both branches write history rather than assigning location.hash, and that is the difference that
// lets a reading filter be pushed. Assigning the hash fires hashchange synchronously, which re-runs
// applyRoute and moves focus to the view heading. Every caller that pushes a view already reached
// showView with focus of its own, so that second pass was redundant for them; for a filter radio it
// would have thrown the keyboard out of the control the reader just pressed, which is the defect
// BL-054 and BL-058 fixed for the rows. pushState fires no hashchange, and Back over an entry it
// made still does, both measured in Edge before this was relied on.
//
// The compare against the current hash is not an optimisation. pushState given the address already
// showing would stack a duplicate entry, so Back would appear to do nothing once per navigation.
// True while a keyboard traversal of the filter group is open, meaning the reader is part way
// through choosing and the address has deliberately not been written yet. Kept beside syncHash
// rather than inside wireReading because syncHash and applyRoute both have to see it.
//
// The first design pushed on the traversal's first stop and replaced on every stop after it. Review
// found that a traversal returning to the filter it started from then replaced the top entry with a
// copy of the one below it, and a same-document Back between two identical fragments fires no
// hashchange at all, so the press did nothing. Measured on that tree: ArrowRight then ArrowLeft left
// history ["#/read/list-a", "#/read/list-a"] and the following Back reported 0 hashchange events
// with the rows unmoved. That is the very failure the paragraph above says the guard exists to
// prevent, reached from the other side. A replace cannot remove an entry the run has already
// pushed, and history.back() is async and races the next arrow press, so the write is held until
// the traversal ends instead.
let filterRunOpen = false;
// What the address claims while a traversal is open, which is the filter in force when it began.
// Not the same as `filter`, which follows the rows immediately.
let filterRunBase = null;

function syncHash({ push = false } = {}) {
  if (!routeReady) return;
  // While a traversal is open the address lags the rows on purpose: the entry on top is the one the
  // reader arrived on and Back has to return to it. A passive sync fired by something else in that
  // window would otherwise replace it with the half-chosen address and destroy it. That is reachable
  // rather than theoretical: background hydration writes through store.update on its own timer, and
  // every store.update reaches renderAll, which syncs.
  const shown = filterRunOpen && !push ? filterRunBase : filter;
  const next = formatRoute({ view, listId: activeListId(), filter: shown });
  if (!next || next === location.hash) return;

  // A hash that is not ours is someone else's anchor, and index.html ships one: the skip link
  // targets #main and pushes a history entry, so an ordinary keyboard user lands here. A passive
  // sync leaves it alone rather than yanking the page away from where they just jumped. A
  // deliberate navigation does overwrite it, because the anchor is no longer where they are.
  if (!push && location.hash && !parseRoute(location.hash)) return;

  if (push) history.pushState(null, '', next);
  else history.replaceState(null, '', next);
}

// Committing writes the traversal's one entry; discarding drops it because something else has
// already decided the address. A commit that lands back on the address the traversal started from
// meets the compare in syncHash and correctly writes nothing, which is why the whole sweep can
// leave zero entries as well as one.
function endFilterRun({ commit }) {
  if (!filterRunOpen) return;
  filterRunOpen = false;
  filterRunBase = null;
  if (commit) syncHash({ push: true });
}

// Adopting the list first means the redirect inside showView sees the list the URL asked for
// rather than whichever one happened to be active. A list id that no longer exists is left to
// setActive, which returns the state untouched, so the trailing sync inside showView corrects the
// address instead of leaving it claiming a list that is not on screen.
//
// `filterIfAbsent` is what an address saying nothing about the filter means, and it is not the same
// answer in the two places this is called from. Back and Forward hand over an address this app
// wrote, and this app omits the filter only when it is the default, so absent there really does
// mean All: without that, pressing Back over the moment a filter was chosen would leave the filter
// in force and rewrite the address to match, which is the one thing this task exists to fix. Boot
// is the opposite. An address with no filter can be a bookmark made before this shipped, and
// answering it with All would discard the setting BL-037 exists to keep across a reload, so boot
// passes whatever was restored from settings.
// `route.listId` is a string a reader can type, and the list map used to be an ordinary object, so a
// bare lookup answered `__proto__`, `constructor` or `toString` with something from Object.prototype
// and this guard would pass on a list that does not exist. Measured on the tree before this line
// changed: opening `#/read/__proto__` persisted `active: "__proto__"` and then threw a TypeError out
// of listProgress, and because the id survives in storage the same throw happened on the next boot,
// during module evaluation, which left the hashchange listener unregistered. `Object.hasOwn` asks
// the question the guard means. BL-068 has since given the map a null prototype, so this now holds
// twice over, and it stays because it states the question rather than relying on the map's type.
function applyRoute(route, { focus, filterIfAbsent }) {
  if (route.listId && route.listId !== activeListId() && Object.hasOwn(store.state.lists, route.listId)) {
    store.update((s) => setActive(s, route.listId));
  }
  // Before showView, so the passive sync at the end of showView computes the address this route
  // already describes and returns early rather than writing one and being corrected a moment later.
  setFilter(route.filter ?? filterIfAbsent);
  // A traversal cannot span a navigation, and Back is a navigation. Discarded rather than committed,
  // because the address this route describes is the authoritative one and writing the traversal's
  // would fight it.
  //
  // Above showView, and that is the whole of it. Below the trailing sync, the run would still be open
  // when that sync ran, so it would format the address from filterRunBase and leave the address
  // claiming a filter the rows are not showing. Measured on a modelled stack: pending in force,
  // ArrowRight once, then Alt+Left leaves the address saying pending over rows showing all, and puts
  // the same address in two adjacent entries, which is the dead Back this whole design exists to
  // close.
  endFilterRun({ commit: false });
  showView(route.view, { focus });
}

// Moving focus to the new view's heading is what makes the rail usable with a keyboard or a
// screen reader. Without it, focus stays on the rail button and the view change is silent, so
// the next Tab continues from the old position and nothing announces where you now are.
function showView(next, { focus = true, push = false } = {}) {
  // There is nothing to read without an active list, so the reading view hands over to the
  // landing page rather than showing an empty frame with a heading over it. `Object.hasOwn` for
  // the same reason as in applyRoute, and past tense for the same reason: the map used to answer a
  // bare lookup with a prototype member, and BL-068 has since given it none to answer with.
  if (next === 'read' && !Object.hasOwn(store.state.lists, activeListId() ?? '')) next = 'home';

  view = next;
  for (const name of VIEWS) {
    $(`#view-${name}`).hidden = name !== next;
  }
  for (const btn of document.querySelectorAll('.ri[data-view]')) {
    if (btn.dataset.view === next) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  }
  renderRail();
  if (next === 'catalog') renderCatalog();
  if (next === 'home') renderHome();
  // Here rather than in renderAll, because what this list reports is not part of the state every
  // render repaints: it changes when a read fails at boot, when the reader removes a copy, and in
  // another tab. Rebuilding it on arrival covers all three and leaves renderAll's fan-out alone.
  if (next === 'data') renderSalvage();
  window.scrollTo({ top: 0 });
  // After the scroll to the top, so that bringing a message into view is not undone. Which pane
  // each outstanding notice belongs in has just changed, because a different view is showing.
  placeNotices();
  // Above the focus-free early return, or every call that passes focus:false would leave the
  // address bar behind. Boot is one such call.
  syncHash({ push });

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
  // renderAll rebuilds the rail on every store.update, with no navigation, so a reader who
  // pressed `d` on the read view with a rail button focused lost focus to <body>. Measured in
  // Edge at 1280x900: the order went from 0 of 89 read to 1 of 89, the view did not change, and
  // document.activeElement reported BODY. The other route here is showView, which focuses the
  // new view's heading afterwards and so is unaffected either way.
  preservingFocus(nav, () => {
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
        'aria-current': current ? 'page' : null,
        // A reading order has no glyph of its own, so the tooltip has to be built rather
        // than read off the button: in rail mode the progress numbers are not on screen.
        dataset: { key: id, act: 'open', tip: `${list.name}: ${read} of ${total} read` },
        onclick: () => { store.update((s) => setActive(s, id)); showView('read', { push: true }); },
      }, [
        // Stands in for an icon in rail mode; hidden from the accessibility tree because
        // the list's name is right beside it.
        el('span', { class: 'init', 'aria-hidden': true, text: (list.name || '?').trim().charAt(0) }),
        el('span', { class: 'lbl' }, [
          el('span', { class: 't' }, [
            el('span', { text: list.name }),
            el('span', { class: 'n', text: `${read} / ${total}` }),
          ]),
          el('span', { class: 'bar' }, el('i', { style: { width: `${pct.toFixed(1)}%` } })),
        ]),
      ])));
    }
  }, { primary: 'open' });
}

// ------------------------------------------------------------------ reading view

// ------------------------------------------------------------------ landing page

// Filter state lives for the session, not across reloads: it is a way of narrowing what is
// on screen right now, not a preference. See docs/ux/landing-page-flow.md.
let homeFacet = 'all';
let homeQuery = '';
// The parsed catalog, kept so the grid can re-render synchronously when the library changes
// and a card has to flip to "In library".
let homeCatalog = null;
// Catalog ids that were just added, so the button can show "✓ In library" for a beat before
// settling into "Open →". Transient by design; a reload shows the settled state.
const justAdded = new Set();

function wireHome() {
  $('#form-home-q').addEventListener('submit', (e) => e.preventDefault());
  const q = $('#home-q');
  q.addEventListener('input', () => { homeQuery = q.value.trim(); renderHomeCatalog({ announceCount: true }); });
  $('#home-q-clear').addEventListener('click', () => {
    q.value = '';
    homeQuery = '';
    q.focus();
    renderHomeCatalog({ announceCount: true });
  });

  // The whole point of "See all" is that it is the same view of the same catalog, so the
  // filter and the search box travel with the reader rather than resetting under them.
  $('#home-see-all').addEventListener('click', () => {
    catalogFacet = homeFacet;
    catalogQuery = homeQuery;
    $('#catalog-q').value = homeQuery;
    showView('catalog', { push: true });
  });

  $('#btn-chero-read').addEventListener('click', (e) => {
    const issue = upNext(store.state, activeListId());
    if (issue) openInReader(issue, e);
  });
  $('#btn-chero-open').addEventListener('click', () => showView('read', { push: true }));
}

function renderHome() {
  if ($('#view-home').hidden) return;
  const populated = store.state.listOrder.length > 0;

  $('#home-h').textContent = populated ? 'Continue reading' : 'Pick something to read';
  $('#home-sub').textContent = populated
    ? 'Everything you are tracking, and where you left off. All of it is stored on this device.'
    : 'Every order below ships with the app, so adding one needs no internet connection.';
  $('#home-cat-h').textContent = populated ? 'Discover more' : 'Reading orders';

  renderContinue(populated);
  renderYours(populated);
  renderHomeCatalog();

  // The attribution is required wherever Marvel data is shown, and the year has to be the
  // current one rather than a string baked into the markup.
  $('#marvel-copyright').textContent = `© ${new Date().getFullYear()} MARVEL`;
}

// State B's hero: the list being read, how far through it the reader is, and what is next.
// There are no read timestamps in the state, so "where you left off" is the active list —
// the one the reader last opened — rather than a guess at recency.
function renderContinue(populated) {
  const sec = $('#home-continue');
  const id = activeListId();
  const list = store.state.lists[id];
  sec.hidden = !populated || !list;
  // Hidden rather than emptied, so the heading keeps text. It labels this section, so an
  // empty one costs the section its name too.
  if (sec.hidden) {
    $('#chero-h').textContent = CONTINUE_NO_LIST;
    return;
  }

  const { read, total } = listProgress(store.state, id);
  const issue = upNext(store.state, id);

  $('#chero-h').textContent = list.name;

  const bar = $('#chero-bar');
  bar.setAttribute('aria-valuemax', String(total));
  bar.setAttribute('aria-valuenow', String(read));
  // The percentage alone would be a bare number to a screen reader; the text is what says
  // what the number counts, and it is on screen too rather than being audio-only.
  bar.setAttribute('aria-valuetext', `${read} of ${total} issues read`);
  $('#chero-fill').style.setProperty('width', `${total ? ((read / total) * 100).toFixed(1) : 0}%`);
  $('#chero-count').textContent = `${read} of ${total} issue${total === 1 ? '' : 's'} read`;

  if (issue) {
    $('#chero-next').textContent = `Next: ${issue.title}`;
    paintCover($('#chero-img'), $('#chero-fb'), issue, 'portrait_incredible');
    $('#chero-fs').textContent = seriesOnly(issue.seriesName);
    $('#chero-fn').textContent = issue.number ? `#${issue.number}` : '';
    $('#btn-chero-read').hidden = false;
    $('#btn-chero-read').setAttribute('aria-label', `Read ${issue.title} in Marvel Unlimited`);
  } else {
    $('#chero-next').textContent = 'You have read every issue in this order.';
    // Nothing to open, so the button goes rather than sitting there disabled with no
    // explanation of why it cannot be used.
    $('#btn-chero-read').hidden = true;
    paintCoverUrl($('#chero-img'), $('#chero-fb'), null, hueOf(list.name));
    $('#chero-fs').textContent = shortTitle(list.name);
    $('#chero-fn').textContent = '';
  }
  $('#btn-chero-open').setAttribute('aria-label', `Open ${list.name}`);
}

function renderYours(populated) {
  const sec = $('#home-yours');
  sec.hidden = !populated;
  if (sec.hidden) return;

  const box = $('#home-yours-list');
  box.replaceChildren(...store.state.listOrder.map((id) => {
    const list = store.state.lists[id];
    const { read, total } = listProgress(store.state, id);
    const pct = total ? (read / total) * 100 : 0;
    return el('li', {}, el('button', {
      type: 'button',
      'aria-label': `Open ${list.name}, ${read} of ${total} issues read`,
      onclick: () => { store.update((s) => setActive(s, id)); showView('read', { push: true }); },
    }, [
      el('span', { class: 'yours-name', text: list.name }),
      el('span', { class: 'pbar', 'aria-hidden': true }, el('i', { style: { width: `${pct.toFixed(1)}%` } })),
      // Repeated as text because a bar alone conveys progress by shape only.
      el('span', { class: 'yours-count', text: `${read} / ${total}` }),
    ]));
  }));
}

async function renderHomeCatalog({ announceCount = false } = {}) {
  const grid = $('#home-grid');
  // Every other route into this function rebuilds the grid while focus is outside it, on the
  // search box or a filter radio, and a capture from outside the container is empty and restores
  // nothing. The route that matters is the settle 1500 ms after an add, which destroys the button
  // focus was just put back on.
  const held = captureFocus(grid);

  if (!homeCatalog) {
    grid.replaceChildren(el('li', { class: 'rail-hint', text: 'Loading reading orders…' }));
    try {
      homeCatalog = await loadCatalog();
    } catch (err) {
      grid.replaceChildren();
      $('#home-chips').hidden = true;
      $('#form-home-q').hidden = true;
      notify('#home-cat-report', `The catalog could not be loaded: ${err.message}. Your lists are unchanged.`, 'error', CATALOG_LOAD);
      return;
    }
    clearNotice(CATALOG_LOAD);
  }

  if (homeCatalog.dropped) {
    notify(
      '#home-cat-report',
      `${homeCatalog.dropped} catalog ${homeCatalog.dropped === 1 ? 'entry is' : 'entries are'} incomplete and cannot be shown.`,
      'warn',
    );
  }

  const all = homeCatalog.lists;
  if (!all.length) {
    $('#home-chips').hidden = true;
    $('#form-home-q').hidden = true;
    $('#home-see-all').hidden = true;
    $('#home-overflow').hidden = true;
    grid.replaceChildren(el('li', { class: 'rail-hint', text: 'No curated reading orders are bundled with this build.' }));
    return;
  }

  renderHomeChips(all);
  // Scanning works up to about a dozen orders; past that the reader needs to be able to
  // type. Showing the box before then would be a control with nothing to do.
  $('#form-home-q').hidden = all.length <= HOME_FILTER_THRESHOLD;
  if ($('#form-home-q').hidden && homeQuery) {
    homeQuery = '';
    $('#home-q').value = '';
  }
  $('#home-q-clear').hidden = !homeQuery;

  const matched = searchCatalog(filterByFacet(all, homeFacet), homeQuery);
  const shown = matched.slice(0, HOME_GRID_CAP);
  const rest = matched.length - shown.length;

  grid.replaceChildren(...shown.map(orderCard));

  if (!matched.length) {
    const where = homeFacet === 'all' ? '' : ` in ${facetLabel(all, homeFacet)}`;
    grid.replaceChildren(el('li', {
      class: 'rail-hint',
      text: homeQuery
        ? `No reading orders match “${homeQuery}”${where}.`
        : `No reading orders${where || ''}.`,
    }));
  }

  // The overflow is stated as a number rather than an ellipsis, so the reader knows how much
  // catalog they have not seen before deciding whether to go looking.
  $('#home-overflow').hidden = rest <= 0;
  $('#home-overflow').textContent = rest > 0
    ? `Showing ${shown.length} of ${matched.length} reading orders.`
    : '';
  $('#home-see-all').hidden = matched.length <= HOME_GRID_CAP;
  $('#home-see-all').textContent = `See all ${matched.length} orders →`;
  restoreFocus(held, { primary: 'main' });
  // Only when the reader narrowed something. Announcing on every render would let a routine
  // count overwrite the confirmation that an order had just been added, which is the message
  // that actually matters.
  if (announceCount) {
    announceCatalog(`${matched.length} reading ${matched.length === 1 ? 'order' : 'orders'} shown.`);
  }
}

// The grid rebuild that follows an add runs after an await, and a reader is free to move during
// it. Focus was lost to <body> by the disable, so <body> is the only state that means "still
// lost"; anything else is somewhere the reader chose to be, and putting them back would be the
// same rudeness in the other direction.
function returnFocus(held) {
  if (document.activeElement !== document.body) return;
  restoreFocus(held, { primary: 'main' });
}

function renderHomeChips(all) {
  const box = $('#home-chips');
  const options = catalogFacets(all);
  box.hidden = options.length < 2;
  if (box.hidden) {
    homeFacet = 'all';
    return;
  }
  if (homeFacet !== 'all' && !options.some((o) => o.key === homeFacet)) homeFacet = 'all';

  // Re-rendering the radios under a reader who just chose one would destroy the element
  // holding focus, so an unchanged set of options only moves the selection.
  const existing = [...box.querySelectorAll('input[name="home-facet"]')];
  if (existing.length === options.length && existing.every((r, i) => r.value === options[i].key)) {
    for (const radio of existing) radio.checked = radio.value === homeFacet;
    return;
  }

  box.replaceChildren(
    el('legend', { class: 'visually-hidden', text: 'Filter reading orders' }),
    // Native radios in a fieldset already give a radio group with arrow-key navigation and
    // a checked state, so nothing here is re-implemented in ARIA.
    ...options.map(({ key, label, count }) => el('label', { class: 'fp' }, [
      el('input', {
        type: 'radio',
        name: 'home-facet',
        value: key,
        checked: key === homeFacet,
        onchange: () => { homeFacet = key; renderHomeCatalog({ announceCount: true }); },
      }),
      el('span', { text: `${label} (${count})` }),
    ])),
  );
}

// One card. The title is an <h3> and the description is a <p>, so neither can sit inside a
// button: that is not valid content for one, and it would collapse the whole card into a
// single unreadable accessible name. The preview button is a sibling stretched over the card
// by CSS instead, which keeps the large click target without the nesting.
function orderCard(list) {
  const inLibrary = listForCatalogId(store.state, list.id);
  const meta = [
    `${list.count} issue${list.count === 1 ? '' : 's'}`,
    collectionsLabel(list),
    readingTimeLabel(list.count),
    typeLabel(list.type),
  ].filter(Boolean).join(' · ');

  const img = el('img', { alt: '' });
  const fb = el('div', { class: 'of', 'aria-hidden': true }, [
    el('span', { class: 'ofs', text: shortTitle(list.name) }),
  ]);
  // The cover is decorative: the title is right next to it, so alt text would only repeat it.
  paintCoverUrl(img, fb, catalogCoverUrl(list), hueOf(list.name));

  return el('li', { class: 'ocard' }, [
    el('div', { class: 'ocard-body' }, [
      el('div', { class: 'ocard-art' }, [img, fb]),
      el('div', { class: 'ocard-text' }, [
        el('h3', { class: 'ocard-title', text: list.name }),
        list.description ? el('p', { class: 'ocard-desc', text: list.description }) : null,
        el('p', { class: 'ocard-meta', text: meta }),
        // Beginner-friendliness is why many readers pick an order, so it is a visible mark
        // rather than only a filter you have to know to apply.
        list.beginner ? el('p', {}, el('span', { class: 'pill', text: 'Beginner-friendly' })) : null,
      ]),
    ]),
    el('div', { class: 'ocard-foot' }, [
      addButton(list, inLibrary),
      // The count is already on the card, in the meta line above, so repeating it on the button
      // only needed the dash it was joined with. "See the full list" says what the button does.
      el('button', {
        type: 'button',
        class: 'ocard-preview',
        'aria-label': `Preview the issue list for ${list.name}`,
        dataset: { key: list.id, act: 'preview' },
        onclick: () => openPreview(list),
      }, 'See the full list'),
    ]),
  ]);
}

function addButton(list, inLibrary) {
  // One act name for both states because it is the slot that persists, not the action. Adding
  // replaces this button with "✓ In library" and then with "Open →", and the reader who pressed
  // it should land on whatever the card's main control has become.
  if (inLibrary) {
    const settled = !justAdded.has(list.id);
    return el('button', {
      type: 'button',
      class: settled ? 'btn btn-g' : 'btn btn-added',
      'aria-label': settled ? `Open ${list.name}` : `${list.name} is in your library`,
      dataset: { key: list.id, act: 'main' },
      onclick: () => {
        store.update((s) => setActive(s, inLibrary.id));
        showView('read', { push: true });
      },
    }, settled ? 'Open →' : '✓ In library');
  }
  return el('button', {
    type: 'button',
    class: 'btn',
    // Read out of context, "Add" says nothing; the order's name has to be in the name.
    'aria-label': `Add ${list.name} to library`,
    dataset: { key: list.id, act: 'main' },
    onclick: (e) => addFromCatalog(list, e.currentTarget),
  }, '+ Add to library');
}

async function addFromCatalog(list, btn) {
  // Read before importCurated, which disables this button. Disabling a focused control blurs it
  // immediately, so a capture taken at rebuild time reads <body> and correctly declines to
  // restore anything. Measured in Edge at 1280x900: clicking "+ Add to library" left
  // document.activeElement at BODY while the button was still in the document, and still BODY
  // two seconds later once both rebuilds had run.
  const held = captureFocus($('#home-grid'));
  // Flipped before the import so the card confirms in place the moment it is clicked, and
  // rolled back if the write fails rather than leaving a false "in library".
  justAdded.add(list.id);
  // Adding must not move the reader, so they can add a second order without finding their
  // way back. The sidebar and the card are the confirmation.
  const listId = await importCurated(list, btn, { navigate: false, report: '#home-cat-report' });
  if (!listId) {
    justAdded.delete(list.id);
    await renderHomeCatalog();
    returnFocus(held);
    return;
  }
  await renderHomeCatalog();
  returnFocus(held);
  syncPreviewAdd();
  // The card settles from "✓ In library" to "Open →" once the confirmation has been read,
  // so the button ends up saying what it now does. The rebuild that settles it destroys the
  // button focus was just put back on, which renderHomeCatalog preserves on its own.
  setTimeout(async () => {
    justAdded.delete(list.id);
    await renderHomeCatalog();
    syncPreviewAdd();
  }, 1500);
}

// ------------------------------------------------------------------ preview

let previewLoad = null;
let previewList = null;

function syncPreviewAdd() {
  if (!previewList || !$('#preview').open) return;
  $('#preview-add').replaceChildren(addButton(previewList, listForCatalogId(store.state, previewList.id)));
}

function wirePreview() {
  $('#preview-close').addEventListener('click', () => $('#preview').close());
  // Clicking the backdrop closes, matching the Escape key that <dialog> gives us free.
  $('#preview').addEventListener('click', (e) => {
    if (e.target === $('#preview')) $('#preview').close();
  });
  $('#preview').addEventListener('close', () => { previewList = null; placeNotices(); });
}

async function openPreview(list) {
  const dlg = $('#preview');
  previewList = list;
  $('#preview-h').textContent = list.name;
  const readingTime = readingTimeLabel(list.count);
  $('#preview-meta').textContent = [
    `${list.count} issue${list.count === 1 ? '' : 's'}`,
    collectionsLabel(list),
    readingTime,
    depthLabel(list.depth),
  ].filter(Boolean).join(' · ');
  $('#preview-desc').textContent = list.description || '';
  $('#preview-body').replaceChildren(el('p', { class: 'rail-hint', text: 'Loading the issue list…' }));
  $('#preview-add').replaceChildren(addButton(list, listForCatalogId(store.state, list.id)));
  dlg.showModal();

  // A second preview opened while the first is still loading would otherwise race it and
  // could paint the wrong order's issues into the dialog.
  const token = {};
  previewLoad = token;
  try {
    const res = await fetch(`./data/${list.file}`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const order = await res.json();
    if (previewLoad !== token) return;
    // Sub-headings for a trade order, so the reader can see the books before importing, which
    // is the whole reason to pick this variant over the issue-by-issue one. The number keeps
    // counting across a heading because it numbers the reading order, not the book.
    let shown = null;
    const nodes = [];
    order.items.forEach((item, i) => {
      const edition = typeof item.collectedIn === 'string' ? item.collectedIn : null;
      if (edition && edition !== shown) {
        shown = edition;
        nodes.push(el('li', { class: 'preview-group' }, [el('h4', { text: edition })]));
      }
      nodes.push(el('li', {}, [
        // Numbered because the order is the point; the reading order is what the reader came
        // to the preview to see.
        el('span', { class: 'pn', text: String(i + 1) }),
        el('span', { text: item.title || 'Untitled issue' }),
      ]));
    });
    $('#preview-body').replaceChildren(el('ol', { class: 'preview-list' }, nodes));
  } catch (err) {
    if (previewLoad !== token) return;
    $('#preview-body').replaceChildren(el('p', {
      class: 'rail-hint',
      text: `The issue list could not be loaded: ${err.message}. You can still add the order.`,
    }));
  }
}

// ------------------------------------------------------------------ reading view

// The one way the filter in force changes, whether the reader chose a radio, arrived on a link, or
// pressed Back. Three copies of this were the alternative, and the copies would have differed:
// setting it from a route has to move the radio, and setting it from the radio has to store it.
//
// The filter is stored wherever it comes from, including from an address. That matches what
// applyRoute already does with the active list, which setActive writes into persisted state, and it
// is what makes Back consistent: if pressing Back moved the rows but not the preference, closing
// the tab and reopening it would show something other than what was last on screen.
//
// Returns early when nothing changed, so navigating between views does not rewrite settings on
// every hop or rebuild rows that are already correct.
function setFilter(next) {
  const wanted = READING_FILTERS.some((f) => f.value === next) ? next : DEFAULT_FILTER;
  if (wanted === filter) return;
  filter = wanted;
  settings.filter = wanted;
  saveSettings();
  const radio = [...document.querySelectorAll('input[name="filter"]')].find((r) => r.value === wanted);
  if (radio) radio.checked = true;
  renderRows();
}

function wireReading() {
  // Rendered from READING_FILTERS rather than authored in index.html, so the labels a reader can
  // choose from and the predicates that decide a row are one list and cannot disagree. Rendered
  // once, here, and never from renderRows(): rebuilding a radio group destroys the radio the
  // reader just activated and drops the keyboard out of the filter, which is the defect BL-054
  // fixed for the rows below and the reason the catalog's own filters are left alone on re-render.
  //
  // A radio written into the markup by hand would otherwise survive this append and sit beside the
  // rendered five, offering a filter with no predicate and no listener behind it, which is the
  // failure this item exists to end rather than one to reintroduce here. Measured on the tree
  // before this change, with a sixth radio authored into the fieldset: selecting it showed all 8
  // rows of an 8 row fixture, stored itself as the active filter, and threw nothing.
  const stray = [...document.querySelectorAll('input[name="filter"]')];
  if (stray.length) {
    throw new Error(`The document holds reading filters (${stray.map((r) => r.value).join(', ')}). `
      + 'They are rendered from READING_FILTERS in src/js/lib/readingFilters.js; add it there instead.');
  }
  $('#reading-filters').append(...READING_FILTERS.map((f) => el('label', { class: 'fp' }, [
    el('input', { type: 'radio', name: 'filter', value: f.value }),
    el('span', { text: f.label }),
  ])));

  // `renderRows` builds nothing while the order is closed, so opening it is what asks for the
  // rows. `toggle` fires before the next paint, so the order is filled by the time the details
  // has finished opening and there is no empty frame in between.
  $('#full').addEventListener('toggle', () => {
    if ($('#full').open && rowsPending) renderRows();
  });

  const radios = [...document.querySelectorAll('input[name="filter"]')];
  // Set by a keydown just before the change the same press produces, and read by that change to
  // tell one stop of a traversal from a decision.
  let arrowing = false;

  // A stored value is honoured only when the list offers it. There is no longer a second
  // enumeration for it to disagree with, but the check earns its place for a reason the markup
  // never covered: settings are a file the reader can edit and an older build could have written
  // a filter this one has since dropped. The group cannot be empty here, because it was just
  // filled from a list that is checked at load for holding the default, so a document missing the
  // fieldset fails at that append rather than arriving as a value quietly corrected in storage.
  const wanted = radios.find((r) => r.value === settings.filter);
  filter = wanted ? wanted.value : DEFAULT_FILTER;
  // An unrecognised value is corrected in storage rather than left there. It is unlike a refused
  // API base, which is kept because a reader typed it and may want to repair a typo; no control
  // here can produce this, none can show it, and nothing would ever clear it, so it would sit in
  // the record being ignored on every boot.
  if (!wanted) {
    settings.filter = filter;
    saveSettings();
  }
  // The control is set from the state rather than left to the browser's own form restoration on a
  // reload, which restores it without telling this module. The rendered group starts with nothing
  // checked, so this is also what puts the first mark on the filter in force.
  const active = radios.find((r) => r.value === filter);
  if (active) active.checked = true;

  for (const radio of radios) {
    // Arrow keys move a radio group one stop at a time and fire change at every stop. Measured in
    // Edge on this tree: three presses of ArrowRight left three history entries, and one Back
    // landed two filters short of where the reader began, walking them back through filters they
    // only passed over on the way to the one they wanted. So a traversal writes nothing until it
    // ends and then writes one entry, which leaves the address the reader arrived on underneath it.
    // A change that no arrow key produced is a decision on its own and writes immediately, so two
    // pointer clicks still get an entry each.
    //
    // Modifiers are excluded because the radio group does not consume them, so no change follows and
    // the flag would survive into whatever came next. Measured in Edge on this tree: Ctrl+ArrowRight
    // on a checked radio left the selection where it was and fired no change.
    radio.addEventListener('keydown', (e) => {
      if (e.key.startsWith('Arrow') && !e.ctrlKey && !e.altKey && !e.metaKey) arrowing = true;
    });
    radio.addEventListener('change', (e) => {
      if (arrowing) {
        // Captured before setFilter moves it, because this is the address the traversal has to be
        // able to return to and what a passive sync must keep claiming while it runs.
        if (!filterRunOpen) {
          filterRunBase = filter;
          filterRunOpen = true;
        }
        setFilter(e.target.value);
      } else {
        // Commits before adopting the new filter, so the traversal's entry records the filter the
        // traversal actually reached rather than the one replacing it. A pointer press has already
        // committed through pointerdown and finds nothing to do here; a click with no pointerdown,
        // which is what assistive technology activating a radio produces, reaches it here instead.
        // Both routes therefore leave the same two entries.
        endFilterRun({ commit: true });
        setFilter(e.target.value);
        // Pushes rather than replaces. Choosing a filter is a deliberate act, like clicking the
        // rail, and pushing is the whole of what "Back works across filter changes" means. The
        // passive paths still replace, so marking twenty issues read does not put twenty entries in
        // the way.
        syncHash({ push: true });
      }
      arrowing = false;
    });
  }

  // The traversal ends when the reader leaves the group or reaches for the pointer, and that is when
  // its one entry is written. focusout bubbles, so moving between two radios inside the group would
  // otherwise end it at the first stop; relatedTarget outside the group is what distinguishes
  // leaving from traversing, and a missing one is a window or address bar blur, which is leaving.
  //
  // pointerdown is not redundant with the change handler above. Pressing the radio that is already
  // checked fires no change and does not move focus out of the group, so neither of the other two
  // would ever run and the traversal would stay open behind a press the reader has plainly finished
  // making.
  const group = $('#reading-filters');
  group.addEventListener('pointerdown', () => {
    arrowing = false;
    endFilterRun({ commit: true });
  });
  group.addEventListener('focusout', (e) => {
    if (e.relatedTarget && group.contains(e.relatedTarget)) return;
    arrowing = false;
    endFilterRun({ commit: true });
  });

  $('#btn-rename-list').addEventListener('click', async () => {
    const id = activeListId();
    const list = store.state.lists[id];
    if (!list) return;
    const name = await askText({ title: 'Rename list', label: 'List name', value: list.name });
    if (!name) return;
    store.update((s) => renameList(s, id, name));
    announceIfSaved(`Renamed to ${name}.`);
  });

  $('#btn-list-note').addEventListener('click', async () => {
    const id = activeListId();
    const list = store.state.lists[id];
    if (!list) return;
    const note = await askNote({
      title: `Note on "${list.name}"`,
      body: 'Only you see this. It is saved on this device and travels in your backup file.',
      label: 'Your note about this reading order',
      value: list.note || '',
    });
    // null is backing out, "" is deleting the note. askText folds those together; askNote does
    // not, which is the whole reason it exists.
    if (note === null) return;
    store.update((s) => setListNote(s, id, note));
    announceIfSaved(note ? 'Note saved.' : 'Note removed.');
  });

  $('#btn-delete-list').addEventListener('click', async () => {
    const id = activeListId();
    const list = store.state.lists[id];
    if (!list) return;
    const yes = await askConfirm({
      title: `Delete "${list.name}"?`,
      body: 'Your read progress is kept, and only the list is removed. This can be undone.',
      confirmLabel: 'Delete list',
    });
    if (!yes) return;
    // Captured before the delete, because the state afterwards is the one thing that no longer
    // knows either the list or where in the rail it sat.
    const deleted = { list, index: store.state.listOrder.indexOf(id), wasActive: store.state.active === id };
    store.update((s) => deleteList(s, id));
    if (!store.lastUpdateOk) return;
    offerUndoDelete(deleted);
  });

  $('#btn-duplicate-list').addEventListener('click', () => {
    const id = activeListId();
    const list = store.state.lists[id];
    if (!list) return;
    // The updater runs exactly once, before the write, so capturing the id here is safe. It is
    // still only trustworthy after lastUpdateOk confirms the write survived.
    let copyId = null;
    const next = store.update((s) => {
      const res = duplicateList(s, id);
      copyId = res.listId;
      return res.state;
    });
    if (!store.lastUpdateOk || !copyId) {
      return announce('That copy could not be saved, so nothing changed.');
    }
    store.update((s) => setActive(s, copyId));
    // Saying where you landed matters more than usual here: the rail now holds two lists with
    // near-identical names, and the shared read progress surprises people who expect a copy to
    // start empty.
    announceIfSaved(`Duplicated as ${next.lists[copyId].name}. You are now editing the copy, and read progress stays shared with the original.`);
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

// A deleted list is held for the rest of the session rather than for a few seconds. The undo
// notice sits above the views because deleting the list you were reading moves you elsewhere,
// and a timer would take the only way back at the moment the reader was still deciding.
//
// Only the most recent delete is held. Keeping every one would offer to restore a list the
// reader has since deliberately replaced, and nothing here can tell those two cases apart.
const UNDO_DELETE = 'undo-delete';
let lastDeleted = null;

function offerUndoDelete(deleted) {
  lastDeleted = deleted;
  notify('#app-report', `Deleted ${deleted.list.name}. Reading progress was kept.`, 'ok', UNDO_DELETE, {
    label: 'Undo delete',
    onClick: undoDelete,
  });
}

// Wholesale replacements of the state, erasing and restoring, drop the offer rather than
// leaving it pointing into data that is no longer there.
function forgetDeleted() {
  lastDeleted = null;
  clearNotice(UNDO_DELETE);
}

// An order that is back in the sidebar does not need an offer to bring back the deleted copy of
// it. Taking that offer would leave two lists answering to one catalog entry, which is the state
// `duplicateList` clears `catalogId` to avoid: "in library" and "Continue reading" would both
// resolve to whichever came first in the rail, and the rail would show two entries with the same
// name and the same progress.
//
// It must not be withdrawn in silence. Deleting the list you were reading hands you to the home
// view, where the card for that order has already reverted to "+ Add to library", so the wrong
// way back and the right one sit on the same screen. A reader who had renamed or reordered their
// copy would press it, be told the order is in their sidebar, and lose the route back to that copy
// in the same tick with nothing said about it. The sentence is returned as well as shown, so the
// caller can fold it into the announcement it is about to make: two announcements in one tick
// leave only the last.
//
// Both names are needed. What came back is the order under its own name; what cannot be put back
// is the reader's copy, which they may have renamed. Naming the copy as the thing that returned
// would report the loss and deny it in the same breath, and send the reader looking in the rail
// for a list that is not there.
function forgetDeletedFor(catalogId, orderName) {
  if (!catalogId || lastDeleted?.list?.catalogId !== catalogId) return null;
  const { name } = lastDeleted.list;
  forgetDeleted();
  const mine = name === orderName ? 'The copy you deleted' : `Your copy, ${name},`;
  const msg = `${orderName} is back from the catalog. ${mine} with any changes you had made to it, cannot be put back now.`;
  notify('#app-report', msg, 'ok', UNDO_DELETE);
  return msg;
}

function undoDelete() {
  if (!lastDeleted) return;
  const { list, index, wasActive } = lastDeleted;
  // `restoreList` refuses rather than overwrite a live list, and a refusal returns the state
  // unchanged, which a successful write is indistinguishable from once it is done. So the
  // blocker is looked for first: reading back afterwards would report the list that blocked
  // the restore as the list the restore put there.
  const blocker = store.state.lists[list.id] ?? listForCatalogId(store.state, list.catalogId);
  if (blocker) {
    forgetDeleted();
    notify('#app-report', `${list.name} was not put back: ${blocker.name} is in your sidebar already.`, 'ok', UNDO_DELETE);
    return;
  }
  store.update((s) => restoreList(s, list, { index, active: wasActive }));
  if (!store.lastUpdateOk) {
    // The buffer is deliberately kept, and the notice keeps a button, because a write that failed
    // for want of space can succeed after the reader frees some. Dropping the offer here would
    // make a recoverable failure permanent.
    notify('#app-report', `${list.name} could not be put back: that change could not be saved.`, 'error', UNDO_DELETE, {
      label: 'Try again',
      onClick: undoDelete,
    });
    return;
  }
  forgetDeleted();
  if (wasActive) showView('read');
  announce(`${list.name} is back in your sidebar, in the position it had.`);
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
  // The hero's own buttons are static markup that the re-render leaves in place, so pressing D
  // from the hero keeps focus and stays live on the next press. The shelf and the full order are
  // rebuilt with replaceChildren, which used to destroy a control focused there and drop focus to
  // <body>; preservingFocus now restores it by identity, on the click route as well, which is what
  // BL-054 closed. Finishing the order hides the whole
  // hero, which drops the focused button out of the document and sends focus back to <body>,
  // silently and at the top of the page. The heading that replaced it is the honest place to
  // land: it is what the reader needs to hear, and it is where the remaining actions are. The
  // render has already run, synchronously, inside store.update.
  if (!next) $('#all-read-h').focus({ preventScroll: true });
}

function renderReading() {
  const id = activeListId();
  const list = store.state.lists[id];

  $('#reading-body').hidden = !list;
  $('#ring-wrap').hidden = !list;

  if (!list) {
    // Reaching the reading view with no list means the last one was just deleted. The
    // landing page is the honest place to be, so hand over rather than sit on an empty frame.
    $('#order-name').textContent = 'Marvel Reading Tracker';
    $('#order-sub').textContent = 'Curated reading orders, tracked locally, linked into the Unlimited reader.';
    if (view === 'read') showView('home');
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
  const listNote = $('#list-note');
  listNote.textContent = list.note || '';
  listNote.hidden = !list.note;
  $('#btn-list-note').textContent = list.note ? 'Edit note' : 'Note';
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
  // The hero is hidden rather than emptied, so its heading has to be given text back. A
  // heading with no content fails whether or not it is on screen, and the tools that say so
  // read the document, not what is painted.
  if (finished) {
    $('#hero-title').textContent = HERO_NO_ISSUE;
    return;
  }

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

  const upcoming = listItems(store.state, id).filter((it) => !it.read).slice(1, SHELF_SIZE + 1);
  $('#shelf-sec').hidden = upcoming.length === 0;
  $('#shelf-note').textContent = `next ${upcoming.length}, in order`;

  preservingFocus(shelf, () => {
    shelf.replaceChildren();

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
        dataset: { key: it.issueId, act: 'open' },
        onclick: (e) => openInReader(it, e),
      }, [
        el('div', { class: 'ph' }, [img, fb]),
        el('div', { class: 'lab' }, [
          el('b', { text: shortTitle(it.title) }),
          ymd(it.onSale).slice(0, 4),
        ]),
      ])));
    }
  }, {
    primary: 'open',
    // The shelf empties when at most one unread issue is left, and the section is hidden with it,
    // so there is nothing inside to land on. "Done, next" continues the same activity and is the
    // control the shelf was helping the reader reach. When the order is finished the hero is hidden
    // too, and markCurrentRead claims the heading that replaced it when store.update later returns.
    fallback: () => ($('#hero').hidden ? null : $('#btn-hero-done')),
  });
}

// Rows are kept and reused unless their own data changed, because rebuilding all of them to
// record that one was ticked is most of the cost of ticking it. Measured in Edge on the 219 issue
// Hickman list with the order open: a read toggle replaced 219 of 219 rows and the handler ran for
// 14.8ms. Reusing them takes it to 2 rows and 2.8ms, the two being the ticked row and the one that
// becomes "up next".
let rowCache = new Map();
let rowCacheListId = null;
// Set when a render was skipped because the full order was closed, so that opening it renders
// what the reader missed. Without it, opening the details after any change shows the order as it
// stood when it was last open.
let rowsPending = false;

// Nodes already in the right place are left where they are. Whatever the new order does not ask
// for is removed first, because a stale node left in front of the reused ones shifts every later
// index by one and turns a single rebuilt row into a move of all the rest. insertBefore then moves
// a node already in the tree rather than copying it, so a reordered item costs one move.
export function commitRows(container, desired) {
  const wanted = new Set(desired);
  for (const node of [...container.childNodes]) if (!wanted.has(node)) node.remove();
  let i = 0;
  for (const node of desired) {
    if (container.childNodes[i] !== node) container.insertBefore(node, container.childNodes[i] ?? null);
    i += 1;
  }
}

// The key is the whole item rather than a list of the fields a row happens to read. An
// enumerated list is one somebody has to keep complete, and a field left out of it is a row
// that silently stops updating, which is the defect this cache would otherwise buy.
//
// Two inputs are not in the item and so have to be named: whether this is the up next row,
// and today's date, which is what decides whether a badge reads "soon" or "MU". Without the
// date a tab left open across midnight reuses the row it built yesterday for good.
export function rowCacheKey(item, currentId, today) {
  return `${JSON.stringify(item)}|${item.issueId === currentId}|${today}`;
}

function renderRows() {
  const id = activeListId();
  const rows = $('#rows');
  if (id !== rowCacheListId) { rowCache = new Map(); rowCacheListId = id; }

  preservingFocus(rows, () => {
    const desired = [];
    const list = store.state.lists[id];
    if (!list) { commitRows(rows, desired); return; }

    const all = listItems(store.state, id);
    const unread = all.length - all.filter((it) => it.read).length;
    // The count lives in the <summary>, which is on screen whether or not the order below it is,
    // so it is written before the early return rather than alongside the rows it counts.
    $('#full-count').textContent = `${unread} unread`;

    // The full order is inside a <details> that starts closed, so on a first visit every one of
    // these rows is built for a container the reader has not opened. Measured in Edge on the 219
    // issue Hickman list with the order closed: marking one issue read spent 12.7ms building 219
    // rows that were never shown. Reopening the details renders them, so nothing is lost by
    // waiting until then.
    if (!$('#full').open) { rowsPending = true; return; }
    rowsPending = false;

    const currentId = upNext(store.state, id)?.issueId ?? null;
    // Read once per render and passed in rather than defaulted per call, so that every row in one
    // pass is judged against the same day and the day is a value the cache key can name.
    const today = localDayString();
    const items = all.filter((it) => matchesReadingFilter(filter, it));

    // Collected editions, as runs of consecutive items. Progress is counted over every item in
    // the run and not over the filtered rows below it, because a book is a fixed thing you own:
    // "2 of 6 read" has to mean the same under every filter, or the heading becomes a second,
    // quieter reading filter that the reader never set.
    const runs = [];
    const runOf = new Map();
    for (const it of all) {
      const last = runs[runs.length - 1];
      if (last && last.name === it.collectedIn) {
        last.total += 1;
        if (it.read) last.read += 1;
      } else {
        runs.push({ name: it.collectedIn, total: 1, read: it.read ? 1 : 0 });
      }
      runOf.set(it.issueId, runs.length - 1);
    }
    const hasEditions = runs.some((r) => r.name);

    if (!items.length) {
      desired.push(el('li', { class: 'rail-hint', text: 'Nothing matches this filter.' }));
      commitRows(rows, desired);
      return;
    }

    let shownRun = -1;
    for (const item of items) {
      const runIndex = runOf.get(item.issueId);
      if (hasEditions && runIndex !== shownRun) {
        shownRun = runIndex;
        const run = runs[runIndex];
        // An item with no edition gets no heading rather than a heading saying so. In a trade
        // order that only happens to something the reader added by hand, and inventing a book
        // to put it in would be a claim about what Marvel collected.
        if (run.name) {
          const headKey = `${run.name}|${run.read}|${run.total}`;
          const cachedHead = rowCache.get(`heading:${runIndex}`);
          if (cachedHead && cachedHead.key === headKey) desired.push(cachedHead.node);
          else {
            const head = el('li', { class: `row-group${run.read === run.total ? ' is-done' : ''}` }, [
              el('h3', { class: 'rg-name', text: run.name }),
              el('span', { class: 'rg-count', text: `${run.read} of ${run.total} read` }),
              el('progress', { value: String(run.read), max: String(run.total), 'aria-hidden': 'true' }),
            ]);
            rowCache.set(`heading:${runIndex}`, { key: headKey, node: head });
            desired.push(head);
          }
        }
      }

      const rowKey = rowCacheKey(item, currentId, today);
      const cached = rowCache.get(item.issueId);
      if (cached && cached.key === rowKey) { desired.push(cached.node); continue; }

      const override = item.override;
      const av = availability(item, { override, today });
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

      const node = el('li', {
        class: `row${item.read ? ' is-read' : ''}${item.issueId === currentId ? ' now' : ''}`,
      }, [
        el('button', {
          type: 'button',
          class: 'cb',
          'aria-pressed': String(item.read),
          'aria-label': `Mark ${item.title} as ${item.read ? 'unread' : 'read'}`,
          dataset: { key: item.issueId, act: 'read' },
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
            // The full availability wording is text inside the badge, not a title attribute.
            // A title is not reachable by touch, is skipped by several screen readers, and
            // here it was the only place the hedge behind a two-word badge was written down,
            // so "Not in Unlimited" read as a fact rather than as what the snapshot shows.
            el('span', { class: `badge ${badgeClass}` }, [
              `${SHORT[av.state]} ${av.state === STATE.EXPECTED ? 'Unlimited' : SHORT_LABEL[av.state] ?? 'unknown'}`,
              el('span', { class: 'visually-hidden', text: `. ${describe(item, { override, today })}.` }),
            ]),
            !item.hydrated && item.source !== 'manual'
              ? el('span', { class: 'badge badge-pending' }, [
                'details pending',
                el('span', { class: 'visually-hidden', text: '. Details have not been fetched yet.' }),
              ])
              : null,
            item.source === 'manual' ? el('span', { class: 'badge badge-unknown' }, 'by hand') : null,
            ymd(item.onSale) ? el('span', { text: ymd(item.onSale) }) : null,
          ]),
          // The note control sits in the text column, not in `.ract`, which already carries six
          // buttons and wraps at 320 pixels. One control both shows the note and opens the
          // editor, so a row with a note is not a row with an extra thing beside it.
          //
          // The note is repeated into the label rather than left to name the button by its
          // contents, because an aria-label replaces the contents in the accessible name. With
          // the label naming only the action, a screen reader announced "Edit your note on X"
          // and never the note, so the one reader who cannot see the row would have had to open
          // the editor on every issue to find out what they had written.
          //
          // The note goes last because it is the one part the app does not punctuate. A note
          // typed as "Wanda breaks reality." read as "here.. Select to edit it." with the action
          // trailing, so the action leads instead and nothing follows the user's own words.
          el('button', {
            type: 'button',
            class: `rnote${item.note ? ' has-note' : ''}`,
            'aria-label': item.note
              ? `Edit your note on ${item.title}. It says: ${item.note}`
              : `Add a note on ${item.title}`,
            dataset: { key: item.issueId, act: 'note' },
            onclick: () => editIssueNote(item),
          }, item.note ? item.note : 'Add a note'),
        ]),
        el('div', { class: 'ract' }, [
          el('button', { type: 'button', class: 'mini', 'aria-label': `Read ${item.title} in Marvel Unlimited`, dataset: { key: item.issueId, act: 'open' }, onclick: (e) => openInReader(item, e) }, 'Read'),
          detailUrl(item)
            ? el('a', { class: 'mini', href: detailUrl(item), target: '_blank', rel: 'noopener noreferrer', 'aria-label': `marvel.com page for ${item.title}`, dataset: { key: item.issueId, act: 'info' } }, 'Info')
            : null,
          el('button', { type: 'button', class: 'mini', 'aria-label': `Move ${item.title} up`, dataset: { key: item.issueId, act: 'up' }, onclick: () => store.update((s) => moveItem(s, id, item.issueId, -1)) }, '↑'),
          el('button', { type: 'button', class: 'mini', 'aria-label': `Move ${item.title} down`, dataset: { key: item.issueId, act: 'down' }, onclick: () => store.update((s) => moveItem(s, id, item.issueId, 1)) }, '↓'),
          el('button', { type: 'button', class: 'mini', 'aria-label': `Change availability for ${item.title}`, dataset: { key: item.issueId, act: 'override' }, onclick: () => cycleOverride(item) }, '⚑'),
          el('button', { type: 'button', class: 'mini mini-danger', 'aria-label': `Remove ${item.title} from this list`, dataset: { key: item.issueId, act: 'remove' }, onclick: () => { store.update((s) => removeFromList(s, id, item.issueId)); announceIfSaved(`Removed ${item.title}.`); } }, '✕'),
        ]),
      ]);
      rowCache.set(item.issueId, { key: rowKey, node });
      desired.push(node);
    }

    if (items.length !== all.length) {
      desired.push(el('li', { class: 'rail-hint', text: `Showing ${items.length} of ${all.length}.` }));
    }
    commitRows(rows, desired);
  }, {
    primary: 'read',
    // Nothing is left to land on only when the filter now excludes everything, which is usually
    // the reader's own act of marking the last matching issue read. The checked filter is both the
    // reason the list is empty and the control that undoes it, and it sits inside the same
    // disclosure, so focus stays where the reader was working.
    fallback: () => [...document.querySelectorAll('input[name="filter"]')].find((r) => r.checked),
  });
}

const SHORT_LABEL = {
  [STATE.SCHEDULED]: 'scheduled',
  [STATE.UNKNOWN]: 'unknown',
  [STATE.OVERRIDE_AVAILABLE]: 'yours: available',
  [STATE.OVERRIDE_UNAVAILABLE]: 'yours: not in MU',
};

function cycleOverride(item) {
  const next = item.override === 'available' ? 'unavailable' : item.override === 'unavailable' ? null : 'available';
  store.update((s) => setOverride(s, item.issueId, next));
  announceIfSaved(`${item.title}: ${next ? `marked ${next}` : 'override cleared'}.`);
}

// The editor is a modal dialog rather than a field in the row. Editing a note changes the item,
// so `renderRows` rebuilds that row, and `preservingFocus` restores focus by key and act alone,
// not the caret or an uncommitted value, so an inline field would lose whatever had been typed
// into it the moment anything else changed.
async function editIssueNote(item) {
  const note = await askNote({
    title: `Note on "${item.title}"`,
    body: 'Only you see this. It is saved on this device and travels in your backup file.',
    label: 'Your note about this issue',
    value: item.note || '',
  });
  if (note === null) return;
  store.update((s) => setIssueNote(s, item.issueId, note));
  announceIfSaved(note ? `Note saved on ${item.title}.` : `Note removed from ${item.title}.`);
}

// ------------------------------------------------------------------ shortcuts

function wireShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (view !== 'read' || e.metaKey || e.ctrlKey || e.altKey) return;
    // A modal dialog makes the rest of the document inert, but a keydown raised inside it still
    // bubbles to here, and the view behind the backdrop is still 'read'. Refusing every
    // interactive element used to block this by accident; asking the narrower question exposes
    // it. Measured in Edge: D at the "Delete list?" prompt, where showModal() has put focus on
    // Cancel, marked an issue read behind the backdrop and swallowed the key.
    if ($('dialog[open]')) return;
    const t = document.activeElement;
    // Only text entry silences a shortcut outright, and Enter is left to whatever the browser
    // would activate. Refusing every interactive element, as this once did, killed the D the
    // hero advertises for the rest of the session the moment the reader clicked "Done, next".
    if (!shortcutAllowed(t, e.key)) return;
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

  // Series and creator search reads a vendored index rather than the API, because the API
  // ignores `q` on those routes (see api.js). The two cards are otherwise identical, so they
  // are wired once: the only differences are which index they read and what "Add all issues"
  // does with the result.
  wireNameSearch({
    section: '#sec-series', form: '#form-series', input: '#series-q', results: '#series-results',
    kind: 'series', many: 'series', btnClass: 'btn',
    search: (q, opts) => api.searchSeries(q, opts), onAdd: addSeries,
  });

  wireNameSearch({
    section: '#sec-creator', form: '#form-creator', input: '#creator-q', results: '#creator-results',
    kind: 'creators', many: 'creators', btnClass: 'btn btn-g',
    search: (q, opts) => api.searchCreators(q, opts), onAdd: addCreator,
  });

  $('#form-import').addEventListener('submit', (e) => { e.preventDefault(); doImport(); });
  $('#form-manual').addEventListener('submit', (e) => { e.preventDefault(); doManual(); });
}

const NAME_SEARCH_LIMIT = 40;

function wireNameSearch({ section, form, input, results, kind, many, btnClass, search, onAdd }) {
  // The index is a few hundred kilobytes, so it is never part of the initial page load. Opening
  // the card is the earliest honest signal that a reader intends to search, and starting the
  // download there means the first search usually finds it already in hand. A reader who never
  // opens the card never pays for it. Warming is idempotent and a failed warm is ignored: this
  // is only a head start, and the search itself reports the failure properly.
  const card = $(section);
  card.addEventListener('toggle', () => {
    if (card.open) api.warmNameIndex(kind);
  });

  $(form).addEventListener('submit', async (e) => {
    e.preventDefault();
    const q = $(input).value.trim();
    if (!q) return;
    notify(results, 'Searching…', 'ok');
    try {
      const { items, matched, total, generatedAt } = await search(q, { limit: NAME_SEARCH_LIMIT });
      const box = $(results);
      box.replaceChildren();

      if (!items.length) {
        return notify(results, `No ${many} match “${q}”. Searched all ${count(total)} in the index.`, 'warn');
      }

      // A capped list that does not say it is capped tells the reader the other matches do not
      // exist. The snapshot date is here for the same reason: this index is pinned at build
      // time, so a series added upstream last week is genuinely missing until it is rebuilt.
      const summary = matched > items.length
        ? `Showing the ${items.length} closest matches of ${count(matched)}. Narrow your search to see the rest.`
        : `${count(matched)} ${matched === 1 ? 'match' : 'matches'}.`;
      box.append(el('p', {
        class: 'rail-hint',
        text: `${summary} Filtered here from an index of ${count(total)} ${many}${snapshot(generatedAt)}.`,
      }));
      announce(summary);

      for (const item of items) {
        box.append(el('div', { class: 'result' }, [
          el('div', { class: 'result-main' }, [
            el('div', { class: 'result-title', text: item.name }),
            el('div', { class: 'result-meta', text: `${item.issueCount ?? 'an unknown number of'} issues` }),
          ]),
          el('button', {
            type: 'button', class: btnClass,
            'aria-label': `Add all issues of ${item.name}`,
            onclick: () => onAdd(item),
          }, 'Add all issues'),
        ]));
      }
    } catch (err) {
      notify(results, friendly(err), 'error');
    }
  });
}

const count = (n) => Number(n ?? 0).toLocaleString();

// Reuses the curated catalog's UTC date formatting, for the same reason: a snapshot taken at
// 06:14Z reads as the previous day everywhere west of UTC-6:14, which is all of the Americas.
function snapshot(generatedAt) {
  const when = updatedLabel({ updatedAt: generatedAt });
  return when ? `, taken ${when}` : '';
}

function renderResults(sel, items, metaFn) {
  const box = $(sel);
  box.replaceChildren();
  if (!items.length) return notify(sel, 'Nothing matched that search.', 'warn');

  // Name the destination at the point of decision. The same hint sits in the view header, but
  // the results are far enough down the page that it is easy to miss entirely.
  const target = store.state.lists[activeListId()];
  const destination = target
    ? `Adding to “${target.name}”.`
    : 'Adding will start a new list called “My reading order”.';
  box.append(el('p', { class: 'rail-hint', text: destination }));

  // This pane stopped being a live region, so the outcome has to be said here. The empty case
  // below goes through notify() and still speaks, so without this line a search that found
  // nothing announced itself and a search that worked did not, which reads as a broken search.
  announce(`${count(items.length)} ${items.length === 1 ? 'result' : 'results'}. ${destination}`);

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
  // filled in later rather than guessed at now. The sub-heading each line sat under is the
  // exception: it is structure the reader wrote, not metadata to be looked up, so it comes
  // straight across and a pasted trade order keeps its books.
  const staged = entries.map((e) => ({
    issueId: e.issueId,
    title: e.title,
    url: e.url,
    source: 'import',
    hydrated: false,
    collectedIn: e.section ?? null,
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
        // The report pane around this row is no longer live, and the sibling outcomes below
        // announce themselves, so this one has to as well or the button just goes quiet.
        announce(`No candidates found for ${entry.title}.`);
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
      // Re-enabling the button is the only other cue that this failed, and a disabled state
      // returning to enabled is not announced. Without this the lookup fails in silence.
      const why = friendly(err);
      row.append(el('p', { class: 'notice notice-error', text: why }));
      announce(why);
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
let catalogFacet = 'all';
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
  box.replaceChildren(el('p', { class: 'rail-hint', text: 'Loading the catalog…' }));
  // Cleared by condition rather than by pane, because the same load failure may have been placed
  // in the shared pane above the views. Emptying only this pane left the reader looking at a
  // loaded catalog under a banner saying it could not be loaded.
  clearNotice(CATALOG_LOAD);
  // Tied to the query rather than to a successful load, so the button cannot be left behind
  // offering to clear a search box that an empty or failed catalog still shows.
  $('#catalog-clear').hidden = !catalogQuery;

  let catalog;
  try {
    catalog = await loadCatalog();
  } catch (err) {
    box.replaceChildren();
    $('#catalog-filters').hidden = true;
    $('#catalog-filters').replaceChildren();
    notify('#catalog-report', `The catalog could not be loaded: ${err.message}. Your lists are unchanged.`, 'error', CATALOG_LOAD);
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

  // The facets describe the whole catalog, not the current search, so searching never
  // makes a filter vanish from under the reader's cursor.
  renderCatalogFilters(catalog.lists);

  // Filtering narrows which lists are shown; every list that is shown keeps the full detail a
  // reader needs to choose, so searching or switching filters never hides a description,
  // reading depth, or issue count.
  const inFacet = filterByFacet(catalog.lists, catalogFacet);
  const shown = searchCatalog(inFacet, catalogQuery);

  if (!shown.length) {
    const where = catalogFacet === 'all' ? '' : ` in ${facetLabel(catalog.lists, catalogFacet)}`;
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
    const where = catalogFacet === 'all' ? '' : ` in ${facetLabel(catalog.lists, catalogFacet)}`;
    const match = catalogQuery ? ` matching “${catalogQuery}”` : '';
    announceCatalog(`Catalog shows ${shown.length} reading ${shown.length === 1 ? 'list' : 'lists'}${match}${where}.`);
  }
}

// Inside a group the story's name is already the heading, so the row leads with what actually
// differs between the versions, the reading path, rather than repeating the title.
function catalogRow(list, { variant = false } = {}) {
  // The count is derived from the file the reader will actually import, so it is exact and
  // does not need hedging.
  const meta = [
    typeLabel(list.type),
    `${list.count} issue${list.count === 1 ? '' : 's'}`,
    collectionsLabel(list),
  ].filter(Boolean).join(' · ');
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
      class: 'btn',
      type: 'button',
      // The accessible name always carries the full list name, so a button read out of
      // context never says only "Import Essential reading".
      'aria-label': `Import ${list.name}`,
      onclick: (e) => importCurated(list, e.currentTarget),
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

function renderCatalogFilters(lists) {
  const box = $('#catalog-filters');
  const options = catalogFacets(lists);

  // One option is no choice at all, so the filter would only add noise.
  box.hidden = options.length < 2;
  if (box.hidden) {
    catalogFacet = 'all';
    return;
  }

  // A facet can disappear when the bundled data changes; falling back to "all" keeps the
  // reader looking at a populated catalog instead of a permanently empty one.
  if (catalogFacet !== 'all' && !options.some((c) => c.key === catalogFacet)) {
    catalogFacet = 'all';
  }

  // Selecting a filter re-renders the view. Rebuilding the radios then would destroy the
  // one the reader just activated and drop keyboard focus out of the filter, so when the
  // options are unchanged we only move the selection.
  const existing = [...box.querySelectorAll('input[name="catalog-category"]')];
  if (existing.length === options.length && existing.every((r, i) => r.value === options[i].key)) {
    for (const radio of existing) radio.checked = radio.value === catalogFacet;
    return;
  }

  box.replaceChildren(
    el('legend', { class: 'visually-hidden', text: 'Filter the catalog by category' }),
    ...options.map(({ key, label, count }) => el('label', { class: 'fp' }, [
      el('input', {
        type: 'radio',
        name: 'catalog-category',
        value: key,
        checked: key === catalogFacet,
        onchange: () => { catalogFacet = key; renderCatalog(); },
      }),
      el('span', { text: `${label} (${count})` }),
    ])),
  );
}

// A second click while the first import is still fetching runs the whole import again and mints a
// second list with the same name and the same issues, because createList() always allocates a new
// id. Nothing is lost, but the reader is left to notice and delete the duplicate. Latching the
// run also covers the twin entry shown under a grouped story, where two different buttons import
// two different files.
let importing = null;

// `navigate` is false on the landing page, where adding an order must leave the reader where
// they were so they can add a second one. The sidebar still updates, because the store change
// re-renders it; that is the feedback, along with the announcement.
//
// `report` is where a failure is written. This used to be alert(), which was the only path in
// the app that stopped the page to report a failure, and the one place a reader could not read
// the reason and the catalog at the same time.
async function importCurated(list, btn, { navigate = true, report = '#catalog-report' } = {}) {
  if (importing) return null;
  const file = list.file;
  const catalogId = list.id;
  // Keyed by the order rather than by the pane, for the reason CATALOG_LOAD is. The same order can
  // be added from the landing page and from the catalog row, so a failure written into one pane is
  // the same failure the other entry point would report. Keying by pane left the reader looking at
  // the list open in front of them under a banner saying it could not be loaded.
  const importKey = `import:${catalogId}`;
  importing = file;
  const label = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Adding…';
  }
  try {
    // Served from our own origin, so this works with no internet connection.
    const res = await fetch(`./data/${file}`, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const order = await res.json();

    const created = store.update((s) => createList(s, { name: order.name, description: order.description, catalogId }));
    if (!store.lastUpdateOk) {
      notify(report, `${order.name} could not be saved, so nothing was imported.`, 'error', importKey);
      return null;
    }
    const listId = created.listOrder[created.listOrder.length - 1];
    let added = 0;
    store.update((s) => {
      const r = addIssuesToList(s, listId, order.items.map((i) => ({ ...i, source: 'curated', hydrated: true })), {});
      added = r.added;
      return r.state;
    });
    if (!store.lastUpdateOk) {
      // The list record is written before its issues, so a failure here leaves a shell claiming
      // the catalog entry with nothing in it. That is not merely untidy: it blocks the undo offer
      // for a deleted copy of the same order, and `undoDelete` would then discard the reader's
      // real list in favour of an artefact of a write that failed. Storage being full is the
      // expected reason to land here, and this second write is the larger of the two, so the
      // half-import is rolled back rather than left standing.
      store.update((s) => deleteList(s, listId));
      notify(report, store.lastUpdateOk
        ? `${order.name} could not be saved, so nothing was imported.`
        : `${order.name} was created but its issues could not be saved.`, 'error', importKey);
      return null;
    }
    if (navigate) {
      store.update((s) => setActive(s, listId));
      showView('read', { push: true });
    } else if (!store.state.active) {
      // Nothing was being read, so the first order added becomes the one "Continue reading"
      // resumes. It does not steal the active list from a reader who already had one.
      store.update((s) => setActive(s, listId));
    }

    // Some curated orders include issues Marvel has not published data for yet. They are
    // imported as placeholders so the reading order stays complete and tickable; saying so
    // is the difference between a known gap and a list that looks wrong for no reason.
    const placeholders = Number(order.placeholders) || 0;
    const parts = [`${navigate ? 'Imported' : 'Added'} ${order.name}: ${added} issues.`];
    if (placeholders) {
      parts.push(`${placeholders} of them have no Marvel Unlimited link yet and cannot be opened.`);
    }
    parts.push('Any issues you had already read stay read.');
    if (!navigate) parts.push('It is now in your sidebar.');
    const withdrawn = forgetDeletedFor(catalogId, order.name);
    if (withdrawn) parts.push(withdrawn);
    // A failure from a previous attempt would otherwise sit under a successful import,
    // contradicting it. Cleared by the order's key, not by this pane, so an attempt that failed
    // from the other entry point is cleared too.
    clearNotice(importKey);
    announce(parts.join(' '));
    return listId;
  } catch (err) {
    notify(report, `Could not load ${list.name}: ${err.message}. Your lists are unchanged.`, 'error', importKey);
    return null;
  } finally {
    importing = null;
    // The button survives a successful import only when the reader stays on the catalog; after
    // showView('read') it is off screen but still in the DOM, so restoring it keeps the catalog
    // usable when they come back rather than leaving a dead "Importing…" control behind.
    if (btn) {
      btn.disabled = false;
      btn.textContent = label;
    }
  }
}

// ------------------------------------------------------------------ progress

// Not persisted, unlike the reading filter in BL-037. That one is a lens on a long order a reader
// works through over days; this one is answered by whichever list they are reading now, so the
// useful default is the active list every time the view is opened.
let progressScope = 'list';

function wireProgressScope() {
  for (const radio of document.querySelectorAll('input[name="progress-scope"]')) {
    radio.addEventListener('change', () => {
      if (!radio.checked) return;
      progressScope = radio.value;
      renderProgress();
    });
  }
}

function renderProgress() {
  const box = $('#series-progress');
  const list = store.state.lists[activeListId()];
  // `active` is null only when no list exists, so "This list" has no subject to name: the subtitle
  // below would dereference it, and the choice would be between two options that both render
  // "Nothing tracked yet." The whole fieldset is hidden rather than one radio disabled, matching
  // #home-chips and #catalog-filters, which hide for the same reason. A disabled chip was the first
  // attempt and was wrong: .fp paints the adjacent span, and with no :disabled rule it rendered
  // identically to a live one, hover lift included.
  const scoped = progressScope === 'list' && Boolean(list);
  $('#progress-scope').hidden = !list;
  for (const radio of document.querySelectorAll('input[name="progress-scope"]')) {
    radio.checked = radio.value === (scoped ? 'list' : 'all');
  }
  $('#progress-sub').textContent = scoped
    ? `Counted over the issues in “${list.name}”. Choose All lists for everything you track.`
    : 'Counted over unique issues across every list, so an issue in two lists counts once.';

  const rows = scoped ? seriesProgress(store.state, activeListId()) : seriesProgress(store.state);
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

// ------------------------------------------------------------------ library sub-views

// Both sub-views are rendered by one function reading LIBRARY_VIEWS, rather than one function
// each. Two renderers would be two places for a heading, a subtitle and an empty state to be
// written, and the second view would be the one that quietly stopped matching the first.
function renderLibrary() {
  for (const v of LIBRARY_VIEWS) {
    const section = $(`#view-${v.value}`);
    section.querySelector('h1').textContent = v.label;
    section.querySelector('.sub').textContent = v.sub;

    const box = section.querySelector('.results');
    const rows = v.select(store.state);
    box.replaceChildren();
    if (!rows.length) {
      box.append(el('p', { class: 'rail-hint', text: v.empty }));
      continue;
    }
    // The count is on screen because it is the number a reader has no other way to get: the
    // progress view counts what is in a list, and the whole point of these two is what is not.
    box.append(el('p', { class: 'rail-hint', text: `${rows.length} issue${rows.length === 1 ? '' : 's'}.` }));
    for (const row of rows) box.append(libraryRow(row, v));
  }
}

// "In no list" is said out loud rather than left blank. An issue can be read, or added by hand,
// and belong to nothing: deleting a list keeps both the issue record and its read state, by the
// deliberate choice `deleteList` records, and until these views there was no screen anywhere in
// the app on which such an issue appeared. A blank where the list names go would read as a
// rendering fault rather than as the fact it is.
function libraryRow(row, v) {
  const meta = [
    row.readAt ? `Read ${new Date(row.readAt).toLocaleDateString()}` : null,
    row.seriesName ? seriesOnly(row.seriesName) : null,
    row.lists.length ? `In ${row.lists.join(', ')}` : 'In no list',
  ].filter(Boolean).join(' · ');

  // The same badge the reading view puts on a hand-added row, so an entry is recognisable as the
  // same thing in both places. A badge marks a row as unlike its neighbours, which is why the
  // view where every row is hand-added switches it off rather than repeating it down the page.
  const badge = v.markHandAdded && row.source === 'manual'
    ? [' ', el('span', { class: 'badge badge-unknown' }, 'by hand')]
    : [];

  return el('div', { class: 'result' }, el('div', { class: 'result-main' }, [
    el('div', { class: 'result-title', text: row.title }),
    el('div', { class: 'result-meta' }, [el('span', { text: meta }), ...badge]),
  ]));
}

// ------------------------------------------------------------------ data view

function exportMarkdown() {
  const id = activeListId();
  const list = store.state.lists[id];
  if (!list) return notify('#restore-report', 'No list is selected.', 'warn');
  const md = serializeChecklist({
    name: list.name,
    description: list.description,
    note: list.note,
    items: listItems(store.state, id),
  });
  download(`${slug(list.name)}.md`, md, 'text/markdown');
  announce('Markdown checklist downloaded.');
}

function wireData() {
  $('#api-base').value = settings.apiBase;
  $('#opt-covers').addEventListener('change', (e) => setCovers(e.target.checked));
  $('#opt-theme').addEventListener('change', (e) => setTheme(e.target.value));

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
      // Asked of the store rather than assumed from the success. A first restore into an empty
      // tracker snapshots an empty main key, which is no snapshot at all, and this line used to
      // un-hide the button anyway, after the repaint had correctly hidden it. Clicking it answered
      // "No pre-restore snapshot available."
      $('#btn-undo-restore').hidden = !store.hasPreRestoreSnapshot();
      // The buffered list belongs to the data the restore has just replaced. Offering it back
      // would splice a list out of the old tracker into the restored one.
      forgetDeleted();
    } else {
      // The lead sentence comes from what the store found in storage, not from this call site.
      // It used to read "nothing was changed" whatever had happened, including after a swap that
      // had already landed.
      const lead = res.changed === null
        ? 'Restore did not finish, and this browser will not say what your saved data now holds. Reload the page.'
        : 'Restore refused, nothing was changed.';
      notify('#restore-report', `${lead} ${res.errors.join(' ')}`, 'error');
      // Whether an undo is offered is a question about the snapshot slot, which these failures
      // leave in three different states, so it is asked rather than inferred from the failure.
      $('#btn-undo-restore').hidden = !store.hasPreRestoreSnapshot();
    }
    e.target.value = '';
  });

  $('#btn-undo-restore').addEventListener('click', () => {
    const res = store.undoRestore();
    notify('#restore-report', res.ok ? 'Restore undone.' : `Could not undo: ${res.errors.join(' ')}`, res.ok ? 'ok' : 'error');
    // Undoing a restore swaps the whole state back, exactly as the restore did, so the buffered
    // list belongs to data that is no longer here in this direction too.
    if (res.ok) forgetDeleted();
  });

  $('#form-settings').addEventListener('submit', (e) => {
    e.preventDefault();
    const value = $('#api-base').value.trim().replace(/\/+$/, '');
    if (!isAllowedApiBase(value)) {
      return notify('#restore-report', 'That API URL is not usable: use https, or http against localhost.', 'error');
    }
    settings.apiBase = value;
    // Cleared before the write, not after. saveSettings() prefers the refused value precisely so
    // that an unrelated write cannot discard it, which would also discard this one if the order
    // here were the other way round.
    if (settings.rejectedApiBase) {
      settings.rejectedApiBase = null;
      clearNotice(API_BASE_REJECTED);
    }
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

  $('#btn-wipe').addEventListener('click', async () => {
    const yes = await askConfirm({
      title: 'Erase every list and all reading progress?',
      body: 'This clears everything this browser has stored for the tracker. Export a backup first if you are not sure. It cannot be undone.',
      confirmLabel: 'Erase everything',
    });
    if (!yes) return;
    store.update(() => createEmptyState());
    cache.clear();
    // The undo buffer points at a list from the data that has just been erased, so putting it
    // back would resurrect one list out of a tracker the reader asked to be emptied.
    forgetDeleted();
    announceIfSaved('All local data erased.');
  });
}

// Measured in Edge rather than assumed, and the first attempt at this comment got it wrong. The
// largest value a cleared page accepted under a one-character key was 5,242,879 characters, which
// with the key is 5,242,880, and that is 10 MiB at two bytes per character rather than the 5 MiB
// first written here. Two runs filling the same room with 'x' and with an accented character were
// accepted to the identical character, so the cost is per character and does not depend on the
// content. So a copy occupies twice its length, and reporting the length alone would have
// understated every figure by half on the one screen whose subject is running out of room.
const salvageKb = (chars) => Math.max(1, Math.round((chars * 2) / 1024));

// Date and time to the second, not date alone. Copies are keyed to the millisecond and two can be
// taken on one day, and the reader choosing between them in a dialog that calls the removal
// unrecoverable has only this string to choose with. Measured: two copies a few milliseconds apart
// both rendered "Copy taken on 9 August 2026", with identical accessible names and an identical
// confirmation. Seconds separate two incidents; two copies inside one second still read alike, and
// those are the collision case freeArchiveKey() handles, where the copies are moments apart and
// the millisecond that distinguishes them is in the key rather than in anything worth showing.
//
// Compared against null rather than tested for truth, because a copy stamped at the epoch is a
// real case a device with a dead clock produces, and the layer below reports 0 and null as
// different values on purpose. Treating 0 as absent would discard that in the last step.
const salvageWhen = (at) => (at === null || at === undefined
  ? null
  : new Date(at).toLocaleString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }));

// The reader's view of what is being kept on their behalf. Read from storage on every call rather
// than from anything held in memory, because another tab can have taken a copy or removed one
// since this tab booted, and a stale list here offers a Remove for a copy that is already gone.
function renderSalvage() {
  const box = $('#salvage-list');
  if (!box) return;
  const copies = store.salvageCopies();

  // Three answers, not two. A browser that will not enumerate its own storage has not told us
  // there is nothing; it has declined to say, and a reader whose copies are all still there must
  // not be shown an empty list. The download in the recovery banner is unaffected either way,
  // because it reads one known key rather than walking them.
  if (copies === null) {
    box.replaceChildren(el('p', {
      class: 'rail-hint',
      text: 'This browser will not let the app list what it has stored, so any copies it is holding '
        + 'cannot be shown here. Nothing has been removed.',
    }));
    return;
  }
  if (copies.length === 0) {
    box.replaceChildren(el('p', { class: 'rail-hint', text: 'Nothing is being kept aside. Your saved data has always been readable.' }));
    return;
  }

  const total = copies.reduce((n, c) => n + c.chars, 0);
  box.replaceChildren(
    el('p', {
      class: 'rail-hint',
      text: `${copies.length} ${copies.length === 1 ? 'copy is' : 'copies are'} being kept, `
        + `taking about ${salvageKb(total)} KB.`,
    }),
    el('ul', { class: 'rows' }, copies.map((c) => {
      const when = salvageWhen(c.at);
      return el('li', { class: 'salvage-row' }, [
        el('div', { class: 'salvage-what' }, [
          el('span', { class: 'salvage-when', text: when ? `Copy taken on ${when}` : 'Copy with no date recorded' }),
          el('span', { class: 'salvage-size', text: `about ${salvageKb(c.chars)} KB` }),
        ]),
        el('div', { class: 'field-row' }, [
          el('button', {
            type: 'button',
            class: 'quiet',
            dataset: { act: 'download', key: c.key },
            'aria-label': `Download the ${when ? `copy taken on ${when}` : 'copy with no date recorded'}`,
            text: 'Download',
          }),
          // The offer is withdrawn rather than refused: while this copy is the last record of data
          // the app cannot read, removing it is the one thing that would leave the reader with
          // nothing, and a button that explains itself only after the click has already asked them
          // to try. The sentence depends on whether this tab is the one that is blocked, because
          // liveness is a property of storage and the banner is a property of the tab: a second
          // tab that read the data before it went bad shows the row with no warning above it.
          c.live
            ? el('span', {
              class: 'rail-hint',
              text: store.blocked
                ? 'Kept until the warning above is resolved'
                : 'Kept while the data it copies is still saved here',
            })
            : el('button', {
              type: 'button',
              class: 'quiet quiet-danger',
              dataset: { act: 'forget', key: c.key },
              'aria-label': `Remove the ${when ? `copy taken on ${when}` : 'copy with no date recorded'}`,
              text: 'Remove',
            }),
        ]),
      ]);
    })),
  );
}

function wireSalvage() {
  // One listener on the container, because the rows are rebuilt after every removal and listeners
  // bound to the buttons would go with them.
  $('#salvage-list').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-act]');
    if (!btn) return;
    const { act, key } = btn.dataset;
    const copies = store.salvageCopies();
    const copy = copies?.find((c) => c.key === key);
    if (!copy) {
      renderSalvage();
      // Two reasons the copy is not in the list, and only one of them means it is gone. A browser
      // that declined to enumerate has not told us anything was removed, and saying so would be
      // the one wrong thing to say on the screen whose subject is what is still being kept.
      return notify('#salvage-report', copies === null
        ? 'This browser will not let the app list what it has stored, so that copy cannot be acted on here. Nothing has been removed.'
        : 'That copy is no longer there. The list has been refreshed.', 'warn');
    }
    const when = salvageWhen(copy.at);
    const named = when ? `taken on ${when}` : 'with no date recorded';

    if (act === 'download') {
      const raw = store.salvageRawAt(key);
      if (!raw) return notify('#salvage-report', 'That copy could not be read back, so nothing was downloaded.', 'warn');
      // To the second, for the same reason the row is: two copies taken on one day would otherwise
      // arrive as one name and a browser-appended (1), leaving the reader unable to tell which is
      // which after the screen that could have told them is closed.
      const stamp = copy.at === null ? 'undated' : new Date(copy.at).toISOString().slice(0, 19).replace(/:/g, '-');
      download(`marvel-reading-tracker-unreadable-${stamp}.json`, raw, 'application/json');
      return notify('#salvage-report', `Downloaded the copy ${named}. It is still being kept here as well.`, 'ok');
    }

    const yes = await askConfirm({
      title: 'Remove this copy?',
      body: `This deletes the copy ${named}. It is a copy of saved data this app could not read, so `
        + 'there is nothing else to recover it from. Download it first if you are not sure.',
      confirmLabel: 'Remove copy',
    });
    if (!yes) return;
    const gone = store.forgetSalvage(key);
    renderSalvage();
    notify('#salvage-report', gone
      ? `Removed the copy ${named}, freeing about ${salvageKb(copy.chars)} KB.`
      : 'That copy could not be removed, so it is still being kept.', gone ? 'ok' : 'warn');
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
  renderHome();
  renderProgress();
  renderLibrary();
  renderQueue();
  const list = store.state.lists[activeListId()];
  $('#add-target').textContent = list
    ? `Anything you add goes into “${list.name}”.`
    : 'Anything you add will start a new list.';
  // Kept in renderAll so the banner cannot go stale. In particular a successful restore
  // clears the block, and leaving the banner up would push the user toward "Start fresh",
  // which would then wipe the backup they had just restored.
  renderBlocked();
  // The active list changes at more than a dozen places that never navigate, among them
  // duplicating a list and restoring a backup. This is the one point every one of them passes
  // through, so syncing here is what stops the address naming a list that is no longer on screen.
  // It replaces rather than pushes, so none of them can put an entry in front of Back.
  syncHash();
}

// ------------------------------------------------------------------ boot

// Everything above defines; this does. Keeping the two apart is what lets the module be
// imported at all: evaluating it used to run the whole sequence below, so a test that wanted
// one render function got a booting application instead, and in Node it got a ReferenceError
// before that. src/js/app.js is the entry the page loads, and calling boot() is all it does.
//
// Still last in the file, and still for the original reason. Booting from the top would run
// before the module's `let` bindings are initialised, and reading one of those from inside a
// boot call is a ReferenceError rather than an undefined, because the temporal dead zone does
// not hoist the way function declarations do.
export function boot() {
  setInterval(renderQueue, 1000);

  store.load();
  applyCoversSetting();
  applyThemeSetting();
  wireSidebar();
  wireNav();
  wireReading();
  wireAdd();
  wireData();
  wireSalvage();
  wireShortcuts();
  wireBlockedBanner();
  wireCatalogSearch();
  wireHome();
  wirePreview();
  wireAsk();
  wireProgressScope();
  renderAll();
  // The address bar is now allowed to be written, but not before: renderAll has just run once, and
  // an ungated sync inside it would have overwritten the incoming hash before it was read.
  routeReady = true;
  // A reader with nothing to read has no reading view to show, so the landing page is where
  // they start. One with an active list resumes it, which is the whole point of the app.
  // An address that names a view wins over both, which is what makes a bookmark, a shared link and
  // a reload land where they say they will. focus:false either way, so arriving at the page never
  // takes focus off the document the reader has not started interacting with yet.
  const bootRoute = parseRoute(location.hash);
  if (bootRoute) applyRoute(bootRoute, { focus: false, filterIfAbsent: filter });
  else showView(store.state.lists[activeListId()] ? 'read' : 'home', { focus: false });

  // Back and Forward arrive here, as does anyone editing the address by hand. A hash that is not one
  // of ours is left entirely alone: index.html ships a skip link to #main, and answering that with a
  // view change would throw a keyboard user somewhere they did not ask to go.
  //
  // Focus does move here, unlike at boot, because a Back press is a navigation the reader made. A
  // screen reader that is told nothing after it has no way to know the page changed under it.
  window.addEventListener('hashchange', () => {
    const route = parseRoute(location.hash);
    if (route) applyRoute(route, { focus: true, filterIfAbsent: DEFAULT_FILTER });
  });
  checkHealth();
  refreshCacheUsage();

  // Nothing reports store.lastError here. Every writer of it calls onChange in the same step, and
  // that callback already notifies #save-report, so a line here can only repeat what is on screen.
  // Measured in Edge with a route write failing during boot: 2 writes of the identical string into
  // a region that is role="alert" aria-live="assertive". It read as a backstop while a failed load
  // also set lastError, and that stopped being true when the reason moved to its own slot.

  // Reported after the first render, because a notice placed before there is a view to place it in
  // has nowhere to go. #app-report follows the reader between views, unlike the settings pane this
  // value is edited in, which is only seen by someone who already went looking for it.
  //
  // The launch page reads the same stored value and refuses it too, but it has no default to fall
  // back on and no reason to invent one, so it skips the lookup and sends the tab to marvel.com.
  // That degradation is named here because it happens in a tab this app does not control, where
  // nothing would otherwise explain it.
  if (settings.rejectedApiBase) {
    notify(
      '#app-report',
      `The saved API URL ${settings.rejectedApiBase} is not usable. The tracker is using ${DEFAULT_BASE} for this session, and any issue without a stored Marvel Unlimited link will open on marvel.com rather than in the reader. Set a usable URL under Backup & settings: use https, or http against localhost.`,
      'warn',
      API_BASE_REJECTED,
    );
  }

  // Written once at startup rather than from renderAll, because neither number can change
  // while the page is open, and a bug report needs them to be there whether or not the user
  // has touched anything.
  $('#about-version').textContent = APP_VERSION;
  $('#about-schema').textContent = String(SCHEMA_VERSION);
}
