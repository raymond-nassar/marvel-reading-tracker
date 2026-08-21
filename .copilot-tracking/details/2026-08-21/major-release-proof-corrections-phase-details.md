<!-- markdownlint-disable-file -->
# Phase Details: Major release proof corrections

## Metadata

* Task ID: MRT-002-F01
* Plan: .copilot-tracking/plans/2026-08-21/major-release-proof-corrections-plan.md
* Research: .copilot-tracking/research/2026-08-21/major-release-proof-corrections-research.md

## Initial Planning State

* Interpreted planning goal: Resolve RV-001 through RV-003 together without widening runtime or
  publication scope.
* Evidence readiness: Ready. The completed Review and reused child research name the exact defects,
  source targets, runner interfaces, and smallest useful actions.
* Active boundaries: One runner, one guide, one existing test file, and at most one new test file.
* Unresolved decisions or blockers: None.

## Phase Overview

| Phase | Goal | Status | Markers |
|-------|------|--------|---------|
| P01 | Establish failing correction contracts | Complete | P01, P01-T01, P01-T02 |
| P02 | Correct the runner and guide | Complete | P02, P02-T01, P02-T02 |
| P03 | Validate the corrected release proof | Complete | P03, P03-T01, P03-T02 |

<!-- rpi:phase id=P01 -->
## P01: Establish failing correction contracts

### Context

The existing release matrix is green because its assertions do not own the historical-source or
nonzero-read boundaries, and the documentation test recognizes script names without checking runner
arguments or environment variables.

### Boundaries

* Included: test/upgrade-check.test.js, test/governance-docs.test.js, and only the
  behavior-preserving import-safe seam in scripts/upgrade-check.mjs.
* Excluded: historical materialization, read-progress behavior, proof mutation, and guide
  corrections until the new checks are observed failing.

### Validation Expectations

* Use a disposable Git repository for materialization tests.
* Keep browser-dependent checks outside the bare Node test suite.
* Assert behavior and semantic ownership rather than exact formatting.
* Run the unchanged existing suite green after the import-safe refactor.
* Prove the focused tests fail before source correction.

<!-- rpi:task id=P01-T01 -->
### P01-T01: Add focused historical and progress ownership tests

* First add a direct-execution guard and export the existing current-source materializer without
  changing what it copies.
* Run the unchanged existing suite and require it to stay green.
* The fixture must distinguish committed historical bytes from newer working-tree bytes.
* Add the behavioral fixture assertion only after the import-safe seam exists, then observe it fail
  while that seam still materializes current source.
* Semantic source ownership must require a historical old install, a UI read toggle, stored read-map
  comparison, nonzero painted progress, and a read-state-loss mutation.

<!-- rpi:task id=P01-T02 -->
### P01-T02: Strengthen maintainer-guide semantic tests

* Derive browser variable and selector names from scripts/browser-check.mjs.
* Assert the guide does not name unsupported browser or upgrade options.
* Assert the guide says browser checks are manual and use an ephemeral port.
* Assert the upgrade section describes local tagged Git history rather than committed snapshots.

<!-- rpi:phase id=P02 -->
## P02: Correct the runner and guide

### Context

The tag resolves locally, the old and current reading screens share the read-toggle control contract,
and the current runner already owns disposable install cleanup and proof mutation reporting.

### Boundaries

* Included: scripts/upgrade-check.mjs and docs/MAINTAINING.md.
* Excluded: runtime application modules except disposable mutation text written under the temporary
  new install.

### Validation Expectations

* Historical materialization fails with prerequisite exit semantics when history is unavailable.
* The old install reports 1.2.0 from historical source; the new install reports 1.3.0 from current
  source.
* One specific issue ID is present in the read map before and after.
* Both builds paint `1 of 8 read`.
* The new read-state-loss mutation fails its named assertion and normal cleanup restores green.

<!-- rpi:task id=P02-T01 -->
### P02-T01: Materialize v1.2.0 and preserve nonzero progress

* Enumerate `server.mjs` and `src` from `v1.2.0` with null-delimited Git output.
* Reject empty, missing, absolute, or traversal paths before writing under the disposable directory.
* Read blobs as bytes so binary assets remain byte-exact.
* Copy the current candidate separately for the new install.
* Use the current-issue Done control and wait for the read map to contain exactly one issue from the
  imported order.
* Extend state summaries with sorted read IDs and compare them across the swap.

<!-- rpi:task id=P02-T02 -->
### P02-T02: Align canonical maintainer instructions

* Replace MRT_PUPPETEER_CORE with MRT_PUPPETEER and MRT_BROWSER_EXE with MRT_EDGE.
* Replace browser `--scenario` with `--only=<scenario-name>`.
* Remove the unsupported single-scenario upgrade command.
* Describe ephemeral-port isolation, manual browser coverage, and local v1.2.0 Git materialization.

<!-- rpi:phase id=P03 -->
## P03: Validate the corrected release proof

### Context

The child task closes release-blocking review findings. Validation must demonstrate both the new
checks' sensitivity and the unchanged broader release candidate.

### Boundaries

* Included: focused tests, upgrade normal and proof modes, complete parent release matrix, directly
  affected anchors, and child evidence.
* Excluded: publication.

### Validation Expectations

* Focused Node tests pass after their recorded red proof.
* Normal upgrade reports 1.2.0 to 1.3.0 and nonzero progress.
* Proof mode catches five mutations.
* Full browser validation remains 119 assertions across 14 scenarios unless the unchanged runner
  reports a different current total.
* Every repository gate exits zero.
* The added-line dash scan reports zero.

<!-- rpi:task id=P03-T01 -->
### P03-T01: Run focused red-green proof

* Record failing assertion names before implementation and passing totals after implementation.
* Keep temporary repositories and installs outside the source tree.

<!-- rpi:task id=P03-T02 -->
### P03-T02: Run the complete release matrix

* Run lint, tests, anchors, counts, sizes, palette, publication, contract, browser, upgrade,
  upgrade proof, and packaging.
* Confirm README remains at most 250 lines, links resolve, versions agree, and no release or tag was
  created.
