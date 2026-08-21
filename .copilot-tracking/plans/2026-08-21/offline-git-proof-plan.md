<!-- markdownlint-disable-file -->
# Implementation Plan: Offline Git proof

## Task Metadata

* Task ID: MRT-002-F02
* Task slug: offline-git-proof
* Parent task: MRT-002-F01 major-release-proof-corrections
* Research: .copilot-tracking/research/2026-08-21/offline-git-proof-research.md

## Executive Summary

Close the final release blocker by preventing every historical Git subprocess from lazily fetching
missing objects in a partial clone. Add one focused red assertion, apply one shared subprocess
environment, and rerun the upgrade proof and repository gates. No behavior, documentation,
dependency, release-copy, or publication change.

## User Decisions and Requirements

* Continue autonomously and clear the remaining release blocker.
* Preserve the local, offline v1.2.0 materialization contract.
* Do not publish.

## Goals

* Set `GIT_NO_LAZY_FETCH=1` on every historical Git subprocess.
* Pin that contract with red-green evidence.
* Preserve all existing historical, progress, and mutation behavior.

## Scope and Non-Goals

* In scope: scripts/upgrade-check.mjs and test/upgrade-check.test.js.
* Non-goals: Runtime code, guide prose, dependencies, release copy, tags, releases, and assets.

## Functional Requirements

* FR-01: `rev-parse`, `ls-tree`, and every `show` call share an environment with
  `GIT_NO_LAZY_FETCH=1`.
* FR-02: No historical Git call uses the inherited environment without the guard.
* FR-03: Missing local objects fail through existing prerequisite handling.

## Non-Functional Requirements

* NFR-01: No new dependency or file.
* NFR-02: The correction remains cross-platform under supported Git and Node versions.
* NFR-03: Added lines contain no em dash or en dash.

## Acceptance Criteria

* AC-01: A focused assertion is observed failing before source correction and passing afterward.
* AC-02: Focused tests, lint, full tests, anchors, normal upgrade, and five-mutation proof pass.
* AC-03: No tag or release exists as a side effect.

## Locked Candidate Boundary

* Exact targets: scripts/upgrade-check.mjs and test/upgrade-check.test.js.
* Maximum additions: none.
* Exact removals: none.
* Generated targets: none unless anchor drift requires docs/anchors.lock.json.
* Semantic coverage: all historical Git subprocesses receive the no-lazy-fetch environment.
* Regression coverage: historical bytes, nonzero progress, and five mutation aims stay green.

## Phase Checklist

<!-- rpi:phase id=P01 -->
### [x] P01: Enforce offline historical Git access

<!-- rpi:task id=P01-T01 -->
#### [x] P01-T01: Add and observe the focused red assertion

* Require a shared `GIT_NO_LAZY_FETCH=1` environment on historical Git calls.

<!-- rpi:task id=P01-T02 -->
#### [x] P01-T02: Apply the guard and validate

* Use one shared environment for `rev-parse`, `ls-tree`, and `show`.
* Run focused tests, lint, full tests, anchors, upgrade, and upgrade proof.

## Dependencies

* The accepted historical materializer and tests from MRT-002-F01.

## Critique Disposition

* Exactly one final-candidate critique completed with a Pass verdict and no findings.
* Critique: .copilot-tracking/reviews/plans/2026-08-21/offline-git-proof-plan-critique.md

## Follow-Up Items

* Publication remains a distinct externally visible parent follow-up.

## Handoff

* Planning status: Implemented and ready for Review.
* Changes path: .copilot-tracking/changes/2026-08-21/offline-git-proof-changes.md
* Blockers: None.
