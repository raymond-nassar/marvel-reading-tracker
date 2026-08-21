# Changes: Add issues progressive disclosure

Task MRT-006. Plan: `.copilot-tracking/plans/2026-08-21/add-issues-progressive-disclosure-plan.md`.

One entry closes a plan task. The rest exist because the work departed from the plan, which is what
a changes record is for.

## CHG-001 Search promoted out of the disclosure set, the other four grouped beneath it

Closes P01-T01 and P01-T02.

`#sec-search` stopped being a `<details>` and became a `<section class="card card-static addpri">`,
so the default workflow is on screen without a press. The four remaining paths moved inside a new
`<section id="add-more" class="add-more">` under an `h2` reading "Other ways to add", and their own
headings dropped from `h2` to `h3`. The view now reads 1, 2, 2, 3, 3, 3, 3 with no level skipped,
verified in a real browser rather than only in the markup, because the markup order and the rendered
order are not the same claim.

Each of the four summaries gained a `span.card-why` purpose line. It sits inside the `<summary>`
deliberately: a closed `<details>` hides every child that is not the summary, so a purpose line
outside it would be invisible in exactly the state it exists to help. The consequence, that the line
joins the disclosure's accessible name, was assessed and accepted rather than trimmed away with
`aria-labelledby`, because "Add a whole series Every issue of one series, oldest first." tells a
screen reader user the same useful thing a sighted reader gets for free.

`wireNav`'s close loop narrowed from `#view-add .card[open]` to `#view-add details.card[open]` and it
now sets `open` only on a node that is actually a `DETAILS`. Without both halves the rail would have
written an `open` attribute onto a plain section, which does nothing visible and would have been
found later rather than now.

## CHG-002 The busy treatment shipped with no animation, where the plan allowed one

The plan described `.notice-busy` as "muted text with a small leading dot" and permitted animation
provided it was wrapped in `@media (prefers-reduced-motion: no-preference)`. What shipped has no
animation at all.

The wrapped form was written and then dropped, because a spinner beside the words "Searching…" adds
nothing a reader does not already have and the media query is a thing that can be got wrong later.
The reduced-motion default is static by construction rather than by rule, which is the stronger
version of the same guarantee. Measured in Edge under `prefers-reduced-motion: reduce`, the notice
and every node inside it report zero animations and zero transitions.

`notify` needed no change to carry the new kind. `noticeEl` interpolates `notice-${kind}` with no
allow-list, so `'busy'` maps straight to `.notice-busy`, and no test pinned the set of kinds.

## CHG-003 The held pill needed flex sizing the plan did not call for

The plan specified the pill's meaning, that it must be distinguishable by shape or glyph rather than
by colour, and that it must survive forced colours. It said nothing about its size, and the shipped
first cut had no `flex` of its own.

`.result` is a flex line and nothing in it was pinned, so at 640 CSS pixels, which is what 200 per
cent zoom reports, the pill was the part that gave way: the title kept its width and "Already in your
library" broke across three lines beside a one-line row. Setting `flex: none` and `white-space:
nowrap` on the pill moves the give to `.result-main`, which already has `min-width: 0` and already
truncates, so the fix costs the title nothing. Re-measured at 640, 1280, 1920 and 2560: zero
horizontal overflow at every width.

This is the second element added inside `.result` that had to pin its own size. The cover thumbnail
added by the previous task fixes its column at 44 pixels in three separate rules for the same
reason. The row does not defend itself.

## CHG-004 The destination sentence became a shared function rather than a repeated line

The plan asked for two things: keep the sentence in `renderResults`, and print it in the series and
creator panes as well, which never stated a destination at all. Writing it twice would have left two
copies of a sentence whose wording is part of the count contract, so the sentence moved into one
`addDestination()` and both callers ask it.

The series and creator panes print it as a `p.rail-hint` under the match summary rather than inside a
`.res-head` strip, because those panes already open with a summary line of their own, stating how
many of how many matched and when the vendored index was taken. A second strip above it would have
been two summaries stacked.

## CHG-005 The held count is asked of the issue store, not of the destination list

`heldCount(state, items)` counts distinct ids present in `state.issues`, so the pill reads "Already
in your library" and never "already in this list". Those are different facts here and the difference
is not cosmetic: `deleteList` deliberately keeps issue metadata behind, and `addIssuesToList` merges
every incoming issue into the store before it decides membership, so an issue can sit in the store
while belonging to no list at all. `doManual` already handles that case.

The row's Add button therefore stays enabled on a held row. Pressing it still reports "Already in
that list" when that is the true answer, which is the only place that narrower claim can honestly be
made.

Verified with eight tests covering an empty store, a missing store, a missing issues map, a null
result set, none held, some held, all held, a repeated id, an entry carrying no id, and the negative
synthetic id a hand-added entry uses. The repeated-id case is the one worth naming: the count is
printed beside a row count, so a count that could exceed the rows on screen would describe something
the reader cannot see.

## CHG-006 Two claims this change made false, and one it found already false

Adding a stylesheet is not usually a documentary event. It was here. The backlog's record of the
shipped-copy gate gave the reason that gate's one unsafe edge case cannot fire as there being a
single glyph-bearing content declaration in the stylesheets. The tick on the held pill and the
bullet on the loading notice made that three, so the sentence stopped being true the moment the
rendering landed.

The reason was rewritten rather than the count corrected. What actually keeps the edge case out of
reach is that no content value holds a comment marker, which is the condition the mechanism needs
and does not rot when a fourth glyph is added. Measured across the stylesheets: 6 content
declarations with a string value, 3 of them glyph-bearing, 0 holding a marker. The paragraph above
it recorded a past measurement in the present tense, so its verbs moved to the past where the rest
of that paragraph already was.

The orientation block that records what this repository was briefed with says in its own next
paragraph that its drift clauses are live numbers to re-derive whenever the section is touched. The
file-size clause was re-derived to 5,030 and the test clause was left reading 1,195 against a suite
of 1,263. Re-derived. That is the failure the paragraph was written about, reproduced inside the
section it warns.

The third was already wrong and is not this change's doing. importCurated sets tn.disabled at
src/js/main.js:4022; the citation named a line about a catalog card's next stop, and the anchors
lock proves it named that same unrelated text before this change moved anything, because the
fingerprint matched byte for byte at the shifted line. It was fixed here rather than filed, on the
rule that a defect of this class is worth a silent fix inside a change already being made and is not
worth a change of its own.