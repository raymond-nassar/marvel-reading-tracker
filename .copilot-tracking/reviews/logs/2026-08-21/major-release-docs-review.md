<!-- markdownlint-disable-file -->
# Review: Major release documentation

## Scope and Evidence

* Task ID: MRT-002
* Review date: 2026-08-21
* Review scope: Full task, P01 through P03 and P01-T01 through P03-T03
* Assessed boundary: User requirements, approved documentation ownership, release compatibility,
  critique dispositions, implementation updates, validation evidence, and publication exclusion.
* Plan: .copilot-tracking/plans/2026-08-21/major-release-docs-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-21/major-release-docs-plan-critique.md
* Changes: .copilot-tracking/changes/2026-08-21/major-release-docs-changes.md
* Other evidence considered: .copilot-tracking/research/2026-08-21/major-release-docs-research.md,
  the complete branch diff against origin/main, repository validation output, and one bounded
  read-only code-review lens.

## Opening Review State

* Interpreted review goal: Determine once whether the complete prepared 1.3.0 release candidate
  satisfies the approved reader documentation, compatibility, release-note, and validation
  contracts without publication.
* Review scope: Full task.
* Evidence readiness: Research, plan, phase details, one final-candidate critique, changes record,
  complete plan markers, validation evidence, and the full branch diff are available.
* Acceptance basis: User direction, plan acceptance criteria, PC-001 through PC-005 dispositions,
  repository release rules, and the documented release-candidate matrix.
* First comparison boundary: Reconcile P01 through P03 against completed work, then assess the
  upgrade proof and canonical operating instructions against their actual runner interfaces.
* Active read-only boundaries: Review may write only this canonical review record. Findings route
  later work and do not trigger another Review.
* Initial blockers: None.

## Execution Status

* Execution status: Complete
* Review execution evidence: The full task artifact set, complete branch diff, validation record,
  runner interfaces, workflow, and one bounded read-only code-review lens were assessed once on
  2026-08-21.

## Plan-to-Change Reconciliation

| Current plan scope | Descriptive changes-record summary | Current-state reconciliation | Gap or rationale |
|--------------------|------------------------------------|------------------------------|------------------|
| P01 | Reader guide, maintainer guide, and concise root landing page | Reconciled | The root is 118 lines, required reader promises remain, and detailed ownership moved to two focused guides. |
| P02 | Repository routing, product records, anchor maintenance, and documentation contracts | Reconciled | Links resolve, semantic ownership moved to the new guides, records agree, and anchors close cleanly. |
| P03-T01 and P03-T02 | Final facts, release copy, and 1.3.0 metadata | Reconciled | Catalog, changelog, schema, release prose, and all three version owners agree. |
| P03-T03 | Release-candidate validation and upgrade-check correction | Partial | Commands pass, but the upgrade runner does not exercise the historical build or nonzero read progress claimed by the release contract. |
| Follow-Up Items | Publish the tag, release, and Windows archive later | Reconciled as distinct follow-up | Publication remains outside active scope and now also waits on RV-001 through RV-003. |

## Completed Work Assessment

| Related marker | Files | What changed and why | Completion evidence | Validation | Assessment |
|----------------|-------|----------------------|---------------------|------------|------------|
| P01 | README.md, docs/RUNNING.md, docs/MAINTAINING.md | Split a combined handbook into a reader landing page and focused operating guides. | Relocation inventory and 118-line root. | Documentation, privacy, link, and command tests pass. | Reconciled except for maintainer-runner mismatches in RV-003. |
| P02 | CONTRIBUTING.md, SUPPORT.md, GOVERNANCE.md, CHANGELOG.md, PRODUCT_BACKLOG.md, test/governance-docs.test.js, docs/anchors.lock.json | Reconnected navigation, records, semantic test ownership, and evidence anchors. | BL-184, 16 release entries, and 1,021 canonical anchors. | Counts, anchors, documentation tests, and stale-fragment checks pass. | Reconciled. |
| P03-T01 and P03-T02 | CHANGELOG.md, package.json, package-lock.json, src/js/lib/version.js | Derived final release facts, wrote the product release copy, and synchronized 1.3.0. | 46 current orders, 26 at v1.2.0, schema 2 on both trees, and seven release bullets. | Version, counts, full test, and static checks pass. | Reconciled. |
| P03-T03 | scripts/upgrade-check.mjs and release validation evidence | Adapted upgrade paint checks to the redesigned reading surface and ran the release matrix. | Ten reported upgrade assertions and four proof mutations. | All recorded commands pass. | Gap: RV-001 and RV-002 show the passing assertions do not prove the advertised compatibility boundary. |

## Implementation-Time Plan and Detail Update Assessment

| Affected area or marker | What changed and why | Triggering evidence and user decision | Reconciliation performed | Planning and critique state | Assessment |
|-------------------------|----------------------|---------------------------------------|--------------------------|-----------------------------|------------|
| Dependencies and P01 through P03 | Integrated the final reading-order batch and historical-anchor prerequisite before documentation movement. | User waited for the dependent work; PR 161 and the provenance commits supplied the final tree. | Plan, details, changes, state, facts, and backlog identities were updated. | PC-001 and PC-005 resolved before affected work resumed. | Reconciled. |
| P03-T03 | Changed upgrade paint assertions from removed catalog-card progress to the reading screen. | The original release run passed eight assertions and failed two stale paint assertions. | The current plan, details, changes record, and validation evidence describe the correction. | Approved validation intent preserved; no new critique needed. | The local correction was justified, but deeper proof gaps remain as RV-001 and RV-002. |

## Critique and Material Revision Assessment

* Latest critique dispositions: PC-001 through PC-005 each have a recorded disposition. The
  historical-anchor mechanism, semantic test owners, relocation inventory, router ownership, and
  dependent-session proof all appear in the implemented artifacts.
* Material revisions: The user-approved historical-anchor prerequisite was integrated before
  documentation movement. The upgrade paint correction preserved the approved validation intent
  and was reconciled as an immediately relevant current-state update.
* Dependent-work pause assessment: P03 began only after PR 161 and the historical-anchor prerequisite
  were integrated.
* Justification assessment: Supported for the implemented changes. No unresolved critique decision
  remains.

## Plan Follow-Up Assessment

| Follow-up item | Why outside immediate scope | Owner or next action | Assessment and route |
|----------------|-----------------------------|----------------------|----------------------|
| Publish the GitHub release, tag, and Windows archive | It is externally visible and explicitly excluded from implementation. | Repository owner after the release commit reaches main and RV-001 through RV-003 are resolved. | Open distinct follow-up; not an implementation defect by itself. |

Unresolved plan follow-up items remain distinct follow-up work. They are not active plan scope.

## Findings

<!-- rpi:review id=RV-001 -->
### RV-001 [High]: The upgrade check labels current source as the old release

* Related scope: P03-T03
* Evidence: scripts/upgrade-check.mjs copies the current repository source into both disposable
  installs and changes only the displayed version constant. docs/MAINTAINING.md instead claims that
  committed release snapshots migrate to the current schema.
* Impact: A current build that cannot read data written by v1.2.0 can still pass, so the accepted
  release matrix does not prove backward compatibility across the claimed release boundary.
* Destination: rpi-implement
* Smallest useful next action: Build the old side from a byte-exact v1.2.0 source or fixture while
  keeping the new side on the candidate, then prove the focused check fails without that boundary.

<!-- rpi:review id=RV-002 -->
### RV-002 [High]: The upgrade check preserves an unread order, not reading progress

* Related scope: P03-T03
* Evidence: scripts/upgrade-check.mjs imports House of M, expects `0 of 8 read` before and after the
  swap, and records no issue as read. Its proof mutations do not strip read state.
* Impact: An upgrade that keeps the order but loses every read marker would pass even though the
  release copy promises readers that saved progress remains compatible.
* Destination: rpi-implement
* Smallest useful next action: Mark at least one issue read before the swap, verify its stored
  identity and nonzero painted progress afterward, and add a focused mutation that removes read
  state.

<!-- rpi:review id=RV-003 -->
### RV-003 [Medium]: Canonical maintainer commands do not match the runners

* Related scope: P01-T02 and P02-T03
* Evidence: docs/MAINTAINING.md names MRT_PUPPETEER_CORE, MRT_BROWSER_EXE, and `--scenario`; the
  browser runner accepts MRT_PUPPETEER, MRT_EDGE, and `--only=`, while the upgrade runner accepts
  only `--prove`. The guide also states that pull requests run browser journeys, that the browser
  runner uses port 8787, and that upgrade validation uses committed snapshots, none of which matches
  the current workflow or runner.
* Impact: Several copied commands do not configure or select anything, contributors receive a false
  account of CI coverage, and release maintainers can trust an upgrade proof the runner does not
  perform.
* Destination: rpi-implement
* Smallest useful next action: Align the guide with the actual interfaces and extend semantic
  documentation tests to reject unsupported environment names, flags, CI claims, and fixture claims.

## Defects

* RV-001, RV-002, and RV-003 route to a later rpi-implement invocation.

## Routed Findings

| Finding | Destination | Owner or next action | Reason for route |
|---------|-------------|----------------------|------------------|
| RV-001 | rpi-implement | Establish a real v1.2.0-to-1.3.0 upgrade boundary. | Implementation defect in release validation. |
| RV-002 | rpi-implement | Exercise and mutate nonzero issue-read state. | Implementation defect in release validation. |
| RV-003 | rpi-implement | Correct maintainer guidance and strengthen its semantic tests. | Documentation implementation defect. |

Later implementation of a routed finding does not require another Review.

## Residual Work

* Publishing remains a distinct externally visible follow-up after the routed defects are resolved,
  the release commit reaches main, and the repository owner confirms publication.

## Blockers and Remaining Work

* Blockers: The prepared release candidate should not be published until RV-001 through RV-003 are
  resolved.
* Remaining active work: None inside the completed P01 through P03 implementation. Routed findings
  are later implementation work under this one Review outcome.

## Validation Evidence

| Command | Scope | Status | Summary |
|---------|-------|--------|---------|
| npm run lint | Release candidate | Passed | Zero lint problems. |
| npm test | Release candidate | Passed | Zero failures. |
| npm run anchors | Release candidate | Passed | 1,021 unchanged with zero drifted, new, or removed; 15 ignored local citations validated separately. |
| npm run counts | Release candidate | Passed | 158 ranked rows and 163 detail blocks agree. |
| npm run sizes | Release candidate | Passed | Seven claims agree. |
| npm run palette | Release candidate | Passed | 88 measured pairs with zero new failures. |
| npm run publication | Complete history | Passed | Zero content findings. |
| npm run contract | Live metadata API | Passed | 33 of 33 assumptions hold after one transient timeout retry. |
| npm run browser | Installed Edge | Passed | 119 assertions across 14 scenarios. |
| npm run upgrade | Disposable installs | Passed but insufficient | Ten assertions pass, but RV-001 and RV-002 invalidate the claimed historical-progress boundary. |
| npm run upgrade:prove | Disposable mutations | Passed but insufficient | Four mutations are caught, but none proves historical source compatibility or read-marker preservation. |
| npm run pack | Windows package | Passed | Archive created successfully. |
| Documentation contracts | Reader and maintainer guides | Passed but incomplete | Fifteen assertions pass; RV-003 identifies unsupported commands and claims outside their semantic coverage. |
| Final static checks | README, versions, links, and dash scan | Passed | 118 lines, 1.3.0 in all owners, links resolve, and zero dash additions. |

## Outcome

* Outcome: Defects found
* Outcome rationale: Execution completed and most documentation and release metadata conform, but two
  high-severity gaps mean the upgrade matrix does not prove the compatibility promise, and one
  medium-severity gap makes canonical maintainer guidance materially inaccurate. The candidate is
  not ready for publication.

## Closeout Routing Record

| Finding class | Destination | Owner or next action |
|---------------|-------------|----------------------|
| Implementation defect | rpi-implement | Resolve RV-001 through RV-003 in one later implementation invocation. |
| Decision gap or invalid assumption | none | No new user decision is required. |
| Material evidence gap | none | The evidence is sufficient to define the defects. |
| Non-blocking residual work | Distinct publication follow-up | Repository owner after fixes, merge, and explicit confirmation. |

* Execution status: Complete
* Outcome: Defects found
* Validation coverage: Complete release matrix assessed; passing upgrade and documentation checks are
  explicitly qualified by RV-001 through RV-003.
* Blockers: Publication is blocked on RV-001 through RV-003.
