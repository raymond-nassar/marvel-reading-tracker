<!-- markdownlint-disable-file -->
# Phase Details: Offline Git proof

## Metadata

* Task ID: MRT-002-F02
* Plan: .copilot-tracking/plans/2026-08-21/offline-git-proof-plan.md
* Research: .copilot-tracking/research/2026-08-21/offline-git-proof-research.md

## Initial Planning State

* Goal: Close RV-001 with one test and one shared subprocess environment.
* Evidence readiness: Ready from the completed parent Review.
* Active boundary: scripts/upgrade-check.mjs and test/upgrade-check.test.js only.
* Unresolved decisions or blockers: None.

<!-- rpi:phase id=P01 -->
## P01: Enforce offline historical Git access

### Context

Partial clones can lazily fetch promisor objects when object-reading Git commands inherit the normal
environment. The guide promises local history and no network request.

### Validation Expectations

* Add the semantic assertion first and observe it fail.
* Define one immutable environment from `process.env` plus `GIT_NO_LAZY_FETCH: '1'`.
* Pass it to all three historical command shapes.
* Preserve all existing focused and browser proof results.

### Completion Evidence

* The focused test failed before the source correction and passed 2 of 2 afterward.
* All release-candidate gates passed without a publication side effect.

<!-- rpi:task id=P01-T01 -->
### P01-T01: Add and observe the focused red assertion

* The test must require the guard value and require each historical Git command to use the shared
  environment.

<!-- rpi:task id=P01-T02 -->
### P01-T02: Apply the guard and validate

* No fallback or catch may retry without the guard.
* Run the focused test, lint, full suite, anchors, normal upgrade, and five-mutation proof.
