<!-- markdownlint-disable-file -->
# Plan critique: Library and Progress modernization

## Metadata

* Task ID: MRT-005
* Plan under critique: .copilot-tracking/plans/2026-08-20/library-and-progress-modernization-plan.md
* Research: .copilot-tracking/research/2026-08-20/library-and-progress-modernization-research.md
* Critique date: 2026-08-20
* Critique execution: Complete
* Verdict: Revise

## Inputs and boundary

* Supplied inputs: the final candidate plan, the research artifact, the user's six numbered
  requirements with the preservation list and the prohibition list, and the repository's own
  standing constraints and gate rules.
* Criterion boundary: requirements coverage, research grounding, phase and task decomposition,
  acceptance criteria, dependencies, decisions, risk, and missed concerns.
* Limitation recorded at the time: the critique could not verify implementation outcomes that had
  not been executed, so every finding is about the plan rather than about shipped behaviour.

## Findings

One pass, twelve findings, one blocking. All twelve were applied directly by the planning parent;
none required a user decision, because none conflicted with confirmed user direction.

| ID | Severity | Finding | Disposition |
|---|---|---|---|
| CR-001 | Blocking | The plan's new helper module needed an import line in `src/js/main.js`, and a single inserted line there moves every citation that names the file. | Applied. The progress helpers are appended to the existing `src/js/lib/model.js` instead, whose import is already multi-line and can take five more names without gaining a line. |
| CR-002 | High | The show-more button is the first focusable control these views have ever held, and the whole-container rebuild behind it would drop focus to the body. | Applied. The rebuild runs inside `preservingFocus`, with the button as the primary target and the "Showing n of n" line as the fallback for the press that removes the button. |
| CR-003 | High | The progress reveal counter was keyed by view alone, so the two scopes and the several lists would share one count. | Applied. The key is `scope:listId` for progress, which cannot collide with a library view value. |
| CR-004 | High | "Complete" overstated what a series row can know. The app tracks issues in a list, not a series, so a full bar can mean a series finished or one issue of one tracked. | Applied. The chip reads "Fully read", and the copy contract forbids any word implying the series itself has ended. |
| CR-005 | Medium | The plan's series identity rule differed from the one `seriesProgress` already uses, so the same series could group two ways on two screens. | Applied. `seriesKey` is shared, and the two surfaces derive identity identically. |
| CR-006 | Medium | The date buckets were computed by subtracting fixed millisecond spans, which is wrong across a daylight saving boundary and made the rolling week off by one. | Applied. Buckets are computed from local day ordinals. |
| CR-007 | Medium | An empty reading order divided by zero in the percentage. | Applied. A zero tracked count yields 0 per cent rather than `NaN`. |
| CR-008 | Medium | The plan asserted an early return in `setCovers` that the code does not contain. | Applied. The claim was removed rather than the code changed. |
| CR-009 | Medium | The cover mosaic markup was incomplete and named a fallback pattern the painter does not use. | Applied. Covers reach the painter through `paintCover(img, fb, issue, 'portrait_incredible')`, the vetted builder the reading rows already use, so no new image size enters the cache. |
| CR-010 | Low | A cited `src/index.html` line would drift as soon as the planned class was added to it. | Applied. The citation was re-aimed as part of the anchors round rather than left to drift. |
| CR-011 | Low | The plan's failing-first procedure used `git checkout` to restore, which is unsound for a file that does not yet exist and discards the index. | Applied. The procedure uses `git stash push` and `git stash pop`. |
| CR-012 | Low | The plan proposed a new empty-state treatment when `.empty-state` already exists with a dashed edge, which is a shape difference rather than a colour one. | Applied. The existing rule is reused, so the views read as deliberately empty under forced colours without a second rule. |

## Coverage assessment

* Requirements: all six numbered requirements are addressed by at least one task, and the count
  contract is stated once and referenced rather than restated per phase.
* Research grounding: every finding above is traceable to the research artifact or to the code, not
  to recollection.
* Residual risk accepted by the planning parent: the derived groupings are computed on every render
  rather than memoized. Measured at the cap this is 120 rows, which is below the threshold at which
  the repository has ever recorded a render cost concern.

## Closeout

* Critique execution: Complete
* Verdict: Revise
* Highest-impact finding: CR-001, the import line that would have moved every citation naming
  `src/js/main.js`.
* Action owner: the planning parent, which applied all twelve directly.
* User response required: No.
