<!-- markdownlint-disable-file -->
# RPI Phase Details: Approved icon correction

## Metadata

* Task ID: MRT-003
* Task slug: approved-icon-correction
* Related plan: .copilot-tracking/plans/2026-08-20/approved-icon-correction-plan.md
* Evidence sources: .copilot-tracking/research/2026-08-20/approved-icon-correction-research.md; user-supplied approved icon

## Phase Index

| Phase ID | Name | Status | Detail sections |
|---|---|---|---|
| P01 | Correct the canonical icon | Ready | P01, P01-T01, P01-T02 |
| P02 | Correct current identity records | Ready | P02, P02-T01, P02-T02 |
| P03 | Validate and publish the correction | Ready | P03, P03-T01, P03-T02 |

<!-- rpi:phase id=P01 -->
## P01: Correct the canonical icon

### Context

The current SVG, PNGs, and screenshot consistently show generator geometry that research inferred.
The owner-supplied mark uses a purple rounded tile, white rounded upper bar, white lower-left page,
and light-purple lower-right page. The existing source and tests already provide the architecture
needed to reproduce it without a new dependency.

### Intent

Replace the superseded geometry while retaining one source, deterministic exports, transparent
corners, and current consumers.

### Boundaries

* Included: Generator constants and primitives, generated SVG and PNG files, existing icon tests.
* Excluded: Manifest identity, consumer paths, CSS layout, dependencies, and unrelated visual tokens.

### Likely Targets

* scripts/build-icons.mjs: Canonical colors, geometry, SVG output, and raster drawing.
* src/icons/icon.svg: Generated vector.
* src/icons/icon-192.png and src/icons/icon-512.png: Generated install icons.
* test/app-icons.test.js: Exact structure, color, opacity, and fill-area assertions.

### Dependencies

* Owner-supplied visual and research C1-C2.

### Validation Expectations

* npm run icons.
* node --test test/app-icons.test.js.
* The committed SVG exactly equals generator output; PNG pixels exactly equal drawIcon output.

### Completion Evidence

* Focused tests pass against regenerated files and fail against the superseded geometry.

### Unresolved Items

* None.

<!-- rpi:task id=P01-T01 -->
### P01-T01: Replace generator geometry and outputs

#### Context

The selected attachment measures a dominant purple near #6d28d9, light purple near #9e71e6, and
white. Its normalized geometry fits the existing 32 by 32 view box and needs one rounded-square,
one rounded rectangle, and two polygons.

#### Intent

Encode that geometry once and regenerate every output.

#### Boundaries

* Included: Static icon colors, rounded upper bar helper, lower page polygons, generated outputs.
* Excluded: Copying the attachment as a raster source or adding image libraries.

#### Likely Targets

* scripts/build-icons.mjs and src/icons/.

#### Dependencies

* Existing PNG encoder and supersampling.

#### Validation Expectations

* Generated files are deterministic across Node versions at the pixel level.

#### Completion Evidence

* Generator command writes all three files and focused parity assertions pass.

#### Unresolved Items

* None.

<!-- rpi:task id=P01-T02 -->
### P01-T02: Correct focused icon assertions

#### Context

The focused suite currently hard-codes the wrong folded-page polygon and red fill. It should remain
strict but protect the approved structure instead.

#### Intent

Update existing tests without adding blocks or weakening one-source coverage.

#### Boundaries

* Included: SVG structure and canonical full-opacity color counts.
* Excluded: Snapshot tooling, tolerances that hide geometry drift, or new test files.

#### Likely Targets

* test/app-icons.test.js.

#### Dependencies

* P01-T01 geometry.

#### Validation Expectations

* Existing consumer-linkage assertions remain; changed assertions fail when approved geometry is reverted.

#### Completion Evidence

* Focused suite passes after regeneration and a smallest-revert proof catches the old design.

#### Unresolved Items

* None.

<!-- rpi:phase id=P02 -->
## P02: Correct current identity records

### Context

Current changelog and backlog prose call the superseded mark folded-page and red-progress. The parent
RPI records show why that happened and remain historical evidence. The child task should record the
owner correction while current product claims move to the approved icon.

### Intent

Make current prose and imagery agree with the live product.

### Boundaries

* Included: Current changelog and backlog implementation wording, child task records, screenshot, PR body.
* Excluded: Rewriting the completed parent research, plan, critique, or review.

### Likely Targets

* CHANGELOG.md and PRODUCT_BACKLOG.md: Current user and maintainer record.
* .copilot-tracking/changes/2026-08-20/approved-icon-correction-changes.md: Child implementation evidence.
* docs/screenshots/catalog-shelf-1280.png: Current README image.
* PR 151 description: Current review surface.

### Dependencies

* P01 complete so the screenshot records the final live mark.

### Validation Expectations

* Current product claims describe the purple page mark.
* Screenshot uses the established 1280 by 875 CSS viewport at device scale 2.
* Screenshot image requests contain only the app-owned SVG.

### Completion Evidence

* Direct screenshot inspection and current-copy search.

### Unresolved Items

* None.

<!-- rpi:task id=P02-T01 -->
### P02-T01: Update current written evidence

#### Context

The user correction supersedes one visual decision but not the broader rebrand or compatibility work.

#### Intent

Correct only current icon claims and preserve the reason for the post-review child task.

#### Boundaries

* Included: Current product claims, child state, changes record, PR description.
* Excluded: Historical parent-phase rewrites and unrelated counts.

#### Likely Targets

* CHANGELOG.md, PRODUCT_BACKLOG.md, child RPI artifacts, and PR 151.

#### Dependencies

* Final icon wording from P01.

#### Validation Expectations

* Search finds no current product claim that still describes the old generated design.

#### Completion Evidence

* Current prose accurately names colors and forms visible in generated outputs.

#### Unresolved Items

* None.

<!-- rpi:task id=P02-T02 -->
### P02-T02: Recapture the README screenshot

#### Context

The README image is a real application capture, so it must follow source correction.

#### Intent

Replace the catalog image with the same scene and corrected identity.

#### Boundaries

* Included: Existing screenshot file and direct image inspection.
* Excluded: README prose, catalog content changes, comic images, or new screenshot dependencies.

#### Likely Targets

* docs/screenshots/catalog-shelf-1280.png.

#### Dependencies

* P01; installed Edge; out-of-tree puppeteer-core.

#### Validation Expectations

* 1280 by 875 viewport, device scale 2, covers disabled before first paint, no comic image elements.

#### Completion Evidence

* 2560 by 1750 output visibly shows the approved mark and only app-owned SVG image traffic.

#### Unresolved Items

* None.

<!-- rpi:phase id=P03 -->
## P03: Validate and publish the correction

### Context

The correction touches generated binary outputs, user-visible documentation, and a PR already passing
CI. It must prove exact source parity and rerun all gates affected by tracked evidence and screenshot
changes.

### Intent

Produce a clean, reviewed, pushed correction on PR 151.

### Boundaries

* Included: Focused and full validation, anchors reconciliation, child review, commit, push, PR body.
* Excluded: Merging PR 151.

### Likely Targets

* Repository gates, child RPI state and review, git branch, PR 151.

### Dependencies

* P01 and P02 complete.

### Validation Expectations

* Focused icon test, lint, full tests, anchors, counts, sizes, palette, publication, browser, dash scan.
* One post-implementation Review.

### Completion Evidence

* Clean worktree after pushed commit, PR body current, and required CI started on the new head.

### Unresolved Items

* None.

<!-- rpi:task id=P03-T01 -->
### P03-T01: Run focused and repository validation

#### Context

Generated assets and citations can drift independently, so both pixel parity and repository evidence
gates matter.

#### Intent

Verify the exact requested outcome and unchanged surrounding contracts.

#### Boundaries

* Included: Named plan gates and smallest-revert proof.
* Excluded: Live third-party metadata contract because this icon change does not touch it.

#### Likely Targets

* Existing npm scripts and browser harness.

#### Dependencies

* Completed source and record edits.

#### Validation Expectations

* Every named gate exits 0; anchor changes are reviewed before blessing.

#### Completion Evidence

* Recorded command results and screenshot properties in the changes artifact.

#### Unresolved Items

* None.

<!-- rpi:task id=P03-T02 -->
### P03-T02: Commit, push, and refresh the PR record

#### Context

PR 151 currently describes the wrong folded-page icon and must not merge with that claim or image.

#### Intent

Publish the corrected source and review record to the existing branch.

#### Boundaries

* Included: One commit with required co-author trailer, push, PR body update, and CI start check.
* Excluded: Merge, auto-merge, or reviewer solicitation.

#### Likely Targets

* Current branch and PR 151.

#### Dependencies

* P03-T01. The parent RPI Review follows the completed implementation and publication task.

#### Validation Expectations

* Remote head equals local commit and PR body no longer calls the icon folded-page or red-progress.

#### Completion Evidence

* GitHub reports the new head and required checks start.

#### Unresolved Items

* None.
