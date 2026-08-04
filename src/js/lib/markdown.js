// Markdown checklist parsing and serialization.
// Upstream format: - [ ] [Title](https://www.marvel.com/comics/issue/<id>/<slug>)

const MARVEL_ISSUE_RE = /^https?:\/\/(?:www\.)?marvel\.com\/comics\/issue\/(\d+)(?:\/([^/?#]*))?/i;
// Link text allows backslash escapes so a title containing "]" survives a
// serialize -> parse round trip. Without this, escapeLinkText produces output
// this parser cannot read back.
const LINK_TEXT = '((?:[^\\]\\\\]|\\\\.)*)';
const CHECKBOX_LINK_RE = new RegExp(`^\\s*[-*]\\s*\\[( |x|X)\\]\\s*\\[${LINK_TEXT}\\]\\(([^)\\s]+)(?:\\s+"[^"]*")?\\)`);
const CHECKBOX_PLAIN_RE = /^\s*[-*]\s*\[( |x|X)\]\s*(.+?)\s*$/;
const BULLET_LINK_RE = new RegExp(`^\\s*[-*]\\s*\\[${LINK_TEXT}\\]\\(([^)\\s]+)(?:\\s+"[^"]*")?\\)`);

export function unescapeLinkText(s) {
  return String(s ?? '').replace(/\\(.)/g, '$1');
}

export function issueIdFromUrl(url) {
  if (typeof url !== 'string') return null;
  const m = MARVEL_ISSUE_RE.exec(url.trim());
  return m ? Number(m[1]) : null;
}

export function isSafeMarvelUrl(url) {
  if (typeof url !== 'string') return false;
  let u;
  try {
    u = new URL(url.trim());
  } catch {
    return false;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return false;
  const host = u.hostname.toLowerCase();
  return host === 'marvel.com' || host === 'www.marvel.com' || host === 'read.marvel.com';
}

// Returns { entries, unresolved, headings }
// entry: { issueId|null, title, url|null, read }
export function parseChecklist(text) {
  const entries = [];
  const unresolved = [];
  const headings = [];
  if (typeof text !== 'string') return { entries, unresolved, headings };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/\u00a0/g, ' ');
    if (!line.trim()) continue;

    const h = /^\s{0,3}(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      headings.push(h[2].trim());
      continue;
    }

    let read = false;
    let title = null;
    let url = null;

    const cl = CHECKBOX_LINK_RE.exec(line);
    if (cl) {
      read = cl[1].toLowerCase() === 'x';
      title = unescapeLinkText(cl[2]).trim();
      url = cl[3].trim();
    } else {
      const bl = BULLET_LINK_RE.exec(line);
      if (bl) {
        title = unescapeLinkText(bl[1]).trim();
        url = bl[2].trim();
      } else {
        const cp = CHECKBOX_PLAIN_RE.exec(line);
        if (cp) {
          read = cp[1].toLowerCase() === 'x';
          title = stripInlineMarkdown(cp[2]);
        } else if (/^\s*[-*]\s+/.test(line)) {
          title = stripInlineMarkdown(line.replace(/^\s*[-*]\s+/, ''));
        } else {
          continue;
        }
      }
    }

    if (!title) continue;
    const issueId = issueIdFromUrl(url);

    if (issueId != null) {
      entries.push({ issueId, title, url: url, read });
    } else {
      // A title we could not map to a Marvel issue id. Never silently dropped.
      unresolved.push({ title, url: url && isSafeMarvelUrl(url) ? url : null, read });
    }
  }

  return { entries, unresolved, headings };
}

// Plain title list: one per line, optional leading bullet or checkbox.
export function parseTitleList(text) {
  const out = [];
  if (typeof text !== 'string') return out;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const cp = CHECKBOX_PLAIN_RE.exec(line);
    if (cp) {
      out.push({ title: stripInlineMarkdown(cp[2]), read: cp[1].toLowerCase() === 'x' });
      continue;
    }
    out.push({ title: stripInlineMarkdown(line.replace(/^[-*]\s+/, '')), read: false });
  }
  return out.filter((e) => e.title);
}

export function stripInlineMarkdown(s) {
  return String(s)
    .replace(/\[((?:[^\]\\]|\\.)*)\]\([^)]*\)/g, (_, t) => unescapeLinkText(t))
    .replace(/[*_`]/g, '')
    .trim();
}

// Serializes a list back to the same format it can be re-imported from.
export function serializeChecklist({ name, description, items }) {
  const lines = [];
  if (name) lines.push(`# ${name}`, '');
  if (description) lines.push(description, '');
  for (const it of items) {
    const box = it.read ? '- [x]' : '- [ ]';
    const url = it.url || (it.issueId != null ? `https://www.marvel.com/comics/issue/${it.issueId}/` : null);
    lines.push(url ? `${box} [${escapeLinkText(it.title)}](${url})` : `${box} ${it.title}`);
  }
  lines.push('');
  return lines.join('\n');
}

function escapeLinkText(s) {
  return String(s).replace(/\]/g, '\\]');
}

// Normalization used only for exact-match title resolution. Deliberately strict:
// we auto-accept a search result only when exactly one candidate normalizes identically.
export function normalizeTitle(s) {
  return String(s ?? '')
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function resolveUniqueExact(title, candidates) {
  const want = normalizeTitle(title);
  if (!want) return { status: 'ambiguous', matches: candidates ?? [] };
  const matches = (candidates ?? []).filter((c) => normalizeTitle(c.title) === want);
  if (matches.length === 1) return { status: 'resolved', match: matches[0] };
  if (matches.length === 0) return { status: 'unmatched', matches: candidates ?? [] };
  return { status: 'ambiguous', matches };
}
