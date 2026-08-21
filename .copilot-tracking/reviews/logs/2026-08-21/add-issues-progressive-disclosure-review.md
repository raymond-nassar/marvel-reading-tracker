<!-- markdownlint-disable-file -->
# Review: Add Issues progressive disclosure

## Scope and Evidence

* Task ID: MRT-006
* Parent task: MRT-005
* Review date: 2026-08-21
* Review scope: Full task, P01 through P05
* Assessed boundary: BL-171 through BL-173, the five Add paths, the copy and count contract, binding
  rules R1 through R5, the complete staged change against origin/main, the Edge verification matrix,
  and every repository gate
* Plan: .copilot-tracking/plans/2026-08-21/add-issues-progressive-disclosure-plan.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-21/add-issues-progressive-disclosure-plan-critique.md
* Changes: .copilot-tracking/changes/2026-08-21/add-issues-progressive-disclosure-changes.md
* Research: .copilot-tracking/research/2026-08-21/add-issues-progressive-disclosure-research.md
* Other evidence considered: the staged diff against origin/main, the 38-check Edge matrix, eight
  captured frames at 1280 and at 200 per cent zoom, final gate outputs, and the anchors lock

## Opening Review State

* Interpreted review goal: Determine once whether the Add view restructure preserves the confirmed
  product direction, the count contract and every protection around lookup, duplicates, unresolved
  imports, hydration and cancellation, and route anything else without reopening implementation.
* Evidence readiness: Plan, critique, changes, research, completed markers and final validation are
  available and reconciled.
* Acceptance basis: Plan acceptance criteria, PC-001 through PC-010 dispositions, the binding rules,
  and Repository Constraints 1 through 11.
* Active read-only boundaries: Review inspects all supplied evidence and updates only this record.
* Initial blockers: None.

## Execution Status

* Execution status: Complete
* Review execution evidence: One post-implementation review completed on 2026-08-21 against the full
  staged boundary, the reconciled artifacts, the browser matrix and the final gate run.

## Plan-to-Change Reconciliation

| Current plan scope | Descriptive changes-record summary | Current-state reconciliation | Gap or rationale |
|---|---|---|---|
| P01 and P01-T01 through P01-T04 | Promote search, group the other four paths, restyle, restate results | Reconciled | CHG-001 closes T01 and T02; the summary grid, the `.addpri` card and the `.res-head` strip carry T03 and T04 |
| P02 and P02-T01 through P02-T02 | The held-count helper and its tests | Reconciled | CHG-005 records that the helper asks the issue store rather than the destination list, with eight tests |
| P03 and P03-T01 through P03-T02 | Copy and structure guards | Reconciled | Seven markup and source guards, each proved to fail on a reverted tree |
| P04 and P04-T01 | Backlog, changelog, governance | Reconciled | BL-171 Shipped, BL-172 and BL-173 Ready; one changelog entry; governance block and gate counts re-derived |
| P05 and P05-T01 | Gates and browser matrix | Reconciled | 38 of 38 Edge checks pass; lint, tests, sizes, counts, palette, publication and anchors all exit 0 |

## Completed Work Assessment

| Related marker | Files | What changed and why | Completion evidence | Validation | Assessment |
|---|---|---|---|---|---|
| P01-T01, P01-T02 | src/index.html, src/js/main.js | Search became a permanently open card and the other four paths moved under one "Other ways to add" heading | Heading order measured as 1,2,2,3,3,3,3; the rail close loop narrowed to `#view-add details.card[open]` | Five rail entries each land focus in the right control and never leave two paths open | Reconciled |
| P01-T03 | src/styles.css | Summary became a two-column grid so the purpose line sits under the heading | Only four `details.card` exist and no script creates one | 0 px horizontal overflow at 640, 1280, 1920 and 2560 | Reconciled |
| P01-T04 | src/js/main.js | Results open with a count, a held count and the destination, announced with the same string | The `.res-head` strip and `announce()` are given one value, not two | Result panes remain non-live, so the announcement is not doubled | Reconciled |
| P02-T01, P02-T02 | src/js/lib/model.js, test/add-summary.test.js | `heldCount` counts distinct ids present in the issue store | Eight tests including a repeated id and a negative synthetic id | Full suite 1,263 pass, 0 fail | Reconciled |
| P03-T01, P03-T02 | test/add-view.test.js | Seven guards over structure and the five row-button sites | Each proved to fail on a reverted tree | Failure messages name the site that regressed | Reconciled |
| P04-T01 | PRODUCT_BACKLOG.md, CHANGELOG.md, GOVERNANCE.md | Recorded the shipped work and the two routed items | Intro id list re-derived independently: 130 ids, 130 Shipped rows, sets identical | counts and sizes exit 0 | Reconciled |
| P05-T01 | verification harness | Real Edge across four widths, forced colours and reduced motion | 13 of 13 visible controls named; 0 animated nodes under reduce | anchors 0 drifted, 0 new, 0 removed | Reconciled |

## Implementation-Time Plan and Detail Update Assessment

| Affected area or marker | What changed and why | Triggering evidence | Reconciliation performed | Assessment |
|---|---|---|---|---|
| P01-T03 | `.pill-held` gained `flex: none` and `white-space: nowrap` | At 640 CSS pixels the pill broke across three lines inside the flex row | CHG-003 records it as a departure from the plan | Reconciled |
| P01-T04 | Loading messages moved to a new `busy` notice kind with no animation at all | The plan permitted animation inside a no-preference query; shipping none is the stronger guarantee | CHG-002 | Reconciled |
| P01-T04 | The destination sentence became one `addDestination()` used by three panes | Writing it twice would have left two copies of wording that is part of the count contract | CHG-004 | Reconciled |
| P04-T01 | Three record claims corrected | Two were made false by this change; the third was already false and is proved so by the anchors lock | CHG-006 | Reconciled |

## Critique and Material Revision Assessment

* Latest critique dispositions: PC-001 through PC-010, four of them major, are each resolved once in
  the final plan. No finding was carried into implementation unresolved.
* Material revisions: None. The four implementation-time updates above preserve approved intent and
  change no requirement, scope, architecture or acceptance criterion.
* Dependent-work pause assessment: P05 followed completed P01 through P04 evidence.

## Recovery, Duplicate and Cancellation Protections

Assessed specifically, because the Add view is where a half-finished import can be left behind.

* The row Add button stays enabled on a held row, so the narrower and truer answer, "Already in that
  list", is still reachable. Disabling it would have replaced a true statement with a vaguer one.
* Unresolved import rows keep search, the unique-exact-match auto-accept and the candidate list.
  Typing a manual title never auto-picks a match, which was measured rather than assumed.
* Hydration still runs after every add, because the list endpoints return neither cover nor
  `digitalId`. That is also why cover thumbnails were routed to BL-173 rather than shipped here.
* The 2025 snapshot boundary is still stated in the page by the manual entry form, unchanged.

## Findings

* None open. One defect was found during review and fixed inside this change rather than routed: a
  citation of `importCurated` named an unrelated line. The anchors lock proves it named that same
  text before this change, so it is not a regression, and the repository rule for a defect of that
  class is a silent fix inside work already under way rather than a change of its own.

## Follow-Up Routing

| Item | Why outside this task | Route |
|---|---|---|
| A visible cancel control for a long series or creator add | The plan scoped this task to disclosure and hierarchy, not to new controls | BL-172, Ready |
| Cover thumbnails on Add results | Needs a per-issue fetch the list endpoints do not serve, so it is a hydration question rather than a layout one | BL-173, Ready |

## Outcome

* Review outcome: Conformant for the assessed boundary.
* No material finding is open. The two routed items are new work, not defects in what shipped.
