<!-- markdownlint-disable-file -->
# RPI Changes: Major release documentation

## Metadata

* Task ID: MRT-002
* Related plan: .copilot-tracking/plans/2026-08-21/major-release-docs-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md
* Implementation date: 2026-08-21

## Execution Status

* Status: Complete
* Declared invocation scope: full plan
* Completed scope markers: P01 through P03 and P01-T01 through P03-T03
* All remaining active-plan markers: None
* Status basis: Documentation, release metadata, and the complete release-candidate matrix are
  implemented and validated without publication.

## Execution Summary

The final 46-order tree, historical-anchor prerequisite, and local-only portability correction are
integrated. Implementation begins with the reader operations guide before the maintainer guide and
root landing page establish the final documentation ownership model.

## Completed Work

### Detailed reader operations guide

* Affected plan area or markers: P01-T01.
* Implemented `docs/RUNNING.md` as the canonical reader operations guide.
* Preserved both startup routes, first-run warnings, success indicators, real-browser behavior,
  installed-app behavior, stopping and restarting, the exact origin contract, alternate-port
  consequences, safe upgrades, and all existing troubleshooting cases.
* Routed support and security questions to their existing canonical policies.

### Maintainer operations guide

* Affected plan area or markers: P01-T02.
* Implemented `docs/MAINTAINING.md` as the canonical operational guide for checks, browser and
  upgrade proof modes, workflow pin review, data authoring, generated indexes, and release mechanics.
* Preserved the live API check outside CI, the external browser-driver dependency boundary, stable
  order identifiers, source evidence requirements, and merge-before-tag release safety.

### Concise reader landing page

* Affected plan area or markers: P01-T03 and P01.
* Replaced the 849-line combined handbook with a 118-line reader landing page.
* Retained the product description, screenshot, reader benefits, complete qualified privacy
  disclosure, stable Windows download, exact origin, source startup, safe upgrade sequence,
  disclaimer, and license.
* Routed operations and maintenance detail to the two focused guides.
* The privacy and stable-download semantic contracts pass.

### Canonical routing and product records

* Affected plan area or markers: P02-T01 and P02-T02.
* Updated contribution, support, and governance links so no tracked Markdown document points to a
  removed root fragment.
* Added BL-184 and an Unreleased changelog entry for the focused reader landing page and guides.
* Re-derived the backlog at 158 ranked rows, 163 detail blocks, and 137 Shipped items.
* Re-aimed affected live citations by content search and diff-hunk arithmetic, read all 47 changed
  claim and target pairings, and closed the lock at 1,021 unchanged with zero drifted, new, or
  removed.

### Prepared documentation validation

* Affected plan area or markers: P02-T03 and P02.
* Transferred the exact derived CI command-set contract from the root to the maintainer guide while
  retaining contribution-guide coverage.
* Added both focused guides to relative-link and repository-command validation.
* The transferred assertion was observed failing when `npm run publication` was removed from the new
  canonical command block, then passed after restoration.
* The privacy and stable-download contracts, all seven repository gates, stale-fragment search, and
  added-line dash scan pass. The root remains 118 lines.

### Final release facts

* Affected plan area or markers: P03-T01.
* The integrated catalog contains 46 reading orders, compared with 26 at v1.2.0, for an increase of
  20.
* The release boundary contains 16 detailed changelog entries, including the focused documentation
  change added by this task.
* The current build and v1.2.0 both use stored-data schema 2, so the compatibility contract selects
  a MINOR release.
* The accepted PR 161 merge commit is an ancestor of the current tree.
* Named release benefits: Recap Page identity, 20 new event guides, redesigned catalog and landing
  experience, clearer reading orientation, progress summaries, search-led issue addition, grouped
  settings, and system-wide interaction polish.

### Ready-to-paste GitHub release copy

# Recap Page 1.3.0: A clearer way through Marvel continuity

* **Meet Recap Page.** A confident new identity and visual system make the whole experience feel
  focused, cohesive, and unmistakably its own.
* **Explore 20 new Marvel event guides.** The catalog now spans 46 curated reading orders, with new
  journeys across modern cosmic, mutant, Avengers, and crossover continuity.
* **Find your next read faster.** A redesigned landing experience gives the catalog more room,
  highlights strong starting points, and makes every route easier to scan.
* **Stay in the story.** The reading screen now keeps your place, progress, current issue, next issue,
  and part context clear while using the full space available.
* **See momentum at a glance.** Library and progress views lead with useful summaries before the
  issue rows, so unfinished stories and next steps surface immediately.
* **Add and adjust with less friction.** Search leads issue entry, settings are grouped by purpose,
  controls are easier to hit, and dialogs return focus where it belongs.
* **Upgrade without losing your place.** Saved progress remains compatible with the previous release.
  Keep using the same browser address and export a backup whenever you want an extra safety copy.

[Read the full changelog](https://github.com/raymond-nassar/recap-page/blob/main/CHANGELOG.md).

### Release metadata synchronization

* Affected plan area or markers: P03-T02.
* Created the 1.3.0 changelog boundary while leaving Unreleased available for later work.
* Wrote one headline and seven benefit-led bullets with compatible-upgrade wording and a full
  changelog link.
* Synchronized package metadata, lock metadata, and the browser version constant to 1.3.0 through
  the repository version lifecycle.
* No tag, GitHub release, or asset upload was created.

### Release-check current-state correction

* Affected plan area or markers: P03-T03.
* Classification: immediately relevant current-state update preserving the approved validation
  boundary.
* The upgrade runner still looked for progress on a catalog card that the redesign intentionally
  removed. It reported eight passing assertions and two paint failures even though storage and the
  saved order were intact.
* The runner now opens the saved reading order before and after the folder swap and checks the
  visible semantic progress phrase derived from the stored issue count.
* The normal upgrade run passes all 10 assertions. Proof mode catches all four targeted mutations,
  including renamed storage, an origin change, and a build that did not actually reload.

### Final release-candidate validation

* Affected plan area or markers: P03-T03 and P03.
* All seven deterministic repository gates pass on the synchronized candidate.
* The live metadata contract passes 33 of 33 assumptions after one transient timeout was retried.
* The installed-Edge browser suite passes 119 assertions across 14 scenarios.
* The corrected upgrade suite passes all 10 assertions, and Windows packaging produces the expected
  archive.
* Documentation contracts pass 15 focused assertions, README.md remains 118 lines, all three version
  owners report 1.3.0, and the added-line dash scan reports zero.
* No local tag, GitHub release, or asset upload was created.

## Implementation-Time Plan and Detail Updates

### Integrated dependency reconciliation

* Affected plan area or markers: Dependencies and P01 through P03.
* What changed: Both implementation dependencies are satisfied and the full plan is complete.
* Why: PR 161 and the historical-anchor support commits are integrated and validated.
* Triggering evidence: 46 current catalog orders, 16 release entries, 1,021 canonical anchors,
  and 15 validated local-only citations excluded from the portable lock.
* User answer or decision: The user directed implementation to continue autonomously.
* Reconciliation performed: Plan readiness, phase status, state, dependencies, final facts, and
  backlog identity collision were reconciled.
* Planning and critique state: Ready; the single critique remains complete with PC-001 through
  PC-005 resolved.

## Validation Record

| Check | Scope | Status | Evidence or reason |
|-------|-------|--------|--------------------|
| npm run lint | Release candidate | Passed | Zero lint problems |
| npm test | Release candidate | Passed | Zero failures |
| npm run anchors | Release candidate | Passed | 1,021 unchanged; zero drifted, new, or removed |
| npm run counts | Release candidate | Passed | 158 ranked rows and 163 detail blocks agree |
| npm run sizes | Release candidate | Passed | Seven claims agree |
| npm run palette | Release candidate | Passed | 88 pairs measured, zero new failures |
| npm run publication | Release candidate history | Passed | Zero content findings |
| npm run contract | Live metadata API | Passed | 33 of 33 assumptions hold |
| npm run browser | Installed Edge | Passed | 119 assertions across 14 scenarios |
| npm run upgrade | Folder-swap upgrade | Passed | 10 assertions |
| npm run pack | Windows package | Passed | Archive created successfully |
| Documentation contracts | Reader and maintainer docs | Passed | 15 assertions |
| Final static checks | README, versions, links, and dashes | Passed | 118 lines, 1.3.0 in all owners, links resolve, zero dash additions |

## Pre-Review Reconciliation

* Plan markers and phase details: P01 through P03 and every task are complete.
* Completed-work evidence and handoff prose: The full plan is complete and validated.
* Validation, blockers, remaining work, and follow-up items: Current.
* Review readiness: Ready for the single post-implementation Review.

## Blockers

* None.

## Remaining Work

* None inside the approved implementation scope.

## Follow-Up Items

* Canonical plan list: .copilot-tracking/plans/2026-08-21/major-release-docs-plan.md, `## Follow-Up Items`
* Publishing the GitHub release, tag, and Windows archive remains outside implementation and requires
  separate confirmation after the release commit reaches main.

## Return-to-Caller State

* Implementation execution status: Complete
* Declared scope and markers: Full plan; P01 through P03 complete.
* Validation coverage: Complete release-candidate matrix passed.
* Blockers: None.
* Current plan and detail updates: All phase and task markers are complete.
* Planning and critique state: Ready; one critique complete and resolved.
* Follow-up items: External publication only.
* Review readiness or no-handoff reason: Ready for the single post-implementation Review.
* Continuation owner: RPI Agent.
