# Research: Library and Progress modernization

Task id: MRT-005
Task slug: library-and-progress-modernization
Date: 2026-08-20
Phase: Research

## Question

Modernize the Library and Progress surfaces with the adaptive purple visual system already
shipped by MRT-002 through MRT-004. Five surfaces are in scope, the fifth confirmed by the owner
when asked which of two candidates "the compact reading-order overview" meant, the answer being
both:

1. Everything read, the library sub-view whose id is view-library-read.
2. Added by hand, the library sub-view whose id is view-library-manual.
3. Progress by series, the view whose id is view-progress.
4. The order tiles on the landing page, the section whose id is home-yours.
5. The full-order panel in the reading view, the details element whose id is full.

## Wave 1, wider: what these surfaces are today

**Everything read and Added by hand** are rendered by one function, renderLibrary, reading the
LIBRARY_VIEWS array in src/js/lib/library.js. That array is the single source of truth for a
sub-view's value, label, subtitle, empty state, hand-added badge policy and row selector. It is
validated at module load by libraryViewProblems and mirrored by test/library.test.js, which also
holds the array and the markup together: every id="view-*" section in src/index.html must match
the routes in src/js/lib/route.js spread with LIBRARY_VIEWS, and every rail button must carry a
span with class lbl holding exactly the view's label.

The renderer writes the heading and subtitle from the view record, then a single paragraph with
class rail-hint reading "N issues.", then one flat row per record. A row is a div with class
result holding a title and a meta line reading "Read <date> · <series> · In <lists>", with the
literal phrase "In no list" where an issue belongs to nothing, and a badge reading "by hand" on
the Everything read view only.

There is no cover art on either view, no grouping, and no summary beyond the one count.

**Progress by series** is rendered by renderProgress. It reads a module-level progressScope of
'list' or 'all', deliberately not persisted, hides the scope fieldset when no list exists,
rewrites the subtitle to state the scope in words, then emits one flat row per series with a
progress element. The two scopes are answered by seriesProgress(state, listId) and
seriesProgress(state). There is no summary line at all, and a reader with forty tracked series
gets forty identical rows with no way to see how many are finished.

**The landing page order tiles** are rendered by renderYours into home-yours-list. Each tile is a
button carrying the list name, a div-based bar with class pbar, and a count printed as "3 / 20".
The accessible name is built by labelledName from that same painted count, deliberately, because
an earlier version said "3 of 20" in the name and split the run the tile shows. There is no state
word, no cover, and nothing above the tiles saying how many orders there are.

**The full-order panel** is rendered by renderRows. The summary element carries a count element
whose id is full-count, currently reading "N unread". The panel then holds the reading filter
pills and the rows, grouped into collected-edition runs by headings with class row-group. Two
behaviours here are pinned by tests: the full-count write must happen before the early return
taken when the details element is closed, and that guard must read exactly
`if (!$('#full').open) { rowsPending = true; return; }`. The row cache key template literal and
the three cache comparison lines are asserted by regex, and commitRows must drop stale nodes
before it places wanted ones.

## Wave 2, deeper: the constraint that decides the shape of this change

The evidence anchors gate is the dominant cost here, not the rendering work. docs/anchors.lock.json
holds 993 citations, each fingerprinted by the content of the lines it names rather than by the
numbers. Inserting a line into a file breaks every citation below the insertion, and each break is
a manual re-aim that has to be derived twice and reconciled.

Exposure was measured per candidate insertion point by counting the citations in the lock that
name a line at or after it, and the citations whose range straddles it:

| Insertion point | Citations after | Straddling |
|---|---|---|
| src/js/main.js inside renderRows, around line 2676 | 124 | 2 |
| src/js/main.js inside renderProgress, around line 4111 | 47 | 4 |
| src/js/main.js at the end of the file | 0 | 0 |
| src/index.html around line 441 | 18 | 1 |
| src/styles.css at the end of the file | 0 | 0 |
| src/js/lib/model.js around line 805 | 21 | 1 |
| scripts/browser-check.mjs around line 1450 | 1 | 0 |
| scripts/check-palette.mjs at the end | 0 | 0 |
| PRODUCT_BACKLOG.md, any insertion | 33 | 0 |

Citations naming the three files most likely to be edited: 248 in src/js/main.js, 77 in
src/styles.css, 69 in src/index.html.

Two facts make the cheap shape available. First, every container these surfaces need is already
an empty shell filled from JavaScript: the results div in both library sections, series-progress,
home-yours-list and full-count. So src/index.html gains no line and loses none, and its 69
citations do not move. It does change on three lines, each of them a class attribute taking the
existing view-wide opt-out, which alters content without altering position: exactly one live
citation covers any of the three, and it is a claim about the two library sections that stays true,
so it is blessed rather than re-aimed. Second, a new file has no citations, so rendering logic
moved into new modules under src/js/lib/ costs nothing, and an existing module appended to at its
end costs nothing either.

That gives the rule this change is built on. New CSS is appended at the end of src/styles.css. New
logic goes into a new module and into the end of an existing one. src/js/main.js is edited freely
only below the progress section marker, which starts at line 4094, and every edit above that marker
replaces N lines with exactly N lines. Four edits above the marker are needed and all four fit that
rule: the model module's import list, the covers setting repaint, the renderYours body, and two
lines inside renderRows. The import is the reason the progress helpers are appended to the model
module rather than given a module of their own: a new import line is a new line at the top of
main.js, and that alone would move all 248 of its citations.

The residual cost is about 47 re-aims in src/js/main.js plus about 33 in PRODUCT_BACKLOG.md and a
few in CHANGELOG.md, against 248 if the file were edited freely near the top.

## Wave 3, contrarian: three assumptions attacked

**"The full-order panel can be improved without touching renderRows."** False. The summary element
is the only always-visible part of that panel, so the useful summary has to go through full-count,
and full-count is written inside renderRows. The attack found the cheaper answer rather than
overturning the conclusion: the test asserts the literal text `$('#full-count').textContent`
appears in renderRows before the guard, so the assignment must stay there, but its right-hand side
may become a call. One further line is needed for the panel strip, and the rowsPending assignment
after the guard can carry it as a second statement on the same line. The lint configuration has no
max-len and no max-statements-per-line rule, so both are legal.

**"A render cap changes what a count means."** It would, if the cap were applied before the count.
Applying it after leaves every stated total derived from the full row set and adds one explicit
sentence naming both numbers. The summary figures are computed from the selector output, the cap
only decides how many rows are appended, and the on-screen sentence says "Showing 100 of 1,240".

**"Cover art can be added to library rows with no other change."** False, and this is the defect
the contrarian wave actually found. paintCoverUrl reads the covers setting at the moment it sets
the src, by design, so a row rendered while covers are off holds no src. setCovers repaints the
reading view and the landing page explicitly for that reason and repaints nothing else, because
until now nothing else painted a cover. Adding covers to the library and progress views without
extending that function would leave a reader who toggles covers on while standing on Everything
read looking at text tiles until the next store write.

## Gate baseline, measured on a clean tree before any edit

| Gate | Result |
|---|---|
| npm run lint | 0 problems |
| npm run anchors | 993 unchanged, 0 drifted, 0 new, 0 removed, 2 exempt, exit 0 |
| npm run counts | 143 ranked rows, 5 parked, 148 detail blocks: 128 Shipped, 13 Ready, 6 Dropped, 1 Proposed |
| npm run sizes | 7 stated sizes agree |
| npm run palette | passes, 4 recorded below-floor pairs |

src/js/main.js is 4,801 lines and src/styles.css is 1,207 lines at this baseline. Three statements
of the first figure in PRODUCT_BACKLOG.md are checked by the sizes gate and will have to be
re-derived; two further statements of a different figure carry a sizes:frozen marker and are
exempt.

## What the visual system already provides

Colour comes only from tokens; test/theme.test.js fails on any literal colour outside the token
blocks. The roles are settled: accent is a surface white text sits on, accent-text is the brand as
text, blue is links and focus, teal is positive, amber is editorial, red-fg is danger only, and
track with accent draws a progress bar. Page furniture sits on the canvas width and prose on the
column width, and a view opts out of the prose measure with view-wide.

Reusable classes already carrying gated colour pairs: results, result, result-main, result-title,
result-meta, pbar, badge with its variants, fp filter pills, sec and sec-h, shelf-section,
rail-hint, tile and the ocard family. Fallback cover tiles use the fallback, rf, of and tf
patterns with fallback-a, fallback-b, fallback-fg and an h hue custom property, and every cover
rule has a body.nocovers counterpart.

scripts/check-palette.mjs exports a PAIRS list of foreground token, background token or declared
surface, floor and description. The test validates the shape of that list rather than enumerating
it, so adding a pair is cheap. Reusing combinations already in the list, which is text, muted and
dim on card and card-2, teal on card and card-2, accent-text on card, and accent on track, costs
nothing at all and is the recommended route.

Reduced motion is answered by one block near the end of the stylesheet, and forced colors by three
blocks after it. A new appended section must end with its own forced-colors block so it lands
after all three.

## Constraints checked

| # | Check |
|---|---|
| 1 | No image bytes are hosted, proxied, cached or stored. Cover thumbnails reuse the existing coverUrl and paintCover path, which sets a remote URL on an img element. |
| 2 | Nothing is scraped. No new network call of any kind. |
| 3 | No accounts, cloud, analytics or telemetry. Every figure proposed is a count of records already in local state, computed at render time and stored nowhere. |
| 4 | Runtime dependencies stay at zero. New modules are plain ES modules in src/js/lib/. |
| 5 | The origin is untouched. Navigation stays on the hash. |
| 6 | The availability badge and its five states are not touched. No surface in scope renders one. |
| 7 | The Marvel Unlimited launch path is not touched. No new await enters any click handler. |
| 8 | The 2025 metadata boundary is not touched. |
| 9 | Android emulation is not revisited. |
| 10 | No market framing. The summary figures are facts about one reader's own records, not segments, funnels or trends. |
| 11 | No em or en dash in any added line. The lint rule catches literals and template elements, and the dash scan over the added lines of the diff catches prose. |

## Risks

- The anchors round is the highest risk step and is not delegable. It must be run by the same
  person who reads the bless print, with both derivation methods reconciled.
- test/library.test.js pins literal source text inside renderRows and commitRows. Any edit there
  has to keep those strings intact.
- Adding fields to LIBRARY_VIEWS means libraryViewProblems and its test fixture both change. That
  is the intended cost of keeping one source of truth rather than a second map keyed by value.
- The counts gate detects prose repeated across the nineteen documents, so the backlog block and
  the changelog entry must not share a block of wording.

## Planning readiness

Ready. Every surface, selector, renderer, test and gate that the change touches has been read, the
anchors exposure is measured rather than estimated, the shape of the change follows from that
measurement, and the one defect the contrarian wave found has a named fix.
