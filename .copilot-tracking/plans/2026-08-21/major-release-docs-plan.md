<!-- markdownlint-disable-file -->
# RPI Plan: Major release documentation

## Task Metadata

* Task ID: MRT-002
* Task slug: major-release-docs
* Planning status: Ready
* Plan date: 2026-08-21
* Phase details: .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-21/major-release-docs-plan-critique.md

## Executive Summary

This plan turns the 849-line root README into a focused reader landing page, while preserving the
operating and maintainer knowledge that currently makes it long. Detailed startup, troubleshooting,
testing, curation, and release procedures move to two focused documents. Existing support,
contribution, and governance pages will point to the new canonical locations instead of old README
anchors.

The second ten-order batch and the historical-anchor prerequisite are integrated. The final tree now
contains 46 orders, up from 26 at v1.2.0, and all implementation phases are ready. Publication,
tagging, and asset upload remain outside this plan until separately confirmed.

### User Decisions and Requirements Highlights

* The root README must become much shorter and contain product descriptions, how to run the app, and
  how to upgrade it.
* Details should live on focused pages reached from the root rather than making the root a combined
  reader and maintainer manual.
* Release notes must be punchy, bullet-led, and written with polished product language.
* Release planning must wait for the separate session adding ten more reading lists, but independent
  documentation preparation should proceed now.

### What You May Not Know

* The root README is the target of links from SUPPORT.md, CONTRIBUTING.md, and GOVERNANCE.md. Moving
  sections without updating those documents would leave the repository pointing at missing anchors.
* Existing tests read the README's privacy section and release download URL. The rewrite should keep
  the privacy heading and stable download link so documentation work does not weaken those checks.
* Historical and product evidence anchors point into the current README. Product-document citations
  can follow canonical content, but repository policy forbids rewriting historical tracking
  citations. The current anchor mechanism has no way to preserve those historical targets after the
  root content moves.

### Unresolved Decisions or Blockers

* Creating the GitHub release and tag is externally visible and remains outside implementation until
  separately confirmed after the release commit is merged.
* No implementation blocker remains.

For current user input, see [User Decisions and Requirements](#user-decisions-and-requirements).

## User Decisions and Requirements

* Simplify the root README into much shorter, focused sections that point to other pages for detail.
* Keep product descriptions, how to run the app, and how to upgrade it on the root page.
* Make release notes punchy, bullet-led, and polished like a world-class product announcement.
* Wait for Modern marvel batch two before finalizing release scope because it is adding ten more
  reading lists.
* Prepare every independent README and supporting-document change while that session runs.
* Create a separate general historical-anchor prerequisite rather than rewriting historical tracking
  citations or weakening the README shortening goal.

## Goals

* Give a first-time reader a concise explanation of Recap Page, a fast path to running it, and a safe
  upgrade path without scrolling through maintainer material.
* Give troubleshooting and maintainer procedures stable, focused owners outside the root README.
* Preserve privacy, exact-origin, download, compatibility, provenance, contribution, and release
  contracts while changing their document locations.
* Write final release copy and version metadata from the integrated 46-order tree.
* Keep historical tracking artifacts unchanged under the integrated historical-target contract.

## Scope and Non-Goals

### In Scope

* Rewrite README.md as a reader-first landing page no longer than 250 lines.
* Add docs/RUNNING.md for detailed startup, first-run warnings, installed-app behavior, exact-origin
  safety, and troubleshooting.
* Add docs/MAINTAINING.md for browser and upgrade checks, pinned workflow action review, curated-order
  authoring, modern continuity intake, metadata index maintenance, and release mechanics.
* Update CONTRIBUTING.md, SUPPORT.md, and GOVERNANCE.md to point to the new canonical sections.
* Update CHANGELOG.md and PRODUCT_BACKLOG.md for the documentation restructuring.
* Reconcile evidence anchors and run repository documentation gates.
* After the dependent batch finishes, refresh catalog totals and write the final v1.3.0 release
  summary and GitHub release bullets.

### Non-Goals

* No application interface or runtime behavior changes.
* No storage schema change and no change to the exact 127.0.0.1:8787 origin.
* No new runtime or development dependency.
* No publication, tag, GitHub release, or release asset upload during the documentation-preparation
  work.
* Do not copy provisional catalog totals; use the re-derived 46-order final tree.
* No rewriting historical tracking-artifact prose beyond anchor maintenance required by the final
  tree. The selected prerequisite must make such rewriting unnecessary.
* No anchor-checker or historical-target implementation in this documentation task.

## Functional Requirements

* README.md presents the product, its main reader benefits, its local-first privacy model, how to run
  it, how to upgrade it, and where to find detailed guidance.
  * Observable acceptance criteria: A reader can reach the download, source start command, exact
    local address, upgrade steps, troubleshooting guide, support guide, contribution guide,
    architecture record, provenance record, changelog, disclaimer, and license from the root page.
* docs/RUNNING.md becomes the canonical detailed reader operations guide.
  * Observable acceptance criteria: It covers Windows download, source startup, first-run warnings,
    success indicators, browser choice, optional installed-app behavior, stopping and restarting,
    exact-origin recovery, and the five existing troubleshooting cases.
* docs/MAINTAINING.md becomes the canonical maintainer operations guide.
  * Observable acceptance criteria: It preserves every actionable command and safety explanation
    currently under the root contributor section, including browser checks, upgrade checks, pinned
    actions, curated data, continuity packets, paths and collections, event generation, local
    indexes, and releases.
* Existing inbound links are redirected to canonical destinations in the same change.
  * Observable acceptance criteria: No tracked Markdown document links to a removed README anchor.
* Historical tracking citations remain unchanged.
  * Observable acceptance criteria: A separate prerequisite implements and validates a general
    historical-target contract before P01 begins, including all eight affected historical scopes
    listed in the phase details.
* The release summary is finalized only from the post-batch tree.
  * Observable acceptance criteria: Five to seven benefit-first bullets cover identity, redesigned
    discovery and reading, expanded catalog, safe upgrade, and the full-changelog link without
    temporary counts or implementation jargon.

## Non-Functional Requirements

* Root-page brevity.
  * Objective threshold or evaluation condition: README.md is at most 250 lines and contains no
    maintainer procedure longer than a link sentence.
  * Operating condition or verification approach, if needed: Count the finished file as an array of
    lines rather than with Measure-Object -Line.
  * Observable acceptance criteria: The root is less than one-third of its current 849 lines.
* Information preservation.
  * Objective threshold or evaluation condition: Every removed root section has one named canonical
    destination, and no operational instruction is deleted without an explicit disposition.
  * Observable acceptance criteria: A section-by-section relocation inventory closes with zero
    unowned removals.
* Link integrity.
  * Objective threshold or evaluation condition: Every relative Markdown target exists and every
    changed fragment matches a heading in its destination.
  * Observable acceptance criteria: Repository search finds zero references to removed root anchors.
* Compatibility safety.
  * Objective threshold or evaluation condition: The stable release download URL, privacy heading,
    browser-storage explanation, and exact local origin remain present.
  * Observable acceptance criteria: Existing privacy, update, governance, anchors, counts, and sizes
    tests pass without weakening their assertions.
* Writing quality.
  * Objective threshold or evaluation condition: Reader-facing copy is concrete, benefit-first,
    free of em and en dashes, and does not expose tracking identifiers or implementation detail.
  * Observable acceptance criteria: The file-based dash scan reports zero added lines containing
    either dash, and final release notes contain five to seven bullets.

## Acceptance Criteria

* README.md is at most 250 lines and uses this reader-facing order: description, screenshot, benefits,
  privacy, run, upgrade, learn more, disclaimer, and license.
* README.md retains the stable Windows release asset URL and the exact 127.0.0.1:8787 address.
* docs/RUNNING.md and docs/MAINTAINING.md exist and own the detailed content moved from the root.
* CONTRIBUTING.md, SUPPORT.md, and GOVERNANCE.md contain no links to removed README anchors.
* The privacy-copy and update-check contracts still read meaningful root content without test
  weakening.
* Every README section removed from root is mapped to a destination or explicitly retired as
  duplication.
* The separate historical-anchor prerequisite is merged or otherwise proven present in the current
  tree before README.md changes begin.
* The anchors gate finishes with zero drifted, zero new, and zero removed after every printed
  claim-to-line pairing is read.
* Lint, tests, anchors, counts, sizes, palette, and publication gates exit successfully.
* The final release notes contain five to seven short benefit-first bullets, name the safe upgrade,
  link the full changelog, and use final post-batch facts.
* Package, lockfile, and browser version metadata are changed together only after the dependent batch
  finishes.
* No GitHub release, tag, or asset is published without separate confirmation.

## Implementation Context Record

| Context item | Current artifact or record |
|--------------|----------------------------|
| Plan | .copilot-tracking/plans/2026-08-21/major-release-docs-plan.md |
| Phase details | .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md |
| Latest critique | .copilot-tracking/reviews/plans/2026-08-21/major-release-docs-plan-critique.md with Blocked disposition |
| Relevant research | .copilot-tracking/research/2026-08-21/major-release-docs-research.md |
| Changes-record role | .copilot-tracking/changes/2026-08-21/major-release-docs-changes.md is created by implementation as its evidence record |
| Planning execution and readiness | Critique complete once, all planner corrections applied, and both dependencies integrated |
| Continuation context | Manual RPI session ready for explicit implementation advancement |

## Sources

* User direction on 2026-08-21: root README boundary, release-note voice, dependency wait, and request
  to prepare independent documentation.
* .copilot-tracking/research/2026-08-21/major-release-docs-research.md: release semantics,
  documentation inventory, inbound links, compatibility evidence, and selected v1.3.0 recommendation.
* README.md: current reader, troubleshooting, data, contributor, and release content to partition.
* CONTRIBUTING.md, SUPPORT.md, and GOVERNANCE.md: current document ownership and inbound root links.
* test/privacy-copy.test.js, test/updateCheck.test.js, and test/governance-docs.test.js: existing
  semantic contracts affected by document movement.
* docs/anchors.lock.json: evidence-anchor scopes that require reconciliation after relocation.

## Phase Checklist

<!-- rpi:phase id=P01 -->
### [x] P01: Establish focused document ownership

* Intent: Create the concise root and the two detailed canonical guides without batch-dependent
  release facts.
* Dependencies: Existing research; independent of Modern marvel batch two.

<!-- rpi:task id=P01-T01 -->
#### [x] P01-T01: Create the detailed running guide

* Implementation status: Complete.
* Requirement and evidence: Current startup, exact-origin, installed-app, and troubleshooting material
  is useful but too detailed for the root.
* Expected result: docs/RUNNING.md owns detailed reader operations and the root links to it.
* Detail section: P01-T01 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

<!-- rpi:task id=P01-T02 -->
#### [x] P01-T02: Create the maintainer guide

* Implementation status: Complete.
* Requirement and evidence: Root contributor material spans checks, data authoring, dependency review,
  and releases, while CONTRIBUTING.md already owns policy and standards.
* Expected result: docs/MAINTAINING.md owns operational procedures without duplicating CONTRIBUTING.md.
* Detail section: P01-T02 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

<!-- rpi:task id=P01-T03 -->
#### [x] P01-T03: Rewrite the root README for readers

* Implementation status: Complete.
* Requirement and evidence: The user requires a much shorter root with descriptions, run, and upgrade
  sections; research found the current file mixes four document roles.
* Expected result: README.md is at most 250 lines, retains load-bearing reader contracts, and routes
  detail to the final headings established by P01-T01 and P01-T02.
* Detail section: P01-T03 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

<!-- rpi:phase id=P02 -->
### [x] P02: Reconnect repository navigation and records

* Intent: Make the new ownership model complete and verifiable across every document and gate.
* Dependencies: P01.

<!-- rpi:task id=P02-T01 -->
#### [x] P02-T01: Update inbound links and remove duplication

* Implementation status: Complete.
* Requirement and evidence: SUPPORT.md, CONTRIBUTING.md, and GOVERNANCE.md link to root anchors that
  P01 removes.
* Expected result: Every inbound link reaches a live canonical section, and each topic has one owner.
* Detail section: P02-T01 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

<!-- rpi:task id=P02-T02 -->
#### [x] P02-T02: Update product records and evidence anchors

* Implementation status: Complete.
* Requirement and evidence: Repository policy requires changelog and backlog updates, and the anchor
  lock watches content being moved.
* Expected result: The documentation restructuring is recorded, citations name the final canonical
  text, and the anchor round closes honestly.
* Detail section: P02-T02 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

<!-- rpi:task id=P02-T03 -->
#### [x] P02-T03: Validate the prepared documentation

* Implementation status: Complete.
* Requirement and evidence: Existing tests read root copy and release links, while repository gates
  validate claims and counts.
* Expected result: All existing gates pass, link and relocation inventories are empty, and the dash
  scan reports zero.
* Detail section: P02-T03 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

<!-- rpi:phase id=P03 -->
### [x] P03: Finalize the release after the reading-order batch

* Intent: Refresh evidence against the merged batch, write the final product bullets, and synchronize
  v1.3.0 metadata without publishing.
* Dependencies: P02 and completed Modern marvel batch two.

<!-- rpi:task id=P03-T01 -->
#### [x] P03-T01: Refresh final release facts

* Implementation status: Complete.
* Requirement and evidence: The dependent session adds ten reading lists, invalidating current catalog
  totals and release scope.
* Expected result: Catalog totals, changelog entries, compatibility state, and named reader benefits
  are re-derived from the final tree.
* Detail section: P03-T01 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

<!-- rpi:task id=P03-T02 -->
#### [x] P03-T02: Write final release notes and synchronize v1.3.0

* Implementation status: Complete.
* Requirement and evidence: User requires punchy product bullets; repository version semantics select
  MINOR while schema compatibility remains unchanged.
* Expected result: Final release copy contains five to seven polished bullets, CHANGELOG.md is bounded
  under 1.3.0, and package, lockfile, and browser version agree.
* Detail section: P03-T02 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

<!-- rpi:task id=P03-T03 -->
#### [x] P03-T03: Run release-candidate validation

* Implementation status: Complete.
* Requirement and evidence: A release candidate must pass repository gates plus the live contract and
  real-browser upgrade checks.
* Expected result: All gates, npm run contract, npm run browser, and npm run upgrade pass against the
  synchronized release candidate, with no release or tag created.
* Detail section: P03-T03 in .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md

## Dependencies

* Modern marvel batch two: satisfied by merged PR 161; the combined tree contains 46 catalog orders.
* General historical-anchor prerequisite: satisfied by the integrated provenance and local-only
  portability commits; 1,017 canonical anchors pass while 13 ignored local citations are validated
  without entering the portable lock.
* Existing documentation and anchors: P01 content movement determines P02 link and anchor targets.
* External publication confirmation: required after this plan, before any GitHub release or tag.

## Critique Disposition

| Critique run and finding | Disposition | Plan response or residual risk |
|--------------------------|-------------|--------------------------------|
| PC-001: Historical README anchors make the candidate unsatisfiable | resolved by user decision and integrated prerequisite | The selected historical-target contract and its local-only portability correction are integrated. The eight affected scopes remain unchanged and the combined anchor cycle passes. |
| PC-002: Test migration does not name new semantic owners | resolved in plan | P02-T03 now assigns the root privacy and download regressions explicitly and transfers the CI-set semantic subject to docs/MAINTAINING.md while retaining CONTRIBUTING.md coverage. |
| PC-003: Relocation inventory is incomplete | resolved in plan | Phase details now map every current README heading to a retained, moved, merged, existing, or retired destination with zero unassigned headings. |
| PC-004: Router ownership and task order overlap | resolved in plan | P01 creates both guide heading contracts before the root is finalized; P02-T01 alone owns CONTRIBUTING.md, SUPPORT.md, and GOVERNANCE.md. |
| PC-005: Dependent-session completion proof is incomplete | resolved in plan and satisfied | PR 161 merged as `04b68d9d87aab30c5cc3c557e51825a4a2b07871`; the result is integrated and release facts were re-derived from the combined tree. |

## Follow-Up Items

* Publishing the GitHub release, tag, and Windows archive remains a separate externally visible action
  after the release commit reaches main.

## Handoff

* Implementation artifact: .copilot-tracking/changes/2026-08-21/major-release-docs-changes.md
* Ready phase or task: Review.
* Remaining provisional question or blocker: None. Publication remains a later externally visible
  action requiring separate confirmation.
