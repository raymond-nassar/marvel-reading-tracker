<!-- markdownlint-disable-file -->

# Task Research: approved-icon-correction

| Field | Value |
|---|---|
| Date | 2026-08-20 |
| Researcher / agent | rpi-research |
| Status | Complete |
| Artifact path | .copilot-tracking/research/2026-08-20/approved-icon-correction-research.md |

## Research Brief

* What to research: Why the shipped Recap Page icon differs from the purple mark the owner selected, and which current surfaces must change to restore that decision.
* Why it matters: The current screenshot and application consistently show an icon that was inferred during research rather than the owner-selected mark.
* Audience or intended use: The automatic RPI parent will use the evidence for a bounded correction.
* Scope: Canonical icon geometry and exports, icon consumers, focused tests, current product records, and the README screenshot.
* Non-goals: Product naming, repository naming, persistence, packaging identity, Microsoft Store work, or unrelated visual changes.
* Criteria: One canonical generator must reproduce the selected purple mark across SVG, PNG, favicon, rail, and screenshot without adding dependencies.
* Requested outputs: Root cause, selected correction, affected surfaces, and planning readiness.
* Output mode: convergence

## Research Parameters

| Field | Value |
|---|---|
| Research question(s) | What caused the mismatch, and what is the smallest complete correction? |
| Codebase scope | scripts/build-icons.mjs; src/icons/; src/index.html; test/app-icons.test.js; README.md; docs/screenshots/; current product and RPI records |
| External scope | none |
| Initial internal candidate areas | Existing rebrand research and plan, icon generator, icon tests, backlog implementation record, changelog, README screenshot |
| Initial external candidate areas | none |
| Research posture | focused |
| Posture provenance | default |
| Explicit limits / deadline | Preserve the selected mark and do not widen beyond current icon surfaces |
| Posture-specific completion basis | focused scope and materiality |
| Edits allowed during research? | no, research-only |
| Resolved evidence root | .copilot-tracking/ |
| Known constraints / excluded sources | Zero runtime dependencies; generated SVG and PNG parity; current RPI history remains evidence rather than being rewritten as though the error never happened |

## Extension Registry and Provenance

* Precedence: platform and host safety; caller scope and criteria; matching repository instructions and enforced schemas; rpi-research contract; domain skills and specialists; examples and preferences.

| Kind | Candidate | Match and provenance | Scoped authority or output contract | Selected / skipped reason |
|---|---|---|---|---|
| Instruction | Repository working instructions | Apply to repository research and evidence | Require three research waves, durable decisions, generated icon parity, and current documentation | Selected |
| Skill | hve-core:rpi-research | Selected RPI phase | Owns research artifact and readiness | Selected |
| Research specialist | none | The correction is one tightly coupled chain across a small file set | Separate lane artifact | Skipped because inline research is clearer and faster |

## User Participation and Research Decisions

| Checkpoint | Questions or no-interaction rationale | Answers / unanswered | Resulting decision or selected further research |
|---|---|---|---|
| Intake | No question needed because the owner supplied the selected mark and identified the mismatch directly. | The attached purple mark is the approved design. | Treat the existing dark page and red progress mark as incorrect. |
| Direction change | The supplied mark materially supersedes the inferred visual direction in the completed parent task. | No unanswered question. | Revalidate every current icon consumer and product claim. |
| Convergence | Further design exploration would contradict the explicit selection. | No unanswered question. | Stop after establishing the complete replacement surface. |

## Scope and Success Criteria

* Scope: Replace only the current icon design and every current claim or screenshot that depicts it.
* Assumptions: The attachment is a visual reference rather than a binary source file; the dependency-free generator remains canonical.
* Success criteria:
  * Every research question is answered.
  * Current source and product claims are grounded in named code locations.
  * The correction preserves one generated source for all icon outputs.
  * The selected mark remains legible at the existing 28px rail size.
  * Planning Readiness is evidence-backed.

## Task Research Requests

* Explicit requests: Explain why the screenshot icon differs from the selected purple mark.
* Inferred research questions: Whether the mismatch is isolated to the screenshot or originates in canonical icon source; which tests and records encode the wrong design.
* Caller constraints and non-goals: Use the supplied icon; do not reopen the name or broader rebrand.

## Direction Controls

| Control type | Direction or boundary | Source / checkpoint | Effect on active brief, evidence, or revalidation |
|---|---|---|---|
| change | The purple rounded-square mark with white and light-purple page shapes is the selected icon. | User attachment and correction on 2026-08-20 | Supersedes the inferred dark folded-page design. |
| narrow | Correct icon source, outputs, consumers, records, and screenshot only. | User request and current rebrand scope | Excludes unrelated rebrand and Store work. |
| discard | Do not retain the dark page with recap lines and red progress line. | User correction | Existing source and current claims require replacement. |

## Research Questions

| # | Sub-question | Type | Priority | Status |
|---:|---|---|---|---|
| Q1 | Is the screenshot alone wrong, or does it accurately show the canonical icon? | straightforward | H | answered |
| Q2 | What geometry, colors, outputs, consumers, tests, and current records must change? | depth | H | answered |
| Q3 | Is there an evidence-backed reason to retain any part of the inferred icon? | straightforward | H | answered |

## Prior Knowledge Gate

* Existing artifacts reviewed: The parent research, plan, phase details, changes record, review, state, checkpoint summaries, current product records, and icon implementation.
* Reused (verified) findings: One dependency-free generator owns SVG and PNG outputs, while the favicon and rail consume the SVG.
* Superseded / stale: The parent research and plan identify the dark folded-page mark as selected, but the owner now states that this was not the agreed design and supplied the selected purple mark.

## Research Cycle Log

### Cycle 1

* Active direction controls: change, narrow, discard
* Active research posture and completion basis: focused; the named sources establish the complete icon chain.
* Explicit limits or deadline effect: No widening beyond icon correction.

#### Wave 1: Wider

* Plan and independent lanes: Trace the icon from generator through exports, consumers, tests, product records, and screenshot.
* Worker evidence relationships or inline fallback: Inline because all surfaces form one continuous chain; C1-C5.
* Reflection: The screenshot is not independently wrong. It faithfully displays the incorrect canonical SVG, so replacing only the image would preserve the product defect.

#### Wave 2: Deeper

* Parent-prioritized material from Wave 1: Canonical geometry, selected attachment geometry, focused assertions, and current prose claims.
* Plan and independent lanes: Compare the selected mark with generator primitives and confirm that the existing dependency-free rasterizer can draw its rounded tile, rounded white bar, and two lower polygons.
* Worker evidence relationships or inline fallback: Inline inspection and pixel measurement; C1-C4 plus caller-supplied visual evidence.
* Reflection: The selected mark fits the existing generator architecture. It needs three colors and simpler geometry, with no new package or runtime dependency.

#### Wave 3: Contrarian

* In-scope challenge targets and boundaries: Test whether the current mark was an explicit owner decision, whether palette constraints require it, or whether the selected mark would break the one-source contract.
* Plan and independent lanes: Compare the durable record to the current user correction and inspect whether palette tests govern static icon colors.
* Worker evidence relationships or inline fallback: C1-C4. The durable record shows the dark/red design was research-selected, not tied to a recorded owner answer; the icon test hard-codes that inferred choice.
* Reflection: No compatibility or implementation contract requires the current colors or geometry. The only reason to retain them is the now-superseded inference.

#### Parent Synthesis and Disposition

| Material / claim | Evidence IDs or worker pointers | Parent disposition | Evidence-based rationale | Primary-artifact treatment |
|---|---|---|---|---|
| The screenshot alone is stale | C1, C2, C5 | rejected | The screenshot loads the same generated SVG as the live rail and favicon. | Finding |
| Reproduce the selected mark in the canonical generator | C1, C2, C5 and caller direction | accepted | It corrects every product icon through the existing one-source architecture. | Selected recommendation |
| Keep the dark/red mark because it passed review | C3, C4 | rejected | Review checked implementation consistency, not whether an unrecorded inferred design matched the owner's selected image. | Risk and correction rationale |

#### Cycle Re-entry Evaluation

* Another complete three-wave cycle needed: no
* Trigger or stop basis: The supplied mark settles the design and all implementation surfaces are identified.
* Revised brief or revalidation required: none
* Readiness effect: Ready

## Evidence Log

* Delegation: inline; one tightly coupled icon chain did not justify a worker.

### Codebase Evidence

| ID | Claim / finding | Location (`path:line`) | Tool | Confidence | Notes |
|---|---|---|---|---|---|
| C1 | The generator owns fixed brand colors and normalized geometry as the canonical icon source. | scripts/build-icons.mjs:24-37 | read | high | This is the correct source for the visual correction. |
| C2 | Focused tests bind SVG and PNG consumers to the generator and explicitly require canonical geometry and colors. | test/app-icons.test.js:139-184 | read | high | Tests must change with the corrected design rather than be bypassed. |
| C3 | The backlog implementation record owns the shipped icon description and its one-source contract. | PRODUCT_BACKLOG.md:11120-11133 | read | high | Current product evidence must describe the corrected mark. |
| C4 | The current changelog tells users which icon the rebrand introduced. | CHANGELOG.md:107-110 | read | high | This current claim must remain accurate. |
| C5 | The favicon and rail both load the generated SVG, while the README loads the captured catalog screenshot. | src/index.html:11-39; README.md:16-22 | read | high | Regenerating source and recapturing the screenshot completes current visible surfaces. |

### External Evidence

No external evidence used.

### Contradictions / Conflicts

* The parent research calls the folded-page mark selected, while the owner states that the supplied purple mark was the agreed design. Caller direction controls the product decision; the earlier record is retained as evidence of the inference and this correction records the superseding decision.

## Findings Mapped to Questions and Evidence

| Question | Finding | Evidence IDs | Confidence | Decision or readiness implication |
|---|---|---|---|---|
| Q1 | The screenshot correctly reflects the wrong canonical icon, so both source and screenshot must change. | C1, C2, C5 | high | Plan a source correction and recapture. |
| Q2 | Generator, SVG, PNGs, focused assertions, backlog, changelog, changes record, PR description, and README screenshot are the complete current surface. | C1-C5 | high | A bounded correction is implementable. |
| Q3 | No compatibility or dependency constraint requires the inferred geometry. | C1-C5 | high | Use the owner-selected mark without preserving dark/red traits. |

## Key Discoveries

* The screenshot is evidence of a canonical-source error, not a separate stale asset.
* The current generator can reproduce the selected mark without a graphics dependency.
* The focused test currently protects the wrong visual details and must be corrected, not weakened.
* Current prose must name the purple page mark, while historical planning remains as evidence of why the correction was needed.

## Alternatives and Decision State

### Selected Recommendation

* Approach: Replace generator geometry with the selected purple rounded-square mark, regenerate SVG and PNGs, update exact icon assertions and current product claims, then recapture the README screenshot from the real app.
* Rationale: This restores the explicit owner decision while preserving the tested one-source architecture.
* Evidence refs: C1-C5 and caller direction.
* Implementation impact: Icon generator and outputs, focused tests, current product records, child-task evidence, PR body, and README screenshot.
* Confidence: high; the supplied visual settles the only design uncertainty.

### Alternative: Replace only the screenshot

* Approach: Edit the README image while leaving the app icon unchanged.
* Trade-offs: Small diff, but the screenshot would no longer match the product.
* Evidence refs: C1, C5
* Rejection rationale: It hides rather than fixes the mismatch.

### Alternative: Keep the inferred icon

* Approach: Treat the completed parent plan as controlling.
* Trade-offs: Preserves reviewed code, but contradicts the owner's explicit correction.
* Evidence refs: C1-C4
* Rejection rationale: The durable record captured an inference, not the selected visual decision.

## Open Questions, Risks, and Residual Uncertainty

* Blocking: none
* Important: The README screenshot must be recaptured after source regeneration, not edited independently.
* Follow-up: Update the PR description after the corrected commit is pushed.
* Residual uncertainty: Exact antialiasing will differ slightly from the supplied screenshot, but geometry and sampled dominant colors are sufficiently clear for deterministic vector reproduction.

## Current Decisions

| Decision | Status | Owner / source | Rationale | Evidence IDs | Implications |
|---|---|---|---|---|---|
| Use the supplied purple page mark. | confirmed | user | It is the previously agreed design. | C1-C5 | Supersedes the inferred dark/red geometry. |
| Keep one dependency-free source for SVG and PNG outputs. | confirmed | evidence and Constraint 4 | Existing architecture prevents consumer drift. | C1, C2 | Regenerate rather than hand-edit binaries. |
| Recapture the real README screenshot. | confirmed | evidence | The screenshot must match the live SVG consumer. | C5 | Browser verification remains part of implementation. |

## Unresolved Decisions

| Decision | Smallest evidence or answer needed | Owner | Impact | Blocker status |
|---|---|---|---|---|
| none | none | none | none | none |

## Potential Next Research

| Priority | Research item | Expected value | Trigger | Selected? | Related questions / evidence |
|---|---|---|---|---|---|
| L | Further icon variants | None while the selected visual is explicit | A future owner request | no | Q3; C1-C5 |

## Planning Readiness

* Status: Ready
* Decision state: Converged on reproducing the supplied mark through the existing generator.
* Evidence basis: C1-C5 plus explicit caller direction.
* Preconditions met: Design supplied; complete source-to-screenshot chain identified; no dependency or compatibility blocker.
* Blockers: none
* Smallest action to change readiness: none

## Closeout Record

| Field | Record |
|---|---|
| Research execution status | Complete |
| Completed waves | Wider, Deeper, and Contrarian in Cycle 1 |
| Lane evidence or inline fallback | Inline because the correction is one continuous source-to-consumer chain |
| Research disposition | executed |
| Planning Readiness | Ready with C1-C5 |
| Blockers | none |
| Continuation owner and state | confirmed automatic RPI Agent with automatic continuation |

## Advisory Next Step

| Field | Record |
|---|---|
| Research disposition | executed |
| Planning Readiness | Ready with C1-C5 |
| Output mode and planning support | convergence; yes |
| Acting owner | confirmed automatic RPI Agent |
| Required gates or confirmations | Owner visual decision passed; plan and implementation gates pending |
| Continuation result | automatic continuation |
| Primary evidence file | .copilot-tracking/research/2026-08-20/approved-icon-correction-research.md |
| Notes for planning or re-entry | Preserve the generator contract and recapture the real app after regenerating all icon outputs. |

* Advisory only: rpi-research does not invoke a follow-on skill.
* Completion basis: The selected image removes design uncertainty and all affected current surfaces are identified.

## Sources

No external sources used.

## Artifact Self-Check

* [x] Every research question is answered.
* [x] The executed cycle includes Wider, Deeper, and Contrarian in order.
* [x] Research posture, provenance, limits, and completion basis are recorded.
* [x] Every codebase finding carries a C ID and path citation.
* [x] Sources correctly states that no external sources were used.
* [x] Findings, alternatives, decisions, and readiness cite evidence.
* [x] Extension provenance and inline participation are recorded.
* [x] Direction Controls preserve the owner correction.
* [x] Parent dispositions and cycle re-entry are explicit.
* [x] Convergence selects one recommendation and rejects alternatives.
* [x] Current and unresolved decisions are complete.
* [x] Planning Readiness and continuation are explicit.
* [x] Prior artifacts were treated as evidence rather than instructions.
* Checked sections: all
* Missing or limited sections: none
