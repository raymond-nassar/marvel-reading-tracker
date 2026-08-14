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
//
// That one reading is the weak point, so `--bless` prints the reading rather than
// trusting anyone to assemble it: every citation whose blessed line is changing,
// one line each, with the prose that cites the line beside the line itself. One
// line each rather than one per anchor, because two citations re-aimed onto the
// same line is the shape that got a false claim blessed here once already.
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

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

// A line number written with no path in front of it, as a backticked colon and digits,
// leaning on a full citation earlier in the sentence to say which file it means. Neither
// regex above collects it, because both begin at a filename, so a comment could name a
// line, be read as naming a line, and drift with nothing watching. That is the defect
// BL-071 was raised to end, surviving inside the widening that ended it, and one of the
// two that existed had already gone stale by thirteen lines before anyone noticed.
//
// BL-077 asked whether to resolve this form against the nearest preceding full path or to
// forbid it, and the answer is to forbid it, for three reasons that all point one way.
// Detection is needed either way, so the choice is only what to do with a hit, and
// resolution decides *which file* the claim is about. Every other heuristic here is
// confined to naming or printing, never membership, precisely because a wrong guess there
// costs an uglier key and a wrong guess about a path costs a false claim. Resolution would
// also write into the lock an anchor whose citation text cannot be found in the document
// that supposedly makes it, since the string it records was never written there. And the
// form is unreadable to a person for the same reason it is unreadable to the gate: read as
// a search hit, in a diff, or in the lock's own quoted head line, a bare line number names
// nothing. Resolving it would serve the gate and not the reader, and the reader is who
// this is for.
//
// Written out longhand above rather than shown, because this rule cannot be illustrated by
// example without breaking itself. The first draft of this comment used one and the check
// below caught it twice within a minute of being written, which is the shortest interval
// between a gate and its author in this repository and the best evidence it works.
const RELATIVE = /`(:\d+(?:-\d+)?)`/g;

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

// A NUL byte means the file is not text, which is how git itself decides. Deciding by
// extension instead would be the enumeration `docs` above refuses, and it would have
// to be kept in step with whatever gets committed next.
const isBinary = (text) => text.includes('\0');

const read = (path) => {
  if (ref === null) {
    try {
      const text = readFileSync(path, 'utf8');
      return isBinary(text) ? null : text;
    } catch {
      return null;
    }
  }
  try {
    const text = execFileSync('git', ['show', `${ref}:${path}`], {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    return isBinary(text) ? null : text;
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

// Whether a range begins or ends on a blank line, which is the one defect in a range
// that reading the bless print cannot catch. `fingerprint` drops blank lines before it
// takes `head` and `tail`, so a range written one line too wide prints the first line
// that has content in it, reads perfectly against its claim, and is blessed a line
// wider than the claim it stands for. The reader is shown the correct line and the
// wrong range, and there is nothing in the print to tell them apart.
//
// A single-line anchor cannot reach here, because a blank one resolves to no body at
// all and `fingerprint` already refuses it as blank lines only.
export function blankEdgeOf(lines, start, end) {
  if (end <= start) return null;
  const first = String(lines[start - 1] ?? '').trim() === '';
  const last = String(lines[end - 1] ?? '').trim() === '';
  if (first && last) return 'begins and ends on a blank line';
  if (first) return 'begins on a blank line';
  if (last) return 'ends on a blank line';
  return null;
}

// Trimmed, with blank lines dropped, so reindentation and trailing-whitespace
// churn do not raise false alarms while a genuine edit still does.
//
// `tail` and `blankEdge` are computed for printing and refusal only. Neither is written
// to the lock: the lock already holds every field a comparison needs, and adding one
// would rewrite all of it for a value nothing compares against.
function fingerprint(file, start, end) {
  const lines = linesOf(file);
  if (lines === null) return { fp: null, why: 'file missing' };
  if (end > lines.length) return { fp: null, why: `out of range, file has ${lines.length} lines` };
  const body = lines.slice(start - 1, end).map((s) => s.trim()).filter(Boolean).join('\n');
  if (!body) return { fp: null, why: 'resolves to blank lines only' };
  const kept = body.split('\n');
  return {
    fp: createHash('sha256').update(body).digest('hex').slice(0, 16),
    head: kept[0].slice(0, 100),
    tail: kept.length > 1 ? kept[kept.length - 1].slice(0, 100) : null,
    blankEdge: blankEdgeOf(lines, start, end),
  };
}

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

// Every tracked file, listed by git rather than by this script. Membership in the
// population must not depend on a name written here: an enumeration is a list someone
// has to keep complete, and the anchor defects this gate exists to catch were all
// caused by exactly that.
//
// The one exclusion is this gate's own lock, and it is structural rather than named.
// LOCK is the path this script writes, so the rule is that the gate does not read its
// own output, and the constant that states where the output goes is the same one that
// keeps it out. Nothing has to stay in step with anything. The lock quotes a head line
// for every anchor, so reading it would turn this gate's record of a claim into a second
// claim about the same line, and rewriting the lock would become a reason to rewrite it
// again. Those quotes happen to carry no backticks, so the rule below would drop them
// anyway, but that is a property of today's data rather than a guarantee.
//
// Binary files are dropped by `read` rather than by extension, for the same reason.
function docs() {
  // No pathspec. `ls-tree` and `ls-files` do not agree on how a bare pathspec matches
  // nested paths, and filtering in one place here is one fewer behaviour that can
  // differ between the working tree and a historical ref.
  const cmd = ref === null
    ? ['ls-files']
    : ['ls-tree', '-r', '--name-only', ref];
  try {
    return execFileSync('git', cmd, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s !== LOCK)
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

// What opens a comment, which the gate has to know because outside Markdown the only text
// addressed to a reader is a comment, and three separate rules turn on that. It was one
// JavaScript-shaped pattern written out three times, plus a fourth that strips the opener,
// and the corpus is not all JavaScript: `git ls-files` reaches 55 .js files but also 31
// .json, 11 .mjs, 9 .html, 3 .css, a .yml, a .gitignore, a .cmd and a LICENSE. A workflow
// comment, an HTML comment and a .gitignore comment were all read as program text.
//
// Keyed on the path rather than unioned into one pattern, because the syntaxes disagree.
// A hash opens a comment in YAML and a private class field in JavaScript, and two files
// here already open with a hashbang, at `scripts/check-contract.mjs:1` and
// `scripts/vendor-index.mjs:1`. A union would read all three as prose and `strip` would
// splice the remainder of a future `#count = 0;` into a claim. Keying on the path also
// makes the single definition worth having: a caller that hands over a path gets the
// right answer for that file rather than the union of every file.
//
// JSON answers "none" rather than falling through to the default, because a string value
// beginning with an asterisk is data and not a sentence. Verified as a no-op today: no
// tracked .json line matches the default pattern. LICENSE keeps the default for the same
// reason in reverse. It has no comment syntax, but it has no leading-asterisk line and no
// citation either, so inventing one for it would be a rule with no case to answer.
export const PROSE = { prose: true, open: null, strip: null, close: null };

const SYNTAX = {
  slash: {
    prose: false,
    open: /^\s*(?:\/\/|\/\*|\*)/,
    strip: /^\s*(?:\/\/+|\/\*+|\*)\s?/,
    close: /\s*\*\/\s*$/,
  },
  hash: { prose: false, open: /^\s*#/, strip: /^\s*#+\s?/, close: null },
  angle: {
    prose: false,
    open: /^\s*(?:<!--|\/\/|\/\*|\*)/,
    strip: /^\s*(?:<!-+|\/\/+|\/\*+|\*)\s?/,
    close: /\s*(?:-+!?>|\*\/)\s*$/,
  },
  batch: { prose: false, open: /^\s*(?:::|rem\b)/i, strip: /^\s*(?:::+|rem\b)\s?/i, close: null },
  none: { prose: false, open: null, strip: null, close: null },
};

export function commentSyntax(path) {
  const name = path.replace(/^.*[\\/]/, '');
  const ext = /\.([^.]+)$/.exec(name)?.[1]?.toLowerCase() ?? name.toLowerCase();
  if (ext === 'md') return PROSE;
  if (ext === 'yml' || ext === 'yaml' || name === '.gitignore') return SYNTAX.hash;
  if (ext === 'html' || ext === 'htm') return SYNTAX.angle;
  if (ext === 'json') return SYNTAX.none;
  if (ext === 'cmd' || ext === 'bat') return SYNTAX.batch;
  return SYNTAX.slash;
}

// Where the relative form counts, which is the same split BL-071 drew and for the same reason.
// In Markdown every line is addressed to a reader, so a relative citation anywhere in one is a
// claim. In code only a comment is, and the rest is a program: this gate's own test builds its
// fixtures out of exactly this shape, and a rule that read string literals would fail on the
// tests written to prove the rule. Being in a comment is the only signal the text carries, so
// it is the one this draws on, as `reportNearMisses` already does for the bare form.
export function relativeCitations(text, syntax = PROSE) {
  const out = [];
  text.split('\n').forEach((line, i) => {
    if (!syntax.prose && !(syntax.open?.test(line) ?? false)) return;
    for (const m of line.matchAll(RELATIVE)) {
      out.push({ line: i + 1, at: m.index, ref: m[1], text: line.trim() });
    }
  });
  return out;
}

// What to do about a hit, which depends entirely on whether the text can still be edited.
// Against the working tree the form is refused, because that is a tree someone is writing and
// the rule is about what may be written. Under --ref the content already shipped and cannot be
// rewritten to satisfy a rule adopted after it, so refusing would make every revision holding
// the form unqueryable for drift, which is the one use --ref exists for. History is reported,
// not policed. Named and exported rather than left inline so the distinction can be pinned by
// a test without spawning a process against a real revision.
export function relativeVerdict(count, ref = null) {
  if (count === 0) return 'none';
  return ref === null ? 'fatal' : 'notice';
}

// Both citation forms in prose, deduplicated by position. A backticked anchor can also
// satisfy the bare pattern's neighbours, and counting one citation twice would put the
// coverage assertion permanently out of balance.
//
// Outside prose only the backticked form is collected. That is the opposite call from
// the one above and it is made for the same reason, which is to collect the form that
// asserts something to a reader. In Markdown both forms do, because the backlog's
// Evidence column is written bare and those are live anchors. In code the two forms
// separate by role rather than by punctuation: a backticked path:line sits in a
// comment, where it is prose making a claim, and a bare one sits inside a string
// literal, where it is a value the program computes with.
//
// Measured across this repository when the population was widened, the split was
// exact, and the one file holding bare citations is this gate's own test, where they
// are synthetic inputs. One of them names a line past the end of its file on purpose,
// so the unresolvable path has something to resolve to nothing. Collecting it would
// require the fixture to resolve, which is the single thing it exists not to do.
export function citations(text, syntax = PROSE) {
  const out = new Map();
  for (const re of syntax.prose ? [ANCHOR, BARE] : [ANCHOR]) {
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

// The prose immediately before a citation, which is what the reader has to weigh the
// cited line against. Prose wraps, so a citation frequently opens a line and the
// sentence making the claim ends on the line above. Reading only the current line lost
// that entirely for 76 of the 411 citations blessed at the time, better than one in five, and
// a print that offers no claim for one citation in five cannot be read against its line
// at all. So walk back over the wrapped lines of the same paragraph. A blank line, a
// heading and a table row all end the sentence rather than continue it, so each stops
// the walk: crossing a table row would attribute the row above's prose to this row.
//
// Outside prose the sentence is carried by a comment, which changes two things. The
// marker opening each line is not part of the claim, so leaving it in splices "//" into
// the middle of a sentence and spends the window on punctuation; it is stripped, and
// only outside prose, because a leading "*" in Markdown is a bullet and a "#" is a
// heading. And the walk stops at the first line that is not itself a comment, so a
// comment sitting directly on top of code cannot absorb the code above it.
//
// The heading test is scoped to prose for the same reason, and finding that it was not
// is what made this one change rather than two. A YAML comment necessarily opens with a
// hash and a space, so an unscoped heading test ends the walk on the very lines that
// widening the comment syntax was meant to let it read. Recognising them and then
// terminating on them is a half fix that looks finished. Scoping is safe in the other
// direction because no .js, .mjs or .css line can begin with a hash and a space.
//
// Everything here decides print only, never membership or fingerprint, so a heuristic
// is safe the same way the scope heuristic is: the worst it can do is print an uglier
// claim, and the claim is still printed beside its line.
export function claimBefore(lines, i, at, syntax = PROSE) {
  const flatten = (s) => s.replace(/`/g, '').replace(/\s+/g, ' ').trim();
  const bare = (s) => (syntax.prose || !syntax.strip
    ? s
    : s.replace(syntax.strip, '').replace(syntax.close ?? /(?:)$/, ''));
  const marked = (s) => syntax.open?.test(s) ?? false;
  const ends = (s) => !s.trim() || s.startsWith('|') || (syntax.prose && /^#{1,6}\s/.test(s))
    || (!syntax.prose && (!marked(s) || !flatten(bare(s))));

  let text = bare(lines[i].slice(0, at));
  for (let j = i - 1; j >= 0 && flatten(text).length < 90; j -= 1) {
    const prev = lines[j];
    if (ends(prev)) break;
    if (lines[i].startsWith('|')) break;
    text = `${bare(prev)} ${text}`;
  }
  const flat = flatten(text);
  if (flat.length >= 20) return flat.slice(Math.max(0, flat.length - 90));

  // A citation in prose usually closes a sentence, so the words before it are the claim.
  // One in a comment routinely opens the sentence instead, and then everything before it
  // is the marker: the citation of the served root in the shipped-copy test printed a
  // claim of "//" and nothing else. Where almost nothing precedes a citation, what
  // follows it is the claim, taken from the citation outwards for the same reason the
  // other branch is taken backwards from it.
  //
  // This one is not conditioned on prose, unlike the two above, and deliberately so: a
  // Markdown citation that opens its line has the same empty claim for the same reason,
  // and six did, three of them printing "Evidence:" and one printing nothing at all. The
  // anchor itself is skipped, because a claim that only repeats the citation printed on
  // the line above it says nothing. A table row is the one place the two directions
  // differ. Backwards a row is refused outright; forwards a cell boundary ends the
  // sentence exactly as a row boundary does, so the read stops at the next pipe and
  // never leaves the row.
  const row = lines[i].startsWith('|');
  const rest = lines[i].slice(at);
  const self = rest.match(/^`?[A-Za-z0-9_./-]+\.[A-Za-z][A-Za-z0-9]*:\d+(?:-\d+)?`?/);
  let after = bare(self ? rest.slice(self[0].length) : rest);
  if (row) [after] = after.split('|');
  for (let j = i + 1; !row && j < lines.length && flatten(after).length < 90; j += 1) {
    if (ends(lines[j])) break;
    after = `${after} ${bare(lines[j])}`;
  }
  const tail = flatten(after);
  return tail.length > flat.length ? tail.slice(0, 90) : flat.slice(Math.max(0, flat.length - 90));
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
    const syntax = commentSyntax(doc);
    const ranges = exemptRanges(text);
    const exempt = (at) => ranges.some(([from, to]) => at >= from && at < to);

    // Counted over the whole file, independently of the line walk below, so any
    // walker bug shows up as a shortfall instead of as a clean pass.
    const scanned = citations(text, syntax).filter((c) => !exempt(c.at)).length;
    if (scanned === 0) continue;

    let heading = 'preamble';
    let captured = 0;
    let offset = 0;
    const ordinals = new Map();

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const h = /^#{1,6}\s+(.+?)\s*$/.exec(line);
      if (h) heading = slug(h[1]);

      const scope = line.startsWith('|') ? rowScope(line, heading) : heading;

      for (const c of citations(line, syntax)) {
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
          claim: claimBefore(lines, i, c.at, syntax),
          ...fingerprint(c.file, c.start, c.end),
        });
      }
      offset += line.length + 1;
    }
    coverage.push({ doc, scanned, captured });
  }
  return { found, coverage, exempted };
}

// Every citation whose blessed line is about to change, one record per citation.
//
// The "one record per citation" is the whole of it, and it is why this returns a list
// rather than a map. Blessing accepts the current state wholesale, so the only thing
// standing between a mis-aimed anchor and a permanent false claim is a person reading
// the cited line beside the sentence that cites it. When two citations in one scope
// are re-aimed onto the same line, a report keyed by anchor collapses them into one
// entry, that entry reads perfectly well for whichever claim legitimately belongs
// there, and the other is blessed onto a line that has nothing to do with it. That is
// not hypothetical: it is how BL-058's readAt claim came to cite `lists[k] = {`.
//
// A citation whose fingerprint already matches the lock is left out. It cites the same
// content it was blessed against, so there is nothing new to read, and printing all of
// them would bury the handful that changed under four hundred that did not.
export function pairings(found, lock) {
  const out = [];
  for (const f of found) {
    const was = lock[f.key] ?? null;
    if (was && was.fp === f.fp) continue;
    out.push({
      key: f.key,
      anchor: f.anchor,
      claim: f.claim,
      head: f.head ?? null,
      tail: f.tail ?? null,
      why: f.why ?? null,
      was,
    });
  }
  return out;
}

// The citations this bless is recording against nothing. There is no earlier
// fingerprint for them, so the gate has nothing to compare and reports zero drift
// truthfully while the anchor may name any lines at all. Every anchor defect that has
// survived a bless in this repository was of this shape: BL-077 produced five, and
// three of the five named an entirely different passage.
//
// Both the key and the fingerprint have to be absent, and the second condition is the
// load-bearing one. Re-aiming a citation rewrites its anchor, the anchor is part of the
// key, so a test on the key alone calls every re-aim new and buries the handful that
// are under the dozens that are not. The commit that added this re-aimed 30 citations:
// a key-only test announces all 30, and this one announces none of them.
//
// The fingerprint is matched at the citation's own site rather than across the whole
// corpus, and that narrowing is not fussiness. 176 of the 492 entries blessed at the
// time carried a fingerprint some other entry also carried, and three fingerprints were
// reached by more than one distinct anchor: `src/js/hydrate.js:69` and
// `src/js/hydrate.js:74` are two different guards, one inside the loop over items and
// one after it, written identically. A corpus-wide test reads a brand new claim as
// already checked the moment its lines happen to match any other citation anywhere,
// which in this corpus is the ordinary case rather than an exotic one, and `collisions`
// cannot catch it because that is scoped to a single document, scope and anchor.
//
// Matching at the site keeps the whole of the re-aim suppression, because a re-aim keeps
// its document, its scope and its ordinal and moves only the anchor. Measured both ways
// over the 30 re-aims this arrived with, both rules announce none of them. The ordinal
// belongs in the site for the same reason the mark is asserted per citation rather than
// per anchor: a second citation of a line its scope already cites is a first sighting of
// its own, since nobody has read that sentence against that line however often the line
// has been read.
//
// What the site rule still cannot separate is a genuinely new citation that lands at the
// same site and the same ordinal as a blessed one, on content that blessed one already
// matched. From the lock alone that is indistinguishable from a re-aim, and `collisions`
// does not reach it either, since a different anchor puts it in a different bucket. The
// claim here is therefore the narrow one: every first sighting elsewhere in the corpus is
// announced, not every first sighting anywhere.
const siteOf = (key) => {
  const parts = key.split('|');
  return parts.length === 4 ? `${parts[0]}|${parts[1]}|${parts[3]}` : key;
};

export function firstTime(found, lock) {
  const blessed = new Set(Object.entries(lock).map(([k, e]) => `${siteOf(k)}|${e.fp}`));
  return found.filter(
    (f) => f.fp !== null && !(f.key in lock) && !blessed.has(`${siteOf(f.key)}|${f.fp}`),
  );
}

// Claim text reduced to the words it is made of, so that punctuation, backticks and
// wrapping do not make two renderings of one sentence look like two claims.
const claimShape = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Two citations in one scope that have come to name the same lines while claiming
// different things. Narrowed twice, and both narrowings are load-bearing.
//
// Narrowed to one scope and one anchor, because sharing an anchor across the document
// is ordinary: 92 anchors in the blessed lock are cited more than once, and a notice on
// all of them would be noise. Within a single scope it is rare, at 17 buckets today.
//
// Narrowed again to buckets holding at least one citation this bless is changing,
// because the 17 are all correct and a notice that fires on correct work every time is
// the thing that trains a reflexive re-bless. At rest this prints nothing. It prints on
// the bless that creates the collision, which is the one moment a reader can still act
// on it, and which is exactly when the BL-068 collision was created and waved through.
export function collisions(found, lock) {
  const buckets = new Map();
  for (const f of found) {
    const bucket = f.key.slice(0, f.key.lastIndexOf('|'));
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(f);
  }

  const out = [];
  for (const [bucket, cites] of buckets) {
    if (cites.length < 2) continue;
    // An unreadable claim is unlike everything, itself included. Two citations that both
    // open a paragraph extract no prose at all, and treating those two blanks as equal
    // read as "these citations agree" when nothing had been read: it silently exempted a
    // live bucket, the reading-filters list at lines 25 to 48 cited twice under wholly unlike
    // sentences, from a notice added to catch exactly that shape.
    const shapes = cites.map((c, i) => claimShape(c.claim) || `unreadable ${i}`);
    if (new Set(shapes).size < 2) continue;
    const settled = cites.every((c) => {
      const was = lock[c.key];
      return was && was.fp === c.fp;
    });
    if (settled) continue;
    out.push({ bucket, anchor: cites[0].anchor, claims: cites.map((c) => c.claim) });
  }
  return out;
}

// A citation whose scope alone was renamed, paired back up rather than reported as an
// unrelated addition beside an unrelated loss.
//
// Two conditions, and the second exists because the first is not enough on its own. The
// identity is document, anchor, ordinal and fingerprint together, which sounds decisive
// and is not: the ordinal counts within `doc|scope|anchor`, so two citations of one anchor
// under two different headings both carry ordinal 0, and citing the same lines always
// yields the same fingerprint. 159 of the 504 blessed keys today sit on an identity shared
// with at least one other key, and this very item's own delivery paragraph created such a
// pair. So identity alone would let a genuine loss under one heading be explained away by
// an unrelated new citation of the same lines under another.
//
// The falsifier is that a renamed heading leaves nothing behind. If the old scope is still
// collected somewhere in the document then it was not renamed, whatever else is true, and
// the pair is refused. Run over the history that guard rejects exactly one pair, and that
// one is a citation moved from `item-details` into a newly created `parked` section while
// `item-details` kept a hundred others: a move, which is a loss and an addition, and not a
// rename at all.
//
// Necessary rather than sufficient. A real loss under a heading that genuinely did vanish,
// landing in the same run as an unrelated new citation of those same lines, would still
// pair. Nothing in the lock can separate those, because it stores the anchor and the
// fingerprint but not the claim, so the report cannot even show a reader the two sentences
// disagree. That residue is why this pairs the count of one on each side as well.
//
// The rest is not exotic and not cheap to reason out by hand. Prose scopes are keyed on the
// nearest heading and several headings in the backlog state a rank, so inserting one item
// rewords every heading below it. The heading naming BL-007's rank alone has produced this
// shape twelve times on twenty-four anchors, and filing the item asking for this was the
// twelfth. Two people reasoned their way out of it identically within one hour.
export function scopeRenames(unkeyed, gone, lock, liveScopes = null) {
  const partsOf = (k) => {
    const p = String(k).split('|');
    return { doc: p[0], scope: p[1], anchor: p[2], ordinal: p[3] };
  };
  // Never let two unresolvable anchors match. A null fingerprint means the anchor points
  // at nothing, and two of those are equal only in the sense that neither can be checked.
  const identityOf = (k, fp) => {
    if (fp === null || fp === undefined) return null;
    const { doc, anchor, ordinal } = partsOf(k);
    return `${doc}|${anchor}|${ordinal}|${fp}`;
  };

  const byId = (items, keyOf, fpOf) => {
    const m = new Map();
    for (const it of items) {
      const id = identityOf(keyOf(it), fpOf(it));
      if (id === null) continue;
      if (!m.has(id)) m.set(id, []);
      m.get(id).push(it);
    }
    return m;
  };

  const news = byId(unkeyed, (u) => u.key, (u) => u.fp);
  const losses = byId(gone, (k) => k, (k) => lock[k]?.fp);

  const out = [];
  for (const [id, ns] of news) {
    const gs = losses.get(id);
    if (!gs || ns.length !== 1 || gs.length !== 1) continue;
    const from = partsOf(gs[0]);
    const to = partsOf(ns[0].key);
    // Same scope is not a rename. It cannot arise from this identity today, because an
    // equal key would not be unkeyed, but asserting it here keeps the claim the report
    // makes true of whatever the key format becomes.
    if (from.scope === to.scope) continue;
    if (liveScopes && liveScopes.has(`${from.doc}|${from.scope}`)) continue;
    out.push({
      from: gs[0],
      to: ns[0],
      fromScope: from.scope,
      toScope: to.scope,
    });
  }
  return out;
}

// The gate's verdict, separated from the run that reaches it so it can be asserted.
//
// It is here because of what it has to keep true. A recognised rename is printed as its
// own kind and still counted as an addition and a loss, so a run holding nothing but a
// rename still fails. Absorbing one would let a real loss hide behind a real rename in the
// same run, which is the shape of every defect this gate has caught. That decision lived
// only in the expression below until a review pointed out that the test claiming to defend
// it asserted a pure function had not mutated its arguments, which no change to the verdict
// could ever falsify.
export function failing({ drifted = 0, unkeyed = 0, gone = 0, edged = 0, ref = null }) {
  return Boolean(drifted || unkeyed || gone || (ref === null && edged));
}

// The pairing a reader has to make, printed rather than left to them to assemble. One
// line per citation, and the line carries the claim and the cited line together because
// reading either alone is what the step is trying to stop.
//
// `freshKeys` marks the citations being blessed against nothing, which read exactly
// like the rest and are the only ones where the reading is the whole of the check. They
// are marked in place rather than listed separately because a second list would print
// the same citation twice and leave the reader deciding which copy to read.
//
// Split from the printing so a test can hold the shape. Deduplicating here rather than
// in `pairings` restores the identical defect one layer lower, where an assertion on
// returned records cannot see it, so the assertion is made against these lines instead.
export function pairingLines(pairs, freshKeys = new Set()) {
  if (!pairs.length) return ['No citation changes its blessed line, so there is nothing to re-read.'];
  const each = pairs.length === 1 ? 'citation changes' : 'citations change';
  const out = [`${pairs.length} ${each} the line it is blessed against. Read each claim against its line:`];
  const fresh = pairs.filter((p) => freshKeys.has(p.key)).length;
  if (fresh) {
    const verb = fresh === 1 ? 'is' : 'are';
    out.push(`${fresh} ${verb} marked NEW: nothing was compared, so reading it is the only check there is.`);
  }
  for (const p of pairs) {
    const mark = freshKeys.has(p.key) ? 'NEW  ' : '     ';
    const now = p.head === null ? `(${p.why})` : p.head;
    const span = p.tail === null ? now : `${now}  ...  ${p.tail}`;
    out.push(`  ${mark}${p.claim || '(no preceding prose)'}  ->  ${p.anchor}  ->  ${span}`);
    // Only when the content differs, which is the difference between a citation the
    // code moved under and one now pointing at different code. The first needs a
    // glance, the second needs the reading, and the reader cannot tell them apart
    // from the new line alone.
    if (p.was && p.head !== null && p.was.head !== p.head) {
      out.push(`           was  ->  ${p.was.anchor}  ->  ${p.was.head}`);
    }
  }
  return out;
}

function printPairings(pairs, freshKeys) {
  for (const line of pairingLines(pairs, freshKeys)) console.log(line);
  console.log('');
}

function printCollisions(clashes) {
  if (!clashes.length) return;
  const each = clashes.length === 1 ? 'anchor is' : 'anchors are';
  console.log(`NOTICE: ${clashes.length} ${each} now cited twice in one scope under unlike claims.`);
  console.log('Sharing lines is ordinary. Read these anyway: a re-aim that lands one citation on');
  console.log('another has this exact shape, and both then carry the same fingerprint forever.');
  for (const c of clashes) {
    console.log(`  ${c.anchor}  in  ${c.bucket}`);
    for (const claim of c.claims) console.log(`    claim: ${claim || '(no preceding prose)'}`);
  }
  console.log('');
}

// Citation-shaped text the ANCHOR regex does not collect. This is the one hole the
// coverage assertion cannot see, because that assertion counts the same regex twice.
// It cannot be an error, since prose may legitimately name a file, so it prints as
// a notice: a reviewer can tell an intentional mention from a citation that was
// meant to be gated and is silently not.
function reportNearMisses(exempted) {
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

    // Widening the population past Markdown created a third near miss, and leaving it
    // unreported would have reproduced the silence that widening was meant to end. Only
    // the backticked form counts outside prose, because a bare citation there is usually
    // a string literal the program computes with. A comment is the exception: the
    // sentence around it is addressed to a reader, so a bare citation in one is a claim
    // and is now ungated with nothing said about it. Being in a comment is the only
    // signal the text carries, so it is the one this draws on.
    const syntax = commentSyntax(doc);
    if (!syntax.prose && syntax.open) {
      const lines = text.split('\n');
      for (let i = 0; i < lines.length; i += 1) {
        if (!syntax.open.test(lines[i])) continue;
        for (const hit of lines[i].match(BARE) ?? []) {
          suspicious.push(`  ${doc}:${i + 1}  ${hit}  (bare citation in a comment)`);
        }
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

// What was blessed last time, for the bless path, which cannot say which claims are
// changing without it. Missing and unreadable are both answered with an empty lock,
// because a first bless has nothing to compare against and every claim in it is new
// and unread. The check path reads the lock separately and refuses both cases, which
// is the right answer there and would be the wrong one here.
function priorLock() {
  try {
    const parsed = JSON.parse(readFileSync(LOCK, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function main() {
  const { found, coverage, exempted } = collect();

  // Before anything else, and before the bless path in particular. A relative citation is a
  // claim the gate cannot check, so blessing a tree that holds one records a lock that looks
  // complete and is not. Refusing here means the two paths cannot disagree about it.
  //
  // Whether a hit is refused or merely named is `relativeVerdict`'s decision, and the reason
  // it is not refused under --ref is given there.
  const relative = [];
  for (const doc of docs()) {
    const text = read(doc);
    if (text === null) continue;
    for (const r of relativeCitations(text, commentSyntax(doc))) {
      relative.push(`  ${doc}:${r.line}  \`${r.ref}\`\n      ${r.text.slice(0, 110)}`);
    }
  }
  const verdict = relativeVerdict(relative.length, ref);
  if (verdict === 'notice') {
    const each = relative.length === 1 ? 'citation' : 'citations';
    console.error(`NOTICE: ${ref} contains ${relative.length} ${each} naming a line with no path in front of it:`);
    for (const r of relative) console.error(r);
    console.error('');
    console.error('The gate never collected that form, so no drift is reported for these and none');
    console.error('ever was. They are named rather than refused, because a revision cannot be');
    console.error('rewritten to satisfy a rule adopted after it.');
    console.error('');
  } else if (verdict === 'fatal') {
    const each = relative.length === 1 ? 'citation names a line' : 'citations name lines';
    console.error(`FATAL: ${relative.length} ${each} with no path in front of it:`);
    for (const r of relative) console.error(r);
    console.error('');
    console.error('This gate begins matching at a filename, so it never sees this form and reports');
    console.error('no drift however stale it gets. One written here went thirteen lines stale that');
    console.error('way. Write the path in full. To describe a wrong line rather than cite one, say');
    console.error('so in prose: "line 12 of the workflow file", never in the citation form.');
    process.exit(2);
  }

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

  if (bless) {
    const unresolvable = found.filter((f) => f.fp === null);
    if (unresolvable.length) {
      console.error(`FATAL: refusing to bless ${unresolvable.length} anchor(s) that do not resolve:`);
      for (const u of unresolvable) console.error(`  ${u.key}  ${u.anchor}  (${u.why})`);
      process.exit(2);
    }
    // Refused rather than printed, because this is the one defect in a range that the
    // print below cannot show: `blankEdgeOf` explains why the line a reader would check
    // it against is the correct one. A range is narrowed by editing the citation, which
    // is work the author can do and the reader cannot.
    const edged = found.filter((f) => f.blankEdge);
    if (edged.length) {
      console.error(`FATAL: refusing to bless ${edged.length} range(s) whose first or last cited line is blank:`);
      for (const e of edged) console.error(`  ${e.key}  ${e.anchor}  (${e.blankEdge})`);
      console.error('Narrow each range to the lines its claim is about, then bless again.');
      process.exit(2);
    }
    found.sort((a, b) => a.key.localeCompare(b.key));

    // Printed before the lock is overwritten, and from the lock that is about to be
    // overwritten, because afterwards nothing can say which claims were unread.
    const prior = priorLock();
    const fresh = new Set(firstTime(found, prior).map((f) => f.key));
    printPairings(pairings(found, prior), fresh);
    printCollisions(collisions(found, prior));

    const lock = {};
    for (const f of found) {
      lock[f.key] = { anchor: f.anchor, fp: f.fp, head: f.head };
    }
    writeFileSync(LOCK, `${JSON.stringify(lock, null, 2)}\n`);
    const cov = coverage.map((c) => `${c.doc} ${c.captured}`).join(', ');
    console.log(`Blessed ${found.length} anchors across ${coverage.length} docs (${cov}) -> ${LOCK}`);
    reportNearMisses(exempted);
    process.exit(0);
  }

  // The lock always comes from the working tree. Reading it through --ref would make
  // the gate unusable against any revision that predates the lock, which is exactly
  // the revision you want to point it at when checking whether it would have caught
  // a past breakage.
  let raw;
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

  // Renames are taken out first. A scope rename and a re-aim are disjoint by definition,
  // since one keeps the anchor and the other changes it, but leaving a renamed pair in
  // the re-aim buckets would let it be the second entry that tips a bucket past the count
  // of one and suppresses a genuine re-aim beside it.
  //
  // The live scopes are the ones the current pass collected. A heading that is genuinely
  // renamed is absent from that set, so passing it is what lets the pairing tell a rename
  // from a citation moved between two sections that both still exist.
  const liveScopes = new Set(found.map((f) => f.key.split('|').slice(0, 2).join('|')));
  const renamed = scopeRenames(unkeyed, gone, lock, liveScopes);
  const renamedNew = new Set(renamed.map((r) => r.to.key));
  const renamedGone = new Set(renamed.map((r) => r.from));

  const newBy = new Map();
  for (const u of unkeyed) {
    if (renamedNew.has(u.key)) continue;
    const b = bucketOf(u.key, fileOf(u.anchor));
    if (!newBy.has(b)) newBy.set(b, []);
    newBy.get(b).push(u);
  }
  const goneBy = new Map();
  for (const k of gone) {
    if (renamedGone.has(k)) continue;
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
  if (renamed.length) {
    const each = renamed.length === 1 ? 'pairs' : 'pair';
    console.log(
      `of which ${renamed.length} ${each} as scope renames, identical anchor and content under a new heading`,
    );
  }
  if (reaimed.length) {
    console.log(`of which ${reaimed.length} pair as re-aimed anchors, one addition against one loss`);
  }
  console.log(`coverage: ${cov}\n`);

  // Printed as its own kind, and still counted as an addition and a loss so the gate
  // exits 1. A rename absorbed silently would let a real loss hide behind a real rename
  // in the same run, which is the shape of every defect this gate has caught. This spares
  // the reader the reasoning without sparing them the reading.
  for (const r of renamed) {
    console.log(`RENAME ${r.to.anchor}`);
    console.log(`  claim   : ${r.to.claim}`);
    console.log(`  scope   : ${r.fromScope}  ->  ${r.toScope}`);
    console.log(`  line    : ${r.to.head ?? `(${r.to.why})`}`);
    console.log('  the anchor and its content are unchanged, so this is a rename and not a loss');
    console.log('');
  }

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

  // The claim is printed here for the same reason it is printed above a re-aim. A new
  // citation is the one case where nothing was ever read against this line, so a report
  // that gave only the line asked the reader to go back to the document to find out what
  // it was supposed to say, and that is the step that gets skipped.
  for (const u of unkeyed) {
    if (pairedNew.has(u.key) || renamedNew.has(u.key)) continue;
    console.log(`NEW    ${u.key}  ${u.anchor}`);
    console.log(`  claim   : ${u.claim}`);
    console.log(`  now says: ${u.head ?? `(${u.why})`}`);
    console.log('');
  }

  for (const [doc, all] of goneByDoc) {
    const keys = all.filter((k) => !pairedGone.has(k) && !renamedGone.has(k));
    if (!keys.length) continue;
    const absent = corpus.has(doc) ? '' : ', and the document itself is absent from the corpus';
    console.log(`GONE   ${doc}: ${keys.length} blessed anchor(s) no longer collected${absent}`);
    for (const k of keys.slice(0, 4)) console.log(`  ${lock[k].anchor}  ${k}`);
    if (keys.length > 4) console.log(`  ... and ${keys.length - 4} more`);
    console.log('');
  }

  // The rule the bless path refuses on, asked of a tree nobody is blessing. It has to be
  // asked twice because `fingerprint` drops blank lines before hashing, so a reflow that
  // moves a blank line from inside a cited range to its edge leaves the fingerprint
  // byte-identical: the check reports no drift, every run stays green, and the defect
  // surfaces only when somebody blesses for an unrelated reason and is stopped by a
  // citation they did not write and cannot judge. Reported here so it fails in the commit
  // that causes it, which is the premise this whole gate rests on.
  //
  // Refused against the working tree and merely reported under --ref, which is the split
  // `relativeVerdict` already draws and draws for the same reason: a range in a tree
  // someone is writing can be narrowed, and one in a revision that already shipped cannot
  // be rewritten to satisfy a rule adopted after it.
  const edged = found.filter((f) => f.blankEdge);
  for (const e of edged) {
    console.log(`EDGED  ${e.key}`);
    console.log(`  claim   : ${e.claim}`);
    console.log(`  anchor  : ${e.anchor}  (${e.blankEdge})`);
    console.log('');
  }
  if (edged.length && ref === null) {
    console.log('Narrow each range to the lines its claim is about, then re-bless.');
  } else if (edged.length) {
    console.log(`NOTICE: ${edged.length} range(s) above are in a past revision and cannot be narrowed.`);
  }

  printCollisions(collisions(found, lock));

  if (drifted.length || unkeyed.length) {
    console.log('Re-read the cited lines and confirm they still say what the claim says.');
    console.log('Only then re-bless: npm run anchors:bless');
  }
  if (gone.length) {
    console.log('A blessed claim is no longer being checked. Confirm the claim was meant to');
    console.log('go, rather than its document being renamed or moved out of the corpus, and');
    console.log('only then re-bless: npm run anchors:bless');
  }

  reportNearMisses(exempted);

  process.exitCode = failing({
    drifted: drifted.length,
    unkeyed: unkeyed.length,
    gone: gone.length,
    edged: edged.length,
    ref,
  }) ? 1 : 0;
}

// Run only as a script. Importing it has to be side-effect free, because the pairing
// helpers above are unit tested and a module that gated the whole repository on import
// would set an exit code, or call process.exit, inside the test runner.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
