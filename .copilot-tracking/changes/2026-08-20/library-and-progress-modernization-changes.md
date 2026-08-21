<!-- markdownlint-disable-file -->
# RPI Changes: Library and Progress modernization

## Metadata

* Task ID: MRT-005
* Related plan: .copilot-tracking/plans/2026-08-20/library-and-progress-modernization-plan.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-20/library-and-progress-modernization-plan-critique.md
* Implementation date: 2026-08-21

## Execution Status

* Status: Complete
* Declared invocation scope: Full plan
* Completed scope markers: P01, P01-T01, P01-T02, P01-T03, P02, P02-T01, P02-T02, P03, P03-T01,
  P04, P04-T01, P04-T02, P05, P05-T01, P06, P06-T01, P06-T02, P07, P07-T01, P07-T02, P08, P08-T01
  and P08-T02
* All remaining active-plan markers: None
* Status basis: the pure helpers with failing-first unit tests, the six rendering stages, the
  product records, the anchors round, the browser matrix and every gate are complete.

## Execution Summary

Everything Read, Added by Hand, Progress by Series and the compact reading-order overview now open
with a summary before their detail, group their rows under real headings, carry cover thumbnails,
and distinguish completed, active, empty and hand-added states by shape and words rather than by
colour. Every count keeps the scope it had. Long collections are capped and revealed on request.
Nothing about persistence, popup-safe launching, covers-off, either theme, forced colours, reduced
motion, keyboard operation or the screen-reader outline changed except to gain structure.

## Completed Work

### CHG-001: Pure summary and grouping helpers, proven failing first

* Related phase or task: P01, P01-T01, P01-T02 and P01-T03
* Files: src/js/lib/librarySummary.js, src/js/lib/model.js, src/js/lib/library.js,
  test/library-summary.test.js, test/progress-groups.test.js and test/library.test.js
* What changed and why: a new 89-line module exports `seriesKey`, `readSummary`, `manualSummary`,
  `dayOrdinal`, `readGroups` and `titleGroups`. Six progress helpers, `completionState`,
  `seriesWord`, `orderWord`, `progressSummary`, `progressGroups` and `orderStates`, were appended
  to the end of `src/js/lib/model.js` rather than given their own module, because a new import line
  in the main module moves every citation that names it. The library view table gained `summarise`
  and `group`, so each view declares its own summary and grouping rather than the renderer
  branching on which view it is drawing.
* Completion evidence: `src/js/lib/model.js` went from 1180 to 1238 lines, appended in one hunk at
  the end, so nothing above it moved.
* Validation: every new assertion was proven to fail before the helper existed, using
  `git stash push` and `git stash pop` rather than a checkout, which the critique found unsound for
  a file that does not yet exist.

### CHG-002: Summary before detail, grouping, covers and states

* Related phase or task: P02, P02-T01, P02-T02, P03, P03-T01, P04, P04-T01, P04-T02, P05, P05-T01,
  P06, P06-T01 and P06-T02
* Files: src/js/main.js, src/styles.css and src/index.html
* What changed and why: each of the four surfaces now renders a summary band first, then its rows
  grouped under `h2` headings inside named regions. Rows gained a cover thumbnail through the
  vetted painter at the same variant the reading rows already request, so no new image size enters
  the cache. State is carried by words and a shape, not a hue: "Fully read" with a tick, "Not
  started", "by hand", and a dashed empty state. The three Library and Progress sections took the
  existing wide-shell opt-out.
* Completion evidence: measured in Edge. The content column goes from 876px at both widths to 964px
  at 1280 and 1296px at 2560. Everything Read goes from 0 headings to 9 and from 0 covers to 21.
  Progress goes from 0 headings to 1. Horizontal overflow is 0px on all four surfaces before and
  after, at both widths.
* Validation: `src/index.html` holds 835 lines before and after, differing on exactly three lines.
  `src/js/main.js` gained no line above the anchors marker at line 4094; 27 lines differ above it
  and every one is an in-place replacement, verified by index-for-index comparison against the
  committed file rather than by trusting hunk headers.

### CHG-003: Two defects found by reading the rendered result

* Related phase or task: None. Both were found by inspecting screenshots of the finished work, and
  the user approved fixing them.
* Files: src/js/main.js and src/styles.css
* What changed and why: the row meta line already ends in "In no list", so a chip repeating it was
  heard twice by a screen reader, and on the hand-added view, where every row is in no list, it
  printed a column that distinguished nothing. The chip and its two rules were removed. Separately,
  a derived grouping applied to a short collection degrades into a heading per row: measured on the
  hand-added view with four entries, four headings and four counts, all of them 1. `GROUP_MIN` now
  holds derived groupings back below twelve rows. The progress groupings are deliberately exempt,
  because there the group is the state itself and "Not started" is worth saying about one series.
* Completion evidence: Everything Read at 21 rows still groups into 9 headings; Added by Hand at
  four rows renders flat.
* Validation: re-shot and read against the previous images.

### CHG-004: Long collections stay scannable

* Related phase or task: P05 and P05-T01
* Files: src/js/main.js
* What changed and why: above 120 rows the list is sliced and a show-more button reveals the next
  120, so a several-hundred issue read history opens at once rather than laying out in full. The
  button is the first focusable control these views have ever held, so the rebuild behind it runs
  inside `preservingFocus`, restoring to the button when it survives and to the "Showing n of n"
  line when the last press removes it.
* Completion evidence: measured in Edge against a 171-row fixture. The view renders 120 rows and a
  button reading "Show 51 more". Pressing it renders 171 and leaves focus on the paragraph reading
  "Showing 171 of 171".
* Validation: proven failing first. With the focus options removed from the library rebuild, the
  same check reports focus on `BODY`.

### CHG-005: Product and governance records

* Related phase or task: P07, P07-T01 and P07-T02
* Files: PRODUCT_BACKLOG.md, CHANGELOG.md and GOVERNANCE.md
* What changed and why: BL-170 gained a table row and a detail block, the backlog introduction went
  from 128 to 129 shipped items with BL-170 appended to the list it names, and the three statements
  of the main module's size were re-derived from 4,801 to 5,021. The changelog gained an entry
  under Unreleased. The governance record's derived counts went from 148 items and 142
  constraint-gate lines to 149 and 143, because a suite assertion states them and adding a backlog
  block breaks it.
* Completion evidence: counts, sizes and publication gates green; the suite's governance assertion
  passes.
* Validation: every count in every part touched was re-derived rather than carried forward.

### CHG-006: The anchors round

* Related phase or task: P08, P08-T01 and P08-T02
* Files: docs/anchors.lock.json and the eight documents whose citations moved
* What changed and why: 483 locked citations point into files this change edits. 397 were
  positionally unchanged and needed only re-reading; 86 moved and had their citing prose re-aimed.
* Completion evidence: the round closed at 993 unchanged, 0 drifted, 0 new, 0 removed, exit 0, with
  the total citation count preserved at 993 and the `absent:` exempt count unmoved at 2.
* Validation: recorded in the review log.
