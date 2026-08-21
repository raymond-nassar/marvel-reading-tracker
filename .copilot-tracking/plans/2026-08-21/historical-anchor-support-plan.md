<!-- markdownlint-disable-file -->
# RPI Plan: Historical Anchor Support

## Task Metadata

* Task ID: HAS-001
* Task slug: historical-anchor-support
* Planning status: Ready after one final-candidate critique and five resolved findings
* Plan date: 2026-08-21
* Phase details: .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-21/historical-anchor-support-plan-critique.md

## Executive Summary

The evidence-anchor gate currently treats every citation as a claim about today's tree. That is
correct for product documentation and wrong for dated working evidence. A dated research record
describes what was true when its line was authored, so a later document rewrite should not require
that historical record to be rewritten.

This plan keeps every citation in the corpus and changes only the tree used to resolve its target.
For a citation in a dated tracking artifact, Git line provenance selects the commit that authored
that citation line. Current product documents and uncommitted citation lines continue to use the
active tree. A shallow clone is refused because it cannot prove that provenance.

### User Decisions and Requirements Highlights

* Historical artifacts remain byte-for-byte records. No current case is enumerated and no filename
  is excluded from anchor collection.
* The mechanism covers new and committed artifacts, current documents, missing history, moved or
  deleted targets, malformed citations, ranges, repeated heads, and clones.
* README.md and the separate release-documentation task remain untouched.
* Exactly one final-candidate critique runs before implementation.

### What You May Not Know

* One dated artifact already contains citation lines from three commits, so a single commit per
  document is not precise enough.
* Two historical citations are already blessed against unrelated live README content. Their written
  coordinates still name the claimed material in the commits that authored the citation lines.
* The CI job that runs anchors already checks out full history for another gate. The implementation
  must pin and use that existing dependency, not add a second checkout policy.

### Unresolved Decisions or Blockers

* None. Research selected line-level Git provenance and established failure behavior.

For current user input, see [User Decisions and Requirements](#user-decisions-and-requirements).

## User Decisions and Requirements

* Create this as a separate prerequisite for the major-release documentation task.
* Run Research, Plan with exactly one final-candidate critique, Implement, and Review automatically.
* Preserve tracked dated `.copilot-tracking/` artifacts as historical records without rewriting them.
* Do not weaken or exclude the anchor corpus by filename, silently drop citations, or enumerate the
  currently affected historical cases.
* Make the mechanism general and evidence-based, with explicit behavior for every source and failure
  state named in the request.
* Prove every new check fails without the implementation.
* Update infrastructure records, run all repository gates, and do not edit README.md or the active
  release-documentation task.
* Do not create a tag, release, or other publication.

## Goals

* Resolve each historical citation against the repository state that existed when its own artifact
  line was authored.
* Preserve live-tree drift detection for current documents and current uncommitted evidence.
* Fail loudly when Git history or a historical target cannot answer the question.
* Keep collection, identity, loss detection, range validation, and malformed-citation reporting
  complete.
* Leave a verified, reviewable infrastructure record that the dependent documentation change can
  integrate first.

## Scope and Non-Goals

### In Scope

* Historical-artifact classification from the dated tracking convention.
* Per-line provenance from Git for committed historical citations.
* Active-tree resolution for current documents and uncommitted historical citation lines.
* Enrollment of untracked new dated tracking artifacts in working runs, including artifacts matched
  by the repository's tracking ignore rule.
* Source-aware target reads, caching, diagnostics, and shallow-history refusal.
* Source-specific membership for extensionless historical targets and fatal detection of malformed
  nonnumeric range ends.
* Targeted process tests, existing unit regression coverage, lock regeneration, changelog, backlog,
  RPI records, and required gates.

### Non-Goals

* Editing any historical artifact to re-aim its existing citations.
* Editing README.md or any artifact owned by the major-release documentation task.
* Exempting a path, date, document, scope, or citation from collection.
* Searching by head text, inventing a target coordinate, or maintaining a case list.
* Changing application runtime behavior, dependencies, version, tag, release, or publication state.

## Functional Requirements

* A citation in a committed dated tracking artifact resolves its target at the commit attributed to
  that citation's document line.
  * Observable acceptance criteria: moving or deleting the target later leaves the historical
    citation unchanged and valid when its source commit still contains the written target.
* A citation in a current product document resolves against the active tree.
  * Observable acceptance criteria: moving its target without re-aiming still reports drift.
* A citation on an uncommitted historical line resolves against the active tree.
  * Observable acceptance criteria: new or edited artifact lines can cite files changed in the same
    working tree before any commit exists.
* A new dated artifact participates before staging even though the tracking root is ignored.
  * Observable acceptance criteria: its citation is reported as new or blessed rather than omitted.
* A historical target missing, out of range, blank-only, or blank-edged retains the existing failure
  behavior against its source tree.
  * Observable acceptance criteria: no failure path falls back to the live tree or a lock value.
* An extensionless citation in a committed dated artifact uses the tracked-file membership of its
  source commit.
  * Observable acceptance criteria: moving or deleting that target later does not drop the citation
    before fingerprinting.
* A citation-shaped range with a nonnumeric end is refused before check or bless comparison.
  * Observable acceptance criteria: the command identifies the malformed token and exits as an
    instrument failure rather than reporting clean coverage.
* A shallow clone with committed historical citations is refused.
  * Observable acceptance criteria: the command exits as an instrument failure and identifies full
    history as the required remedy.
* Whole-revision `--ref` checks preserve their existing purpose while using citation-line provenance
  within dated artifacts in that revision.
  * Observable acceptance criteria: current documents resolve at the named revision, and dated
    artifacts resolve at their line-origin commits reachable from it.

## Non-Functional Requirements

* Corpus completeness.
  * Objective threshold: every tracked file remains eligible, every collected occurrence retains a
    unique key, and new dated artifacts add coverage rather than creating an exclusion.
  * Observable acceptance criteria: existing coverage, loss, duplicate-key, near-miss, and repeated
    citation checks remain active.
* Determinism.
  * Objective threshold: the same full clone and working tree produce the same source commit and
    fingerprint without head-text search or heuristic case selection.
  * Observable acceptance criteria: exact line coordinates and Git object IDs drive target reads.
* Structural classification.
  * Objective threshold: any path below `.copilot-tracking/` with a complete `YYYY-MM-DD` directory
    segment is dated, independent of category or nesting depth.
  * Observable acceptance criteria: direct and nested dated artifacts receive provenance while an
    undated tracking file and a product document remain active-tree claims.
* Fail-loud provenance.
  * Objective threshold: no missing blame, missing history, unreadable source blob, or missing target
    can become the active tree by fallback.
  * Observable acceptance criteria: process tests assert nonzero exits and useful diagnostics.
* Performance.
  * Objective threshold: one blame process per dated artifact at most, with target text cached by
    source and path, and the full anchor command remains inside its existing two-minute CI step.
* Compatibility.
  * Objective threshold: no runtime dependency or browser code changes.

## Acceptance Criteria

* A synthetic repository proves a committed historical citation survives a later target move or
  deletion while a current document citation still drifts.
* A synthetic repository proves a full clone passes and a shallow clone refuses to answer.
* A synthetic repository proves a new dated artifact is enrolled before staging and resolves against
  the active tree.
* A synthetic repository proves a historical target absent at its source commit is unresolvable.
* A synthetic repository proves an extensionless target remains collected from the source tree after
  later deletion.
* A synthetic repository proves `--ref` keeps product documents on the named revision and dated
  artifacts on their reachable line-origin commits.
* A focused process test proves a malformed nonnumeric range end is fatal in check and bless modes.
* A workflow ownership test proves exactly one CI job runs anchors and that job checks out full
  history.
* Existing tests continue to cover valid ranges, repeated citations, collisions, losses, scope
  renames, and whole-revision verdict behavior.
* Every new semantic process test is observed failing with the checker implementation removed, then
  passing with it restored.
* `npm run lint`, `npm test`, and `npm run anchors` complete with zero failures, zero drift, zero new,
  and zero removed anchors after the deliberate bless cycle.
* Added lines contain no em dash or en dash.
* The changelog and BL-182 record the shipped infrastructure change and exact verification.
* README.md and the creator session's release-documentation artifacts remain unchanged.

## Test and Artifact Ownership Lock

* Test owner: `test/check-anchors.test.js`.
* Exact removals: none.
* Maximum additions: five process-level semantic tests, one workflow ownership test, and any small
  shared fixture helper needed to build disposable Git repositories.
* Canonical implementation target: `scripts/check-anchors.mjs`.
* Generated target: `docs/anchors.lock.json`, written only by `npm run anchors:bless`.
* Canonical records: `CHANGELOG.md`, `PRODUCT_BACKLOG.md`, and the dated HAS-001 RPI artifacts.
* Semantic coverage: historical and live source selection, extensionless membership, direct and
  nested dated paths, new-artifact enrollment, malformed range refusal, shallow refusal,
  source-target failure, and mixed `--ref` behavior.
* Regression coverage: the existing unit tests remain the owner for valid ranges, repeated heads,
  collision reporting, loss detection, and pure `--ref` verdict rules.
* Validation evidence: targeted tests first, red-without-fix proof for every new semantic test, then
  pre-bless lint and complete tests, the full anchor inspect and bless cycle, final repeated gates,
  and the added-line dash scan. Any edit after pairing inspection invalidates that inspection and
  returns the task to the inspect step.

## Implementation Context Record

| Context item | Current artifact or record |
|---|---|
| Plan | .copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md |
| Phase details | .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md |
| Latest critique | .copilot-tracking/reviews/plans/2026-08-21/historical-anchor-support-plan-critique.md with Revise disposition; PC-001 through PC-005 resolved directly |
| Relevant research | .copilot-tracking/research/2026-08-21/historical-anchor-support-research.md |
| Changes-record role | .copilot-tracking/changes/2026-08-21/historical-anchor-support-changes.md is created by implementation |
| Planning execution and readiness | Complete and Ready after the only critique |
| Continuation context | Confirmed automatic RPI Agent continues to implementation |

## Sources

* .copilot-tracking/research/2026-08-21/historical-anchor-support-research.md: Selected provenance
  model, alternatives, current false pairings, clone dependency, and edge-case behavior.
* scripts/check-anchors.mjs: Current collection, reading, fingerprinting, lock, and failure contracts.
* test/check-anchors.test.js: Existing semantic and regression ownership.
* .github/workflows/ci.yml: Existing full-history checkout and two-minute anchors step.
* User request in the creator session: Scope, exclusions, RPI loop, critique count, gates, and handoff.

## Phase Checklist

<!-- rpi:phase id=P00 -->
### [x] P00: Prove the behavior at the process boundary

* Intent: Add the smallest disposable-repository tests that fail under the current live-only checker.
* Dependencies: Completed research and the locked test ownership above.

<!-- rpi:task id=P00-T01 -->
#### [x] P00-T01: Build one reusable Git fixture

* Requirement and evidence: Process behavior depends on commits, working content, and clone depth, so
  pure fixture objects cannot prove it.
* Expected result: Tests can create small repositories, commit dated artifacts and targets, clone
  them, and invoke the real checker without touching this worktree.
* Detail section: P00-T01 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

<!-- rpi:task id=P00-T02 -->
#### [x] P00-T02: Add and prove the semantic cases

* Requirement and evidence: Acceptance criteria require historical, live, extensionless, nested,
  new, malformed, revision, shallow, workflow, and missing source-target behavior.
* Expected result: At most five semantic process tests and one workflow test cover every requirement.
  Every assertion is observed failing under removal of the behavior it protects.
* Detail section: P00-T02 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

<!-- rpi:phase id=P01 -->
### [x] P01: Resolve historical targets from line provenance

* Intent: Add source-aware collection and reads without changing citation membership or identity.
* Dependencies: P00.

<!-- rpi:task id=P01-T01 -->
#### [x] P01-T01: Classify source semantics and discover new artifacts

* Requirement and evidence: Dated tracking paths are historical only when their citation lines are
  committed; new lines remain current evidence.
* Expected result: The document walk includes all tracked files plus untracked new dated artifacts
  on working runs, assigns a source per historical line, and derives extensionless target membership
  from that same source tree. A date is any complete date directory segment below the tracking root.
* Detail section: P01-T01 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

<!-- rpi:task id=P01-T02 -->
#### [x] P01-T02: Fingerprint from the selected source

* Requirement and evidence: Existing target reads accept only one global tree.
* Expected result: Fingerprints cache and read by source plus target path, while existing valid-range
  and target failures remain unchanged in kind. Malformed nonnumeric range ends are fatal before
  comparison.
* Detail section: P01-T02 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

<!-- rpi:task id=P01-T03 -->
#### [x] P01-T03: Refuse missing provenance

* Requirement and evidence: Shallow blame can return a plausible boundary commit.
* Expected result: Shallow or unreadable history cannot produce a clean anchor result. Mixed
  `--ref` behavior is process-tested, and the one CI job that runs anchors keeps a full checkout.
* Detail section: P01-T03 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

<!-- rpi:phase id=P02 -->
### [ ] P02: Reconcile the evidence record and gates

* Intent: Record the infrastructure change, deliberately regenerate historical fingerprints, and
  verify the whole repository.
* Dependencies: P01.

<!-- rpi:task id=P02-T01 -->
#### [x] P02-T01: Record implementation divergence and completion

* Requirement and evidence: Infrastructure changes require changelog and backlog records, and RPI
  implementation requires a changes record.
* Expected result: BL-182, the changelog, plan checkboxes, phase details, and changes artifact agree
  with what actually shipped.
* Detail section: P02-T01 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

<!-- rpi:task id=P02-T02 -->
#### [x] P02-T02: Pass pre-bless validation

* Requirement and evidence: Pairing inspection is valid only for the exact tree whose code and tests
  already pass.
* Expected result: Targeted proofs, lint, and the complete test suite pass before any lock is
  inspected or blessed.
* Detail section: P02-T02 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

<!-- rpi:task id=P02-T03 -->
#### [ ] P02-T03: Inspect and bless the source-aware lock

* Requirement and evidence: Historical fingerprints will deliberately change source even when their
  citation text does not.
* Expected result: Every printed pairing is read against its claim before the generated lock is
  accepted, then final anchors report zero drift, new, or removed entries.
* Detail section: P02-T03 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

<!-- rpi:task id=P02-T04 -->
#### [ ] P02-T04: Repeat complete validation on the unchanged tree

* Requirement and evidence: Repository instructions define lint, tests, anchors, and added-line dash
  scanning as completion gates.
* Expected result: All gates pass again after bless, performance remains inside the CI deadline, and
  no excluded file or release surface changed. Any intervening edit returns to P02-T02 and P02-T03.
* Detail section: P02-T04 in .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md

## Dependencies

* Git full history: Required only for committed dated artifact lines. CI already supplies it.
* Existing anchor lock: Supplies prior pairings and must be regenerated only after human inspection.
* BL-182 allocation: Next unused backlog identifier on the current base; the dependent creator
  session must integrate this prerequisite before allocating later work.

## Critique Disposition

| Critique run and finding | Disposition | Plan response or residual risk |
|---|---|---|
| PC-001, source-specific extensionless membership | resolved | P00 and P01 now require membership from the citation source tree and a deleted-target process assertion. |
| PC-002, malformed citation ownership | resolved | The checker and focused process test now own fatal nonnumeric range ends in check and bless modes. |
| PC-003, `--ref` and CI history ownership | resolved | P00 owns mixed-source revision behavior and one workflow test pins full history for the anchor-owning job. |
| PC-004, nested dated paths | resolved | The predicate is segment-based at any depth below the tracking root and has direct, nested, undated, and product controls. |
| PC-005, validation after bless | resolved | Full validation now precedes inspect and bless, repeats on the unchanged final tree, and any edit invalidates the inspection. |

## Follow-Up Items

* None

## Handoff

* Implementation artifact: .copilot-tracking/changes/2026-08-21/historical-anchor-support-changes.md
* Ready phase or task: P00
* Remaining provisional question or blocker: none
