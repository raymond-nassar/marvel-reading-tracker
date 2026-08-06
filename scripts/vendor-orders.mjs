// Build-time vendoring of curated reading orders.
// Reads the curated-list manifest (src/data/curated-lists.json), loads each markdown order,
// and enriches every issue with the fields the app needs (digitalId, seriesId, onSale,
// unlimitedDate), writing pinned JSON plus the catalog manifest into src/data/.
//
// An order is loaded either from `sourceUrl` over https or from `sourceFile`, a checklist kept
// in src/data/orders/. Adding a curated list is a manifest edit only, with no change to this
// script or to the app.
//
// Run manually:  npm run vendor
// One list only: npm run vendor -- --only=new-ultimate-universe
//
// `--only` exists because re-vendoring every order to add one costs hundreds of API calls and
// rewrites the snapshot date on files that did not change. Orders that are skipped keep their
// existing pinned JSON, and their catalog entries are rebuilt from it so catalog.json stays
// complete rather than silently losing the lists that were not rebuilt.
//
// The output is committed so importing a curated order needs zero network access at runtime,
// and so we are not exposed to upstream `main` changing under us.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RateLimiter } from '../src/js/lib/limiter.js';
import { parseChecklist } from '../src/js/lib/markdown.js';
import { parseCatalog } from '../src/js/lib/catalog.js';
import { parseManifest } from '../src/js/lib/curated.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://marvel.emreparker.com/v1';
const MANIFEST = join(ROOT, 'src', 'data', 'curated-lists.json');
const DATA_DIR = join(ROOT, 'src', 'data');
const ORDERS_DIR = join(DATA_DIR, 'orders');

// A manifest that cannot be read in full is a maintainer error: vendoring the valid subset
// would quietly ship a catalog missing a list nobody noticed was broken.
async function loadOrders() {
  const { entries, errors } = parseManifest(JSON.parse(await readFile(MANIFEST, 'utf8')));
  if (errors.length) {
    throw new Error(`curated-lists.json is not valid:\n  - ${errors.join('\n  - ')}`);
  }
  if (!entries.length) throw new Error('curated-lists.json defines no reading lists');
  return entries;
}

const limiter = new RateLimiter();

async function getJson(url, attempt = 0) {
  return limiter.schedule(async () => {
    const res = await fetch(url, { headers: { accept: 'application/json' } });
    limiter.observe(res.headers);
    if (res.status === 429 || res.status >= 500) {
      if (attempt >= 5) throw new Error(`${res.status} after retries: ${url}`);
      const wait = limiter.backoff(attempt);
      limiter.penalize(wait);
      await new Promise((r) => setTimeout(r, wait));
      return getJson(url, attempt + 1);
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return res.json();
  });
}

async function getText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

// An order comes from exactly one place; the manifest has already guaranteed which.
async function loadOrderText(order) {
  if (order.sourceFile) return readFile(join(ORDERS_DIR, order.sourceFile), 'utf8');
  return getText(order.sourceUrl);
}

function parseOnly(argv) {
  const ids = new Set();
  for (const arg of argv) {
    if (!arg.startsWith('--only=')) continue;
    for (const id of arg.slice('--only='.length).split(',')) {
      if (id.trim()) ids.add(id.trim());
    }
  }
  return ids;
}

// A checklist line with no Marvel link still belongs in the reading order, so it is vendored as
// a placeholder rather than dropped. The id is a hash of the order and title, which keeps it
// stable across re-vendoring: a random or time-based id would hand the reader a brand new,
// unread issue every time the list was rebuilt, silently resetting their progress. It is
// negative so it can never collide with a real Marvel issue id.
function placeholderId(orderId, title) {
  let h = 0x811c9dc5;
  for (const ch of `${orderId}:${title}`) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return -((h % 0x7ffffffe) + 1);
}

function parseIssueNumber(title) {
  const m = /#\s*([0-9]+(?:\.[0-9]+)?[A-Za-z]*)\s*$/.exec(String(title ?? '').trim());
  return m ? m[1] : null;
}

// Marvel's metadata occasionally carries a doubled space inside a title, as in
// "King In Black: Black Panther  (2021) #1". The extra space is not data, and pinning it verbatim
// makes it read as our typo rather than theirs, so internal whitespace is collapsed on ingest.
// This only ever removes redundant spacing and changes no other character.
//
// It is applied to titles resolved from the API, never to a placeholder's title: that string is
// the input to placeholderId(), so rewriting it would change the id and silently reset the
// reader's progress on that entry.
//
// Scope it to titles and series names. Marvel's `description` is their prose, and it double-spaces
// after sentences on purpose; collapsing that would rewrite their copy to no reader's benefit, and
// unlike a title it is not a field anything matches, sorts or searches on. A sweep for doubled
// spaces in src/data therefore still finds them in descriptions, and that is correct, not a miss.
function cleanText(s) {
  return String(s ?? '').replace(/\s+/g, ' ').trim();
}

// Marvel's CDN serves http:// in the API payload but supports https. Normalise so covers
// are not blocked as mixed content if the app is ever served over https.
function coverBase(cover) {
  if (!cover?.path || !cover?.extension) return null;
  return { path: String(cover.path).replace(/^http:/, 'https:'), ext: cover.extension };
}

// The card art for a reading order. `coverIssueId` names the issue an order should be
// recognised by; without one the first issue in reading order that has art stands in, which
// is the issue a reader would open first anyway. Either way the image is Marvel's own
// metadata for an issue that is actually in the order, never a hand-picked promotional
// image, so nothing here is scraped and the attribution stays truthful.
function catalogCover(order, payload) {
  const items = payload.items ?? [];
  if (order.coverIssueId != null) {
    const named = items.find((i) => i.issueId === order.coverIssueId);
    // A silent fallback here would pin art for an issue the curator did not choose and give
    // no sign that the reference had gone stale.
    if (!named) throw new Error(`${order.id}: coverIssueId ${order.coverIssueId} is not an issue in this order`);
    if (!named.cover) throw new Error(`${order.id}: coverIssueId ${order.coverIssueId} has no cover in Marvel's metadata`);
    return { coverIssueId: named.issueId, cover: named.cover };
  }
  const first = items.find((i) => i?.cover?.path && i?.cover?.ext);
  return first ? { coverIssueId: first.issueId, cover: first.cover } : { coverIssueId: null, cover: null };
}

// Derived from the payload rather than restated, so the issue count a reader sees before
// importing can never drift from the file they will actually import.
function catalogEntry(order, payload) {
  const { coverIssueId, cover } = catalogCover(order, payload);
  return {
    id: order.id,
    file: order.out,
    name: order.name,
    description: order.description,
    type: order.type,
    depth: order.depth,
    count: payload.count,
    characters: order.characters ?? [],
    keywords: order.keywords ?? [],
    group: order.group,
    groupName: order.groupName,
    variant: order.variant,
    // An editorial judgement recorded in curated-lists.json, not inferred: true means the
    // order opens the story it tells, so it assumes no prior reading.
    beginner: order.beginner === true,
    coverIssueId,
    cover,
    source: payload.source,
    sourceLicense: payload.sourceLicense,
    updatedAt: payload.generatedAt,
  };
}

async function main() {
  const orders = await loadOrders();
  const only = parseOnly(process.argv.slice(2));
  // The catalog carries editorial metadata — descriptions, keywords, beginner, the cover
  // issue — that changes without any reading order changing. Rebuilding it from the pinned
  // files costs no API calls and leaves every order's snapshot date alone, so an editorial
  // edit is not a reason to re-fetch several hundred issues.
  const catalogOnly = process.argv.slice(2).includes('--catalog-only');
  if (catalogOnly && only.size) {
    throw new Error('--catalog-only rebuilds every catalog entry from the pinned files, so it cannot be combined with --only');
  }
  for (const id of only) {
    // A typo here would otherwise vendor nothing and look like a success.
    if (!orders.some((o) => o.id === id)) {
      throw new Error(`--only names "${id}", which is not a list in curated-lists.json`);
    }
  }
  const targets = catalogOnly ? [] : (only.size ? orders.filter((o) => only.has(o.id)) : orders);
  if (catalogOnly) console.log('Rebuilding catalog.json from the pinned order files; no issues are re-fetched.');
  else if (only.size) console.log(`Vendoring ${targets.length} of ${orders.length} lists; the rest keep their pinned files.`);

  const parsed = [];
  for (const order of targets) {
    const md = await loadOrderText(order);
    const { entries, unresolved } = parseChecklist(md);
    console.log(`${order.id}: ${entries.length} issues, ${unresolved.length} unresolved`);
    parsed.push({ order, entries, unresolved });
  }

  const ids = [...new Set(parsed.flatMap((p) => p.entries.map((e) => e.issueId)))];
  if (ids.length) console.log(`Hydrating ${ids.length} unique issues (rate limited, expect a few minutes)...`);

  const meta = new Map();
  let done = 0;
  for (const id of ids) {
    try {
      const d = await getJson(`${API}/issues/${id}`);
      meta.set(id, d);
    } catch (err) {
      console.warn(`  ! issue ${id}: ${err.message}`);
    }
    done += 1;
    if (done % 25 === 0) console.log(`  ${done}/${ids.length}`);
  }

  await mkdir(DATA_DIR, { recursive: true });

  const summary = [];
  const catalogById = new Map();
  for (const { order, entries, unresolved } of parsed) {
    let missingDigital = 0;
    let missingCover = 0;

    const issueItems = entries.map((e) => {
      const d = meta.get(e.issueId) ?? {};
      if (d.digitalId == null) missingDigital += 1;
      const cover = coverBase(d.cover);
      if (!cover) missingCover += 1;
      return {
        at: e.index,
        item: {
          issueId: e.issueId,
          title: cleanText(d.title ?? e.title),
          number: parseIssueNumber(d.title ?? e.title),
          url: d.detailUrl ?? e.url,
          seriesId: d.seriesId ?? null,
          seriesName: d.seriesName == null ? null : cleanText(d.seriesName),
          onSale: d.onSaleDate ?? null,
          mu: d.unlimitedDate ?? null,
          digitalId: d.digitalId ?? null,
          cover,
          description: d.description ?? null,
          pageCount: d.pageCount ?? null,
          creators: Array.isArray(d.creators)
            ? d.creators.filter((c) => /writer|penciler|artist/i.test(c.role ?? '')).map((c) => ({ name: c.name, role: c.role }))
            : [],
        },
      };
    });

    const placeholderItems = unresolved.map((u) => ({
      at: u.index,
      item: {
        issueId: placeholderId(order.id, u.title),
        title: u.title,
        number: parseIssueNumber(u.title),
        url: u.url ?? null,
        seriesId: null,
        seriesName: null,
        onSale: null,
        mu: null,
        digitalId: null,
        cover: null,
        description: null,
        pageCount: null,
        creators: [],
        placeholder: true,
      },
    }));

    // Reading order is the point of these files, so resolved and unresolved lines are merged
    // back into the sequence they were written in rather than appended in a lump.
    const items = [...issueItems, ...placeholderItems].sort((a, b) => a.at - b.at).map((x) => x.item);

    const dupes = new Set();
    const seenIds = new Set();
    for (const it of items) {
      if (seenIds.has(it.issueId)) dupes.add(it.issueId);
      seenIds.add(it.issueId);
    }
    if (dupes.size) {
      console.warn(`  ! ${order.id}: ${dupes.size} duplicate issue id(s) in the order; importing will collapse them: ${[...dupes].join(', ')}`);
    }

    const payload = {
      id: order.id,
      name: order.name,
      description: order.description,
      source: order.sourcePage,
      sourceLicense: order.sourceLicense,
      generatedAt: new Date().toISOString(),
      apiBase: API,
      count: items.length,
      placeholders: placeholderItems.length,
      unresolved,
      items,
    };

    await writeFile(join(DATA_DIR, order.out), JSON.stringify(payload, null, 2) + '\n', 'utf8');
    summary.push({
      file: order.out,
      count: items.length,
      expected: order.expect ?? items.length,
      placeholders: placeholderItems.length,
      missingDigital,
      missingCover,
    });
    catalogById.set(order.id, catalogEntry(order, payload));
  }

  // Lists we did not rebuild still have to appear in the catalog, so their entries are derived
  // from the pinned file already on disk. Omitting them would make --only quietly delete lists.
  for (const order of orders) {
    if (catalogById.has(order.id)) continue;
    const path = join(DATA_DIR, order.out);
    let payload;
    try {
      payload = JSON.parse(await readFile(path, 'utf8'));
    } catch (err) {
      throw new Error(`${order.id} was skipped but has no pinned ${order.out} to reuse (${err.message}); run without --only`);
    }
    catalogById.set(order.id, catalogEntry(order, payload));
  }

  const catalog = orders.map((o) => catalogById.get(o.id));
  const checked = parseCatalog({ lists: catalog });
  if (checked.dropped) throw new Error(`${checked.dropped} catalog entries are not valid; catalog.json not written`);
  await writeFile(
    join(DATA_DIR, 'catalog.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), lists: catalog }, null, 2) + '\n',
    'utf8',
  );

  if (summary.length) console.table(summary);
  const bad = summary.filter((s) => s.count !== s.expected);
  if (bad.length) {
    console.warn('WARNING: counts differ from the plan\u2019s expected values:', bad);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
