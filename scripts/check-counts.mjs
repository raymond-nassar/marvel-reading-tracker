// A count stated in prose is an evidence claim with nothing behind it. The anchors
// gate ended that for `path:line` citations by fingerprinting the lines they name,
// and a wrong count reads exactly like a right one for the same reason a wrong
// anchor did: nothing recomputes it. One figure in the backlog survived twelve
// consecutive shipped items with every gate green, and the pass that went looking
// for stale figures missed one it was explicitly hunting.
//
//   node scripts/check-counts.mjs
//
// Scope is the machine-checkable subset, not a general one. Every figure this gate
// knows about is derived from the ranked table in the same file, so it can be
// recomputed and compared. A general checker would have to decide which number in
// any English sentence is derived and from what, which is not tractable, so claims
// are recognised by rigid syntactic form rather than by reading the prose around
// them. Figures that need the tree rather than the table, the line count of
// `src/js/main.js` and the test total among them, are deliberately out of reach:
// folding them in would turn a tractable gate into the intractable one.
//
// What it cannot do is decide whether a figure was right when it was written. It
// compares the prose against the table, so a table that is itself wrong will be
// agreed with.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DOC = 'PRODUCT_BACKLOG.md';

// A claim about a past state cites a count that is expected to disagree, exactly as
// a historical `path:line` citation does, and Appendix B carries one: BL-028's rank
// of 15 of 28 is what the ranking pass computed and is not a claim about the table
// now. The marker states that intent in the source, so a new frozen claim written
// without it fails loudly, which is the right direction to fail in. It is an HTML
// comment because it must not change what the rendered document says: a prose marker
// would mean editing the sentence to satisfy a checker.
export const FROZEN = '<!-- counts:frozen -->';

const NUMBER_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty',
];

const ORDINAL_WORDS = [
  'zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
  'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth',
  'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth',
];

const TENS = { 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty', 60: 'sixty' };
const ORDINAL_TENS = {
  20: 'twentieth', 30: 'thirtieth', 40: 'fortieth', 50: 'fiftieth', 60: 'sixtieth',
};

// Spelled out because the document spells them out. Returning null above sixty rather
// than falling back to digits keeps the failure visible: a backlog that outgrows this
// wants the range extended, not a checker that quietly stops checking.
export function numberWord(n) {
  if (n >= 0 && n <= 20) return NUMBER_WORDS[n];
  const tens = Math.floor(n / 10) * 10;
  const unit = n % 10;
  if (!TENS[tens]) return null;
  return unit === 0 ? TENS[tens] : `${TENS[tens]}-${NUMBER_WORDS[unit]}`;
}

export function ordinalWord(n) {
  if (n >= 0 && n <= 20) return ORDINAL_WORDS[n];
  const tens = Math.floor(n / 10) * 10;
  const unit = n % 10;
  if (!TENS[tens]) return null;
  return unit === 0 ? ORDINAL_TENS[tens] : `${TENS[tens]}-${ORDINAL_WORDS[unit]}`;
}

const titleCase = (s) => (s ? s[0].toUpperCase() + s.slice(1) : s);

// The ranked table, the parked table and the detail blocks are three regions of one
// document. Locating them by heading rather than by line number is what keeps this
// gate from needing a re-aim every time the document grows, which is the failure mode
// it exists to prevent rather than to reproduce.
export function locate(lines) {
  const at = (re) => {
    const i = lines.findIndex((l) => re.test(l));
    return i === -1 ? null : i;
  };
  return {
    backlog: at(/^## The backlog\s*$/),
    parked: at(/^### Parked\s*$/),
    details: at(/^## Item details\s*$/),
  };
}

function rowsIn(lines, from, to) {
  const rows = [];
  for (let i = from; i < to; i += 1) {
    if (!/^\|\s*BL-\d+\s*\|/.test(lines[i])) continue;
    const cells = lines[i].split('|').map((c) => c.trim());
    rows.push({ id: cells[1], wsjf: cells[10], status: cells[13], line: i + 1 });
  }
  return rows;
}

export function derive(text) {
  const lines = text.split(/\r?\n/);
  const { backlog, parked, details } = locate(lines);
  if (backlog === null || parked === null || details === null) {
    throw new Error(
      'cannot locate the three regions of the document: expected "## The backlog", ' +
        '"### Parked" and "## Item details" headings',
    );
  }

  const ranked = rowsIn(lines, backlog, parked);
  const parkedRows = rowsIn(lines, parked, details);

  const rank = new Map();
  ranked.forEach((r, i) => rank.set(r.id, i + 1));

  const status = {};
  for (const r of [...ranked, ...parkedRows]) status[r.status] = (status[r.status] ?? 0) + 1;

  const headings = [];
  lines.forEach((l, i) => {
    const m = /^\*\*(BL-\d+):/.exec(l);
    if (m) headings.push({ id: m[1], line: i + 1 });
  });

  return {
    lines,
    ranked,
    parkedRows,
    rank,
    status,
    headings,
    shipped: ranked.filter((r) => r.status === 'Shipped').map((r) => r.id),
  };
}

// The subject of a rank claim is read from the line that states it where the document
// names it there, and from the nearest preceding heading where it does not. Both forms
// are in use. The rule is fixed rather than a search, because a guess about which item
// a number refers to is the kind of corroborating detail that makes a wrong report
// persuasive.
function subjectOf(lines, i) {
  const here = /(BL-\d+)/.exec(lines[i]);
  if (here) return here[1];
  for (let j = i; j >= 0; j -= 1) {
    if (/^#{2,4} /.test(lines[j])) return /(BL-\d+)/.exec(lines[j])?.[1] ?? null;
  }
  return null;
}

// Each check returns findings rather than printing them, so the tests can assert on
// what was found rather than on what reached a terminal.
export function checkRanks(d) {
  const found = [];
  const total = d.ranked.length;
  d.lines.forEach((line, i) => {
    if (line.includes(FROZEN)) return;
    for (const m of line.matchAll(/rank (\d+) of (\d+)/g)) {
      const n = Number(m[1]);
      const of = Number(m[2]);
      const id = subjectOf(d.lines, i);
      if (of !== total) {
        found.push({
          line: i + 1,
          claim: m[0],
          message: `states a table of ${of} rows; the ranked table has ${total}`,
        });
      }
      if (id && !d.rank.has(id)) {
        found.push({
          line: i + 1,
          claim: m[0],
          message: `names ${id}, which is not a row in the ranked table`,
        });
      } else if (id && d.rank.get(id) !== n) {
        found.push({
          line: i + 1,
          claim: m[0],
          message: `puts ${id} at rank ${n}; the table puts it at ${d.rank.get(id)}`,
        });
      }
    }
  });
  return found;
}

export function checkOrdinalHeadings(d) {
  const found = [];
  d.lines.forEach((line, i) => {
    if (line.includes(FROZEN)) return;
    const m = /^#{2,4} .*?(BL-\d+).*?\branks ([a-z]+(?:-[a-z]+)?)\b/.exec(line);
    if (!m) return;
    const [, id, word] = m;
    if (!d.rank.has(id)) {
      found.push({
        line: i + 1,
        claim: `ranks ${word}`,
        message: `names ${id}, which is not a row in the ranked table`,
      });
      return;
    }
    const want = ordinalWord(d.rank.get(id));
    if (word !== want) {
      found.push({
        line: i + 1,
        claim: `ranks ${word}`,
        message: `spells ${id}'s rank as ${word}; the table puts it ${want}`,
      });
    }
  });
  return found;
}

export function checkLedger(d) {
  const found = [];
  const i = d.lines.findIndex((l) => /items have since been delivered/.test(l));
  if (i === -1) {
    return [{
      line: 0,
      claim: 'the delivered ledger',
      message: 'no "items have since been delivered" sentence found, so nothing states the count',
    }];
  }

  const word = /^([A-Za-z-]+) items have since been delivered/.exec(d.lines[i])?.[1] ?? null;
  const want = numberWord(d.shipped.length);
  if (word === null || word.toLowerCase() !== want) {
    found.push({
      line: i + 1,
      claim: `${word} items have since been delivered`,
      message: `${d.shipped.length} rows are marked Shipped, so this should read ${titleCase(want)}`,
    });
  }

  // The sentence wraps, and its id list ends at the full stop that closes it, so the
  // list is read from the joined text rather than line by line.
  const joined = d.lines.slice(i, i + 12).join(' ');
  const listText = /delivered and are marked `Shipped` in the table below:([^.]*)\./.exec(joined);
  const claimed = [...(listText?.[1] ?? '').matchAll(/BL-\d+/g)].map((x) => x[0]);
  const missing = d.shipped.filter((id) => !claimed.includes(id));
  const extra = claimed.filter((id) => !d.shipped.includes(id));
  if (missing.length || extra.length) {
    found.push({
      line: i + 1,
      claim: 'the delivered id list',
      message:
        `lists ${claimed.length} id(s) for ${d.shipped.length} Shipped row(s)` +
        (missing.length ? `; missing ${missing.join(', ')}` : '') +
        (extra.length ? `; names ${extra.join(', ')}, which the table does not mark Shipped` : ''),
    });
  }
  return found;
}

// The same enumeration over the same table that found BL-050 had no detail block. It
// runs here rather than in a reviewer's head because the two sentences claiming
// otherwise stood, and were read past, for twenty-four ids.
export function checkBlocks(d) {
  const found = [];
  const rows = [...d.ranked, ...d.parkedRows];
  const rowIds = new Set(rows.map((r) => r.id));
  const headingIds = new Set(d.headings.map((h) => h.id));

  for (const r of rows) {
    if (!headingIds.has(r.id)) {
      found.push({
        line: r.line,
        claim: r.id,
        message: 'has a table row but no detail block heading',
      });
    }
  }
  for (const h of d.headings) {
    if (!rowIds.has(h.id)) {
      found.push({
        line: h.line,
        claim: h.id,
        message: 'has a detail block heading but no table row',
      });
    }
  }

  // A block that exists twice is a block that disagrees with itself, and the way it
  // gets written twice is an edit that copies a block it meant to move. That has
  // happened, and the enumeration above cannot see it: both copies match a row.
  const counts = new Map();
  for (const h of d.headings) counts.set(h.id, (counts.get(h.id) ?? 0) + 1);
  for (const [id, n] of counts) {
    if (n > 1) {
      found.push({
        line: d.headings.find((h) => h.id === id).line,
        claim: id,
        message: `has ${n} detail block headings, so one of them is a copy`,
      });
    }
  }
  return found;
}

export function checkAll(text) {
  const derived = derive(text);
  const findings = [
    ...checkRanks(derived),
    ...checkOrdinalHeadings(derived),
    ...checkLedger(derived),
    ...checkBlocks(derived),
  ].sort((a, b) => a.line - b.line);
  return { derived, findings };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const { derived, findings } = checkAll(readFileSync(join(root, DOC), 'utf8'));

  const tally = Object.entries(derived.status)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');
  console.log(
    `${derived.ranked.length} ranked rows, ${derived.parkedRows.length} parked, ` +
      `${derived.headings.length} detail blocks (${tally})`,
  );

  for (const f of findings) {
    console.error(`WRONG  ${DOC}:${f.line}  ${f.claim}\n  ${f.message}`);
  }
  if (findings.length) {
    console.error(
      `\n${findings.length} stated figure(s) disagree with the table they are derived from. ` +
        'Each message names the derived value, so the fix is to write that value, or to mark ' +
        `the claim historical with ${FROZEN} if it is about a past state.`,
    );
    process.exit(1);
  }
  console.log('every stated figure agrees with the table it is derived from');
}
