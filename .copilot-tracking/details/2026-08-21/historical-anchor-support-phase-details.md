<!-- markdownlint-disable-file -->
# RPI Phase Details: Historical Anchor Support

## Metadata

* Task ID: HAS-001
* Task slug: historical-anchor-support
* Related plan: .copilot-tracking/plans/2026-08-21/historical-anchor-support-plan.md
* Evidence sources: .copilot-tracking/research/2026-08-21/historical-anchor-support-research.md

## Phase Index

| Phase ID | Name | Status | Detail sections |
|---|---|---|---|
| P00 | Prove the behavior at the process boundary | Complete | P00, P00-T01, P00-T02 |
| P01 | Resolve historical targets from line provenance | Complete | P01, P01-T01, P01-T02, P01-T03 |
| P02 | Reconcile the evidence record and gates | Complete | P02, P02-T01, P02-T02, P02-T03, P02-T04 |
| P03 | Keep local-only evidence out of the canonical lock | Complete | P03, P03-T01, P03-T02, P03-T03 |

<!-- rpi:phase id=P00 -->
## P00: Prove the behavior at the process boundary

### Context

The requested behavior depends on real Git commits, working content, and clone depth. Existing unit
tests exercise the collector and comparison helpers well, but a pure object cannot prove that the
checker reads a target from the citation line's commit rather than from the current filesystem.

### Intent

Create a small disposable-repository harness and lock the semantic contract before implementation.

### Boundaries

* Included: At most five process tests, one workflow ownership test, and one shared fixture helper in
  the existing anchor test file.
* Excluded: New test frameworks, dependencies, repository fixtures, or tests that mutate this tree.

### Likely Targets

* `test/check-anchors.test.js`: Existing owner of anchor semantics.

### Dependencies

* Research decision and test ownership lock in the plan.

### Validation Expectations

* Run only the anchor test file first.
* Keep the checker change stashed while the new tests remain and observe every semantic test fail.
* Restore the checker and observe all targeted tests pass.

### Completion Evidence

* Five semantic process tests failed against the live-only checker and all 96 targeted tests pass
  with provenance enabled. The workflow ownership test also failed when full history was removed.

### Unresolved Items

* None.

<!-- rpi:phase id=P03 -->
## P03: Keep local-only evidence out of the canonical lock

### Context

An ignored dated artifact exists only in one working tree. The first implementation validated it and
also wrote its citations into the tracked lock, so the next clean checkout necessarily reported every
one removed.

### Intent

Preserve full local validation without letting untracked document identity enter portable state.

### Boundaries

* Included: Ignored dated artifacts, canonical lock membership, success reporting, promotion after
  tracking, process proof, records, and required gates.
* Excluded: Committed provenance, current product-document behavior, parent task artifacts, README.md,
  and a second Review mode.

### Likely Targets

* `scripts/check-anchors.mjs`: Document inventory and canonical comparison boundary.
* `test/check-anchors.test.js`: Existing ignored-artifact process case.

### Dependencies

* P02 complete and parent integration reproduction supplied.

### Validation Expectations

* The existing process case fails before the correction.
* Valid local-only citations resolve and report success without entering the lock.
* Invalid local-only citations remain fatal.
* Tracking the artifact promotes its citations into normal lock comparison.
* A clean clone passes with the portable lock.

### Completion Evidence

* The existing ignored-artifact process case proves validation, exclusion, clone portability,
  missing-target refusal, and promotion after tracking. The checker now keeps one document inventory
  with canonical, local-only, and combined views. All 96 anchor tests and all 1,294 repository tests
  pass, and the portable lock finishes with 1,017 unchanged canonical entries.

### Unresolved Items

* None.

<!-- rpi:task id=P03-T01 -->
### P03-T01: Prove the portable lock boundary

#### Intent

Extend the existing ignored-artifact process case before changing collection.

#### Completion Evidence

* Before the checker correction, the focused process test failed because bless wrote the local-only
  citation into the lock and did not report its exclusion. After the correction, that test passed.

#### Unresolved Items

* None.

<!-- rpi:task id=P03-T02 -->
### P03-T02: Separate validation-only and canonical occurrences

#### Intent

Fingerprint every local-only occurrence, then keep it outside canonical comparison and lock writing.

#### Completion Evidence

* Every document remains in syntax, source, fingerprint, coverage, relative, repeated, duplicate,
  collision, blank-edge, and missing-target validation. Only canonical occurrences reach lock
  comparison and writing, and successful runs state the local-only count and exclusion.

#### Unresolved Items

* None.

<!-- rpi:task id=P03-T03 -->
### P03-T03: Reconcile and validate the integration fix

#### Intent

Update the durable record and run the complete required gates on the final staged tree.

#### Completion Evidence

* Lint reports zero problems, all 1,294 tests pass, all stated counts agree, and the added-line dash
  scan reports zero. The anchor workflow re-aimed 46 current citations, read all 47 changed bless
  pairings, and finishes with 1,017 unchanged, zero drifted, zero new, and zero removed.

#### Unresolved Items

* None.

<!-- rpi:task id=P00-T01 -->
### P00-T01: Build one reusable Git fixture

#### Context

The publication gate tests already demonstrate the repository convention for temporary Git
repositories and shallow clones. The anchor tests can reuse that approach without sharing product
fixtures.

#### Intent

Provide concise helpers for repository initialization, commits, checker invocation, and cleanup.

#### Boundaries

* Included: Native Node filesystem and child-process APIs already used by the suite.
* Excluded: Shell-specific scripts, network access, and persistent files.

#### Likely Targets

* `test/check-anchors.test.js`: Helper and cleanup ownership.

#### Dependencies

* None beyond installed Git and Node.

#### Validation Expectations

* Fixture failures include command stderr and always clean their named temporary root.

#### Completion Evidence

* Five semantic tests use one helper and clean each named temporary repository after the assertion.

#### Unresolved Items

* None.

<!-- rpi:task id=P00-T02 -->
### P00-T02: Add and prove the semantic cases

#### Context

The acceptance matrix can be covered without one test per prose clause. One historical-versus-live
test can include target movement, deletion, extensionless membership, ranges, repeated heads, and
direct and nested dated paths. Separate assertions own new artifacts, malformed ranges, `--ref`,
shallow clones, targets missing in the source tree, and workflow depth.

#### Intent

Use no more than five process tests to prove all new behavior and fail under the current checker.

#### Boundaries

* Included: Historical and live divergence, source deletion, extensionless membership, direct and
  nested date classification, new artifact enrollment, malformed nonnumeric range refusal, mixed
  `--ref`, full and shallow clone behavior, source-target failure, and workflow ownership.
* Excluded: Duplicating existing pure tests for valid syntax, collision formatting, and scope
  identity.

#### Likely Targets

* `test/check-anchors.test.js`: Process-level semantic cases.

#### Dependencies

* P00-T01.

#### Validation Expectations

* Each test has a defect statement precise enough to identify what removing the implementation
  restores. The workflow test is also observed failing when full depth is removed from its fixture
  content.

#### Completion Evidence

* The changes record names the five process failures and the independently falsified workflow check.

#### Unresolved Items

* None.

<!-- rpi:phase id=P01 -->
## P01: Resolve historical targets from line provenance

### Context

The collector currently knows the document and line before fingerprinting, but passes only the
target path and coordinates. Research found that a single document can carry citations from several
commits, so provenance must be selected at the occurrence rather than document level.

### Intent

Thread exact provenance through collection and fingerprinting without changing membership, keys, or
comparison semantics.

### Boundaries

* Included: Structural dated-path classification, document-line provenance, source-specific
  extensionless membership, source-aware target reads, malformed-range detection, caching,
  diagnostics, and ignored new artifact discovery.
* Excluded: Lock-based bypasses, head search, content heuristics, and case lists.

### Likely Targets

* `scripts/check-anchors.mjs`: Complete implementation.

### Dependencies

* P00 semantic contract.

### Validation Expectations

* Targeted process tests pass.
* Existing anchor tests pass unchanged except for imports and the bounded process additions.

### Completion Evidence

* Every physical blame line is explicitly accounted for, the synthetic trailing split line is marked
  active, and collection has no missing-slot fallback. Malformed refusal uses the same fixed-extension
  and source-member path classes as collection on prose and code lines.

### Unresolved Items

* None.

<!-- rpi:task id=P01-T01 -->
### P01-T01: Classify source semantics and discover new artifacts

#### Context

A path is historical by repository convention when it is below `.copilot-tracking/` and any
directory segment below that root is a complete `YYYY-MM-DD` date. The category and nesting depth do
not matter. A line is historical only when Git attributes it to a real commit. Current product
documents and all-zero uncommitted lines remain active-tree claims.

#### Intent

Produce one source value and one source-specific known-path set per collected historical line, and
include untracked new dated artifacts in working runs even when the tracking-root ignore rule
matches them.

#### Boundaries

* Included: One blame invocation per dated artifact at most, known paths cached by source,
  line-count validation, and explicit collection faults.
* Excluded: Applying provenance to current product documents.

#### Likely Targets

* `scripts/check-anchors.mjs`: Document discovery and provenance map.

#### Dependencies

* Full history for committed historical lines.

#### Validation Expectations

* A moved unchanged line retains its commit; an edited line and a path absent from HEAD use the
  active tree.
* Direct and nested dated artifacts use provenance, while an undated tracking file and product
  document do not.
* An extensionless target absent from the live tree remains a collected citation when it existed in
  the citation source tree.
* A blame result that cannot account for every current document line is fatal.

#### Completion Evidence

* One mixed-source test distinguishes two committed line origins, an edited line, and a new target;
  a separate ignored-artifact assertion covers a new document before staging. The same test directly
  proves an interior blame hole is fatal and the trailing split sentinel is active.

#### Unresolved Items

* None.

<!-- rpi:task id=P01-T02 -->
### P01-T02: Fingerprint from the selected source

#### Context

The existing reader caches by target path. Historical targets require a cache key containing both
source and path, while current targets retain filesystem or named-ref behavior. The collector also
needs a narrow detector for a path and numeric range start followed by a nonnumeric range end, the
known malformed shape that otherwise disappears before coverage.

#### Intent

Read exact target coordinates from the selected tree and preserve all existing validation.

#### Boundaries

* Included: Current tree, named ref, commit source, binary detection, valid ranges, nonnumeric range
  refusal, missing paths, and source-aware diagnostics.
* Excluded: Searching other commits when the selected source lacks the target.

#### Likely Targets

* `scripts/check-anchors.mjs`: Read cache, lines, fingerprint, and collection call.

#### Dependencies

* P01-T01.

#### Validation Expectations

* Later target movement and deletion do not affect committed historical citations.
* A target absent at the source is unresolvable.
* Repeated head lines have no effect because no search occurs.
* A malformed nonnumeric range end is fatal before check and bless comparison.

#### Completion Evidence

* Process tests cover historical success, malformed refusal in check and bless modes for fixed
  extensions, extensionless paths, and inline code, source-target failure, ranges, repeated heads,
  and source-specific extensionless membership.

#### Unresolved Items

* None.

<!-- rpi:task id=P01-T03 -->
### P01-T03: Refuse missing provenance

#### Context

Git blame in a shallow clone can attribute content to the shallow boundary. That is a plausible
commit ID, not proof that the true line origin is available.

#### Intent

Stop before collection can report a clean historical result from incomplete history, and pin the
existing CI checkout that provides it.

#### Boundaries

* Included: Shallow repository detection, blame/read failures, mixed `--ref` process behavior, and a
  workflow assertion locating the one anchor-owning job and its full-depth checkout.
* Excluded: Fetching history automatically or degrading to the active tree.

#### Likely Targets

* `scripts/check-anchors.mjs`: Provenance readiness and fatal diagnostic.

#### Dependencies

* P01-T01.

#### Validation Expectations

* Full clone passes and shallow clone fails with the remedy.
* `--ref` resolves current documents at the named revision and dated artifact lines at their
  reachable source commits.
* Removing full depth from the anchor-owning workflow fixture fails its ownership assertion.

#### Completion Evidence

* The full repository passes, its depth-one clone fails with the full-history remedy, and the
  anchor-owning workflow assertion fails when its checkout depth is changed from full to shallow.

#### Unresolved Items

* None.

<!-- rpi:phase id=P02 -->
## P02: Reconcile the evidence record and gates

### Context

Changing target sources deliberately changes historical fingerprints, including two current lock
entries that research proved are paired with unrelated live content. Infrastructure work is also a
notable maintainer change and needs backlog and changelog records.

### Intent

Make the durable record agree with the implementation, inspect every changed pairing, and verify the
complete repository.

### Boundaries

* Included: HAS-001 changes record, BL-182, changelog, plan status, pre-bless validation, lock bless,
  repeated final gates, and dash scan.
* Excluded: README.md, release documentation, tags, releases, and unrelated backlog work.

### Likely Targets

* `.copilot-tracking/changes/2026-08-21/historical-anchor-support-changes.md`: Implementation evidence.
* `PRODUCT_BACKLOG.md`: BL-182 row and detail block.
* `CHANGELOG.md`: Unreleased maintainer-facing entry.
* `docs/anchors.lock.json`: Generated source-aware fingerprints.

### Dependencies

* P01 complete, every red proof recorded, and targeted tests green.

### Validation Expectations

* Pass lint and the complete test suite before the deliberate anchor cycle.
* Stage all new dated artifacts before the deliberate anchor cycle.
* Read every bless pairing against the claim it prints.
* Final anchors report zero drift, zero new, and zero removed.
* Repeat lint, the complete suite, anchors, and the dash scan on the unchanged final tree.
* Any edit after pairing inspection invalidates that inspection and returns to pre-bless validation.

### Completion Evidence

* The complete anchor workflow and required gates repeated on the corrected tree after RV-001 and
  RV-002.

### Unresolved Items

* None.

<!-- rpi:task id=P02-T01 -->
### P02-T01: Record implementation divergence and completion

#### Context

The changes record explains planned work and any departures. The backlog and changelog describe the
shipped infrastructure without referring product readers to tracking artifacts.

#### Intent

Create one coherent durable record after behavior is known.

#### Boundaries

* Included: One BL-182 row and detail block, one Unreleased entry, plan and detail status.
* Excluded: Counts or claims not re-derived from the final tree.

#### Likely Targets

* `PRODUCT_BACKLOG.md`, `CHANGELOG.md`, and HAS-001 planning and changes artifacts.

#### Dependencies

* Actual implementation and test results.

#### Validation Expectations

* Re-derive every count in touched sections and scan for the old values when a count changes.

#### Completion Evidence

* Records agree on scope, behavior, and verification.

#### Unresolved Items

* None.

<!-- rpi:task id=P02-T02 -->
### P02-T02: Pass pre-bless validation

#### Context

A lock inspection describes one exact tree. Discovering a lint or suite failure after bless can
force an edit and make that inspection stale.

#### Intent

Finish semantic proof, lint, and the complete suite before accepting generated evidence.

#### Boundaries

* Included: Targeted green run, red-without-fix record, lint, and full tests.
* Excluded: Blessing before those results are green.

#### Likely Targets

* Whole canonical tree before lock generation.

#### Dependencies

* P02-T01 and all implementation edits complete.

#### Validation Expectations

* Targeted, lint, and full-suite results are green and recorded.

#### Completion Evidence

* Targeted tests pass 96 of 96, complete tests pass 1,294 of 1,294, lint reports zero
  problems, and all derived backlog counts agree before lock inspection.

#### Unresolved Items

* None.

<!-- rpi:task id=P02-T03 -->
### P02-T03: Inspect and bless the source-aware lock

#### Context

The generated lock will replace live-tree fingerprints for historical occurrences and add the new
HAS-001 citations. A green result is not sufficient until each changed pairing is read.

#### Intent

Use the repository's inspect, bless, and final-check sequence without editing historical citations.

#### Boundaries

* Included: Deliberate source-driven lock changes only.
* Excluded: Re-aiming historical artifact text or blessing unresolved targets.

#### Likely Targets

* `docs/anchors.lock.json`.

#### Dependencies

* P02-T02 complete and all canonical files staged.

#### Validation Expectations

* Initial anchors identify only intended drift or additions.
* Bless prints one record per changed occurrence.
* Final anchors report zero across all change categories.
* No file changes between the pairing print and final anchor check.

#### Completion Evidence

* All 108 first-pass pairings were read. Four unsupported new critique citations were removed after
  that read exposed their missing candidate-plan provenance, validation repeated, and the second
  bless removed those entries without changing any surviving pairing. Final coverage is 1,017
  unchanged anchors with zero drift, additions, or removals. After Review corrections, 48 changed
  pairings were read, including 47 current-document re-aims and one containing-range fingerprint,
  then the same 1,017-entry lock passed with zero drift, additions, or removals.

#### Unresolved Items

* None.

<!-- rpi:task id=P02-T04 -->
### P02-T04: Repeat complete validation on the unchanged tree

#### Context

The repository requires lint, all tests, and anchors. This change also owns targeted process tests,
performance against the two-minute step, and the added-line dash scan.

#### Intent

Verify implementation, records, and generated evidence together after the lock is finalized.

#### Boundaries

* Included: Existing commands only.
* Excluded: Live metadata contract checks, browser checks, and publication, which this infrastructure
  change does not affect.

#### Likely Targets

* Whole changed tree.

#### Dependencies

* P02-T03.

#### Validation Expectations

* No gate failure, malformed citation, unexpected near miss, dash, or out-of-scope file change.
* If any edit is required, return to P02-T02 and repeat inspection and bless before continuing.

#### Completion Evidence

* On the staged post-bless tree, lint reported zero problems, all 1,294 tests passed, all derived
  counts agreed, anchors reported 1,017 unchanged with zero drift, additions, or removals, and the
  added-line scan found zero forbidden dashes.

#### Unresolved Items

* None.
