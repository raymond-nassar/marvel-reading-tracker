<!-- markdownlint-disable-file -->
# Review: Major release proof corrections

## Scope and Evidence

* Task ID: MRT-002-F01
* Review date: 2026-08-21
* Review scope: Full child task, P01 through P03 and P01-T01 through P03-T02
* Assessed boundary: Closure of parent RV-001 through RV-003, approved correction requirements,
  critique disposition, implementation-time selector update, validation, and publication exclusion.
* Plan: .copilot-tracking/plans/2026-08-21/major-release-proof-corrections-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/major-release-proof-corrections-phase-details.md
* Plan critique:
  .copilot-tracking/reviews/plans/2026-08-21/major-release-proof-corrections-plan-critique.md
* Changes: .copilot-tracking/changes/2026-08-21/major-release-proof-corrections-changes.md
* Other evidence considered:
  .copilot-tracking/research/2026-08-21/major-release-proof-corrections-research.md, parent Review,
  source and test diff, and complete validation output.

## Opening Review State

* Interpreted review goal: Determine once whether the combined implementation credibly closes all
  three routed parent defects without widening runtime or publication scope.
* Review scope: Full child task.
* Evidence readiness: Research, plan, phase details, exactly one critique, changes record, complete
  markers, red-green proof, and full release matrix are available.
* Acceptance basis: FR-01 through FR-09, NFR-01 through NFR-06, AC-01 through AC-08, PC-001
  disposition, and parent RV-001 through RV-003.
* First comparison boundary: Historical byte materialization, nonzero read-state preservation and
  mutation aim, then maintainer-runner contract and semantic tests.
* Active read-only boundaries: Review may write only this canonical record. No second Review is
  planned.
* Initial blockers: None.

## Execution Status

* Execution status: Complete
* Review execution evidence: The full child artifact set, exact child source and test boundary,
  validation record, and one bounded read-only code-review lens were assessed once on 2026-08-21.

## Plan-to-Change Reconciliation

| Current plan scope | Descriptive changes-record summary | Current-state reconciliation | Gap or rationale |
|--------------------|------------------------------------|------------------------------|------------------|
| P01 | Import-safe seam and four focused red proofs | Reconciled | The unchanged suite remained green after the seam; four named tests then failed before correction. |
| P02-T01 | Historical app materialization and nonzero progress proof | Partial | The tag, source bytes, read ID, paint, and five mutations are covered, but partial clones can lazily fetch missing objects. |
| P02-T02 | Canonical maintainer instructions | Reconciled | Variables, selectors, ports, CI behavior, and historical-source description match runner behavior except for the offline guarantee in RV-001. |
| P03 | Focused and complete release validation | Reconciled | All expected commands ran and passed; insufficiency is in an untested partial-clone boundary, not an omitted command. |
| Follow-Up Items | Publication remains external | Reconciled as distinct follow-up | Publication remains outside active scope and waits on RV-001. |

## Completed Work Assessment

| Related marker | Files | What changed and why | Completion evidence | Validation | Assessment |
|----------------|-------|----------------------|---------------------|------------|------------|
| P01-T01 and P02-T01 | scripts/upgrade-check.mjs, test/upgrade-check.test.js | Materialized v1.2.0 from Git, marked one issue read, and preserved its identity and visible progress. | Historical fixture test, 12 normal assertions, and five aimed mutations. | Focused tests and browser upgrade runs pass. | Reconciled except RV-001. |
| P01-T02 and P02-T02 | docs/MAINTAINING.md, test/governance-docs.test.js | Aligned canonical instructions with actual browser and upgrade interfaces. | Semantic tests derive environment support and reject retired claims. | Focused and full suites pass. | Reconciled except the offline wording exposed by RV-001. |
| P03 | All child targets and release evidence | Re-ran the release matrix and reconciled records and anchors. | Complete changes record and zero remaining markers. | Every recorded check passes. | Reconciled. |

## Implementation-Time Plan and Detail Update Assessment

| Affected area or marker | What changed and why | Triggering evidence and user decision | Reconciliation performed | Planning and critique state | Assessment |
|-------------------------|----------------------|---------------------------------------|--------------------------|-----------------------------|------------|
| P02-T01 | Used the historical current-issue Done control rather than an unstable row selector. | The actual v1.2.0 build timed out on the planned row selector before writing a read mark. | Plan, details, and changes record now require the shared user-facing control and exact stored marker. | Approved intent preserved; no new decision or critique needed. | Reconciled. |

## Critique and Material Revision Assessment

* Latest critique dispositions: Exactly one critique produced PC-001 Medium. Planning directly
  sequenced a behavior-preserving import seam and green baseline before the behavioral red proof.
* Material revisions: None after critique. The cross-version selector update preserved the approved
  user action and evidence boundary.
* Dependent-work pause assessment: Historical behavior changed only after the focused test existed
  and failed.
* Justification assessment: Supported.

## Plan Follow-Up Assessment

| Follow-up item | Why outside immediate scope | Owner or next action | Assessment and route |
|----------------|-----------------------------|----------------------|----------------------|
| Publish the tag, GitHub release, and Windows archive | Externally visible and excluded from the child task. | Repository owner after RV-001 is resolved and the release commit reaches main. | Open distinct follow-up. |

Unresolved plan follow-up items remain distinct follow-up work. They are not active plan scope.

## Findings

<!-- rpi:review id=RV-001 -->
### RV-001 [Medium]: Partial clones can fetch missing historical objects

* Related scope: P02-T01 and NFR-02
* Evidence: scripts/upgrade-check.mjs invokes `git rev-parse`, `git ls-tree`, and `git show` with the
  inherited environment. In a promisor partial clone, object access may lazily fetch missing v1.2.0
  objects even though docs/MAINTAINING.md says the proof makes no network request.
* Impact: The check can depend on remote availability and transfer data instead of failing the
  promised local-history prerequisite.
* Destination: rpi-implement
* Smallest useful next action: Set `GIT_NO_LAZY_FETCH=1` for every historical Git subprocess and pin
  that environment contract with a focused failing test before implementation.

## Defects

* RV-001 routes to a later rpi-implement invocation.

## Routed Findings

| Finding | Destination | Owner or next action | Reason for route |
|---------|-------------|----------------------|------------------|
| RV-001 | rpi-implement | Disable Git lazy fetching and pin the subprocess environment. | Implementation defect in the offline historical-source contract. |

Later implementation of the routed finding does not require another Review.

## Residual Work

* Publication remains a distinct externally visible follow-up after RV-001 is resolved.

## Blockers and Remaining Work

* Blockers: Publication is blocked on RV-001.
* Remaining active work: None inside the completed child scope. RV-001 is later implementation work
  under this one Review outcome.

## Validation Evidence

| Command | Scope | Status | Summary |
|---------|-------|--------|---------|
| Focused red proof | Four correction contracts | Passed as evidence | Four named tests failed before implementation. |
| Focused green tests | Upgrade and maintainer contracts | Passed | 11 passed, zero failed. |
| npm run lint | Release candidate | Passed | Zero problems. |
| npm test | Release candidate | Passed | 1,303 passed, zero failed. |
| npm run anchors | Release candidate | Passed | 1,021 unchanged; zero drifted, new, or removed. |
| npm run counts | Product records | Passed | 158 ranked rows and 163 detail blocks agree. |
| npm run sizes | Repository claims | Passed | Seven claims agree. |
| npm run palette | Visual tokens | Passed | 88 pairs measured with zero new failures. |
| npm run publication | Complete history | Passed | 2,429 blobs scanned with zero findings. |
| npm run contract | Live metadata API | Passed | 33 of 33 assumptions hold. |
| npm run browser | Installed Edge | Passed | 119 assertions across 14 scenarios. |
| npm run upgrade | v1.2.0 to 1.3.0 | Passed with residual defect | 12 assertions preserve one exact read marker; RV-001 qualifies offline behavior in partial clones. |
| npm run upgrade:prove | Five disposable mutations | Passed | Five of five aimed mutations caught. |
| npm run pack | Windows package | Passed | Archive created. |
| Static release checks | README, versions, links, and dashes | Passed | 118 lines, all owners 1.3.0, links resolve, zero dash additions, and no release or tag. |

## Outcome

* Outcome: Defects found
* Outcome rationale: The child closes the three parent defects on the tested full-history tree, but
  one Medium portability defect contradicts the explicit offline guarantee for partial clones.

## Closeout Routing Record

| Finding class | Destination | Owner or next action |
|---------------|-------------|----------------------|
| Implementation defect | rpi-implement | Resolve RV-001 by disabling lazy Git fetches. |
| Decision gap or invalid assumption | none | No user decision is required. |
| Material evidence gap | none | The finding and correction boundary are established. |
| Non-blocking residual work | Distinct publication follow-up | Repository owner after the fix, merge, and explicit confirmation. |

* Execution status: Complete
* Outcome: Defects found
* Validation coverage: Complete child matrix assessed with one qualified partial-clone boundary.
* Blockers: Publication is blocked on RV-001.
