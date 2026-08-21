# Plan: Library and Progress modernization

Task id: MRT-005
Task slug: library-and-progress-modernization
Date: 2026-08-20
Research: `.copilot-tracking/research/2026-08-20/library-and-progress-modernization-research.md`

## Shape of the change, read this before anything else

This section is not advice. Breaking any rule in it costs hours of manual repair in the evidence
anchors gate, and the repair is not delegable.

**Rule 1. src/js/main.js may only change freely below its progress section marker.**
That marker is the comment line reading `// --------` followed by `progress`, currently at line
4094. Below it, edit and add whatever the plan asks for. Above it, exactly four edits are needed
and **every one of them must replace N lines with exactly N lines**. No insertion, no deletion, no
reflow. Comments may be rewritten to keep a count, and two statements may share a line: the lint
configuration has no max-len rule and no max-statements-per-line rule.

The four are the model import list, `setCovers`, `renderYours`, and two lines inside `renderRows`.
The import is the reason the new progress helpers go where they do: main.js cannot gain an import
line without moving all 248 evidence citations that name it, but the existing multi-line import
from the model module can take five more names on a line it already has.

New functions go **at the end of the file**, after the last existing function, in a new section
introduced by a comment banner in the style already used in that file.

**Rule 2. src/styles.css only grows at the end.** Append one new section. It must end with its own
`@media (forced-colors: active)` block so that block lands after the three that already exist.
Nothing above the append point may be edited.

**Rule 3. src/index.html changes on three lines and no others.** The three lines carry the opening
tags of the progress view and the two library sections. Each gains `view-wide` in its class
attribute. No line is added or removed from that file.

**Rule 4. Never run `npm run anchors:bless`.** Never edit `docs/anchors.lock.json`. The anchors
round is run by the task owner after the implementation is otherwise complete. `npm run anchors`
will report drift while you work and that is expected; it is not yours to clear.

**Rule 5. No em dash and no en dash in any line you add**, in code, in comments, in copy, in the
backlog or in the changelog. Use a plain hyphen, a comma or a middle dot.

**Verification of rules 1 and 3**, run before handing back:

```
git --no-pager diff --unified=0 -- src/js/main.js src/index.html
```

Every hunk header whose old start is below 4094 in src/js/main.js must have equal old and new
lengths, and every hunk in src/index.html must have equal old and new lengths. The final line count
of src/js/main.js must equal 4801 plus exactly the number of lines appended after the old last
line, and `(Get-Content src\index.html).Count` must still be 835.

## Copy and count contract

Every figure below is a count of records already held in local state, computed at render time and
stored nowhere. No figure may be invented, averaged, projected or trended.

The one existing figure whose meaning must not move is the library views' `N issues.` line. It is
the number of rows the view's selector returned: the size of the read map on Everything read, and
the number of issues whose source is manual on Added by hand. It survives as the first cell of the
new summary band with the same value.

## Two helper details that will otherwise be got wrong

`el` sets a boolean attribute to the empty string, so `'aria-hidden': true` renders
`aria-hidden=""`, which is not what `aria-hidden="true"` means. **Every new node that needs hiding
from the accessibility tree must pass the string `'true'`.** Do not change the existing call sites
that pass the boolean; that is a separate finding and belongs in a later item, not in this change.

Functions declared at the end of the file are hoisted, so a call to one from a function defined
earlier is fine. A `const` declared at the end of the file is not hoisted, but it is only read
inside functions that run long after the module has finished evaluating, so a module-level `const`
for the cap and the shown-count maps may sit with the new functions at the end.

## Phase P01, the pure functions and their tests

<!-- rpi:phase id=P01 -->

### P01-T01 New module src/js/lib/librarySummary.js

<!-- rpi:task id=P01-T01 -->

A plain ES module, no DOM, imported only by `src/js/lib/library.js`. main.js never imports it,
which is why it costs no import line. Export exactly:

- `seriesKey(row)` returns `row.seriesId` when that is not null or undefined, and otherwise
  `` `unknown:${row.seriesName ?? 'Unsorted'}` ``. **This is a copy of the key rule inside
  `seriesProgress`, and it exists so the two cannot disagree.** A test must assert the two agree on
  a row with a series id, a row with only a name, and a row with neither.
- `readSummary(rows)` returns `{ issues, series, orphans }`. `issues` is `rows.length`. `series` is
  the number of distinct `seriesKey` values, so a row with no series metadata at all counts once
  into a single unknown bucket rather than vanishing, which is what the progress view already does.
  `orphans` is the number of rows whose `lists` array is empty.
- `manualSummary(rows)` returns `{ issues, read, orphans }`. `issues` is `rows.length`, `read` is
  the number of rows whose `read` is true, `orphans` as above.
- `dayOrdinal(ms)` returns the local calendar day of a timestamp as a whole number, computed as
  `Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000` on a `Date` built from `ms`.
  Subtracting two millisecond timestamps and dividing would be wrong across a daylight saving
  boundary, where a local day is 23 or 25 hours long; taking the calendar components first and
  reassembling them in UTC makes every day exactly 24 hours.
- `readGroups(rows, now)` returns an array of `{ key, label, rows }`, preserving the order in which
  each group is first met while walking `rows` in the order given. `now` is a millisecond
  timestamp. For each row, take `readAt`; if `Number.isFinite` is false for it the group is
  `{ key: 'nodate', label: 'No date' }`. Otherwise take
  `dayOrdinal(now) - dayOrdinal(readAt)` and apply in order: 0 or less gives `Today`, exactly 1
  gives `Yesterday`, 6 or less gives `In the past week`, otherwise if the month and year match
  `now` it gives `Earlier this month`, otherwise the label is the English month name and the four
  digit year, for example `July 2026`, with a key of `YYYY-MM`. The third label says `In the past
  week` rather than `Earlier this week` because it is a rolling seven days and crosses the calendar
  week boundary, and a label has to be true. Month names come from a literal array in the module,
  not from `toLocaleDateString`, so the label is the same under every locale and can be asserted.
- `titleGroups(rows)` returns an array of `{ key, label, rows }` in first-met order, where the key
  and label are the first character of `title` uppercased when that character is one of A to Z, and
  `#` otherwise.

### P01-T02 Five helpers appended to src/js/lib/model.js

<!-- rpi:task id=P01-T02 -->

These go at the **end** of that file, after its last existing export, so no citation in it moves.
They sit beside `listProgress` and `seriesProgress` in the same module because they are
derivations over what those two return, and because that module already carries a view-facing
derivation in `orderGapSentences`. Export exactly:

- `completionState(read, total)` returns `'done'` when `total` is above 0 and `read` is at least
  `total`, `'unstarted'` when `read` is 0, otherwise `'active'`. A total of 0 with a read of 0
  returns `'unstarted'`.
- `seriesWord(state)` maps `'done'` to `'Fully read'`, `'active'` to `'Reading'` and `'unstarted'`
  to `'Not started'`.
- `orderWord(state)` maps `'done'` to `'Finished'`, `'active'` to `'Reading'` and `'unstarted'` to
  `'Not started'`.
  **The two are separate on purpose.** A series row knows only that every issue of it the reader
  tracks has been read, which is not the same as the series being complete, and the view already
  says `tracked issues` for exactly that reason. An order, by contrast, is a fixed list, so
  finishing it is a true statement about the whole thing. Do not collapse these into one function
  and do not use the word `Complete` anywhere on the progress view.
- `progressSummary(rows)` over `seriesProgress` output returns `{ series, read, tracked, done }`,
  where `series` is `rows.length`, `read` and `tracked` are sums of those fields, and `done` is the
  number of rows whose `completionState(row.read, row.tracked)` is `'done'`.
- `progressGroups(rows)` returns up to three `{ key, label, rows }` entries, in the fixed order
  `active` labelled `In progress`, `unstarted` labelled `Not started`, `done` labelled
  `Fully read`. Empty groups are omitted. Within a group the incoming order is preserved, which is
  the series name order `seriesProgress` already produced.
- `orderStates(entries)` takes an array of `{ read, total }` and returns
  `{ orders, active, done, unstarted }`.

main.js reaches these by adding their names to the **existing** multi-line import from that module.
Append them to the line that currently ends with `orderGapSentences,`. That line grows; the file
does not.

### P01-T03 Tests

<!-- rpi:task id=P01-T03 -->

New files `test/library-summary.test.js` and `test/progress-groups.test.js`, in the style of the
existing tests: bare `node --test`, `node:assert/strict`, `test()` with no `describe()`.

Cover at least: an empty input for every exported function; the orphan count on a row set where
some rows have lists and some do not; that `seriesKey` and `seriesProgress` agree on the three row
shapes named above; each of the six `readGroups` labels, driven by a fixed `now` so the test is not
clock dependent; a pair of days spanning a daylight saving change in a zone that has one, asserting
the ordinal difference is exactly 1; a read date six days back and one seven days back, so the
boundary between the rolling week and the month is pinned; a `readAt` that is null and one that is
a boolean, both landing in `No date`; a title beginning with a digit landing in `#`; a total of 0;
a series with `read` above `tracked`, which must still read as `done`; and the fixed order of
`progressGroups` when all three groups are present.

Prove each new test can fail. The usual stash procedure does not work for a file that is new in
this change, because stashing may take the whole file rather than isolating the mutation. Instead:
copy the module to `$env:TEMP`, break one branch of it in the worktree, run `node --test`, watch
the specific assertion fail, then copy it back. Record which assertion failed for which mutation in
the changes record. Do not use `git checkout HEAD -- <file>`, which discards the index.

## Phase P02, the library sub-views

<!-- rpi:phase id=P02 -->

### P02-T01 Declare per-view behaviour in LIBRARY_VIEWS

<!-- rpi:task id=P02-T01 -->

In `src/js/lib/library.js`, give each entry two new fields:

- `summarise`, a function from the row array to an array of `{ figure, label }` cells.
- `group`, a function from the row array and a `now` timestamp to the group array.

For Everything read: cells are `[{ figure: n, label: 'issues read' }, { figure: s, label: 'series' },
{ figure: o, label: 'in no list' }]` from `readSummary`, and `group` is `readGroups`.
For Added by hand: cells are `[{ figure: n, label: 'added by hand' }, { figure: r, label: 'read' },
{ figure: o, label: 'in no list' }]` from `manualSummary`, and `group` is a wrapper over
`titleGroups` that ignores `now`.

Extend `libraryViewProblems` to report a missing or non-function `summarise` or `group` with the
same wording style the existing checks use, and update the fixtures in `test/library.test.js` so
its problem assertions still hold. Add one test asserting that every entry has both fields and that
they are functions.

The label wording is deliberate. Each cell reads as a sentence with its figure: `128 issues read`,
`31 series`, `4 in no list`. That is why the labels are lower case and are not headings.

### P02-T02 Rewrite renderLibrary and libraryRow

<!-- rpi:task id=P02-T02 -->

Both live below the marker, so edit them in place freely.

`renderLibrary` keeps its loop over `LIBRARY_VIEWS` and its heading and subtitle writes. After
those, for each view:

1. If the selector returned no rows, append a `div.empty-state` holding an aria-hidden glyph and a
   `p` carrying `v.empty`. `.empty-state` already exists in the stylesheet with a dashed border and
   centred padding, so reuse it rather than writing a second rule; it is what makes an empty view
   read as deliberate rather than broken, and the dashed edge is a shape difference rather than a
   colour one. Then move on.
2. Otherwise append the summary band, then the shown-count line if the list is capped, then one
   group section per group, then the show-more button if anything is held back.

The summary band is `div.sumbar` holding one `div.sumcell` per cell, each holding
`div.sumfig` with the figure and `div.sumlab` with the label. The figure is rendered with
`toLocaleString()` so a four figure count carries its separator.

The cap is a module-level `const LIBRARY_CAP = 120;` and a module-level
`const libraryShown = new Map();` keyed by the view value. On each render, take
`libraryShown.get(v.value) ?? LIBRARY_CAP`, clamp to `rows.length`, slice, and group the slice.
When the slice is shorter than the row array, append a paragraph with class `rail-hint` reading
`Showing ${shown.toLocaleString()} of ${rows.length.toLocaleString()}.` and a button with class
`btn btn-g` reading `Show ${Math.min(LIBRARY_CAP, rest).toLocaleString()} more`, whose handler adds
`LIBRARY_CAP` to the map entry and calls `renderLibrary()` again.

**Focus must be handled explicitly, and this is the part a cheap model will skip.** `renderLibrary`
runs on every store write, and it replaces the whole results container. Until now that container
held nothing focusable, so nothing could be lost; the show-more button is the first focusable thing
these views have ever had. Wrap each view's rebuild in `preservingFocus(box, () => { ... })` and
give the button `dataset: { act: 'more', key: v.value }`. `restoreFocus` matches on exactly those
two attributes and re-focuses the replacement node, which is why the pair is required rather than
decorative. When the last press removes the button, because everything is now shown, focus should
land on the shown-count line instead, so give that paragraph `tabindex="-1"` and pass a `fallback`
that returns it.

A group section is `section.lgroup` holding `h2.lgroup-h` with the label and a `span.lgroup-n`
with the group's row count, then the rows. The heading is a real `h2` under the view's `h1`, so
the screen reader outline gains a level rather than losing one.

`libraryRow` keeps its meta line, its `in no list` wording and its `by hand` badge exactly as they
are today, and gains two things:

- A cover, as `div.rcov` holding `img.rcov-i` with an empty `alt`, `loading="lazy"` and
  `decoding="async"`, and `div.rcov-f` with the issue number or `?`, painted by
  `paintCover(img, fb, row, 'portrait_incredible')`. That is the same variant the reading rows
  already request, so no new image size enters the cache. The fallback follows the pattern of the
  reading row's own fallback tile, which is a bordered box with no gradient, rather than the larger
  `.fallback` and `.ocard-art .of` tiles that use the fallback gradient tokens.
- A state chip when the row belongs to nothing: `span.badge.badge-nolist` holding an aria-hidden
  glyph and the words `In no list`. The meta line keeps saying it too, because the meta line is
  what a screen reader reads in order; the chip is the scannable copy.

The row keeps class `result` so every existing rule still applies, and gains class `result-cov` so
the appended stylesheet can give it a cover column without touching the shared rule.

## Phase P03, Progress by series

<!-- rpi:phase id=P03 -->

### P03-T01 Rewrite renderProgress

<!-- rpi:task id=P03-T01 -->

Below the marker, so free. Keep every existing line that decides scope: the `progressScope`
read, the hidden fieldset, the radio checked writes and the two subtitle strings are all unchanged,
because they are the only statement of what the counts are scoped to and requirement 5 turns on
them.

After the rows are fetched and the empty case handled, append in order:

1. `div.sumbar` with three cells from `progressSummary`: `{ series } series`,
   `{ read } of { tracked }` with label `tracked issues read`, and `{ done }` with label
   `series fully read`. The second cell's figure is the two numbers with the word `of` between
   them, which is the same phrasing the row meta already uses, so the band and the rows cannot be
   read as counting different things. The third cell says `fully read` rather than `complete`
   because the app knows only what the reader tracks, never whether a series has ended.
2. One `section.lgroup` per group from `progressGroups`, each with its `h2.lgroup-h` and count.
3. Inside a group, the existing row markup, plus a chip after the title: `span.badge.badge-done`
   with a tick glyph and the words `Fully read` for a done row, `span.badge.badge-none` with the
   words `Not started` for an unstarted row, and nothing at all for an active row, whose bar and
   figures already say where it is.

Apply the same cap and show-more control, with the same `preservingFocus` and `data-act` treatment.
Its counter must be keyed by **both** the scope and the active list id, not by a single number.
Two scopes and several lists share this one view, and a single counter would let expanding
All lists silently expand This list, and would carry one list's expansion onto the next list the
reader opens. Key it on something like `` `${progressScope}:${activeListId()}` `` so switching
either one starts again at the cap, which is also the behaviour a reader expects when the list
under them changes.

No cover art on this view. A series is recognised by its name, the row has no single issue to
stand for it, and inventing one would mean duplicating the series key logic that lives inside
`seriesProgress`. Recording the decision here is the point; the requirement asks for covers where
they help recognition, and here they do not.

## Phase P04, the landing page order tiles

<!-- rpi:phase id=P04 -->

### P04-T01 The renderYours replacement, line for line

<!-- rpi:task id=P04-T01 -->

`renderYours` sits above the marker and currently occupies 25 lines. Its replacement must occupy
exactly 25 lines. Keep the first four lines and the comment about the painted count. Replace the
tile construction with a call to a new `yoursTile` defined at the end of the file, and add one call
to a new `writeYoursSummary` defined there too. Pad or trim the comment prose to land on 25 lines
exactly; the comments are worth writing properly, not padding for its own sake.

The accessible name changes in one controlled way. It stays built by `labelledName` from the
painted count, and its context string becomes
`` `issues read, ${orderWord(completionState(read, total))}. Open this list` ``. That keeps the
visible count run intact at the front of the name and adds the state word that is now painted on
the tile, which is what a visible label must contain.

`writeYoursSummary(sec, state)` finds the section's `.sec-h`, creates a `span.sec-note` once and
reuses it, and writes `orderStates` as a middle dot separated sentence: the order count always,
then `${n} in progress`, `${n} finished` and `${n} not started`, each omitted when zero. With four
orders it reads `4 orders · 2 in progress · 1 finished · 1 not started`. Singular and plural must
both be right for the order count.

`yoursTile(list, state, read, total, count)` returns the tile children: a restrained mosaic, then
the existing name, bar and count, then the state chip.

The mosaic is `span.mosaic` holding exactly three `span.mosaic-c` cells. Each cell holds an
`img.mosaic-i` with an empty `alt`, `loading="lazy"` and `decoding="async"`, and a
`span.mosaic-f` fallback tile. Take the list's first three item ids, look each up in
`state.issues`, and paint each cell with `paintCoverUrl(img, fb, url, hue)` where the url is
`coverUrl(issue, 'portrait_incredible')` when there is an issue with a cover and `null` otherwise,
and the hue is `hueOf` of the issue's series name, falling back to the list name for a cell with no
issue at all. Passing `null` is the supported way to say there is no cover: `paintCoverUrl` then
removes the src, hides the image and shows the fallback, which is exactly the state a cell for a
list with fewer than three issues should be in. Three cells always, so the tile does not change
height with the data. The mosaic carries `'aria-hidden': 'true'`, because it is recognition, not
information, and the tile's name already carries every word.

The state chip is `span.badge` with `badge-done`, `badge-none` or no modifier, carrying
`orderWord(completionState(read, total))`, placed after the count. `Finished` is the right word for
an order, which is a fixed list the reader can genuinely reach the end of.

### P04-T02 Repaint the library when covers are switched on

<!-- rpi:task id=P04-T02 -->

`setCovers` sits above the marker. The comment above its two render calls explains why exactly
those two are called, and must be rewritten to explain why there are now three, staying inside the
same line count. Add `renderLibrary()` and nothing else.

The reason is `paintCoverUrl`: it deliberately declines to set a `src` while covers are off, so a
row rendered during that time holds no image until something renders it again. Before this change
no library row carried a cover, so nothing there needed repainting. Now they do.

`renderProgress()` is deliberately **not** added. That view paints no cover, so calling it would
buy nothing, and it would cost something real: it would throw away whatever the reader had expanded
past the cap and the focus that went with it.

## Phase P05, the full-order panel

<!-- rpi:phase id=P05 -->

### P05-T01 Two line-for-line edits inside renderRows

<!-- rpi:task id=P05-T01 -->

Both edits are above the marker and both must keep the line count exactly.

The first is the `#full-count` assignment. The literal text `$('#full-count').textContent` must
survive, in that exact form, and must stay above the closed-details guard, because a test asserts
both. Only the right hand side changes, to a call returning
`` `${read} of ${total} read · ${unread} unread` ``. When the order is empty the text is
`No issues yet`.

The second is the `rowsPending = false;` line, which becomes that assignment followed by a call to
a new `writeOrderStrip($('#full'), all, filter)` on the same line. It goes after the guard so the
strip is built only when the panel is open.

`writeOrderStrip` creates a `div.order-strip` once, inserting it directly before the reading
filters fieldset, and on every later call finds that same node and updates its children in place
rather than replacing them. It is a sibling of the rows list and outside the container
`preservingFocus` watches, and it holds nothing focusable, so updating it cannot disturb a focused
row or the row cache. It must be created once for exactly that reason: an insert on every render
would be churn for no gain.

It holds a `span.pbar` with the read fraction as its inner width, the percentage as text, and, when
the filter is anything other than the all-issues one, a sentence reading
`Showing ${shown} of ${total} issues.` computed by running the same `matchesReadingFilter`
predicate the rows below it use. When the filter is the all-issues one that sentence is removed
rather than left saying something trivially true.

When the order is empty the strip is hidden rather than shown at zero. There is no denominator, the
percentage would be `NaN`, and the summary above it already says `No issues yet`, which is the
whole of what there is to say.

The percentage is stated as a percentage of the whole order, not of the filtered rows, for the same
reason the collected-edition headings already count the whole run: a figure that changes meaning
when a filter is set is a second filter the reader never chose.

## Phase P06, the stylesheet

<!-- rpi:phase id=P06 -->

### P06-T01 Append one section to src/styles.css

<!-- rpi:task id=P06-T01 -->

Append after the last existing rule, introduced by a banner comment in the file's own style,
naming what the section is for. Nothing above the append point may change.

Colour comes only from tokens. Use `var(--token)` or `rgb(var(--token-line) / n%)`. Do not write a
literal colour anywhere; `test/theme.test.js` fails on one.

Reuse only pairs the palette gate already carries. The exact list you may draw on, read out of
`scripts/check-palette.mjs`, is: text on bg, card and card-2; dim on bg and card; muted on bg and
card; read-fg on bg and card; blue on bg and card; accent-text on bg and card; red-fg on bg, card
and card-2; teal on bg, card and card-2; amber on bg and card; on-accent on accent; line-2 on bg,
card and card-2; track on card; and accent on track.

Two absences in that list are easy to trip over. There is no muted on card-2 and no dim on card-2.
So a raised cell must use text for anything a reader has to read. If you find yourself wanting a
pair outside the list, change the design rather than the gate.

Rules to write:

- `.sumbar` as a grid that fits three or four cells across the canvas width and drops to one column
  under about 640 pixels, with a gap in the existing rhythm. `.sumcell` sits on card with the
  standard border and radius. `.sumfig` is the large figure, `.sumlab` the muted label.
- `.lgroup` and `.lgroup-h`, a heading row with the label at normal weight and `.lgroup-n` muted
  and smaller, separated from the rows by a hairline.
- `.result-cov` as a grid with a fixed cover column and the existing main column. `.rcov` fixed at
  the size the reading rows already use, `.rcov-i` covering it, `.rcov-f` the typographic fallback
  following the reading row's own bordered tile rather than the gradient tiles. Every one of these
  needs a `body.nocovers` counterpart that hides the image and shows the fallback, in the same
  shape the reading row already uses.
- `.badge-nolist`, `.badge-none` and `.badge-done`. Distinguish them by shape as well as by colour:
  a dashed border for the two absence states and a solid border with a tick glyph for the complete
  one. Colour must never be the only difference.
- Nothing for `.empty-state`. That rule already exists and is reused as it stands. If the glyph
  needs a size, scope the new rule to the glyph's own class inside it, never to `.empty-state`
  itself, which is shared with the all-read panel.
- `.mosaic` as three cells in a row with a small gap and rounded ends, `.mosaic-c` fixed size with
  `.mosaic-i` covering it and `.mosaic-f` using the fallback gradient tokens and the `--h` custom
  property in the same shape `.ocard-art .of` does, with its own `body.nocovers` counterpart.
- `.order-strip` as a single quiet row above the reading filters.
- `.sec-note` as a muted note beside a section heading, wrapping under the heading when narrow.
- Anything that moves must be inside the existing reduced-motion contract. Prefer no transition at
  all over one that has to be switched off.
- Close the section with `@media (forced-colors: active)`, giving every new bordered element a
  system border and every chip a visible outline, so the shape distinctions survive when the user's
  own colours replace ours.

The three sections that become `view-wide` are working surfaces with rows, bars and covers on them,
which is the same argument the reading screen already won. Prose views keep the reading measure.

### P06-T02 The three class attribute edits in src/index.html

<!-- rpi:task id=P06-T02 -->

Add `view-wide` to the class attribute of the progress view section and both library sections. No
other change to that file, and no line added or removed.

One evidence citation is known to drift as a result: a claim in the backlog names the two library
sections as a range whose head is the first of those two opening tags, so changing that tag's text
changes the fingerprint without moving the line. The claim itself stays true, so this is a bless of
changed content rather than a re-aim. No citation covers the progress view's opening tag. Both
facts were checked against the lock before this plan was written, and both are recorded here so the
owner's anchors round expects them rather than discovering them.

## Phase P07, the record

<!-- rpi:phase id=P07 -->

### P07-T01 PRODUCT_BACKLOG.md

<!-- rpi:task id=P07-T01 -->

Add one ranked row as `BL-170`, titled `Make the library and progress screens show their shape
before their rows`, type Story, epic EP-01, `Follows BL-169`, scored in the same style as its
neighbours and placed by score among them, disposition `Shipped`, with an evidence cell naming
something that is absent today, in the form the neighbouring rows use.

Add a detail block in the same commit, following the shape of the BL-169 block: a bold title line,
a checklist of the tasks with each box ticked only if it is genuinely done, then a `Constraint
gate: checked 1 to 11, none breached` paragraph naming which constraints were live and why, then
prose recording what was measured, with numbers.

Update the introduction: the delivered count in words, the list of shipped ids, and any figure the
counts gate derives. Run `npm run counts` and let it name what disagrees rather than guessing.

Three statements in that file say how many lines `src/js/main.js` has, all currently reading 4,801.
Re-derive and update all three. Two further statements carry a frozen marker and must not be
touched. `npm run sizes` names them if you get it wrong.

Do not repeat a block of wording between the backlog block and the changelog entry. The counts gate
detects prose said twice across the documents.

### P07-T02 CHANGELOG.md

<!-- rpi:task id=P07-T02 -->

One entry under `## Unreleased`, written for a reader who uses the app rather than one who writes
it. Say what is now on screen that was not, and say plainly that nothing saved is affected.

## Phase P08, gates, owned by the task owner

<!-- rpi:phase id=P08 -->

### P08-T01 What the implementer runs

<!-- rpi:task id=P08-T01 -->

`npm run lint` must report 0. `npm test` must report 0 failures, and is bare `node --test` with no
path argument; do not add one. `npm run palette` and `npm run counts` and `npm run sizes` must
pass. Report the exact output of each.

`npm run anchors` will report drift. Report what it says and change nothing in response to it.

### P08-T02 What the owner runs

<!-- rpi:task id=P08-T02 -->

The anchors round, derived twice and reconciled, then the bless with every printed pairing read.
The dash scan over the added lines of the diff, written to a file first rather than piped. Browser
verification in Edge at 1280 by 900 and 2560 by 1080, in both themes, with covers off, with
reduced motion and with forced colors, on an imported House of M and on a library with rows in
several date buckets. Then the changes record, the review, the commit and the pull request.

## Constraints checked

Constraints 1 to 11 were checked in research and none is breached. The live ones here are 3, since
every figure is a count of local records and nothing is stored or sent; 10, since the figures
describe one reader's own records and not a market; and 11, which the lint rule and the dash scan
both cover.

## Planning readiness

Ready. Every task names the file it touches, the rule that constrains it, the exact copy it
renders and the test that will judge it.
