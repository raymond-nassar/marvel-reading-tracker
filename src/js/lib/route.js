// The URL scheme. Kept out of main.js so it can be tested in Node: main.js reads `document` at
// module scope and cannot be imported.
//
// A hash rather than a path, for two independent reasons. Constraint 5 makes the origin
// load-bearing, and server.mjs serves files with no single-page fallback, so a path such as
// /read/list-abc would 404 on exactly the reload and bookmark that this scheme exists to support.

import { LIBRARY_VIEWS } from './library.js';

// Every section the rail can reach. This lives here rather than in main.js so that one list backs
// both what can be shown and what can be routed to. Split across two files, a new view could be
// routable but not showable, or showable but silently unreachable by URL.
export const VIEWS = ['home', 'read', 'catalog', 'progress', 'add', 'data', 'about', ...LIBRARY_VIEWS.map((v) => v.value)];

const PREFIX = '#/';

// The active list rides along on every view rather than on a chosen few. Picking a subset would be
// a list someone has to keep in step with the views, and getting it wrong would drop the reader's
// place on the view that forgot to ask for it.
export function formatRoute({ view, listId } = {}) {
  if (!VIEWS.includes(view)) return '';
  const tail = listId ? `/${encodeURIComponent(listId)}` : '';
  return `${PREFIX}${encodeURIComponent(view)}${tail}`;
}

// Returns null for anything that is not one of our routes, which the caller must treat as "not
// mine, leave it alone". index.html ships a skip link to #main, and clicking it pushes a history
// entry, so hashchange really is handed a foreign hash during ordinary keyboard use. Rewriting it
// would break the skip target.
export function parseRoute(hash) {
  if (typeof hash !== 'string' || !hash.startsWith(PREFIX)) return null;
  const parts = hash.slice(PREFIX.length).split('/');
  if (parts.length > 2) return null;

  let view;
  let listId;
  try {
    view = decodeURIComponent(parts[0]);
    listId = parts[1] === undefined ? null : decodeURIComponent(parts[1]);
  } catch {
    // A malformed percent-escape throws rather than returning a string. A typo in a shared link is
    // not a reason to take the reader's app down.
    return null;
  }

  if (!VIEWS.includes(view)) return null;
  return { view, listId: listId || null };
}
