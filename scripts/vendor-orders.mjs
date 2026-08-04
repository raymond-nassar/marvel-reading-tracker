// Build-time vendoring of curated reading orders.
// Fetches the upstream Hickman markdown orders and enriches every issue with the fields the
// app needs (digitalId, seriesId, onSale, unlimitedDate), writing pinned JSON into src/data/.
//
// Run manually: npm run vendor
// The output is committed so importing a curated order needs zero network access at runtime,
// and so we are not exposed to upstream `main` changing under us.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RateLimiter } from '../src/js/lib/limiter.js';
import { parseChecklist } from '../src/js/lib/markdown.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://marvel.emreparker.com/v1';
const RAW = 'https://raw.githubusercontent.com/emreparker/marvel-comics/main/data';

const ORDERS = [
  {
    id: 'hickman-minimal',
    file: 'hickman_minimal.md',
    out: 'hickman_minimal.json',
    name: 'Hickman to Secret Wars — minimal',
    description: 'The essential spine of Jonathan Hickman\u2019s Avengers run through Secret Wars (2015).',
    expect: 89,
  },
  {
    id: 'hickman-full',
    file: 'hickman_full.md',
    out: 'hickman_full.json',
    name: 'Hickman to Secret Wars — full',
    description: 'The complete Hickman saga including tie-ins, ending with Secret Wars (2015).',
    expect: 219,
  },
];

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
  const parsed = [];
  for (const order of ORDERS) {
    const md = await getText(`${RAW}/${order.file}`);
    const { entries, unresolved } = parseChecklist(md);
    console.log(`${order.file}: ${entries.length} issues, ${unresolved.length} unresolved`);
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
      source: `https://github.com/emreparker/marvel-comics/blob/main/data/${order.file}`,
      sourceLicense: 'MIT (emreparker/marvel-comics)',
      generatedAt: new Date().toISOString(),
      apiBase: API,
      count: items.length,
      unresolved,
      items,
    };

    await writeFile(join(ROOT, 'src', 'data', order.out), JSON.stringify(payload, null, 2) + '\n', 'utf8');
    summary.push({ file: order.out, count: items.length, expected: order.expect, missingDigital, missingCover });
  }

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
