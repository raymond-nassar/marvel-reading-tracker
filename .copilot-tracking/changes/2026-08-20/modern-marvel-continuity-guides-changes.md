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
  The pull request is open, its three post-publication review findings are fixed, and Agent Merge
  resolved the current-main conflict against the fully validated merged tree.

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
* Product records: README contributor guidance, provenance totals, Unreleased changelog, and BL-181
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

### CHG-007: Resolve all material post-publication review findings

* Related phase or task: None; this is the required fresh review of the open pull request.
* Review result: Three medium findings, all fixed with no material finding left open.
* Complete overlap evidence: Authoring now requires the report to contain one unique comparison row
  for every expected shipped or packet-peer id, not only a claimed count. Each row must also record
  `none`, zero shared issues, and an empty shared-id list.
* Reproducible shipped reports: Overlap generation excludes the candidate and any supplied peers from
  the manifest comparison set before adding the peers. All ten shipped reports regenerated with
  unchanged SHA-256 hashes; the peer-argument regression also retained exactly 35 unique comparisons.
* Issue-zero preservation: The authored Inhumans vs. X-Men checklist now names `#0`, vendoring falls
  back to the checklist number when Marvel's display title omits it, and the pinned item records
  `number: "0"`. Packet tests and the live packet contract compare every generated number with the
  approved mapping.
* Failure proofs: A count-only report made the new authoring test fail; restoring self-comparison made
  shipped report regeneration fail on the duplicate sequence; restoring the null issue number made
  both the packet test and packet contract fail at source position 1. Each isolated mutation was
  removed through the staged stash before the passing rerun.

### CHG-008: Close the unavailable Agent Merge authorization tick

* Related phase or task: None; this is an external delivery blocker after the pull request opened.
* Required state: Agent Merge permits no top-level action until the app injects an
  `<agent_merge_state>` block carrying `Authorized actions this run:`.
* Attempts: Two new PR-linked sessions were launched, first with the default agent and then with the
  dedicated `agent-merge` agent. A direct `/agent-merge` invocation was also sent to the dedicated
  session. All three paths loaded the Agent Merge skill context but none received the required state
  block or authorization line.
* Safety result: Both sessions correctly made no repository or GitHub mutation without authorization.
* Last read-only PR state: Pull request 159 is open at `1ef6de303cc88627479fb500249ab890b425b364`;
  GitHub reports `CONFLICTING` and `DIRTY`, with no status checks or reviews in the fetched summary.
* Resolution: The app injected the required state on 2026-08-21 with authorization to address review
  comments, fix CI, and resolve conflicts. The prior blocker is closed.

### CHG-009: Reconcile the batch with current main under Agent Merge

* Related phase or task: None; this is the authorized conflict resolution for pull request 159.
* Base change: Merged `origin/main` at `74d1f45`, preserving its cohesion and accessibility work
  together with all ten guides and the post-publication review corrections.
* Identifier reconciliation: Current main assigned `BL-176` to its type and corner scale work. This
  batch moved to the next free id, `BL-181`, in the ranked table, detail block, provenance record, and
  implementation record. No duplicate backlog id remains.
* Combined backlog: 155 ranked rows, 5 parked rows, and 160 detail blocks: 134 Shipped, 19 Ready,
  6 Dropped, and 1 Proposed. Every derived count and rank agrees.
* Evidence reconciliation: All 72 changed anchor pairings were read against their claims. The final
  lock holds 993 unchanged citations with 0 drifted, new, or removed.
* Merged validation: 1,288 tests passed; lint reported 0; all 7 size claims agree; 88 palette pairs
  produced 0 new failures; both live contracts passed at 33 of 33 and 238 of 238; and all 119 Edge
  assertions passed across 14 scenarios.

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
| Full test suite | P02-T02 and Review | Passed | 1,288 tests, 0 failed on the current merged tree. |
| Lint | P02-T02 | Passed | ESLint reported 0 errors. |
| Counts | P02-T02 | Passed | 155 ranked rows, 5 parked, and 160 detail blocks; every stated figure agrees. |
| Sizes | P02-T02 | Passed | All 7 stated file sizes agree. |
| Palette | P02-T02 | Passed | 88 pairs measured, 5 recorded below the floor, and 0 new failures. |
| Evidence anchors | P02-T02 | Passed | 993 unchanged, 0 drifted, 0 new, and 0 removed after the current-main merge. |
| Repository live contract | P02-T02 | Passed | 33 of 33 assumptions hold across 17 requests. |
| Added-issue live contract | P02-T02 | Passed | 238 of 238 generated issues match their approved mapping and live issue record. |
| Edge browser scenarios | P02-T02 | Passed | 119 assertions, 0 failed, across 14 scenarios on the current merged tree. |
| Implementation review | Review | Resolved | 3 medium regeneration findings fixed; 0 material findings remain open. |
| Post-publication review | Review | Resolved | 3 medium findings fixed; 0 material findings remain open. |
| Post-review focused suite | Review | Passed | 43 packet, inventory, resolver, manifest, provenance, and overlap tests passed. |
| Post-review failure proofs | Review | Passed | 3 isolated broken states failed the new guards before restoration. |
| Shipped overlap rerun | Review | Passed | All 10 reviewed report hashes stayed unchanged; the peer-argument regression retained 35 unique comparisons. |
| Issue-zero regeneration | Review | Passed | The checklist and pinned payload retain issue number 0; the 238-issue live contract passed. |
| Author rerun | Review | Passed | 10 Markdown files and the 36-entry manifest retained identical SHA-256 hashes. |
| Prepare rerun | Review | Passed | 0 of 10 approved mapping hashes changed; blocked mappings retained their blockers. |
| Explicit series approvals | Review | Passed | All 36 final title mismatches carry independently declared approval; 0 automatic bypasses remain. |
| Agent Merge authorization | Review | Resolved | The app supplied the required authorization state after three earlier launch paths could not. |
| Current-main reconciliation | Review | Passed | Main's 5 backlog items and UI changes coexist with this batch under unique ids; all merged gates pass. |

## Blockers

* None.

## Remaining Work

* Push the authorized merge resolution and wait for required checks and GitHub's approval state.

## Follow-Up Items

* None inside MRT-004.

### CHG-010: Pause batch two at the user approval gate

* Related phase or task: P03-T01.
* Trigger: The parent session superseded autonomous implementation with an explicit approval gate.
* First-batch baseline: Pull request 159 is merged at
  `19d92d7d2c955ec3572b90116e9bb5f9435c1094`.
* What changed: Audited the master sequence through position 14, refreshed only the ten proposed
  source pages and the earlier sources needed to prove skips, compared issue identities with all 36
  shipped order payloads, and recorded the proposal below.
* What did not change: No inventory disposition, mapping, overlap report, order Markdown, manifest,
  catalog, generated data, product document, test, dependency, commit, branch push, or pull request.
* Approval result: The user was unavailable. On 2026-08-21 the parent session approved this exact
  proposal for autonomous continuation under the user's autopilot instruction. This is parent
  approval, not an explicit user response.
* Review direction: A later parent instruction waived separate review-subagent and PR review passes
  for this batch. The exact identity, source-boundary, chronology, cover, and overlap checks remain
  mandatory and are recorded in CHG-011.

| Slot | Position and inventory source | Proposed id | Period | Exact source | Current state | Existing or peer overlap | Estimated rows | Required decision or blocker |
|---:|---|---|---|---|---|---|---:|---|
| 1 | 1, `early-2000s-until-disassembled` | `maximum-security` | 2000-2001 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/maximum-security/ | `deferred`, `not-applicable` | 0 shipped issue matches | 28 | Approve extracting the discrete crossover from the era source |
| 2 | 6, `decimation` | `decimation` | 2005-2007 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/guide-part-5-decimation/ | `new-order`, `blocked` | Issue 3095 is already in `house-of-m` | 57 | Five Generation M rows are absent; shared issue needs a disposition |
| 3 | 7, `house-of-m-to-civil-war` | `planet-hulk` | 2006-2007 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-comics-between-house-of-m-civil-war/ | `path-source`, `not-applicable` | 0 shipped issue matches | 15 | Approve extracting the explicit event spine |
| 4 | 10, `marvel-cosmic` | `annihilation-conquest` | 2007-2008 | https://www.comicbookherald.com/marvel-cosmic-reading-order/annihilation-conquest/ | `deferred`, `not-applicable` | 0 shipped issue matches | 29 core, 38 page-wide | Freeze the Nova and Guardians boundary |
| 5 | 10, `marvel-cosmic` | `war-of-kings` | 2008-2009 | https://www.comicbookherald.com/marvel-cosmic-reading-order/war-of-kings/ | `deferred`, `not-applicable` | Nova 29-31 overlap the Realm peer | 32 core | Assign issue ids 26094-26096 to one peer |
| 6 | 10, `marvel-cosmic` | `realm-of-kings` | 2009-2010 | https://www.comicbookherald.com/marvel-cosmic-reading-order/realm-of-kings/ | `deferred`, `not-applicable` | Nova 29-31 overlap the War peer | 28 or 29 | Resolve Nova 29-35 versus 29-36 and the peer overlap |
| 7 | 10, `marvel-cosmic` | `thanos-imperative` | 2010 | https://www.comicbookherald.com/marvel-cosmic-reading-order/ | `deferred`, `not-applicable` | 0 shipped or proposed-core matches | 8 | Approve the umbrella-page source boundary |
| 8 | 12, `civil-war-to-secret-invasion` | `silent-war` | 2007 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-comics-from-civil-war-to-secret-invasion/ | `path-source`, `not-applicable` | 0 shipped issue matches | 6 | Use the bridge page while position 13 stays excluded commerce |
| 9 | 12, `civil-war-to-secret-invasion` | `messiah-complex` | 2007-2008 | https://www.comicbookherald.com/herald-guided-tour-x-men-messiah-complex/ | `path-source`, `not-applicable` | 0 shipped issue matches | 13 | Approve the dedicated crossover split |
| 10 | 14, `world-war-hulk` | `world-war-hulk` | 2007-2008 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/world-war-hulk/ | `new-order`, `blocked` | Issue ids 15976, 16162, and 17231 overlap two shipped orders | 39 | Explicit overlap disposition required |

* Estimated core total: 255 rows. This is not a frozen packet total.
* Duplicate conclusion: None of the ten is a renamed or materially equivalent shipped order. Two
  candidates have shipped issue overlap, and the War and Realm peers overlap each other. Those
  relationships remain blockers rather than being waived by title or chronology.
* Earlier skipped positions: 2 is an overlapping Avengers Disassembled variant; 3 is the shipped
  Secret War sequence; 4 adds no unshipped discrete event; 5 is an overlapping House of M variant;
  8 is an excluded Extremis product link and a story arc rather than an event; 9 is the shipped
  Spider-Man: The Other sequence; 11 is an overlapping Civil War variant; and 13 is the excluded
  Silent War product link whose six-issue event is proposed from position 12's issue-bearing page.

### CHG-011: Resolve the approved packet and make three guarded substitutions

* Related phase or task: P03-T01.
* Exact-resolution result: Maximum Security 28, Planet Hulk 15, Annihilation: Conquest 29, War of
  Kings 32, Realm of Kings 28, The Thanos Imperative 8, Silent War 6, Messiah Complex 13, and World
  War Hulk 39 all resolved exactly. Decimation retained five unmatched Generation M rows.
* Overlap result: Realm of Kings shares Nova #29-31, issue ids 26094-26096, with War of Kings. World
  War Hulk shares issue ids 15976 and 16162 with `civil-war-avengers` and 17231 with
  `world-war-hulk-aftersmash`. No disposition permits those partial overlaps.
* Backfill checks: Utopia shares Dark Avengers #7-8 with `dark-reign-avengers`; Fall of the Hulks
  still lacks the MODOK issue; and Siege shares thirteen issues with `dark-reign-avengers`. Messiah
  War, Necrosha, and Second Coming are the first later missing events that resolve exactly and have
  no shipped or peer overlap.
* Final packet: 10 guides, 178 exact distinct issue ids, 450 complete comparison rows, 450 `none`
  relationships, and 0 shared ids.
* Live self-review: All 178 selected ids were fetched again. Every live issue number, series id,
  title, and Marvel issue URL equals its mapping. Every chosen cover is inside its mapping and has
  live cover metadata.
* Timeline review: The ten live first on-sale dates are 2000-10-01, 2006-02-08, 2007-01-24,
  2007-06-20, 2007-10-31, 2009-02-04, 2009-02-04, 2009-10-28, 2010-02-24, and 2010-05-26. Catalog
  order follows those dates and the reviewed same-day War of Kings then Messiah War placement, not
  the proposal numbering.

### CHG-012: Author and vendor the second guarded batch

* Related phase or task: P03-T02.
* Authored output: Ten flat checklists and ten manifest entries were generated only from approved
  mappings. Review-only cover evidence stayed in the mappings.
* Vendored output: Ten pinned payloads add 178 issues with 0 unresolved rows, placeholders, missing
  digital ids, missing covers, count warnings, or duplicate warnings. The catalog now holds 46
  orders.
* Lifecycle result: Four umbrella inventory records moved to `grouped-variant` and record their ten
  shipped child catalog ids. Decimation and World War Hulk remain blocked with exact evidence. The
  broad remainder of each grouped source stays deferred in its reason.
* Product record: The changelog, README, provenance inventory, and BL-182 now describe the second
  batch and its substitutions.

### CHG-013: Close the second batch release gates

* Related phase or task: P03-T02 and P03-T03.
* Failure proofs: Changing one generated issue id failed the mapping-to-payload sequence guard.
  Changing one overlap row to `partial` failed the packet-wide overlap guard. Moving Silent War to
  2010 failed the catalog chronology guard. Removing the insertion-anchor assertion failed its
  focused test. Each one-line mutation was restored and the focused guards then passed.
* Focused suite: 130 packet, inventory, resolver, catalog, manifest, overlap, and provenance tests
  passed with 0 failed.
* Full suite: 1,293 tests passed with 0 failed.
* Offline gates: lint reported 0; 156 ranked backlog rows, 5 parked rows, and 161 detail blocks all
  agree; all 7 stated file sizes agree; 88 palette pairs produced 0 new failures; publication
  found 0 content findings; and all 993 anchors are unchanged after the reviewed citation re-aims.
* Live gates: The repository contract passed 33 of 33 assumptions across 17 requests. The added
  packet contract passed 178 of 178 issue identities.
* Browser gate: Installed Edge passed 119 assertions across 14 scenarios.
* Reproduction: Preparation changed 0 of 10 approved mapping hashes, authoring changed 0 of 11
  manifest and Markdown hashes, and overlap regeneration changed 0 of 10 report hashes.
* Review disposition: The parent explicitly waived separate pre-PR and post-PR review-agent passes.
  Final self-review found and fixed one material chronology issue: year-only shelf sorting had put
  the new 2007 and 2010 events behind later existing events. Authoring now inserts each packet entry
  before a reviewed stable anchor, fails if any anchor is missing, preserves all existing relative
  order, and reproduces byte for byte.

### CHG-014: Pause batch three at the parent approval gate

* Related phase or task: P03-T01.
* Baseline: Pull request 161 is merged, and the selection audit used the current default branch.
* What changed: Re-audited the master sequence from position 1, compared the first two batches and
  all shipped catalog variants, and identified the next ten genuine missing event or aftermath
  sections without creating any production packet files.
* Proposed order: `x-men-divided-we-stand`, `x-men-manifest-destiny`, `x-men-nation-x`,
  `x-men-curse-of-the-mutants`, `wolverine-goes-to-hell`, `x-men-age-of-x`, `x-men-schism`,
  `x-men-regenesis`, `doomwar`, and `spider-island`.
* Master boundary: The first eight are distinct headings inside position 16, Doomwar comes from
  position 23, and Spider-Island closes the proposal at position 29.
* Duplicate review: None of the ten ids or three source pages exists in the catalog or approved
  mappings. Numbered and explicit source references produced zero shipped checklist matches.
  Exact issue-id overlap is not claimed before mapping.
* Material blocker: The position 16 page gives its eight event headings no HTML ids. All eight
  therefore share one exact URL, which the current peer-source uniqueness gate rejects even though
  their literal issue lists are distinct. Regenesis also lists Uncanny X-Men #3 twice, and Manifest
  Destiny includes two unnumbered anthology-material groups.
* Earlier skip result: Positions 1-15 are shipped, reused, excluded, path-only, or blocked as already
  recorded. Before position 29, Secret Invasion is reused; Dark Reign and Heroic Age are broad
  overlapping eras; Fall of the Hulks, Siege, and Fear Itself remain blocked; Shadowland and Chaos
  War are shipped; Utopia and Children's Crusade have shipped overlap.
* What did not change: No mapping, overlap report, inventory disposition, order Markdown, manifest,
  catalog, generated data, product or tooling code, test, commit, push, or pull request was created.
* Approval gate: Explicit parent approval or revision is required, including a durable decision for
  the repeated source URL, before any P03-T01 implementation begins.
