<!-- markdownlint-disable-file -->
# RPI Changes: Historical Anchor Support

## Metadata

* Task ID: HAS-001
* Related plan: .copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/historical-anchor-support-phase-details.md
* Implementation date: 2026-08-21

## Execution Status

* Status: Complete after Review
* Declared invocation scope: Full plan
* Completed scope markers: P00, P00-T01, P00-T02, P01-T01, P01-T02, P01-T03, P01, P02-T01,
  P02-T02, P02-T03, P02-T04, P02
* All remaining active-plan markers: none
* Status basis: Review completed with RV-001 and RV-002, both High implementation defects within the
  approved design. Both are corrected and every reopened validation marker is complete.

## Execution Summary

The checker now selects target content per citation occurrence. Committed lines in dated tracking
artifacts read targets from their Git origin commits, while current documents and uncommitted lines
use the active tree. Source-specific path membership preserves extensionless historical targets,
ignored new dated artifacts enter the corpus before staging, and missing or incomplete provenance
fails instead of falling back.

## Completed Work

### P00: Process boundary proof

* Added one reusable temporary Git repository harness, five semantic process tests, and one workflow
  ownership test in the existing anchor test owner.
* The five semantic tests produced five failures against the live-only checker: historical source
  selection, deleted extensionless membership, ignored new artifacts plus malformed ranges, shallow
  history refusal, and missing source-target refusal.
* The workflow assertion passed on the real configuration, then failed alone when full checkout
  depth was temporarily changed to shallow and passed again after restoration.

### P01: Per-citation historical provenance

* Added structural dated-path classification for a complete date directory at any depth below the
  tracking root.
* Added one cached blame map per committed dated artifact. Real commit IDs select historical trees;
  all-zero edited lines and artifacts absent from the selected commit use the active tree.
* Keyed known-path sets and target text by source. Historical deletion and extensionless membership
  no longer depend on the live tracked-file set.
* Added ignored untracked dated-artifact discovery for working runs and fatal checks for malformed
  range ends, shallow history, incomplete blame, and unreadable source trees.
* Kept occurrence keys, range checks, fingerprints, loss detection, collision behavior, and named
  revision comparison unchanged.

### P01 Review corrections

* Replaced sparse-array iteration with an explicit physical-line check, marked only the synthetic
  trailing split line active, and removed collection's missing-source fallback.
* Made malformed-range refusal mirror collection: fixed-extension targets plus source-member
  extensionless targets, backticked forms on every code line, and bare forms only in prose.
* Extended the existing bounded process tests without adding a sixth semantic process test.

### P02-T01: Infrastructure records

* Added the Unreleased maintainer entry and BL-182 as one shipped infrastructure item.
* Updated the plan and details to mark P00, P01, and P02-T01 complete.

## Implementation-Time Plan and Detail Updates

### Applied the single critique before implementation

* Affected plan area or markers: Acceptance criteria, test ownership, P00, P01, and P02.
* What changed: Added source-specific extensionless membership, malformed-range refusal, mixed
  `--ref` coverage, full-history workflow ownership, a depth-independent dated-path predicate, and
  pre-bless validation.
* Why: PC-001 through PC-005 identified direct gaps under confirmed caller requirements.
* Triggering evidence: The only final-candidate plan critique.
* User answer or decision: None needed; all findings were direct planner corrections.
* Reconciliation performed: Executive summary, scope, requirements, acceptance criteria, task
  wording, details, dependencies, critique dispositions, and handoff are current.
* Planning and critique state: Ready. PC-001 through PC-005 are resolved and no second critique will
  run.

### Included ignored new tracking artifacts

* Affected plan area or markers: Scope, functional requirements, P01, and P01-T01.
* What changed: New dated artifacts are discovered even when the repository's tracking-root ignore
  rule matches them.
* Why: A direct Git probe showed that every new tracking artifact is ignored by construction, so the
  candidate's "non-ignored" wording would have left the required new-artifact path empty.
* Triggering evidence: `git ls-files --others` listed the new changes artifact while
  `git ls-files --others --exclude-standard` listed none.
* User answer or decision: Existing caller requirement to handle untracked new artifacts.
* Reconciliation performed: Scope, functional requirement, P01 boundary, and P01-T01 detail now use
  the actual repository convention.
* Planning and critique state: Immediately relevant factual correction within approved intent; no
  planning reconsideration or second critique required.

### Re-derived live backlog and governance counts

* Affected plan area or markers: P02-T01 and P02-T02.
* What changed: Adding BL-182 moved five live rank claims by one place and increased the governance
  detail-block and constraint-gate counts by one. All derived values now match the 156 ranked rows,
  161 detail blocks, 135 shipped items, and 155 recorded constraint checks.
* Why: The first complete test run correctly rejected the stale figures created by the new required
  infrastructure row.
* Triggering evidence: Seven complete-suite failures and eleven direct count-gate findings.
* User answer or decision: None; each replacement is mechanically derived from the final table.
* Reconciliation performed: The five live ranks, one unlabelled-item count, opening shipped count,
  shipped ID list, and governance totals are current. Historical frozen figures remain unchanged.
* Planning and critique state: Immediately relevant correction inside the approved records scope.

### Established the Git provenance boundary

* Affected plan area or markers: P01 and P02-T03.
* What changed: Committed the research, plan, details, and only critique as 57f0e97 before committing
  the checker implementation.
* Why: Those new artifacts were authored against the pre-implementation tree. Giving their lines a
  real source commit lets the mechanism preserve that evidence rather than pairing their research
  claims with source code changed later in the same commit.
* Triggering evidence: The first source-aware inspection correctly treated every still-uncommitted
  artifact line as current, which exposed the missing provenance boundary before bless.
* User answer or decision: Existing requirement that historical records keep the tree they record.
* Reconciliation performed: The four planning artifacts now blame to the tree they assessed. The
  implementation record stays with the implementation commit.
* Planning and critique state: This is the selected provenance design applied to the task's own
  evidence, not a scope or architecture change.

### Removed unsupported candidate-plan citations

* Affected plan area or markers: P02-T03.
* What changed: Removed four new citations from three critique findings and stated that their exact
  pre-correction plan candidate was not committed separately.
* Why: Pairing inspection showed that the citations resolved against the corrected plan committed
  later, which contradicted the gaps the critique had actually observed. No clone-stable provenance
  source exists for the earlier in-memory candidate.
* Triggering evidence: The first bless print paired PC-002, PC-003, and PC-005 with corrected plan
  passages rather than with the deficient candidate described by each finding.
* User answer or decision: Existing requirement to fail loudly rather than silently preserve or
  invent evidence when history is missing.
* Reconciliation performed: The findings and dispositions remain complete, their source-code and
  test citations remain historical where a source commit exists, and the unavailable candidate
  boundary is now explicit rather than represented by false anchors.
* Planning and critique state: Evidence correction only; the critique count, verdict, findings, and
  applied dispositions are unchanged.

### Re-aimed only current evidence

* Affected plan area or markers: P02-T03.
* What changed: Re-aimed 75 citations in current documents after the checker, backlog, changelog,
  and tests moved their targets. No pre-existing dated artifact was edited.
* Why: Current product and governance documents remain claims about the active tree and must follow
  their targets before blessing.
* Triggering evidence: Exact lock heads and staged zero-context diff arithmetic agreed for every
  mapping. One repeated source head was resolved by the arithmetic to the comment-processing site
  its claim names.
* User answer or decision: Existing full anchor-workflow requirement.
* Reconciliation performed: The first inspection reported 913 unchanged, 5 intentional historical
  fingerprint migrations, 103 additions, and 75 removals over 1,021 occurrences. The five historical
  source ranges were read at their attributed commits and match their unchanged claims.
* Planning and critique state: Expected generated-record migration within P02-T03.

### Implementing routed Review defects

* Affected plan area or markers: P01-T01, P01-T02, P01, P02-T02, P02-T03, P02-T04, and P02.
* What changed: Review found that sparse blame arrays bypass the intended completeness check and that
  malformed-range detection covers fewer path and code-line forms than citation collection.
* Why: Either gap can turn missing provenance or malformed evidence into a false clean result.
* Triggering evidence: RV-001 and RV-002 in the canonical HAS-001 review.
* User answer or decision: None needed. Both are defects inside explicit fail-loud and corpus
  completeness requirements.
* Reconciliation performed: Affected markers and phase status are reopened before source edits. The
  single critique remains final and no planning reconsideration is required.
* Planning and critique state: Approved intent unchanged; RV-001 and RV-002 are corrected.

### Repeated the anchor workflow after Review

* Affected plan area or markers: P02-T02, P02-T03, P02-T04, and P02.
* What changed: Re-aimed 47 current-document citations after the checker correction moved their
  targets. One backlog range retained its coordinates but changed fingerprint because it contains one
  of those re-aims.
* Why: Current documents continue to describe the active tree; dated historical artifacts remained
  untouched.
* Triggering evidence: The corrected-tree inspection reported 970 unchanged and 47 drifted entries.
* User answer or decision: Existing anchor workflow applies.
* Reconciliation performed: Exact prior-lock heads and diff-hunk arithmetic agreed for all 47
  coordinate moves. All 48 bless pairings were read against their claims. The final 1,017-entry lock
  reports zero drift, additions, or removals.
* Planning and critique state: Expected completion work within P02.

## Validation Record

| Check | Scope | Status | Evidence or reason |
|---|---|---|---|
| Baseline anchors | Repository before source edits | Passed | 993 unchanged, zero drift, zero new, zero removed |
| Targeted anchor tests | P00 and P01 | Passed | 96 passed, zero failed |
| Red-without-fix proof | New checks | Passed | Five semantic tests failed under the old checker; workflow ownership failed with shallow depth |
| Review red proof, blame | RV-001 | Passed | The source-selection test failed with "Missing expected exception" when explicit slot accounting was removed |
| Review red proof, extensionless malformed | RV-002 | Passed | The malformed process test failed because NOTICE was absent when source-member matching was removed |
| Review red proof, inline malformed | RV-002 | Passed | The malformed process test failed because BROKEN.js was absent when code-line matching was narrowed to comment-leading lines |
| Routed Review tests | RV-001 and RV-002 | Passed | Both focused process tests passed; complete anchor owner passed 96 of 96 |
| Review-correction anchor inspection | P02-T03 | Passed | 47 current citations re-aimed; 48 changed pairings read against their claims |
| Review-correction final anchors | P02-T03 | Passed | 1,017 unchanged, zero drifted, zero new, zero removed |
| Review-correction lint | P02-T04 | Passed | Zero problems |
| Review-correction complete tests | P02-T04 | Passed | 1,294 passed, zero failed |
| Review-correction counts | P02-T04 | Passed | 156 ranked rows, 161 blocks, every stated figure agrees |
| Review-correction dash scan | P02-T04 | Passed | Zero em dash or en dash additions |
| Targeted lint | Checker and test owner | Passed | Zero problems |
| Real corpus probe | Final 1,017 collected occurrences | Passed instrument execution | No fatal, malformed, blank-edge, or coverage fault |
| Lint | Changed tree | Passed | Zero problems |
| Complete test suite | Changed tree | Passed | 1,294 passed, zero failed |
| Derived counts | Backlog and prose records | Passed | 156 ranked rows, 161 blocks, every stated figure agrees |
| First anchor inspection and bless | 1,021 occurrences | Corrected after content review | All 108 pairings read; four unsupported new critique citations identified and removed |
| Second anchor inspection and bless | 1,017 occurrences | Passed | 1,017 unchanged before four removals; surviving pairings unchanged while the lock dropped those four |
| Post-bless lint | Unchanged staged tree | Passed | Zero problems |
| Post-bless complete test suite | Unchanged staged tree | Passed | 1,294 passed, zero failed |
| Final anchors | Unchanged staged tree | Passed | 1,017 unchanged, zero drifted, zero new, zero removed |
| Added-line dash scan | Diff from origin/main | Passed | Zero em dash or en dash additions |

## Post-Review Reconciliation

* Plan markers and phase details: Every P00 through P02 marker is complete.
* Completed-work evidence and handoff prose: Current through the routed Review corrections and
  repeated gates.
* Validation, blockers, remaining work, and follow-up items: Current below.
* Review readiness: Review complete; both routed findings resolved without a second review.

## Blockers

* None.

## Remaining Work

* None in the implementation plan.

## Follow-Up Items

* Canonical plan list: .copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md,
  `## Follow-Up Items`
* None.

## Return-to-Caller State

* Implementation execution status: Complete after Review
* Declared scope and markers: Full plan; every P00 through P02 marker complete.
* Validation coverage: Review red proofs, 96 targeted tests, zero lint problems, 1,294 complete
  tests, derived counts, 1,017 unchanged anchors, and zero forbidden dashes.
* Blockers: none.
* Current plan and detail updates: PC-001 through PC-005 resolved before source work.
* Planning and critique state: Ready after exactly one critique.
* Follow-up items: none.
* Review readiness or no-handoff reason: Review is complete and both routed findings are resolved.
* Continuation owner: Confirmed automatic RPI Agent.
