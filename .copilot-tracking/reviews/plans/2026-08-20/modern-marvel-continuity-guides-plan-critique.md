<!-- markdownlint-disable-file -->
# RPI Plan Critique: Modern Marvel continuity guides

## Metadata

* Task ID: MRT-004
* Critique date: 2026-08-20
* Plan: .copilot-tracking/plans/2026-08-20/modern-marvel-continuity-guides-plan.md
* Phase details: .copilot-tracking/details/2026-08-20/modern-marvel-continuity-guides-phase-details.md
* Critique execution status: Complete

## Inputs and Criterion Boundary

* Task context and caller requirements: Plan a permission-aware program for modern Earth-616 guides,
  prioritize events and aftermaths, make tasks executable by a lower-capability model, and hand P01
  to a nested MAI-model session after planning.
* Research and evidence considered:
  .copilot-tracking/research/2026-08-20/modern-marvel-continuity-guides-research.md;
  .copilot-tracking/research/subagents/2026-08-20/modern-marvel-continuity-guides-external-wider.md;
  .copilot-tracking/research/subagents/2026-08-20/modern-marvel-continuity-guides-internal-wider.md;
  .copilot-tracking/research/subagents/2026-08-20/modern-marvel-continuity-guides-deeper.md.
* Decisions, dependencies, and acceptance criteria considered: Event-first delivery, narrow
  permission and attribution, maintained 86-record inventory, deterministic issue resolution,
  all-order overlap reporting, Aftersmash pilot, one-guide default batches, metadata horizon, P01
  child-session boundary, and repository gates.
* Assessment boundary: The supplied artifacts support a credibility assessment of the documented
  program and P01 handoff. The critique does not validate future source-page issue mappings or
  execute repository commands.

## Coverage Assessment

| Requirement, research, phase, or task ID | Coverage | Evidence or concern |
|---|---|---|
| User scope and event-first decision | Covered | Plan preserves modern Earth-616, events first, and separate deferred lanes |
| Permission and provenance | Covered | Exact credit, link, source-origin, and null-license rules are frozen |
| Research C1-C15 and W1-W10 | Covered | Inventory, tooling, overlap, pilot, batching, and metadata horizon all affect tasks |
| Lower-capability execution | Partial | P01 is mechanical, but later inventory lifecycle and exception behavior have two unresolved contracts |
| P01-T01 | Covered | Exact file, schema, counts, stop rules, test, and failure proof are supplied |
| P01-T02 | Covered | Exact CLI behavior, safe helper reuse, local-fake tests, and no-write failures are supplied |
| P01-T03 | Covered | Full comparison boundary and deterministic relationship algorithm are supplied |
| P01-T04 | Covered | Product records, gates, anchors workflow, and failure conditions are supplied |
| P02 | Partial | Pilot inputs are frozen except planned reviewer fields; exception handling needs an explicit prohibition or action |
| P03 | Partial | Batch packet is bounded, but the inventory cannot record ready, shipped, or blocked lifecycle state |
| P04 | Covered | Deferred work is routed to separate plans and cannot widen MRT-004 implementation |
| Validation and dependencies | Covered | Focused, offline, live, browser, proof-failure, and dependency sequence are explicit |

## Verdict

* Verdict: Revise
* Rationale: P01 is credible and bounded, but two direct planner corrections are needed so later
  lower-capability batches cannot loop on completed records or improvise exception behavior.

## Findings

<!-- rpi:critique id=PC-001 -->
### PC-001 [High]: Inventory disposition cannot represent delivery lifecycle

* Related IDs: Maintained inventory contract, P03-T01, P03-T03, program reconciliation goal.
* Evidence: .copilot-tracking/plans/2026-08-20/modern-marvel-continuity-guides-plan.md and
  .copilot-tracking/details/2026-08-20/modern-marvel-continuity-guides-phase-details.md.
* Concern: The disposition enum describes editorial treatment, but P03-T03 says a completed record
  gains a shipped disposition that the enum does not contain. P03-T01 selects the lowest-position
  `new-order` record, so a shipped or blocked record can remain eligible indefinitely.
* Impact: A lower-capability model cannot select the next record mechanically or reconcile pending,
  ready, shipped, and blocked work without inventing a state convention.
* Smallest useful change: Add a separate required delivery-status field with a closed vocabulary,
  define its baseline value from disposition, and define P03 transitions and tests. Keep editorial
  disposition unchanged.
* Action owner: Planning parent.
* Exact resolving evidence: Plan inventory schema and phase details define the status enum, baseline
  mapping, queue filter, and P03-T01/P03-T03 transitions; P01-T01 tests assert them.
* Decision route: Direct planner correction.

<!-- rpi:critique id=PC-002 -->
### PC-002 [Medium]: Approved exception behavior is not executable

* Related IDs: Source mapping contract, lower-capability contract, P02-T01, P02-T02, P03-T02.
* Evidence: .copilot-tracking/plans/2026-08-20/modern-marvel-continuity-guides-plan.md and
  .copilot-tracking/details/2026-08-20/modern-marvel-continuity-guides-phase-details.md.
* Concern: `approved-exception` is a valid mapping status and the resolver preserves it, but later
  authoring requires exact Marvel issue URLs and gives no action for an exception. The historical
  event lane otherwise requires zero placeholders and unresolved rows.
* Impact: An implementer can reach a reviewed exception and still have to choose whether to omit it,
  create a placeholder, or stop.
* Smallest useful change: State that P02 and P03 reject `approved-exception` under MRT-004 and stop
  before authoring. Preserve the status only as a future-work data shape for a separately approved
  workflow.
* Action owner: Planning parent.
* Exact resolving evidence: Mapping contract, P02-T01 stop conditions, P03 packet rule, and resolver
  tests all distinguish preserved future exceptions from event-lane acceptance.
* Decision route: Direct planner correction.

## Strengths and Residual Risk

* The 86-record baseline is reconciled by type and position and separates source classification from
  product disposition.
* P01 is one coherent source-intake feature and explicitly adds no reading guide.
* Resolver and overlap commands have deterministic outcomes, no-network unit tests, no runtime
  dependencies, and hard stops instead of fuzzy fallbacks.
* Permission, attribution, review limits, validation gates, and post-snapshot deferral are explicit.
* Aftersmash remains conditional on current source, resolver, overlap, and reviewer evidence.
* Residual risk remains that the live source changes before P02; the refresh gate explicitly accepts
  that risk and stops rather than forcing the old 26-row assumption.

## Questions or Blocking Evidence Gaps

* None. Both findings are planner-owned corrections and do not conflict with confirmed user choices.

## Limitations

* The critique did not retrieve source pages, run live metadata queries, or validate issue identities.
* P02 and later feasibility remains conditional on the documented source refresh and resolution gates.

## Recommended Next Action

* Highest-impact finding: PC-001.
* Action owner: Planning parent.
* Smallest next action: Add delivery lifecycle state to the inventory contract, prohibit approved
  exceptions in the historical event lane, then finalize without a second critique.
* User response required: no.
