#!/usr/bin/env node
// Build-time vendoring of the series and creator name indexes.
//
// The upstream API has no name search for these two collections. `/search/issues` is a real
// search endpoint, but `/search/series` and `/search/creators` do not exist (both 404), and
// `/series?q=…` and `/creators?q=…` accept the parameter and silently ignore it: the response
// is byte-identical to the unfiltered one. So "Add a whole series" and "Browse a creator" used
// to return the alphabetical head of the whole collection whatever you typed, each row wired
// to a one-click "Add all issues" button. Wrong results attached to a destructive action.
//
// The collections are small and change rarely (6,990 series, 4,341 creators), so we page them
// once here and filter locally at runtime. scripts/check-contract.mjs asserts that `q` is
// still ignored; if upstream ever ships real search, that check fails and these files and the
// client-side filtering should be deleted in favour of live queries.
//
// Run manually:  npm run vendor:index
// One kind only: npm run vendor:index -- --only=creators
//
// 57 requests at limit=200 (the documented ceiling; limit=500 returns 422), rate limited, so
// expect it to take about a minute.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RateLimiter } from '../src/js/lib/limiter.js';
import { INDEX_FIELDS, parseNameIndex } from '../src/js/lib/nameIndex.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://marvel.emreparker.com/v1';
const DATA_DIR = join(ROOT, 'src', 'data');
const PAGE = 200; // limit=500 returns HTTP 422; 200 is the documented ceiling

const KINDS = [
  { kind: 'series', path: '/series', out: 'series-index.json' },
  { kind: 'creators', path: '/creators', out: 'creators-index.json' },
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

function parseOnly(argv) {
  const kinds = new Set();
  for (const arg of argv) {
    if (!arg.startsWith('--only=')) continue;
    for (const kind of arg.slice('--only='.length).split(',')) {
      if (kind.trim()) kinds.add(kind.trim());
    }
  }
  return kinds;
}

// A short index is worse than no index: the reader gets "no series matched" for something that
// exists, with nothing to tell them the file was truncated. So a page that fails, or a run that
// ends short of the total the API itself reported, aborts without writing.
async function fetchAll(path, kind) {
  const rows = [];
  const seen = new Set();
  let total = null;

  for (let offset = 0; ; offset += PAGE) {
    const data = await getJson(`${API}${path}?limit=${PAGE}&offset=${offset}`);
    const items = Array.isArray(data.items) ? data.items : [];
    if (total == null && Number.isInteger(data.total)) total = data.total;

    for (const it of items) {
      // Duplicate ids would silently shrink the index against the total and trip the check
      // below with a confusing message, so they are reported for what they are.
      if (seen.has(it.id)) {
        console.warn(`  ! ${kind}: duplicate id ${it.id} (${it.name}) at offset ${offset}`);
        continue;
      }
      seen.add(it.id);
      rows.push([it.id, it.name, it.issueCount]);
    }

    process.stdout.write(`  ${kind}: ${rows.length}${total ? `/${total}` : ''}\r`);
    if (!data.has_next || items.length === 0) break;
    if (total != null && rows.length >= total) break;
  }
  console.log();

  if (total == null) throw new Error(`${kind}: the API reported no total, so completeness cannot be checked`);
  if (rows.length !== total) {
    throw new Error(`${kind}: collected ${rows.length} of the ${total} the API reports; refusing to write a partial index`);
  }
  return { rows, total };
}

async function main() {
  const only = parseOnly(process.argv.slice(2));
  for (const kind of only) {
    // A typo would otherwise vendor nothing and look like a success.
    if (!KINDS.some((k) => k.kind === kind)) {
      throw new Error(`--only names "${kind}", which is not one of: ${KINDS.map((k) => k.kind).join(', ')}`);
    }
  }
  const targets = only.size ? KINDS.filter((k) => only.has(k.kind)) : KINDS;

  await mkdir(DATA_DIR, { recursive: true });
  const summary = [];

  for (const { kind, path, out } of targets) {
    console.log(`Paging ${API}${path} at limit=${PAGE}...`);
    const { rows, total } = await fetchAll(path, kind);

    // Records are tuples rather than objects: the same 6,990 series are 516 KB as
    // {"id":…,"name":…,"issueCount":…} and 345 KB as [id, name, issueCount], a third smaller
    // for a file the browser downloads whole. `fields` names the positions so the file stays
    // readable on its own terms instead of being a wall of anonymous arrays.
    const payload = {
      kind,
      generatedAt: new Date().toISOString(),
      apiBase: API,
      total,
      fields: INDEX_FIELDS,
      items: rows,
    };

    // Parsed back with the same module the app uses, so a file that the runtime would reject
    // fails here, at the desk of whoever ran the script, rather than in a reader's browser.
    const check = parseNameIndex(payload);
    if (check.dropped) throw new Error(`${kind}: ${check.dropped} records are not usable; ${out} not written`);
    if (check.entries.length !== total) {
      throw new Error(`${kind}: re-parsed to ${check.entries.length} of ${total} records; ${out} not written`);
    }

    const json = JSON.stringify(payload);
    await writeFile(join(DATA_DIR, out), json + '\n', 'utf8');
    summary.push({ file: out, records: total, kb: Math.round(Buffer.byteLength(json) / 1024) });
  }

  console.table(summary);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
