# MRT-008 plan: cohesion and accessibility

Task id MRT-008. Task slug `cohesion-and-accessibility`. Base commit faefca7. Research artifact
`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md`.

Three phases. The first closes the two measured accessibility defects. The second closes the value
sprawl the audit found, bounded to changes no reader can see. The third is records, anchors and
gates. Nothing here adds a treatment; every change either raises a control to a conformance floor,
restores focus, or removes a value that has no reason to differ from its neighbour.

Detail file `.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md`.

<!-- rpi:phase id=P01 -->

## P01: close the two accessibility defects

<!-- rpi:task id=P01-T01 -->

### P01-T01: raise the six undersized targets to the 24 pixel floor

Six interactive targets measure under 24 pixels in their smaller dimension. Three rules fix all six,
and all three are edits to existing declarations that add no line to the stylesheet.

| Rule | Change | Fixes |
| --- | --- | --- |
| the quiet button class | add a 24 pixel minimum height | Clear cached metadata, Erase all local data |
| the file input rule | add a 24 pixel minimum height | Backup file to restore |
| the checkbox row class | add a 24 pixel minimum height | Show cover art, Check for updates automatically, Into a new list |

A minimum height can only grow a short control, so the ten quiet buttons already at 32 and 33 pixels
are untouched by construction. Twenty-four pixels is the conformance floor and it already has
precedent in this stylesheet, which is why it is the value rather than a larger round number: the
two quiet buttons are deliberately quiet and making them the size of a primary button would undo the
hierarchy the previous phase established.

Acceptance: the census reports zero effective targets under 24 by 24 across all nine views, inline
prose links excluded. The twelve quiet buttons still measure at least 24, and the ten that were
already clear are unchanged to the tenth of a pixel.

<!-- rpi:task id=P01-T02 -->

### P01-T02: return focus to the control that opened a dialog

Closes BL-175. The dialog module states in its own opening comment that returning focus to whatever
opened the dialog is the browser's job. That assumption is what the defect disproves: after Escape
and after Cancel, focus lands on the view's top heading instead.

Record the element that had focus immediately before the dialog is shown, and restore it when the
dialog closes, guarded on the element still being in the document and still focusable. The guard is
the whole design. A confirmed destructive action frequently removes the very control that opened the
dialog, and focusing a detached node does nothing while silently consuming the restore, so when the
opener is gone the existing behaviour must remain exactly as it is rather than being replaced.

Restore inside the close handler, before the awaiting caller resumes, so a caller that deliberately
moves focus afterwards still wins. The single-question guard the module already holds must not be
weakened: the stored opener is cleared on every close, including the close of a question that was
never answered, so a second question cannot inherit the first one's opener.

Acceptance: after Escape and after Cancel, focus is on the control that opened the dialog. After a
confirmed action that removes the opener, focus is where it is today. A second dialog opened from a
different control returns to that control, not the first.

<!-- rpi:task id=P01-T03 -->

### P01-T03: guard both fixes with tests that have been seen to fail

Extend the existing dialog test file for the focus restoration, covering the Escape route, the
Cancel route, the removed-opener fallback, and two dialogs in sequence from different openers.

Add target size assertions to a stylesheet-facing test asserting that the three rules declare a
minimum height of at least 24 pixels.

Every assertion must be proved to fail without its fix, by stashing the fixed files and watching the
test go red. Prefer the smallest revert that produces the failure, so the record names which line
each test defends rather than only that the suite notices the change.

<!-- rpi:phase id=P02 -->

## P02: collapse the value sprawl

Every substitution in this phase preserves the line count of the stylesheet. That is a hard
constraint, not a preference: 77 evidence anchors point into this file across lines 1 to 1150, so a
single inserted line near the top re-aims almost all of them, in exchange for changes no reader can
see. Only 154 of the file's 1,334 lines are watched, so an in-place substitution on an unwatched
line costs nothing at all.

<!-- rpi:task id=P02-T01 -->

### P02-T01: collapse thirteen font weights to three

Nine declared weights are near duplicates of two real ones. Map each to the nearest system weight:
500, 520, 540, 560, 620, 640 and 650 become 600, and 660 and 680 become 700. Sixteen declarations
change, two of them on watched lines. The result is three weights in the whole stylesheet: 400, 600
and 700.

<!-- rpi:task id=P02-T02 -->

### P02-T02: snap font sizes onto a ladder

Snap each declared rem size to the nearest rung of a ladder, and only where the shift is under half
a pixel at the root size, so no change is visible. Forty-eight declarations change, none of them on
a watched line, and the distinct rem count falls from 33 to 19.

The seventeen declarations whose nearest rung is further than half a pixel away are left exactly as
they are. That is the bound that keeps this phase invisible, and it is why the count falls to 19
rather than to the size of the ladder.

<!-- rpi:task id=P02-T03 -->

### P02-T03: reduce seventeen radii to a six rung ladder

The ladder is 6, 8, 12, 14, 20 and the pill value. Map 4 and 5 to 6, map 9 to 8, and map 10, 11 and
13 to 12. Twenty-four declarations change, four of them on watched lines.

Two rungs are kept deliberately against the temptation to collapse further. The 14 pixel rung is the
stylesheet's existing radius token, and the point of the exercise is that a token four rules use is
not a system, so it stays and the mid-sized values move towards it rather than away. The 20 pixel
rung is carried by the three large panels, consistently, which makes it a tier rather than an
isolated treatment; collapsing it would be a visible redesign of the biggest surfaces on the home
screen, which is outside this phase's remit.

<!-- rpi:task id=P02-T04 -->

### P02-T04: prove the collapse changed nothing a reader can see

Re-run the rendered census and record the before and after distinct-value counts for size, weight
and radius. Capture screenshots of all nine views before and after at 1280 by 900 and compare them.
Any difference beyond antialiasing is a substitution that was not invisible and must be reverted
rather than accepted.

Acceptance is stated on the declared counts, which this change controls directly, with the geometry
census as the invisibility check rather than a count check. Declared weights fall from 13 to 3, or to
4 with the survivor named. Declared rem sizes fall from 33 to 27 with no near pair pushed apart.
Declared radii fall from 17 to 11 and the two hero buttons end equal. The geometry census reports
zero elements moved across 987. Zero contrast regressions in dark and light. Zero new overflow at any
of the five widths. The 90 Tab stops still report one focus treatment.

Deliberately not an acceptance figure: the rendered radius count. A pill value and a percentage
radius resolve per element, so the rendered figure sits above the ladder by construction and a target
on it would be either a false failure or a bar quietly lowered to meet it.

#### Amendment, recorded during P02 implementation

Three figures above were falsified by measurement and are corrected here rather than edited in place,
because a plan is a record of what was intended and the departure is the thing worth keeping.

The font-size acceptance of "33 to 27" was withdrawn. The map was validated only on pair ordering, and
that property turned out to be insufficient: a map can hold every pair in its original order while
still visibly resizing the text inside it. The geometry census caught `.95rem` folding to `.92rem`,
which shrank seventeen section headings by 3.2 per cent and cascaded 35 pixels of reflow down the
catalog list. Shrinking every section heading is the wrong direction for an accessibility pass, and
resizing headings app-wide is a design decision rather than defect removal, so the eight declarations
sitting at `.94rem` and `.95rem` were reverted. The honest figure is 33 to 29, and the replacement
bar is stronger than the one it replaces: no declaration may move by more than 0.01rem.

The weight acceptance resolved to 4 rather than 3, under the clause that already permitted it. The
survivor is 800, carried by `.fallback .fn` at 2.4rem, `.tile .tf .n` at 1.5rem and the tracked
uppercase `.eyebrow`. All three are display type where 800 is deliberate, and folding them to 700
would have been visible.

The census figure of "zero elements moved across 987" was written before the instrument existed and
is not achievable, because raising six controls to the 24 pixel floor moves everything below them.
What shipped is 475 elements moved, every one of them sub-pixel on its own box except the six
intended targets, with the page height deltas each explained: home +2, catalog -35, data +5.

<!-- rpi:phase id=P03 -->

## P03: records, anchors and gates

<!-- rpi:task id=P03-T01 -->

### P03-T01: update the records in the same change

Mark BL-175 Shipped. Add two backlog detail blocks, one for this change and one for the spacing
consolidation this change measured and deliberately did not do. Both are full detail blocks, so both
carry a weighted score and, without fail, a `Constraint gate: checked 1 to 11, none breached.` line.
The governance test derives one figure from the count of block headings and another from the count of
those gate lines and asserts the governance document states both, so two blocks and two gate lines
move both figures by two. Re-derive both from the finished backlog rather than adding two to the
numbers currently written down. Add a changelog entry under Unreleased.

File as plain Ready rows, with no detail block and therefore no gate line: the non-interactive
everything-read rows, the dense font size band from 0.85 to 0.92 that cannot be collapsed invisibly,
and the two rail navigations that do not announce. All three are questions for later, not defects
here.

<!-- rpi:task id=P03-T02 -->

### P03-T02: run the anchors round properly

Expect drift on the six watched stylesheet lines this change substitutes into, and on the dialog
module's two cited ranges, which gain lines. Derive every new target twice, once by searching for
the head text the lock already holds and once from the diff's own hunks, and reconcile. Check that
no range begins or ends on a blank line. Read every pairing the bless prints against the claim
printed beside it. Finish on zero drifted, zero new and zero removed.

One case here is not about lines moving and needs its own check. Six watched lines have their value
rewritten in place. If the prose citing one of them asserts the old value, saying that some control
carries weight 620 or radius 11, the substitution makes that sentence false while the citation still
points at a real line in the right file. A re-bless would lock the false pairing in silence, and
reading the head against the claim is the only thing that catches it. So for each of the six, read
what the citing sentence actually claims, and where the substitution falsifies it, correct the prose
rather than only re-aiming the anchor.

<!-- rpi:task id=P03-T03 -->

### P03-T03: run every gate and verify in a real browser

Lint, tests, sizes, counts, palette, publication, anchors and the browser suite. The file-based dash
scan over added lines, written to a file and read back rather than piped. A full-corpus anchor audit
for range-edge and malformed citations.

Then the modes, in Edge, across all nine views: dark, light, forced colours, reduced motion, covers
on and covers off, at 1280 by 900, 1920 by 1080, 2560 by 1080, 360 by 760 and at 200 percent zoom.

## Out of scope

Recorded so the phase does not drift into them.

- Focus indicator styling. One treatment across 90 stops; there is nothing to reconcile.
- Forced colours rules. Eight probe hits, all refuted.
- Box shadows. Four declared, one rendered; already coherent.
- Colour literals. The absolute token rule holds.
- Any restructuring of the stylesheet, and any new visual treatment.
