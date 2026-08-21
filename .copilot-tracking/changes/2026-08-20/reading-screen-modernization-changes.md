<!-- markdownlint-disable-file -->
# RPI Changes: Reading screen modernization

## Metadata

* Task ID: MRT-003
* Related plan: .copilot-tracking/plans/2026-08-20/reading-screen-modernization-plan.md
* Phase details: .copilot-tracking/details/2026-08-20/reading-screen-modernization-phase-details.md
* Implementation date: 2026-08-20

## Execution Status

* Status: Complete
* Declared invocation scope: Full plan
* Completed scope markers: P01, P01-T01, P01-T02, P02, P02-T01, P02-T02, P03, P03-T01, P04, P04-T01,
  P05, P05-T01, P05-T02, P05-T03, P06, P06-T01, P06-T02, P06-T03, P06-T04, and P06-T05
* All remaining active-plan markers: None
* Status basis: The source change, the failing-first checks, the browser evidence, the product
  records, and every gate are complete.

## Execution Summary

The active reading-order screen now goes past the prose measure, states its progress in text rather
than in a tooltip, gives the next issue a cover and a single dominant action, wraps its upcoming
shelf instead of clipping it, and separates its rows. List management is demoted without being
hidden or removed from the tab order. Popup-safe launching, local persistence, covers-off, both
themes, forced colors, reduced motion and every accessibility behaviour are unchanged.

## Completed Work

### Width, progress, hero, tools, shelf and rows

* Related phase or task: P01, P01-T01, P01-T02, P02, P02-T01, P02-T02, P03, P03-T01, P04, P04-T01,
  P05, P05-T01, P05-T02, and P05-T03
* Files: src/index.html, src/styles.css, and src/js/main.js
* What changed and why: The reading view takes the existing wide-shell opt-out; the progress ring
  grew and its figure moved out of a `title` and onto the screen; the hero cover, title and primary
  action grew while the third action became a link; the list-management strip lost its five borders
  and gained one bound; the shelf became a wrapping row; and the rows gained a separator, a larger
  thumbnail and a current-row marker.
* Completion evidence: Measured in Edge. The reading view goes from 876px at both widths to 964px
  and 1296px. The hero cover goes from 176x264 to 248x372. The shelf goes from 62px of overflow at
  both widths to 0px at both. The progress figure goes from a `title` reading `0 / 8` to on-screen
  text reading `0 of 8 read` and `8 to go · 0%`.
* Validation: Lint clean. Suite 1225 pass, 0 fail. Counts, sizes, palette and publication gates all
  green, with the palette reporting 88 pairs and 0 new below the floor.

### Hold the anchors budget by choosing where to write

* Related phase or task: None. This is a constraint the plan recorded and the implementation obeyed,
  not a task the plan set.
* Files: src/index.html and src/js/main.js
* What changed and why: Both files were edited strictly in place, with every replacement holding the
  original line count, so that the 310 citations pointing into them keep their line numbers and only
  the handful of directly edited lines drift. All new declarations went to the end of the stylesheet,
  where 8 citations sit below rather than 41.
* Completion evidence: Both files still hold exactly 835 and 4801 lines after the change.
* Validation: The anchors round is recorded in the review log.

### Correct the governance record's derived count

* Related phase or task: None. It was found by the suite, not by the plan.
* Files: GOVERNANCE.md
* What changed and why: The governance record states how many backlog detail blocks carry a
  constraint check, and a test derives both figures from the backlog itself. Adding BL-169 added one
  of each, so the sentence had to move from 147 and 141 to 148 and 142.
* Completion evidence: The test that derives the figures passes.
* Validation: Part of the 1225.

### Correct a changelog sentence the change falsified

* Related phase or task: None.
* Files: CHANGELOG.md
* What changed and why: The unreleased entry for the landing page said that pages which are mostly
  words, "such as the reading list and the settings", were unchanged. The reading screen is now one
  of the views that goes wide, so naming it there would have shipped a false statement in the same
  release that falsified it. The sentence now names the settings and the disclaimers, which are still
  held at the prose measure, and the new entry above it says what the reading screen does instead.
* Completion evidence: The prose measure itself did not move, so the rest of the sentence stands.
* Validation: Read against the measured widths of both views.

### Record the departure from BL-165

* Related phase or task: None.
* Files: PRODUCT_BACKLOG.md
* What changed and why: BL-165's second task was to hold every prose view at the width it already
  had. This change takes the reading screen past that width, so BL-169's block records the departure
  and the reason: the reading screen is a working surface with a cover, a shelf and a table on it
  rather than a page of prose, and holding it at a reading measure was costing it the shelf. BL-165's
  own record was left as written, because it is a true account of what that change measured.
* Completion evidence: The prose measure is unchanged and the views that carry prose still sit on it.
* Validation: Measured at both widths.

### Fix two defects an independent review found in the opened pull request

* Related phase or task: P04-T01 and P05-T01, both reopened after the branch was pushed.
* Files: src/styles.css, test/reading-screen.test.js, and scripts/browser-check.mjs
* What changed and why: The shelf's `auto-fit` track list collapsed its empty tracks and handed
  their width to the survivors, so a partly read order held its remaining covers hundreds of pixels
  apart. It is now a wrapping flex row with `flex: 1 1 112px` and the same cap. Separately, the row
  separator and the current row's accent outline both weigh 0-2-0, and the later separator took the
  top edge of the current row whenever a read row sat above it, which is every state except import.
  The separator now stands down for a hovered or current row.
* Completion evidence: The shelf measures 487px between two remaining tiles before the fix and the
  declared gap after it, with the full-shelf figures unchanged at 125px over two rows at 1280 and
  149px over one row at 2560. The current row's four border colours go from one line colour and
  three accent to four accent.
* Validation: Three browser assertions were added and each was watched to fail on the rule it
  replaces. The two edited unit assertions fail on the stashed stylesheet. Suite 1225 pass, 0 fail;
  browser 119 assertions across 14 scenarios; every other gate green.
* What made them survive the first pass: both gates and both hand measurements looked at an order at
  import, and both rules are correct there. The added assertions drive the app into a partly read
  order first, which is where a reader spends all but the first moment of an order.

## Divergences from the plan

* The plan expected to need a new palette pair. It did not. The gate already treats the hero as a
  card surface, so every new combination was already covered, and adding a pair would have asserted
  a surface that does not exist.
* The plan expected the row separator to be a bottom border. It is an adjacent-sibling top border
  instead, because a bottom border would have drawn a line under a collected-edition heading and
  would have collided with the theme suite's rule about hairlines on interactive classes.
* The plan did not anticipate the governance or changelog corrections. Both were found by running the
  gates rather than by reading the plan.
