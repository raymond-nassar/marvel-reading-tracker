<!-- markdownlint-disable-file -->
# RPI Plan Critique: Major release proof corrections

## Metadata

* Task ID: MRT-002-F01
* Critique date: 2026-08-21
* Plan: .copilot-tracking/plans/2026-08-21/major-release-proof-corrections-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/major-release-proof-corrections-phase-details.md
* Critique execution status: Complete

## Inputs and Criterion Boundary

* Task context and caller requirements: Resolve RV-001 through RV-003 together; prove a byte-exact
  local v1.2.0-to-current upgrade with nonzero read progress and a read-loss mutation; align
  maintainer instructions and semantic tests; preserve zero runtime dependencies and no publication;
  keep the exact product targets, add at most one test file, remove no files, and run full release
  validation.
* Research and evidence considered:
  .copilot-tracking/research/2026-08-21/major-release-proof-corrections-research.md,
  .copilot-tracking/reviews/logs/2026-08-21/major-release-docs-review.md,
  scripts/upgrade-check.mjs, scripts/browser-check.mjs, docs/MAINTAINING.md,
  test/governance-docs.test.js, package.json, and .github/workflows/ci.yml.
* Decisions, dependencies, and acceptance criteria considered: The critique assessed FR-01 through
  FR-09, NFR-01 through NFR-06, AC-01 through AC-08, P01 through P03, P01-T01 through P03-T02,
  the local v1.2.0 history dependency, the external browser prerequisites, phase ordering, the
  locked candidate boundary, and the publication exclusion.
* Assessment boundary: This is exactly one final-candidate assessment of the supplied plan and
  phase details against only the supplied requirements and evidence. It can assess whether the
  proposed work and validation are credible, but it does not independently inspect the tag, execute
  the runners, or assess files outside the supplied set.

## Coverage Assessment

| Requirement, research, phase, or task ID | Coverage | Evidence or concern |
|------------------------------------------|----------|---------------------|
| RV-001; FR-01 through FR-03; P02-T01 | Covered | The plan reconstructs server.mjs and the complete src tree from local v1.2.0 Git objects, preserves blob bytes, rejects unsafe paths and unavailable history, and keeps the current candidate separate. |
| RV-002; FR-04 through FR-06; P02-T01 | Covered | The plan marks one issue through the historical UI, compares exact read-map identity, requires nonzero progress on both builds, and adds a read-loss mutation. |
| RV-003; FR-07 through FR-09; P01-T02; P02-T02 | Covered | The supported variables, browser selector, ephemeral port, manual CI boundary, tagged-history description, and unsupported upgrade selector are all assigned to guide correction and semantic tests. |
| NFR-01 through NFR-06; locked candidate boundary | Covered | Product targets are exact, no dependency manifest or runtime module is in scope, additions are capped at one test file, removals are excluded, and publication is excluded. |
| AC-01; P01-T01 | Partial | The intended disposable-repository test needs an import-safe materialization seam, but P01 both directs a runner export or isolation and excludes runner correction until the test has already failed. |
| AC-02 through AC-05; P03-T01 | Covered | The plan requires red-green semantic evidence, actual version and read-state output, five aimed mutations, and rejection of every identified false maintainer claim. |
| AC-06 through AC-08; P03-T02 | Covered | The complete deterministic and release matrix, anchor closeout, static checks, packaging, and no-publication confirmation are explicit. |
| Dependencies and risks | Covered | Local tag availability, shallow-history failure, external browser prerequisites, cleanup, path validation, mutation aim, and phase ordering are recorded. |

## Verdict

* Verdict: Revise
* Rationale: The candidate covers all requested correction and validation outcomes without widening
  product or publication scope. One execution-order conflict prevents its required red proof from
  being reproduced as written. The planner can resolve it without changing the locked targets,
  adding another file, or seeking a product decision.

## Findings

<!-- rpi:critique id=PC-001 -->
### PC-001 [Medium]: The historical test cannot reach its seam before the required red run

* Related IDs: AC-01, P01, P01-T01, P02-T01
* Evidence: The phase details exclude source correction during P01 while P01-T01 directs the work to
  export or isolate the historical materialization seam. The current scripts/upgrade-check.mjs calls
  main unconditionally and exits the process, so a bare Node test cannot import and exercise that
  seam. Running the complete script instead would require the external browser stack, contrary to
  P01's instruction to keep browser-dependent checks outside the Node suite.
* Concern: The plan does not define an executable state in which the disposable Git fixture can call
  the materializer and fail before historical materialization is implemented.
* Impact: Implementation must either violate the red-first boundary, substitute a static source-text
  assertion for the promised behavioral test, or discover and reconcile an unplanned sequencing
  change. Any of those weakens AC-01 as evidence that the byte-exact correction is what made the
  focused check green.
* Smallest useful change: Amend P01-T01 and its boundary to permit a behavior-preserving,
  import-safe extraction or main-module guard first. Require the unchanged existing suite to stay
  green after that refactor, then add the disposable-repository assertions and record them failing
  against the still-current-source materializer before implementing the historical behavior in
  P02-T01.
* Action owner: Planning parent
* Exact resolving evidence: The revised plan and phase details explicitly sequence the import-safe
  refactor before the red run, state that it does not change installation behavior, require a green
  baseline after the refactor, and require the new behavioral test to fail before the v1.2.0
  materialization correction.
* Decision route: Direct planner correction

## Strengths and Residual Risk

* The plan resolves all three routed review findings as one coherent release-proof correction and
  keeps runtime code, schema, browser-runner features, release copy, dependencies, and publication
  outside scope.
* Historical reconstruction is offline and byte-oriented, with explicit unsafe-path and missing-
  history handling rather than a current-source fallback.
* The read-progress contract is checked in storage and on screen across the same-origin folder swap,
  and proof mode is expanded from four to five aimed mutations.
* Maintainer claims are tied to the actual runner and workflow interfaces instead of only to package
  script names.
* Full release validation, anchor reconciliation, added-line dash scanning, packaging, and
  no-publication confirmation are all retained.
* Residual implementation risk remains in mutation aim and Git-object error handling, but the
  planned focused tests, prerequisite semantics, proof run, and complete matrix address it
  adequately once PC-001 is corrected.

## Questions or Blocking Evidence Gaps

* None. The supplied evidence supports a decision, and PC-001 requires no significant or divergent
  user choice.

## Limitations

* The critique used only the caller-supplied artifacts and evidence. It did not inspect historical
  Git objects, execute the browser stack, or validate the reported tag and tool availability.

## Recommended Next Action

* Highest-impact finding: PC-001
* Action owner: Planning parent
* Smallest next action: Revise P01-T01 and the P01 boundary to sequence an import-safe,
  behavior-preserving seam before the behavioral red proof, then finalize the plan without another
  critique.
* User response required: No

## Relevant Artifacts

| Artifact | Description |
|----------|-------------|
| [.copilot-tracking/research/2026-08-21/major-release-proof-corrections-research.md](.copilot-tracking/research/2026-08-21/major-release-proof-corrections-research.md) | Supplied correction research and selected implementation boundary |
| [.copilot-tracking/plans/2026-08-21/major-release-proof-corrections-plan.md](.copilot-tracking/plans/2026-08-21/major-release-proof-corrections-plan.md) | Final-candidate implementation plan assessed |
| [.copilot-tracking/details/2026-08-21/major-release-proof-corrections-phase-details.md](.copilot-tracking/details/2026-08-21/major-release-proof-corrections-phase-details.md) | Phase and task execution details assessed |
| [.copilot-tracking/reviews/logs/2026-08-21/major-release-docs-review.md](.copilot-tracking/reviews/logs/2026-08-21/major-release-docs-review.md) | Source review for RV-001 through RV-003 |
| [scripts/upgrade-check.mjs](scripts/upgrade-check.mjs) | Current upgrade runner and mutation interface |
| [scripts/browser-check.mjs](scripts/browser-check.mjs) | Supported browser variables, selector, port, and CI boundary |
| [docs/MAINTAINING.md](docs/MAINTAINING.md) | Canonical maintainer instructions to align |
| [test/governance-docs.test.js](test/governance-docs.test.js) | Existing semantic documentation checks |
| [package.json](package.json) | Script and dependency boundary |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | Actual deterministic CI coverage |
| [.copilot-tracking/reviews/plans/2026-08-21/major-release-proof-corrections-plan-critique.md](.copilot-tracking/reviews/plans/2026-08-21/major-release-proof-corrections-plan-critique.md) | This complete one-pass critique |

## Next Steps

The active planning parent should apply the direct PC-001 sequencing correction and finalize the
plan. No user action and no additional critique are required.
