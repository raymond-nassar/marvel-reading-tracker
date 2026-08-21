<!-- markdownlint-disable-file -->
# RPI Phase Details: Major release documentation

## Metadata

* Task ID: MRT-002
* Task slug: major-release-docs
* Related plan: .copilot-tracking/plans/2026-08-21/major-release-docs-plan.md
* Evidence sources: .copilot-tracking/research/2026-08-21/major-release-docs-research.md, README.md,
  CONTRIBUTING.md, SUPPORT.md, GOVERNANCE.md, CHANGELOG.md, PRODUCT_BACKLOG.md, relevant tests, and
  docs/anchors.lock.json.

## Phase Index

| Phase ID | Name | Status | Detail sections |
|----------|------|--------|-----------------|
| P01 | Establish focused document ownership | Complete | P01, P01-T01 through P01-T03 |
| P02 | Reconnect repository navigation and records | Complete | P02, P02-T01 through P02-T03 |
| P03 | Finalize the release after the reading-order batch | Complete | P03, P03-T01 through P03-T03 |

<!-- rpi:phase id=P01 -->
## P01: Establish focused document ownership

### Context

README.md currently combines the repository landing page, reader operations manual, troubleshooting
guide, data explanation, contributor handbook, and maintainer runbook. The user wants the root to
retain only descriptions, how to run, how to upgrade, and concise routes to deeper material.

### Intent

Create one concise reader landing page and two canonical detailed guides without using any
batch-dependent catalog count or release wording.

### Boundaries

* Included: README.md, docs/RUNNING.md, docs/MAINTAINING.md.
* Excluded: Final release totals, version metadata, release publication, application code, and stored
  data.

### Likely Targets

* README.md: Replace the combined manual with the reader-first page.
* docs/RUNNING.md: Receive detailed reader operations and troubleshooting.
* docs/MAINTAINING.md: Receive operational maintainer procedures.

### Dependencies

* Completed Research artifact.
* No dependency on Modern marvel batch two.
* The integrated historical-anchor prerequisite passes its complete anchor cycle without editing
  historical tracking artifacts.

### Validation Expectations

* README.md is at most 250 lines.
* All root relative links resolve.
* The stable release asset URL and exact local origin remain.
* Existing root privacy and update tests keep meaningful subjects.

### Completion Evidence

* A section relocation inventory records each old heading as retained, moved, merged, or retired as
  duplication.
* Root headings match the approved reader-facing order.
* The two new guides contain every moved operational procedure.

### Unresolved Items

* None.

<!-- rpi:task id=P01-T01 -->
### P01-T01: Create the detailed running guide

* Implementation status: Complete.

#### Context

The current root contains useful detail that should not be lost: operating-system warnings, two
startup routes, success indicators, real-browser requirements, installed-app behavior, the exact
origin rule, stopping and restarting, alternate-port consequences, and five troubleshooting cases.

#### Intent

Move and edit that material into a coherent reader operations guide whose headings can become stable
targets for SUPPORT.md and the root Learn more section.

#### Boundaries

* Included: Reader startup and recovery guidance.
* Excluded: Contributor tests, data authoring, release mechanics, and app redesign.

#### Likely Targets

* docs/RUNNING.md: New canonical detailed reader operations guide.

#### Dependencies

* Historical-anchor prerequisite integrated before source movement begins.

#### Validation Expectations

* Cover Windows download and source startup without contradicting the short root instructions.
* Preserve the exact-origin warning and make the standard origin more prominent than alternate ports.
* Include all five existing troubleshooting cases.
* Point questions and security reports to SUPPORT.md and SECURITY.md rather than duplicating them.

#### Completion Evidence

* SUPPORT.md can replace both root troubleshooting links with stable guide headings.
* No reader operations paragraph exists only in the old README.

#### Unresolved Items

* None.

<!-- rpi:task id=P01-T02 -->
### P01-T02: Create the maintainer guide

* Implementation status: Complete.

#### Context

CONTRIBUTING.md owns policy, quality standards, and basic checks. The root owns the longer operational
procedures it links to. A maintainer guide can preserve that detail while keeping contribution policy
separate from command-oriented maintenance work.

#### Intent

Create docs/MAINTAINING.md with focused sections for:

1. Check matrix and live contract check.
2. Browser check and proof mode.
3. Upgrade check and proof mode.
4. Reviewing pinned workflow actions.
5. Adding a curated reading order.
6. Building a modern continuity packet.
7. Reading paths and collected-edition grouping.
8. Generated event orders.
9. Series and creator indexes.
10. Cutting a release.

#### Boundaries

* Included: Existing operational content and cross-links to provenance, architecture, security, and
  contribution policy.
* Excluded: Rewriting project governance or adding new maintenance processes.

#### Likely Targets

* docs/MAINTAINING.md: New canonical maintainer operations guide.

#### Dependencies

* Historical-anchor prerequisite integrated before source movement begins.

#### Validation Expectations

* Preserve every command, prerequisite, exit-code distinction, and safety warning.
* Keep the browser driver outside repository dependencies.
* Keep the live contract check outside CI.
* Keep release tags created from the merged commit rather than a branch commit.

#### Completion Evidence

* A maintainer can run every existing check, add an order, and prepare a release from the new guide.
* Final heading anchors are ready before P01-T03 writes root links.

#### Unresolved Items

* None.

<!-- rpi:task id=P01-T03 -->
### P01-T03: Rewrite the root README for readers

* Implementation status: Complete.

#### Context

The root must remain useful to a person who has never run the app. It also carries four load-bearing
contracts: the latest Windows archive URL, the exact local origin, the browser-held upgrade
explanation, and a privacy passage read by an existing test.

#### Intent

Produce a concise root with this exact section order:

1. Title, one-sentence value proposition, and current screenshot.
2. What it does.
3. Your data stays with you.
4. Run the app.
5. Upgrade safely.
6. Learn more.
7. Disclaimer.
8. License.

#### Boundaries

* Included: Short Windows route, short source route, success address, safe upgrade, privacy summary,
  and links to focused guidance.
* Excluded: Troubleshooting cases, alternate-port commands, browser-driver setup, test descriptions,
  curation schemas, workflow pin review, and release choreography.

#### Likely Targets

* README.md: Canonical root page.

#### Dependencies

* P01-T01 and P01-T02 final heading contracts.
* Historical-anchor prerequisite integrated.

#### Validation Expectations

* Keep the release asset path `marvel-reading-tracker-windows.zip`.
* Keep the heading `### Your data stays with you` unless the privacy test is deliberately updated
  without weakening its scoped copy check.
* Include `npm start` and `http://127.0.0.1:8787/`.
* Explain that replacing the app folder leaves browser-held progress intact at the same origin.
* Do not state a catalog total before P03.

#### Completion Evidence

* README.md has no more than 250 lines.
* A first-time reader can run and upgrade from the root alone.
* Every detailed topic has a visible Learn more link.

#### Unresolved Items

* None.

### Complete README heading relocation inventory

| Current heading | Disposition | Canonical destination |
|-----------------|-------------|-----------------------|
| Recap Page | Retain | README.md title and value proposition |
| Start here | Merge | README.md Run the app |
| On Windows | Split | README.md short route; docs/RUNNING.md full route |
| On a Mac, or if you would rather build it yourself | Split | README.md short source route; docs/RUNNING.md full route |
| Either way | Merge | README.md Run the app; docs/RUNNING.md What success looks like |
| Getting updates | Retain and shorten | README.md Upgrade safely; detail in docs/RUNNING.md |
| The first run warning | Move | docs/RUNNING.md First run warnings |
| What it does | Retain and shorten | README.md What it does |
| Modern Marvel guide intake stays build-time only | Move to existing and new canonical owners | docs/DATA_PROVENANCE.md Modern Marvel continuity intake; docs/MAINTAINING.md Building a modern continuity packet |
| Your data stays with you | Retain and shorten | README.md Your data stays with you |
| Run it on your computer | Split | README.md Run the app; docs/RUNNING.md |
| What you need | Move | docs/RUNNING.md Requirements |
| Step 1: Get the code onto your computer | Move | docs/RUNNING.md Run from source |
| Step 2: Start the app | Split | README.md short source route; docs/RUNNING.md Run from source |
| Step 3: Open it in your browser | Split | README.md exact address; docs/RUNNING.md Open in a browser |
| What a working app looks like | Move | docs/RUNNING.md What success looks like |
| Optional: install it as an app | Move | docs/RUNNING.md Install it as an app |
| Stopping it, and starting it again another day | Move | docs/RUNNING.md Stop and restart |
| Always open the same address | Split | README.md safety callout; docs/RUNNING.md Always use the same address |
| If something goes wrong | Move | docs/RUNNING.md Troubleshooting |
| Pairs well with | Retain and shorten | README.md Learn more |
| Data source | Merge into existing canonical owner | README.md privacy summary; docs/DATA_PROVENANCE.md |
| For contributors | Merge | README.md Learn more; CONTRIBUTING.md |
| Checks | Move | docs/MAINTAINING.md Check matrix |
| The browser check | Move | docs/MAINTAINING.md Browser check |
| The upgrade check | Move | docs/MAINTAINING.md Upgrade check |
| Reviewing an update to a pinned action | Move | docs/MAINTAINING.md Reviewing pinned workflow actions |
| Adding a curated reading list | Move | docs/MAINTAINING.md Adding a curated reading order |
| Building a Comic Book Herald continuity packet | Move | docs/MAINTAINING.md Building a modern continuity packet |
| Reading paths | Move | docs/MAINTAINING.md Reading paths |
| Collected-edition grouping | Move | docs/MAINTAINING.md Collected-edition grouping |
| Event orders, generated from Marvel's own metadata | Move | docs/MAINTAINING.md Generated event orders |
| Searching for a series or a creator | Move | docs/MAINTAINING.md Series and creator indexes |
| Releasing | Move | docs/MAINTAINING.md Cutting a release |
| Disclaimer | Retain | README.md Disclaimer |
| License | Retain | README.md License |

The inventory has zero unassigned headings. P01 completion checks each row against the final tree.

### Historical README scopes protected by the prerequisite

The following eight historical tracking scopes remain unchanged. The integrated general
historical-target contract keeps each claim bound to its original README evidence:

1. approved-icon-correction research, codebase evidence C5, current README screenshot range.
2. modern-marvel-continuity-guides research, codebase evidence C6, current curated-list range.
3. modern-marvel-continuity-guides deeper lane, X-Men Extermination comparison, current grouping range.
4. modern-marvel-continuity-guides internal wider lane, authoring and validation range.
5. modern-marvel-continuity-guides internal wider lane, browser behavior prerequisite range.
6. modern-marvel-continuity-guides internal wider lane, browser safety range.
7. modern-marvel-continuity-guides internal wider lane, contrarian check-matrix range.
8. modern-marvel-continuity-guides internal wider lane, contrarian reading-path range.

<!-- rpi:phase id=P02 -->
## P02: Reconnect repository navigation and records

### Context

Changing document ownership affects inbound links, tests that scope root prose, product records, and
evidence anchors. A visually correct README with stale repository navigation is incomplete.

### Intent

Make every reference, record, and verification surface agree with the new canonical document
locations.

### Boundaries

* Included: CONTRIBUTING.md, SUPPORT.md, GOVERNANCE.md, CHANGELOG.md, PRODUCT_BACKLOG.md, relevant
  existing tests only if their semantic target moves, and docs/anchors.lock.json.
* Excluded: Unrelated prose cleanup and unrelated backlog work.

### Likely Targets

* CONTRIBUTING.md: Route operational procedures to docs/MAINTAINING.md and reader setup to the root or
  running guide.
* SUPPORT.md: Route troubleshooting and exact-origin guidance to docs/RUNNING.md and metadata detail
  to docs/DATA_PROVENANCE.md.
* GOVERNANCE.md: Route release mechanics to docs/MAINTAINING.md.
* CHANGELOG.md and PRODUCT_BACKLOG.md: Record the user-visible documentation restructuring.
* docs/anchors.lock.json: Reconcile watched claims after final text movement.

### Dependencies

* P01 final headings and content ownership.

### Validation Expectations

* Zero links to removed README fragments.
* Existing documentation tests remain semantically meaningful.
* Anchor additions, removals, and drift all close to zero after review and bless.

### Completion Evidence

* Link inventory and section relocation inventory are both empty.
* Changelog and backlog records describe the shipped documentation outcome.

### Unresolved Items

* None.

<!-- rpi:task id=P02-T01 -->
### P02-T01: Update inbound links and remove duplication

* Implementation status: Complete.

#### Context

SUPPORT.md links to troubleshooting, exact-origin, and data-source root anchors. CONTRIBUTING.md links
to running, contributor, curation, and pinned-action root anchors. GOVERNANCE.md links to releasing.

#### Intent

Update every link in one pass after destination headings settle, then remove only duplication whose
canonical replacement is present.

#### Boundaries

* Included: Link destinations and short routing sentences.
* Excluded: Rewriting the policy or decision content of these documents.

#### Likely Targets

* CONTRIBUTING.md, SUPPORT.md, GOVERNANCE.md.

#### Dependencies

* P01.

#### Validation Expectations

* Repository search finds no old root fragments.
* Every new relative path exists and every fragment matches a destination heading.

#### Completion Evidence

* A tracked link inventory records zero unresolved links.

#### Unresolved Items

* None.

<!-- rpi:task id=P02-T02 -->
### P02-T02: Update product records and evidence anchors

* Implementation status: Complete.

#### Context

The change is noticeable to readers and maintainers, so repository policy requires both changelog and
backlog records. Existing anchor scopes cite README content being retained, moved, or removed.

#### Intent

Record the documentation change, re-derive every touched count, reconcile citations against canonical
content, and bless only after reading every changed claim and target together.

#### Boundaries

* Included: One backlog item and detail block for this task, one Unreleased changelog entry, affected
  citations, and the anchor lock.
* Excluded: Final v1.3.0 release heading and final catalog figures, which belong to P03.

#### Likely Targets

* PRODUCT_BACKLOG.md, CHANGELOG.md, docs/anchors.lock.json, and only source documents whose citations
  must follow moved canonical text.

#### Dependencies

* P01 and P02-T01.

#### Validation Expectations

* Re-derive all counts in touched document sections.
* Derive every moved anchor by both content search and diff hunk arithmetic.
* Check every range begins and ends on non-blank lines.
* Read every anchors:bless pairing before accepting the lock.

#### Completion Evidence

* npm run anchors reports zero drifted, zero new, and zero removed.
* The backlog and changelog agree with the implemented scope.

#### Unresolved Items

* The exact backlog ID must be selected from the final current backlog during implementation, not
  invented from this plan.

<!-- rpi:task id=P02-T03 -->
### P02-T03: Validate the prepared documentation

* Implementation status: Complete.

#### Context

Documentation movement can break tests, links, evidence anchors, counts, and release download
discovery without changing application code.

#### Intent

Prove the prepared documentation is internally consistent before waiting on P03.

#### Boundaries

* Included: Existing lint, test, anchors, counts, sizes, palette, publication, link, relocation, and
  dash checks.
* Excluded: Live metadata contract and real-browser release-candidate checks, which run in P03.

#### Likely Targets

* No new test file by default.
* Existing tests may change only when a canonical section moves and the new assertion remains equally
  or more specific.

#### Dependencies

* P02-T01 and P02-T02.

#### Validation Expectations

* Run npm run lint, npm test, npm run anchors, npm run counts, npm run sizes, npm run palette, and npm
  run publication.
* Search all tracked Markdown for removed README fragments.
* Verify relative paths and heading fragments for every changed link.
* Run the required file-based dash scan over added lines.

Test ownership:

| Test | Coverage type | Current subject | Final subject and preserved assertion |
|------|---------------|-----------------|---------------------------------------|
| test/privacy-copy.test.js | Semantic copy contract | README network disclosure between privacy and running headings | README privacy section; retain the heading boundary and every disclosure category |
| test/updateCheck.test.js | Regression contract | Stable Windows archive URL in README | README Run the app section; retain the same stable archive filename and GitHub release route |
| test/governance-docs.test.js CI set | Semantic command contract | Fenced CI command sets in README and CONTRIBUTING.md | Transfer the README subject to docs/MAINTAINING.md while retaining CONTRIBUTING.md; preserve the exact derived CI set and count |
| test/governance-docs.test.js document links | Semantic navigation contract | Governance document corpus | Include docs/RUNNING.md and docs/MAINTAINING.md in the existing relevant corpus when it strengthens the same contract |

For every changed semantic owner, prove the transferred assertion fails when its new canonical
content or link is removed and passes on the completed tree. Do not weaken a pattern only to make the
rewrite green.

#### Completion Evidence

* Every listed command exits zero.
* Link, relocation, and dash checks report zero findings.

#### Unresolved Items

* None.

<!-- rpi:phase id=P03 -->
## P03: Finalize the release after the reading-order batch

### Context

The integrated tree has 46 catalog orders, up from 26 at v1.2.0. The dependent batch is complete and
its final catalog and release facts have been re-derived.

### Intent

Write the product release summary from the integrated tree, synchronize v1.3.0 metadata, and validate
without publishing.

### Boundaries

* Included: Final facts, release bullets, changelog version boundary, synchronized version metadata,
  and release-candidate checks.
* Excluded: Creating the GitHub release, tag, or asset upload.

### Likely Targets

* CHANGELOG.md: Final v1.3.0 boundary and product summary.
* package.json, package-lock.json, src/js/lib/version.js: Synchronized minor version.
* Release-body draft in the implementation changes record until external publication is approved.

### Dependencies

* Modern marvel batch two completed in merged PR 161.
* Merge commit `04b68d9d87aab30c5cc3c557e51825a4a2b07871` is present in the integrated tree.
* P02 complete.

### Validation Expectations

* Re-derive catalog total and Unreleased entry inventory from the final tree.
* Confirm SCHEMA_VERSION remains unchanged before selecting v1.3.0.
* Record the dependent result identity in the changes record and prove its commit is an ancestor of
  the current tree, or record and verify the exact accepted diff when no commit exists.
* Re-run every P01 and P02 link, test, and anchor check after integration and conflict resolution.
* Do not create a release or tag.

### Completion Evidence

* Final facts resolve to the merged tree.
* Release copy satisfies the bullet standard.
* Version metadata agrees in all three owners.

### Unresolved Items

* None.

<!-- rpi:task id=P03-T01 -->
### P03-T01: Refresh final release facts

* Implementation status: Complete.

#### Context

Research totals were refreshed after the batch: 46 current orders, 26 at v1.2.0, and 15 Unreleased
entries.

#### Intent

Recompute catalog size, number and identity of new guides since v1.2.0, Unreleased headings,
compatibility state, and user-visible redesign surfaces.

#### Boundaries

* Included: Final merged tree only.
* Excluded: Copying counts from the earlier research artifact.

#### Likely Targets

* src/data/catalog.json, CHANGELOG.md, src/js/lib/model.js, package.json, and git history since v1.2.0.

#### Dependencies

* Completed and integrated dependent batch.

#### Validation Expectations

* Parse current and v1.2.0 catalog JSON rather than counting filenames.
* Compare schema declarations and model changes against v1.2.0.

#### Completion Evidence

* Every figure in release copy has a recorded derivation from the final tree.

#### Unresolved Items

* None.

<!-- rpi:task id=P03-T02 -->
### P03-T02: Write final release notes and synchronize v1.3.0

* Implementation status: Complete.

#### Context

The repository's version contract selects MINOR for backward-compatible features and interface
changes. The user wants the milestone presented with major product energy without falsely signaling
stored-data incompatibility.

#### Intent

Write one strong release headline and five to seven short bullets. Lead with reader value, name the
new identity and redesigned journeys, describe the expanded catalog using final facts, state the safe
upgrade, and link to the full changelog. Then synchronize version metadata as 1.3.0.

#### Boundaries

* Included: Release summary, changelog boundary, version metadata.
* Excluded: Publishing or uploading.

#### Likely Targets

* CHANGELOG.md, package.json, package-lock.json, src/js/lib/version.js, and the implementation changes
  record for ready-to-paste GitHub release copy.

#### Dependencies

* P03-T01.

#### Validation Expectations

* Five to seven bullets.
* No file names, identifiers, commands, implementation jargon, em dashes, or en dashes in release
  copy.
* Explicitly state that existing progress remains available at the same app address.
* Run the repository's version synchronization command rather than editing owners independently.

#### Completion Evidence

* Release copy is ready to paste without revision.
* Package, lockfile, and browser version all read 1.3.0.

#### Unresolved Items

* None.

<!-- rpi:task id=P03-T03 -->
### P03-T03: Run release-candidate validation

* Implementation status: Complete.

#### Context

The final release candidate includes documentation movement, a version bump, and the integrated data
batch. It needs both repository gates and the checks deliberately kept outside CI.

#### Intent

Run every applicable release-candidate check, preserving the distinction between missing browser
prerequisites and a failing assertion.

#### Boundaries

* Included: Static gates, live contract, browser suite, and upgrade suite.
* Excluded: Release creation.

#### Likely Targets

* No source target unless a check exposes a material defect in this task's scope.

#### Dependencies

* P03-T02.

#### Validation Expectations

* npm run lint
* npm test
* npm run anchors
* npm run counts
* npm run sizes
* npm run palette
* npm run publication
* npm run contract
* npm run browser
* npm run upgrade
* File-based dash scan and final link scan

#### Completion Evidence

* All seven repository gates pass on the synchronized candidate.
* The live metadata contract holds all 33 assumptions.
* Browser validation passes 119 assertions, upgrade validation passes 10 assertions, and Windows
  packaging completes.
* README.md remains 118 lines, all documentation links resolve, and the added-line dash scan reports
  zero.
* No release or tag exists as a side effect.

#### Unresolved Items

* None.
