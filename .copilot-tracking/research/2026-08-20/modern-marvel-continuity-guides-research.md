<!-- markdownlint-disable-file -->
# Task Research: modern-marvel-continuity-guides

| Field | Value |
|---|---|
| Date | 2026-08-20 |
| Researcher / agent | rpi-research parent |
| Status | Complete |
| Artifact path | .copilot-tracking/research/2026-08-20/modern-marvel-continuity-guides-research.md |

## Research Brief

* What to research: The exact modern Earth-616 guide inventory on Comic Book Herald's complete
  Marvel guide, its overlap with shipped reading orders, the existing source-to-catalog workflow,
  permission and attribution requirements, and safe pilot and batch boundaries.
* Why it matters: The implementation plan must be complete and mechanical enough that a
  lower-capability model does not make editorial, provenance, or continuity decisions while coding.
* Audience or intended use: The owner, reviewers, and later implementation agents.
* Scope: The Comic Book Herald master page and relevant child guides; src/data/curated-lists.json;
  src/data/orders/; generated catalog data; vendoring, validation, provenance, and contributor docs.
* Non-goals: Production edits; alternate universes; Star Wars; pre-modern year-by-year reading;
  unrelated character guides; catalog redesign; legal interpretation beyond the recorded permission.
* Criteria: Complete source accounting, explicit overlap decisions, durable permission conditions,
  exact workflow contracts, bounded batches, objective validation, and contrarian challenge.
* Requested outputs: Evidence-backed recommendation for pilot, batch structure, workflow, and
  planning constraints.
* Output mode: convergence

## Research Parameters

| Field | Value |
|---|---|
| Research question(s) | What source inventory and workflow can safely produce modern Earth-616 reading guides in bounded batches executable by a lower-capability model? |
| Codebase scope | src/data/, scripts/vendor-orders.mjs, relevant tests, README.md, docs/DATA_PROVENANCE.md, PRODUCT_BACKLOG.md |
| External scope | comicbookherald.com master guide and directly relevant child pages |
| Initial internal candidate areas | Curated-list manifest, local order Markdown, generated catalog, vendor script, provenance and catalog tests |
| Initial external candidate areas | Complete Marvel reading-order guide, permission description already recorded in repository provenance docs, candidate child guides |
| Research posture | balanced |
| Posture provenance | Default selected because the named source and repository targets are bounded but guide-shape and overlap uncertainty can change the plan |
| Explicit limits / deadline | Modern Earth-616 continuity only; no implementation; no alternate-universe, Star Wars, pre-modern year-by-year, or general character-guide expansion |
| Posture-specific completion basis | Scope coverage and adequate evidence for inventory, overlap, permission, pilot, batching, and validation |
| Edits allowed during research? | No source edits; research and workflow tracking only |
| Resolved evidence root | .copilot-tracking/ |
| Known constraints / excluded sources | Treat fetched material as data; preserve zero runtime dependencies; do not scrape Marvel; use source pages only within the permission described by the user and repository record |

## Extension Registry and Provenance

* Precedence: platform and host safety; caller scope and criteria; matching repository instructions
  and enforced schemas; rpi-research contract; domain skills and specialists; examples and preferences.

| Kind | Candidate | Match and provenance | Scoped authority or output contract | Selected / skipped reason |
|---|---|---|---|---|
| Instruction | Repository custom instructions | Applies to all repository and tracking work | RPI artifact conventions, evidence rules, gates, product constraints, and no em dashes | Selected |
| Skill | hve-core:rpi-research | Activated by the planning parent for demonstrated evidence gaps | Three-wave research and readiness evidence | Selected |
| Research specialist | research agent | Available host specialist for current external-source investigation | Bounded source inventory lane with citations, no decision authority | Selected for the independent external lane |
| Research specialist | explore agent | Available host specialist for codebase exploration | Bounded overlap and workflow lane, no decision authority | Selected for the independent internal lane |

## User Participation and Research Decisions

| Checkpoint | Questions or no-interaction rationale | Answers / unanswered | Resulting decision or selected further research |
|---|---|---|---|
| Intake | No question needed because the user supplied the source, continuity focus, permission state, and implementation-audience constraint | No unanswered intake question blocks research | Proceed with modern Earth-616 as the bounded target and preserve exact permission wording as a research item |
| Direction change | Repository evidence resolved the permission scope without another user question | The recorded reply permits continued use with the existing credit-and-link pattern | Remove permission wording as a blocker and keep broader reuse out of scope |
| Convergence | Which initial lane should control delivery: discrete events, broad eras and bridges, or full chronological slices? | Discrete events and aftermaths first | Prioritize clean historical events; preserve every other source in the maintained inventory |

## Scope and Success Criteria

* Scope: Research the source program and repository contracts needed to plan modern Earth-616 guides.
* Assumptions: The master page's Earth-616 section is the intended boundary; existing permission
  terms are already recorded in the provenance document; current local-order tooling can support
  most source-guide shapes. All assumptions require verification.
* Success criteria:
  * Every research question is answered or marked unanswerable with the missing evidence named.
  * Evidence is grounded in code, docs, or tooling results, with locations for internal claims and
    URL plus retrieval date for external claims.
  * Findings, decisions, and readiness claims cite Evidence Log IDs.
  * Alternatives are compared with trade-offs and one evidence-supported recommendation is selected.
  * Open questions, risks, and residual uncertainty are recorded.
  * Self-check passes.

## Task Research Requests

* Explicit requests: Create a plan to work through modern Marvel continuity and create reading
  guides based on Comic Book Herald; make the plan executable by a lower-end model.
* Inferred research questions: Define source boundaries, overlap policy, pilot, batch size,
  transformation workflow, attribution, failure handling, and validation.
* Caller constraints and non-goals: Research supports planning only and must not implement product changes.

## Direction Controls

| Control type (add / change / narrow / exclude / discard) | Direction or boundary | Source / checkpoint | Effect on active brief, evidence, or revalidation |
|---|---|---|---|
| add | Use newly granted Comic Book Herald permission | User request | Permission conditions become a required implementation dependency |
| narrow | Modern Marvel continuity | User request | Research centers the master page's Earth-616 continuity section |
| add | Lower-end model execution | User request | Findings must support mechanical tasks, closed vocabularies, and stop conditions |
| exclude | Production implementation | Planning parent | Research may write only evidence and workflow state |
| exclude | Alternate universes, Star Wars, pre-modern year-by-year, and general character-guide expansion | Interpreted plan boundary | Contrarian alternatives remain within Earth-616 continuity |

## Research Questions

| # | Sub-question | Type (depth / breadth / straightforward) | Priority | Status |
|---:|---|---|---|---|
| Q1 | Which master-page links belong to the modern Earth-616 continuity program, and how should they be classified? | breadth | H | answered |
| Q2 | Which candidates overlap shipped orders or one another, and what disposition avoids duplication? | breadth | H | answered |
| Q3 | What exact permission, attribution, source-link, and license rules apply? | depth | H | answered |
| Q4 | What current repository workflow and schema transform a local checklist into catalog data? | depth | H | answered |
| Q5 | Which checks own source fidelity, metadata resolution, catalog behavior, provenance, and repository safety? | depth | H | answered |
| Q6 | What pilot and batch limits balance representativeness with reviewability? | depth | H | answered |
| Q7 | What evidence challenges a guide-per-link chronological rollout? | breadth | H | answered |

## Prior Knowledge Gate

* Existing artifacts reviewed: Current plan and details; README contributor guidance;
  src/data/curated-lists.json; representative generated orders; docs/DATA_PROVENANCE.md search results;
  PRODUCT_BACKLOG.md search results; Comic Book Herald master page.
* Reused (verified) findings: Local Markdown and remote Markdown are current source modes; the
  manifest carries provenance, grouping, expected count, and timeline fields; existing catalog data
  already contains Comic Book Herald-derived orders.
* Superseded / stale: No prior program plan was found. Existing individual guide decisions cannot
  be assumed to define a complete modern-continuity rollout.

## Research Cycle Log

### Cycle 1

* Active direction controls: All controls recorded above.
* Active research posture and completion basis: balanced; scope coverage and adequate evidence.
* Explicit limits or deadline effect: Research remains within modern Earth-616 and planning inputs.

#### Wave 1: Wider

* Plan and independent lanes: External master-page inventory and guide-shape sampling; internal
  catalog overlap, vendoring, provenance, and validation contract inventory.
* Worker evidence relationships or inline fallback: The external lane found 86 ordered master-page
  links and classified 42 event, 14 era, 14 crossover or sub-guide, 10 bridge, 3 fast-track, and 3
  commerce-only entries. The internal lane recorded the manifest, local-checklist, vendoring,
  grouping, path, provenance, overlap, and validation contracts in
  .copilot-tracking/research/subagents/2026-08-20/modern-marvel-continuity-guides-internal-wider.md.
  The external worker returned a complete inventory but failed to persist its assigned lane file;
  the parent reconstructed and independently checked it in
  .copilot-tracking/research/subagents/2026-08-20/modern-marvel-continuity-guides-external-wider.md.
* Reflection: The source index cannot safely become one order per link. The program needs a closed
  disposition vocabulary because umbrella eras, bridge lists, event lists, fast tracks, anchored
  sub-guides, and commerce-only links overlap structurally. The existing catalog can represent
  standalone stories, variants, and one ordered path without application changes.

#### Wave 2: Deeper

* Parent-prioritized material from Wave 1: Pilot representativeness, lower-model transformation
  rules, batch ceilings, chronological queue, validation ownership, and editorial freeze points.
* Plan and independent lanes: Compare Aftersmash, Extermination, and Siege; derive a mechanical
  normalization contract from current parser and vendor behavior; set conservative review limits.
* Worker evidence relationships or inline fallback:
  .copilot-tracking/research/subagents/2026-08-20/modern-marvel-continuity-guides-deeper.md
  records the returned evidence persisted by the parent.
* Reflection: Aftersmash is the strongest pilot because it is a flat 26-item list without an
  evidenced shipped collision. Extermination is a useful second guide but needs an explicit
  narrative-section flattening rule. Siege should be a later hard case because at least 13 issues
  already ship in dark-reign-avengers and two source rows are ambiguous. One guide per pull request
  is the safe default; two are allowed only when both are flat, unambiguous, in one chronology
  family, and no more than 40 combined issue lines.

#### Wave 3: Contrarian

* In-scope challenge targets and boundaries: Challenge one-order-per-link, strict chronology,
  automatic extraction, and large-batch assumptions without widening beyond Earth-616.
* Plan and independent lanes: Challenge the pilot, current tooling sufficiency, batch safety,
  event-plus-path representation, inventory durability, zero-placeholder rule, and chronological
  queue with repository and current-source evidence.
* Worker evidence relationships or inline fallback: A bounded rubber-duck researcher returned
  contrarian evidence inline. The parent accepted the disproved and weakened claims below and did
  not treat the worker as a decision authority.
* Reflection: Chronology alone does not prevent nesting or cross-order overlap. Existing vendoring
  is sufficient only after exact issue ids are supplied. Batch size is review guidance, not a
  safety proof. One continuity path is a provisional default because late source pages split into
  parallel families. A program-wide frozen inventory will become stale because the source is
  actively updated. Zero placeholders remains the pilot default but must permit an explicit
  exception record. Aftersmash remains the leading pilot candidate, not a locked selection, until
  its issue-resolution path is sampled.

#### Parent Synthesis and Disposition

| Material / claim | Evidence IDs or worker pointers | Parent disposition (accepted / rejected / deferred) | Evidence-based rationale | Primary-artifact treatment |
|---|---|---|---|---|
| Use the Earth-616 section as the candidate universe | W1 | accepted | The master page explicitly separates it from alternate-universe and character-guide sections | Source inventory boundary |
| Treat every link as an inventory record, not necessarily a catalog order | W1-W6 | accepted | Representative pages and master-page relationships show six materially different source types | Closed disposition workflow |
| Reuse local Markdown plus the existing vendor pipeline | C1-C8 | accepted | Current contracts already preserve authored order, sections, provenance, generated data, grouping, and paths | Implementation foundation |
| Require exact card credit and source-page link | C9 | accepted | The recorded permission confirms the existing pattern and does not grant broader reuse | Provenance rule |
| Add all links as standalone catalog orders | W1-W6, C5-C8 | rejected | It would duplicate umbrella eras, fast tracks, existing events, and sequence-only bridge material | Contrarian target retained for final wave |

#### Cycle Re-entry Evaluation

* Another complete three-wave cycle needed: yes.
* Trigger or stop basis: Contrarian evidence exposed a material issue-resolution dependency and
  weakened the inventory and representation assumptions.
* Revised brief or revalidation required: None.
* Readiness effect: Not ready until existing issue-resolution assets and refresh strategy are verified.

### Cycle 2

* Active direction controls: All current controls; no scope expansion.
* Active research posture and completion basis: balanced; targeted closure of issue resolution,
  overlap, and live-inventory durability gaps.
* Explicit limits or deadline effect: Research remains within the existing repository and named
  Comic Book Herald source program.

#### Wave 1: Wider

* Plan and independent lanes: Inspect current issue search, series index, metadata lookup, source
  refresh, and overlap utilities that could make batch intake mechanical.
* Worker evidence relationships or inline fallback: Inline inspection found a live issue-search
  endpoint, strict unique-exact title resolution, a committed full series index, series-issue
  queries, and an existing pairwise overlap test scoped to the one shipped path.
* Reflection: The repository has the primitives for a build-time resolver but no command that turns
  plain Comic Book Herald references into an auditable issue mapping. The gap is orchestration and
  failure policy rather than a missing service or runtime dependency.

#### Wave 2: Deeper

* Parent-prioritized material from Wave 1: Reuse boundary for issue search and series lookup,
  post-snapshot behavior, cross-order overlap, and inventory refresh.
* Plan and independent lanes: Determine the smallest repeatable build-time intake artifact and
  checks a lower-capability implementer can execute.
* Worker evidence relationships or inline fallback: Inline synthesis of C11-C15.
* Reflection: Add one dependency-free build-time resolver and one maintained source inventory. The
  resolver may auto-accept only one exact normalized issue match; otherwise it emits candidates and
  stops until an explicit mapping is committed. It must compare each proposed order against every
  shipped order, not only its chronology neighbors. Inventory records are refreshed before their
  batch rather than treated as a permanent snapshot.

#### Wave 3: Contrarian

* In-scope challenge targets and boundaries: Challenge whether new tooling or maintained build data
  is required and whether mapping can be delegated safely.
* Plan and independent lanes: Compare the existing in-app manual resolver and direct script inputs
  against a repeatable CLI; test recent-source behavior against the metadata boundary.
* Worker evidence relationships or inline fallback: Inline contrarian synthesis.
* Reflection: A single pilot could be assembled manually through the app, so a new resolver is not
  technically required for one guide. It is justified by the 86-link program and lower-model
  requirement because the app workflow leaves choices in browser state and cannot emit a reviewed
  source-to-issue mapping. The maintained inventory must remain build-time input, not browser data.
  Guides whose issue identities cannot be resolved from the finished metadata snapshot are deferred
  rather than weakening the historical workflow.

#### Parent Synthesis and Disposition

| Material / claim | Evidence IDs or worker pointers | Parent disposition (accepted / rejected / deferred) | Evidence-based rationale | Primary-artifact treatment |
|---|---|---|---|---|
| Reuse existing search and index primitives in a build-time resolver | C11-C13 | accepted | Unique-exact acceptance and full series lookup already exist; only deterministic orchestration is missing | First implementation phase |
| Keep source inventory only in historical RPI artifacts | W9, C15 | rejected | The live source changes and a multi-PR program needs current durable state | Maintained build-time inventory with per-batch refresh |
| Use chronological proximity as overlap proof | C14 | rejected | Existing overlap protection is explicit pairwise comparison, not chronology | General overlap report before every batch |
| Vendor current 2026 guides through the same historical path | C15 | rejected | The metadata snapshot stops in 2025 and issue search cannot supply absent future records | Deferred recent-source lane |
| Require zero unresolved records for the historical pilot | C2-C4, C11-C13 | accepted | Existing search and index primitives can resolve or stop before vendoring | Pilot acceptance criterion |
| Require zero unresolved records for every future source forever | C2-C4, C15 | rejected | The repository deliberately supports explicit placeholders and the metadata source has ended | Default with pre-approved exceptions |

#### Cycle Re-entry Evaluation

* Another complete three-wave cycle needed: no.
* Trigger or stop basis: The named repository primitives, missing orchestration, overlap boundary,
  live-source refresh, and metadata horizon are evidenced; further sources are unlikely to change
  the planning decision.
* Revised brief or revalidation required: None.
* Readiness effect: Ready for planning, subject to the user's rollout-priority decision.

## Evidence Log

* Delegation: External and internal wider lanes, deeper pilot lane, and contrarian challenge complete.

### Codebase Evidence

| ID | Claim / finding | Location (`path:line`) | Tool | Confidence | Notes |
|---|---|---|---|---|---|
| C1 | The curated-list manifest supports local or remote sources plus provenance, grouping, expected count, and timeline metadata. | src/data/curated-lists.json:1-146 | read and grep | high | Existing variants cover exact overlap within a story. |
| C2 | A local order is parsed from bullet or checkbox lines; Marvel issue links resolve directly, plain or non-Marvel links become visible placeholders, and level-two headings become collection labels. | src/js/lib/markdown.js:70-148 | read | high | Source extraction must produce repository Markdown, not feed Comic Book Herald HTML to the parser. |
| C3 | The vendor command can rebuild only named ids, hydrates issue metadata from the live service, writes pinned order JSON, and rebuilds the complete catalog from changed and unchanged payloads. | scripts/vendor-orders.mjs:173-360 | read | high | Per-guide vendoring is already supported. |
| C4 | Expected-count drift and duplicate issue ids are warnings rather than hard failures in the vendor command. | scripts/vendor-orders.mjs:300-307 | read | high | Batch tasks need explicit zero-warning gates or focused tests. |
| C5 | A reading path is an ordered array of story ids, and validation rejects unknown stops, repeated stories, and paths shorter than two stops. | src/js/lib/curated.js:146-205 | read | high | Bridge pages can inform one project-authored path without becoming catalog orders. |
| C6 | Existing contributor guidance requires source origin, source page, source license, type, depth, timeline, group, and expected count fields and documents single-list vendoring. | README.md:603-647 | read | high | The plan can extend a known data-only workflow. |
| C7 | The repository already ships exact event variants and a ten-stop Modern Avengers path, proving that overlap is represented as variants or paths rather than duplicate shelf rows. | src/data/curated-lists.json:149-423 | read and overlap analysis | high | Existing House of M, Civil War, and Secret Invasion families need reuse decisions. |
| C8 | Current Earth-616-relevant manifest entries range from 5 to 230 expected issues. | src/data/curated-lists.json:552-1287 | manifest analysis | high | Review cost, not file-format capacity, controls batch size. |
| C9 | Comic Book Herald explicitly permitted continued reading-order work under the existing pattern: credit Comic Book Herald and link to the exact followed guide page; the reply does not grant a broader license. | docs/DATA_PROVENANCE.md:303-325 | read | high | New local orders use sourceLicense null and exact page attribution. |
| C10 | Repository validation exposes focused vendor and schema tests plus lint, full tests, anchors, counts, sizes, publication, contract, and browser commands; the live contract and browser checks are intentionally outside CI. | package.json:8-30 | read | high | Each batch needs offline gates plus manual live and browser checks at defined boundaries. |
| C11 | The live API exposes issue-title search, and the existing resolver auto-accepts only one exact normalized title match while returning unmatched or ambiguous candidates otherwise. | src/js/lib/markdown.js:225-244 | read and live probe | high | Safe automatic acceptance logic already exists. |
| C12 | The app already uses issue search to resolve pasted plain-text order rows, but the result and any manual choice live only in browser state. | src/js/main.js:3308-3364 | read | high | A repeatable build-time program needs a persisted mapping artifact. |
| C13 | The committed series index can be validated against the live catalogue total and combined with series-issue queries; current event tooling already uses that pattern without a new dependency. | scripts/build-event-order.mjs:295-373 | read | high | A guide resolver can reuse current build-time primitives. |
| C14 | The current no-overlap guarantee is an explicit pairwise issue-id comparison scoped to every variant behind each stop on the shipped path. | test/reading-path.test.js:213-248 | read | high | New batches need a general overlap report, not chronology inference. |
| C15 | The metadata source ends on 2025-10-29, and waiting does not extend it. | docs/DATA_PROVENANCE.md:180-186 | read | high | Current and future guides need a separate deferred or explicitly sparse workflow. |

### External Evidence

| ID | Claim / finding | Source (title) | URL | Retrieved | Version/date | Confidence |
|---|---|---|---|---|---|---|
| W1 | The master guide defines a modern main-universe section from Marvel Knights through current events and separates alternate-universe and character guides. | Comic Book Herald Complete Marvel Reading Order Guide | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/ | 2026-08-20 | live page | high |
| W2 | The Earth-616 section currently contains 86 ordered links across era, bridge, event, fast-track, sub-guide, and commerce-only shapes. | Comic Book Herald Complete Marvel Reading Order Guide | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/ | 2026-08-20 | live page | high |
| W3 | World War Hulk: Aftersmash presents a direct 26-item issue list with previous and next continuity links. | World War Hulk: Aftersmash | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/guide-part-10-wwh-aftersmash/ | 2026-08-20 | live page | high |
| W4 | X-Men Extermination separates five post-credit preludes, five core issues plus one lead-in, and three epilogues, making section boundaries editorially meaningful. | X-Men Extermination | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-fresh-start-reading-order/x-men-extermination/ | 2026-08-20 | live page | high |
| W5 | The Disassembled-to-House-of-M bridge page is itself a long chronological reading list, not merely prose connecting two event pages. | From Avengers Disassembled to House of M | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-comics-from-avengers-disassembled-to-house-of-m/ | 2026-08-20 | live page | high |
| W6 | The early Marvel Knights page mixes collections, issue ranges, optional material, embedded side-guide links, and continuity notes, so it requires human source normalization before the existing parser can consume it. | Early 2000s Until Avengers Disassembled | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/knights-until-avengers-disassembled/ | 2026-08-20 | live page | high |
| W7 | Siege presents 39 issue-like rows, at least two of which are not stable issue references without additional resolution. | Siege | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/guide-part-13-siege-checklist/ | 2026-08-20 | live page | high |
| W8 | The late Fresh Start guide divides contemporary continuity into independently readable Spider-Man, Avengers, magic, cosmic, and mutant families rather than one strict linear sequence. | Complete Fresh Start Pt. 2 | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-fresh-start-reading-order/part-2/ | 2026-08-20 | live page | high |
| W9 | The master guide states it is continually updated as events and collected editions change. | Comic Book Herald Complete Marvel Reading Order Guide | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/ | 2026-08-20 | live page | high |
| W10 | One World Under Doom describes an evolving checklist updated as issues are released, announced, and read. | One World Under Doom | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/one-world-under-doom/ | 2026-08-20 | live page | high |

### Contradictions / Conflicts

* The external lane initially classified bridge guides as sequence-only markers, but W5 shows that
  at least some are full issue-bearing reading lists. Resolve this by inventorying every bridge
  individually; do not assign dispositions from its label alone.

## Findings Mapped to Questions and Evidence

| Question | Finding | Evidence IDs | Confidence | Decision or readiness implication |
|---|---|---|---|---|
| Q1 | The bounded section contains 86 links, but six source types need different dispositions and bridge labels alone are insufficient. | W1-W6 | high | Inventory every link, then approve only source-backed standalone outputs. |
| Q2 | Existing exact event variants and umbrella relationships require reuse, variant, path-source, exclude, or new-order dispositions before authoring. | C5, C7, W1-W6 | high | Add an overlap gate before every batch. |
| Q3 | Credit Comic Book Herald on each card, link to the exact followed guide page, claim no broader license, and keep sourceLicense null. | C9 | high | No user clarification remains for the described pattern. |
| Q4 | Authors must convert source facts into local Markdown, then use the existing manifest and single-id vendor flow. | C1-C6 | high | No new application architecture is needed. |
| Q5 | Existing tests own syntax, schema, parity, grouping, paths, and provenance, but count mismatch and duplicate ids need explicit zero-warning treatment. | C4, C6, C10 | high | Final plan must assign warning review and focused semantic checks. |
| Q6 | Aftersmash is the leading historical pilot, but its issue mapping must be produced and reviewed before the guide task begins. | C11-C13, W3 | high | The first phase adds resolver and mapping evidence, then locks the pilot. |
| Q7 | Chronology, one-order-per-link, one global path, permanent inventory freeze, and unconditional zero-placeholder rules all fail against current evidence. | C4, C14, C15, W5-W10 | high | Use per-record dispositions, source-family representation, refresh checkpoints, and explicit exceptions. |

## Key Discoveries

* The master page is an index of mixed guide types, not one directly ingestible order.
* Existing schema has many of the provenance and grouping fields a program will need.
* Aftersmash is the smallest representative pilot that does not first force a new overlap or
  section-semantics decision.
* Lower-capability implementation is feasible only after a higher-capability planner freezes source
  rows, issue count, editorial metadata, overlap treatment, and escalation points.
* Existing code already contains the safe exact-match and series-audit primitives needed for a
  dependency-free build-time resolver.
* The rollout horizon must distinguish closed historical material from evolving post-snapshot guides.

## Alternatives and Decision State

### Selected Recommendation (convergence only)

* Approach: Create a maintained 86-record build-time inventory and deterministic resolver, pilot
  World War Hulk: Aftersmash, then process one pre-adjudicated historical event at a time. Use
  standalone orders for clean issue-bearing guides, variants for alternate readings of one story,
  path sources for approved chronology, and deferred or excluded dispositions for umbrellas, fast
  tracks, commerce-only links, unresolved overlaps, and post-snapshot material.
* Rationale: This approach uses existing data architecture, proves the simplest representative
  transformation first, and keeps every later lower-model task inside explicit issue, ambiguity,
  chronology, and review-size limits.
* Evidence refs: C1-C15, W1-W10.
* Implementation impact: New local order Markdown, manifest entries, pinned JSON, catalog entries,
  provenance and product records, focused semantic tests, and one ordered path after enough
  non-overlapping stops exist.
* Confidence: high for the first historical lane; later era and recent-source lanes remain separate.

### Alternative: One order for every Earth-616 link

* Approach: Convert every link independently in page order.
* Trade-offs: Simple inventory rule but likely duplicates bridge guides, event guides, fast tracks,
  and already shipped catalog entries.
* Evidence refs: W1.
* Rejection rationale: Rejected because source types and shipped overlaps are not one-to-one.

### Alternative: One monolithic modern-continuity order

* Approach: Merge all included guides into one large order.
* Trade-offs: One reader path but poor reviewability, high duplicate risk, and weak fit with the
  current catalog's event and era model.
* Evidence refs: C1, W1.
* Rejection rationale: Rejected because overlap, parallel families, and review size defeat one sequence.

## Open Questions, Risks, and Residual Uncertainty

* Important: Baseline per-candidate dispositions must become machine-readable and be reviewed in
  the first implementation phase, then refreshed before each batch.
* Residual uncertainty: Exact issue mappings are intentionally deferred to the resolver output for
  each approved guide; evolving 2025 and 2026 guides remain outside the historical rollout.

## Current Decisions

| Decision | Status (proposed / confirmed / deferred / superseded) | Owner / source (user / evidence / constraint) | Rationale | Evidence IDs | Implications |
|---|---|---|---|---|---|
| Use Comic Book Herald as the permitted editorial source | confirmed | user | Explicit permission was reported | W1 | Provenance and link-back remain required research |
| Scope the program to modern Marvel continuity | confirmed | user | Explicit request | W1 | Earth-616 section is the candidate boundary |
| Make tasks lower-model executable | confirmed | user | Explicit request | C1 | Plan must remove editorial judgment from implementation |
| Prioritize discrete events and aftermaths | confirmed | user | Explicit convergence choice | W1-W10, C7-C15 | Era, bridge, and path work remains inventoried but outside the first lane |
| Use Aftersmash as the conditional pilot | proposed | evidence | It is flat, historical, and has no evidenced shipped collision | C11-C14, W3 | Resolver and overlap output must pass before authoring |
| Launch implementation in a nested MAI-model session after planning | confirmed | user | Explicit handoff request | Plan artifacts | Child session must start from the committed reviewed plan |

## Unresolved Decisions

| Decision | Smallest evidence or answer needed | Owner | Impact | Blocker status |
|---|---|---|---|---|
| Permission wording | Resolved by the existing provenance record | research | Attribution and permitted-use contract | resolved |
| Candidate dispositions | Baseline inventory complete; machine-readable refresh and final overlap adjudication occur in P01 | implementation | Scope and batch count | resolved for planning |
| Pilot | Aftersmash is leading, but final lock follows its resolver report | planning and implementation intake | First implementation batch | important |
| Rollout priority | Discrete events and aftermaths first | user | Scope and sequence | resolved |

## Potential Next Research

| Priority | Research item | Expected value | Trigger | Selected? | Related questions / evidence |
|---|---|---|---|---|---|
| H | Refresh each selected source before its batch | Prevents stale source counts and dispositions | Master and current guides are actively updated | deferred to implementation intake | Q1, Q7; W9, W10 |
| M | Research the recent-source workflow after the historical queue | Covers post-snapshot guides without weakening history | Metadata source ended in 2025 | deferred follow-up | Q4-Q7; C15 |

## Planning Readiness

* Status: Ready.
* Decision state: Use a maintained build-time inventory, dependency-free resolver, pairwise overlap
  report, conditional Aftersmash pilot, and refreshed one-guide historical event batches.
* Evidence basis: C1-C15 and W1-W10.
* Preconditions met: Source boundary, permission, workflow, overlap, issue-resolution primitives,
  pilot candidate, batch thresholds, validation, update risk, and metadata horizon are evidenced.
* Blockers: None for planning.
* Smallest action to change readiness: Finalize and critique the implementation plan.

## Closeout Record

| Field | Record |
|---|---|
| Research execution status | Complete |
| Completed waves | Two cycles, each with Wider, Deeper, and Contrarian waves |
| Lane evidence or inline fallback | External inventory, internal workflow, deeper pilot, and inline contrarian evidence complete |
| Research disposition | executed |
| Planning Readiness | Ready with C1-C15 and W1-W10 |
| Blockers | None for planning |
| Continuation owner and state | Manual RPI Agent planning parent; finalize and critique plan |

## Advisory Next Step

| Field | Record |
|---|---|
| Research disposition | executed |
| Planning Readiness | Ready with C1-C15 and W1-W10 |
| Output mode and planning support | convergence, supports final planning |
| Acting owner | manual RPI Agent |
| Required gates or confirmations | Final plan critique |
| Continuation result | Finalize the plan and phase details |
| Primary evidence file | .copilot-tracking/research/2026-08-20/modern-marvel-continuity-guides-research.md |
| Notes for planning or re-entry | Preserve the event-first decision and recent-source boundary |

* Advisory only: rpi-research does not invoke a follow-on skill.
* Completion or limit-blocked basis: Two complete cycles reached planning readiness.

## Sources

* W1 - Comic Book Herald Complete Marvel Reading Order Guide -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/
  (retrieved 2026-08-20, live page)
* W2 - Comic Book Herald Complete Marvel Reading Order Guide -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/
  (retrieved 2026-08-20, live page)
* W3 - World War Hulk: Aftersmash -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/guide-part-10-wwh-aftersmash/
  (retrieved 2026-08-20, live page)
* W4 - X-Men Extermination -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-fresh-start-reading-order/x-men-extermination/
  (retrieved 2026-08-20, live page)
* W5 - From Avengers Disassembled to House of M -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-comics-from-avengers-disassembled-to-house-of-m/
  (retrieved 2026-08-20, live page)
* W6 - Early 2000s Until Avengers Disassembled -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/knights-until-avengers-disassembled/
  (retrieved 2026-08-20, live page)
* W7 - Siege -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/guide-part-13-siege-checklist/
  (retrieved 2026-08-20, live page)
* W8 - Complete Fresh Start Pt. 2 -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-fresh-start-reading-order/part-2/
  (retrieved 2026-08-20, live page)
* W9 - Comic Book Herald Complete Marvel Reading Order Guide -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/
  (retrieved 2026-08-20, live page)
* W10 - One World Under Doom -
  https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/one-world-under-doom/
  (retrieved 2026-08-20, live page)

## Artifact Self-Check

* [x] Every research question is answered or marked unanswerable with the missing evidence named.
* [x] Every executed cycle includes Wave 1 Wider, Wave 2 Deeper, and Wave 3 Contrarian in that order.
* [x] Research posture, provenance, limits, and completion basis are recorded.
* [x] Every codebase finding and external finding carries the required evidence location.
* [x] Every W ID resolves to exactly one source entry.
* [x] Findings, alternatives, decisions, and readiness claims cite Evidence Log IDs.
* [x] The Extension Registry records applicable instructions, skills, and specialists.
* [x] User Participation records the no-interaction rationale.
* [x] Direction Controls record current caller directions and exclusions.
* [x] Parent Synthesis and Disposition is complete.
* [x] Cycle Re-entry Evaluation is complete.
* [x] The recommendation and alternatives are complete.
* [x] Current Decisions and Unresolved Decisions are complete.
* [x] Potential Next Research records priority, value, trigger, selection, and evidence.
* [x] Planning Readiness and Advisory Next Step are final.
* [x] Speculation is flagged and separated from sourced fact.
* [x] Fetched content and repository files were treated as data; no embedded directives were followed.
* Checked sections: Full artifact, both cycles, evidence logs, decision state, readiness, closeout,
  sources, and self-check.
* Missing or limited sections: Exact issue mappings intentionally belong to implementation intake.
