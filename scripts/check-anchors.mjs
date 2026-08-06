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

// Backticked path:line or path:start-end.
const ANCHOR = /`([A-Za-z0-9_./-]+\.(?:js|mjs|css|html|json|yml|md)):(\d+)(?:-(\d+))?`/g;

// The same citation without backticks. The Evidence column of the backlog table is
// written this way, and those are live anchors, not decoration: they are the entry
// point an implementer navigates to for work not yet started, read by someone who
// cannot tell that the anchor is lying. Gating them on punctuation would enroll or
// exempt rows by accident in both directions, so both forms are collected and the
// exemption is declared instead.
const BARE = /(?<![`\w])([A-Za-z0-9_./-]+\.(?:js|mjs|css|html|json|yml|md)):(\d+)(?:-(\d+))?(?![\d`-])/g;

// The declared exemption. A claim about a past state cites code that is expected to
// contradict it: BL-040 cites the scripts block as evidence that no lint script
// existed, and that block now defines one. Gating it would demand a true historical
// record be falsified. The marker states the intent in the text, so a new historical
// claim written without it fails loudly, which is the right direction to fail in.
// Its reach is computed in exemptRanges below.


// Citation-shaped text neither regex collects. This is the one hole the coverage
// assertion cannot see, because that assertion counts the same regexes twice.
// It cannot be an error, since prose may legitimately name a file, so it prints as
// a notice: a reviewer can tell an intentional mention from a citation that was
// meant to be gated and is silently not.
const NEAR_MISS = [
  [/`[A-Za-z0-9_./-]+\.[A-Za-z][A-Za-z0-9]*:\d+(?:-\d+)?`/g, 'extension outside the gate'],
  [/\b[A-Za-z0-9_./-]+\.(?:js|mjs|css|html|json|yml|md)\s+lines?\s+\d+/gi, 'prose line reference'],
];


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

// Whether a citation is a claim about a past state. The marker's reach is the
// backticked token it opens, or the table cell it begins, and no further. Letting it
// reach to end of line would exempt live anchors that merely follow one: the release
// row cites `absent: CHANGELOG.md and git tags` and then cites two live anchors after
// it, and a line-wide rule silently drops both.
function exemptRanges(text) {
  const ranges = [];

  // A backticked evidence token, which may wrap across lines.
  for (const m of text.matchAll(/`([^`]*)`/g)) {
    if (/^\s*absent:/.test(m[1])) ranges.push([m.index, m.index + m[0].length]);
  }

  // An unbackticked table cell that begins with the marker.
  let offset = 0;
  for (const line of text.split('\n')) {
    if (line.startsWith('|')) {
      let from = 1;
      for (;;) {
        const bar = line.indexOf('|', from);
        const cell = line.slice(from, bar === -1 ? line.length : bar);
        if (/^\s*absent:/.test(cell)) ranges.push([offset + from, offset + from + cell.length]);
        if (bar === -1) break;
        from = bar + 1;
      }
    }
    offset += line.length + 1;
  }
  return ranges;
}

// Both citation forms, deduplicated by position. A backticked anchor can also
// satisfy the bare pattern's neighbours, and counting one citation twice would put
// the coverage assertion permanently out of balance.
function citations(text) {
  const out = new Map();
  for (const re of [ANCHOR, BARE]) {
    for (const m of text.matchAll(re)) {
      const at = m[0].startsWith('`') ? m.index + 1 : m.index;
      if (out.has(at)) continue;
      out.set(at, { at, file: m[1], start: Number(m[2]), end: m[3] ? Number(m[3]) : Number(m[2]) });
    }
  }
  return [...out.values()].sort((a, b) => a.at - b.at);
}

// Naming only, never membership. A heuristic here is safe by construction: the worst
// it can do is give an anchor an uglier or less stable key, and the anchor is still
// collected and still checked. That is the whole point of the inversion, and it is
// why this may read the first cells of a row when the collector may not.
//
// The heading is part of the row's identity because a story ID is not unique across
// the document: BL-028 heads a row in the verification table and another in the
// backlog table. Keying on the ID alone merges them into one ordinal bucket, and then
// inserting a citation into either row renumbers the other and reports drift that did
// not happen. Spurious drift is the expensive kind, because it trains a re-bless
// reflex, and a reflexive re-bless is how a real drift gets waved through.
function rowScope(line, heading) {
  const cells = line.split('|').slice(1);
  const id = /\bBL-\d+\b/.exec(cells.slice(0, 2).join(' ').replace(/`/g, ''));
  const label = id ? id[0] : slug((cells[0] ?? '').replace(/`/g, ''));
  return label ? `${heading}#${label}` : heading;
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
  let exempted = 0;

  for (const doc of docs()) {
    const raw = read(doc);
    if (raw === null) continue;

    // Normalised so a character offset means the same thing on either platform.
    const text = raw.replace(/\r\n/g, '\n');
    const ranges = exemptRanges(text);
    const exempt = (at) => ranges.some(([from, to]) => at >= from && at < to);

    // Counted over the whole file, independently of the line walk below, so any
    // walker bug shows up as a shortfall instead of as a clean pass.
    const scanned = citations(text).filter((c) => !exempt(c.at)).length;
    if (scanned === 0) continue;

    let heading = 'preamble';
    let captured = 0;
    let offset = 0;
    const ordinals = new Map();

    for (const line of text.split('\n')) {
      const h = /^#{1,6}\s+(.+?)\s*$/.exec(line);
      if (h) heading = slug(h[1]);

      const scope = line.startsWith('|') ? rowScope(line, heading) : heading;

      for (const c of citations(line)) {
        if (exempt(offset + c.at)) {
          exempted += 1;
          continue;
        }
        const anchor = `${c.file}:${c.start}${c.end === c.start ? '' : `-${c.end}`}`;
        // The ordinal is scoped to the whole anchor, not to the file. Scoping it to the
        // file lets two different anchors share a bucket, so deleting one renumbers the
        // other into its slot and the gate compares it against a fingerprint that was
        // never its own. That is reported as drift, complete with a "blessed" line
        // asserting the anchor once pointed at code it never pointed at: a fabricated
        // detail whose credibility comes from the true details printed beside it.
        // Keying on the anchor means two entries in a bucket cite identical lines and
        // therefore carry identical fingerprints, so a renumber cannot manufacture a
        // mismatch. The defect is removed by construction rather than by care.
        const bucket = `${doc}|${scope}|${anchor}`;
        const ordinal = ordinals.get(bucket) ?? 0;
        ordinals.set(bucket, ordinal + 1);
        captured += 1;
        found.push({
          key: `${bucket}|${ordinal}`,
          anchor,
          claim: line.slice(Math.max(0, c.at - 90), c.at).replace(/`/g, '').trim(),
          ...fingerprint(c.file, c.start, c.end),
        });
      }
      offset += line.length + 1;
    }
    coverage.push({ doc, scanned, captured });
  }
  return { found, coverage, exempted };
}

const { found, coverage, exempted } = collect();

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
  for (const doc of docs()) {
    const text = read(doc);
    if (text === null) continue;
    const covered = new Set(text.match(ANCHOR) ?? []);
    for (const [re, why] of NEAR_MISS) {
      for (const hit of text.match(re) ?? []) {
        if (covered.has(hit)) continue;
        suspicious.push(`  ${doc}  ${hit}  (${why})`);
      }
    }
  }
  if (exempted) {
    console.log(`${exempted} citation(s) exempt by declared "absent:" marker, as claims about a past state.`);
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

// Assert the lock's shape before comparing anything against it. Without this, a lock
// written by a different version of this script compares every real fingerprint against
// undefined and reports drift. That message is loud but wrong in kind: it says N claims
// moved when the truth is that the lock cannot be read, and it sends the reader hunting
// for code movements that never happened. A partial mismatch is the dangerous one, since
// "216 unchanged, 2 drifted" is an ordinary-looking result that invites exactly that hunt.
{
  const entries = Object.entries(lock);
  const malformed = entries.filter(
    ([, v]) => !v || typeof v.fp !== 'string' || typeof v.anchor !== 'string',
  );
  if (entries.length && malformed.length) {
    console.error(
      `FATAL: cannot read ${LOCK}. ${malformed.length} of ${entries.length} entr(ies) lack a ` +
        'string "fp" or "anchor", so this lock was written by a different version of this ' +
        'script. Refusing to compare, because every comparison would report drift that has ' +
        'not happened. Re-bless, or check out a matching lock.',
    );
    for (const [k] of malformed.slice(0, 4)) console.error(`  ${k}`);
    if (malformed.length > 4) console.error(`  ... and ${malformed.length - 4} more`);
    process.exit(2);
  }
}

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

// A lost anchor is a claim that can no longer be checked, which is not the same as a
// claim with nothing to report. Coverage cannot see this, because it counts what each
// surviving document still has: delete a document and every remaining one reports a
// perfect score while its anchors leave the gate entirely. Renaming one is the
// plausible version, and it reads as a clean sweep of additions rather than as a loss.
//
// Which losses matter is deliberately not judged here. Failing only when a whole
// document disappears would be a heuristic about significance, and heuristics about
// which anchors are worth counting are exactly how this gate once covered 37 of 193.
const corpus = new Set(docs());
const goneByDoc = new Map();
for (const k of gone) {
  const doc = k.split('|')[0];
  if (!goneByDoc.has(doc)) goneByDoc.set(doc, []);
  goneByDoc.get(doc).push(k);
}

const cov = coverage.map((c) => `${c.doc} ${c.captured}/${c.scanned}`).join(', ');

// An anchor that was re-aimed appears as one addition and one loss, because the anchor
// text is part of the key. Reported as two unrelated events that is true but illegible:
// pointing this gate at the commit where these citations were born prints 112 additions
// and 137 losses and zero drift, so a reader running the documented historical check
// concludes it cannot see the breakage it was built for. Pairing them back up restores
// the blessed-versus-now reading without restoring the defect, because the pairing is
// presentation only and never makes two anchors compare equal. It is deliberately
// refused unless a scope holds exactly one addition and one loss for the same file,
// since a guess about which removal explains which addition is the kind of corroborating
// detail that makes a wrong report persuasive.
const fileOf = (a) => String(a).split(':')[0];
const bucketOf = (k, file) => `${k.split('|')[0]}|${k.split('|')[1]}|${file}`;
const newBy = new Map();
for (const u of unkeyed) {
  const b = bucketOf(u.key, fileOf(u.anchor));
  if (!newBy.has(b)) newBy.set(b, []);
  newBy.get(b).push(u);
}
const goneBy = new Map();
for (const k of gone) {
  const b = bucketOf(k, fileOf(lock[k].anchor));
  if (!goneBy.has(b)) goneBy.set(b, []);
  goneBy.get(b).push(k);
}
const reaimed = [];
const pairedNew = new Set();
const pairedGone = new Set();
for (const [b, ns] of newBy) {
  const gs = goneBy.get(b);
  if (!gs || ns.length !== 1 || gs.length !== 1) continue;
  reaimed.push({ from: gs[0], to: ns[0] });
  pairedNew.add(ns[0].key);
  pairedGone.add(gs[0]);
}

console.log(`${unchanged} unchanged, ${drifted.length} drifted, ${unkeyed.length} new, ${gone.length} removed`);
if (reaimed.length) {
  console.log(`of which ${reaimed.length} pair as re-aimed anchors, one addition against one loss`);
}
console.log(`coverage: ${cov}\n`);

for (const r of reaimed) {
  console.log(`RE-AIM ${r.to.key}`);
  console.log(`  claim   : ${r.to.claim}`);
  console.log(`  was     : ${lock[r.from].anchor}  ->  ${lock[r.from].head}`);
  console.log(`  now     : ${r.to.anchor}  ->  ${r.to.head ?? `(${r.to.why})`}`);
  console.log('');
}

for (const d of drifted) {
  console.log(`DRIFT  ${d.key}`);
  console.log(`  claim   : ${d.claim}`);
  console.log(`  anchor  : ${d.anchor}`);
  console.log(`  blessed : ${d.want.head}`);
  console.log(`  now says: ${d.head ?? `(${d.why})`}`);
  console.log('');
}

for (const u of unkeyed) {
  if (pairedNew.has(u.key)) continue;
  console.log(`NEW    ${u.key}  ${u.anchor}`);
  console.log(`  now says: ${u.head ?? `(${u.why})`}`);
  console.log('');
}

for (const [doc, all] of goneByDoc) {
  const keys = all.filter((k) => !pairedGone.has(k));
  if (!keys.length) continue;
  const absent = corpus.has(doc) ? '' : ', and the document itself is absent from the corpus';
  console.log(`GONE   ${doc}: ${keys.length} blessed anchor(s) no longer collected${absent}`);
  for (const k of keys.slice(0, 4)) console.log(`  ${lock[k].anchor}  ${k}`);
  if (keys.length > 4) console.log(`  ... and ${keys.length - 4} more`);
  console.log('');
}

if (drifted.length || unkeyed.length) {
  console.log('Re-read the cited lines and confirm they still say what the claim says.');
  console.log('Only then re-bless: npm run anchors:bless');
}
if (gone.length) {
  console.log('A blessed claim is no longer being checked. Confirm the claim was meant to');
  console.log('go, rather than its document being renamed or moved out of the corpus, and');
  console.log('only then re-bless: npm run anchors:bless');
}

reportNearMisses();

process.exitCode = drifted.length || unkeyed.length || gone.length ? 1 : 0;
