// Launch page for the Marvel Unlimited reader.
//
// Why this page exists at all: the reader URL needs `digitalId`, which only
// /v1/issues/{id} returns. Doing that lookup in the app BEFORE window.open costs the
// user-activation token and the tab gets blocked; doing it after means holding a window
// handle and navigating it later, which testing on 2026-08-03 showed to be unreliable.
// So the app opens this page immediately and the lookup happens HERE, in the new tab.
// No handle is retained, and `opener` can be severed safely.
//
// Deliberately not an open redirector: ids must be digits, the destination is built here,
// and the API base is read from this origin's own settings rather than from the URL.
//
// This lives in its own file rather than an inline <script> so the server can send a
// Content-Security-Policy with `script-src 'self'`. That is the directive that stops a
// compromised or hostile metadata response from executing script it smuggled into a
// title or description, so it is worth keeping strict enough to be meaningful.
//
// Loaded as a module so it can share the API base rule with the app rather than keeping
// a second copy of it. open.html loads it at the end of <body>, and module scripts are
// deferred, so the elements looked up below are parsed by the time this runs.

import { isAllowedApiBase } from './js/lib/apiBase.js';

const q = new URLSearchParams(location.search);
const digits = (v) => (/^\d{1,12}$/.test(v || '') ? v : null);

const digitalId = digits(q.get('d'));
const issueId = digits(q.get('i'));
const title = (q.get('t') || '').slice(0, 120);

const h = document.getElementById('h');
const p = document.getElementById('p');
const fallback = document.getElementById('fallback');

const readerUrl = (d) => `https://read.marvel.com/#/book/${d}`;
const detailUrl = (i) => `https://www.marvel.com/comics/issue/${i}/`;

if (title) h.textContent = `Opening ${title}…`;

function go(url) {
  fallback.href = url;
  location.replace(url);
}

// Same origin as the app, so this reads the user's configured API base directly
// instead of accepting one from the query string.
function apiBase() {
  try {
    const raw = JSON.parse(localStorage.getItem('mrt.settings') || '{}');
    const base = String(raw.apiBase || 'https://marvel.emreparker.com/v1').replace(/\/+$/, '');
    if (!isAllowedApiBase(base)) return null;
    return base;
  } catch {
    return null;
  }
}

async function resolveAndGo(id) {
  const base = apiBase();
  if (!base) return go(detailUrl(id));

  p.textContent = 'Looking up the Marvel Unlimited link for this issue…';
  fallback.href = detailUrl(id);

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 8000);
  try {
    const res = await fetch(`${base}/issues/${id}`, {
      headers: { accept: 'application/json' },
      signal: ctl.signal,
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const d = digits(String(data && data.digitalId != null ? data.digitalId : ''));
    if (d) return go(readerUrl(d));
    p.textContent = 'This issue has no Marvel Unlimited link recorded, so this opens its page on marvel.com instead.';
  } catch {
    p.textContent = 'Could not reach the metadata service, so this opens the issue page on marvel.com instead.';
  } finally {
    clearTimeout(timer);
  }
  setTimeout(() => go(detailUrl(id)), 1400);
}

if (digitalId) {
  go(readerUrl(digitalId));
} else if (issueId) {
  resolveAndGo(issueId);
} else {
  h.textContent = 'Nothing to open';
  p.textContent = 'This link was missing an issue reference.';
}
