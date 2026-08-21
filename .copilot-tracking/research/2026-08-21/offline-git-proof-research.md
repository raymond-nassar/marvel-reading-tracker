<!-- markdownlint-disable-file -->
# Task Research: offline-git-proof

## Metadata

* Task ID: MRT-002-F02
* Date: 2026-08-21
* Status: Complete
* Parent task: MRT-002-F01 major-release-proof-corrections
* Artifact path: .copilot-tracking/research/2026-08-21/offline-git-proof-research.md

## Research Brief

* Topic: Prevent partial clones from lazily fetching missing historical release objects.
* Purpose: Close RV-001 without changing the accepted historical upgrade design.
* Scope: Historical Git subprocess environment and its focused test.
* Non-goals: Runner behavior beyond object acquisition, documentation restructuring, runtime code,
  dependencies, or publication.
* Output mode: convergence.
* Research posture: focused, with supplied defect evidence.

## Extension Registry

* Repository instructions: selected for red-first proof and release boundaries.
* hve-core:rpi-research: selected as the active phase contract.
* Specialist: skipped because one exact environment contract resolves the supplied defect.

## Questions and Evidence

| ID | Question or finding | Evidence |
|----|---------------------|----------|
| C1 | Historical `rev-parse`, `ls-tree`, and `show` calls inherit the process environment. | scripts/upgrade-check.mjs:123-149 |
| C2 | The child Review identifies Git lazy fetching in partial clones as a publication blocker. | .copilot-tracking/reviews/logs/2026-08-21/major-release-proof-corrections-review.md:89-96 |
| C3 | The existing focused test imports the materializer and can pin subprocess configuration without Edge. | test/upgrade-check.test.js:1-50 |

## Prior Knowledge Gate and Disposition

* Research disposition: reused.
* No three-wave cycle executed because the completed Review already established the cause,
  consequence, destination, and smallest correction.
* Selected recommendation: Create one shared historical Git environment containing
  `GIT_NO_LAZY_FETCH=1`, use it for every historical subprocess, and add a focused semantic assertion
  that fails before the change.
* Alternative rejected: Rely on full-clone release practice. The guide explicitly promises local,
  offline object use and the check should enforce that promise.
* Planning Readiness: Ready.
* Blockers: None.

## Self-Check

* Scope, non-goals, evidence, alternative, selected approach, disposition, and readiness are recorded.
* No source file was edited during Research.
