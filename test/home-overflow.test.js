import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { overflowState } from '../src/js/main.js';

// The landing grid caps at twelve and hands the rest to the catalog page. The cap is deliberate
// and is not what these check: a hundred cards on the landing page is a wall, not a page you can
// take in, and the catalog page has the facets and the search box for going deeper.
//
// What these check is that the reader is told, and can act, at the point they run out. Measured in
// Edge at 1280x900 against the 19 orders bundled today, the grid ended at y=1526 while the only
// control sat at y=134, so the way out was 1,392px behind a reader who had just scrolled to the
// bottom. Nothing was broken and nothing was hidden; the affordance was simply never on screen
// when it was wanted, which is indistinguishable from its not existing.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const markup = readFileSync(join(ROOT, 'src', 'index.html'), 'utf8');

test('an overflowing grid says how much it is holding back', () => {
  const state = overflowState(19, 12);
  assert.equal(state.hidden, false);
  assert.equal(state.count, 'Showing 12 of 19 reading orders.');
});

test('the action names the whole catalog, not the remainder it does not append', () => {
  const state = overflowState(19, 12);
  assert.equal(state.action, 'See all 19 reading orders →');
  // It navigates to the catalog. A label counting the seven it leaves behind would promise an
  // append, which is a different interaction from the one the button performs.
  assert.doesNotMatch(state.action, /\b7\b/);
});

test('a grid showing everything offers nothing to expand', () => {
  for (const [matched, shown] of [[12, 12], [5, 5], [0, 0], [1, 1]]) {
    const state = overflowState(matched, shown);
    assert.equal(state.hidden, true, `${matched} of ${shown} should be complete`);
    assert.equal(state.count, '');
    assert.equal(state.action, '');
  }
});

// One rule, not two. The count line and the controls previously derived "is there more" from
// different expressions, which agreed only because the slice length happened to equal the cap.
test('the count and the action never disagree about whether there is more', () => {
  for (let matched = 0; matched <= 40; matched += 1) {
    const shown = Math.min(matched, 12);
    const state = overflowState(matched, shown);
    assert.equal(state.hidden, matched === shown, `disagreed at ${matched}`);
    assert.equal(state.count === '', state.hidden);
    assert.equal(state.action === '', state.hidden);
  }
});

// The case that tells the two rules apart, and the reason the loop above cannot. While the slice
// is exactly the cap, "more than the cap" and "more than is shown" give the same answer for every
// input, so a rule written against the cap passes the loop untouched. Raise or drop the cap
// without touching this and the difference appears at once: a control offering to reveal the
// nineteen orders already on screen, or a count claiming a shortfall that is not there.
test('showing everything is complete even when there is more than a capful of it', () => {
  assert.equal(overflowState(19, 19).hidden, true, 'offered to expand a grid that is already whole');
  assert.equal(overflowState(19, 19).count, '');
  assert.equal(overflowState(19, 19).action, '');
  assert.equal(overflowState(40, 40).hidden, true);
  // And the converse: fewer than a capful shown, because a filter narrowed the slice.
  assert.equal(overflowState(19, 4).hidden, false);
  assert.equal(overflowState(19, 4).count, 'Showing 4 of 19 reading orders.');
});

// The catalog is meant to grow. A rule that only reads correctly at today's 19 is a rule that
// breaks silently on the day someone adds the hundredth order.
test('the wording holds at sizes the catalog has not reached yet', () => {
  assert.equal(overflowState(100, 12).action, 'See all 100 reading orders →');
  assert.equal(overflowState(100, 12).count, 'Showing 12 of 100 reading orders.');
  assert.equal(overflowState(13, 12).count, 'Showing 12 of 13 reading orders.');
});

// The defect itself, which is positional rather than logical. Every part of the old behaviour was
// correct in isolation; the way out was just never rendered anywhere the reader would be looking.
test('there is a way out of the grid below the grid, not only above it', () => {
  const section = markup.slice(markup.indexOf('id="home-catalog"'));
  const grid = section.indexOf('id="home-grid"');
  const below = section.indexOf('id="home-more"');
  const above = section.indexOf('id="home-see-all"');

  assert.ok(grid > -1, 'the landing grid is not in the markup');
  assert.ok(above > -1 && above < grid, 'the header control is expected above the grid');
  assert.ok(below > -1, 'nothing below the grid offers the rest of the catalog');
  assert.ok(below > grid, 'the control meant to sit under the grid is above it');
});

test('the control below the grid is operable, not a sentence about the shortfall', () => {
  const tag = markup.match(/<(\w+)[^>]*id="home-more"/);
  assert.ok(tag, 'the control below the grid is missing');
  assert.equal(tag[1], 'button', 'the way out of the grid is not something a reader can press');
  assert.match(markup, /<button[^>]*id="home-more"[^>]*hidden/, 'it is not hidden until it is needed');
});
