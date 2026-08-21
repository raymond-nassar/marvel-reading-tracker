<!-- markdownlint-disable-file -->
# RPI Changes: Recap Page rebrand

## Metadata

* Task ID: MRT-002
* Related plan: .copilot-tracking/plans/2026-08-20/recap-page-rebrand-plan.md
* Phase details: .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md
* Implementation date: 2026-08-20

## Execution Status

* Status: Complete
* Declared invocation scope: Full plan
* Completed scope markers: P01, P01-T01, P01-T02, P02, P02-T01, P02-T02, P03, P03-T01, P03-T02,
  P04, P04-T01, and P04-T02
* All remaining active-plan markers: None
* Status basis: The tracked change, external rename, compatibility observations, backlog closure,
  and final gates are complete.

## Execution Summary

The app now uses one generator-owned folded-page mark, Recap Page identity, accurate short
attribution, and new repository routes. Compatibility-sensitive release, backup-import, manifest,
origin, and storage contracts remain fixed and are covered by focused tests.

## Completed Work

### Establish the Recap Page identity

* Related phase or task: P01, P01-T01, and P01-T02
* Files: scripts/build-icons.mjs, src/icons/, src/index.html, src/styles.css,
  src/manifest.webmanifest, src/js/main.js, src/js/lib/model.js, scripts/pack-windows.mjs,
  server.mjs, run.cmd, src/dev-faults.html, package.json, package-lock.json, and current product docs
* What changed and why: Replaced the retired red-tile M with a folded page, renamed current product
  and maintenance labels, and retained compatibility-only old identifiers.
* Completion evidence: One source writes the SVG and both PNGs; rail and favicon load that SVG; the
  exact-name inventory contains only classified historical, fixture, backup, and archive cases.
* Validation: Focused suite passed 159 tests; palette measured 84 pairs with zero new failures.

### Correct provenance and protect rename compatibility

* Related phase or task: P02, P02-T01, and P02-T02
* Files: src/index.html, src/js/lib/updateCheck.js, scripts/browser-check.mjs,
  .github/ISSUE_TEMPLATE/config.yml, and focused compatibility tests
* What changed and why: Replaced borrowed official-API wording with the actual metadata route and
  moved current repository URLs while holding the archive basename, manifest identity, storage
  keys, and old-backup import behavior fixed.
* Completion evidence: Both short surfaces use the exact attribution; URL and archive assertions
  are independent; an old-label backup imports.
* Validation: Focused suite passed 159 tests.

### Prepare product records and prove the tracked change

* Related phase or task: P03, P03-T01, and P03-T02
* Files: README.md, SECURITY.md, CHANGELOG.md, PRODUCT_BACKLOG.md, docs/WHY_A_BROWSER_APP.md,
  docs/ux/landing-page-jtbd.md, docs/DATA_PROVENANCE.md, docs/PUBLICATION_RUNBOOK.md,
  docs/UX_STUDY.md, docs/anchors.lock.json, and the staged implementation tree
* What changed and why: Current guidance and records now use Recap Page and the new repository
  route; three backlog items carry implementation evidence while BL-162 records its Store-only
  remainder.
* Completion evidence: The full suite, lint, counts, sizes, publication, palette, browser,
  packaging, dash, and anchors gates pass; focused assertions were observed failing without their
  protected changes.
* Validation: Complete before external mutation.

### Rename the repository, close the backlog, and verify continuity

* Related phase or task: P04, P04-T01, and P04-T02
* Files or systems: GitHub repository settings, local origin, PRODUCT_BACKLOG.md, and the final
  staged tree
* What changed and why: Renamed the repository to `raymond-nassar/recap-page`, moved origin to the
  canonical URL, closed BL-161, BL-163, and BL-164, and left BL-162 Ready only for Store work.
* Completion evidence: Old and new API, release-page, and fixed-asset routes answer 200 after
  redirects; old and new clone routes resolve the same commit; a clean clone and dry-run fetch
  succeed; the live update checker reaches v1.2.0.
* Validation: Complete after the external rename and backlog closure.

### Refresh the README screenshot at closeout

* Related phase or task: P03-T01
* Files: README.md and docs/screenshots/catalog-shelf-1280.png
* What changed and why: The README heading already used Recap Page, but its catalog screenshot still
  showed the retired red M and Reading Tracker label. A fresh capture now shows the folded-page mark
  and Recap Page.
* Completion evidence: The capture retained the prior 1280 by 875 CSS viewport at device scale 2,
  loaded the real catalog with covers disabled before first paint, and requested only the app-owned
  SVG icon.
* Validation: The resulting 2560 by 1750 PNG contains no comic image elements and was inspected
  directly after capture.

## Implementation-Time Plan and Detail Updates

### Resolve Store scope and make the current plan consistent

* Affected plan area or markers: Goals, Acceptance Criteria, P04, P04-T02, and Follow-Up Items
* What changed: BL-162 now remains Ready solely for Microsoft Store reservation/listing, while the
  other three backlog items remain eligible to close in this task.
* Why: The final critique found that Store acceptance was outside the candidate implementation.
* Triggering evidence: PC-002.
* User answer or decision: Keep Store work out of this task and leave BL-162 open.
* Reconciliation performed: Requirements, goals, acceptance, P04 details, closure evidence, and
  follow-up state are current.
* Planning and critique state: Final; all PC-001 through PC-005 dispositions are resolved.

### Keep the SVG source assertion stable across Windows checkouts

* Affected plan area or markers: P03-T02 final full-suite validation
* What changed: The generated SVG comparison normalizes CRLF to the generator's LF before comparing
  exact text.
* Why: Git's Windows checkout conversion changed only line endings and made the otherwise exact
  generator-source assertion fail after a stash round trip.
* Classification: Ordinary local judgment tightly coupled to the new shared SVG assertion.

### Carry the late README screenshot direction into the completed rebrand

* Affected plan area or markers: P03-T01 current documentation
* What changed: Replaced the one current README screenshot after the user identified its stale
  product identity during closeout.
* Why: A current screenshot is a live identity surface even though it contains no searchable old
  label in the README source.
* Triggering evidence: User direction during closeout and direct inspection of the committed image.
* Classification: Immediately relevant current-state update preserving the approved rebrand intent.

## Validation Record

| Check | Scope | Status | Evidence or reason |
|---|---|---|---|
| Focused identity and compatibility suite | P01 and P02 | Passed | 159 tests, 0 failed |
| Palette gate | P01-T01 | Passed | 84 pairs, 0 new below-floor pairs |
| Exact old-name and URL inventory | P01 and P02 | Passed | Remaining cases are compatibility or historical evidence |
| Added test block count | Candidate lock | Passed | Net two new blocks across the two assigned files |
| Patch whitespace | Current tree | Passed | git diff --check returned clean |
| Full test suite | Full tree | Passed | 1,208 tests, 0 failed |
| Lint | Full tree | Passed | 0 errors after npm ci restored declared dev tooling |
| Counts | Product records | Passed | 138 rows, 5 parked, 143 detail blocks; all figures agree |
| Sizes | Repository claims | Passed | 7 stated sizes agree |
| Publication | Reachable history | Passed | 1,901 blobs, 0 content findings |
| Anchors | Tracked evidence | Passed | 881 unchanged, 0 drifted, 0 new, 0 removed |
| Browser scenarios | Running app | Passed | 103 assertions across 13 scenarios |
| Browser mutation proofs | Running app | Passed | 25 of 25 mutations caught |
| Windows package | Distribution | Passed | 35,328,923-byte archive; runtime checksum verified |
| Archive inspection | Distribution | Passed | Recap Page readme and tracked SVG present under recap-page |
| Added-line dash scan | Current diff | Passed | 0 en or em dashes |
| Focused fail-before-fix proofs | P01 and P02 protections | Passed | Icon linkage, shipped identity, backup label, repository route, and archive SVG assertions each failed without the protected change |
| README screenshot | Current documentation | Passed | 2560 by 1750 PNG shows Recap Page and the folded-page mark; 0 comic image elements and only the app icon requested |

## Pre-Review Reconciliation

* Plan markers and phase details: All full-plan markers complete
* Completed-work evidence and handoff prose: Current through P04
* Validation, blockers, remaining work, and follow-up items: Reconciled against the final staged tree
* Review readiness: Ready for the one post-implementation Review

## Blockers

* None.

## Remaining Work

* None inside this task.

## Follow-Up Items

* Canonical plan list: .copilot-tracking/plans/2026-08-20/recap-page-rebrand-plan.md,
  `## Follow-Up Items`
* Complete Microsoft Store reservation/listing for Recap Page, then close BL-162. Outside immediate
  scope by confirmed user decision; owner: repository owner in a later task.

## Return-to-Caller State

* Implementation execution status: Complete
* Declared scope and markers: Full plan; P01 through P04 complete
* Validation coverage: All planned pre-rename, continuity, and final checks complete
* Blockers: None
* Current plan and detail updates: Store-only BL-162 remainder reconciled
* Planning and critique state: Final and ready
* Follow-up items: Microsoft Store reservation/listing for BL-162
* Review readiness or no-handoff reason: Ready for the one post-implementation Review
* Continuation owner: Confirmed automatic RPI Agent
