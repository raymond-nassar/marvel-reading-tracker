# Settings, backup and system feedback plan

> Line references in this document describe the tree at f683c87, the commit this plan was
> written against. They are written in prose rather than as `path:line` citations because a dated
> tracking artifact is a record of a past state, and enrolling it in the evidence anchors gate would
> either falsify that record or break the gate once the change lands.

**Task:** MRT-007
**Slug:** settings-backup-and-system-feedback
**Date:** 2026-08-21
**Research:** `.copilot-tracking/research/2026-08-21/settings-backup-and-system-feedback-research.md`

## Objective

Group the settings view, make backup and restore visibly primary, route every confirmation to
the control that produced it, and give the four notice kinds a shape so they survive forced
colours. Change nothing about what any control does, what any message says, or when any
recovery offer appears and disappears.

## Binding rules

These outrank any local judgement during implementation. A change that cannot be made without
breaking one of them is a blocker to raise, not a rule to weigh.

**R1. `src/js/storage.js` is not edited.** Not one line. Every safeguard, latch, read-back,
salvage rule and withdrawal condition in that file stays exactly as it is. If the presentation
appears to need a store change, stop and report it.

**R2. No message text changes.** Every string passed to `notify()`, `announce()` and
`askConfirm()` keeps its exact current wording. The recovery copy in particular is measured
prose: `src/js/main.js` lines 4522-4536 renders three different answers for three different states and
`src/js/main.js` lines 4561-4580 withdraws the Remove offer with two different sentences depending on
whether this tab is the blocked one. Move these nodes if you must; do not reword them.

**R3. No offer's condition changes.** `#btn-undo-restore` is shown and hidden only by
`store.hasPreRestoreSnapshot()`. The Remove button appears only when a copy is not `live`. The
blocked banner is driven only by `store.blocked`. Preserve every one of these tests verbatim,
including which function asks them and when.

**R4. Every existing control keeps its id, its type and its accessible name.** Grouping moves
nodes; it does not rename, retype or relabel them. `#btn-export-json`, `#btn-export-md-2`,
`#restore-file`, `#btn-undo-restore`, `#opt-covers`, `#opt-update-checks`, `#opt-theme`,
`#api-base`, `#btn-clear-cache`, `#btn-wipe`, `#form-settings`, `#salvage-list`,
`#salvage-report`, `#restore-report` and `#cache-usage` all survive with the same ids.

**R5. Every explanatory paragraph moves with its control, complete.** The Cover art paragraph at
`src/index.html` lines 590-597, the Update checks paragraph at `src/index.html` lines 603-607, the Theme
paragraph at `src/index.html` lines 613-617, the Copies-kept paragraph at `src/index.html` lines 646-651 and
the two Backup hints at `src/index.html` line 573 and `src/index.html` line 580 are the local-only privacy
promise in its detailed form, which is Constraint 3. Not one sentence is dropped or shortened.

**R6. Destructive last.** The Danger zone card stays the final thing in the view and keeps
`.card-danger`. Cancel stays first in every dialog and the confirming action second.

**R7. `.card-static` is shared, so no rule keyed on it may be rewritten.** The class is worn by
the Add view's search card at `src/index.html` line 468 and by the About view's card at
`src/index.html` line 668, whose title is an `<h2>` and whose six sub-headings are plain `<h3>`s at
`src/index.html` lines 676-744. `.card-static h2` and `.card-static h3` at `src/styles.css` lines 754-755 are
tag-keyed and global, so redefining either to suit the settings regroup silently restyles About.
Every heading rule this phase adds is scoped to the settings view.

## Target structure

Four groups the owner named, then the terminal danger card. Every existing card is placed; none
is invented and none is removed.

```
H1  Backup & settings
H2  Data safety
    H3  Backup and restore            (primary treatment)
        H4  Restore from a backup
    H3  Copies kept after a failed read
H2  Personalization
    H3  Cover art
    H3  Theme
H2  Connectivity
    H3  Metadata source
    H3  Update checks
H2  Advanced
    H3  Cached metadata
H2  Danger zone                       (.card-danger, terminal)
```

Heading order is therefore 1, 2, 3, 4, 3, 2, 3, 3, 2, 3, 3, 2, 3, 2. Each level is used and no
level is skipped, which is the same rule MRT-006 held for the Add view.

**Cached metadata moves out of the Metadata source card into Advanced.** The two are related,
so the sentence that carries the relationship, `Clearing the cache never touches your lists or
reading progress.` at `src/index.html` line 641, moves with the cache and the Metadata source card
gains no replacement text. The relationship is also stated by the API save confirmation itself,
which already says cached data from the previous URL is kept separate.

**Copies kept after a failed read sits in Data safety, not Advanced.** It is the reader's own
data being held for them, which is what Data safety means here, and putting a recovery surface
behind a heading called Advanced is the kind of demotion that makes a recovery path harder to
find at the moment it matters.

## Phases

<!-- rpi:phase id=P01 -->
### P01 Group the settings view

<!-- rpi:task id=P01-T01 -->
**P01-T01 Wrap the seven cards in four group sections.** In `src/index.html`, add four
`<section class="setgroup">` wrappers, each opening with an `<h2>`, and move the existing cards
inside them in the order above. Demote each card's title `<h2>` to `<h3>`. The Danger zone card
stays outside all four groups, last, with its `<h2>` intact.

Exactly one `<h3>` becomes an `<h4>`: `Restore from a backup` at `src/index.html` line 579, which is a
sub-section of the Backup card. The other in-card `<h3>`, `Cached metadata` at
`src/index.html` line 638, is **not** demoted, because this phase splits it out of the Metadata source
card into its own card under Advanced, where it is a card title and so takes `<h3>` like every
other card title. A blanket "demote every `<h3>`" would contradict the target structure.

<!-- rpi:task id=P01-T02 -->
**P01-T02 Give backup and restore the primary treatment.** Add `addpri` to the Backup and
restore card, the class MRT-006 introduced at `src/styles.css` lines 757-759 for exactly this purpose,
so the most important workflow on the page reads as primary. Its `h3` takes the larger size the
`.addpri h2` rule gives, which means the rule's selector must be widened to cover the heading
level this card now uses. Do not introduce a second primary treatment; one card is primary.

<!-- rpi:task id=P01-T03 -->
**P01-T03 Style the groups, and re-home the heading sizes.** In `src/styles.css`, add a
`.setgroup` block: the group `h2` reads as a section label above its cards, distinct from a card
heading by size and weight rather than by colour alone, with enough space above it that the
grouping is visible without a rule line. Add a forced-colours rule so the grouping survives when
the reader's colours replace ours, the way `.lgroup-h` does at `src/styles.css` line 1319. Nothing here
moves, so no reduced-motion guard is needed and none should be added.

The heading sizes must be re-homed in the same task, because they are keyed on tag and the
demotion changes which tag each level uses. Today `.card-static h2` is the card title at `.95rem`
with no top margin and `.card-static h3` is a sub-section at `.85rem` with a `1.3rem` top margin,
at `src/styles.css` lines 754-755, and **there is no `.card-static h4` rule at all**. Left alone, the
demotion makes every settings card title `.85rem` with a stray top margin, which is smaller than
the sub-headings it outranks, and makes `Restore from a backup` an unstyled `<h4>` rendering
larger than the titles above it. Both are regressions.

Under R7 the fix may not touch `.card-static h2` or `.card-static h3`. Add rules scoped to
`#view-data` that give its card-title `<h3>` the treatment `.card-static h2` gives today and its
sub-section `<h4>` the treatment `.card-static h3` gives today. Verify by measurement that the
About view's `<h2>` title and six `<h3>` sub-headings at `src/index.html` lines 676-744 render at
unchanged sizes and margins, and that the Add view's four `<summary><h3>` headings are unchanged
as well.

<!-- rpi:phase id=P02 -->
### P02 Route every confirmation to its own control

<!-- rpi:task id=P02-T01 -->
**P02-T01 Add two report panes.** In `src/index.html`, add `<div id="api-report" class="results">`
inside the Metadata source card, after the form, and `<div id="cache-report" class="results">`
inside the Cached metadata card, after the Clear button and its hint. Both take class `results`
to match `#restore-report` and `#salvage-report`, so they are written directly and announced
rather than entering the relocation machinery, which is the behaviour those panes already have.

<!-- rpi:task id=P02-T02 -->
**P02-T02 Repoint three call sites.** In `src/js/main.js`, change the pane selector only:

| line | handler | from | to |
|---|---|---|---|
| `src/js/main.js` line 4406 | API URL refused | `#restore-report` | `#api-report` |
| `src/js/main.js` line 4433 | API URL saved | `#restore-report` | `#api-report` |
| `src/js/main.js` line 4440 | cache cleared | `#restore-report` | `#cache-report` |

The message strings, kinds and argument order do not change. `#restore-report` is left to the
restore and undo handlers alone, which is what its name says it is.

`API_BASE_REJECTED` targets `#app-report` and is cleared by key rather than by pane, so
`src/js/main.js` line 4414 needs no change. Confirm that rather than assuming it.

<!-- rpi:task id=P02-T03 -->
**P02-T03 Comment the reason.** One comment above the repointed API handler, in the register the
repository uses: what was measured, not what the line does. The measurement is in the research
artifact: a refused restore reading `Restore refused, nothing was changed.` was replaced by
`Cached metadata cleared.` by pressing an unrelated button, and at 200 per cent zoom the API
confirmation landed 658 px above the top of the viewport.

<!-- rpi:phase id=P03 -->
### P03 Give the notice kinds a shape

<!-- rpi:task id=P03-T01 -->
**P03-T01 Add a glyph to each kind.** In `src/styles.css`, give `.notice-ok`, `.notice-warn` and
`.notice-error` a `::before` glyph beside the `•` that `.notice-busy` already carries at
`src/styles.css` line 844, using the same `margin-right` so the four align. The three glyphs must be
distinguishable from each other by shape alone, since forced colours renders them all in one
colour. Use `✓` for ok, matching the established tick of `.pill-held::before` at
`src/styles.css` line 837, and shapes of clearly different silhouette for warn and error.

<!-- rpi:task id=P03-T02 -->
**P03-T02 Add the forced-colours rule.** There is no forced-colours rule for notices anywhere in
the stylesheet today. Add one giving every notice a system border so the panel is visible, and
verify by measurement that the four kinds are then distinguishable. The glyph is what carries
the distinction; the border carries the fact that it is a notice at all.

<!-- rpi:task id=P03-T03 -->
**P03-T03 Confirm the glyphs are not spoken twice.** `notify()` announces `spoken(msg, ...)` at
`src/js/main.js` line 506 and `src/js/main.js` line 517, built from the message string. A `::before` glyph
is not in `textContent`, so it cannot reach that path. Verify in the browser that the announced
string is unchanged, rather than reasoning that it must be.

<!-- rpi:phase id=P04 -->
### P04 Make the empty states consistent

<!-- rpi:task id=P04-T01 -->
**P04-T01 Give the finished-order empty state the shared shape.** The two library empty states
carry `.empty-glyph` and the finished reading order at `src/index.html` lines 377-380 does not. Add the
same treatment with a glyph appropriate to a finished order rather than an empty one. This is the
whole of the empty-state work: the settings surface's own "nothing here" messages are recovery
copy under R2 and are not touched.

<!-- rpi:phase id=P05 -->
### P05 Guards

<!-- rpi:task id=P05-T01 -->
**P05-T01 Structure and routing guards.** Add tests to a new `test/settings-view.test.js`
holding the shape this phase ships, each proved to fail on a reverted tree:

1. the settings view's heading levels are the sequence in Target structure, with no level skipped
2. four group sections exist and every card is inside one, except the danger card
3. the danger card is the last element in the view and carries `card-danger`
4. `#api-report` and `#cache-report` exist and sit in the Metadata source and Cached metadata cards
5. `#restore-report` is referenced by the restore and undo handlers only
6. every id named in R4 is still present in the markup
7. each of the four notice kinds has a distinct `::before` glyph declared

Tests parse the shipped files rather than a fixture, which is how `test/shipped-copy.test.js`
already works.

<!-- rpi:task id=P05-T02 -->
**P05-T02 Repoint the privacy test's markup slices.** `test/privacy-copy.test.js` cuts the settings
markup on the literal strings the demotion deletes: `section(html, '<h2>Cover art</h2>', '</div>')`
at `test/privacy-copy.test.js` line 92 and
`section(html, '<h2>Theme</h2>', '<h2>Metadata source</h2>')` at `test/privacy-copy.test.js` line 677.
Its `section()` helper at `test/privacy-copy.test.js` lines 40-45 asserts each delimiter exists, so both
fail the moment those headings become `<h3>`. Repoint the delimiters to the tags the view actually
ships. This is a privacy gate the owner's brief says to preserve, so the change is to the
delimiters only: not one assertion about the prose itself is relaxed, removed or reworded, and the
same paragraphs must still be the ones under test.

<!-- rpi:phase id=P06 -->
### P06 Records and verification

<!-- rpi:task id=P06-T01 -->
**P06-T01 Backlog and changelog.** One `Shipped` backlog item with a full detail block including
the constraint gate line, follow-ups filed `Ready`, one `## Unreleased` changelog entry, and
every count in any part of either document that is touched re-derived rather than carried
forward.

Stated file sizes are counts too, and this phase adds lines to `src/js/main.js`, which is 5,030
lines today. Three live sentences state that figure, at `PRODUCT_BACKLOG.md` line 207,
`PRODUCT_BACKLOG.md` line 4244 and `PRODUCT_BACKLOG.md` line 12067, and `npm run sizes` recomputes each one
from the tree, so all three go stale on the first inserted line. Re-derive every stated size for
every file this phase edits. Confirm against the gate's own report rather than by reading: it
prints how many stated sizes it checked, which is 7 today.

<!-- rpi:task id=P06-T02 -->
**P06-T02 Browser verification.** A check matrix in real Edge covering: the heading sequence;
every id in R4 present and named; the four groups; the danger card last; each of the three
repointed confirmations landing inside its own card and within the viewport at 1280x900 and at
200 per cent zoom; the four notice kinds distinguishable under forced colours by a measurement
that compares glyph as well as colour; the recovery surfaces rendering all three salvage answers;
the undo button's visibility still tracking the snapshot; the erase dialog's title, body, button
order and focus return unchanged; reduced motion showing no animated node; and 0 px horizontal
overflow at 640, 1280, 1920 and 2560.

<!-- rpi:task id=P06-T03 -->
**P06-T03 The repository's own browser check, and one anchors sweep.** `npm run browser` is not in
CI and so is easy to miss, but it is 119 assertions across 14 scenarios and one of them is
`unreadable saved data is met with an offer rather than a wipe`, which drives a blocked store and
asserts on `#btn-download-salvage` and `#btn-start-fresh`. That is this phase's highest-risk
surface, so it is a required check here and not an optional one. It was green at 119 of 119 before
any of this work began, and it must be green after. It runs on an ephemeral port rather than 8787,
so it cannot disturb saved reading progress.

Editing all three source files drifts roughly 70 citations: about 31 into `src/js/main.js`, 29
into `src/index.html` and 9 into `src/styles.css`, spread across `PRODUCT_BACKLOG.md`,
`docs/ARCHITECTURE.md`, `docs/UX_STUDY.md`, source comments and the tracking artifacts. Do the
anchors round **once**, after every source edit is final, because a re-aim computed before a later
edit is stale. Use the three-derivation procedure: head search, hunk arithmetic, and exact
fingerprint match against the gate's own hash. Read every pairing the bless prints where the
fingerprint did not already prove the target, and re-derive the arithmetic afterwards rather than
trusting a pass made before the last edit.

The empty-state work in P04 is the largest single driver of `src/index.html` drift and is retained
deliberately: the owner's brief asks in terms for empty treatments built from simple shapes, so it
is requested work rather than polish, and the fingerprint step makes the extra re-aims mechanical.

<!-- rpi:task id=P06-T04 -->
**P06-T04 Recovery-path review.** Reviewed harder than the rest, per the repository's standing
instruction and the owner's brief. Test repeated offers, failed recovery, stale actions,
dismissal, and alternate routes to the same state: press Clear cache after a refused restore and
confirm the refusal now survives; open and cancel the erase dialog twice; drive a blocked store
and confirm the banner, the salvage list and the undo offer all still appear and withdraw at the
same moments as before.

## Acceptance

- The four groups exist, every card is placed, no setting is added or removed.
- Backup and restore is visibly primary and is the first thing under the first group.
- The danger card is last and visually distinct.
- Each of the three repointed confirmations appears inside the card holding its own control.
- A refused restore is no longer destroyed by an unrelated cache clear.
- The four notice kinds are distinguishable under forced colours, measured on glyph and colour.
- Every id in R4 present; every paragraph in R5 present and complete.
- `src/js/storage.js` unchanged, verified by diff.
- Under R7, no rule keyed on `.card-static` is rewritten, and the About and Add views' headings
  measure unchanged.
- `test/privacy-copy.test.js` green with its delimiters repointed and not one prose assertion
  relaxed.
- `npm run browser` green at 119 of 119 assertions across 14 scenarios, the figure it reported
  before this work began.
- lint 0; the suite green with the new guards; sizes, counts, palette, publication and anchors
  all exit 0 with anchors reporting 0 drifted, 0 new and 0 removed after the round.
- Every stated file size re-derived, with `npm run sizes` reporting the 7 it checks today.
- Dash scan of added lines only, from a file rather than a pipe, reporting 0.
