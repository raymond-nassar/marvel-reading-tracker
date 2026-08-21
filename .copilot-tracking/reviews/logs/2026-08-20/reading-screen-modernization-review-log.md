<!-- markdownlint-disable-file -->
# Review: Reading screen modernization

## Scope and Evidence

* Task ID: MRT-003
* Review date: 2026-08-20
* Review scope: Full task, P01 through P06
* Assessed boundary: the five requirements the user set for the active reading-order screen, the
  preservation list attached to them, the anchors budget the plan adopted as a constraint, the
  complete staged change against origin/main, and the final gate outputs
* Plan: .copilot-tracking/plans/2026-08-20/reading-screen-modernization-plan.md
* Phase details: .copilot-tracking/details/2026-08-20/reading-screen-modernization-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-20/reading-screen-modernization-plan-critique.md
* Changes: .copilot-tracking/changes/2026-08-20/reading-screen-modernization-changes.md
* Other evidence considered:
  .copilot-tracking/research/2026-08-20/reading-screen-modernization-research.md, the staged diff,
  before-and-after measurement in Edge at 1280x900 and 2560x1080, screenshots in both themes with
  covers on and off and under forced colours, and the read of every blessed anchor pairing

## Opening Review State

* Interpreted review goal: determine once whether the shipped reading screen meets the five stated
  requirements without breaking anything on the preservation list, and route anything left over
  rather than reopening implementation.
* Evidence readiness: plan, details, critique, changes, research, product records and final
  validation are all present and reconciled.
* Acceptance basis: the user's five numbered requirements, the preservation list, CR-001 through
  CR-009 dispositions, and the repository's own gates.
* First comparison boundary: reconcile each plan marker against the staged diff and the measured
  figures before assessing defects.
* Active read-only boundaries: review inspects the supplied evidence and updates only this record.
* Initial blockers: none.

## Execution Status

* Execution status: Complete
* Review execution evidence: one post-implementation Review completed on 2026-08-20 against the
  full staged boundary, the measured figures, the browser evidence and the final gate set.

## Plan-to-Change Reconciliation

| Current plan scope | Descriptive changes-record summary | Current-state reconciliation | Gap or rationale |
|---|---|---|---|
| P01 and P01-T01 through P01-T02 | Let the reading view use the desktop, and state progress in words | Reconciled | The view takes the existing wide opt-out and the ring's figure left its `title` for on-screen text |
| P02 and P02-T01 through P02-T02 | Strengthen the hero | Reconciled | Cover, title and one dominant action all grew; the third action is drawn as a link |
| P03 and P03-T01 | Demote list management without hiding it | Reconciled | The border moved from five buttons to the strip; nothing left the DOM or the tab order |
| P04 and P04-T01 | Stop the Coming Up shelf clipping | Reconciled | A wrapping grid with a capped tile replaces the horizontal scroller |
| P05 and P05-T01 through P05-T03 | Make the full order scannable | Reconciled | Separator, larger thumbnail, larger title, current-row bar, sticky filters and a positive count on a finished volume |
| P06 and P06-T01 through P06-T05 | Prove it and record it | Reconciled | Nine failing-first unit assertions, thirteen browser assertions, the backlog row and block, the changelog entry and two corrections the change forced |
| Anchors budget | Held in place rather than planned as a task | Reconciled | Both citation-dense files still hold their original line counts; all new declarations went to the end of the stylesheet |

## Completed Work Assessment

| Related marker | Files | What changed and why | Completion evidence | Validation | Assessment |
|---|---|---|---|---|---|
| P01-T01 through P01-T02 | src/index.html, src/styles.css, src/js/main.js | The view opts into the wide shell; the ring grew and its figure became text | 876px at both widths becomes 964px and 1296px; `title="0 / 8"` becomes `0 of 8 read` and `8 to go · 0%` | Unit and browser assertions, both themes | Reconciled |
| P02-T01 through P02-T02 | src/index.html, src/styles.css | One dominant call to action, a larger cover and a clearer title | Cover 176x264 becomes 248x372; hero title 30.4px becomes 35.2px; the primary button measures larger than the secondary and the third has no fill | Browser assertions at both widths | Reconciled |
| P03-T01 | src/styles.css | Five outlined pills became one bounded strip | The strip reports a border, all five tools are present and every one is still focusable | Browser assertion on names and reachability; the global focus ring is unchanged | Reconciled |
| P04-T01 | src/styles.css | The shelf wraps instead of scrolling | 62px of overflow at both widths becomes 0px; eight tiles land on one row at 2560 | Browser assertions at both widths | Reconciled |
| P05-T01 through P05-T03 | src/styles.css | Rows separated, enlarged and marked | Thumbnail 34px becomes 44px; row title 14.24px becomes 15.04px | Unit assertions on the declarations; visual inspection in both themes | Reconciled |
| P06-T01 through P06-T05 | test/reading-screen.test.js, scripts/browser-check.mjs, PRODUCT_BACKLOG.md, CHANGELOG.md, GOVERNANCE.md | Proof and record | Nine unit assertions, thirteen browser assertions, BL-169 row and block, an Unreleased entry | Every gate green | Reconciled |

## Implementation-Time Plan and Detail Update Assessment

| Affected area or marker | What changed and why | Triggering evidence and user decision | Reconciliation performed | Planning and critique state | Assessment |
|---|---|---|---|---|---|
| P05-T01 | The row separator became an adjacent-sibling top border and the current-row bar an inset shadow | CR-002: a bottom border on `.row` risked the ungated-hairline test and fought the hover rule | Plan, details and changes all describe the shipped shape | Final after the one critique | Reconciled |
| P06 palette allocation | No palette pair was added | CR-008, rejected on evidence: the hero already counts as a card surface, so every combination the change renders was already measured | The gate reports 0 new below-floor pairs and the surface assertions did not move | Final after the one critique | Reconciled |
| Unplanned | GOVERNANCE.md's derived count of constraint-gate lines was corrected | Adding a detail block falsified a figure a test derives from the backlog | Recorded as its own section in the changes record | No replanning required | Reconciled |
| Unplanned | A sentence in the released BL-165 changelog entry was corrected | That entry named the reading list as a view that stays narrow, which this change makes false | Recorded as its own section in the changes record | No replanning required | Reconciled |

## Critique and Material Revision Assessment

* Latest critique dispositions: CR-001, CR-002, CR-003, CR-006 and CR-007 were applied and are
  visible in the shipped stylesheet. CR-004 and CR-005 were accepted as designed and recorded.
  CR-008 and CR-009 were rejected on evidence and the evidence held: the palette gate reports 0 new
  pairs, and the five requirements shipped as one feature.
* Material revisions: none. No finding required a user decision and nothing conflicts with a
  confirmed decision.
* Dependent-work pause assessment: the critique ran once, before any source was touched, so no
  implementation proceeded against an unresolved finding.
* Justification assessment: supported by the plan, the critique table, the changes record and the
  final gate outputs.

## Findings

* None material. Three observations, none of which changes the shipped result:
  * A current row that is not the first row now takes the separator colour on its top edge rather
    than the accent tint, because the adjacent-sibling rule is later in the file at equal
    specificity. The current row is marked by its inset bar, its background wash and its remaining
    three edges, so the state stays legible and the separator stays continuous. Accepted.
  * CR-004 stands as recorded: at 2560px the per-row action cluster sits up to 1296px from the
    title it acts on. Right-aligned row actions are the ordinary pattern and the alternative is a
    DOM change the anchors budget rules out.
  * CR-005 stands as recorded: the hero description is capped at 58 characters, so a very wide hero
    leaves air to the right of the text.

## Defects

* None.

## Routed Findings

| Finding | Destination | Owner or next action | Reason for route |
|---|---|---|---|
| None | None | None | No implementation, planning or research finding requires routing |

Later implementation of a routed finding does not require another Review.

## Residual Work

* None attributable to this task. BL-165's second task is now partly overtaken by this change, which
  the backlog block records rather than leaving the two documents to disagree.

## Blockers and Remaining Work

* Blockers: none.
* Remaining active work: none in P01 through P06.

## Validation Evidence

| Command or observation | Scope | Status | Summary |
|---|---|---|---|
| npm run lint | Full tree | Passed | 0 errors |
| npm test | Full tree | Passed | 1,225 tests, 0 failed |
| npm run anchors | Tracked evidence | Passed | 899 unchanged, 0 drifted, 0 new, 0 removed, exit 0 |
| Anchors bless read | 82 changing pairings | Passed | Every pairing read against its claim; the one NOTICE named two anchors genuinely shared by unlike claims about the same line |
| npm run counts | Product records | Passed | 143 ranked rows, 5 parked, 148 detail blocks; every stated figure agrees |
| npm run sizes | Repository claims | Passed | 7 stated sizes agree |
| npm run palette | Dark and light themes | Passed | 88 pairs, 0 new below the floor |
| npm run publication | Reachable history | Passed | 2 protected roots, 0 content findings |
| npm run browser | Running app | Passed | 116 assertions across 14 scenarios |
| Failing-first proof | test/reading-screen.test.js | Passed | 8 of 9 assertions fail on the stashed tree; the ninth fails when the ring constant is mutated |
| Measurement in Edge | 1280x900 and 2560x1080 | Passed | View 876 to 964 and 1296; cover 176x264 to 248x372; shelf overflow 62px to 0px at both widths |
| Screenshot inspection | Dark, light, covers off, forced colours | Passed | All four render correctly; the narrow rail seen in one capture was reproduced as a full-page capture artifact and disproved by probing the live grid |
| Added-line dash scan | Full diff | Passed | 0 en or em dashes |
| Line-count check | src/index.html and src/js/main.js | Passed | 835 and 4,801 lines before and after |

## Outcome

* Outcome: Conformant
* Outcome rationale: each of the five requirements has a measured before-and-after figure, every
  item on the preservation list is either untouched in the source or covered by a passing
  assertion, all nine critique findings carry a recorded and honoured disposition, the anchors
  round closed at 0 drifted, 0 new and 0 removed after every pairing was read, and the full gate
  set is green.

## Closeout Routing Record

| Finding class | Destination | Owner or next action |
|---|---|---|
| Implementation defect | None | No action |
| Decision gap or invalid assumption | None | No action |
| Material evidence gap | None | No action |
| Non-blocking residual work | None | No action |

* Execution status: Complete
* Outcome: Conformant
* Validation coverage: lint, unit, evidence anchors, product records, sizes, palette, publication,
  browser, failing-first proof, direct measurement, four rendering modes and the added-line dash scan
* Blockers: None
