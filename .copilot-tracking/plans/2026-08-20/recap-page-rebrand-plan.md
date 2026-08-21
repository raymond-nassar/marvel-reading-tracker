<!-- markdownlint-disable-file -->
# RPI Plan: Recap Page rebrand

## Task Metadata

* Task ID: MRT-002
* Task slug: recap-page-rebrand
* Planning status: Final candidate
* Plan date: 2026-08-20
* Phase details: .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-20/recap-page-rebrand-plan-critique.md

## Executive Summary

This plan will carry the selected Recap Page identity through the running app, install metadata,
downloaded files, current documentation, and the GitHub repository. It will also replace the
red-tile M with a folded-page mark and correct the short metadata attribution. The implementation
will preserve the two old identifiers that are compatibility contracts: the versionless Windows
zip filename and every `mrt.*` browser-storage key.

### User Decisions and Requirements Highlights

* BL-161 through BL-164 ship as one cohesive rebrand.
* The product and GitHub repository are renamed together, and the repository slug becomes
  `recap-page`.
* The caller's explicit repository-name and slug selections authorize that exact external action;
  automatic mode stops only if the objective preflight or mutation fails.

### What You May Not Know

* GitHub redirects old repository traffic after a rename, but it does not translate release asset
  filenames. The repository path changes while `marvel-reading-tracker-windows.zip` stays fixed.
* Changing the manifest's display name does not move the installed app or its saved progress because
  its identity, start path, scope, origin, and `mrt.*` keys stay unchanged.

### Unresolved Decisions or Blockers

* None.

For current user input, see [User Decisions and Requirements](#user-decisions-and-requirements).

## User Decisions and Requirements

* Implement BL-161, BL-162, BL-163, and BL-164 as one cohesive rebrand.
* Use Recap Page as the product name and `recap-page` as the GitHub repository slug.
* Rename both the tracked product and the GitHub repository in this task.
* Ask material questions before the user steps away, then continue automatically through the full
  RPI loop.
* Preserve installed-copy updates, local reading progress, and old backup imports.
* Follow the repository's eleven standing constraints and one-major-feature boundary.

## Goals

* Give the app a distinct Recap Page identity across every current product and repository surface.
* Replace the Marvel-like icon construction with one shared, reviewable folded-page mark.
* Make metadata provenance accurate without implying use of Marvel's official API agreement.
* Preserve installed-copy update, PWA identity, backup, and local-storage compatibility.
* Close BL-161, BL-163, and BL-164 with direct evidence and focused regression coverage; leave
  BL-162 Ready solely for Microsoft Store reservation/listing.

## Scope and Non-Goals

### In Scope

* Current visible names, install metadata, icon source and exports, package and backup labels,
  packaging labels, short attribution copy, repository URLs, installation instructions, current
  product documentation, tests, backlog status, changelog, and the external repository rename.
* Verification of old and new update and download routes after the rename.

### Non-Goals

* Renaming `marvel-reading-tracker-windows.zip`.
* Renaming any `mrt.*` key, changing the fixed origin, or changing manifest identity paths.
* Rewriting historical RPI artifacts, old release entries, or design mockups.
* Revisiting the selected product name, adding a store listing, or introducing a runtime dependency.

## Functional Requirements

* Current user-facing and install surfaces identify the app as Recap Page, with `Recap` used only
  as the manifest's space-limited short name.
  * Observable acceptance criteria: Browser, rail, fallback heading, server, manifest, packaged
    readme, backup labels, and current docs no longer present the old product name.
* One folded-page mark appears in the rail, favicon, and both generated PNG sizes.
  * Observable acceptance criteria: All four surfaces resolve to one generator-owned geometry and
    the committed PNGs match it pixel for pixel.
* Short attribution surfaces state “Marvel metadata via marvel.emreparker.com.”
  * Observable acceptance criteria: Both repeated short surfaces use that copy and the detailed
    About provenance remains consistent.
* New code and documentation use the `raymond-nassar/recap-page` repository path.
  * Observable acceptance criteria: Current update, release-note, clone, issue-template, browser
    scenario, and release-reference links use the new path.
* Old installed copies and old backups remain usable.
  * Observable acceptance criteria: The old release asset filename remains fixed, old-label backups
    validate, and every storage and manifest identity key remains unchanged.

## Non-Functional Requirements

* No new browser runtime dependency.
  * Objective threshold or evaluation condition: Package runtime dependency count remains zero.
  * Observable acceptance criteria: Icon generation continues to use Node built-ins only.
* Icon contrast and geometry remain reviewable and deterministic.
  * Objective threshold or evaluation condition: Existing palette gate passes and icon pixel tests
    bind static colors to the established palette.
  * Observable acceptance criteria: Favicon, rail, 192px, and 512px marks are visibly the same.
* Repository rename compatibility is proven against the real repository.
  * Objective threshold or evaluation condition: Old and new API, release, download, and clone
    routes resolve after the rename, and the local remote points to the new URL.
  * Observable acceptance criteria: No compatibility claim depends only on reasoning or a redirect
    assumption.
* All repository gates remain green.
  * Objective threshold or evaluation condition: Lint reports zero, tests report zero failures,
    anchors report zero drift/new/removed after the reviewed bless, and counts, sizes, palette, and
    publication checks pass.
  * Observable acceptance criteria: The final changes record carries the measured results.

## Acceptance Criteria

* BL-161, BL-163, and BL-164 are marked Shipped with evidence in their detail blocks.
* BL-162 remains Ready with only Microsoft Store reservation/listing acceptance outstanding.
* Recap Page is the current name everywhere classified as a live identity surface.
* The folded-page icon replaces the red-square M in the rail, favicon, and PNG exports.
* The old attribution formula is absent from current short surfaces.
* `raymond-nassar/recap-page` is the repository path in current links and update constants.
* `marvel-reading-tracker-windows.zip`, all `mrt.*` keys, and manifest identity paths are unchanged.
* Old backups import and installed-copy update/download routes work after the repository rename.
* No historical evidence surface is rewritten merely to erase the old name.
* Existing targeted checks fail when each protected change is locally reverted, then pass with the
  implementation restored.
* Full repository and browser validation passes.

## Candidate Change and Test Lock

* Exact file removals: none.
* Exact test removals: none.
* Exact additions: one generated product file, `src/icons/icon.svg`; zero new test files; exactly
  two new `test()` blocks. Existing test blocks may gain focused assertions.
* New test block allocation:
  * `test/app-icons.test.js`: One generated SVG/source and favicon/rail consumer-linkage block.
  * `test/shipped-copy.test.js`: One current Recap Page identity and short-attribution block.
  * Every other planned assertion extends its existing owning block.
* Canonical icon source: normalized 32 by 32 geometry and fixed dark-palette colors exported by
  `scripts/build-icons.mjs`.
* Generated icon targets: `src/icons/icon.svg`, `src/icons/icon-192.png`, and
  `src/icons/icon-512.png`.
* Icon consumers: favicon and rail use the generated SVG; the manifest uses both PNGs.
* Semantic test ownership:
  * `test/app-icons.test.js`: Folded-page structure and palette, generated-target parity, exact
    manifest name and short name, favicon and rail linkage.
  * `test/shipped-copy.test.js`: Exact current visible identity and both short attribution surfaces.
  * `test/updateCheck.test.js`: Exact new repository owner/slug and fixed archive basename as
    independent assertions.
  * `scripts/browser-check.mjs`: Installed-update UI and real visible copy.
* Regression-only test ownership:
  * `test/packaging.test.js`: Packaged title and folder change while archive basename stays fixed.
  * `test/model.test.js`: New export label and an old `app: "marvel-reading-tracker"` backup import.
  * `test/intake-config.test.js`: Current issue-link prefix and non-vacuity.
  * `test/server-contract.test.js`: Package-leak assertion derives the nonempty live package name.
  * `test/storage.test.js`: Exact primary key plus existing recovery-key coverage.
  * `test/app-icons.test.js`: Manifest `id`, `start_url`, and `scope` remain `/`.
* Prohibited weak coverage: No global old-name absence test, no second PNG regeneration test, no
  duplicate broad storage-behavior test, and no assertion that compares a renamed constant only
  with itself.
* Validation evidence:
  * Generate icons, run all named focused tests together, run palette and a real Windows package
    build, then inspect the archive for `src/icons/icon.svg` and run browser and mutation proofs.
  * Add `src/icons/icon.svg` to the index before the packaging assertion, real package build, archive
    inspection, or first anchors run because both the packer and anchors enumerate tracked files.
  * Prove each strengthened assertion fails under the smallest relevant local revert.
  * Run lint, the complete test suite, counts, sizes, publication, anchors, reviewed anchors bless,
    and anchors again.
  * After the external rename, verify old and new API, release, asset, clone, and fetch routes, then
    rerun final tests, browser checks, counts, and anchors before backlog closure.

## Implementation Context Record

| Context item | Current artifact or record |
|---|---|
| Plan | .copilot-tracking/plans/2026-08-20/recap-page-rebrand-plan.md |
| Phase details | .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md |
| Latest critique | .copilot-tracking/reviews/plans/2026-08-20/recap-page-rebrand-plan-critique.md, Complete with all dispositions resolved |
| Relevant research | .copilot-tracking/research/2026-08-20/recap-page-rebrand-research.md |
| Changes-record role | .copilot-tracking/changes/2026-08-20/recap-page-rebrand-changes.md is created by implementation |
| Planning execution and readiness | Final after complete research, one critique, and resolved dispositions |
| Continuation context | Confirmed automatic RPI Agent |

## Sources

* .copilot-tracking/research/2026-08-20/recap-page-rebrand-research.md: Complete Wider,
  Deeper, and Contrarian evidence, decisions, compatibility boundaries, and readiness.
* PRODUCT_BACKLOG.md, BL-161 through BL-164: Required outcomes and owner-approved name decision.
* User decisions on 2026-08-20: Cohesive scope, repository rename, `recap-page` slug, and automatic
  mode.

## Phase Checklist

<!-- rpi:phase id=P01 -->
### [x] P01: Establish the shared Recap Page identity

* Intent: Replace the old current identity and icon while preserving historical evidence.
* Dependencies: Complete research and confirmed name.

<!-- rpi:task id=P01-T01 -->
#### [x] P01-T01: Replace the icon with one shared folded-page mark

* Requirement and evidence: BL-161; research C8, C14, C15, and C22.
* Expected result: Rail, favicon, and generated PNGs use one deterministic mark and palette.
* Detail section: P01-T01 in .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md

<!-- rpi:task id=P01-T02 -->
#### [x] P01-T02: Rename current product and maintenance labels

* Requirement and evidence: BL-162; research C2 through C4, C7, C10 through C12, and C17.
* Expected result: Current source, manifest, package, backup, packaging, and documentation labels
  say Recap Page or use `recap-page`.
* Detail section: P01-T02 in .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md

<!-- rpi:phase id=P02 -->
### [x] P02: Correct provenance and protect compatibility

* Intent: Make the short attribution accurate and lock every compatibility boundary with tests.
* Dependencies: P01.

<!-- rpi:task id=P02-T01 -->
#### [x] P02-T01: Replace the borrowed API attribution

* Requirement and evidence: BL-163; research C13.
* Expected result: Both short surfaces name Marvel as origin and marvel.emreparker.com as the route.
* Detail section: P02-T01 in .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md

<!-- rpi:task id=P02-T02 -->
#### [x] P02-T02: Update repository URLs while pinning old contracts

* Requirement and evidence: BL-164; research C5, C6, C9, C11, C16 through C20, C23, C24, and W1-W3.
* Expected result: New repository paths work, the old release asset and storage identities remain,
  and focused tests prove both.
* Detail section: P02-T02 in .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md

<!-- rpi:phase id=P03 -->
### [x] P03: Prepare product records and prove the tracked change

* Intent: Update current product records that do not depend on the external result and validate the
  source tree before the rename.
* Dependencies: P01 and P02.

<!-- rpi:task id=P03-T01 -->
#### [x] P03-T01: Update current documentation and changelog

* Requirement and evidence: Repository release and backlog rules; research C7, C18, and C21.
* Expected result: Current docs and links follow Recap Page, historical records remain intact, and
  the backlog has final text prepared without claiming the rename proof has run.
* Detail section: P03-T01 in .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md

<!-- rpi:task id=P03-T02 -->
#### [x] P03-T02: Run targeted proofs and full internal gates

* Requirement and evidence: Repository gate and fail-before-fix rules.
* Expected result: Focused tests are proven meaningful and all internal gates pass before the
  external rename.
* Detail section: P03-T02 in .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md

<!-- rpi:phase id=P04 -->
### [x] P04: Rename the repository, close the backlog, and verify continuity

* Intent: Perform the confirmed external rename safely and verify both old and new routes.
* Dependencies: P03 and the confirmed 2026-08-20 caller authorization.

<!-- rpi:task id=P04-T01 -->
#### [x] P04-T01: Rename the GitHub repository to recap-page

* Requirement and evidence: Confirmed caller decision; W1 through W3.
* Expected result: The external repository name and local remote both use `recap-page`.
* Detail section: P04-T01 in .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md

<!-- rpi:task id=P04-T02 -->
#### [x] P04-T02: Verify redirects, close the backlog, and finalize

* Requirement and evidence: BL-164 and repository verification rules.
* Expected result: Old installed-copy API and download URLs resolve, new URLs resolve directly, the
  old asset filename still downloads, BL-161, BL-163, and BL-164 are Shipped with measured
  evidence, BL-162 records its Store-only remainder, and final gates remain green.
* Detail section: P04-T02 in .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md

## Dependencies

* Existing v1.2.0 release asset: The compatibility check needs the real
  `marvel-reading-tracker-windows.zip`.
* GitHub repository admin permission: Required for the external rename.
* Confirmed caller authorization: The user selected the repository rename and exact `recap-page`
  slug on 2026-08-20.
* Existing icon generator, palette gate, and focused tests: Canonical owners of generated and
  regression evidence.

## Critique Disposition

| Critique run and finding | Disposition | Plan response or residual risk |
|---|---|---|
| PC-001, track the SVG before package and anchors validation | resolved | P03-T02 now orders generation, index tracking, packaging assertion, real build, archive inspection, then anchors |
| PC-002, resolve Store-listing acceptance | resolved by user decision | The app and manifest adopt Recap Page now; BL-162 remains Ready solely for Microsoft Store reservation/listing work |
| PC-003, treat the rename decision as authorization | resolved | The confirmed name and slug selections authorize the exact rename; objective preflight failures remain stop conditions |
| PC-004, allocate exactly two test blocks | resolved | One block belongs to app-icons and one to shipped-copy; every other assertion extends an existing block |
| PC-005, make post-rename work resumable | resolved | P04 writes a durable renamed checkpoint, never renames back automatically, and resumes idempotently at remote update or verification |

## Follow-Up Items

* Complete Microsoft Store reservation/listing for Recap Page, then close BL-162. Outside immediate
  scope by confirmed user decision; owner: repository owner in a later task.

## Handoff

* Implementation artifact: .copilot-tracking/changes/2026-08-20/recap-page-rebrand-changes.md
* Ready phase or task: Full plan, beginning at P01-T01
* Remaining provisional question or blocker: None
