<!-- markdownlint-disable-file -->
# RPI Plan Critique: Historical Anchor Support

## Metadata

* Task ID: HAS-001
* Critique date: 2026-08-21
* Plan: .copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md
* Critique execution status: Complete

## Inputs and Criterion Boundary

* Task context and caller requirements: Assess the only final candidate for a separate anchor
  prerequisite. The plan must preserve every citation without re-aiming historical records, remain
  general, cover every named source and failure state, prove every new check red without its fix,
  complete the required gates and records, and avoid release-task, README, tag, release, and
  publication changes.
* Research and evidence considered:
  .copilot-tracking/research/2026-08-21/historical-anchor-support-research.md,
  .copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md,
  .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md,
  scripts/check-anchors.mjs, test/check-anchors.test.js, and .github/workflows/ci.yml.
* Decisions, dependencies, and acceptance criteria considered: Per-citation Git line provenance,
  active-tree behavior for live and uncommitted evidence, shallow-history refusal, no corpus
  exclusion, five or fewer semantic process tests, existing regression ownership, full-history CI,
  lock inspection and bless, final gates, BL-182, changelog, and HAS-001 records.
* Assessment boundary: This critique assesses the supplied final candidate and supplied repository
  evidence once. It does not perform new research, select a different provenance model, or assess
  implementation that does not yet exist.

## Coverage Assessment

| Requirement, research, phase, or task ID | Coverage | Evidence or concern |
|---|---|---|
| Caller prerequisite and exclusions | Covered | The plan separates HAS-001 and excludes README, release-task, tag, release, and publication work. |
| Caller full-corpus and moved or deleted target requirement | Partial | Source-aware reads are planned, but extensionless citation membership still depends on the live tracked-file set. |
| Caller malformed-citation requirement | Missing | The plan assigns malformed forms to existing regression tests, but the supplied checker and tests do not own the known silently dropped malformed range shape. |
| Caller provenance and clone requirement; C14-C16 | Partial | Full and shallow runs are planned, but end-to-end `--ref` behavior and the anchor-owning CI checkout-depth assertion are not assigned. |
| General dated-artifact classification; C9 | Partial | The plan does not define or test the nested dated path shape already present in the evidence. |
| Ranges and repeated heads; C13; P01-T02 | Covered | Exact coordinates, source-aware cache keys, existing validation, and a combined process fixture are credible. |
| P00 test ownership and red proof | Partial | The cap and harness are feasible, but the missing checks need explicit ownership and distinct defect injection. |
| P01 implementation ordering | Covered | Provenance discovery precedes source-aware reads and fail-loud history handling. |
| P02 records and anchor cycle | Partial | Required records and inspect, bless, final anchors are present, but full lint and test run only after bless. |

## Verdict

* Verdict: Revise
* Rationale: The selected provenance model is credible, but the plan does not yet preserve the full
  citation population for extensionless historical targets, does not own the caller-required
  malformed case, and leaves important `--ref`, CI-depth, path-classification, and pre-bless
  validation behavior without exact tests or dependencies. All findings are direct planner
  corrections under confirmed caller direction.

## Findings

<!-- rpi:critique id=PC-001 -->
### PC-001 [High]: Source-specific membership is missing for extensionless historical targets

* Related IDs: Caller full-corpus and moved or deleted target requirements; C1, C13; P01-T01,
  P01-T02
* Evidence: scripts/check-anchors.mjs:375-395 admits an extensionless citation only when its target
  is in the one `known` tracked-file set. scripts/check-anchors.mjs:657-672 builds that set from the
  active document population before any per-line source is selected. The plan changes target reads
  but does not change this source-sensitive membership decision.
* Concern: If a committed historical artifact cites an extensionless tracked target and that target
  is later moved or deleted, the active set no longer recognizes the text as a citation. The source
  commit could resolve it, but collection drops it before fingerprinting.
* Impact: The mechanism would not preserve every citation or satisfy its general moved and deleted
  target promise. It would report a lock loss instead of proving the historical citation valid.
* Smallest useful change: Make extensionless target membership use the citation line's selected
  source tree, cached by source, and add an extensionless moved or deleted target to the combined
  historical-versus-live process fixture.
* Action owner: Planning parent
* Exact resolving evidence: Revised P01-T01 and P01-T02 details state the source-specific known-path
  rule, and P00-T02 names a process assertion where an extensionless target exists at the line-origin
  commit, is absent later, remains collected with the same key, and resolves from that commit. The
  changes record shows that assertion red under the current active-set collector and green after the
  implementation.
* Decision route: Direct planner correction

<!-- rpi:critique id=PC-002 -->
### PC-002 [High]: Malformed citations are assigned to regression coverage that does not exist

* Related IDs: Caller malformed-citation and red-proof requirements; Acceptance Criteria;
  Test and Artifact Ownership Lock; P00-T02, P02-T03
* Evidence: scripts/check-anchors.mjs:31-40 collects only numeric starts and ends.
  scripts/check-anchors.mjs:95-123 names selected near-miss shapes but has no general malformed
  range detector. test/check-anchors.test.js:190-445 tests valid citations, extensionless forms,
  relative forms, and blank range edges, not a malformed end token. The candidate nevertheless
  assigned malformed forms to existing tests. That exact pre-correction candidate was not committed
  separately, so this finding is the durable record of the missing ownership it observed.
* Concern: A range whose end is not numeric can disappear from both collection and coverage without
  drift, loss, or an instrument failure.
* Impact: One caller-named failure state remains silently outside the corpus, directly contradicting
  the preservation requirement.
* Smallest useful change: Define the malformed shapes this task must refuse, add a checker-level
  detector before check and bless comparison, and assign a focused test within the existing owner.
  At minimum, cover the known nonnumeric range-end shape without weakening valid prose handling.
* Action owner: Planning parent
* Exact resolving evidence: Revised P00-T02 and P01 details identify the malformed detector and its
  fatal check and bless behavior. A named test assembles a malformed range so it does not enroll the
  fixture source itself, exits nonzero with a precise diagnostic, is observed green before the
  detector, red as a test after the detector test is added without its implementation, and green
  with the detector restored. The changes record preserves that red and green result.
* Decision route: Direct planner correction

<!-- rpi:critique id=PC-003 -->
### PC-003 [Medium]: Whole-revision and CI history dependencies lack executable ownership

* Related IDs: Functional Requirements for `--ref`; C7, C8, C14; P00-T02, P01-T03
* Evidence: The candidate required dated artifacts under `--ref` to use reachable line-origin
  commits, but P00-T02 named working, new, shallow, and missing-target cases only. That exact
  pre-correction candidate was not committed separately. test/check-anchors.test.js contains pure
  verdict assertions for a ref but no subprocess execution of the checker. The required full-depth
  checkout exists in the anchor-owning job at .github/workflows/ci.yml:107-156, while the supplied
  workflow ownership test in test/publication-gate.test.js:220-232 pins publication, not anchors.
* Concern: The implementation materially changes `--ref`, yet no process test proves its mixed
  current-document and historical-source behavior. No anchor-owned test prevents a later workflow
  move from separating the gate from full history.
* Impact: Working-tree tests can pass while historical revision inspection is wrong, or CI can later
  become shallow and fail only after merge.
* Smallest useful change: Assign one process assertion for `--ref` and one workflow ownership
  assertion in test/check-anchors.test.js. Combine scenarios if needed to retain the five semantic
  process-test cap, but keep each failure reason independently observable.
* Action owner: Planning parent
* Exact resolving evidence: P00-T02 names the revision fixture and expected source for both a current
  document and dated artifact. P01-T03 names a test that identifies exactly one CI job running
  anchors and verifies that job's checkout has full depth. The changes record shows the `--ref`
  assertion failing without source-aware resolution and the workflow assertion failing under a
  controlled removal of full depth, then both passing in the final tree.
* Decision route: Direct planner correction

<!-- rpi:critique id=PC-004 -->
### PC-004 [Medium]: Historical path classification is not precise enough for the supplied corpus

* Related IDs: Caller general-mechanism requirement; C9; P01-T01
* Evidence: C9's evidence path is nested as
  .copilot-tracking/research/subagents/2026-08-20/modern-marvel-continuity-guides-internal-wider.md.
  P01-T01 says only that a path is a dated artifact under `.copilot-tracking/`, without defining
  which segment carries the date or testing direct and nested layouts.
* Concern: An implementation can reasonably match only category/date/file and treat nested
  subagent evidence as live, even though the supplied research uses that nested shape to justify
  line-level provenance.
* Impact: The general mechanism could behave differently across historical artifacts based on
  directory depth and miss part of the current corpus.
* Smallest useful change: State one segment-based structural predicate for dated artifacts below
  `.copilot-tracking/`, independent of category and nesting depth, and cover direct and nested
  examples in one source-selection test.
* Action owner: Planning parent
* Exact resolving evidence: Revised P01-T01 contains the exact predicate and rejects case lists.
  P00-T02 has a fixture with both direct and nested dated artifacts, and both receive committed
  provenance while an undated tracking file and a current product document remain active-tree
  claims.
* Decision route: Direct planner correction

<!-- rpi:critique id=PC-005 -->
### PC-005 [Medium]: Full validation occurs after the lock is blessed

* Related IDs: Caller required lint, test, anchors inspect, bless, final workflow; P02-T02, P02-T03
* Evidence: The candidate put inspect, bless, and final anchors in P02-T02, then put full lint and
  tests afterward in P02-T03. That exact pre-correction candidate was not committed separately, so
  this ordered finding is the durable record of the planning gap it observed.
* Concern: A full-suite or lint failure discovered after bless can require a source or record edit,
  invalidating the inspected pairings and generated lock. The plan has no dependency that sends such
  an edit back through inspect and bless.
* Impact: The final lock can be accepted against a tree that is no longer the tested final tree, or
  the implementation can require an unplanned second bless without its required reading record.
* Smallest useful change: Run targeted red and green proof, lint, and the full suite before the
  deliberate inspect and bless. After bless, run the final anchors check and repeat all completion
  gates. State that any post-inspection edit invalidates the pairing review and returns to inspect.
* Action owner: Planning parent
* Exact resolving evidence: Revised P02 dependencies put pre-bless lint and full tests before
  P02-T02, keep final anchors after bless, require a final full-gate pass on the unchanged tree, and
  explicitly loop every later edit back to inspection. The changes record lists both pre-bless and
  final results and states that no file changed between pairing review and final anchors.
* Decision route: Direct planner correction

## Strengths and Residual Risk

* The line-origin provenance choice is evidence-backed and correctly rejects document-wide commits,
  lock-only freezing, markers, and repeated-head search.
* The plan preserves key identity and comparison behavior, makes shallow history fail loudly, and
  gives new dated artifacts active-tree semantics before staging.
* The phase split is understandable and the five-process-test cap remains feasible if scenarios are
  combined without combining their assertions or failure messages.
* Residual performance risk is explicitly bounded by one blame per dated artifact and the existing
  CI deadline, with a final measurement assigned.

## Questions or Blocking Evidence Gaps

* None. Current caller direction resolves all findings. No significant or divergent user decision
  is required.

## Limitations

* This assessment did not inspect external sources or implementation that has not been written.
* The critique can require source-specific extensionless membership, malformed-form ownership, and
  exact tests from the supplied evidence, but the implementation must select the smallest internal
  API shape.

## Recommended Next Action

* Highest-impact finding: PC-001
* Action owner: Planning parent
* Smallest next action: Revise P00 and P01 so citation membership, not only target reads, is selected
  from the citation line's source, then incorporate PC-002 through PC-005 without another critique.
* User response required: no

## Relevant Artifacts

| Artifact | Purpose |
|---|---|
| [.copilot-tracking/research/2026-08-21/historical-anchor-support-research.md](.copilot-tracking/research/2026-08-21/historical-anchor-support-research.md) | Supplied provenance research and edge-case evidence |
| [.copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md](.copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md) | Final candidate assessed by this critique |
| [.copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md](.copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md) | Task ordering and completion evidence assessed by this critique |
| [.copilot-tracking/reviews/plans/2026-08-21/historical-anchor-support-plan-critique.md](.copilot-tracking/reviews/plans/2026-08-21/historical-anchor-support-plan-critique.md) | Complete actionable critique and disposition |
| [scripts/check-anchors.mjs](scripts/check-anchors.mjs) | Current collection, membership, fingerprint, and gate behavior |
| [test/check-anchors.test.js](test/check-anchors.test.js) | Locked test owner and current regression coverage |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | Existing full-history checkout and anchor deadline |

## Next Steps

The active planning parent should apply PC-001 through PC-005 directly, record their dispositions in
the plan, finalize it without another critique, and continue the automatic RPI loop. No user action
is required.
