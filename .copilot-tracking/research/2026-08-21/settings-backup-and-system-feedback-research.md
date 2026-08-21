# Settings, backup and system feedback research

> Line references in this document describe the tree at f683c87, the commit this research was
> written against. They are written in prose rather than as `path:line` citations because a dated
> tracking artifact is a record of a past state, and enrolling it in the evidence anchors gate would
> either falsify that record or break the gate once the change lands.

**Task:** MRT-007
**Slug:** settings-backup-and-system-feedback
**Date:** 2026-08-21
**Parent:** MRT-006 (Add Issues progressive disclosure, merged as PR #157)
**Phase:** Research

## Scope

The fifth modernization phase, as the owner stated it: organize settings into Personalization,
Data safety, Connectivity and Advanced groups; make backup and restore the clearest and most
prominent workflow; keep destructive and recovery actions visually distinct and correctly
ordered; standardize dialogs and notices around consistent titles, messages, icons, actions,
focus behaviour and semantic colours; add restrained loading, empty, success, warning and
failure treatments using simple shapes or icons; and preserve every data-loss safeguard,
salvage path, undo path and the local-only privacy promise.

Read-only. No source was edited during this phase.

## What the surface is today

The settings view is `#view-data`, seven flat `.card.card-static` panels with no grouping, no
fieldsets and no dividers, at `src/index.html` lines 566-660. Measured in Edge at 1280x900 it is
1,703 px tall over a 900 px viewport, which is 1.9 screens of scrolling, and its heading order
runs H1, H2, H3, H2, H2, H2, H2, H3, H2, H2.

Its render order is Backup and restore, Cover art, Update checks, Theme, Metadata source with
Cached metadata beneath it, Copies kept after a failed read, and Danger zone.

Eleven static controls, plus per-copy Download and conditional Remove buttons rendered into
`#salvage-list` by `renderSalvage()` at `src/js/main.js` lines 4517-4585.

The notice system is `notify()` at `src/js/main.js` lines 497-518, emitting `notice notice-${kind}`
through `noticeEl()` at `src/js/main.js` lines 471-477. Four kinds exist and no more: `ok`, `warn`,
`error` and `busy`, styled at `src/styles.css` lines 839-844.

Dialogs are one shared native `<dialog>` implementation in `src/js/ask.js`, with `askConfirm`,
`askText` and `askNote` wrappers.

## Wave 1, wider: what already holds

Three things measured as already correct, and the first scope rule says to leave them alone
rather than churn them.

**Dialogs are already standardized.** Measured in Edge: `#ask` and `#preview` share an
identical box treatment, `{"maxWidth":"none","padding":"19.2px 22.4px","borderRadius":"16px"}`.
Every confirmation renders Cancel first and the confirming action second, from one markup
source at `src/index.html` lines 831-834, so the destructive option is second in all four destructive
cases. Focus enters on Cancel, and Escape resolves negative. The user's brief asks to standardize
dialogs; measurement says they are standard already, so this phase verifies and holds them rather
than changing them.

**Correction, made during verification.** This section first recorded that focus "returns to the
opener", moving from `btn-wipe` to Cancel and back to `btn-wipe` on dismissal. That was read from
the source rather than measured, and it is wrong. Driven in Edge against the base commit f683c87
and against the working tree, focus lands on `data-h`, the view's own `<h1>`, after both exits:
Escape and a Cancel click, identically in both trees. So the behaviour is consistent across exits,
which is what the brief asks of a dialog, but it does not return to the control that opened it.
Because it measures the same on the base commit it is not this phase's regression, and because
this phase's binding rules hold dialog behaviour still it is filed as follow-up work rather than
changed here. This is the second reading-derived claim in this artifact that measurement refuted,
after the forced-colours pair, and it is recorded rather than quietly amended because a research
document that hides its misses teaches nothing.

**Loading states are already restrained and already motionless.** Every progress affordance in
the app is static text: the catalog loaders, the preview loader, the hydration and synopsis
counters, the update check, the cache size line and the API health pill. The only decoration
anywhere is the `•` on `.notice-busy` at `src/styles.css` line 844, which MRT-006 shipped with no
animation at all rather than with a reduced-motion guard. There is no spinner in the codebase.

**The recovery layer is exceptionally carefully built and none of it may move.** `src/js/storage.js`
is 753 lines in which the salvage, pre-restore, staging and blocked-latch paths each read their
own writes back, refuse in the safe direction, and withdraw offers at the moment their premise
disappears rather than refusing them later. `eraseAll()` withdraws the pre-restore snapshot and
`startFresh()` deliberately does not, and the reason is written out at `src/js/storage.js` lines 730-737.
Every message string in that module and in `renderSalvage()` is load-bearing: `salvageCopies()`
returns `null` for a storage that will not enumerate and `[]` for one holding nothing, and
`src/js/main.js` lines 4522-4536 renders three different answers because collapsing them would tell a
reader with copies intact that they have none.

## Wave 2, deeper: two measured defects

### F1. Under forced colours, three of the four notice kinds are indistinguishable

`.notice-ok`, `.notice-warn` and `.notice-error` carry their meaning in `color`, `border-color`
and `background` alone, at `src/styles.css` lines 840-842. Forced colours replaces all three. There is
no forced-colours rule for notices anywhere in the stylesheet: the five such blocks are at
`src/styles.css` lines 1114-1134, `src/styles.css` lines 1168-1170, `src/styles.css` lines 1229-1237 and
`src/styles.css` lines 1314-1323, and none names a notice selector.

Measured in Edge over CDP with `forced-colors: active`, reading computed styles off one of each
kind:

| pair | text, border and glyph | background alpha |
|---|---|---|
| ok vs warn | identical | 0.06 vs 0.06, delta 0.00 |
| ok vs error | identical | 0.06 vs 0.07, delta 0.01 |
| warn vs error | identical | 0.06 vs 0.07, delta 0.01 |
| ok vs busy | differ | 0.06 vs 0, delta 0.06 |

So a success notice and a warning notice are byte-identical in every property measured, and an
error notice differs from either by one per cent of alpha over transparent black, which is not
a distinction a reader can use. Only `busy` separates, and the reason it separates is the one
thing it has that the others lack: a glyph.

That is the finding and its own remedy. The codebase already demonstrates that a `::before`
glyph is what survives this mode, at `src/styles.css` line 844 for `busy` and `src/styles.css` line 1132
where MRT-006's held pill is given a system border for the same reason. Six rules in the whole
stylesheet emit a glyph today, and the two carrying meaning are `.pill-held::before` at `"✓ "`
and `.notice-busy::before` at `"•"`.

### F2. One report pane is shared by three unrelated workflows, which destroy each other

`#restore-report` sits inside the Backup and restore card at `src/index.html` line 585. Three
unrelated handlers write to it: the restore file input and undo at `src/js/main.js` line 4363,
`src/js/main.js` line 4386 and `src/js/main.js` line 4396, the API URL form at `src/js/main.js` line 4406 and
`src/js/main.js` line 4433, and clear-cache at `src/js/main.js` line 4440. The last two are controls in
the Metadata source card, five cards below.

Measured in Edge by driving a real refusal through the file input with a malformed file, then
pressing an unrelated button:

- after the refused restore the pane held `Restore refused, nothing was changed. Not valid
  JSON: Unexpected token`, as `notice notice-error`
- after Clear cached metadata it held `Cached metadata cleared. Lists and reading progress are
  untouched.`, as `notice notice-ok`

The record that a restore was refused is gone, replaced by an unrelated success, and nothing
told the reader. That is exactly the stale-action class the owner asked to be tested in this
phase, and it is reachable by pressing two ordinary buttons in sequence.

The distance defect is the same cause seen the other way. `#restore-report` carries class
`results`, not `report`, so it takes the branch at `src/js/main.js` lines 504-508 which writes and
announces but does not relocate and does not scroll. Measured at 1280x900 the confirmation for
Save API URL lands 717 px above the button that produced it, and at 200 per cent zoom, which is
CSS pixels at half the width, it lands 658 px above the top of the viewport and 819 px from its
button. A sighted reader at 200 per cent zoom who presses Save API URL sees nothing happen at
all. Screen readers do receive it, because that branch calls `announce()` at
`src/js/main.js` line 506, so this is a defect of the visual channel alone.

`API_BASE_REJECTED` at `src/js/main.js` line 369 targets `#app-report`, not this pane, and
`clearNotice()` clears by key rather than by pane, so splitting `#restore-report` does not
disturb the boot-time complaint about a stored bad URL.

### F3. Empty states are treated two ways

Three `.empty-state` nodes exist. Two carry the `.empty-glyph` shape MRT-005 shipped, in the
two library views; the third, the finished reading order at `src/index.html` lines 377-380, does not.
The rest of the app's empty messages are plain paragraphs of various classes.

## Wave 3, contrarian: what I got wrong

The reading of the source produced two claims and the browser refuted one of them and sharpened
the other. Both are recorded because the corrected versions are what the plan is built on.

**Refuted.** Reading `src/styles.css` lines 840-842 I concluded that success and error notices would
be byte-identical under forced colours. They are not: their background alpha differs by 0.01.
The substantive finding survives in a better form, because the pair that is genuinely identical
in every measured property turned out to be ok and warn rather than ok and error. Asserting the
first version would have put a false claim in the record and, worse, would have been trivially
falsifiable by anyone who re-ran the measurement.

**Sharpened.** Reading `notify()` I expected the shared-pane problem to be mainly a distance
problem. Driving it in the browser showed the destructive case is worse than the distance case:
distance is an inconvenience a reader can scroll past, whereas a refused restore being silently
replaced by an unrelated success destroys the only record that a restore did not happen. The
plan is ordered by that, not by the distance.

**A third check that came back clean.** I expected to find dialog treatments drifting apart
between `#ask` and `#preview`, since they were built at different times. They are identical.
Nothing to do there.

## Constraint gate

Checked 1 to 11, none breached. Constraint 3 is the one this phase touches most directly: the
settings view's own subtitle at `src/index.html` line 568 states the local-only promise, and the
Cover art and Update checks cards at `src/index.html` lines 590-597 and `src/index.html` lines 603-607
carry the detailed statements of what is and is not sent. Regrouping must carry all of that
text across unchanged. Constraint 4 holds: this phase adds no dependency. Constraint 11 holds
and is scanned on the diff.

## Planning readiness

**Ready.** The two defects are measured rather than reasoned about, both have local remedies
whose correctness is already demonstrated elsewhere in the same codebase, the grouping the
owner asked for maps onto the existing cards without inventing or removing a setting, and the
recovery layer that carries the real risk needs no change at all, only careful preservation.

## Follow-ups noted, not actioned

- The finished reading order's empty state lacks the shape treatment the two library empty
  states carry. Small and in scope for this phase.
- Seven of nine views carry no report pane of their own and rely on `#app-report`, per the
  comment at `src/js/main.js` lines 385-386. That is a deliberate design, not a defect, and is out of
  scope.
