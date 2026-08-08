import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { THEMES, DEFAULT_THEME, themeAttribute, normaliseTheme } from '../src/js/lib/theme.js';
import { PAIRS, KNOWN, parseHex, luminance, ratio, tokensIn, checkAll, unresolved } from '../scripts/check-palette.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => readFileSync(join(ROOT, ...rel.split('/')), 'utf8');
const css = read('src/styles.css');

const DARK = ':root, :root[data-theme="dark"]';
const LIGHT_ATTR = ':root[data-theme="light"]';
const LIGHT_MEDIA = ':root:not([data-theme="dark"])';

// Comments are blanked rather than removed so every offset still lines up with the original text.
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));

// The last token block is the light palette inside the media query, so the search for stray
// literals begins after that whole @media block closes. Counting braces is what gets this right:
// taking the first `}` after the selector lands inside the media query and leaves half the token
// declarations in scope, which is how this test first reported four tokens as stray literals.
function endOfTokenBlocks(text) {
  const src = stripComments(text);
  const at = src.indexOf(LIGHT_MEDIA);
  assert.ok(at > 0, 'the media-query light block is no longer where this test looks for it');
  const open = src.lastIndexOf('@media', at);
  let depth = 0;
  for (let i = src.indexOf('{', open); i < src.length; i += 1) {
    if (src[i] === '{') depth += 1;
    else if (src[i] === '}') {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error('the media-query light block is unclosed');
}

test('the three offered themes are system, dark and light', () => {
  assert.deepEqual(THEMES, ['system', 'dark', 'light']);
});

test('system writes no data-theme attribute at all', () => {
  // Writing data-theme="system" would match neither the dark selector nor the light one, so the
  // page would fall through to the bare `:root` defaults and strand itself on dark while the
  // control said it was following the system. Absence is what lets the media query decide.
  assert.equal(themeAttribute('system'), null);
});

test('an explicit theme writes its own name', () => {
  assert.equal(themeAttribute('dark'), 'dark');
  assert.equal(themeAttribute('light'), 'light');
});

test('an unrecognised theme is treated as system rather than written through', () => {
  // A value that reaches here from an older or hand-edited settings blob must not become a
  // data-theme nobody styles.
  assert.equal(themeAttribute('midnight'), null);
  assert.equal(themeAttribute(''), null);
  assert.equal(themeAttribute(undefined), null);
});

test('normalising is what turns an unknown stored theme into the default', () => {
  assert.equal(normaliseTheme('light'), 'light');
  assert.equal(normaliseTheme('midnight'), DEFAULT_THEME);
  assert.equal(normaliseTheme(undefined), DEFAULT_THEME);
  assert.equal(normaliseTheme(null), DEFAULT_THEME);
  assert.equal(DEFAULT_THEME, 'system');
});

test('main.js normalises the stored theme on the way in and on the way from the control', () => {
  // Both entry points have to go through the same normalisation, or a value rejected at one gets
  // in at the other. main.js cannot be imported here because it reads `document` at module scope,
  // so this reads it the way library.test.js does.
  const src = read('src/js/main.js');
  assert.match(src, /theme:\s*normaliseTheme\(raw\.theme\)/, 'loadSettings no longer normalises');
  assert.match(src, /settings\.theme\s*=\s*normaliseTheme\(next\)/, 'setTheme no longer normalises');
  assert.match(src, /theme:\s*settings\.theme/, 'saveSettings no longer persists the theme');
});

test('the settings control offers exactly the themes the code accepts', () => {
  // A fourth option in the markup would be silently normalised back to system on selection, and a
  // missing one would be unreachable.
  const html = read('src/index.html');
  const select = html.match(/<select id="opt-theme">([\s\S]*?)<\/select>/);
  assert.ok(select, 'the theme control is no longer a select this test can read');
  const values = [...select[1].matchAll(/value="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(values, THEMES);
});

test('the two light token blocks declare exactly the same tokens', () => {
  // The light palette is written out twice on purpose: once for the explicit override and once
  // inside the prefers-color-scheme query, because the module is deferred and a JS-only
  // resolution would paint dark and then flip. Duplication is the right call there and a
  // liability everywhere else, so this is the test that makes it safe to keep.
  const attr = tokensIn(css, LIGHT_ATTR);
  const media = tokensIn(css, LIGHT_MEDIA);
  assert.deepEqual([...media.keys()].sort(), [...attr.keys()].sort());
  for (const [name, value] of attr) {
    assert.equal(media.get(name), value, `${name} differs between the two light blocks`);
  }
});

test('every token the dark theme declares, the light theme declares too', () => {
  // A token missing from one palette silently falls through to the other's value, which is how a
  // dark surface colour ends up painted on a light page.
  const dark = tokensIn(css, DARK);
  const light = tokensIn(css, LIGHT_ATTR);
  const missing = [...dark.keys()].filter((k) => !light.has(k));
  assert.deepEqual(missing, [], `the light theme does not declare ${missing.join(', ')}`);
});

test('no rule outside the token blocks names a literal colour', () => {
  // The whole point of the refactor: a literal colour in a rule is a colour that cannot follow a
  // theme. The token blocks are where literals belong, so the search starts after the last of
  // them, and comments are stripped first because several of them quote the very hex values the
  // refactor removed.
  const body = stripComments(css).slice(endOfTokenBlocks(css));
  const literals = [...body.matchAll(/#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*[\d.]|\bhsla?\(\s*[\d.]/g)];
  assert.deepEqual(literals.map((m) => m[0]), [], 'a rule still carries a literal colour');
});

test('relative luminance follows the WCAG curve at both ends', () => {
  assert.equal(luminance([255, 255, 255]), 1);
  assert.equal(luminance([0, 0, 0]), 0);
});

test('black on white is the maximum contrast ratio of 21', () => {
  assert.equal(Math.round(ratio([0, 0, 0], [255, 255, 255]) * 100) / 100, 21);
});

test('contrast is symmetric, so pair order cannot change a verdict', () => {
  const a = ratio([18, 21, 27], [251, 252, 254]);
  const b = ratio([251, 252, 254], [18, 21, 27]);
  assert.equal(a, b);
});

test('shorthand and longhand hex parse to the same colour', () => {
  assert.deepEqual(parseHex('#fff'), [255, 255, 255]);
  assert.deepEqual(parseHex('#ffffff'), [255, 255, 255]);
  assert.equal(parseHex('not a colour'), null);
});

test('every measured pair names a real place it is rendered', () => {
  // A pair with no rendering site is a number that can drift unnoticed, and a floor met by a
  // combination the app never shows is not a floor.
  for (const [fg, bg, floor, where] of PAIRS) {
    assert.match(fg, /^--/);
    assert.match(bg, /^--/);
    assert.ok(floor === 4.5 || floor === 3, `${fg} on ${bg} has an unexpected floor`);
    assert.ok(where && where.length > 8, `${fg} on ${bg} does not say where it is rendered`);
  }
});

test('the recorded below-floor pairs are exactly the pairs that measure below it', () => {
  // Both halves matter. A new failure is the obvious one. A recorded pair that has since been
  // raised is the one that keeps the list from outliving its debt.
  const { fresh, fixed } = unresolved(css);
  assert.deepEqual(fresh.map((f) => f.key), [], 'a new pair is below the contrast floor');
  assert.deepEqual(fixed, [], 'a recorded pair now meets the floor and should be removed from KNOWN');
});

test('the recorded pairs are all non-text boundaries, never body text', () => {
  // Recording a body-text pair would be waiving readability, which is not a trade this list is
  // allowed to make. Every entry has to be a 3:1 boundary, not a 4.5:1 text pair.
  for (const key of KNOWN) {
    const [theme, fg, bg] = key.split(':');
    assert.ok(['dark', 'light'].includes(theme), `${key} names no theme`);
    const pair = PAIRS.find((p) => p[0] === fg && p[1] === bg);
    assert.ok(pair, `${key} is not one of the measured pairs`);
    assert.equal(pair[2], 3, `${key} is body text and must not be recorded as accepted`);
  }
});

test('a control boundary is measured against every surface it is drawn on, not just one', () => {
  // The pair list was measured in Edge against what the app actually paints, and three of the
  // surfaces it found were not the ones the list originally named. A checkbox in a row sits on the
  // page rather than on a card, a hero button sits on a card rather than on the page, and a text
  // input's border has that input's own fill on its inner side. Measuring one surface and calling
  // the boundary done is how a token passes the gate and still disappears somewhere on screen.
  //
  // `--track` is here for the same reason and was added later, by review: the trough renders on a
  // card in the reading hero and on the rail in the per-list bars, and listing only the card hid a
  // real degradation when the dark trough was darkened.
  const surfaces = (fg) => PAIRS.filter((p) => p[0] === fg).map((p) => p[1]).sort();
  assert.deepEqual(surfaces('--line-2'), ['--bg', '--card', '--card-2']);
  assert.deepEqual(surfaces('--cb-line'), ['--bg', '--card']);
  assert.deepEqual(surfaces('--track'), ['--card', '--rail']);
});

// Every class this app puts on something a reader operates, found by reading the markup and the
// renderer rather than by listing them here. Both sources are needed: the toolbar buttons are
// authored in index.html, while the rows are built in main.js.
function interactiveClasses() {
  const found = new Set();
  const add = (attr) => {
    for (const token of attr.replace(/\$\{[^}]*\}/g, ' ').split(/\s+/)) {
      if (token) found.add(token);
    }
  };
  const TAGS = 'button|input|select|textarea|a|summary';
  for (const m of read('src/index.html').matchAll(new RegExp(`<(?:${TAGS})\\s[^>]*class="([^"]*)"`, 'g'))) add(m[1]);
  // el('button', { class: '...' }) and its backticked form. The object literal is matched lazily up
  // to the class key, so other attributes before it do not have to be anticipated.
  for (const m of read('src/js/main.js').matchAll(new RegExp(`el\\(\\s*'(?:${TAGS})'\\s*,\\s*\\{[^{}]*?class:\\s*(?:'([^']*)'|\`([^\`]*)\`)`, 'g'))) add(m[1] ?? m[2]);
  return found;
}

test('nothing a reader operates is bordered with the ungated hairline token', () => {
  // `--line` carries no floor because it is decoration. That is a claim, and this is what stops it
  // rotting: it cross-references the rules that draw a border in `--line` against the classes the
  // markup and the renderer actually put on a button, an input or a link.
  //
  // The browser pass cannot cover this on its own, which review proved. `.rnote` is `border: 0`
  // until `.has-note` is set, so a fixture with no notes saved never painted it, and the one
  // control still on `--line` was invisible to a scan of what is rendered. A rule that paints only
  // in a state no fixture reaches needs a check that reads rules rather than pixels.
  const interactive = interactiveClasses();
  assert.ok(interactive.has('quiet'), 'the class scan found no toolbar buttons, so it is not reading the markup');
  assert.ok(interactive.has('rnote'), 'the class scan found no rendered controls, so it is not reading main.js');

  const offenders = [];
  for (const rule of stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const [, selector, body] = rule;
    if (!/border[a-z-]*:[^;]*var\(--line\)/.test(body)) continue;
    for (const cls of selector.matchAll(/\.([\w-]+)/g)) {
      if (interactive.has(cls[1])) offenders.push(`${selector.trim().split('\n').pop().trim()} borders .${cls[1]}`);
    }
  }
  assert.deepEqual(offenders, [], 'a control is bordered with --line, which carries no contrast floor');
});

test('a progress bar is measured where it carries its value, fill against trough', () => {
  // `--track` on `--card` cannot reach 3:1 while the `--red` fill still reads as the filled part,
  // so it stays recorded and this pair is measured in its place. Dropping it would leave the bar
  // with no gated contrast at all, which is worse than the ratio that is recorded.
  const pair = PAIRS.find(([fg, bg]) => fg === '--red' && bg === '--track');
  assert.ok(pair, 'the fill of a progress bar is no longer measured against its trough');
  assert.equal(pair[2], 3);
  for (const [selector, name] of [[DARK, 'dark'], [LIGHT_ATTR, 'light']]) {
    const tokens = tokensIn(css, selector);
    const r = ratio(parseHex(tokens.get('--red')), parseHex(tokens.get('--track')));
    assert.ok(r >= 3, `the ${name} progress fill measures ${r.toFixed(2)}:1 against its own trough`);
  }
});

test('both themes carry a colour-scheme declaration', () => {
  // Without it the browser paints its own form controls and scrollbars for the wrong theme, which
  // is the one part of the page CSS custom properties cannot reach.
  assert.match(css, /:root,\s*:root\[data-theme="dark"\][^}]*color-scheme:\s*dark/s);
  assert.match(css, /:root\[data-theme="light"\][^}]*color-scheme:\s*light/s);
});

test('every pair resolves in both themes, so nothing is skipped unmeasured', () => {
  // check() reports a missing token as a finding rather than skipping it, so an empty findings list
  // here means every pair in both themes was genuinely measured. The count is derived rather than
  // written down, because a figure in a comment is one more thing to keep in step with the list.
  const findings = checkAll(css);
  const unresolvable = findings.filter((f) => /not defined|not a plain hex/.test(f.message));
  assert.deepEqual(unresolvable.map((f) => f.message), []);
});
