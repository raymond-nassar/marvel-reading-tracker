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

## P03 Batch Three Selection Proposal Addendum

* Proposal date: 2026-08-21.
* Status: Awaiting explicit parent approval. This is selection research, not a frozen production
  packet.
* Baseline: Pull request 161 is merged at `04b68d9d87aab30c5cc3c557e51825a4a2b07871`,
  and the default branch used for this audit is `e5d41287182febc1396f167dc4286b42cb6f9795`.
* Ordering rule: Preserve master position first, then heading order inside a shared source. Do not
  re-sort embedded sections by publication year.
* Research boundary: The audit starts again at position 1, confirms that the earlier residuals are
  runs, arcs, shipped events, or blocked events, then reaches ten genuine missing event or aftermath
  sections at position 29.
* No implementation authority: Mapping creation or refresh, inventory disposition changes, overlap
  reports, order Markdown, manifest or catalog edits, generated data, product or tooling code,
  tests, commits, pushes, and pull requests remain prohibited until the parent approves an exact
  packet and resolves the shared-source blocker.

### Proposed ten reading orders

The eight position 16 sections are explicitly framed by Comic Book Herald as X-Men events between
Messiah CompleX and Avengers vs. X-Men. Doomwar and Spider-Island are the next unblocked discrete
events in later issue-bearing bridge sources. The row figures are selection estimates only.

| Slot | Master position and inventory source | Proposed reading order and period | Exact Comic Book Herald source | Current disposition and status | Existing coverage or overlap | Estimated rows and complexity | Why this is the next gap | Decision or blocker |
|---:|---|---|---|---|---|---|---|---|
| 1 | 16, `x-men-events-fast-track` | `x-men-divided-we-stand`, X-Men: Divided We Stand, Feb 2008 - Aug 2008 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/x-men-events-from-messiah-complex-to-avengers-vs-x-men-2007-to-2012/ | `grouped-variant`, `shipped` | No catalog id, shipped source URL, or numbered source-reference match found; its source URL is shared with slots 2-8 | About 48, high | First unshipped aftermath heading after the shipped Messiah Complex order | Approve the literal collection sequence, including the source's Cable restriction; the shared URL fails the current peer-source uniqueness gate |
| 2 | 16, `x-men-events-fast-track` | `x-men-manifest-destiny`, X-Men: Manifest Destiny, July 2008 - Nov 2008 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/x-men-events-from-messiah-complex-to-avengers-vs-x-men-2007-to-2012/ | `grouped-variant`, `shipped` | No catalog id, shipped source URL, or numbered source-reference match found; its source URL is shared with slots 1 and 3-8 | 14 numbered rows plus 2 unnumbered anthology-material groups, high | Next unshipped heading in the position 16 source | The anthology material cannot be expanded into issue rows without proof; the shared URL also fails the current gate |
| 3 | 16, `x-men-events-fast-track` | `x-men-nation-x`, X-Men: Nation X, Sept 2009 - March 2010 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/x-men-events-from-messiah-complex-to-avengers-vs-x-men-2007-to-2012/ | `grouped-variant`, `shipped` | The explicit 20-row list has no shipped source-reference match; its source URL is shared with slots 1-2 and 4-8 | 20, medium | Next unshipped heading after shipped Messiah War and skipped Utopia | Approve the explicit list rather than the narrower 13-row collection summary; the shared URL fails the current gate |
| 4 | 16, `x-men-events-fast-track` | `x-men-curse-of-the-mutants`, X-Men: Curse of the Mutants, June 2010 - Jan 2011 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/x-men-events-from-messiah-complex-to-avengers-vs-x-men-2007-to-2012/ | `grouped-variant`, `shipped` | The explicit 18-row list has no shipped source-reference match; its source URL is shared with slots 1-3 and 5-8 | 18, medium | Next unshipped heading after shipped Necrosha and Second Coming | Approve the explicit list over the inconsistent collection summary; the shared URL fails the current gate |
| 5 | 16, `x-men-events-fast-track` | `wolverine-goes-to-hell`, Wolverine Goes to Hell, Sept 2010 - April 2011 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/x-men-events-from-messiah-complex-to-avengers-vs-x-men-2007-to-2012/ | `grouped-variant`, `shipped` | The explicit 15-row cross-title list has no shipped source-reference match; its source URL is shared with slots 1-4 and 6-8 | 15, medium | Next source heading, explicitly called an event and narrowed below the broad omnibus | Approve the 15 selected rows instead of the omnibus contents; the shared URL fails the current gate |
| 6 | 16, `x-men-events-fast-track` | `x-men-age-of-x`, X-Men: Age of X, Jan 2011 - May 2011 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/x-men-events-from-messiah-complex-to-avengers-vs-x-men-2007-to-2012/ | `grouped-variant`, `shipped` | The explicit 11-row list has no shipped source-reference match; its source URL is shared with slots 1-5 and 7-8 | 11, medium | Next unshipped event heading in the source | Approve the explicit list, which includes two X-Men: Legacy aftermath rows beyond the collection summary; the shared URL fails the current gate |
| 7 | 16, `x-men-events-fast-track` | `x-men-schism`, X-Men: Schism, July 2011 - Oct 2011 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/x-men-events-from-messiah-complex-to-avengers-vs-x-men-2007-to-2012/ | `grouped-variant`, `shipped` | The explicit 7-row list has no shipped source-reference match; its source URL is shared with slots 1-6 and 8 | 7, low | Next unshipped event heading in the source | Approve the seven ordered rows over the broader Prelude and Generation Hope collections; the shared URL fails the current gate |
| 8 | 16, `x-men-events-fast-track` | `x-men-regenesis`, X-Men: Regenesis, Oct 2011 - Feb 2012 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/x-men-events-from-messiah-complex-to-avengers-vs-x-men-2007-to-2012/ | `grouped-variant`, `shipped` | The listed rows have no shipped source-reference match; its source URL is shared with slots 1-7 | 44 listed rows and 43 textual uniques, high | Final unshipped aftermath heading before the fast track exits to Avengers vs. X-Men | Uncanny X-Men #3 is listed twice and cannot be silently deduplicated; the shared URL also fails the current gate |
| 9 | 23, `siege-to-heroic-age` | `doomwar`, Doomwar, 2010 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-comics-from-siege-to-the-heroic-age/ | `path-source`, `not-applicable` | No catalog id, shipped source URL, or Doomwar #1-6 source-reference match found | 6, low | First later unblocked discrete crossover after positions 17-22 are skipped or blocked | Approve extracting the six-issue miniseries from the bridge source |
| 10 | 29, `fear-itself-to-avx` | `spider-island`, Spider-Island, July 2011 - Nov 2011 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-comics-from-fear-itself-to-avengers-vs-x-men/ | `path-source`, `not-applicable` | No catalog id, shipped source URL, or match for the 14 collected source references found | 14, medium | First later unblocked discrete event after Heroic Age, Shadowland, Chaos War, and blocked Fear Itself | Approve the 14-row collection boundary from the issue-bearing bridge source |

The proposal contains no catalog-id duplicate and none of its three source pages is already used by a
shipped catalog order or approved mapping. Numbered and explicitly listed source references produced
zero matches in the 46 shipped order checklists. This is not an exact issue-id overlap disposition:
the eight position 16 candidates have no mappings, Manifest Destiny still has unnumbered material,
and every selected identity remains subject to the resolver and complete overlap report.

### Shared-source blocker

The position 16 page has plain `h2` headings with no HTML ids. All eight exact section sources are
therefore the same URL, and inventing fragments would create false source links. Their literal issue
lists are semantically distinct, but the current packet contract rejects repeated peer source URLs
before that distinction can be represented. Parent approval must choose a durable representation or
replace blocked siblings. Approval of the titles alone does not waive the machine gate.

### Earlier master positions not supplying another proposed order

| Position | Inventory source | Exact reason for skipping |
|---:|---|---|
| 1 | `early-2000s-until-disassembled` | Maximum Security is shipped. The page describes the rest as pre-event-era runs, arcs, or alternate material rather than another closed Marvel Universe event. |
| 2 | `avengers-disassembled` | Reuse existing; the wider source is an overlapping variant of the shipped order. |
| 3 | `secret-war` | The exact five-issue order is shipped. |
| 4 | `disassembled-to-house-of-m` | Secret War is the only source-framed mini-event and is shipped; the remainder is a continuity path. |
| 5 | `house-of-m` | Reuse existing; full and essential variants already cover the event. |
| 6 | `decimation` | Blocked by five absent Generation M issues and one House of M overlap. |
| 7 | `house-of-m-to-civil-war` | Planet Hulk is shipped; Spider-Man: The Other and Annihilation are covered elsewhere, and the remainder is a path of runs and arcs. |
| 8 | `iron-man-extremis-commerce` | Excluded commerce link and a single story arc. |
| 9 | `spider-man-the-other` | The exact 12-row crossover is shipped. |
| 10 | `marvel-cosmic` | Conquest, War of Kings, and The Thanos Imperative are shipped; Realm of Kings remains blocked, and Annihilation already exists. |
| 11 | `civil-war` | Reuse existing; three shipped variants cover the event. |
| 12 | `civil-war-to-secret-invasion` | Silent War and Messiah Complex are shipped; the other discrete event references are shipped or already blocked. |
| 13 | `silent-war-commerce` | Excluded commerce link; the issue-bearing event order is shipped from position 12. |
| 14 | `world-war-hulk` | Blocked by three exact overlaps with two shipped orders. |
| 15 | `world-war-hulk-aftersmash` | The exact aftermath order is shipped. |
| 17 | `secret-invasion` | Reuse existing; full and essential variants are shipped. |
| 18 | `secret-invasion-to-dark-reign` | War of Kings is shipped; the remaining rows are connective runs or arcs without another closed event boundary. |
| 19 | `dark-reign` | Broad era overlaps the shipped Dark Reign Avengers order; Utopia is also overlapped. |
| 20 | `fall-of-the-hulks` | Blocked because Fall of the Hulks: MODOK #1 is absent from repository metadata. |
| 21 | `dark-reign-to-siege` | Messiah War and Necrosha are shipped; Utopia is overlapped; Fall of the Hulks and Realm of Kings remain blocked. |
| 22 | `siege` | Blocked by thirteen shipped Dark Reign Avengers overlaps and unstable source rows. |
| 24 | `heroic-age` | Broad era overlaps the shipped Heroic Age Avengers order. Nine of the ten Children's Crusade rows are already shipped in two variants. |
| 25 | `shadowland` | The exact order is shipped. |
| 26 | `chaos-war` | The exact order is shipped. |
| 27 | `heroic-age-to-fear-itself` | Curse of the Mutants and Age of X are proposed earlier from position 16, Chaos War is shipped, and the residuals are runs or arcs. |
| 28 | `fear-itself` | Blocked by fifteen exact overlaps with the shipped Heroic Age Avengers order. |

### Embedded sections deliberately skipped

* Position 16: Messiah War, Necrosha, and Second Coming are shipped. Utopia has known shipped overlap.
* Position 23: Nation X is already proposed from its earlier source, Second Coming is shipped, World
  War Hulks belongs to the blocked position 20 event, and Thor: Siege Aftermath is a single-title arc.
* Position 29: Schism and Regenesis are already proposed from their earlier source. Circle of Four
  and the remaining entries are source-framed runs or arcs, not another discrete event or aftermath.

### Parent approval gate

The parent must approve or revise the exact ten-order continuity proposal and resolve the repeated
position 16 source URL before any P03-T01 implementation work starts. Until then, this addendum is
read-only selection evidence and no inventory lifecycle state changes.

## P03 Batch Four Selection Proposal Addendum

* Proposal date: 2026-08-21.
* Status: Awaiting explicit parent approval. This is candidate research and packet selection only.
* Baseline: The third batch is merged on the default branch at
  `de73f074e94b210011ea0569d426088d7ed152dc`.
* Ordering rule: Re-audit from the beginning, preserve master position before any publication-date
  ordering, and preserve visible section order inside a shared page. An earlier blocked umbrella
  does not hide a later clean section, but an exact or partial overlap still requires an approved
  disposition before selection.
* Research boundary: Earlier event gaps at positions 30 through 32 were reconsidered against all 56
  shipped catalog orders, all 30 shipped Comic Book Herald mappings, and all 30 shipped overlap
  reports. The proposal then advances through the first later eligible direct records and closes at
  position 56.
* No implementation authority: Mapping creation or refresh, inventory changes, overlap generation,
  order authoring, manifest or catalog edits, generated data, product or tooling changes, tests,
  commits, pushes, and pull requests remain prohibited until the parent approves or revises the exact
  packet below.

### Proposed ten reading orders

The first six proposals recover source-framed events that the inventory's record-level filters hid
inside a bridge or broad era. They use the existing page-plus-section identity contract and add no
URL fragment. The last four use dedicated source pages. Counts are selection estimates, not approved
mapping counts.

| Slot | Master position and source record | Proposed reading order and period | Exact Comic Book Herald source | Current disposition and status | Shipped or peer coverage | Estimated rows and complexity | Why this is the next chronological gap | Decision or blocker |
|---:|---|---|---|---|---|---|---|---|
| 1 | 31, `avx-to-marvel-now`, Comics Getting You From Avengers vs. X-Men to Marvel NOW! | `minimum-carnage`, Minimum Carnage, Oct-Nov 2012 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-now-checklist/ with `sourceSection: Minimum Carnage` | `path-source`, `not-applicable` | No proposed id, catalog id, source identity, or exact shipped checklist reference matches | 6 core rows, or 7 if Scarlet Spider #12 from the earlier collected block is retained; medium | First clean cross-title event after the blocked position 30 scopes | Parent must choose the explicit six-issue reading order or the seven-issue collected boundary. The section label is visible source text, and no fragment may be invented. |
| 2 | 32, `marvel-now`, Marvel NOW! Reading Order | `x-termination`, X-Men: X-Termination, Mar-Apr 2013 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-now-checklist/ with `sourceSection: X-Termination` | `deferred`, `not-applicable` | No proposed id, catalog id, source identity, or exact shipped checklist reference matches | 8 rows across four series; medium | First clean event section in the position 32 page after the skipped AvX aftermath | Approve extracting the literal eight-row section from the broad era source; exact resolution and full overlap reporting remain mandatory. |
| 3 | 32, `marvel-now`, Marvel NOW! Reading Order | `avengers-enemy-within`, Avengers: The Enemy Within, May-Jul 2013 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-now-checklist/ with `sourceSection: Avengers: The Enemy Within` | `deferred`, `not-applicable` | No exact shipped reference match. Captain Marvel #13 has a name-number collision with the 2000 series in Maximum Security, but the series year differs. | 5 rows across three series; low to medium | Next clean cross-title reading sequence after blocked Age of Ultron and the selected early Marvel NOW sections | Approve the five-entry reading-order line as the complete event boundary. |
| 4 | 32, `marvel-now`, Marvel NOW! Reading Order | `x-men-battle-of-the-atom`, X-Men: Battle of the Atom, Sep-Oct 2013 | https://www.comicbookherald.com/question-of-the-week-ok-what-the-heck-is-the-right-order-for-x-men-events/ with `sourceSection: Battle of the Atom` | `deferred`, `not-applicable` | No exact shipped reference match. Seven name-number matches use different 1963, 2010, or 2015 series instead of the proposed 2012 or 2013 series. | 10 interleaved rows across five series; medium | Next explicit event heading after The Enemy Within | Use the linked X-Men event sequence because the broad Marvel NOW page groups the issues by series instead of giving their reading order. |
| 5 | 32, `marvel-now`, Marvel NOW! Reading Order | `revolutionary-war`, Revolutionary War, Jan-Mar 2014 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-now-checklist/ with `sourceSection: Event: Revolutionary War` | `deferred`, `not-applicable` | No proposed id, catalog id, source identity, or exact shipped checklist reference matches | 8 one-shots; medium | First clean event heading after blocked Infinity and overlapped Inhumanity | Approve the literal eight-entry source order across the Alpha, six character one-shots, and Omega. |
| 6 | 32, `marvel-now`, Marvel NOW! Reading Order | `x-men-trial-of-jean-grey`, X-Men: The Trial of Jean Grey, Jan-Mar 2014 | https://www.comicbookherald.com/question-of-the-week-ok-what-the-heck-is-the-right-order-for-x-men-events/ with `sourceSection: Trial of Jean Grey` | `deferred`, `not-applicable` | No exact shipped reference match. Guardians of the Galaxy #13 collides by name and number with the 2008 series in War of Kings, but the proposed issue is from the 2013 series. | 6 interleaved rows across two series; low to medium | Next clean crossover sequence after Revolutionary War in the position 32 source flow | Approve the linked six-row X-Men event sequence and its non-fragment section identity. |
| 7 | 49, `monsters-unleashed`, Monsters Unleashed | `monsters-unleashed`, Monsters Unleashed, Jan-Mar 2017 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/monsters-unleashed/ | `new-order`, `pending` | No proposed id, catalog id, source identity, semantic scope, or exact shipped checklist reference matches | 13 rows; medium | Positions 33 through 48 are shipped, reused, blocked, broad-era, or exact-overlap work; this is the first later clean direct event | Approve only the 13-row issue-by-issue block, excluding historical Monsterbus material and the background prelude collection. Preserve each `1.MU` issue number exactly. |
| 8 | 52, `venomverse`, Venomverse | `venomverse`, Venomverse, Jun-Oct 2017 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/spider-man-venomverse/ | `new-order`, `pending` | No proposed id, catalog id, source identity, semantic scope, or exact shipped checklist reference matches; Spider-Verse is a different 2014 event | 11 core rows; medium | Secret Empire is overlapped and position 51 is a broad X-Men era, so Venomverse is the next clean event | Approve stopping after Edge of Venomverse #1-5, War Stories #1, and Venomverse #1-5. Poison-X and Venomized sit under a later continuation heading and are not part of the proposed boundary. |
| 9 | 55, `infinity-countdown-wars`, Infinity Countdown and Infinity Wars | `infinity-countdown-wars`, Infinity Countdown and Infinity Wars, Jan-Dec 2018 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/infinity-countdown/ | `new-order`, `pending` | No proposed id, catalog id, source identity, semantic scope, or exact shipped checklist reference matches; the 2018 family is distinct from the blocked 2013 Infinity mapping | 46 explicit rows; high | Generations is thematic tissue rather than a genuine event and Marvel Legacy is a broad era, making this the next eligible event family | Approve the explicit 46-row issue-by-issue flow or add Guardians of the Galaxy #146-149 from the collected lead-in for 50 rows. The combined Countdown and Wars boundary must stay one reviewed decision. |
| 10 | 56, `damnation`, Marvel Damnation | `damnation`, Marvel Damnation, Feb-May 2018 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/doctor-strange-damnation/ | `new-order`, `pending` | No proposed id, catalog id, source identity, semantic scope, or exact shipped checklist reference matches | 15 rows; medium | Next direct historical crossover after the selected position 55 family | Approve the 15-row issue checklist ending with Doctor Strange #389. Doctor Strange #390 is in the solo collection but outside the event checklist, and Scarlet Spider must resolve to the reviewed Ben Reilly series. |

The proposed explicit total is 128 rows. It becomes 129 if Minimum Carnage keeps Scarlet Spider #12
or 132 if Infinity Countdown also keeps Guardians of the Galaxy #146-149. Both boundary choices must
be resolved before any mapping count is approved.

### Duplicate and overlap review

* Proposed ids and catalog ids: None of the ten exists in the 56-entry catalog or the 43 mapping-file
  names. The four direct inventory ids are expected pending records, not shipped output.
* Source identity: Six proposals use two shared pages with six distinct non-empty `sourceSection`
  values. Four proposals use four unique dedicated URLs. No resulting page-plus-section identity or
  ordinary page URL matches a shipped catalog entry, an approved mapping, or a proposal peer.
* Source-reference check: The 128 explicit references were compared with every shipped checklist.
  Nine name-number collisions were found and each was a different series year. The year-aware result
  is zero exact textual identity matches.
* Existing packet evidence: All 30 shipped Comic Book Herald overlap reports still contain only
  `none` relationships. They do not substitute for new issue-id mappings or the required complete
  overlap reports after approval.
* Semantic scope: Exact title and normalized-id checks found no shipped equivalent. Manual review
  also distinguishes Venomverse from Spider-Verse and the 2018 Infinity family from 2013 Infinity.
* Remaining gate: Selection research cannot prove issue-id overlap for unresolved future mappings.
  Any exact, subset, or partial relationship found after approval blocks that proposal and requires
  source-order backfill. It may not be waived by title or chronology.

### Earlier candidates and sections not selected

All earlier event-like scopes are restated here so the fourth proposal is independently reviewable.

| Master position or source | Candidate or event-like scope | Exact reason for skipping |
|---|---|---|
| 1, `early-2000s-until-disassembled` | Maximum Security and residual material | Maximum Security is shipped. The remaining source material is runs, arcs, or alternate material rather than another closed event. |
| 2, `avengers-disassembled` | Avengers Disassembled wider order | Reuse existing. The wider source is an overlapping variant of the shipped five-issue order. |
| 3, `secret-war` | Secret War | The exact five-issue order is shipped. |
| 4, `disassembled-to-house-of-m` | Secret War and bridge material | Secret War is shipped; the rest is a continuity path. |
| 5, `house-of-m` | House of M wider order | Reuse existing. Full and essential shipped variants already cover the event. |
| 6, `decimation` | Decimation | Blocked by five absent Generation M issues and one House of M overlap. |
| 7, `house-of-m-to-civil-war` | Planet Hulk and other named material | Planet Hulk is shipped. Spider-Man: The Other and Annihilation are covered elsewhere; the residuals are runs or arcs. |
| 8, `iron-man-extremis-commerce` | Extremis | Excluded commerce link and a single story arc. |
| 9, `spider-man-the-other` | Spider-Man: The Other | The exact 12-row crossover is shipped. |
| 10, `marvel-cosmic` | Annihilation, Conquest, War of Kings, Realm of Kings, and The Thanos Imperative | Annihilation already exists; Conquest, War of Kings, and The Thanos Imperative are shipped; Realm of Kings remains blocked by peer overlap. |
| 11, `civil-war` | Civil War wider order | Reuse existing. Three shipped variants cover the event. |
| 12, `civil-war-to-secret-invasion` | Silent War, Messiah Complex, and other event links | Silent War and Messiah Complex are shipped; the remaining event references are shipped or blocked. |
| 13, `silent-war-commerce` | Silent War product link | Excluded commerce link; the issue-bearing order is shipped from position 12. |
| 14, `world-war-hulk` | World War Hulk | Blocked by three exact overlaps with two shipped orders. |
| 15, `world-war-hulk-aftersmash` | World War Hulk: Aftersmash | The exact aftermath order is shipped. |
| 16, `x-men-events-fast-track` | Eleven shipped child events and Utopia | Divided We Stand, Manifest Destiny, Messiah War, Nation X, Necrosha, Second Coming, Curse of the Mutants, Wolverine Goes to Hell, Age of X, Schism, and Regenesis are shipped. Utopia has shipped overlap. |
| 17, `secret-invasion` | Secret Invasion wider order | Reuse existing. Full and essential variants are shipped. |
| 18, `secret-invasion-to-dark-reign` | War of Kings and residual bridge material | War of Kings is shipped; the remaining material is connective runs or arcs. |
| 19, `dark-reign` | Dark Reign and Utopia | The broad era overlaps Dark Reign Avengers, and Utopia also has shipped overlap. |
| 20, `fall-of-the-hulks` | Fall of the Hulks and World War Hulks | Blocked because Fall of the Hulks: MODOK #1 is absent from repository metadata. |
| 21, `dark-reign-to-siege` | Messiah War, Necrosha, Utopia, Fall of the Hulks, and Realm of Kings | Messiah War and Necrosha are shipped, Utopia overlaps shipped work, and the other two scopes remain blocked. |
| 22, `siege` | Siege | Blocked by thirteen Dark Reign Avengers overlaps and unstable source rows. |
| 23, `siege-to-heroic-age` | Doomwar and other named material | Doomwar, Nation X, and Second Coming are shipped. World War Hulks is blocked, and Thor: Siege Aftermath is a single-title arc. |
| 24, `heroic-age` | Heroic Age and Children's Crusade | The broad era overlaps Heroic Age Avengers; nine of ten Children's Crusade rows are already shipped in two variants. |
| 25, `shadowland` | Shadowland | The exact order is shipped. |
| 26, `chaos-war` | Chaos War | The exact order is shipped. |
| 27, `heroic-age-to-fear-itself` | Curse of the Mutants, Age of X, Chaos War, and residual material | The three events are shipped; the residuals are runs or arcs. |
| 28, `fear-itself` | Fear Itself | Blocked by fifteen Heroic Age Avengers overlaps. |
| 29, `fear-itself-to-avx` | Spider-Island, Schism, Regenesis, Circle of Four, and residual material | The first three are shipped. Circle of Four and the remaining entries are source-framed runs or arcs. |
| 30, `avengers-vs-x-men` | Avengers vs. X-Men | Blocked by seventeen Heroic Age Avengers overlaps. |
| 30, `avengers-vs-x-men` | AvX: Consequences | Its five clean issues are an exact subset of the existing blocked whole-page mapping. No approved split disposition exists, so it cannot enter this proposal. |
| 31, `avx-to-marvel-now` | Spider-Men, Exiled, Everything Burns, and other bridge material | Spider-Men is an alternate-universe crossover. Exiled and Everything Burns are source-framed arcs inside longer runs. Minimum Carnage is the only selected discrete event from this record. |
| 32, `marvel-now` | Age of Ultron | Blocked by exact overlap with Heroic Age Avengers and Spider-Man Best Of. |
| 32, `marvel-now` | Infinity | Blocked by two absent Against the Tide rows and one ambiguous Thanos epilogue. |
| 32, `marvel-now` | Inhumanity | New Avengers #13 overlaps both shipped Hickman variants, so the 21-row epilogue has no approved disposition. |
| 32, `marvel-now` | Original Sin | Blocked by overlap with both Hickman variants and Spider-Verse. |
| 32, `marvel-now` | Death of Wolverine | Blocked by the open-ended Wolverines range. |
| 32, `marvel-now` | Axis and Spider-Verse | Both exact event orders are shipped. |
| 32, `marvel-now` | Black Vortex | The exact source page remains unavailable. |
| 32, `marvel-now` | Avengers: Time Runs Out | Its Avengers and New Avengers sequence is already contained in both shipped Hickman guides, with no separate disposition. |
| 33-39, direct event records | Age of Ultron, Infinity, Original Sin, Death of Wolverine, Axis, Spider-Verse, and Black Vortex | These repeat the blocked or shipped position 32 scopes and do not create new identities. |
| 40, `secret-wars` | Secret Wars 2015 | Secret Wars #1-9 are already in both shipped Hickman guides. The page also spans older events, so no non-overlapping standalone scope is approved. |
| 41, `secret-wars-to-legacy-fast-track` | Fast-track event references | It repeats shipped or blocked events; the remaining entries are runs rather than a new event order. |
| 42, `all-new-all-different` | All-New All-Different umbrella | Broad era material and single-series arcs. Its later event links have their own master records. |
| 43, `avengers-standoff` | Avengers: Standoff! | Blocked by two All-New All-Different Avengers overlaps. |
| 44, `apocalypse-wars` | X-Men: Apocalypse Wars | The exact order is shipped. |
| 45, `civil-war-ii` | Civil War II | Blocked because nine source rows are absent from repository metadata. |
| 46, `clone-conspiracy` | Spider-Man: Clone Conspiracy | The exact order is shipped. |
| 47, `inhumans-vs-x-men` | Inhumans vs. X-Men | The exact order is shipped. |
| 48, `marvel-now-2` | Marvel NOW 2.0 event links | Clone Conspiracy and Inhumans vs. X-Men are shipped; Secret Empire is overlapped; X-Men ResurreXion is an era. Monsters Unleashed and Venomverse are selected at their direct records. |
| 50, `secret-empire` | Secret Empire | The issue guide includes U.S.Avengers #7-8 and other Avengers-family issues already shipped in All-New All-Different Avengers. No partial-overlap disposition is approved. |
| 51, `x-men-resurrexion` | X-Men: ResurreXion | Broad family relaunch era, not one event or aftermath. |
| 53, `generations` | Generations | The source explicitly calls the ten one-shots thematic tissue rather than a genuine event. |
| 54, `marvel-legacy` | Marvel Legacy | Broad publishing era, not one event or aftermath. |

### Parent approval gate

The parent must approve or revise the exact ten ids, their order, all six `sourceSection` identities,
and the Minimum Carnage, Venomverse, Infinity, and Damnation boundaries as one packet. Approval must
also confirm that AvX: Consequences, Inhumanity, Secret Empire, Generations, and every other skipped
scope remain out. Until that approval is durable in the plan, state, and changes record, no mapping,
inventory, overlap, authoring, product, tooling, test, commit, push, or pull-request work is
authorized.
