<!-- markdownlint-disable-file -->
# RPI Phase Details: Recap Page rebrand

## Metadata

* Task ID: MRT-002
* Task slug: recap-page-rebrand
* Related plan: .copilot-tracking/plans/2026-08-20/recap-page-rebrand-plan.md
* Evidence sources: .copilot-tracking/research/2026-08-20/recap-page-rebrand-research.md and
  PRODUCT_BACKLOG.md BL-161 through BL-164

## Phase Index

| Phase ID | Name | Status | Detail sections |
|---|---|---|---|
| P01 | Establish the shared Recap Page identity | Complete | P01, P01-T01, P01-T02 |
| P02 | Correct provenance and protect compatibility | Complete | P02, P02-T01, P02-T02 |
| P03 | Prepare product records and prove the tracked change | Complete | P03, P03-T01, P03-T02 |
| P04 | Rename the repository, close the backlog, and verify continuity | Complete | P04, P04-T01, P04-T02 |

<!-- rpi:phase id=P01 -->
## P01: Establish the shared Recap Page identity

### Context

Research separated live identity surfaces from compatibility and historical surfaces. The icon is
generated, but the favicon and rail are not currently bound to that source.

### Intent

Create one distinct Recap Page identity and apply it to every current product and maintenance label.

### Boundaries

* Included: Icon source and outputs, rail, favicon, manifest, visible copy, server, package, backup
  labels, packaging labels, and current product documents.
* Excluded: Release archive filename, storage keys, manifest identity paths, historical RPI files,
  old release entries, and design mockups.

### Likely Targets

* scripts/build-icons.mjs, src/icons/, test/app-icons.test.js: Canonical and generated icon targets.
* src/index.html, src/styles.css, src/manifest.webmanifest, src/js/main.js, server.mjs: Live product
  identity.
* package.json, package-lock.json, scripts/pack-windows.mjs, src/js/lib/model.js: Maintenance,
  packaging, and backup labels.

### Dependencies

* Research C2 through C5, C8, C10 through C12, C14, C15, C17, C21, and C22.

### Validation Expectations

* At most one new product file, the generated SVG, and no runtime dependency.
* Favicon, rail mark, SVG, and PNG exports resolve to one generator-owned geometry.
* Static icon colors are tied to established palette values and the palette gate passes.
* An old-label backup validates after new exports use the new label.

### Completion Evidence

* Focused icon, model, package-leak, and packaging tests pass and fail under their smallest relevant
  local reverts.

### Unresolved Items

* None.

<!-- rpi:task id=P01-T01 -->
### P01-T01: Replace the icon with one shared folded-page mark

#### Context

The current red rounded tile and M are the exact construction BL-161 rejects. Generated PNGs are
tested, but favicon and rail identity can drift.

#### Intent

Define a folded page with recap lines and a red progress line as one readable geometry, then use it
for the favicon, rail, SVG, 192px PNG, and 512px PNG.

#### Boundaries

* Included: Generator geometry, generated SVG and PNGs, rail and favicon references, focused
  structure, palette, and equality assertions.
* Excluded: New graphics dependency, hand-editing PNG bytes, maskable/mobile icon support, or a
  letter monogram.

#### Likely Targets

* scripts/build-icons.mjs: One geometry and fixed dark-palette color source.
* src/icons/icon.svg: Generated vector target used by favicon and rail.
* src/index.html: Favicon and rail references.
* src/styles.css: Rail mark layout and the existing palette reason string.
* src/icons/icon.svg, src/icons/icon-192.png, and src/icons/icon-512.png: Generated outputs.
* test/app-icons.test.js: Shared source, mark structure, pixel, and manifest assertions.

#### Dependencies

* Existing Node-only PNG encoder and icon build script.

#### Validation Expectations

* `npm run icons`, focused icon tests, `npm run palette`, and browser inspection at 1280x900 in dark
  and light themes.

#### Completion Evidence

* One source produces the SVG and both committed PNGs; favicon and rail reference the SVG; structure
  and pixel tests reject the retired red-tile M.

#### Unresolved Items

* None.

<!-- rpi:task id=P01-T02 -->
### P01-T02: Rename current product and maintenance labels

#### Context

Current names are independent literals across browser, manifest, rail, fallback, server, package,
backup, packer, and current documentation surfaces.

#### Intent

Apply Recap Page and `recap-page` only to current identity labels and keep old historical evidence.

#### Boundaries

* Included: Current source and docs, package metadata, new backup filenames and payload label, packer
  readme and internal folder, test harness title.
* Excluded: Old release notes, dated RPI artifacts, design mockups, release archive filename, storage
  namespace, and manifest identity paths.

#### Likely Targets

* src/index.html, src/manifest.webmanifest, src/js/main.js, src/js/lib/model.js, src/dev-faults.html,
  src/styles.css, server.mjs, run.cmd.
* package.json, package-lock.json, scripts/pack-windows.mjs.
* README.md, SECURITY.md, PRODUCT_BACKLOG.md, CHANGELOG.md, docs/WHY_A_BROWSER_APP.md, and
  docs/ux/landing-page-jtbd.md.

#### Dependencies

* P01-T01 for the rail mark and favicon.

#### Validation Expectations

* Exact-name search returns only approved historical or compatibility occurrences.
* Package-leak assertion derives the live package name rather than hard-coding the old one.
* Old-label backup compatibility is directly tested.

#### Completion Evidence

* Current name inventory is reconciled against the research classification.

#### Unresolved Items

* None.

<!-- rpi:phase id=P02 -->
## P02: Correct provenance and protect compatibility

### Context

The short attribution borrows Marvel's API-user formula even though the detailed About copy and
provenance document record a community API chain. Repository rename compatibility depends on
changing the path but not the asset filename.

### Intent

Correct the public provenance sentence and lock every update, release, install, backup, and storage
boundary against drift.

### Boundaries

* Included: Both short attribution surfaces, repository URL constants and current links, focused
  update and backup tests, browser mutation, current issue links.
* Excluded: Detailed provenance redesign, live API contract checks in CI, release asset rename, key
  migration, and origin changes.

### Likely Targets

* src/index.html and static-copy tests: Attribution.
* src/js/lib/updateCheck.js, test/updateCheck.test.js, scripts/browser-check.mjs: Update contracts.
* test/model.test.js, test/server-contract.test.js, test/intake-config.test.js: Compatibility and
  non-vacuous identity assertions.
* README.md, .github/ISSUE_TEMPLATE/config.yml, CHANGELOG.md: Current repository routes.

### Dependencies

* P01 current identity classification.

### Validation Expectations

* New repository path and old asset filename are asserted independently.
* Storage keys and manifest identity paths are unchanged in the diff.
* Old backup label validates and new export label is explicit.

### Completion Evidence

* Focused update, model, server-contract, intake, static-copy, and browser checks.

### Unresolved Items

* None.

<!-- rpi:task id=P02-T01 -->
### P02-T01: Replace the borrowed API attribution

#### Context

The current sentence is Marvel's official API attribution wording, while this project fetched from
marvel.emreparker.com and records Marvel as the origin.

#### Intent

Use the concise accurate sentence “Marvel metadata via marvel.emreparker.com.” in both short
surfaces without weakening the detailed explanation.

#### Boundaries

* Included: Home and preview short attribution, focused static-copy assertion, current docs if they
  repeat the short formula.
* Excluded: Changing the detailed About provenance chain or underlying data.

#### Likely Targets

* src/index.html and the existing most-specific static-copy test owner.

#### Dependencies

* Research C13.

#### Validation Expectations

* Exact search finds no current “Data provided by Marvel.” short surface.
* Detailed About copy still names community API, upstream project, and Marvel origin.

#### Completion Evidence

* Focused test proves both short surfaces and detailed copy agree.

#### Unresolved Items

* None.

<!-- rpi:task id=P02-T02 -->
### P02-T02: Update repository URLs while pinning old contracts

#### Context

Repository redirects preserve old paths but not changed asset names. Existing update tests already
triangulate URL, README, and packer, but do not independently pin the new repository slug.

#### Intent

Move current URLs to `raymond-nassar/recap-page`, retain the old zip name and storage identity, and
make every test assertion non-vacuous after the rename.

#### Boundaries

* Included: Update constants, README routes, issue links, browser mutation, intake prefix, changelog
  release reference, dynamic package-leak assertion, old-backup assertion.
* Excluded: Release asset name, storage keys, manifest id/start/scope, or historical links written as
  dated evidence.

#### Likely Targets

* src/js/lib/updateCheck.js, README.md, .github/ISSUE_TEMPLATE/config.yml, CHANGELOG.md.
* test/updateCheck.test.js, test/intake-config.test.js, test/server-contract.test.js,
  test/model.test.js, scripts/browser-check.mjs.

#### Dependencies

* The existing v1.2.0 release and P01 package/backup label updates.

#### Validation Expectations

* Unit tests pin repository slug and asset filename separately.
* Exact diff inspection confirms no `mrt.*` key or manifest identity change.

#### Completion Evidence

* Targeted tests pass and each new assertion is proven to fail under a smallest relevant revert.

#### Unresolved Items

* None.

<!-- rpi:phase id=P03 -->
## P03: Prepare product records and prove the tracked change

### Context

The repository requires a changelog entry, same-change backlog closure, count re-derivation, anchor
review, fail-before-fix evidence, and full gates. BL-164 cannot be marked Shipped until the
post-rename checks exist.

### Intent

Prepare current product records and establish a clean internal release candidate before the
external rename without claiming post-rename evidence early.

### Boundaries

* Included: Current product docs, changelog, prepared backlog wording, direct count updates, anchors,
  dash scan, focused tests, full gates, and browser checks.
* Excluded: Unrelated backlog cleanup or record-only follow-up work.

### Likely Targets

* PRODUCT_BACKLOG.md and CHANGELOG.md, with final status changes deferred to P04-T02.
* README.md, SECURITY.md, current linked docs, docs/anchors.lock.json.
* Targeted tests and repository scripts.

### Dependencies

* P01 and P02.

### Validation Expectations

* Re-derive every count in touched document sections.
* Read every anchors bless pairing against its claim.
* Prove focused checks fail without the smallest protected change.
* Run lint, test, anchors, counts, sizes, palette, publication, browser, and dash checks.

### Completion Evidence

* Current documentation and changelog are complete; backlog closure text is ready but does not claim
  the external proof has run.

### Unresolved Items

* None.

<!-- rpi:task id=P03-T01 -->
### P03-T01: Update current documentation and changelog

#### Context

Live docs and repository links must follow the rename, while historical names remain meaningful.

#### Intent

Update current reader and maintainer guidance and prepare the four backlog closures without marking
them Shipped before the real rename proof.

#### Boundaries

* Included: Current titles, instructions, links, changelog Unreleased entry, prepared backlog detail
  evidence, touched counts and citations.
* Excluded: Historical RPI paths, old release narratives, design mockups, and unrelated prose defects.

#### Likely Targets

* README.md, SECURITY.md, PRODUCT_BACKLOG.md, CHANGELOG.md, docs/WHY_A_BROWSER_APP.md,
  docs/ux/landing-page-jtbd.md, .github/ISSUE_TEMPLATE/config.yml.

#### Dependencies

* Final source and test behavior from P01 and P02.

#### Validation Expectations

* Exact-name and URL searches classify every remaining old occurrence.
* Backlog row count and Shipped count remain mechanically correct.

#### Completion Evidence

* Documentation and changelog describe the tracked implementation; the backlog remains unclosed
  until P04-T02 supplies the external results.

#### Unresolved Items

* None.

<!-- rpi:task id=P03-T02 -->
### P03-T02: Run targeted proofs and full internal gates

#### Context

A green check that never failed on the broken state is not evidence in this repository.

#### Intent

Prove each focused assertion is meaningful, then run every internal and browser gate.

#### Boundaries

* Included: Smallest safe stashes or temporary local edits, targeted test groups, full gates, anchor
  re-aim and reviewed bless, browser visuals, dash scan, and index tracking of the new SVG before
  tracked-file consumers run.
* Excluded: New tooling or live contract checks in CI.

#### Likely Targets

* Existing test runner, scripts, out-of-tree Puppeteer installation, git index, built archive, and
  changes record.

#### Dependencies

* P03-T01 final tracked tree.

#### Validation Expectations

* No suppressed output and no destructive checkout.
* Added assertions demonstrate a focused failure when their protected line is absent.
* `src/icons/icon.svg` is added to the index before the existing packaging assertion, real package
  build, archive inspection, or first anchors run.
* The existing packaging archive-content block requires the tracked SVG, and the built archive is
  inspected for it without adding a new test block.

#### Completion Evidence

* Zero lint errors, zero test failures, zero anchor drift/new/removed after bless, clean auxiliary
  gates, successful browser scenarios, and zero added em/en dashes.

#### Unresolved Items

* None.

<!-- rpi:phase id=P04 -->
## P04: Rename the repository, close the backlog, and verify continuity

### Context

The caller included the external rename, GitHub documents repository redirects, and the target slug
was unoccupied at research time. The action is externally visible and requires immediate consent.

### Intent

Rename the repository only after the tracked tree is internally sound, then prove the real
compatibility routes, update the local remote, and close the three in-scope backlog items with actual
evidence while leaving BL-162 Ready for Store work.

### Boundaries

* Included: Objective preflight, authorized repository rename, durable rename checkpoint, local
  remote update, old/new route checks, clone/fetch check, backlog closure, final counts, and final
  gates.
* Excluded: Reusing the old repository name, renaming release assets, deleting releases, or changing
  project visibility/settings.

### Likely Targets

* GitHub repository settings through `gh`, local `origin`, API and release URLs, PRODUCT_BACKLOG.md,
  anchors, and changes record.

### Dependencies

* P03 complete, repository admin permission, and the confirmed caller decision naming
  `recap-page`.

### Validation Expectations

* Refuse to continue if the slug is no longer available or the rename fails.
* If GitHub already reports `raymond-nassar/recap-page`, skip the mutation and resume at the remote
  update or first incomplete verification step.
* Verify old API and download routes redirect successfully and new routes answer directly.
* Verify the old asset filename is still present and downloadable.
* Verify local remote and a no-write fetch use the new URL.

### Completion Evidence

* State records the successful new full name immediately after mutation, followed by measured HTTP
  statuses, final remote URL, three eligible backlog closures, BL-162's Store-only remainder, and
  final clean gates.

### Unresolved Items

* BL-162 remains Ready after this implementation solely for Microsoft Store reservation/listing;
  repository rename authorization is already confirmed.

<!-- rpi:task id=P04-T01 -->
### P04-T01: Rename the GitHub repository to recap-page

#### Context

The caller explicitly selected the repository rename and exact slug. A preflight must still verify
identity, availability, permission, and mutation scope before using that authorization.

#### Intent

Perform exactly one repository-name mutation and update the local remote after it succeeds.

#### Boundaries

* Included: Authenticated identity check, target availability recheck, permission check, exact `gh`
  rename, durable state checkpoint, and remote URL update.
* Excluded: Any other repository setting, release, branch, visibility, or permission change.

#### Likely Targets

* `raymond-nassar/marvel-reading-tracker`, `raymond-nassar/recap-page`, and local `origin`.

#### Dependencies

* P03 complete and confirmed 2026-08-20 caller authorization.

#### Validation Expectations

* Read and retain command output and exit status.
* Immediately after GitHub reports the new full name, persist a confirmed decision that the
  repository is renamed and set the next action to local remote update or P04-T02.
* On any later failure, do not rename back or retry the mutation. Detect the live identity and resume
  at the first incomplete post-rename step.

#### Completion Evidence

* GitHub API reports `raymond-nassar/recap-page` and local `origin` points there.

#### Unresolved Items

* None.

<!-- rpi:task id=P04-T02 -->
### P04-T02: Verify redirects, close the backlog, and finalize

#### Context

The risk in BL-164 is only observable after a real rename.

#### Intent

Check installed-copy and new-copy paths against the renamed repository, close BL-161, BL-163, and
BL-164, preserve BL-162's Store-only remainder, then close implementation.

#### Boundaries

* Included: Old/new API, release notes, stable asset, clone/fetch, remote, backlog status and detail
  evidence, final counts, anchors, and internal gates.
* Excluded: Publishing a new release or changing the archive.

#### Likely Targets

* GitHub API and release endpoints, local remote, PRODUCT_BACKLOG.md, docs/anchors.lock.json, and
  final changes record.

#### Dependencies

* P04-T01.

#### Validation Expectations

* Old installed-copy endpoints resolve through redirects.
* New endpoints answer directly.
* Both old and new download paths reach `marvel-reading-tracker-windows.zip`.
* BL-161, BL-163, and BL-164 become Shipped only after those observations are recorded.
* BL-162 stays Ready and says only Microsoft Store reservation/listing remains.
* If resumed after a partial failure, detect the already-renamed repository and continue without a
  second mutation.

#### Completion Evidence

* Measured endpoint and fetch results, three backlog closures, one Store-only remainder, and final
  clean repository checks.

#### Unresolved Items

* None after the rename succeeds.
