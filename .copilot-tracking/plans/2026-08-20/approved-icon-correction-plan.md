<!-- markdownlint-disable-file -->
# RPI Plan: Approved icon correction

## Task Metadata

* Task ID: MRT-003
* Task slug: approved-icon-correction
* Planning status: Ready
* Plan date: 2026-08-20
* Phase details: .copilot-tracking/details/2026-08-20/approved-icon-correction-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-20/approved-icon-correction-plan-critique.md

## Executive Summary

The rebrand shipped a dark folded-page icon that was inferred during research instead of the purple
mark the owner had selected. This plan corrects the canonical generator, every generated icon,
the focused assertions that currently protect the wrong design, the current written record, and
the README screenshot.

The one-source architecture remains intact. The favicon, sidebar mark, and installed PNGs will all
continue to derive from the same dependency-free geometry, so the correction cannot leave one
surface behind.

### User Decisions and Requirements Highlights

* The attached purple mark is the approved icon and supersedes the dark page with a red progress line.
* The README screenshot must be recaptured from the corrected real app rather than edited independently.

### What You May Not Know

* The existing screenshot is not stale by itself. It loads the same generated SVG as the live app,
  so changing only the screenshot would make the documentation disagree with the product.
* Historical planning remains intact as evidence of the mistaken inference. Current product records
  and the new child-task evidence will record the correction.

### Unresolved Decisions or Blockers

* None.

For current user input, see [User Decisions and Requirements](#user-decisions-and-requirements).

## User Decisions and Requirements

* Use the purple rounded-square mark supplied by the owner on 2026-08-20.
* Replace the current dark folded page and red progress line everywhere they are current product identity.
* Keep one dependency-free generator as the source of the SVG and both PNG sizes.
* Update the README screenshot after the live icon is corrected.
* Do not widen this correction into naming, persistence, packaging identity, Store, or unrelated visual work.

## Goals

* Restore the owner-approved visual identity across every current icon surface.
* Preserve deterministic SVG and PNG generation from one reviewable source.
* Correct current product claims without rewriting historical phase evidence as though the mistake did not happen.
* Prove the screenshot and live application display the same corrected mark.

## Scope and Non-Goals

### In Scope

* Canonical icon geometry and colors in scripts/build-icons.mjs.
* Generated src/icons/icon.svg, icon-192.png, and icon-512.png.
* Existing exact icon assertions in test/app-icons.test.js.
* Current icon wording in CHANGELOG.md and PRODUCT_BACKLOG.md.
* Child-task changes, review, and state evidence.
* docs/screenshots/catalog-shelf-1280.png and the focused follow-up PR description.

### Non-Goals

* Product or repository renaming.
* Storage, backup, update, archive-name, manifest-identity, or origin changes.
* Microsoft Store reservation or listing.
* New dependencies, new tests, or a new screenshot workflow.
* Rewriting the parent research, plan, or review to conceal the superseded inference.

## Functional Requirements

* The SVG, 192px PNG, and 512px PNG must depict the approved purple rounded-square mark with a
  white rounded upper bar, white lower-left page, and light-purple lower-right page.
  * Observable acceptance criteria: All three generated outputs visibly and structurally match the
    supplied mark and the focused pixel test passes.
* The favicon and sidebar must continue to load the generated SVG.
  * Observable acceptance criteria: Existing consumer-linkage assertions pass unchanged.
* Current product records must describe the corrected icon accurately.
  * Observable acceptance criteria: No current implementation claim calls the shipped icon dark,
    folded-page-with-lines, or red-progress.
* The README screenshot must show the corrected icon in the real catalog UI.
  * Observable acceptance criteria: The screenshot is recaptured at the established viewport and
    only the app-owned SVG is requested as an image.

## Non-Functional Requirements

* Icon generation remains deterministic and dependency-free.
  * Objective threshold or evaluation condition: package manifests are unchanged and committed PNG
    pixels equal drawIcon output.
  * Operating condition or verification approach: Run the existing icon generator and focused test.
  * Observable acceptance criteria: No dependency or manifest diff and focused tests pass.
* Transparent corners and legibility are preserved.
  * Objective threshold or evaluation condition: The corner pixel remains transparent, the center
    remains opaque, and every canonical fill covers more than 100 pixels at 192px.
  * Operating condition or verification approach: Existing pixel-level test updated for the approved palette.
  * Observable acceptance criteria: Exact palette and opacity assertions pass.
* Repository gates remain green.
  * Objective threshold or evaluation condition: lint, all tests, anchors, counts, sizes, palette,
    publication, browser checks, and added-line dash scan report no failure.
  * Observable acceptance criteria: Every named command exits 0 and anchors report no change after
    any required reviewed bless.

## Acceptance Criteria

* The live sidebar, favicon, manifest PNGs, and README screenshot all show the approved purple mark.
* scripts/build-icons.mjs remains the canonical source for all three committed icon files.
* test/app-icons.test.js protects the approved geometry and colors rather than the superseded mark.
* CHANGELOG.md, PRODUCT_BACKLOG.md, the child changes record, and the PR body describe the corrected mark.
* No compatibility contract or dependency manifest changes.
* All named validation gates pass.

## Implementation Context Record

| Context item | Current artifact or record |
|---|---|
| Plan | .copilot-tracking/plans/2026-08-20/approved-icon-correction-plan.md |
| Phase details | .copilot-tracking/details/2026-08-20/approved-icon-correction-phase-details.md |
| Latest critique | .copilot-tracking/reviews/plans/2026-08-20/approved-icon-correction-plan-critique.md with Pass disposition |
| Relevant research | .copilot-tracking/research/2026-08-20/approved-icon-correction-research.md |
| Changes-record role | .copilot-tracking/changes/2026-08-20/approved-icon-correction-changes.md is created by implementation |
| Planning execution and readiness | Complete and implementation-ready |
| Continuation context | Confirmed automatic RPI Agent continues to implementation |

## Sources

* User correction and attached icon on 2026-08-20: Controls the selected visual design.
* .copilot-tracking/research/2026-08-20/approved-icon-correction-research.md: C1-C5 establish the source-to-screenshot correction boundary.
* scripts/build-icons.mjs: Canonical generator and dependency-free PNG encoder.
* test/app-icons.test.js: Existing generated-output, consumer-linkage, structure, and pixel owners.
* PRODUCT_BACKLOG.md BL-161: Current product requirement and implementation record.

## Candidate Change and Test Lock

* Exact product-file removals: none.
* Maximum product-file additions: none.
* Tracking additions: plan, phase details, critique, changes, review, research, and state for MRT-003.
* Canonical icon source: scripts/build-icons.mjs.
* Generated targets: src/icons/icon.svg, src/icons/icon-192.png, and src/icons/icon-512.png.
* Existing test ownership: test/app-icons.test.js.
* New test files: none.
* New test blocks: none.
* Semantic coverage: Existing source parity, consumer linkage, opacity, canonical color, and minimum
  fill-area assertions are updated to the approved geometry.
* Regression coverage: Existing manifest, server, full-suite, browser, package, and repository gates.
* Validation evidence: npm run icons; focused icon test; lint; full tests; anchors; counts; sizes;
  palette; publication; browser; screenshot inspection; dash scan.

## Phase Checklist

<!-- rpi:phase id=P01 -->
### [x] P01: Correct the canonical icon

* Intent: Make the owner-approved mark the only current source and generated icon.
* Dependencies: Approved visual and completed research.

<!-- rpi:task id=P01-T01 -->
#### [x] P01-T01: Replace generator geometry and outputs

* Requirement and evidence: User decision; research C1, C2, and C5.
* Expected result: Generator, SVG, 192px PNG, and 512px PNG depict the approved purple mark.
* Detail section: P01-T01 in .copilot-tracking/details/2026-08-20/approved-icon-correction-phase-details.md

<!-- rpi:task id=P01-T02 -->
#### [x] P01-T02: Correct focused icon assertions

* Requirement and evidence: Research C2 and the candidate test lock.
* Expected result: Existing tests protect the approved geometry, palette, transparency, and one-source consumers.
* Detail section: P01-T02 in .copilot-tracking/details/2026-08-20/approved-icon-correction-phase-details.md

<!-- rpi:phase id=P02 -->
### [x] P02: Correct current identity records

* Intent: Make every current claim and screenshot describe or show the approved mark.
* Dependencies: P01.

<!-- rpi:task id=P02-T01 -->
#### [x] P02-T01: Update current written evidence

* Requirement and evidence: Research C3 and C4.
* Expected result: Changelog, backlog, child changes record, state, and PR description accurately
  record the correction without rewriting parent-phase history.
* Detail section: P02-T01 in .copilot-tracking/details/2026-08-20/approved-icon-correction-phase-details.md

<!-- rpi:task id=P02-T02 -->
#### [x] P02-T02: Recapture the README screenshot

* Requirement and evidence: User direction and research C5.
* Expected result: The established catalog screenshot shows the corrected live mark.
* Detail section: P02-T02 in .copilot-tracking/details/2026-08-20/approved-icon-correction-phase-details.md

<!-- rpi:phase id=P03 -->
### [x] P03: Validate and publish the correction

* Intent: Prove the corrected icon is consistent, compatible, and ready in its focused follow-up PR.
* Dependencies: P01 and P02.

<!-- rpi:task id=P03-T01 -->
#### [x] P03-T01: Run focused and repository validation

* Requirement and evidence: Acceptance criteria and candidate validation lock.
* Expected result: All named gates pass and the screenshot inspection confirms the corrected mark.
* Detail section: P03-T01 in .copilot-tracking/details/2026-08-20/approved-icon-correction-phase-details.md

<!-- rpi:task id=P03-T02 -->
#### [x] P03-T02: Commit, push, and refresh the PR record

* Requirement and evidence: PR 151 merged before the correction push, so PR 152 carries the focused
  follow-up under the repository commit rules.
* Expected result: The correction is pushed to the existing PR branch and its description reports
  the approved mark and current verification.
* Detail section: P03-T02 in .copilot-tracking/details/2026-08-20/approved-icon-correction-phase-details.md

## Dependencies

* User-supplied icon: Authoritative visual direction.
* Existing generator: Maintains dependency-free SVG and PNG parity.
* Existing browser harness and out-of-tree Puppeteer: Validate the live app without changing dependencies.
* Focused follow-up PR 152: Carries the corrected commit and description after PR 151 merged.

## Critique Disposition

| Critique run and finding | Disposition | Plan response or residual risk |
|---|---|---|
| Final-candidate critique; no findings | resolved | Pass. The candidate covers the source-to-screenshot chain, preserves one-source generation, and requires no revision or user decision. |

## Follow-Up Items

* None

## Handoff

* Implementation artifact: .copilot-tracking/changes/2026-08-20/approved-icon-correction-changes.md
* Ready phase or task: Review
* Remaining provisional question or blocker: none
