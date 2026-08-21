<!-- markdownlint-disable-file -->

# Task Research: major-release-proof-corrections

| Field | Value |
|-------|-------|
| Date | 2026-08-21 |
| Researcher / agent | RPI Agent using rpi-research |
| Status | Complete |
| Artifact path | .copilot-tracking/research/2026-08-21/major-release-proof-corrections-research.md |

## Research Brief

* What to research: The smallest complete correction for RV-001 through RV-003 from the completed
  major-release-docs Review.
* Why it matters: Release publication is blocked because upgrade validation does not prove the
  historical source boundary or nonzero read progress, and the canonical maintainer guide does not
  match the runner interfaces.
* Audience or intended use: Planning and implementation for the automatic child task.
* Scope: scripts/upgrade-check.mjs, scripts/browser-check.mjs, docs/MAINTAINING.md, package scripts,
  workflow behavior, and focused semantic tests.
* Non-goals: Changing runtime storage behavior, publishing a release, changing the product release
  copy, or running a second Review for the parent task.
* Criteria: Prove a real v1.2.0-to-1.3.0 boundary, preserve nonzero issue-read state, make proof mode
  catch loss of read state, align documentation with actual interfaces, and add red-green semantic
  coverage.
* Requested outputs: One planning-ready correction boundary for all three routed findings.
* Output mode: convergence.

## Research Parameters

| Field | Value |
|-------|-------|
| Research posture | focused |
| Posture provenance | Bounded internal task with exact review findings and named source targets |
| Explicit limits | Reuse completed Review evidence; no source edits during Research |
| Resolved evidence root | .copilot-tracking/ |

## Extension Registry and Provenance

| Kind | Candidate | Selected / skipped reason |
|------|-----------|---------------------------|
| Instruction | Repository custom instructions | Selected for RPI, test-proof, browser-driver, release, and writing constraints. |
| Skill | hve-core:rpi-research | Selected as the active phase contract. |
| Specialist | none | Skipped because the completed Review already isolates the exact defects and source boundary. |

## User Participation and Research Decisions

| Checkpoint | Questions or no-interaction rationale | Resulting decision |
|------------|---------------------------------------|--------------------|
| Follow-up selection | The user was unavailable and explicitly directed autonomous good judgment. | Select the recommended combined correction for RV-001 through RV-003. |
| Intake | The Review supplies exact defects, destinations, and smallest useful next actions. | Reuse evidence without repeating discovery. |

## Scope and Success Criteria

* All three Review findings have a concrete implementation and proof boundary.
* Historical test input is byte-exact and does not depend on a mutable network source.
* The normal upgrade path reaches the current candidate while the old side runs historical code.
* A nonzero read marker is checked in storage and in painted progress before and after the swap.
* Proof mode has a mutation aimed at read-state loss.
* Every documented variable, option, port, fixture claim, and CI claim matches actual code.
* Focused tests are observed failing without the corrections and passing with them.

## Research Questions

| # | Question | Status |
|--:|----------|--------|
| Q1 | How does the current upgrade runner construct its old and new installs? | answered |
| Q2 | What reading state does it actually preserve and mutate? | answered |
| Q3 | Which maintainer instructions disagree with the runners and workflow? | answered |
| Q4 | What correction minimizes new machinery while proving the release promise? | answered |

## Prior Knowledge Gate

* Existing evidence reviewed: The completed parent Review, runner source, maintainer guide, workflow,
  package scripts, and successful release validation.
* Reused findings: RV-001 through RV-003 are direct, current, independently verified, and already
  routed to implementation.
* Research disposition: reused.
* Reason no new cycle ran: Wider, deeper, and contrarian comparison already occurred inside the
  completed one-pass Review. Repeating searches would not change the named defects or target set.

## Evidence Log

### Codebase Evidence

| ID | Claim / finding | Location (`path:line`) | Confidence |
|----|-----------------|------------------------|------------|
| C1 | Both disposable installs copy current `src` and differ only by a patched displayed version. | scripts/upgrade-check.mjs:101-110; scripts/upgrade-check.mjs:216-220 | high |
| C2 | The check imports an order and expects zero read issues before and after the swap. | scripts/upgrade-check.mjs:248-305 | high |
| C3 | The browser runner accepts MRT_PUPPETEER, MRT_EDGE, and `--only=`. | scripts/browser-check.mjs:53-89; scripts/browser-check.mjs:1864-1876 | high |
| C4 | The upgrade runner accepts `--prove`; no scenario selector exists. | scripts/upgrade-check.mjs:436-437; absent: any `--only` or scenario selector in scripts/upgrade-check.mjs, full-file search | high |
| C5 | The maintainer guide named different variables and `--scenario`, claimed port 8787 and committed upgrade snapshots, and said pull requests run browser journeys before this correction. | .copilot-tracking/reviews/logs/2026-08-21/major-release-docs-review.md:118-125 | high |
| C6 | CI runs deterministic Node checks but no installed-browser journey. | .github/workflows/ci.yml:26-140 | high |

### External Evidence

* None required. The correction is governed completely by repository behavior and the historical
  v1.2.0 Git object already available to the repository.

## Evidence Synthesis

| Question | Finding | Evidence IDs | Decision |
|----------|---------|--------------|----------|
| Q1 | The current "old" side is not historical code. | C1 | Materialize the old install from the committed v1.2.0 tree and the new install from the working candidate. |
| Q2 | No nonzero read marker is exercised. | C2 | Mark one known issue read, compare stored read state, require nonzero painted progress, and add a stripping mutation. |
| Q3 | Variables, flags, port, fixtures, and CI claims disagree. | C3-C6 | Rewrite the affected guide sections around the actual interfaces and pin them with semantic tests. |
| Q4 | Existing Git history, disposable directories, and the current Puppeteer harness are enough. | C1-C6 | Extend the current runner and tests rather than add dependencies or a second harness. |

## Alternatives

| Alternative | Disposition | Rationale |
|-------------|-------------|-----------|
| Commit a duplicate v1.2.0 application fixture | rejected | It duplicates a complete historical tree and can drift from the tag. |
| Fetch v1.2.0 from GitHub during the check | rejected | It adds network availability to a deterministic compatibility proof. |
| Seed only a hand-written storage object | rejected as sole proof | It proves schema parsing but not that the actual old release writes the state being upgraded. |
| Materialize the tagged tree with local Git | selected | It is byte-exact, offline, and already part of the release-history contract. |

## Risks and Contrarian Check

* A local Git materialization can accidentally include only `src` while missing the historical server;
  copy both from the tagged tree and continue using the disposable install boundary.
* A read-state mutation that changes only painted text would not prove storage loss detection; strip
  the stored marker or alter the new reader path so both storage and painted assertions expose it.
* Documentation tests that merely recognize npm script names will remain too weak; assert the exact
  supported variables and selector syntax and reject the retired names.
* A working tree may lack the v1.2.0 tag in a shallow clone. Fail loudly with a prerequisite result
  rather than silently falling back to current source.

## Parent Synthesis and Disposition

* Selected recommendation: Correct all three findings together by materializing the old install from
  local v1.2.0 Git history, exercising a nonzero read marker and its proof mutation, and aligning the
  maintainer guide plus semantic tests with actual runner interfaces.
* Research disposition: reused.
* Planning Readiness: Ready.
* Blockers: None. The required tag and runner interfaces are present in the current repository.
* Further research: None required before planning.

## Self-Check

* Brief, scope, non-goals, criteria, questions, evidence, alternatives, contrarian risks, disposition,
  and readiness are recorded.
* Every codebase claim has a workspace-relative citation.
* No source or product document was edited during Research.
