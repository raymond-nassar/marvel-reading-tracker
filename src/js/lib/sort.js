// Semantic ordering for comic issues.
// Numeric issue numbers do not sort as strings: "10" sorts before "2", and Marvel uses
// point issues ("0.1"), lettered variants ("1.AU"), annuals and specials.

const KIND_NUMBERED = 0;
const KIND_ANNUAL = 1;
const KIND_SPECIAL = 2;

// Accepts a full title ("The Avengers (2012) #1.AU") or a bare number ("1.AU").
export function parseIssueNumber(input) {
  const s = String(input ?? '').trim();
  if (!s) return null;

  const hashed = /#\s*([0-9]+(?:\.[0-9]+)?)\s*\.?\s*([A-Za-z]{1,4})?\s*$/.exec(s);
  const bare = /^([0-9]+(?:\.[0-9]+)?)\s*\.?\s*([A-Za-z]{1,4})?$/.exec(s);
  const m = hashed ?? bare;

  const kind = /\bannual\b/i.test(s)
    ? KIND_ANNUAL
    : /\b(special|one[- ]?shot|director'?s cut|infinity comic|prelude)\b/i.test(s)
      ? KIND_SPECIAL
      : KIND_NUMBERED;

  if (!m) return { kind: kind === KIND_NUMBERED ? KIND_SPECIAL : kind, value: Number.POSITIVE_INFINITY, suffix: '' };
  return { kind, value: Number(m[1]), suffix: (m[2] ?? '').toUpperCase() };
}

function dateKey(v) {
  if (!v) return Number.POSITIVE_INFINITY;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

export function compareIssues(a, b) {
  const da = dateKey(a?.onSale);
  const db = dateKey(b?.onSale);
  if (da !== db) return da - db;

  const sa = String(a?.seriesName ?? '');
  const sb = String(b?.seriesName ?? '');
  if (sa !== sb) return sa.localeCompare(sb);

  const na = parseIssueNumber(a?.number ?? a?.title);
  const nb = parseIssueNumber(b?.number ?? b?.title);
  if (na && nb) {
    if (na.kind !== nb.kind) return na.kind - nb.kind;
    if (na.value !== nb.value) return na.value - nb.value;
    if (na.suffix !== nb.suffix) return na.suffix.localeCompare(nb.suffix);
  } else if (na || nb) {
    return na ? -1 : 1;
  }

  return String(a?.title ?? '').localeCompare(String(b?.title ?? ''));
}

export function sortIssues(issues) {
  return [...issues].sort(compareIssues);
}
