// Every contrast ratio this stylesheet claims, measured rather than asserted.
//
// The claims were prose in CSS comments and nothing checked them. The comment above `--red-text`
// records three measurements to two decimal places, and the one above the availability badges
// warned in as many words that a light theme "would void all of these and the measurement would
// have to be redone per theme". That is the whole argument for this file: a second theme doubles
// the number of ratios and prose does not scale to it.
//
// Only foreground-on-background pairs that actually occur are listed. A pair nobody renders is a
// number that can drift without anyone noticing, and a floor met by a combination the app never
// shows is not a floor.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// WCAG 2.1: 4.5:1 for body text, 3:1 for large text and for the boundary of a control.
export const BODY = 4.5;
export const LARGE = 3;

// Foreground, background, floor, and where it is rendered. The last field is the reason the pair
// is here at all, so a reviewer can check the claim rather than trust the list.
//
// `--line` is deliberately absent. It was the border of five controls until BL-065, measured 1.29:1
// in Edge, and those controls were moved to `--line-2`. What is left on `--line` is a hairline
// around cards, images, panels and separators, plus the static `.pill` and `.badge` labels, none of
// which is a user interface component, so 1.4.11 does not reach them and a floor would be inventing
// a claim rather than recording one. The check that keeps this honest is a browser pass that
// enumerates every rendered interactive element and measures its own border, because a list of
// control selectors would be a list someone has to keep complete.
//
// That pass was not sufficient on its own, and review found the hole. `.rnote` is `border: 0` until
// `.has-note` is set, so the sixth control still on `--line` painted no border in any fixture and
// could not be seen by a scan of what is rendered. It measured the same 1.29:1 and moved with the
// other five. The pass now sets that class and reads all four border sides rather than the top, so
// a left accent counts: 731 painted boundaries per theme across seven views, none below the floor.
// A rule that paints only in a state no fixture reaches is the shape of the next such hole.
export const PAIRS = [
  ['--text', '--bg', BODY, 'body text on the page'],
  ['--text', '--card', BODY, 'body text on a card'],
  ['--text', '--card-2', BODY, 'body text on a raised card'],
  ['--text', '--rail', BODY, 'the rail label of the current view'],
  ['--dim', '--bg', BODY, 'secondary text on the page'],
  ['--dim', '--card', BODY, 'secondary text on a card'],
  ['--muted', '--bg', BODY, 'the rail hint and the progress ring label'],
  ['--muted', '--card', BODY, 'a card subtitle'],
  ['--read-fg', '--bg', BODY, 'a row that has been read'],
  ['--read-fg', '--card', BODY, 'a read row inside a card'],
  ['--blue', '--bg', BODY, 'a link, and the focus ring against the page'],
  ['--blue', '--card', BODY, 'a link inside a card'],
  ['--red-text', '--bg', BODY, 'danger text on the page'],
  ['--red-text', '--card', BODY, 'danger text on a card'],
  ['--red-fg', '--card', BODY, 'a danger hover and the unavailable badge'],
  ['--red-fg-2', '--card', BODY, 'an error notice'],
  ['--green', '--bg', BODY, 'the available badge on the page'],
  ['--green', '--card', BODY, 'the available badge on a card'],
  ['--amber', '--bg', BODY, 'the scheduled badge on the page'],
  ['--amber', '--card', BODY, 'the scheduled badge on a card'],
  ['--on-accent', '--red', BODY, 'the label of a primary button, and the knob of the cover-art switch in its on state'],
  ['--line-2', '--bg', LARGE, 'the boundary of a bordered control'],
  ['--line-2', '--card', LARGE, 'the boundary of a button on a card, such as the hero'],
  ['--line-2', '--card-2', LARGE, 'the boundary of a text input against its own fill'],
  ['--cb-line', '--card', LARGE, 'the boundary of an unchecked checkbox'],
  ['--cb-line', '--bg', LARGE, 'the boundary of an unchecked checkbox in a row on the page'],
  ['--track', '--card', LARGE, 'the unfilled part of a progress bar'],
  ['--track', '--rail', LARGE, 'the unfilled part of the per-list progress bar in the rail'],
  ['--red', '--track', LARGE, 'the filled part of a progress bar against the unfilled part'],
  ['--warn', '--panel', LARGE, 'the border of the unreadable-data notice'],
  // BL-067. The cover-art switch and the primary button were the two controls no pair reached, so
  // nothing here would have moved if either had gone invisible. Measured by walking each control's
  // ancestor chain to the first opaque background rather than by reading the stylesheet, over seven
  // views and both themes.
  //
  // Review found the first attempt at this block wrong twice over, in the same sentence. It said the
  // switch is always on the page and the primary button always on a card, and gated the off-state
  // track on the page while leaving the on-state track of the same control, on the same background,
  // ungated. Half of one control. `--red` on `--bg` is painted by two separate things: the switch's
  // on-state track, and the catalog Clear button, which is a `.btn` with a transparent border
  // falling through to the page. Both measure 3.89:1 dark and 4.73:1 light, so nothing was failing,
  // but nothing was watching either.
  //
  // Neither was visible to the browser pass, and the reason is worth keeping: the Clear button is
  // `hidden` until a query is typed, and the switch's on state is not the state a fresh fixture
  // lands in. That is the hole this file's own header names, a rule that paints only in a state no
  // fixture reaches, and it caught this file rather than the app.
  //
  // What the plan got wrong is narrower than it looked. It asked for `--red` on `--bg` and described
  // it as the knob on the on-state track. The description is garbled, because the knob on the
  // on-state track is `--on-accent` on `--red`, already listed above. The pair itself was right.
  ['--track-2', '--bg', LARGE, 'the cover-art switch in its off state, which sits on the page'],
  ['--on-accent', '--track-2', LARGE, 'the knob of the cover-art switch on its off-state track'],
  ['--red', '--bg', LARGE, 'the cover-art switch in its on state, and the catalog Clear button, both on the page'],
  ['--red', '--card', LARGE, 'the fill of a primary button on a card'],
  ['--red', '--card-2', LARGE, 'the fill of a primary button on a raised card'],
  // Found by the same review, one token over, and it is the reason the guard in test/theme.test.js
  // now pins `--on-accent` too. The tick inside a checked checkbox is `--on-accent` on `--green`
  // (`src/styles.css:580` and `:582`), which is 2.30:1 in the dark theme. It is listed here and
  // recorded below rather than fixed, because the colour decision belongs to BL-069 and this item
  // is about measuring what nothing measured. The railed status dot is the other thing painted on
  // `--green` and it carries no foreground at all, since `.railed .pill` sets `color: transparent`
  // at `src/styles.css:342-343`, so this is the only pair `--green` backs.
  ['--on-accent', '--green', LARGE, 'the tick inside a checked read checkbox'],
];

export function parseHex(hex) {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return [0, 1, 2].map((i) => parseInt(h.slice(i * 2, i * 2 + 2), 16));
}

// WCAG relative luminance. The 0.03928 knee and the 2.4 exponent are the specification's, not a
// simplification of it, because a simplified curve moves ratios by enough to pass a failing pair.
export function luminance([r, g, b]) {
  const f = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function ratio(fg, bg) {
  const a = luminance(fg);
  const b = luminance(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

// Declarations are read in source order and later ones win, which is how the cascade resolves a
// token declared in both the shared block and a theme block.
export function tokensIn(css, selector) {
  const out = new Map();
  const shared = block(css, ':root {');
  const themed = block(css, selector);
  for (const src of [shared, themed]) {
    if (!src) continue;
    for (const m of src.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) out.set(m[1], m[2].trim());
  }
  return out;
}

function block(css, opener) {
  const at = css.indexOf(opener);
  if (at < 0) return null;
  const start = css.indexOf('{', at);
  let depth = 0;
  for (let i = start; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}') {
      depth -= 1;
      if (depth === 0) return css.slice(start + 1, i);
    }
  }
  return null;
}

export function check(css, selector, themeName) {
  const tokens = tokensIn(css, selector);
  const findings = [];
  for (const [fgName, bgName, floor, where] of PAIRS) {
    const fgRaw = tokens.get(fgName);
    const bgRaw = tokens.get(bgName);
    // A missing token is a finding rather than a skip. Silently passing over one is how a pair
    // stops being checked without anybody deciding that it should.
    if (!fgRaw || !bgRaw) {
      findings.push({ themeName, fgName, bgName, message: `${!fgRaw ? fgName : bgName} is not defined for the ${themeName} theme` });
      continue;
    }
    const fg = parseHex(fgRaw);
    const bg = parseHex(bgRaw);
    if (!fg || !bg) {
      findings.push({ themeName, fgName, bgName, message: `${!fg ? fgName : bgName} is not a plain hex colour, so it cannot be measured` });
      continue;
    }
    const r = ratio(fg, bg);
    if (r < floor) {
      findings.push({
        themeName,
        fgName,
        bgName,
        ratio: r,
        where,
        message: `${fgName} on ${bgName} measures ${r.toFixed(2)}:1, below the ${floor}:1 floor, and is ${where}`,
      });
    }
  }
  return findings;
}

export function checkAll(css) {
  return [
    ...check(css, ':root, :root[data-theme="dark"]', 'dark'),
    ...check(css, ':root[data-theme="light"]', 'light'),
  ];
}

// Five non-text pairs sit below 3:1 and are recorded rather than fixed. BL-065 raised the other four.
//
// All four are `--track` against something behind it, and the reason they stay is arithmetic rather
// than reluctance. `--track` is the trough of a progress bar and the `--red` fill sits directly on
// it, so the token has to answer to two floors at once. Colours clearing 3:1 against the card AND
// carrying the fill at 3:1 do exist, but every one of them inverts the bar. In the dark theme each
// has a relative luminance of at least 0.598, which is 3.6 times the fill's 0.166, so the empty part
// of the bar would be brighter than the filled part. In the light theme each is at most 0.022, an
// eighth of the fill, so the trough would be near black on a white card. Either way the bar would
// report progress backwards, which is a worse outcome for the reader than the recorded ratio.
//
// The bar renders on two surfaces, not one, and review found the second: `.pbar` sits on a card and
// `.ri .bar` sits on the rail. Listing only the card is the same defect BL-065 fixed for `--line-2`
// and `--cb-line`, and it hid a real degradation, because darkening the dark trough took it from
// 1.47:1 to 1.30:1 against the rail with nothing recording the move. Both surfaces are listed now,
// so the trade is on the record in both places rather than only where it was convenient.
//
// So the pair that actually carries the value is measured instead: `--red` on `--track` is in the
// list above at the 3:1 floor and passes in both themes, which is the same pair the rail bar uses,
// so the rail improved by exactly the amount the card bar did. The dark trough was darkened from
// #2a303c to #232731 to get there, taking the fill from 2.72 to 3.07; the light theme already
// measured 3.67. The bar is also never the only way to read progress, because the same numbers are
// stated as text beside it, at `src/js/main.js:779` in the rail and `src/js/main.js:915` in the
// saved lists.
//
// They are recorded rather than waived because a gate that quietly tolerates its own findings is not
// a gate. The baseline is exact in both directions. A new pair below the floor fails, which is the
// obvious half. A listed pair that now passes ALSO fails, which is the half that matters: it is what
// stops this list outliving the debt it describes, and an accepted-failures list nobody prunes is
// how a gate turns into a rubber stamp.
export const KNOWN = [
  'dark:--track:--card',
  'light:--track:--card',
  'dark:--track:--rail',
  'light:--track:--rail',
  // The fifth is a different case from the four above and is recorded for a different reason. The
  // white tick inside a checked read checkbox is 2.30:1 on the dark `--green` fill, and 6.48:1 on
  // the light one, so only the dark theme is below the floor. Unlike the trough, nothing about the
  // arithmetic forces it: a darker green would clear it. It is recorded rather than fixed because
  // the tick is not what tells a reader the box is checked. The fill does, and the fill is
  // emphatic, at 7.58:1 against a card and 8.22:1 against the page in the dark theme. The state is
  // also carried in words, since the button's own label at `src/js/main.js:1854` reads "Mark X as
  // unread" exactly when it is checked, and `aria-pressed` at `:1853` carries it too. So the tick
  // is reinforcement drawn on an already unmistakable fill, which is the same judgement BL-049
  // reached about the badge borders and the same one BL-067 reached about the switch graphic.
  // Choosing the green is BL-069's, and until it does this line is what keeps the number visible.
  //
  // The classification is what makes this entry eligible at all, and it deserves stating rather
  // than assuming, because the test below rejects any recorded pair carrying the 4.5:1 text floor.
  // WCAG scopes text to characters that express something in human language. A tick is a symbol
  // that happens to arrive as a font glyph, and here it is never language to anybody: the button
  // takes its accessible name from the `aria-label` at `src/js/main.js:1854`, which replaces the
  // glyph in the name computation, so no assistive technology ever reads it. It is a state
  // indicator drawn on a control, so the floor is the 3:1 of 1.4.11 and not the 4.5:1 of 1.4.3.
  // If that reading is ever overturned, this entry is not eligible and the green has to change.
  'dark:--on-accent:--green',
];

export function unresolved(css) {
  const found = checkAll(css).map((f) => ({ ...f, key: `${f.themeName}:${f.fgName}:${f.bgName}` }));
  const keys = new Set(found.map((f) => f.key));
  const fresh = found.filter((f) => !KNOWN.includes(f.key));
  const fixed = KNOWN.filter((k) => !keys.has(k));
  // `found` comes back too so the passing path can print what each recorded pair currently measures.
  // Review found the backlog and the changelog both claiming the ratio was printed on every run when
  // only the count was, and the number was reachable only under a `--report` flag no CI step passes.
  const recorded = KNOWN.map((k) => found.find((f) => f.key === k)).filter(Boolean);
  return { fresh, fixed, recorded };
}

function main() {
  const css = readFileSync(join(ROOT, 'src', 'styles.css'), 'utf8');

  if (process.argv.includes('--report')) {
    for (const [selector, themeName] of [[':root, :root[data-theme="dark"]', 'dark'], [':root[data-theme="light"]', 'light']]) {
      const tokens = tokensIn(css, selector);
      console.log(`\n${themeName}`);
      for (const [fgName, bgName, floor] of PAIRS) {
        const fg = parseHex(tokens.get(fgName) || '');
        const bg = parseHex(tokens.get(bgName) || '');
        const r = fg && bg ? ratio(fg, bg) : null;
        const mark = r === null ? '  ?' : r < floor ? 'FAIL' : '  ok';
        console.log(`  ${mark}  ${(r === null ? '     ' : r.toFixed(2).padStart(5))}  (${floor})  ${fgName} on ${bgName}`);
      }
    }
    return;
  }

  const { fresh, fixed } = unresolved(css);
  for (const f of fresh) console.log(`  ${f.themeName}: ${f.message}`);
  for (const k of fixed) {
    console.log(`  ${k} now meets the floor. Remove it from KNOWN in scripts/check-palette.mjs, and from the BL-065 backlog block if that empties it.`);
  }
  if (fresh.length || fixed.length) {
    console.log(`\n${fresh.length} new pair(s) below the floor, ${fixed.length} recorded pair(s) no longer below it.`);
    process.exitCode = 1;
    return;
  }
  const lines = passingReport(css);
  // A null report means the tree is not clean, which the guard above should already have caught.
  // Asserting it here rather than trusting the ordering keeps the two halves from drifting apart.
  if (!lines) throw new Error('passingReport refused a tree that the guard above passed as clean');
  for (const line of lines) console.log(line);
}

// The passing path's output is built rather than printed inline so a test can assert on it. Review
// found the previous version pinned only `unresolved`, one level below the claim: deleting the print
// loop and its destructure left the suite green, the gate exit 0, and three prose statements that the
// ratio is printed on every run false again. The test spawns this script and reads stdout, so the
// thing the docs claim is the thing that is checked.
//
// Everything in the report derives from the module's own data. An earlier version took the pair count
// as a parameter, which put half the summary line under the caller's control and half under the
// module's, and the pair count is the one figure that has gone stale in this item's prose three times.
// It also hardcoded "0 new", which is true only past `main()`'s guard: exported, that made a function
// that reports green for a red tree. It returns null on a tree with unresolved findings instead, so a
// caller that skips the check gets nothing rather than a reassuring lie.
export function passingReport(css) {
  const { fresh, fixed, recorded } = unresolved(css);
  if (fresh.length || fixed.length) return null;
  const measured = PAIRS.length * 2;
  const lines = [`${measured} pairs measured across the dark and light themes, ${KNOWN.length} recorded below the floor, ${fresh.length} new.`];
  // The recorded ones report their current ratio rather than only their count. A number nobody can
  // see cannot be noticed drifting, and these are exactly the pairs a later change is most likely to
  // move, since the gate stays green anywhere between the floor and 1:1.
  for (const f of recorded) {
    lines.push(`  ${f.ratio === undefined ? '   ?' : `${f.ratio.toFixed(2)}:1`}  ${f.fgName} on ${f.bgName} (${f.themeName}), ${f.where || f.message}`);
  }
  return lines;
}

if (process.argv[1] && process.argv[1].endsWith('check-palette.mjs')) main();
