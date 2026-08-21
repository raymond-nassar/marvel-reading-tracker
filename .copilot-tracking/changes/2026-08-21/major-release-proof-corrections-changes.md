<!-- markdownlint-disable-file -->
# RPI Changes: Major release proof corrections

## Metadata

* Task ID: MRT-002-F01
* Related plan: .copilot-tracking/plans/2026-08-21/major-release-proof-corrections-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/major-release-proof-corrections-phase-details.md
* Implementation date: 2026-08-21

## Execution Status

* Status: Complete
* Declared invocation scope: Full plan
* Active marker: None
* Completed markers: P01 through P03 and P01-T01 through P03-T02
* Remaining markers: None

## Execution Summary

Implement the three routed parent Review findings together. Start with a behavior-preserving,
import-safe runner seam and red-first tests before changing historical materialization, progress
coverage, proof mutations, or canonical maintainer instructions.

## Implementation-Time Updates

### Stable cross-version read action

* Affected marker: P02-T01.
* Classification: Immediately relevant current-state update preserving approved intent.
* Triggering evidence: The actual v1.2.0 build did not expose the planned issue-row selector after
  import, so the first corrected upgrade run stopped on that selector before making a read mark.
* Reconciliation: Both versions expose the current-issue Done control. The runner now uses that
  user-facing action, waits for one stored read marker, and proves that marker belongs to the
  imported order. The plan and phase details now state the stable surface and exact evidence.
* Planning and critique state: The accepted historical and nonzero-progress boundary is unchanged;
  no new decision or critique is required.

## Completed Work

### Historical release materialization and progress proof

* Affected markers: P01-T01, P02-T01, and P03-T01.
* The runner now reconstructs the historical server and complete source tree byte for byte from the
  local v1.2.0 Git tag, with explicit failure for missing history, incomplete trees, unsafe paths,
  or unreadable blobs.
* The current candidate remains a separate working-tree copy.
* The v1.2.0 UI imports House of M and marks one issue read. Storage identity, issue order, the exact
  read marker, and visible nonzero progress survive the folder swap into 1.3.0.
* A fifth mutation discards read state in the disposable new build and turns only the intended paint
  assertion red.

### Canonical maintainer contract

* Affected markers: P01-T02 and P02-T02.
* Browser instructions now use MRT_PUPPETEER, MRT_EDGE, and `--only=<scenario-name>`, describe the
  ephemeral-port and manual-run boundaries, and no longer claim pull requests run Edge journeys.
* Upgrade instructions now describe local v1.2.0 Git materialization and remove the unsupported
  single-scenario command.
* Semantic documentation tests derive supported environment names from the runner and reject the
  retired variables, selectors, fixed-port claim, CI claim, and fixture claim.

### Evidence and product-record reconciliation

* Affected marker: P03-T02.
* The existing release changelog now states the stronger historical and nonzero-progress proof.
* BL-160's detail record now reflects five mutations and the corrected live source anchors.
* Eleven changed anchor pairings were read against their claims and the lock closed at 1,021
  unchanged with zero drifted, new, or removed.

## Validation Record

| Check | Status | Evidence |
|-------|--------|----------|
| Existing suite after import-safe refactor | Passed | Full suite stayed green before behavioral changes |
| Focused tests before correction | Failed as required | Four named tests failed for historical, progress, browser-guide, and upgrade-guide ownership |
| Focused tests after correction | Passed | 11 passed, zero failed |
| npm run upgrade | Passed | 12 assertions from actual v1.2.0 to 1.3.0 |
| npm run upgrade:prove | Passed | Five of five aimed mutations caught |
| npm run lint | Passed | Zero problems |
| npm test | Passed | 1,303 passed, zero failed |
| npm run anchors | Passed | 1,021 unchanged; zero drifted, new, or removed |
| npm run counts | Passed | 158 ranked rows and 163 detail blocks agree |
| npm run sizes | Passed | Seven claims agree |
| npm run palette | Passed | 88 pairs measured; zero new failures |
| npm run publication | Passed | 2,429 blobs scanned; zero findings |
| npm run contract | Passed | 33 of 33 assumptions hold |
| npm run browser | Passed | 119 assertions across 14 scenarios |
| npm run pack | Passed | Windows archive created |
| Static release checks | Passed | README 118 lines, three 1.3.0 owners agree, zero dash additions, no tag or release |

## Blockers

* None.

## Remaining Work

* None inside the approved child scope.

## Follow-Up Items

* Publication remains a distinct parent follow-up after this child task completes.

## Pre-Review Reconciliation

* Plan markers and phase details: P01 through P03 and all six tasks are complete.
* Completed-work evidence and implementation-time update: Current.
* Validation, blockers, remaining work, and follow-up items: Current.
* Critique state: Exactly one critique completed; PC-001 was applied directly without another pass.
* Review readiness: Ready for the child task's single Review.
