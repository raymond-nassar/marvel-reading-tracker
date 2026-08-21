<!-- markdownlint-disable-file -->
# Changes Record: Offline Git proof

## Metadata

* Task ID: MRT-002-F02
* Plan: .copilot-tracking/plans/2026-08-21/offline-git-proof-plan.md
* Scope: Full plan
* Status: Complete and reviewed

## P01-T01: Offline subprocess contract

* Added one semantic assertion covering the shared environment value and all three historical Git
  command shapes.
* Red evidence: focused result 1 passed and 1 failed before changing the runner.
* Green evidence: focused result 2 passed and 0 failed after the correction.

## P01-T02: Shared Git environment and validation

* Added one immutable historical Git environment with `GIT_NO_LAZY_FETCH=1`.
* Applied it to `rev-parse`, `ls-tree`, and every `show` call.
* Re-aimed four live backlog citations after the source moved and inspected every changed bless
  pairing.

## Decisions and Divergences

* No divergence.

## Validation

* Focused: 2 passed, 0 failed.
* Lint: 0 problems.
* Full tests: 1,303 passed, 0 failed.
* Counts: 158 ranked rows, 163 detail blocks, every figure agrees.
* Upgrade: 12 assertions passed, 0 failed.
* Upgrade proof: 5 of 5 mutations caught their intended assertion.
* Browser: 119 assertions passed across 14 scenarios.
* Live contract: 33 of 33 assumptions hold.
* Publication gate: 0 content findings.
* Package: 35,417,056-byte Windows zip built from the checksum-verified runtime.
* Anchors: 1,021 unchanged, 0 drifted, 0 new, 0 removed.
* Added-line dash scan: 0 em dash or en dash additions.

## Blockers and Remaining Work

* Blockers: None.
* Remaining: None inside this task. Publication remains distinct.
