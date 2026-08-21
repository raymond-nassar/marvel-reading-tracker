<!-- markdownlint-disable-file -->
# RPI Plan: Modern Marvel continuity guides

## Task Metadata

* Task ID: MRT-004
* Task slug: modern-marvel-continuity-guides
* Planning status: Complete, P01 ready
* Plan date: 2026-08-20
* Research: .copilot-tracking/research/2026-08-20/modern-marvel-continuity-guides-research.md
* Source inventory: .copilot-tracking/research/subagents/2026-08-20/modern-marvel-continuity-guides-external-wider.md
* Phase details: .copilot-tracking/details/2026-08-20/modern-marvel-continuity-guides-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-20/modern-marvel-continuity-guides-plan-critique.md

## Executive Summary

Create a repeatable build-time intake system for Comic Book Herald's 86 modern Earth-616 source
links, prove it with a 10-order first production batch anchored by World War Hulk: Aftersmash,
and keep expanding only within the approved historical-event batch. Broad eras, bridges, fast
tracks, ambiguous overlaps, post-snapshot material, and unrelated family paths remain visible in the
inventory but do not enter the active production lane unless a reviewer approves them as part of the
same batch.

The execution boundary is now a single production batch: one maintained inventory, deterministic
source-to-issue resolution, complete pairwise overlap reporting, and a frozen 10-order packet that
keeps the PR's major feature coherent without imposing the old one-list limitation. The first PR can
ship a real batch once the packet is frozen and the pack-level overlap and scope checks pass, while
future PRs keep the same production gate rather than reintroducing a one-guide bottleneck.

### Confirmed User Decisions

* Use the permission granted by Comic Book Herald.
* Cover modern Marvel main-universe continuity.
* Make tasks executable by a lower-capability model.
* Prioritize discrete events and aftermaths before broad eras and bridges.
* Launch implementation in a nested session using an MAI model after this plan is complete.
* The next production PR targets a 10-order batch, not a one-list or two-list limit. The batch is
  the PR's major feature, and the packet is frozen by source order and stop conditions before any
  order is authored.
* Select the first 10 eligible `new-order` event or aftermath records by ascending `position` in
  `scripts/data/cbh-modern-inventory.json`, skipping commerce, excluded, deferred/recent-source,
  path-source, fast-track, broad-era or bridge work, reuse-existing items, and any record blocked by
  exact-resolution or overlap gates; backfill only with the next eligible record without reordering.
* After the merge from `origin/main`, duplicate prevention is an active invariant in the packet gate:
  no batch id, source URL, exact selected issue sequence, or catalog id may duplicate an existing
  shipped order or the other nine peer guides. Title similarity is a prompt to investigate, never a
  proof of equivalence, and any duplicate match is skipped with evidence before the next eligible
  record is considered.

### Important Boundaries

* Credit Comic Book Herald on every derived catalog card and link to the exact guide followed.
* Do not copy editorial commentary, images, advertisements, or affiliate material.
* Keep `sourceLicense` null and use
  `Compiled for this project from Comic Book Herald's guide` as `sourceOrigin`.
* Add no runtime dependency and no browser runtime data for the program inventory.
* Do not guess issue identity, chronology, grouping, variant treatment, or path placement.
* Defer 2026 material and any absent post-snapshot issue metadata to a separate recent-source plan.

## Goals

* Preserve all 86 source records in one maintained, machine-checkable inventory.
* Make source-reference resolution deterministic and reviewable.
* Detect overlap against every shipped order before a new order is authored.
* Prove the process with a 10-order historical batch in source order, anchored by the first eligible
  event records and not by a one-list limit.
* Deliver historical event guides in independently reviewable batches that match the queue and guard
  rails rather than a smaller default.
* Keep era, bridge, family-path, and recent-source work explicit without mixing it into event work.

## Non-Goals

* Adding production guides in the foundation pull request.
* Treating every source link as a shelf order.
* Building one monolithic continuity sequence.
* Copying Comic Book Herald prose or automating extraction from its HTML.
* Redesigning the catalog, persistence, origin, or reader-launch behavior.
* Expanding to alternate universes, Star Wars, pre-modern year-by-year reading, or character guides.
* Inventing a replacement metadata source for 2026 material.

## Program Contracts

### Maintained inventory contract

The implementation inventory is `scripts/data/cbh-modern-inventory.json`. It is a JSON array sorted
by `position`. Every record has exactly these required fields:

| Field | Type | Rule |
|---|---|---|
| `position` | integer | Unique 1 through 86 |
| `id` | lower-kebab-case string | Unique and stable |
| `title` | string | Source title using repository punctuation |
| `url` | absolute URL string | Exact source target |
| `guideType` | enum | `event`, `era`, `sub-guide`, `bridge`, `fast-track`, or `commerce` |
| `window` | enum | `Q1` through `Q7` |
| `disposition` | enum | `new-order`, `reuse-existing`, `grouped-variant`, `path-source`, `deferred`, or `excluded` |
| `reason` | non-empty string | Why this disposition is safe |
| `sourceRetrievedAt` | date string | Last source review date |
| `overlapIds` | string array | Empty in the baseline; later populated only from committed overlap reports |
| `catalogIds` | string array | Empty in the baseline; populated only when a catalog order is reused or shipped |
| `deliveryStatus` | enum | `pending`, `ready`, `shipped`, `blocked`, or `not-applicable` |

The baseline must preserve 42 events, 14 eras, 14 sub-guides, 10 bridges, 3 fast tracks, and
3 commerce records. Commerce records are always `excluded`. Armageddon is always `deferred` until a
recent-source workflow exists. A refresh may change title, URL, type, reason, or disposition but may
not silently renumber or remove a record. Additions use the next position and record the source
change in the same pull request.

The baseline sets every `overlapIds` array to empty because P01-T01 precedes the overlap tool.
Reasons may describe researched overlap, but the machine field must not translate prose into ids.
P02 and P03 populate it only from the committed report for that guide. Baseline `catalogIds` arrays
are also empty. Baseline `new-order` records use delivery status `pending`; every other disposition
uses `not-applicable`.

P02 and P03 may move `pending` to `ready` only after a complete approved packet, then to `shipped`
only after the catalog entry passes validation. A planner may move `pending` or `ready` to `blocked`
only with the exact blocker in the reason. P03 selects only records whose disposition is
`new-order` and delivery status is `pending`.

### Source mapping contract

Each approved guide gets `scripts/data/cbh-mappings/<id>.json`. It contains the inventory id,
source URL, retrieval date, approved editorial fields, approved source count, and an ordered `rows`
array. Every row has source position, source issue reference, normalized series title, series year
when known, issue number, resolution status, candidate issue ids, selected issue id, exact Marvel
issue URL, and a non-empty note for any manual selection.

Allowed resolution statuses are `exact`, `ambiguous`, `unmatched`, and `approved-exception`.
Automatic resolution may set `selectedIssueId` only when exactly one normalized exact match exists.
Ambiguous and unmatched rows retain candidates, leave selection empty, and make the command exit
nonzero. A person with editorial authority may commit an explicit selection or preserve an
`approved-exception` for a future workflow. P02 and P03 under MRT-004 reject every
`approved-exception` and stop before authoring.

### Overlap contract

`scripts/report-order-overlap.mjs` compares the proposed selected issue-id sequence with every
shipped order in `src/data/curated-lists.json` and with every other guide in the current batch. It
emits one deterministic JSON report at `scripts/data/cbh-overlaps/<id>.json`, including each
compared order id, shared count, ordered shared issue ids, and relationship classification.

Allowed relationships are `none`, `partial`, `candidate-subset`, `existing-subset`, and `exact`.
Any relationship other than `none` requires a pre-approved inventory disposition before authoring.
Chronological distance is never overlap evidence.

### Lower-capability implementation contract

The implementation model must:

1. Work from one named inventory id and its pre-approved editorial fields.
2. Extract only issue-bearing references and expand ranges to one row per issue.
3. Run the resolver and stop on any ambiguous or unmatched row.
4. Run the overlap report and stop on any unapproved relationship.
5. Author Markdown only from reviewed rows with exact Marvel issue URLs.
6. Use `##` headings only for approved collected-edition groups, never narrative phases.
7. Treat count warnings, duplicate warnings, placeholders, and unresolved items as failures.
8. Change no editorial field, disposition, batch membership, or exception without escalation.

The implementation model may not choose type, depth, beginner status, timeline, group, variant,
reading path, overlap treatment, approved count, ambiguous identity, or a threshold exception.

### Batch contract

* Default target and normal review unit: 10 eligible historical event or aftermath orders per pull
  request.
* One coherent batch is the PR's major feature and is reviewed as a single packet.
* The batch is selected only from the first eligible `new-order` event or aftermath records by
  ascending `position` in `scripts/data/cbh-modern-inventory.json`; commerce, excluded,
  deferred/recent-source, path-source, fast-track, broad era or bridge work, reuse-existing items, and
  any record blocked by exact-resolution or overlap gates are skipped and recorded before the next
  eligible record is considered.
* Backfill only with the next eligible record without reordering. The packet stops at 10 or at the
  last eligible record, whichever comes first, and any stop condition blocks that record without
  weakening the repository gate.
* Duplicate prevention stays active across the whole packet: a candidate whose batch id, source URL,
  exact selected issue sequence, or catalog id matches a shipped order or any peer guide is not
  eligible for this batch and is skipped with the exact evidence before the next eligible record is
  considered.
* Soft generated-data ceiling and total scope remain subject to repository size gates and per-guide
  correctness, not to a one-list default. The batch remains reviewable only so long as the packet is
  coherent and every guide keeps the exact-resolution and overlap gates.

## Validation Contract

### Per guide

* Source worksheet count equals the approved count.
* Every non-exception row resolves to one exact Marvel issue URL.
* Vendor output has the approved count, zero unresolved items, zero placeholders, zero duplicate
  warnings, and no count warning.
* Generated issue-id order exactly equals the reviewed mapping.
* Catalog provenance equals the frozen manifest fields.
* First, middle, final, and every exception-adjacent source row are manually compared.

### Per pull request

* Run the smallest focused tests for changed inventory, resolver, overlap, Markdown, curated data,
  catalog data, and paths.
* Run `npm run lint`, `npm test`, and `npm run anchors`.
* Run `npm run counts`, `npm run sizes`, `npm run palette`, and `npm run publication`.
* Run `npm run contract` when the pull request adds issue ids.
* Run `npm run browser` for the pilot and for grouping, path, or catalog behavior changes.
* Prove each new check fails without the smallest condition it protects before accepting it.
* Stage new tracked files before the anchors gate, inspect every re-aim, bless, then require a clean
  second anchors run.

## Phase Checklist

<!-- rpi:phase id=P01 -->
### [ ] P01: Build the source-intake foundation

* Intent: Turn the researched source program into maintained build-time data and deterministic tools.
* Pull request boundary: Inventory, resolver, overlap report, tests, contributor docs, backlog, and
  changelog only. No production reading guide.
* Dependencies: Completed research and approved event-first lane.

<!-- rpi:task id=P01-T01 -->
#### [ ] P01-T01: Add and validate the maintained inventory

* Inputs: The 86-record external inventory and this plan's inventory contract.
* Exact outputs: `scripts/data/cbh-modern-inventory.json` and
  `test/cbh-modern-inventory.test.js`.
* Pass conditions: 86 unique records, positions 1 through 86, exact type totals, closed enums,
  non-empty reasons, three excluded commerce records, and deferred Armageddon.
* Stop conditions: Source count differs from 86, a record cannot be reconciled, or a disposition
  needs editorial judgment not recorded here.

<!-- rpi:task id=P01-T02 -->
#### [ ] P01-T02: Add the deterministic issue resolver

* Inputs: One mapping file that follows the mapping contract, existing issue search, series index,
  series-issue lookup, and build-time fetch helpers.
* Exact outputs: `scripts/resolve-cbh-order.mjs`, reusable helpers under `scripts/lib/`,
  `test/cbh-resolver.test.js`, package command `cbh:resolve`, and documented CLI examples.
* Pass conditions: A unique exact normalized match is accepted; zero or multiple exact matches are
  persisted as unresolved candidates and exit nonzero; tests use local fakes and no network.
* Stop conditions: Resolver needs a runtime dependency, HTML scraping, or automatic fuzzy selection.

<!-- rpi:task id=P01-T03 -->
#### [ ] P01-T03: Add the complete overlap report

* Inputs: A resolved mapping sequence, the curated manifest, shipped generated orders, and optional
  batch-peer mappings.
* Exact outputs: `scripts/report-order-overlap.mjs`, reusable helpers under `scripts/lib/`,
  `test/order-overlap-report.test.js`, package command `orders:overlap`, and documented CLI examples.
* Pass conditions: Every shipped order is compared; exact, subset, and partial relationships are
  deterministic; duplicate proposed ids fail; output order is stable.
* Stop conditions: Any shipped order is skipped silently or chronology is used as a proxy.

<!-- rpi:task id=P01-T04 -->
#### [ ] P01-T04: Close the foundation pull request

* Inputs: P01-T01 through P01-T03.
* Exact outputs: Contributor guidance in `README.md`, permission and data-flow clarification in
  `docs/DATA_PROVENANCE.md`, one backlog record, and an Unreleased changelog entry.
* Pass conditions: Focused tests and all offline gates pass, every new check has a failure proof,
  the inventory remains build-time only, and no reading guide is added.

<!-- rpi:phase id=P02 -->
### [ ] P02: Freeze and ship the first 10-order event batch

* Intent: Use the foundation on the earliest eligible production packet in source order, not a
  one-guide pilot.
* Pull request boundary: The first 10 eligible `new-order` event or aftermath records by ascending
  inventory position, plus their mappings, overlap reports, generated data, tests, product records,
  and direct workflow corrections.
* Dependencies: P01 merged or present on the implementation branch.
* Selected packet: `secret-war`, `decimation`, `spider-man-the-other`, `world-war-hulk`,
  `world-war-hulk-aftersmash`, `fall-of-the-hulks`, `shadowland`, `chaos-war`, `fear-itself`,
  and `avengers-vs-x-men`.

<!-- rpi:task id=P02-T01 -->
#### [ ] P02-T01: Refresh and freeze the production packet

* Inputs: The 10 eligible inventory ids above, their exact source pages, and their current metadata
  rows.
* Exact outputs: Updated inventory review dates, 10 reviewed mappings, 10 overlap reports, approved
  manifest field blocks, and recorded first, middle, and final checks for each guide.
* Pass conditions: Each selected guide resolves to exact issue ids with zero ambiguity and no
  approved exceptions, no unapproved overlap exists within the batch or against shipped orders, the
  selected packet remains the earliest eligible record set under the position-order rule, and every
  selected record moves to `ready` before vendor output.
* Stop conditions: A candidate is not eligible under the source-order rule, exact resolution fails,
  overlap is not pre-approved, or a later record still meets the rule while an earlier record remains
  skipped without a recorded blocker.

<!-- rpi:task id=P02-T02 -->
#### [ ] P02-T02: Author and vendor the batch

* Inputs: Approved P02-T01 packet and manifest fields for all 10 guides.
* Exact outputs: Ordered Markdown files, one manifest entry per list, generated JSON outputs, focused
  assertions, backlog, changelog, provenance, and contributor updates directly required by observed
  failures.
* Pass conditions: Every selected guide keeps the exact issue-id sequence from its reviewed mapping,
  zero placeholders and warnings remain, all gates pass, live contract passes for all added issue ids,
  browser checks pass, and each new semantic check has a smallest-revert failure proof. The selected
  inventory records then move to `shipped` with their catalog ids.

<!-- rpi:phase id=P03 -->
### [ ] P03: Deliver historical event batches

* Intent: Repeat the proven process for event-first candidates without widening into eras or bridges.
* Dependencies: P02 complete.
* Queue order: Q1 through Q7, but skip `reuse-existing`, `deferred`, `path-source`, and `excluded`
  records until their own approved work item.

<!-- rpi:task id=P03-T01 -->
#### [ ] P03-T01: Prepare one batch packet

* Inputs: The next position whose disposition is `new-order` and delivery status is `pending`.
* Exact outputs: Refreshed inventory record, reviewed mapping, overlap report, frozen manifest fields,
  approved count, source spot-check positions, and declared target-file list.
* Pass conditions: Every decision is frozen before implementation and the batch contract is met.

<!-- rpi:task id=P03-T02 -->
#### [ ] P03-T02: Implement one approved batch

* Inputs: Exactly one P03-T01 packet, or two only when the packet explicitly approves the exception.
* Exact outputs: Declared Markdown, manifest, generated, focused test, provenance, backlog, and
  changelog files.
* Pass conditions: Per-guide and per-pull-request validation contracts pass with recorded counts.
* Stop conditions: Any new source, new editorial decision, ambiguous issue, unapproved overlap, or
  threshold breach.

<!-- rpi:task id=P03-T03 -->
#### [ ] P03-T03: Reconcile and select the next record

* Inputs: Completed batch evidence and current maintained inventory.
* Exact outputs: `shipped` delivery status and catalog ids for completed records, or a planner-owned
  `blocked` status with an exact reason, plus one next batch packet.
* Pass conditions: No record is silently skipped and resolved work is not reopened in the same task.

<!-- rpi:phase id=P04 -->
### [ ] P04: Plan deferred continuity families

* Intent: Create separate plans only after the event workflow has evidence.
* Included follow-ups: Broad eras, bridge guides, fast tracks, family-specific paths, shipped-order
  variant decisions, Siege ambiguity, Secret Wars overlap, and recent-source handling.
* Excluded: Implementing these lanes under this plan without a new reviewed task.

<!-- rpi:task id=P04-T01 -->
#### [ ] P04-T01: Re-rank deferred work

* Inputs: Current inventory, shipped event results, unresolved overlap reports, and source freshness.
* Exact outputs: Ranked follow-up candidates with evidence and separate task identities.
* Pass conditions: Era and bridge work does not inherit event assumptions, and 2026 work identifies
  an approved metadata source before implementation.

## Dependencies and Sequence

| Task | Depends on | Unlocks |
|---|---|---|
| P01-T01 | Research and event-first decision | P01-T02, P01-T03 |
| P01-T02 | P01-T01 schema | P02-T01 |
| P01-T03 | P01-T01 schema | P02-T01 |
| P01-T04 | P01-T01 through P01-T03 | P02 |
| P02-T01 | P01 | P02-T02 |
| P02-T02 | P02-T01 | P03 |
| P03-T01 | P02 or prior P03 batch | P03-T02 |
| P03-T02 | P03-T01 | P03-T03 |
| P03-T03 | P03-T02 | Next P03 batch or P04 |

## Candidate Change and Test Lock

* P01 adds no production order or generated catalog entry.
* P01 may add one inventory file, two CLI entry points, reusable build-time helpers, three focused
  test files, two package commands, and directly related docs and product records.
* P02 adds exactly one authored order, one mapping, one overlap report, one manifest row, one
  generated order, catalog changes, and directly related tests and records.
* P03 defaults to the same file shape as P02 for one guide.
* No task may delete or replace a shipped order without a separate approved overlap disposition.

## Critique Disposition

| Critique run and finding | Disposition | Plan response or residual risk |
|---|---|---|
| PC-001, delivery lifecycle | Applied | Added delivery status, catalog ids, baseline rules, queue filter, and transitions |
| PC-002, approved exceptions | Applied | P02 and P03 now reject every approved exception before authoring |
| Final-candidate critique | Complete, Revise | Both direct corrections applied; no user decision or second critique required |

## Follow-Up Items

* Plan a recent-source workflow for evolving 2025 and 2026 guides after the historical lane proves
  demand and an approved metadata source exists.
* Plan broad era, bridge, fast-track, and parallel family paths as separate tasks after P02.

## Handoff

* Ready phase: P01 only.
* Implementation artifact: .copilot-tracking/changes/2026-08-20/modern-marvel-continuity-guides-changes.md
* Implementation session: A nested worktree session based on this branch, using an MAI model.
* Child scope: Execute P01, not P02 through P04.
* Remaining blocker: None for P01.

## P03 Batch Two Proposal Addendum

* Proposal date: 2026-08-21
* Status: Approved for autonomous P03-T01 execution by the parent session on 2026-08-21.
* First-batch baseline: Pull request 159 is merged at commit
  `19d92d7d2c955ec3572b90116e9bb5f9435c1094`.
* Scope correction: The next ten pending `new-order` records are not automatically the next batch.
  The early master sequence contains distinct events inside deferred era and path-source records.
  The proposal therefore closes at master position 14 instead of jumping to position 49.
* Approval record: The user was unavailable. The parent session approved autonomous continuation
  under the user's autopilot instruction. This is parent approval, not an explicit user response.
* Review direction: A later parent instruction waived separate review-subagent passes for this
  release. Exact mappings, source boundaries, covers, timelines, and substitutions still require a
  complete self-review and every machine gate before delivery.

### Proposed ten reading orders

The proposal follows the master sequence first, then the order of distinct event links inside a
shared source. The row total is an estimate for selection only. It is not an approved packet count.

| Slot | Master position and inventory source | Proposed reading order | Period | Exact Comic Book Herald source | Current disposition and status | Existing coverage or issue overlap | Estimated rows and complexity | Decision or blocker before mapping |
|---:|---|---|---|---|---|---|---|---|
| 1 | 1, `early-2000s-until-disassembled`, Early 2000s Until Avengers Disassembled | `maximum-security` | 2000-2001 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/maximum-security/ | `deferred`, `not-applicable` | No exact issue from the 28-row source list appears in a shipped order | 28, medium | Approve splitting one discrete crossover from the deferred era source |
| 2 | 6, `decimation`, Decimation and Tie-Ins | `decimation` | 2005-2007 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/guide-part-5-decimation/ | `new-order`, `blocked` | `house-of-m` already contains issue 3095, the Day After one-shot | 57, high | Five Generation M rows remain absent from repository metadata, and the one shared issue needs an overlap disposition |
| 3 | 7, `house-of-m-to-civil-war`, Comics Getting You From House of M to Civil War | `planet-hulk` | 2006-2007 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-comics-between-house-of-m-civil-war/ | `path-source`, `not-applicable` | No exact issue in the 15-row event spine appears in a shipped order | 15, low to medium | Approve extracting the explicit Planet Hulk spine from a path source |
| 4 | 10, `marvel-cosmic`, What about Marvel Cosmic? | `annihilation-conquest` | 2007-2008 | https://www.comicbookherald.com/marvel-cosmic-reading-order/annihilation-conquest/ | `deferred`, `not-applicable` | No exact issue appears in a shipped order; the existing `annihilation` order is the prior event | 29 core or 38 page-wide, high | Freeze whether Nova 1-3 and Guardians 1-6 are adjacent material or part of this order |
| 5 | 10, `marvel-cosmic`, What about Marvel Cosmic? | `war-of-kings` | 2008-2009 | https://www.comicbookherald.com/marvel-cosmic-reading-order/war-of-kings/ | `deferred`, `not-applicable` | No shipped overlap; a literal peer comparison shares Nova 29-31 with Realm of Kings | 32 core, high | Assign Nova 29-31 to one peer before both can pass the zero-overlap gate |
| 6 | 10, `marvel-cosmic`, What about Marvel Cosmic? | `realm-of-kings` | 2009-2010 | https://www.comicbookherald.com/marvel-cosmic-reading-order/realm-of-kings/ | `deferred`, `not-applicable` | No shipped overlap; Nova 29-31 are peer overlaps with War of Kings, issue ids 26094-26096 | 28 or 29, high | Resolve the source disagreement between Nova 29-35 and the bridge collection's Nova 29-36, then resolve the peer overlap |
| 7 | 10, `marvel-cosmic`, What about Marvel Cosmic? | `thanos-imperative` | 2010 | https://www.comicbookherald.com/marvel-cosmic-reading-order/ | `deferred`, `not-applicable` | No shipped or proposed-core issue overlap found | 8, medium | The source gives an exact eight-issue spine but no dedicated Comic Book Herald event page; approve the umbrella-page boundary |
| 8 | 12, `civil-war-to-secret-invasion`, Comics Getting You From Civil War to Secret Invasion | `silent-war` | 2007 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-comics-from-civil-war-to-secret-invasion/ | `path-source`, `not-applicable`; position 13 is an excluded commerce pointer | No exact issue appears in a shipped order | 6, low | Approve the issue-bearing bridge page as the source while leaving the commerce record excluded |
| 9 | 12, `civil-war-to-secret-invasion`, Comics Getting You From Civil War to Secret Invasion | `messiah-complex` | 2007-2008 | https://www.comicbookherald.com/herald-guided-tour-x-men-messiah-complex/ | `path-source`, `not-applicable` | No exact issue appears in a shipped order | 13, medium | Approve splitting the dedicated crossover linked by the bridge and fast-track sources |
| 10 | 14, `world-war-hulk`, World War Hulk and Tie-Ins | `world-war-hulk` | 2007-2008 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/world-war-hulk/ | `new-order`, `blocked` | Three exact overlaps: issue ids 15976 and 16162 in `civil-war-avengers`, and 17231 in `world-war-hulk-aftersmash` | 39, high | Requires an explicit overlap disposition; the distinct event scope alone cannot bypass the zero-overlap gate |

Estimated core total: 255 rows. The total cannot be frozen until the Conquest and Realm boundaries
and the War of Kings to Realm of Kings peer overlap are decided.

### Earlier positions not proposed as new orders

| Position | Inventory source | Reason for not proposing another order |
|---:|---|---|
| 2 | `avengers-disassembled` | The source has a broader 34-row tie-in order, but the shipped five-issue order is an exact existing subset. This is a variant decision, not a distinct event. |
| 3 | `secret-war` | The exact five-issue source sequence is already shipped. |
| 4 | `disassembled-to-house-of-m` | Its only discrete event is Secret War, already shipped; the remaining material is a continuity path of ongoing runs. |
| 5 | `house-of-m` | The source is broader than the shipped variants, but it shares the complete eight-issue main series and many branded tie-ins. A new row would require a variant and overlap decision. |
| 8 | `iron-man-extremis-commerce` | The master link is commerce-only and the material is a single story arc rather than a distinct event order. |
| 9 | `spider-man-the-other` | The exact 12-issue source block is already shipped. |
| 11 | `civil-war` | Three shipped readings already cover the event, including the complete seven-issue main series. The larger source is an overlapping variant, not a new event. |
| 13 | `silent-war-commerce` | The product link remains excluded. Slot 8 uses the issue-bearing Comic Book Herald bridge page instead. |

Selected-source residuals remain out of scope: position 1 keeps its other runs and arcs deferred;
position 7 already has shipped Spider-Man: The Other and Annihilation coverage; position 10 does not
reopen the shipped Annihilation core; and position 12 does not duplicate Planet Hulk, Conquest, or
World War Hulk.

### Final packet reconciliation

Three approved candidates stopped without an exception:

| Approved candidate | Blocking evidence | Chronological replacement |
|---|---|---|
| `decimation` | Generation M #1-5 have no repository metadata, and issue 3095 overlaps `house-of-m` | `messiah-war` |
| `realm-of-kings` | Nova #29-31, issue ids 26094-26096, overlap `war-of-kings` | `necrosha` |
| `world-war-hulk` | Issue ids 15976, 16162, and 17231 overlap two shipped orders | `second-coming` |

Utopia was not used because Dark Avengers #7-8 already ship in the Dark Reign Avengers order. Fall
of the Hulks still lacks its MODOK issue identity. Siege overlaps thirteen issues in the same shipped
Avengers order. The replacements are therefore the first later missing events that pass both gates.

The final packet holds 178 exact and distinct issue ids. Each guide has 45 complete comparisons
against 36 shipped orders and nine peers, for 450 `none` relationships and zero shared issues.

Catalog placement is separate from the approved intake queue. The frozen catalog order is Maximum
Security, Planet Hulk, Silent War, Annihilation: Conquest, Messiah Complex, War of Kings, Messiah
War, Necrosha, Second Coming, and The Thanos Imperative. Live metadata independently fixes their
first on-sale dates to 2000-10-01, 2006-02-08, 2007-01-24, 2007-06-20, 2007-10-31, 2009-02-04,
2009-02-04, 2009-10-28, 2010-02-24, and 2010-05-26.
