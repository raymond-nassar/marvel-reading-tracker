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
links, prove it with World War Hulk: Aftersmash, then add clean historical events one guide at a
time. Broad eras, bridges, fast tracks, ambiguous overlaps, and post-snapshot material remain
visible in the inventory but do not enter the first delivery lane.

The first implementation pull request is only the intake foundation: a maintained inventory,
deterministic issue-reference resolver, complete pairwise overlap report, tests, and contributor
instructions. It does not add a reading guide. The second pull request uses that foundation to
resolve and ship the Aftersmash pilot. This split keeps one major feature per pull request and lets
the pilot prove the workflow rather than hide tooling assumptions inside a data change.

### Confirmed User Decisions

* Use the permission granted by Comic Book Herald.
* Cover modern Marvel main-universe continuity.
* Make tasks executable by a lower-capability model.
* Prioritize discrete events and aftermaths before broad eras and bridges.
* Launch implementation in a nested session using an MAI model after this plan is complete.

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
* Prove the process with one flat historical pilot.
* Deliver historical event guides in conservative, independently reviewable batches.
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

* Default: one guide per pull request.
* Maximum two guides only when both are flat, unambiguous, in one story family, and no more than
  40 combined approved issue rows.
* Maximum one complex guide with no more than 60 approved issue rows.
* Soft generated-data ceiling: approximately 70 KB per pull request.
* Split or escalate when a limit is exceeded, any ambiguity remains, families mix, or overlap is
  not pre-approved.
* These are review limits, not correctness guarantees.

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
### [ ] P02: Prove World War Hulk: Aftersmash end to end

* Intent: Use the foundation on the flat 26-reference historical pilot.
* Pull request boundary: One pilot guide plus its mapping, overlap report, generated data, tests,
  product records, and direct workflow corrections.
* Dependencies: P01 merged or present on the implementation branch.

<!-- rpi:task id=P02-T01 -->
#### [ ] P02-T01: Refresh and freeze the pilot intake

* Inputs: Inventory id `world-war-hulk-aftersmash` and its exact source page.
* Exact outputs: Updated inventory review date, reviewed 26-row mapping, overlap report, approved
  manifest field block, and recorded first, middle, and final source checks.
* Pass conditions: 26 source rows reconcile, zero ambiguity and approved exceptions remain, no
  unapproved overlap exists, the record moves to `ready`, and the source has not changed in a way
  that invalidates pilot suitability.
* Stop conditions: Count changes, ambiguity remains, overlap needs a new disposition, or generated
  data would cross a batch threshold.

<!-- rpi:task id=P02-T02 -->
#### [ ] P02-T02: Author and vendor the pilot

* Inputs: Approved P02-T01 mapping and manifest fields.
* Exact outputs: `src/data/orders/world-war-hulk-aftersmash.md`, one manifest entry,
  `src/data/world_war_hulk_aftersmash.json`, rebuilt catalog data, focused assertions, backlog,
  changelog, provenance, and contributor updates directly required by observed failures.
* Pass conditions: Exact 26-id order, correct credit and source link, zero placeholders and warnings,
  all gates pass, live contract passes, browser check passes, and each new semantic check has a
  smallest-revert failure proof. The inventory record then moves to `shipped` with its catalog id.

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
