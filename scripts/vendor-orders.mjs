// Build-time vendoring of curated reading orders.
// Reads the curated-list manifest (src/data/curated-lists.json), fetches each upstream markdown
// order, and enriches every issue with the fields the app needs (digitalId, seriesId, onSale,
// unlimitedDate), writing pinned JSON plus the catalog manifest into src/data/.
//
// Run manually: npm run vendor
// Adding a curated list is a manifest edit only — no change to this script or to the app.
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

function parseIssueNumber(title) {
  const m = /#\s*([0-9]+(?:\.[0-9]+)?[A-Za-z]*)\s*$/.exec(String(title ?? '').trim());
  return m ? m[1] : null;
}

// Marvel's CDN serves http:// in the API payload but supports https. Normalise so covers
// are not blocked as mixed content if the app is ever served over https.
function coverBase(cover) {
  if (!cover?.path || !cover?.extension) return null;
  return { path: String(cover.path).replace(/^http:/, 'https:'), ext: cover.extension };
}

async function main() {
  const orders = await loadOrders();
  const parsed = [];
  for (const order of orders) {
    const md = await getText(order.sourceUrl);
    const { entries, unresolved } = parseChecklist(md);
    console.log(`${order.id}: ${entries.length} issues, ${unresolved.length} unresolved`);
    parsed.push({ order, entries, unresolved });
  }

  const ids = [...new Set(parsed.flatMap((p) => p.entries.map((e) => e.issueId)))];
  console.log(`Hydrating ${ids.length} unique issues (rate limited, expect a few minutes)...`);

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

  await mkdir(join(ROOT, 'src', 'data'), { recursive: true });

  const summary = [];
  const catalog = [];
  for (const { order, entries, unresolved } of parsed) {
    let missingDigital = 0;
    let missingCover = 0;
    const items = entries.map((e) => {
      const d = meta.get(e.issueId) ?? {};
      if (d.digitalId == null) missingDigital += 1;
      const cover = coverBase(d.cover);
      if (!cover) missingCover += 1;
      return {
        issueId: e.issueId,
        title: d.title ?? e.title,
        number: parseIssueNumber(d.title ?? e.title),
        url: d.detailUrl ?? e.url,
        seriesId: d.seriesId ?? null,
        seriesName: d.seriesName ?? null,
        onSale: d.onSaleDate ?? null,
        mu: d.unlimitedDate ?? null,
        digitalId: d.digitalId ?? null,
        cover,
        description: d.description ?? null,
        pageCount: d.pageCount ?? null,
        creators: Array.isArray(d.creators)
          ? d.creators.filter((c) => /writer|penciler|artist/i.test(c.role ?? '')).map((c) => ({ name: c.name, role: c.role }))
          : [],
      };
    });

    const payload = {
      id: order.id,
      name: order.name,
      description: order.description,
      source: order.sourcePage,
      sourceLicense: order.sourceLicense,
      generatedAt: new Date().toISOString(),
      apiBase: API,
      count: items.length,
      unresolved,
      items,
    };

    await writeFile(join(ROOT, 'src', 'data', order.out), JSON.stringify(payload, null, 2) + '\n', 'utf8');
    summary.push({ file: order.out, count: items.length, expected: order.expect ?? items.length, missingDigital, missingCover });

    // The catalog entry is derived from the payload we just wrote, so the issue count a
    // reader sees before importing can never drift from the file they will actually import.
    catalog.push({
      id: order.id,
      file: order.out,
      name: order.name,
      description: order.description,
      type: order.type,
      depth: order.depth,
      count: items.length,
      characters: order.characters ?? [],
      keywords: order.keywords ?? [],
      group: order.group,
      groupName: order.groupName,
      variant: order.variant,
      source: payload.source,
      sourceLicense: payload.sourceLicense,
      updatedAt: payload.generatedAt,
    });
  }

  const checked = parseCatalog({ lists: catalog });
  if (checked.dropped) throw new Error(`${checked.dropped} catalog entries are not valid; catalog.json not written`);
  await writeFile(
    join(ROOT, 'src', 'data', 'catalog.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), lists: catalog }, null, 2) + '\n',
    'utf8',
  );

  console.table(summary);
  const bad = summary.filter((s) => s.count !== s.expected);
  if (bad.length) {
    console.warn('WARNING: counts differ from the plan\u2019s expected values:', bad);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
