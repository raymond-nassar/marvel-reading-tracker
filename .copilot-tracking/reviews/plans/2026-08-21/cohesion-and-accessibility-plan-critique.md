# MRT-008 plan critique: cohesion and accessibility

> Line references in this document describe the tree at faefca7, the commit this critique was
> written against. They are written in prose rather than as `path:line` citations because a dated
> tracking artifact is a record of a past state, and enrolling it in the evidence anchors gate would
> either falsify that record or break the gate once the change lands.

Task id MRT-008. Slug `cohesion-and-accessibility`. Reviewed 2026-08-21 against research artifact
`cohesion-and-accessibility-research.md`, plan `cohesion-and-accessibility-plan.md`, details
`cohesion-and-accessibility-details.md`, the dialog module `src/js/ask.js`, the three stylesheet
rules the plan edits, the dialog test file `test/ask.test.js`, the governance test
`test/governance-docs.test.js`, and the standing constraints and anchors sections of
`.github/copilot-instructions.md`.

This is a read-only critique. No plan source, detail, or research artifact was edited. The full plan
boundary was assessed in one pass; every actionable concern is below.

## Critique execution status: Complete

The whole plan boundary was assessed once, against the cited sources, with no serialized second pass.

## Verdict: Revise

The plan is fundamentally sound and implementable. The scope discipline on Finding C, holding every
substitution to an in-place value change that preserves the stylesheet line count, is correct and
well justified by the anchors economics. The three defects worth revising before implementation are:
gaps in the dialog focus restoration design at its edges (recovery-adjacent code, reviewed hardest),
invisibility claims in P02 that are asserted rather than shown at the sizes and relationships that
matter, and coverage gaps against the brief where named axes were neither measured nor scoped out.
None are blocking. All are fixable by a planner correction, except the scope decisions, which the
brief reserves to the user.

## Severity counts

- Blocking: 0
- High: 0
- Medium: 8 (PC-001, PC-002, PC-004, PC-005, PC-007, PC-008, PC-011, PC-012)
- Low: 6 (PC-003, PC-006, PC-009, PC-010, PC-013, PC-014)

## Highest-impact finding

PC-007: the brief's `spacing` axis was neither measured in research nor scoped out in the plan, in a
phase whose whole purpose is to close measurable cohesion inconsistencies. Action owner: planner and
research. A user response is required to settle the scope.

## A note on what the plan gets right

Recorded so the revision does not undo it.

- The line-count preservation rule and its costing against the 77 stylesheet anchors is correct, and
  the split between watched and unwatched lines is used correctly: P01-T01 edits three unwatched
  lines, P02 substitutes into six watched lines, and P03-T02 expects content drift on exactly those
  six even though no line is added or removed. The arithmetic is internally consistent.
- The P01-T02 ordering claim is sound. Because a settled promise resumes its awaiter on a later
  microtask, restoring focus synchronously inside the close handler after `pending` is settled does
  run before the caller resumes, so a caller that deliberately moves focus afterwards still wins.
  This is a real property and the plan has it right.
- The single-pending guard is respected: recording the opener only on the show path and clearing it
  on every close keeps a backed-out question from leaking its opener to the next.
- Reading the pairing against the claim in the anchors round is called for explicitly, matching the
  instructions.

## Findings

### PC-001 (Medium) P01-T02: the showModal throw path can strand or clobber the opener reference

Evidence: `src/js/ask.js` lines 79-89. To capture the opener you must read `document.activeElement` before
`dlg.showModal()`, because `showModal()` moves focus into the dialog. `showModal()` throws on an
already-open dialog, and the module already defends that path at `src/js/ask.js` lines 84-89. The detail at
`.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md` lines 94-96 says to record the opener "immediately before the
dialog is shown" and also to "record nothing when the dialog fails to open", which are in tension:
the only place to read the opener is before the call that can throw. The catch block currently clears
`pending` only. If the recording happens before `showModal()` and the call throws, the newly recorded
opener is left in place. When there is a genuinely open dialog with its own earlier opener, a second
`open()` reaching `showModal()` with `pending` null would overwrite that earlier opener before
throwing, and the eventual close would restore focus to the wrong control.

Impact: focus lands on the wrong control after a close, in exactly the reentrancy edge the repository
says to review hardest. Silent, since focusing any connected element looks like success.

Smallest useful change: specify that the opener is captured into a local, and the module reference is
only committed after `showModal()` returns without throwing; on the catch path restore the previous
reference value rather than leaving the new one. Add a test that a failed open does not change where
a later close sends focus.

Owner: planner. Direct planner correction.

### PC-002 (Medium) P01-T02: the restore guard tests connectedness, not effective focusability

Evidence: `.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md` lines 98-107 guards the restore on the element being
"still connected to the document and still exposes a focus method". That is weaker than focusable. A
connected element that has been disabled, hidden with `display:none`, or made inert still exposes
`focus()`, and calling it silently does nothing, leaving focus on the body, which is the same class
of defect BL-175 exists to fix. The confirmed action does not only remove the opener; a common
pattern is to disable it, for example a "Check for updates automatically" control that disables while
it works. The acceptance at `.copilot-tracking/plans/2026-08-21/cohesion-and-accessibility-plan.md` lines 59-61 and the tests at
`.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md` lines 124-127 cover removal only, not disabling or hiding.

Impact: the fix silently no-ops for a disabled, hidden, or inert opener, reproducing the reported
defect in a narrower population without any test noticing.

Smallest useful change: either broaden the guard to skip restore when the element is disabled,
hidden, or inert (and let the browser default stand, as with removal), or state explicitly that
disabled and hidden openers are out of scope and say why. Add one test for a disabled opener.

Owner: planner. Direct planner correction, unless the user wants the narrower scope, in which case
record it.

### PC-003 (Low) P01-T03: the test double cannot exercise focus restoration as written

Evidence: `test/ask.test.js` lines 19-39 and `test/ask.test.js` lines 68-82. `makeElement` has no `focus`, no
`isConnected`, and the fake `document` at line 80 is `{ getElementById }` with no `activeElement`.
The four restoration tests named at `.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md` lines 124-127 cannot run
against this double until it models an active element, a `focus()` spy, and a way to mark an opener
detached. The plan says extend the file but neither plan nor details mention extending the double,
and the instructions require each assertion be watched failing on a tree without its fix.

Impact: without the double extension the tests either cannot be written or pass vacuously, which the
repository has shipped before.

Smallest useful change: add to P01-T03 a note that `installDom` and `makeElement` gain
`activeElement`, `isConnected`, and a `focus()` spy, and that the removed-opener test toggles
`isConnected` to false.

Owner: planner. Direct planner correction.

### PC-004 (Medium) P02-T01: font-weight invisibility is asserted, not shown, and 650 is an arbitrary tie-break

Evidence: `.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md` lines 23-33. The research supports invisibility only for
620 against 600 at twelve pixels (`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` lines 147-149). The map applies
660 to 700 and 680 to 700, and the font renders as a variable axis, so a 40 unit shift lands on
larger glyphs where weight differences read more. There is no per-site evidence that 660 to 700 on a
2.2rem heading is imperceptible, and 2.2rem is exactly where a heading weight change shows. 650 is
equidistant between 600 and 700, so "nearest system weight" is undefined for it; the detail picks 600
with no reason given, and if 650 marks a heading meant to read heavier than 600 body, snapping to 600
collapses a deliberate step. The T01 outcome "three weights in the whole stylesheet" also conflicts
with the T04 rule that any visible difference must be reverted: if the large-heading case is visible
and reverted, a fourth weight survives and the T01 outcome is false.

Impact: a possible visible regression on the largest headings, and an internal contradiction between
the T01 outcome and the T04 gate.

Smallest useful change: inspect the specific declarations that use 650, 660, and 680, record their
render size, and state the tie-break reason for 650. Reword the T01 outcome so it defers to T04: the
target is three weights unless T04 records a visible case, which is kept and named.

Owner: planner correction for the reconciliation and the 650 tie-break. User decision if any of the
affected sites carries a deliberate hierarchy step.

### PC-005 (Medium) P02-T02: the snap bounds each value's move but not the relationship between two sizes

Evidence: `.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md` lines 40-49. The rule snaps each value to its nearest
rung when the move is under 0.03125rem. That bounds absolute movement to half a pixel per value, but
two values can move in opposite directions across a rung midpoint. Worked against the research's own
cluster at 0.84 to 0.89rem (`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` lines 139-140) with the ladder rungs
0.85 and 0.92: 0.88 is 0.03 from 0.85 and snaps down to 0.85, while 0.89 is 0.03 from 0.92 and snaps
up to 0.92. Two sizes that differed by 0.01rem, well under a pixel, end 0.07rem apart, about 1.12px.
If those two sit adjacent in one component, the snap creates a visible difference where none existed.
The same shape recurs at 0.76 against 0.78 landing on 0.75 and 0.8. The plan's invisibility argument
is stated on absolute movement only, and the T04 acceptance measures distinct counts, which fall in
both the safe and the unsafe case, so the metric is blind to two values being pushed apart.

Impact: a cohesion pass could ship a newly visible size split in a single component while every stated
number improves.

Smallest useful change: add a same-component rule. Where two `font-size` declarations in one rule or
component currently differ by less than the tolerance, they must snap to the same rung or both be left
unmapped. Have T04 compare pairwise size deltas within components, not only the global distinct count.

Owner: planner. Direct planner correction.

### PC-006 (Low) P02-T03: the radius map ignores nested and concentric relationships

Evidence: `.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md` lines 55-75. The map is applied purely by value. For
concentric corners an inner element's radius should be its parent's radius minus the padding between
them. Moving a child radius, for example 11 to 12 or 10 to 12, while its parent stays at the preserved
14px token or the preserved 20px panel, shifts the concentric relationship by one to two pixels. The
plan preserves the large containers deliberately, which is good, but it does no nesting analysis for
the children that move toward them, and the distinct-count acceptance is blind to concentricity.

Impact: a one to two pixel corner mismatch on nested surfaces, bounded and minor, but exactly the kind
of inconsistency a cohesion pass claims to remove rather than introduce.

Smallest useful change: have P02-T04 inspect nested corners specifically in the before and after
screenshots, and note in P02-T03 that a child radius tuned against its parent should not be moved in
isolation.

Owner: planner. Verify, then correct only if a tuned pair is found.

### PC-007 (Medium) Coverage: the `spacing` axis was neither measured nor scoped out

Evidence: the brief names spacing as an axis to audit (`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` lines 9-13).
Finding C profiles font-size, font-weight, border-radius, and box-shadow only
(`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` lines 130-135). The stylesheet carries an obviously wide set of
ad hoc paddings, gaps, and margins, for example the values on `src/styles.css` lines 442-445,
`src/styles.css` line 455, `src/styles.css` line 459, and `src/styles.css` lines 793-794, which is the same signature
of sprawl the font-size axis shows. The research states as its own method that recording measured
negatives matters as much as recording defects, yet spacing has no measurement and no negative, and
the plan's out-of-scope list does not mention it either. Box-shadow was measured and set aside with a
reason; spacing was simply dropped.

Impact: the final cohesion phase closes without measuring an axis the brief named, so it cannot claim
spacing is clean, and a material spacing inconsistency could survive the last phase unrecorded.

Smallest useful change: profile the spacing values with the existing stylesheet value profiler and
either record the negative, file a defect, or set spacing aside with an explicit reason, in the same
form used for box-shadow. If consolidation would be visible, route it to the backlog rather than fold
it in, consistent with the brief.

Owner: planner and research. User decision required on whether to measure and fix, backlog, or declare
out of scope, since the brief reserves the polish-loop boundary to the user.

### PC-008 (Medium) Coverage: text spacing was not measured

Evidence: the brief names text spacing (`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` line 13). The measured
clean table (`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` lines 52-63) does not include it, and no task
addresses WCAG text spacing, which asks that a reader override of line height, paragraph spacing,
letter spacing, and word spacing cause no loss of content or function. The census instrument already
measures horizontal overflow, so the check is within reach of the existing tooling.

Impact: an accessibility criterion the brief named is unverified, so the phase cannot record it clean.

Smallest useful change: apply the text-spacing overrides and re-run the overflow and clipping census
across the nine views, then record clean or file the defect.

Owner: research and planner. Add a measurement task.

### PC-009 (Low) Coverage: live announcements were not verified

Evidence: the brief names live announcements (`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` line 12). The app
owns a live region, referenced in the dialog module's own comment at `src/js/ask.js` lines 3-4, but the
research measured no announcement behavior and the plan verifies none. P01-T02 touches the dialog,
which is announcement-adjacent, without confirming the live region announces the actions that matter.

Impact: an accessibility item the brief named is unverified.

Smallest useful change: assert that the live region updates on the key actions with the existing
instruments, or record why announcements are out of scope for this phase.

Owner: research and planner.

### PC-010 (Low) Coverage: icons were not audited

Evidence: the brief names icons (`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` line 9). Finding C's census
tallies font, weight, radius, and shadow, with no icon size or treatment census. The plan is silent on
icons.

Impact: if the app carries a meaningful icon set, its cohesion is unassessed; if it does not, that
should be recorded so the axis is closed rather than skipped.

Smallest useful change: confirm whether the app has a meaningful icon set and whether it was measured,
and record the result, including a plain not-applicable if that is the truth.

Owner: research and planner.

### PC-011 (Medium) P03-T01: the second new backlog block and its effect on the governance counts is unspecified

Evidence: `.copilot-tracking/plans/2026-08-21/cohesion-and-accessibility-plan.md` lines 143-149 and `test/governance-docs.test.js` lines 130-139. The
governance test derives the block count from `^\*\*(BL-\d+):` matches and the gate count from
`^Constraint gate:` matches in the backlog, and asserts GOVERNANCE.md contains the sentence
"the N items with a detail block, M carry that check" with those exact numbers. P03-T01 creates two
backlog entries: one block for this change, which it correctly requires to carry the
"Constraint gate: checked 1 to 11, none breached." line, and a second entry for the non-interactive
everything-read rows, filed Ready. The plan mandates the gate line and count re-derivation only for
the first. The repository rule is that any new backlog detail block carries the gate line. If the
everything-read entry is a detail block, it too needs the gate line, and both new blocks must be
counted in the GOVERNANCE sentence, which moves from the current 38 blocks and 36 gates by plus two
blocks and plus two gates. If the implementer omits the gate line on the second block, the block and
gate counts diverge and either the rule is broken or the governance test goes red.

Impact: a governance test failure, or a shipped detail block missing its mandated gate line, in the
change that is supposed to keep the record straight.

Smallest useful change: state in P03-T01 whether the everything-read entry is a full detail block or a
plain Ready row. If a detail block, require its gate line and derive the GOVERNANCE sentence from the
final backlog as plus two blocks and plus two gates. If a plain row, say so, and derive plus two
blocks and plus one gate. Either way, re-derive from the backlog, never carry a number forward.

Owner: planner. Direct planner correction.

### PC-012 (Medium) P02 and P03-T02: substituting into a watched line can falsify the citing prose, not only move the fingerprint

Evidence: the P02 anchors task in this task's plan artifact, the weight and radius substitution maps
under P02-T01 and P02-T03 in its details artifact, and the evidence anchors section of the
contributor instructions. Six watched
stylesheet lines have their value changed in place. An anchor is fingerprinted by the content of the
line, so each of the six drifts, which the plan expects. The subtler risk is that a citation's prose
may assert the old value. If a document cites a stylesheet line as evidence that a control uses weight
620 or radius 11, and the substitution rewrites that line to 600 or 12, the citation now points at
content that contradicts its own claim, and a re-bless would lock a false pairing silently. The plan's
generic instruction to read the pairing covers line movement well but does not call out value
falsification, which is the case where reading the head against the claim is the only thing that
catches it.

Impact: a silently locked false claim in the record, which is the exact failure the anchors gate and
its bless-reading step exist to prevent.

Smallest useful change: add to P03-T02 that for each of the six watched lines whose value changes, the
citing prose is checked for a reference to the old value, and where the substitution falsifies the
claim the prose is corrected, not only the anchor re-aimed.

Owner: planner. Direct planner correction.

### PC-013 (Low) P01-T01: the file input floor may satisfy the census without enlarging the real target

Evidence: `.copilot-tracking/details/2026-08-21/cohesion-and-accessibility-details.md` lines 79-83 adds `min-height: 24px` to the file input rule
`input[type="file"]` at `src/styles.css` line 804. The research measured the backup control at 241 by 22 by
the control itself (`.copilot-tracking/research/2026-08-21/cohesion-and-accessibility-research.md` line 90), so the census measures the whole
control box, and min-height grows that box to 24, which the census will pass. The native clickable
region of a file input is the button sub-part, which can stay at its intrinsic height while the outer
box grows, so the metric can pass while the actual clickable target stays under the floor.

Impact: the acceptance can read clean while the effective target the criterion is about is still short,
which is the pattern the repository warns about where a check passes without the fix landing.

Smallest useful change: verify the effective clickable region of the file input, not only the element
box, reaches 24px, and if it does not, use padding on the control rather than min-height.

Owner: planner. Verify, then correct if needed.

### PC-014 (Low) Acceptance criteria: the P02 substitution tasks lack sharp per-task criteria and T04 mixes soft targets

Evidence: `.copilot-tracking/plans/2026-08-21/cohesion-and-accessibility-plan.md` lines 89-133. P02-T01, T02, and T03 carry no acceptance of
their own; all acceptance is consolidated in T04. T04 mixes declared and rendered targets and includes
soft or possibly unreachable ones: "sizes measurably down from 26" is soft against the precise weight
and radius targets, and "radii from 12 to 6 or fewer" rendered may be unreachable because the 50%
radius on `src/styles.css` line 450 and the pill value resolve to element-specific pixel radii the census
counts separately, so the rendered radius count is inherently above the six-rung ladder. The directly
controlled metrics are the declared counts, weights 13 to 3, declared rem sizes 33 to 19, declared
radii 17 down, which the plan already states elsewhere and which make sharper, falsifiable per-task
criteria.

Impact: a partial or failed substitution can pass a soft criterion, and an unreachable rendered target
invites either a false failure or a quiet loosening of the bar.

Smallest useful change: give P02-T01, T02, and T03 each a declared-count acceptance, and restate the
T04 size and radius targets against the declared counts, keeping the rendered census as the
invisibility check rather than the count check.

Owner: planner. Direct planner correction.

## Scope assessment

The plan is not too wide. Finding C is correctly bounded to invisible, line-count-preserving
substitutions, and restructuring and new treatments are routed out. The risk is on the narrow side:
four named brief axes, spacing, text spacing, live announcements, and icons, were neither measured
nor explicitly set aside, so the phase cannot claim them clean, and spacing in particular shows the
same sprawl signature the plan does consolidate for typography and radii. Closing those measurement
gaps, then fixing or backlogging per the brief, is what brings the scope to the right width without
turning it into a polish loop.

## Evidence-backed versus missing-evidence

- Evidence-backed defects in the plan's own construction: PC-001, PC-002, PC-003, PC-005, PC-011,
  PC-013, PC-014. Each is grounded in the cited plan, detail, source, or test lines.
- Unproven claims that need evidence before they can be trusted: PC-004 and PC-006, where invisibility
  is asserted at sizes or relationships the research did not measure.
- Missing measurement against the brief: PC-007, PC-008, PC-009, PC-010, where an axis was named and
  never measured, so neither a clean result nor a defect is on record.
- Record-integrity risk: PC-012, where the plan's process is right in general but does not name the
  one case that corrupts the record silently.

## User response required: Yes

The scope questions in PC-007, and to a lesser degree PC-008, PC-009, and PC-010, turn on the brief's
own boundary between closing a measurable inconsistency and starting a polish loop, which the brief
reserves to the user. The font-weight hierarchy question in PC-004 needs a user decision only if an
affected site carries a deliberate weight step. Every other finding is a direct planner correction.
