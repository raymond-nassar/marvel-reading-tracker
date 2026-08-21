<!-- markdownlint-disable-file -->
# Review: Historical Anchor Support

## Scope and Evidence

* Task ID: HAS-001
* Review date: 2026-08-21
* Review scope: Full task
* Assessed boundary: User requirements, full plan, phase details, only plan critique, research,
  implementation changes, records, generated lock, validation, and repository constraints.
* Plan: .copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-21/historical-anchor-support-plan-critique.md
* Changes: .copilot-tracking/changes/2026-08-21/historical-anchor-support-changes.md
* Other evidence considered: .copilot-tracking/research/2026-08-21/historical-anchor-support-research.md,
  complete staged diff from origin/main, targeted and full test results, lint, count, anchor, and
  added-line dash results.

## Opening Review State

* Interpreted review goal: Decide once whether the completed prerequisite preserves dated evidence
  generally without weakening the live corpus or blocking the dependent documentation rewrite.
* Review scope: Full HAS-001 task.
* Evidence readiness: The plan and every task marker are complete, implementation evidence is
  reconciled, the lock is finalized, and required validation is recorded as passing.
* Acceptance basis: Confirmed user requirements, plan functional and non-functional requirements,
  acceptance criteria, PC-001 through PC-005 dispositions, repository gates, and explicit exclusions.
* First comparison boundary: Reconcile the complete plan and changes record, then inspect the staged
  implementation and independent code-review evidence for substantive defects.
* Active read-only boundaries: This stage may update only this review record. All other artifacts and
  source files are evidence only.
* Initial blockers: None.

## Execution Status

* Execution status: Complete
* Review execution evidence: The complete task boundary was compared once, including all plan
  markers, detail evidence, critique dispositions, implementation decisions, validation, and the
  staged source and test changes.

## Plan-to-Change Reconciliation

* Every P00 through P02 phase and task marker is checked and has a matching completion-evidence
  section in the phase details and changes record.
* The changes record accounts for all staged implementation and record changes, including ignored
  artifact discovery, derived-count corrections, the provenance-boundary commit, unsupported
  candidate-plan citation removal, and current-document re-aims.
* The implementation preserves the planned per-citation Git provenance architecture, source-specific
  target membership, current-tree semantics, named-revision split, and full-history dependency.
* Two implemented guard paths do not satisfy their completed plan contracts. Missing blame slots can
  fall back to the active tree, and malformed-range refusal covers less syntax than collection.

## Completed Work Assessment

* The primary source-selection mechanism is implemented and supported by disposable-repository
  process tests.
* Infrastructure records, generated lock migration, and current-document citation maintenance are
  complete and within the requested boundary.
* README.md, release-documentation work, runtime code, dependencies, tags, releases, and publication
  state are unchanged.
* Completion is not acceptable yet because the two fail-loud corpus protections below have uncovered
  fallback and silent-loss paths.

## Implementation-Time Plan and Detail Update Assessment

* All descriptive updates state the trigger, rationale, caller direction, and reconciliation.
* The ignored-artifact correction preserves the explicit pre-staging requirement.
* The provenance-boundary commit is a material implementation decision but follows the selected
  per-line Git design and makes the task's own historical evidence clone-stable.
* Removing four unsupported candidate-plan citations is justified because no committed source exists;
  the critique preserves the findings and explicitly names the evidence limit instead of inventing
  provenance.
* Derived count updates and current-document re-aims are required consequences of the infrastructure
  record and source changes, not scope expansion.

## Critique and Material Revision Assessment

* Latest critique dispositions: PC-001 through PC-005 are recorded as resolved in the plan.
* Material revisions: Source-specific extensionless membership, malformed refusal, mixed revision
  behavior, nested-date classification, and validation ordering were incorporated before
  implementation without changing the selected architecture.
* Dependent-work pause assessment: Not ready for integration until RV-001 and RV-002 are corrected.
* Justification assessment: The critique dispositions are well supported, but PC-002 is only partly
  realized and P01-T01's complete blame-accounting expectation is defective in implementation.

## Plan Follow-Up Assessment

* The plan and changes record both declare no follow-up items.
* The findings below are active defects in the current scope, not follow-up work.

## Findings

<!-- rpi:review id=RV-001 -->
### RV-001 [High]: Sparse blame validation permits active-tree fallback

* Related requirements: Fail-loud provenance, P01-T01, and the prohibition on fallback.
* Evidence: In scripts/check-anchors.mjs, lineSources creates a sparse array, fills slots parsed from
  blame, then uses Array.prototype.some to find undefined entries. JavaScript array iteration skips
  holes, so an omitted blame slot does not satisfy that predicate. Collection later substitutes
  ACTIVE_SOURCE for any missing slot.
* Impact: Incomplete provenance can resolve a historical citation against the working tree or named
  revision and produce a false clean result.
* Smallest correction: Validate every expected physical line index explicitly, excluding only a
  deliberate trailing split sentinel where applicable, and remove the missing-slot fallback during
  historical collection.
* Destination: rpi-implement for HAS-001.

<!-- rpi:review id=RV-002 -->
### RV-002 [High]: Malformed-range refusal covers less syntax than collection

* Related requirements: Corpus completeness, fatal malformed nonnumeric range ends, PC-002, and
  P01-T02.
* Evidence: In scripts/check-anchors.mjs, MALFORMED_RANGE accepts only the fixed seven-extension
  class, while citations also accepts source-member extensionless paths. malformedRanges also skips
  code lines unless they begin with the configured comment opener, while citations accepts a
  backticked citation anywhere on a code line. Existing process coverage exercises only a Markdown
  target.js malformed token.
* Impact: An extensionless malformed token such as one naming NOTICE, or a malformed backticked token
  in an inline code comment, can disappear from collection and the lock while check and bless report
  clean coverage.
* Smallest correction: Detect malformed ends over the same backticked path and source-membership
  domain as citations, preserve the narrower bare-prose rules, and add focused process assertions for
  extensionless and inline-code forms.
* Destination: rpi-implement for HAS-001.

## Defects

* RV-001: High, active-tree fallback from incomplete blame.
* RV-002: High, silent malformed-citation loss outside the detector's narrower syntax.

## Routed Findings

| Finding | Severity | Destination | Reason |
|---|---|---|---|
| RV-001 | High | rpi-implement | The selected design is sound; its line-accounting guard is defective. |
| RV-002 | High | rpi-implement | The accepted malformed-refusal requirement needs complete implementation and proof. |

## Residual Work

* None outside the two active defects.

## Blockers and Remaining Work

* Blockers: The prerequisite must not be integrated while either High finding remains.
* Remaining active work: Correct RV-001 and RV-002, prove each added check fails without its fix,
  repeat the full anchor workflow after the source and test edits, and rerun required gates.

## Validation Evidence

* Recorded targeted anchor result: 96 passed, zero failed.
* Recorded complete-suite result: 1,294 passed, zero failed before and after bless.
* Recorded lint result: zero problems before and after bless.
* Recorded lock result: 1,017 unchanged, zero drifted, zero new, zero removed.
* Recorded count result: 156 ranked rows, 161 detail blocks, and all stated figures agree.
* Recorded added-line dash result: zero em dash and zero en dash additions.
* Red-without-fix evidence exists for five semantic tests and the workflow ownership test.
* Coverage limitation: No test forces a missing interior blame slot or malformed extensionless and
  inline-code forms, so the passing suite does not contradict RV-001 or RV-002.

## Outcome

* Outcome: Defects found
* Outcome rationale: The architecture and most requirements conform, but two High defects violate
  explicit fail-loud and corpus-completeness criteria. The prerequisite is not accepted for
  integration until both are corrected.

## Closeout Routing Record

* Review execution is complete and will not be repeated as a new review mode.
* RV-001 and RV-002 route once to rpi-implement within the existing HAS-001 scope.
* No planning, research, decision, or separate follow-up route is required.

## Relevant Artifacts

| Artifact | Description |
|---|---|
| [.copilot-tracking/research/2026-08-21/historical-anchor-support-research.md](.copilot-tracking/research/2026-08-21/historical-anchor-support-research.md) | Three-wave research and provenance decision. |
| [.copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md](.copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md) | Complete plan, requirements, markers, and critique dispositions. |
| [.copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md](.copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md) | Phase and task execution evidence. |
| [.copilot-tracking/reviews/plans/2026-08-21/historical-anchor-support-plan-critique.md](.copilot-tracking/reviews/plans/2026-08-21/historical-anchor-support-plan-critique.md) | The only final-candidate critique. |
| [.copilot-tracking/changes/2026-08-21/historical-anchor-support-changes.md](.copilot-tracking/changes/2026-08-21/historical-anchor-support-changes.md) | Implementation decisions, validation, and handoff state. |
| [.copilot-tracking/reviews/logs/2026-08-21/historical-anchor-support-review.md](.copilot-tracking/reviews/logs/2026-08-21/historical-anchor-support-review.md) | Canonical review record and routed findings. |

## Next Steps

The automatic parent should invoke rpi-implement for HAS-001 to correct RV-001 and RV-002 before
integration. No user action is required.
