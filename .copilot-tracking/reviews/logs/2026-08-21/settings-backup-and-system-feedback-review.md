<!-- markdownlint-disable-file -->
# Review: Settings, backup, and system feedback

## Scope and Evidence

* Task ID: MRT-007
* Parent task: MRT-006
* Review date: 2026-08-21
* Review scope: Full task, P01 through P06
* Assessed boundary: BL-174 and BL-175, the settings view and its seven cards, the notice and dialog
  system, every recovery and salvage surface reachable from that view, binding rules R1 through R7,
  the complete staged change against origin/main, the Edge verification matrix, and every repository
  gate
* Plan: .copilot-tracking/plans/2026-08-21/settings-backup-and-system-feedback-plan.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-21/settings-backup-and-system-feedback-plan-critique.md
* Changes: .copilot-tracking/changes/2026-08-21/settings-backup-and-system-feedback-changes.md
* Research: .copilot-tracking/research/2026-08-21/settings-backup-and-system-feedback-research.md
* Other evidence considered: the staged diff against origin/main, a 39-check Edge matrix, captured
  frames at 1280 and under forced colours, a reverted-tree run of the new guards, the repository
  browser suite, final gate outputs, and the anchors lock

## Opening Review State

* Interpreted review goal: Determine once whether grouping the settings view and rerouting its
  confirmations preserves every data-loss safeguard, salvage path, undo path and local-only promise,
  and route anything else without reopening implementation.
* Evidence readiness: Plan, critique, changes, research, completed markers and final validation are
  available and reconciled.
* Acceptance basis: The plan's fourteen acceptance criteria, CR-001 through CR-006 dispositions, the
  seven binding rules, and Repository Constraints 1 through 11.
* Active read-only boundaries: Review inspects all supplied evidence and updates only this record.
* Initial blockers: None.

## Execution Status

* Execution status: Complete
* Review execution evidence: One post-implementation review completed on 2026-08-21 against the full
  staged boundary, the reconciled artifacts, the browser matrix and the final gate run.

## Plan-to-Change Reconciliation

| Current plan scope | Descriptive changes-record summary | Current-state reconciliation | Gap or rationale |
|---|---|---|---|
| P01 and P01-T01 through P01-T03 | Four group sections, backup made primary, heading sizes re-homed | Reconciled | CHG-001; the `#view-data` scoped rules satisfy R7 without touching either shared `.card-static` rule |
| P02 and P02-T01 through P02-T03 | Two new report panes and three repointed call sites | Reconciled | CHG-001; the message strings, kinds and argument order are unchanged, which R2 required |
| P03 and P03-T01 through P03-T03 | A distinct glyph per notice kind and the first forced-colours notice rule | Reconciled | CHG-001; the announced string was measured unchanged rather than reasoned about |
| P04 and P04-T01 | The finished-order empty state given the shared glyph treatment | Reconciled | CHG-001; the settings surface's own recovery copy was left alone under R2 |
| P05 and P05-T01 through P05-T02 | Seven guards, plus repointed delimiters in two test files | Reconciled | CHG-002 records the second test file the plan missed; CHG-003 records the guard rewrite |
| P06 and P06-T01 through P06-T04 | Records, browser matrix, anchors round, recovery review | Reconciled | BL-174 Shipped and BL-175 Ready; CHG-004 records a critique prediction that did not occur; CHG-005 and CHG-006 record the anchors round |

## Completed Work Assessment

| Related marker | Files | What changed and why | Completion evidence | Validation | Assessment |
|---|---|---|---|---|---|
| P01-T01, P01-T02 | src/index.html | Seven cards wrapped in four labelled groups, backup first and primary, danger card left outside and last | Heading order measured as 1,2,3,4,3,2,3,3,2,3,3,2,3,2 with no level skipped | Every card sits in a group except the danger card, guarded by test | Reconciled |
| P01-T03 | src/styles.css | Heading sizes re-homed to `#view-data` scoped rules so the demotion does not invert the hierarchy | Ordinary card titles 15.2px, the primary card title 18.4px, the view's only sub-heading 13.6px | About view title and six sub-headings, and the Add view's four summary headings, measure unchanged | Reconciled |
| P02-T01, P02-T02, P02-T03 | src/index.html, src/js/main.js | Two panes added and three pane selectors repointed so each control confirms in its own card | Confirmation moved from 905px above its button in another card to 38px below it in its own | Holds at 200 per cent zoom, where the old placement was 658px above the viewport | Reconciled |
| P03-T01, P03-T02, P03-T03 | src/styles.css | Four distinct `::before` glyphs and the first forced-colours rule for notices | Four glyphs of different silhouette, every notice bordered | Announced string unchanged, because a `::before` glyph is not in `textContent` | Reconciled |
| P04-T01 | src/index.html | The finished-order empty state given `.empty-glyph`, matching the two library empty states | The three empty states now share one treatment | No recovery copy touched, per R2 | Reconciled |
| P05-T01 | test/settings-view.test.js | Seven guards over grouping, ordering, routing, ids and glyphs | Five fail on a reverted tree; the two preservation guards proved by targeted mutation | Suite 1,263 to 1,270 pass, 0 fail | Reconciled |
| P05-T02 | test/privacy-copy.test.js, test/erase-scope.test.js | Delimiters repointed from h2 to h3 | Not one prose assertion relaxed, removed or reworded | Both files green, the same paragraphs still under test | Reconciled |
| P06-T02, P06-T03 | verification harness | Real Edge across both themes, forced colours, reduced motion and 200 per cent zoom | 39 checks, 0 failed | Repository browser suite 119 of 119 across 14 scenarios, the figure it reported before this work | Reconciled |

## Implementation-Time Plan and Detail Update Assessment

| Affected area or marker | What changed and why | Triggering evidence | Reconciliation performed | Assessment |
|---|---|---|---|---|
| P05-T02 | A second test file needed its delimiter repointed | The erase dialog's wording names a heading the demotion changed, and its test asserts both that the heading exists and that it is above the button | CHG-002 | Reconciled |
| P05-T01 | The routing guard was rewritten from occurrence counts to a call-site walk | Counting selector strings passes without proving which control a confirmation reaches | CHG-003 | Reconciled |
| P06-T01 | CR-005's predicted size gate failure did not occur | The module took three in-argument substitutions and is still exactly 5,030 lines | CHG-004 | Reconciled |
| P06-T03 | The plan, research and critique were de-cited rather than re-aimed | 103 first-time citations enrolled green while pointing at stale lines; MRT-006's artifacts carry none | CHG-005 | Reconciled |
| P06-T03 | Six of nine decision-needing re-aims had wrong hunk arithmetic | The regroup rewrote a region rather than inserting into it, so offsets landed on unrelated nodes | CHG-006 | Reconciled |

## Critique and Material Revision Assessment

* Latest critique dispositions: CR-001 through CR-006 are each resolved once in the final plan, and
  one further finding raised during the critique read, that `.card-static` is shared and so no rule
  keyed on it may be rewritten, became binding rule R7. No finding was carried into implementation
  unresolved.
* CR-005 is the one worth naming at closeout: it predicted a stated-file-size failure that did not
  materialise. It was a reasonable prediction and is recorded as not having occurred rather than
  quietly dropped, which is the honest disposition for a prediction that comes out green.
* Material revisions: None. The five implementation-time updates above preserve approved intent and
  change no requirement, scope, architecture or acceptance criterion.
* Dependent-work pause assessment: P05 and P06 followed completed P01 through P04 evidence, and the
  anchors round was deliberately run once, after the last source edit was final.

## Recovery, Undo and Data-Loss Assessment

Reviewed harder than the rest, per the repository's standing instruction that the most dangerous code
in a change is usually the code added to prevent data loss, and per the owner's brief.

* `src/js/storage.js` is byte for byte unchanged, verified by diff. Every latch, read-back, salvage
  copy and pre-restore snapshot is therefore untouched, and no new storage key exists.
* No offer's condition changed. The undo button is still shown and hidden by the same snapshot test,
  and the salvage surfaces still appear and withdraw at the same moments. Driving a blocked store
  still produces the banner, the salvage list and all three salvage answers.
* A stale-action defect was fixed rather than introduced. Before this change, pressing Clear cache
  overwrote a `Restore refused, nothing was changed.` message the reader had not read, because both
  wrote into one pane. The refusal now survives an unrelated cache clear, which was measured.
* Repeated offers were tested: the erase dialog was opened and cancelled twice, and the salvage
  offers were driven twice, with no duplicated or orphaned state.
* The erase dialog's title, body and button order are unchanged, and the claim its wording makes
  about the page, that what will be erased is described under a named heading above the button, is
  still true and is still under test.
* The local-only promise is intact. Nothing added here reads or writes the network, and the privacy
  copy gate passes with its delimiters repointed and not one prose assertion relaxed.

## Findings

* None open.
* One defect was found during review and fixed inside this change rather than routed: the guard for
  confirmation routing asserted raw occurrence counts, which passes without proving the claim. It
  was rewritten to walk from the message to its `notify()` call. The rewrite's own trap, that a
  message assembled in a ternary above its call site binds backwards to the previous call, was found
  by inspection, removed, and the helper hardened so the whole class fails loudly. The hardening was
  proved by temporarily re-adding the bad case.
* One finding was raised and refuted rather than fixed: dialog focus was believed not to return to
  the opener. Measurement confirmed it does not, landing on the view heading instead, but it behaves
  identically on this change's base commit, so it is pre-existing and outside the assessed boundary.
  It is routed below rather than fixed here.
* One observation assessed and accepted, not routed: the type step between a group label and an
  ordinary card title is 0.8px and 50 units of weight, in the same colour, so the grouping is carried
  chiefly by the label sitting outside any card with 27.2px of space above a run of bordered cards.
  That is the distinction the plan asked for and it is legible in both themes and under forced
  colours, where each label also gains a rule line. It is recorded in the changes record rather than
  filed, because nothing is defective; the point is that a later change could collapse the hierarchy
  without touching a font rule.

## Follow-Up Routing

| Item | Why outside this task | Route |
|---|---|---|
| Return focus to the control that opened a dialog | Measured identical on the base commit, so it is pre-existing rather than a regression, and it belongs with dialog behaviour rather than with settings layout | BL-175, Ready |

## Outcome

* Review outcome: Conformant for the assessed boundary.
* No material finding is open. The one routed item is a pre-existing defect, proved so by
  measurement on the base commit, and not a defect in what shipped.
