<!-- markdownlint-disable-file -->
# Implementation Plan: Major release proof corrections

## Task Metadata

* Task ID: MRT-002-F01
* Task slug: major-release-proof-corrections
* Parent task: MRT-002 major-release-docs
* Plan date: 2026-08-21
* Research: .copilot-tracking/research/2026-08-21/major-release-proof-corrections-research.md

## Executive Summary

Correct all three findings from the completed parent Review in one bounded pass. The upgrade runner
will materialize v1.2.0 from local Git objects instead of relabeling current source, mark a real issue
read before the folder swap, verify that marker in storage and painted progress afterward, and prove
the check catches read-state loss. The maintainer guide and semantic tests will then be aligned with
the browser and upgrade runner interfaces. No runtime dependency, product behavior, release copy,
tag, release, or asset upload changes.

## User Decisions and Requirements

* Prepare a trustworthy flagship 1.3.0 release candidate without publishing it.
* Existing progress must remain compatible when readers replace the app folder and keep the same
  browser address.
* Resolve RV-001 through RV-003 together using autonomous good judgment.
* Keep browser tooling outside repository dependencies.
* Do not run a second Review for the completed parent task.

## Sources and Evidence

* Parent Review: .copilot-tracking/reviews/logs/2026-08-21/major-release-docs-review.md
* Child research: .copilot-tracking/research/2026-08-21/major-release-proof-corrections-research.md
* Current runner: scripts/upgrade-check.mjs
* Browser runner interface: scripts/browser-check.mjs
* Canonical guide: docs/MAINTAINING.md
* Semantic documentation tests: test/governance-docs.test.js

## Goals

* Make the old disposable install byte-exact to the local v1.2.0 Git object.
* Exercise and preserve one nonzero issue-read marker across the same-origin folder swap.
* Make proof mode catch a new build that discards read state.
* Make every browser and upgrade instruction match actual supported variables, options, ports,
  fixtures, and CI behavior.
* Pin the corrected contracts with focused red-green tests.

## Scope and Non-Goals

### In scope

* scripts/upgrade-check.mjs
* docs/MAINTAINING.md
* test/governance-docs.test.js
* One new test file for historical materialization and upgrade-runner semantic ownership
* Directly affected anchors, backlog or changelog records only if repository gates require them
* Child RPI artifacts

### Non-goals

* Runtime application or storage-schema changes
* New dependencies
* Browser-runner feature additions
* CI browser execution
* Product release-copy changes
* Tag, release, or asset publication
* A second Review of MRT-002

## Functional Requirements

* FR-01: The old disposable install is reconstructed from local v1.2.0 Git objects and includes the
  historical server plus complete historical `src` tree.
* FR-02: Missing Git, missing v1.2.0, incomplete tree listing, or unreadable historical objects fail
  loudly as prerequisites; no current-source fallback is allowed.
* FR-03: The new disposable install remains a copy of the current working candidate.
* FR-04: The old build imports House of M, marks one known issue read through the current-issue UI,
  and proves the read map contains exactly one marker belonging to that order.
* FR-05: The new build preserves order identity, issue order, read-marker identity, and a visible
  nonzero progress phrase.
* FR-06: Proof mode includes a focused mutation that discards read state in the disposable new copy
  and turns the named painted-progress assertion red.
* FR-07: The guide uses MRT_PUPPETEER, MRT_EDGE, and `--only=<scenario-name>` only where supported.
* FR-08: The guide states that browser checks use an ephemeral port, are manual rather than CI, and
  that upgrade validation materializes v1.2.0 from local Git history.
* FR-09: Unsupported single-scenario upgrade instructions are removed because the runner has no such
  interface.

## Non-Functional Requirements

* NFR-01: Runtime dependencies remain zero and no dev dependency is added.
* NFR-02: Historical bytes are preserved without network access.
* NFR-03: Temporary files remain under the system temporary directory and are cleaned on every exit.
* NFR-04: Source errors are explicit; no silent fallback or broad catch may turn missing history into
  a passing check.
* NFR-05: Added prose contains no em dash or en dash.
* NFR-06: Existing exact-origin and external browser-driver contracts remain unchanged.

## Acceptance Criteria

* AC-01: A focused materialization test is observed failing before implementation and passing after.
* AC-02: Focused semantic tests are observed failing for the current zero-progress and mismatched-guide
  state and passing after correction.
* AC-03: `npm run upgrade` reports the actual old and new versions and passes only after preserving
  one nonzero read marker.
* AC-04: `npm run upgrade:prove` catches the existing four mutations plus the read-state-loss
  mutation, then the normal runner still passes.
* AC-05: Documentation tests reject the retired variables, unsupported selector, false CI claim,
  false fixed-port claim, and false fixture description.
* AC-06: All seven deterministic repository gates pass, followed by live contract, browser, upgrade,
  upgrade proof, and packaging checks.
* AC-07: Anchors close at zero drifted, new, and removed after any required re-aim and inspected bless.
* AC-08: No tag or GitHub release exists as a side effect.

## Locked Candidate Boundary

* Exact source targets: scripts/upgrade-check.mjs, docs/MAINTAINING.md,
  test/governance-docs.test.js, and test/upgrade-check.test.js.
* Maximum additions: one product test file. Child tracking artifacts are workflow evidence.
* Exact removals: none.
* Generated targets: docs/anchors.lock.json only if current-document citations move.
* Semantic coverage: historical materialization behavior, nonzero read-state ownership, supported
  runner interfaces, and truthful CI and port claims.
* Regression coverage: all existing upgrade mutations and repository gates remain green.

## Phase Checklist

<!-- rpi:phase id=P01 -->
### [x] P01: Establish failing correction contracts

<!-- rpi:task id=P01-T01 -->
#### [x] P01-T01: Add focused historical and progress ownership tests

* First make the current-source install helper import-safe with a direct-execution guard and export,
  without changing its behavior, then require the unchanged existing suite to remain green.
* Add one test file that exercises that still-current-source materializer through a disposable Git
  fixture and owns the runner's historical-source, nonzero-progress, and read-loss-mutation semantics.
* Observe the smallest focused run fail because committed historical bytes are not yet materialized.

<!-- rpi:task id=P01-T02 -->
#### [x] P01-T02: Strengthen maintainer-guide semantic tests

* Extend the existing governance documentation suite to derive supported browser variables and
  options from runner source and reject unsupported upgrade selection and false CI or port claims.
* Observe the focused documentation test fail against the current guide.

<!-- rpi:phase id=P02 -->
### [x] P02: Correct the runner and guide

<!-- rpi:task id=P02-T01 -->
#### [x] P02-T01: Materialize v1.2.0 and preserve nonzero progress

* Reconstruct the old disposable install from local v1.2.0 Git objects.
* Mark one imported issue read through the historical UI.
* Compare read-map identity and visible nonzero progress before and after the swap.
* Add the focused read-state-loss proof mutation.

<!-- rpi:task id=P02-T02 -->
#### [x] P02-T02: Align canonical maintainer instructions

* Correct variables, selector syntax, port behavior, fixture description, CI scope, and unsupported
  upgrade scenario guidance.
* Keep the release procedure and external dependency boundary unchanged.

<!-- rpi:phase id=P03 -->
### [x] P03: Validate the corrected release proof

<!-- rpi:task id=P03-T01 -->
#### [x] P03-T01: Run focused red-green proof

* Run the new historical/progress tests and strengthened guide tests.
* Run the normal and proof upgrade paths.

<!-- rpi:task id=P03-T02 -->
#### [x] P03-T02: Run the complete release matrix

* Run all deterministic gates, live contract, full browser suite, upgrade and proof suites, Windows
  packaging, link checks, version checks, README-size check, and file-based dash scan.
* Reconcile child changes evidence without publishing.

## Dependencies

* Local Git history contains the v1.2.0 tag and its objects.
* External Puppeteer scratch install and installed Edge remain available for manual checks.
* P01 completes before P02 so each new check is observed red.
* P02 completes before P03.

## Critique Disposition

* Exactly one final-candidate critique completed with verdict Revise and one Medium finding.
* PC-001 is resolved directly: P01-T01 now permits and sequences a behavior-preserving import-safe
  seam, a green unchanged baseline, and then the behavioral red proof before P02 changes
  materialization behavior.
* No user decision or second critique is required.

## Follow-Up Items

* Publishing the tag, GitHub release, and Windows archive remains a distinct parent follow-up after
  these corrections land and explicit confirmation is given.

## Handoff

* Planning status: Implementation complete and ready for the child task's single Review.
* Implementation changes path:
  .copilot-tracking/changes/2026-08-21/major-release-proof-corrections-changes.md
* Blockers: None.
