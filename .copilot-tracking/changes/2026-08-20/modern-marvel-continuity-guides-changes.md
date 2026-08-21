<!-- markdownlint-disable-file -->
# RPI Changes: Modern Marvel continuity guides

## Metadata

* Task ID: MRT-004
* Related plan: .copilot-tracking/plans/2026-08-20/modern-marvel-continuity-guides-plan.md
* Phase details: .copilot-tracking/details/2026-08-20/modern-marvel-continuity-guides-phase-details.md
* Implementation date: 2026-08-21

## Execution Status

* Status: Complete
* Declared invocation scope: P02
* Completed scope markers: P02, P02-T01, and P02-T02
* Active scope markers: None
* Status basis: The source-order packet is approved, authored, vendored, validated, and reconciled.
  The ten selected inventory records are `shipped`; implementation review and PR publication follow.

## Execution Summary

The ten initially frozen candidates were evaluated without weakening any stop condition. Five failed
their exact-resolution or overlap gates, and seven later candidates also failed before the queue
reached ten authorable packets. The resulting source-order batch is `secret-war`,
`spider-man-the-other`, `world-war-hulk-aftersmash`, `shadowland`, `chaos-war`, `axis`,
`spider-verse`, `apocalypse-wars`, `clone-conspiracy`, and `inhumans-vs-x-men`.

## Implementation-Time Plan and Detail Updates

### CHG-001: Establish the missing implementation record

* Related phase or task: None; this records an unplanned workflow correction before P02 source work.
* What changed: Created this changes record at the path already named by the plan, state, and
  pre-authoring review.
* Why: Commit `bfc2947` and every available local ref omit the file even though the reviewed packet
  says it exists and agrees with the other coordination artifacts.
* Preserved authority: The approved queue and duplicate policy come from the committed plan, phase
  details, state, inventory, guards, tests, and pre-authoring review. This record does not invent
  missing historical entries or claim that unrecorded work occurred.
* Scope effect: None. P02-T01 still requires ten exact mappings, ten complete overlap reports, frozen
  editorial fields, and an independent higher-capability review before any Markdown is authored.

### CHG-002: Apply the P02-T01 stop and backfill gates

* Related phase or task: P02-T01
* What changed: Retrieved only the exact candidate source pages, expanded issue-bearing ranges,
  resolved every available row against repository metadata, and generated complete overlap reports.
  Candidates that failed a gate moved to `blocked`; the next eligible inventory positions were then
  evaluated without reordering.
* Final packet: 10 guides and 238 source rows.

| Position | Inventory id | Source rows | Final overlap result |
|---:|---|---:|---|
| 3 | `secret-war` | 5 | 0 shared issues |
| 9 | `spider-man-the-other` | 12 | 0 shared issues |
| 15 | `world-war-hulk-aftersmash` | 26 | 0 shared issues |
| 25 | `shadowland` | 29 | 0 shared issues |
| 26 | `chaos-war` | 19 | 0 shared issues |
| 37 | `axis` | 55 | 0 shared issues |
| 38 | `spider-verse` | 35 | 0 shared issues |
| 44 | `apocalypse-wars` | 13 | 0 shared issues |
| 46 | `clone-conspiracy` | 24 | 0 shared issues |
| 47 | `inhumans-vs-x-men` | 20 | 0 shared issues |

* Final comparison boundary: Each selected report covers 26 shipped orders and the other 9 final
  peers, for 35 deterministic comparison rows.
* Blocked candidates: 12.

| Position | Inventory id | Blocking evidence |
|---:|---|---|
| 6 | `decimation` | Generation M #1-5 are absent from repository metadata |
| 14 | `world-war-hulk` | Partial overlap with `civil-war-avengers` and the final Aftersmash peer |
| 20 | `fall-of-the-hulks` | Fall of the Hulks: MODOK #1 is absent from repository metadata |
| 28 | `fear-itself` | 15 issues overlap `heroic-age-avengers` |
| 30 | `avengers-vs-x-men` | 17 issues overlap `heroic-age-avengers` |
| 33 | `age-of-ultron` | 1 issue overlaps `heroic-age-avengers` and 1 overlaps `spider-man-best-of` |
| 34 | `infinity` | 2 issues are absent and an unnumbered epilogue has 6 candidates |
| 35 | `original-sin` | 6 issues overlap each Hickman order and 2 overlap final-peer `spider-verse` |
| 36 | `death-of-wolverine` | The source ends with an open `#1 to present` range |
| 39 | `black-vortex` | The exact source page returns HTTP 404 |
| 43 | `avengers-standoff` | 2 issues overlap `all-new-all-different-avengers` |
| 45 | `civil-war-ii` | 9 issue references are absent from repository metadata |

* Manifest proposals: Every final mapping freezes `event`, `complete`, `beginner: false`, no group,
  no variant, a timeline, a cover issue from inside the mapping, exact source-page credit,
  `sourceLicense: null`, and the required Comic Book Herald source-origin text.
* Plan reconciliation: The plan's prose says `depth: full`, but the shipped manifest contract accepts
  `complete`; the proposals use the repository's valid value rather than introduce an invalid enum.
* Next gate: One independent higher-capability review must verify queue order, counts, mappings,
  overlap reports, editorial fields, covers, provenance, and source spot checks before any record
  moves from `pending` to `ready`.

### CHG-003: Close the packet review's foundation gate

* Related phase or task: None; these are P01 workflow defects exposed by P02-T01.
* Triggering evidence: Independent packet-review findings F-001 through F-004.
* Inventory lifecycle: The maintained inventory validator now accepts the plan's guarded `pending`,
  `ready`, `shipped`, and `blocked` states, accepts populated string overlap and catalog id arrays,
  and still rejects invalid states and duplicate ids inside either array. The focused test now checks
  the current lifecycle contract instead of asserting that every P01 baseline field stays empty.
* Reproducible preparation: `npm run cbh:prepare` now performs both candidate preparation and exact
  resolution in one recorded command. Candidates with known unmatched or ambiguous rows remain
  unresolved and blocked; every exact candidate is written with its selected id in the same run.
* Resolver integrity: Candidate series titles, years, and ids now come from the API response rather
  than being copied from the mapping row. Automatic resolution requires the same series id. A source
  and API title mismatch resolves only when the candidate is marked as a reviewed manual series
  selection and the row carries a non-empty note.
* Axis correction record: The source's `Loki: Agent of Axis #8` typo now has an explicit note that
  Marvel identifies the selected series as `Loki: Agent of Asgard`.
* Scope basis: P02 explicitly permits correction of P01 workflow defects exposed by the production
  batch. No browser runtime code or dependency was added.

### CHG-004: Close P02-T01 on independent approval

* Related phase or task: P02-T01
* Review result: Approved after one blocker was corrected and independently re-reviewed.
* Verified packet: 10 guides, 238 exact and distinct issue ids, 350 final comparisons, 350 `none`
  relationships, 0 shared ids, 10 unique source URLs, 10 unique catalog ids and output names, and 0
  semantic duplicates.
* Frozen editorial fields: All ten mappings now carry the approved manifest block and the persisted
  packet-review path. Review-only `coverSourcePosition` and `coverSourceReference` fields remain in
  mappings as evidence and are explicitly excluded from `curated-lists.json`.
* Lifecycle transition: The ten approved inventory records moved from `pending` to `ready`; all 12
  rejected candidates remain `blocked` with their exact evidence.
* Review gates: Focused suite 18 passed; full suite 1,234 passed; lint reported 0; anchors reported
  986 unchanged, 0 drifted, 0 new, and 0 removed.
* Residual information: The preparer generates `manualSeriesSelection` and its note together, so the
  same path cannot independently challenge a mis-curated series id. The independent review verified
  all 238 selected ids directly against the live issue API, and later work should separate that
  approval input if the intake program is generalized.

### CHG-005: Author and vendor the approved batch

* Related phase or task: P02-T02
* Authored data: `scripts/author-cbh-packet.mjs` wrote ten flat Markdown checklists and ten manifest
  entries from approved mappings only. It strips mapping-only review fields and refuses a mapping
  that is unresolved, unapproved, incomplete, duplicated, or overlapped.
* Vendored data: Ten pinned payloads and the complete catalog now add 238 distinct issues. The
  catalog contains 36 orders and each new card carries the approved timeline, cover, search fields,
  exact source page, required Comic Book Herald credit, and `sourceLicense: null`.
* Vendor result: 0 unresolved rows, 0 placeholders, 0 count warnings, 0 duplicate warnings, 0 missing
  digital ids, and 0 missing covers across all ten orders.
* Duplicate correction: The packet guard now seeds its comparison state from shipped orders without
  rejecting known source-page reuse among those existing variants. New batch and peer records still
  fail on any id, source URL, exact sequence, or catalog id already seen.
* Semantic protections: One test holds mapping to Markdown to pinned JSON to catalog parity for each
  guide. A second checks all 238 packet ids against every shipped order and every peer. Changing one
  generated id made the exact-sequence test fail; changing it to shipped issue 2092 made the aggregate
  overlap test fail. Restoring the one value returned both tests to green.
* Product records: README contributor guidance, provenance totals, Unreleased changelog, and BL-176
  now describe the shipped packet and its build-time boundary with re-derived counts.
* Lifecycle transition: The ten approved records moved from `ready` to `shipped` and each now records
  its catalog id. The 12 rejected candidates remain `blocked`.

### CHG-006: Resolve all material implementation-review findings

* Related phase or task: None; this is the required read-only review after P02 implementation.
* Review result: Three medium findings, all fixed.
* Idempotent authoring: The author now computes its expected comparison and manifest counts from the
  26 entries outside the packet rather than from the already-expanded 36-entry manifest. Running it
  again rewrote 10 checklists and the manifest byte-identically.
* Approval preservation: Normal preparation now leaves every approved mapping untouched. A guarded
  `--refresh-approved` mode updates resolver evidence only when both selected sequence and manifest
  fields are unchanged; `--force-approved` deliberately returns a mapping to pending review. A
  default preparation run changed 0 of 10 approved mapping hashes.
* Manual series approval: API/source title mismatches now resolve only when the series declaration
  carries an explicit human-written selection note. The generator propagates that separate approval
  bit to the row and candidate, and the resolver requires both. All 36 title-mismatched candidates
  in the final packet carry explicit approval; an automatic mismatch without it fails.
* Focused evidence: 16 inventory, resolver, packet, and approval-preservation tests passed; lint
  reported 0. The ten exact mappings still contain the same 238 selected ids.

## Validation Record

| Check | Scope | Status | Evidence or reason |
|---|---|---|---|
| Reviewed packet commit | P02 intake | Passed | HEAD is `bfc2947`. |
| Selected queue | P02 intake | Passed | Plan, state, inventory, and pre-authoring review name the same ten records in source order. |
| Changes record availability | P02 intake | Corrected | The referenced file was absent from all available refs and is now established without reconstructed history. |
| Candidate source retrieval | P02-T01 | Passed with blocks | 21 exact pages were retrieved and one exact page returned HTTP 404. |
| Exact mapping gate | P02-T01 | Passed for final packet | 238 of 238 final rows resolved exactly; 0 ambiguous, unmatched, or approved-exception rows. |
| Final overlap gate | P02-T01 | Passed for final packet | 10 reports, 35 comparisons each, and 0 non-`none` relationships. |
| Source-order backfill | P02-T01 | Passed | 12 blocked candidates are recorded before the final position 47 selection. |
| Focused inventory, resolver, and overlap suite | P02-T01 correction | Passed | 18 tests, 0 failed. |
| One-command mapping reproduction | P02-T01 correction | Passed | 16 exact mappings resolved in place; the 6 resolution or source blocked mappings preserved their blockers. |
| Independent packet review | P02-T01 | Approved | 10 guides, 238 exact issue ids, 350 zero-overlap comparisons, 37 recorded spot checks, and 238 live issue checks. |
| Vendor run | P02-T02 | Passed | 10 orders, 238 issues, and zero unresolved, placeholder, count, duplicate, digital-id, or cover warnings. |
| Authored packet tests | P02-T02 | Passed | 104 focused catalog, manifest, provenance, inventory, exact-sequence, and aggregate-overlap tests. |
| Semantic failure proofs | P02-T02 | Passed | One changed id failed exact sequence; one shipped id failed aggregate overlap; both passed after restoration. |
| Full test suite | P02-T02 | Passed | 1,277 tests, 0 failed on the current merged tree. |
| Lint | P02-T02 | Passed | ESLint reported 0 errors. |
| Counts | P02-T02 | Passed | 150 ranked rows, 5 parked, and 155 detail blocks; every stated figure agrees. |
| Sizes | P02-T02 | Passed | All 7 stated file sizes agree. |
| Palette | P02-T02 | Passed | 88 pairs measured, 5 recorded below the floor, and 0 new failures. |
| Evidence anchors | P02-T02 | Passed | 993 unchanged, 0 drifted, 0 new, and 0 removed after the current-main merge. |
| Repository live contract | P02-T02 | Passed | 33 of 33 assumptions hold across 17 requests. |
| Added-issue live contract | P02-T02 | Passed | 238 of 238 generated issues match their approved mapping and live issue record. |
| Edge browser scenarios | P02-T02 | Passed | 119 assertions, 0 failed, across 14 scenarios on the current merged tree. |
| Implementation review | Review | Resolved | 3 medium regeneration findings fixed; 0 material findings remain open. |
| Author rerun | Review | Passed | 10 Markdown files and the 36-entry manifest retained identical SHA-256 hashes. |
| Prepare rerun | Review | Passed | 0 of 10 approved mapping hashes changed; blocked mappings retained their blockers. |
| Explicit series approvals | Review | Passed | All 36 final title mismatches carry independently declared approval; 0 automatic bypasses remain. |

## Blockers

* None.

## Remaining Work

* Commit and publish the pull request.

## Follow-Up Items

* None inside MRT-004.
