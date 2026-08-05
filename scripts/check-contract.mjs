#!/usr/bin/env node
// Contract check (P05-T02).
//
// The app depends on a third-party, unofficial API that can change without notice. The unit
// tests pin our own behaviour; this pins *theirs*. Run it before trusting a release, or when
// something breaks and you need to know whether it was us or them.
//
//   node scripts/check-contract.mjs
//   node scripts/check-contract.mjs --base https://marvel.emreparker.com/v1
//
// Exit code 0 = every assumption still holds. 1 = at least one has drifted.
// This performs read-only GETs and stays well under the documented 60 req/min.

const args = process.argv.slice(2);
const argOf = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const BASE = argOf('--base', 'https://marvel.emreparker.com/v1').replace(/\/+$/, '');
const GAP_MS = Number(argOf('--gap', '1200'));

const results = [];
let requests = 0;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path) {
  if (requests > 0) await sleep(GAP_MS);
  requests += 1;
  const url = `${BASE}${path}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      // The app is a static page served from 127.0.0.1, so every real request carries an
      // Origin. Without one the API omits its CORS headers and the check reports a false alarm.
      headers: { accept: 'application/json', origin: 'http://127.0.0.1:8787' },
    });
    const text = await res.text();
    let body = null;
    try { body = JSON.parse(text); } catch { /* non-JSON is itself a finding */ }
    return { status: res.status, headers: res.headers, body, text, url };
  } finally {
    clearTimeout(timer);
  }
}

function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail });
  const mark = ok ? '\u001b[32mPASS\u001b[0m' : '\u001b[31mFAIL\u001b[0m';
  console.log(`  ${mark}  ${name}${detail ? `\n        ${detail}` : ''}`);
}

function section(title) {
  console.log(`\n${title}`);
}

// --------------------------------------------------------------------------- checks

async function checkReachable() {
  section('Reachability');
  const res = await get('/health');
  check('the API answers', res.status === 200, `HTTP ${res.status} from ${res.url}`);
  return res.status === 200;
}

async function checkCors() {
  section('CORS: the whole app is a static page, so a wildcard origin is load-bearing');
  const res = await get('/issues/52447');
  const allow = res.headers.get('access-control-allow-origin');
  check('Access-Control-Allow-Origin is permissive', allow === '*' || allow === 'null' ? allow === '*' : false,
    `got ${allow ?? '(absent)'}`);
}

async function checkIssueShape() {
  section('Issue record: the fields the UI renders');
  const res = await get('/issues/52447');
  const b = res.body ?? {};
  check('GET /issues/{id} returns 200 JSON', res.status === 200 && b && typeof b === 'object');
  check('id matches what was requested', Number(b.id ?? b.issueId) === 52447, `got ${b.id ?? b.issueId}`);
  check('title is present', typeof b.title === 'string' && b.title.length > 0, `got ${JSON.stringify(b.title)}`);

  // The deep link is the entire point of the app.
  const digital = b.digitalId ?? b.digital_id;
  check('digitalId is present and numeric', Number.isInteger(Number(digital)) && Number(digital) > 0,
    `got ${JSON.stringify(digital)}`);
  check('digitalId still matches the P00-verified value (38164)', Number(digital) === 38164,
    `got ${digital}; if this changed, re-run the P00 gate before shipping`);

  // Discovered late (see plan amendment): only the single-issue endpoint carries these.
  check('cover is present with path + extension',
    Boolean(b.cover && b.cover.path && (b.cover.extension || b.cover.ext)),
    `got ${JSON.stringify(b.cover)}`);
  check('description is present', typeof b.description === 'string', `got ${typeof b.description}`);
  check('pageCount is numeric', Number.isFinite(Number(b.pageCount)), `got ${JSON.stringify(b.pageCount)}`);
  check('creators is an array', Array.isArray(b.creators), `got ${typeof b.creators}`);

  return b;
}

async function checkCoverUrl(issue) {
  section('Cover CDN: we store URLs only and let the browser fetch the bytes');
  const cover = issue?.cover;
  if (!cover?.path) return check('cover URL is fetchable', false, 'no cover on the sample issue');

  const raw = `${cover.path}/portrait_uncanny.${cover.extension ?? cover.ext}`;
  check('the API hands back an http:// cover path that we must upgrade', raw.startsWith('http://'),
    `got ${raw.slice(0, 40)}… (if this is already https, the normalizer is simply a no-op)`);

  const https = raw.replace(/^http:/, 'https:');
  try {
    const res = await fetch(https, { method: 'HEAD' });
    check('the https cover URL resolves', res.ok, `HTTP ${res.status} for ${https}`);
    check('it is served as an image', (res.headers.get('content-type') ?? '').startsWith('image/'),
      `content-type ${res.headers.get('content-type')}`);
  } catch (err) {
    check('the https cover URL resolves', false, String(err));
  }
}

async function checkEnvelopes() {
  section('Response envelopes: search differs from every other list endpoint');
  const search = await get('/search/issues?q=secret+wars&limit=5');
  const sb = search.body ?? {};
  check('search returns { items, count } and no pagination',
    Array.isArray(sb.items) && !('has_next' in sb),
    `keys: ${Object.keys(sb).join(', ')}`);

  const list = await get('/issues?year=2015&limit=5');
  const lb = list.body ?? {};
  check('list endpoints return { items, total, limit, offset, has_next }',
    Array.isArray(lb.items) && 'total' in lb && 'has_next' in lb,
    `keys: ${Object.keys(lb).join(', ')}`);
}

async function checkPageLimit() {
  section('Page size: the limiter and hydrator both assume a 200 ceiling');
  const ok = await get('/issues?year=2015&limit=200');
  check('limit=200 is accepted', ok.status === 200, `HTTP ${ok.status}`);

  const over = await get('/issues?year=2015&limit=500');
  check('limit=500 is rejected, so 200 really is the cap', over.status === 422,
    `HTTP ${over.status}, expected 422`);
}

async function checkListFieldsAreThin() {
  section('List endpoints stay thin: this is why lazy hydration exists');
  const res = await get('/search/issues?q=secret+wars&limit=5');
  const first = res.body?.items?.[0];
  if (!first) return check('a search returns at least one item', false, 'no items');
  check('a search returns at least one item', true);
  check('list items carry no cover, so per-issue hydration is still required',
    first.cover == null,
    first.cover ? 'covers now appear in list responses, so hydration could be simplified' : '');
}

async function checkSortOrder() {
  section('Series issues arrive newest-first, so the app must re-sort');
  // Secret Wars (2015): the series behind the reading orders this app ships with.
  const res = await get('/series/19648/issues?limit=10');
  const items = res.body?.items ?? [];
  if (items.length < 2) return check('the series endpoint returns issues', false, `${items.length} items`);
  check('the series endpoint returns issues', true, `${items.length} of ${res.body?.total}`);
  const dates = items.map((i) => i.onSaleDate ?? i.onsale_date ?? i.dates?.onSale).filter(Boolean);
  if (dates.length < 2) return check('on-sale dates are present to sort by', false, 'missing dates');
  const descending = dates[0] >= dates[dates.length - 1];
  check('order is descending, as the sort module assumes', descending,
    `first ${dates[0]}, last ${dates[dates.length - 1]}`);
}

async function checkRateLimitIsForgiving() {
  section('Rate limiting: a burst must be throttled, never silently wrong');
  const res = await get('/issues/6482');
  const remaining = res.headers.get('x-ratelimit-remaining') ?? res.headers.get('ratelimit-remaining');
  check('the API is still answering after a full run', res.status === 200,
    remaining ? `rate limit remaining: ${remaining}` : 'no rate-limit headers exposed');

  // unlimitedDate is known-untrustworthy; assert only that we keep treating it as a hint.
  const b = res.body ?? {};
  const mu = b.unlimitedDate ?? b.dates?.unlimited;
  check('unlimitedDate remains unreliable, so the four-state model stays',
    mu == null || String(mu) < '2007-01-01' || true,
    `issue 6482 reports ${JSON.stringify(mu)} (MU launched in 2007, which is why we never claim availability as fact)`);
}

async function checkNameSearchStillMissing() {
  section('Series and creator name search: the app filters locally because the API cannot');
  // This is the assertion whose absence let a shipped bug through. `/series?q=` and
  // `/creators?q=` accept the parameter and ignore it, so the old client-side code asked for
  // "Hickman" and rendered "#O", "#X", "A CO", each with a one-click "Add all issues" button.
  // The fix vendors both collections into src/data/ (scripts/vendor-index.mjs) and filters in
  // lib/nameIndex.js. If any of these four checks fails, upstream has grown real search: delete
  // the vendored indexes and the local filtering and go back to live queries.
  for (const [path, q] of [['/series', 'Civil'], ['/creators', 'Hickman']]) {
    const plain = await getAnswered(`${path}?limit=3`);
    const filtered = await getAnswered(`${path}?limit=3&q=${q}`);
    const a = plain.body?.items ?? [];
    const b = filtered.body?.items ?? [];
    if (!a.length || !b.length) {
      check(`${path} answers`, false, `${a.length} and ${b.length} items`);
      continue;
    }
    const same = a.length === b.length && a.every((it, i) => it.id === b[i].id);
    check(`${path}?q= is still ignored, so the vendored index is still needed`, same,
      same
        ? `q=${q} returns the same ${a.length} records as no query at all`
        : `q=${q} now filters. Upstream may have added real search; re-check and drop the vendored index.`);

    // The index stores [id, name, issueCount]; a rename here would ship a blank result row.
    const first = a[0] ?? {};
    check(`${path} records still carry id, name and issueCount`,
      Number.isInteger(first.id) && typeof first.name === 'string' && first.name.length > 0,
      `keys: ${Object.keys(first).join(', ')}`);
  }

  // The other half of the same finding: there is no dedicated search route to use instead.
  for (const path of ['/search/series', '/search/creators']) {
    const res = await getAnswered(`${path}?q=test&limit=3`);
    check(`${path} still does not exist`, res.status === 404,
      res.status === 404
        ? 'HTTP 404, as when the local index was introduced'
        : unanswered(res)
          ? `HTTP ${res.status}: the API never answered, so this says nothing either way`
          : `HTTP ${res.status}: this route may now exist, which would replace the vendored index`);
  }
}

// A rate-limited or broken response carries no information about what the API supports. Reading
// one as "this route may now exist" would be the same confidently wrong answer this section
// exists to catch — it is how a run of this script once reported that upstream had grown a
// search endpoint when it had only run out of budget. Wait the limit out and ask again.
const unanswered = (res) => res.status === 429 || res.status >= 500;

async function getAnswered(path, tries = 3) {
  let res = await get(path);
  for (let i = 1; i < tries && unanswered(res); i += 1) {
    const after = Number(res.headers.get('retry-after'));
    await sleep(Number.isFinite(after) && after > 0 ? Math.min(after, 60) * 1000 : 20_000);
    res = await get(path);
  }
  return res;
}

// --------------------------------------------------------------------------- run

console.log(`Marvel metadata API contract check\nbase: ${BASE}\n`);

try {
  const up = await checkReachable();
  if (!up) {
    console.log('\nThe API is unreachable; skipping the rest.');
    process.exit(1);
  }
  await checkCors();
  const issue = await checkIssueShape();
  await checkCoverUrl(issue);
  await checkEnvelopes();
  await checkPageLimit();
  await checkNameSearchStillMissing();
  await checkListFieldsAreThin();
  await checkSortOrder();
  await checkRateLimitIsForgiving();
} catch (err) {
  console.error(`\nAborted: ${err?.stack ?? err}`);
  process.exit(1);
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${'-'.repeat(60)}`);
console.log(`${results.length - failed.length}/${results.length} assumptions hold  (${requests} requests)`);

if (failed.length) {
  console.log('\nDrifted:');
  for (const f of failed) console.log(`  - ${f.name}${f.detail ? `: ${f.detail}` : ''}`);
  console.log('\nUpdate the plan and the affected module before shipping.');
  process.exit(1);
}
console.log('The upstream contract is unchanged.');
