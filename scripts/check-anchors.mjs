// Evidence anchors are `file:line` citations that resolve forever. Nothing fails
// when the code moves out from under one, so a wrong anchor reads exactly like a
// right one and only a human re-reading the cited lines can tell them apart.
//
// This gate makes that mechanical. It fingerprints the cited *code* rather than
// the line number, so a correct re-aim preserves the fingerprint and drift breaks
// it, and it fails in the commit that causes the breakage instead of in a sweep
// months later.
//
//   node scripts/check-anchors.mjs            check the working tree
//   node scripts/check-anchors.mjs --bless    record the current state
//   node scripts/check-anchors.mjs --ref REF  read that revision instead
//
// What it cannot do: decide whether an anchor was right in the first place. Bless
// a wrong anchor and it stays blessed. The gain is that a human reads each anchor
// once, when it is introduced or when its code changes, rather than once per
// sweep across the whole corpus.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const LOCK = 'docs/anchors.lock.json';

// Backticked path:line or path:start-end. Historical citations are deliberately
// written without backticks so that they are not treated as live anchors.
const ANCHOR = /`([A-Za-z0-9_./-]+\.(?:js|mjs|css|html|json|yml|md)):(\d+)(?:-(\d+))?`/g;

// Citation-shaped text the ANCHOR regex does not collect. This is the one hole the
// coverage assertion cannot see, because that assertion counts the same regex twice.
//
// Unbackticked citations are counted but never listed. They are the deliberate
// convention for historical evidence, there are around two hundred, and printing
// them trains a reader to skip the whole notice. The count is shown so a sudden
// jump is still visible. The other shapes should be zero, so they are listed.
const NEAR_MISS = [
  [/`[A-Za-z0-9_./-]+\.[A-Za-z][A-Za-z0-9]*:\d+(?:-\d+)?`/g, 'extension outside the gate'],
  [/\b[A-Za-z0-9_./-]+\.(?:js|mjs|css|html|json|yml|md)\s+lines?\s+\d+/gi, 'prose line reference'],
];
const HISTORICAL = /(?<!`)\b[A-Za-z0-9_./-]+\.(?:js|mjs|css|html|json|yml|md):\d+(?:-\d+)?(?![\d`-])/g;


const args = process.argv.slice(2);
const bless = args.includes('--bless');
const ref = args.includes('--ref') ? args[args.indexOf('--ref') + 1] : null;

const read = (path) => {
  if (ref === null) {
    try {
      return readFileSync(path, 'utf8');
    } catch {
      return null;
    }
  }
  try {
    return execFileSync('git', ['show', `${ref}:${path}`], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch {
    return null;
  }
};

const cache = new Map();
const linesOf = (path) => {
  if (!cache.has(path)) {
    const text = read(path);
    cache.set(path, text === null ? null : text.split(/\r?\n/));
  }
  return cache.get(path);
};

// Trimmed, with blank lines dropped, so reindentation and trailing-whitespace
// churn do not raise false alarms while a genuine edit still does.
function fingerprint(file, start, end) {
  const lines = linesOf(file);
  if (lines === null) return { fp: null, why: 'file missing' };
  if (end > lines.length) return { fp: null, why: `out of range, file has ${lines.length} lines` };
  const body = lines.slice(start - 1, end).map((s) => s.trim()).filter(Boolean).join('\n');
  if (!body) return { fp: null, why: 'resolves to blank lines only' };
  return {
    fp: createHash('sha256').update(body).digest('hex').slice(0, 16),
    head: body.split('\n')[0].slice(0, 100),
  };
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

// Every tracked Markdown file, listed by git rather than by this script. Membership
// in the population must not depend on a name written here: an enumeration is a
// list someone has to keep complete, and the anchor defects this gate exists to
// catch were all caused by exactly that.
function docs() {
  // No pathspec. `ls-tree` and `ls-files` do not agree on how a bare `*.md`
  // pathspec matches nested paths, and filtering in one place here is one fewer
  // behaviour that can differ between the working tree and a historical ref.
  const cmd = ref === null
    ? ['ls-files']
    : ['ls-tree', '-r', '--name-only', ref];
  try {
    return execFileSync('git', cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.endsWith('.md'))
      .sort();
  } catch {
    return [];
  }
}

// The scope is what makes a key survive renumbering. Rows are keyed by their story
// ID wherever the ID appears in the row, because the three tables in the backlog
// put it in three different columns, and a matcher that assumes one column is the
// defect this gate exists to catch. Prose is keyed by its nearest heading.
//
// Structure decides only the *name*. It never decides membership: an anchor whose
// shape the walker misreads still gets collected, it just gets an uglier key. That
// inversion is what stops a new row shape from silently leaving anchors uncovered.
function collect() {
  const found = [];
  const coverage = [];

  for (const doc of docs()) {
    const text = read(doc);
    if (text === null) continue;

    // Counted over the whole file, independently of the line walk below, so any
    // walker bug shows up as a shortfall instead of as a clean pass.
    const scanned = (text.match(ANCHOR) ?? []).length;
    if (scanned === 0) continue;

    let heading = 'preamble';
    let captured = 0;
    const ordinals = new Map();

    for (const line of text.split(/\r?\n/)) {
      const h = /^#{1,6}\s+(.+?)\s*$/.exec(line);
      if (h) heading = slug(h[1]);

      const id = /\bBL-\d+\b/.exec(line.replace(/`/g, ''));
      const scope = line.startsWith('|') && id ? id[0] : heading;

      for (const m of line.matchAll(ANCHOR)) {
        const file = m[1];
        const start = Number(m[2]);
        const end = m[3] ? Number(m[3]) : start;
        const bucket = `${doc}|${scope}|${file}`;
        const ordinal = ordinals.get(bucket) ?? 0;
        ordinals.set(bucket, ordinal + 1);
        captured += 1;
        found.push({
          key: `${bucket}|${ordinal}`,
          anchor: m[0].replace(/`/g, ''),
          claim: line.slice(Math.max(0, m.index - 90), m.index).replace(/`/g, '').trim(),
          ...fingerprint(file, start, end),
        });
      }
    }
    coverage.push({ doc, scanned, captured });
  }
  return { found, coverage };
}

const { found, coverage } = collect();

// Coverage is asserted, not assumed. `found.length === 0` detects total failure and
// is structurally blind to partial failure, which is the only kind that has ever
// happened here: a collector that reads one table shape returns a large number and
// sails past a zero check while ignoring four fifths of the corpus.
//
// Both counts come from the same regex, so this is a regression guard on the walk
// rather than an independent measurement. That is worth having, because the walk is
// precisely what broke, but it cannot see a citation the regex itself does not
// know. The near-miss report below is the partial answer to that.
const short = coverage.filter((c) => c.captured !== c.scanned);
if (short.length) {
  console.error(`FATAL: collector under-matched${ref ? ` at ${ref}` : ''}:`);
  for (const c of short) console.error(`  ${c.doc}: scanned ${c.scanned}, captured ${c.captured}`);
  process.exit(2);
}

// A collector that silently matches nothing reports a clean pass, which is exactly
// the failure this gate exists to prevent. Refuse to run rather than reassure.
if (found.length === 0) {
  console.error(`FATAL: found 0 anchors${ref ? ` at ${ref}` : ''}.`);
  console.error('The collector matched nothing. That is a broken instrument, not a clean result.');
  process.exit(2);
}

const dupes = found.map((f) => f.key).filter((k, i, all) => all.indexOf(k) !== i);
if (dupes.length) {
  console.error(`FATAL: ${dupes.length} duplicate key(s), so the lock cannot be trusted:`);
  for (const k of new Set(dupes)) console.error(`  ${k}`);
  process.exit(2);
}

// Citation-shaped text the ANCHOR regex does not collect. This is the one hole the
// coverage assertion cannot see, because that assertion counts the same regex twice.
// It cannot be an error, since prose may legitimately name a file, so it prints as
// a notice: a reviewer can tell an intentional mention from a citation that was
// meant to be gated and is silently not.
function reportNearMisses() {
  const suspicious = [];
  let historical = 0;
  for (const doc of docs()) {
    const text = read(doc);
    if (text === null) continue;
    const covered = new Set(text.match(ANCHOR) ?? []);
    historical += (text.match(HISTORICAL) ?? []).length;
    for (const [re, why] of NEAR_MISS) {
      for (const hit of text.match(re) ?? []) {
        if (covered.has(hit)) continue;
        suspicious.push(`  ${doc}  ${hit}  (${why})`);
      }
    }
  }
  if (historical) {
    console.log(`\n${historical} unbackticked citation(s) outside the gate, by convention: historical evidence.`);
  }
  if (suspicious.length) {
    console.log('NOTICE: citation-shaped strings the gate does not collect. Meant to be anchors?');
    for (const s of suspicious.slice(0, 12)) console.log(s);
    if (suspicious.length > 12) console.log(`  ... and ${suspicious.length - 12} more`);
  }
}

if (bless) {
  const unresolvable = found.filter((f) => f.fp === null);
  if (unresolvable.length) {
    console.error(`FATAL: refusing to bless ${unresolvable.length} anchor(s) that do not resolve:`);
    for (const u of unresolvable) console.error(`  ${u.key}  ${u.anchor}  (${u.why})`);
    process.exit(2);
  }
  const lock = {};
  for (const f of found.sort((a, b) => a.key.localeCompare(b.key))) {
    lock[f.key] = { anchor: f.anchor, fp: f.fp, head: f.head };
  }
  writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`);
  const cov = coverage.map((c) => `${c.doc} ${c.captured}`).join(', ');
  console.log(`Blessed ${found.length} anchors across ${coverage.length} docs (${cov}) -> ${LOCK}`);
  reportNearMisses();
  process.exit(0);
}

// The lock always comes from the working tree. Reading it through --ref would make
// the gate unusable against any revision that predates the lock, which is exactly
// the revision you want to point it at when checking whether it would have caught
// a past breakage.
let raw = null;
try {
  raw = readFileSync(LOCK, 'utf8');
} catch {
  raw = null;
}
if (raw === null) {
  console.error(`FATAL: ${LOCK} is missing. Run with --bless to create it.`);
  process.exit(2);
}
const lock = JSON.parse(raw);

let unchanged = 0;
const drifted = [];
const unkeyed = [];

for (const f of found) {
  const want = lock[f.key];
  if (!want) {
    unkeyed.push(f);
    continue;
  }
  // Never let two unresolvable anchors compare equal. null === null would pass an
  // anchor that points off the end of the file in both revisions.
  if (f.fp !== null && f.fp === want.fp) {
    unchanged += 1;
    continue;
  }
  drifted.push({ ...f, want });
}

const seen = new Set(found.map((f) => f.key));
const gone = Object.keys(lock).filter((k) => !seen.has(k));

const cov = coverage.map((c) => `${c.doc} ${c.captured}/${c.scanned}`).join(', ');
console.log(`${unchanged} unchanged, ${drifted.length} drifted, ${unkeyed.length} new, ${gone.length} removed`);
console.log(`coverage: ${cov}\n`);

for (const d of drifted) {
  console.log(`DRIFT  ${d.key}`);
  console.log(`  claim   : ${d.claim}`);
  console.log(`  anchor  : ${d.anchor}`);
  console.log(`  blessed : ${d.want.head}`);
  console.log(`  now says: ${d.head ?? `(${d.why})`}`);
  console.log('');
}

for (const u of unkeyed) {
  console.log(`NEW    ${u.key}  ${u.anchor}`);
  console.log(`  now says: ${u.head ?? `(${u.why})`}`);
  console.log('');
}

if (drifted.length || unkeyed.length) {
  console.log('Re-read the cited lines and confirm they still say what the claim says.');
  console.log('Only then re-bless: npm run anchors:bless');
}

reportNearMisses();

process.exitCode = drifted.length || unkeyed.length ? 1 : 0;
