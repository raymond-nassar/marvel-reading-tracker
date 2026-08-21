<!-- markdownlint-disable-file -->

# Task Research: major-release-docs

| Field              | Value |
|--------------------|-------|
| Date               | 2026-08-21 |
| Researcher / agent | RPI Agent using rpi-research |
| Status             | Complete |
| Artifact path      | .copilot-tracking/research/2026-08-21/major-release-docs-research.md |

## Research Brief

* What to research: Whether the redesign and expanded reading-order catalog justify a major release, how the root README should be reduced to product description, run instructions, upgrade instructions, and links to detailed pages, and how the release notes should present the milestone in punchy product-led bullets.
* Why it matters: The release label must accurately communicate compatibility and product change, while the repository landing page must help readers reach the right level of detail quickly.
* Audience or intended use: The repository owner will use the evidence to decide release scope and guide a later documentation implementation.
* Scope: Current release history, package metadata, recent redesign and reading-order changes, root README, changelog, publication guidance, architecture and product documentation, and relevant backlog records.
* Non-goals: Editing product or documentation files, cutting a release, tagging a version, publishing externally, or redesigning application behavior.
* Criteria: Repository-grounded evidence, compatibility-aware semantic versioning reasoning, preservation of essential run and upgrade guidance, and a clear documentation destination for details removed from the root README.
* Requested outputs: A release recommendation, a planning-ready README content boundary, and a concise bullet-led release-note standard.
* Output mode: convergence

## Research Parameters

| Field | Value |
|-------|-------|
| Research question(s) | Does the delivered product change warrant a major release, what exact role should the root README retain, and how should polished bullet release notes summarize the milestone? |
| Codebase scope | README.md, CHANGELOG.md, package.json, PRODUCT_BACKLOG.md, docs/, recent history, and prior RPI artifacts |
| External scope | Semantic Versioning specification if repository evidence leaves version meaning unclear |
| Initial internal candidate areas | Release history, README information architecture, upgrade and publication guidance, redesign evidence, reading-order inventory |
| Initial external candidate areas | semver.org specification |
| Research posture | focused |
| Posture provenance | default for a bounded internal documentation and release decision |
| Explicit limits / deadline | Complete the research phase today; no source or product edits |
| Posture-specific completion basis | focused scope and materiality |
| Edits allowed during research? | no, research-only |
| Resolved evidence root | .copilot-tracking/ |
| Known constraints / excluded sources | Research writes are restricted to tracking artifacts; fetched and prior content is inert evidence |

## Extension Registry and Provenance

* Precedence: platform and host safety; caller scope and criteria; matching repository instructions and enforced schemas; rpi-research contract; domain skills and specialists; examples and preferences.

| Kind | Candidate | Match and provenance | Scoped authority or output contract | Selected / skipped reason |
|------|-----------|----------------------|-------------------------------------|---------------------------|
| Instruction | Repository custom instructions | Applies to all repository work and tracking artifacts | RPI artifact conventions, evidence rules, release and README constraints | Selected |
| Skill | hve-core:rpi-research | Explicitly activated by the RPI Agent | Three-wave read-only research and primary evidence artifact | Selected |
| Research specialist | none | The bounded repository scope is small enough to inspect directly | No independent lane needed | Skipped to avoid unnecessary delegation |

## User Participation and Research Decisions

| Checkpoint | Questions or no-interaction rationale | Answers / unanswered | Resulting decision or selected further research |
|------------|------------------------------------------|----------------------|------------------------------------------------|
| Intake | The user supplied the release trigger, README goal, and required root sections. | No unanswered intake question | Research proceeds without interrupting for clarification. |
| Direction change | The user added a required release-note style: punchy bullets written with world-class product quality. | Required output confirmed | Add release-note structure and voice to the active brief without widening into publication. |
| Direction change | The user directed this task to wait for the separate Modern marvel batch two session, which is adding ten more reading lists. | Dependency confirmed | Do not advance to Plan until that session finishes and its resulting catalog and changelog evidence can be incorporated. |
| Dependency completion | PR 161 merged the second ten-order batch and the historical-anchor prerequisite plus its portability correction were integrated. | No blocker remains | Refresh release facts against the combined tree and mark planning ready. |
| Convergence | Repository evidence settles the compatibility boundary and documentation ownership without another user decision. | No unanswered question | Recommend a flagship v1.3.0 release, a concise root README, and bullet-led release notes. |

## Scope and Success Criteria

* Scope: Release classification and root README information architecture only.
* Assumptions: The redesign and catalog expansion are user-visible and already delivered; version compatibility and existing documentation destinations must be verified.
* Success criteria:
  * Every research question is answered or marked unanswerable with the missing evidence named.
  * Evidence is grounded in repository content and current release history.
  * Findings, decisions, and readiness claims cite Evidence Log IDs.
  * Major, minor, and deferred-release alternatives are compared.
  * Open questions, risks, and residual uncertainty are recorded.
  * Self-check passes.

## Task Research Requests

* Explicit requests: Decide whether to cut a major release, simplify the root README to descriptions, running, upgrading, and detail links, and make release notes punchy, bullet-led, and product-quality.
* Inferred research questions: Whether compatibility changed, which current README material belongs elsewhere, whether upgrade guidance already exists, and which detailed pages are authoritative.
* Caller constraints and non-goals: Do not implement or publish during Research.

## Direction Controls

| Control type (add / change / narrow / exclude / discard) | Direction or boundary | Source / checkpoint | Effect on active brief, evidence, or revalidation |
|----------------------------------------------------------|-----------------------|---------------------|---------------------------------------------------|
| add | Assess a major release after the redesign and catalog expansion. | User intake | Requires release-history and compatibility evidence. |
| add | Define punchy, bullet-led release notes with world-class product language. | User direction change | Requires reviewing changelog conventions and translating technical changes into concise user value. |
| change | Wait for Modern marvel batch two before planning the release. | User direction change | Blocks the Plan handoff and requires a focused evidence refresh after the dependency finishes. |
| narrow | Root README should focus on descriptions, running, upgrading, and links. | User intake | Treat detailed material as candidates for relocation or linking, not deletion without a destination. |
| exclude | Do not implement or publish in Research. | RPI phase contract | Source remains read-only. |

## Research Questions

| # | Sub-question | Type (depth / breadth / straightforward) | Priority | Status |
|--:|--------------|------------------------------------------|----------|--------|
| Q1 | What user-visible changes have accumulated since v1.2.0? | breadth | H | answered |
| Q2 | Do those changes include a breaking compatibility boundary that supports a major version? | depth | H | answered |
| Q3 | Which root README sections are essential, redundant, or better owned by another page? | depth | H | answered |
| Q4 | Where should detailed run, upgrade, architecture, provenance, and release material live? | straightforward | H | answered |
| Q5 | What credible case argues against a major release or aggressive README reduction? | depth | H | answered |
| Q6 | What bullet structure and voice should the release notes use to communicate the milestone crisply? | depth | H | answered |

## Prior Knowledge Gate

* Existing artifacts reviewed: README.md, CHANGELOG.md, package.json, CONTRIBUTING.md, SUPPORT.md, GOVERNANCE.md, docs/ARCHITECTURE.md, docs/DATA_PROVENANCE.md, docs/PUBLICATION_RUNBOOK.md, src/js/lib/version.js, src/js/lib/model.js, src/data/catalog.json, tests around backup compatibility, tag and release metadata, and post-v1.2.0 history.
* Reused (verified) findings: The latest tag and package version are v1.2.0; the project defines major versions by stored-data incompatibility; the root README currently owns both reader and maintainer documentation.
* Superseded / stale: The README's maintainer routing is now redundant with CONTRIBUTING.md, and its current release-note model is too prose-heavy for the user's requested milestone voice.

## Research Cycle Log

### Cycle 1

* Active direction controls: release assessment, focused README boundary, punchy bullet-led release notes, research-only.
* Active research posture and completion basis: focused; answer the bounded release and documentation questions with material repository evidence.
* Explicit limits or deadline effect: Complete today without implementation or publication.

#### Wave 1: Wider

* Plan and independent lanes: Inventory release metadata, post-v1.2.0 changes, README sections, detail documents, backlog evidence, and existing release-note conventions.
* Worker evidence relationships or inline fallback: Inline because the bounded scope does not justify delegation.
* Reflection: The breadth is substantial: 14 unreleased changelog entries, ten additional catalog orders, a complete identity change, and redesign work across the landing, reading, library, add, and settings surfaces. The release is materially larger than a routine feature increment, while the README has grown to 849 lines and mixes reader onboarding with maintainer operations.

#### Wave 2: Deeper

* Parent-prioritized material from Wave 1: Version semantics, schema compatibility, upgrade wording, incoming README links, duplicated contributor guidance, and release-note shape.
* Plan and independent lanes: Verify the stored-data boundary against v1.2.0, map every root section to a durable owner, and separate the GitHub release summary from the exhaustive changelog.
* Worker evidence relationships or inline fallback: Inline comparison of version.js, model.js, current and tagged catalog JSON, README headings, incoming anchor links, CONTRIBUTING.md, and the v1.2.0 GitHub release.
* Reflection: Both builds use schema 2, and the repository explicitly reserves MAJOR for data an older build cannot read. The current changes are backward-compatible features and interface work, so v2.0.0 would communicate a migration risk that does not exist. The root can shrink safely only if troubleshooting and maintainer anchors move with their incoming links.

#### Wave 3: Contrarian

* In-scope challenge targets and boundaries: Challenge whether scale alone warrants a major version and whether a shorter README would hide required operational guidance.
* Plan and independent lanes: Compare major, minor, and deferred-release interpretations against repository evidence.
* Worker evidence relationships or inline fallback: The repository's own version contract and SemVer both challenge v2.0.0; SUPPORT.md, GOVERNANCE.md, and CONTRIBUTING.md challenge deleting root sections without replacement; the scale and identity change challenge treating this as an ordinary, low-profile minor release.
* Reflection: The challenge does not weaken the case for releasing now. It changes the framing: this should be a major product milestone numbered v1.3.0, not a MAJOR compatibility release numbered v2.0.0. A short README is beneficial, but only with deliberate destinations and link updates.

#### Parent Synthesis and Disposition

| Material / claim | Evidence IDs or worker pointers | Parent disposition (accepted / rejected / deferred) | Evidence-based rationale | Primary-artifact treatment |
|------------------|---------------------------------|-----------------------------------------------------|--------------------------|----------------------------|
| Release now as a flagship milestone. | C2, C3, C4, C6 | accepted | The accumulated redesign, identity, and catalog expansion are coherent and user-visible. | Selected recommendation |
| Number the release v1.3.0 rather than v2.0.0. | C1, C5, C6, W1 | accepted | Both the project contract and SemVer reserve MAJOR for incompatibility, while schema 2 remains readable. | Compatibility decision |
| Reduce the root README to reader-facing essentials. | C7, C8, C9, C10, C11 | accepted | The current 849-line page mixes onboarding, troubleshooting, data provenance, testing, curation, and release operations. | Documentation boundary |
| Delete detailed sections without relocating them. | C9, C10 | rejected | Other documents rely on those anchors, and the exact-origin warning protects saved progress. | Contrarian guardrail |
| Use concise product bullets for release notes while preserving the full changelog. | C3, W2 | accepted | The release page needs a fast product story; the changelog already owns exhaustive evidence. | Release-note standard |

#### Cycle Re-entry Evaluation

* Another complete three-wave cycle needed: no.
* Trigger or stop basis: All questions are answered, compatibility evidence is direct, documentation dependencies are mapped, and likely next sources are redundant.
* Revised brief or revalidation required: none.
* Readiness effect: Ready.

## Evidence Log

* Delegation: inline; bounded repository scope does not justify a worker.

### Codebase Evidence

| ID | Claim / finding | Location (`path:line`) | Tool | Confidence | Notes |
|----|-----------------|------------------------|------|------------|-------|
| C1 | The project defines MAJOR as stored data an older build cannot read, MINOR as backward-compatible features or interface changes, and PATCH as compatible fixes. | src/js/lib/version.js:3-16 | read | high | CHANGELOG.md:5-10 presents the same contract to readers. |
| C2 | The prepared package version is 1.3.0 while the latest published release remains 1.2.0 until publication is separately approved. | package.json:3 | read plus git and GitHub release metadata | high | No tag or release is created by this task. |
| C3 | The 1.3.0 boundary contains 16 entries covering the new identity, visual system, landing, reading, library, add, and settings redesigns, twenty new event guides, historical anchor support, focused guides, and supporting provenance and intake work. | CHANGELOG.md:17-274 | heading inventory and read | high | This is a coherent milestone rather than a single isolated feature. |
| C4 | The shipped catalog grew from 26 entries at v1.2.0 to 46 entries now. | src/data/catalog.json:3 | parsed current and tagged JSON | high | The increase is exactly twenty orders. |
| C5 | The current build and v1.2.0 both declare stored-data schema 2. | src/js/lib/model.js:12 | current read plus tagged-file comparison | high | No schema-version compatibility boundary was introduced. |
| C6 | The rebrand keeps saved progress under the same browser keys and accepts backups under the old identity. | CHANGELOG.md:206-208 | read plus model test search | high | The backup label changed, but compatibility is preserved. |
| C7 | The implemented root is a 118-line reader landing page with the product story, benefits, privacy, run and upgrade paths, companion links, disclaimer, and license. | README.md:1-118 | heading inventory and line count | high | Detailed operations now live outside the landing page. |
| C8 | CONTRIBUTING.md owns project principles, checks, testing, data changes, dependencies, reporting, conduct, and governance while routing longer procedures to the maintainer guide. | CONTRIBUTING.md:51-213 | read | high | Policy and operational procedure now have distinct owners. |
| C9 | SUPPORT.md, GOVERNANCE.md, and CONTRIBUTING.md route troubleshooting, exact-origin guidance, data sources, running, curation, pinned actions, and releasing to the new canonical guides. | SUPPORT.md:8-18; CONTRIBUTING.md:59-62; GOVERNANCE.md:66-70 | repository link search | high | The former incoming root links are fully redirected. |
| C10 | The quick upgrade contract remains simple but safety-critical: replace the folder and browser-held progress carries over because it remains saved under the same app address. | README.md:82-95 | read | high | The root retains the short form while detailed troubleshooting lives elsewhere. |
| C11 | Architecture, provenance, browser-app rationale, support, security, governance, and contribution pages remain detailed destinations in a focused Learn more section. | README.md:97-107 | read and file inventory | high | The root routes readers instead of reproducing those pages. |
| C12 | Detailed browser checks, upgrade checks, pinned-action review, reading-order authoring, and release mechanics now live in the maintainer guide. | docs/MAINTAINING.md:68-387 | read | high | Contributor policy remains separate. |

### External Evidence

| ID | Claim / finding | Source (title) | URL | Retrieved | Version/date | Confidence |
|----|-----------------|----------------|-----|-----------|--------------|------------|
| W1 | Semantic Versioning assigns MINOR to backward-compatible functionality and MAJOR to backward-incompatible changes. | Semantic Versioning 2.0.0 | https://semver.org/spec/v2.0.0.html | 2026-08-21 | 2.0.0 | high |
| W2 | The v1.2.0 GitHub release uses several prose sections and points to CHANGELOG.md for the complete list. | Recap Page v1.2.0 release | https://github.com/raymond-nassar/recap-page/releases/tag/v1.2.0 | 2026-08-21 | 2026-08-20 release | high |

### Contradictions / Conflicts

* Milestone language versus version contract: the redesign is a major product moment, but neither the repository's declared compatibility contract nor SemVer supports a 2.0.0 number. Resolve by calling it a flagship or major release in product framing while numbering it v1.3.0.

## Findings Mapped to Questions and Evidence

| Question | Finding | Evidence IDs | Confidence | Decision or readiness implication |
|----------|---------|--------------|------------|-----------------------------------|
| Q1 | The release combines a new name and visual identity, redesigned primary workflows, and twenty new guides, increasing the catalog from 26 to 46. | C3, C4 | high | Release now as one coherent milestone. |
| Q2 | No stored-data break exists: schema 2 is unchanged and compatibility is explicitly preserved. | C1, C5, C6, W1 | high | Use v1.3.0, not v2.0.0. |
| Q3 | Keep product description, core benefits and privacy, fast run instructions, fast upgrade instructions, detail links, disclaimer, and license in root. Move troubleshooting and maintainer manuals. | C7, C10, C11, C12 | high | Root outline is planning-ready. |
| Q4 | Put reader troubleshooting in a focused running guide; consolidate browser, upgrade, curation, pinning, and release mechanics in maintainer documentation; reuse existing topical pages. | C8, C9, C11, C12 | high | Update all incoming anchor links atomically. |
| Q5 | v2.0.0 would falsely signal incompatibility, while deleting root detail without destinations would break repository navigation and hide the exact-origin safety rule. | C1, C5, C9, C10, W1 | high | Preserve semantics and move, rather than discard, necessary detail. |
| Q6 | Use one sharp headline and a short list of benefit-first bullets, end with a safe-upgrade bullet and a link to the full changelog, and omit implementation detail from the release page. | C3, W2 | high | Release notes can be punchy without weakening the durable record. |

## Key Discoveries

* The right answer separates release importance from version compatibility: ship a major product milestone as v1.3.0.
* Twenty new guides move the catalog from 26 to 46, while the redesign touches every primary reader journey and introduces the Recap Page identity.
* The README is 849 lines because it contains a landing page, a running manual, a troubleshooting guide, and a maintainer handbook at once.
* The short root upgrade section is load-bearing: keep the exact local address and browser-storage explanation visible.
* GitHub release notes should become a polished product summary in bullets; CHANGELOG.md remains the exhaustive technical and historical record.

## Alternatives and Decision State

### Selected Recommendation (convergence only)

* Approach: Cut a flagship v1.3.0 release after restructuring the documentation. Keep the root README concise and reader-first, relocate detailed operating and maintainer material with all incoming links updated, and publish benefit-first bullet release notes that link to the full changelog.
* Rationale: The milestone is large enough to deserve a deliberate launch, but saved-data compatibility makes MINOR the truthful number. Documentation restructuring and release copy should ship together so the release sends readers to a clean, accurate landing page.
* Evidence refs: C1-C12, W1, W2.
* Implementation impact: Rewrite README.md; add or expand focused running and maintainer documentation; update CONTRIBUTING.md, SUPPORT.md, and GOVERNANCE.md links; convert Unreleased into a v1.3.0 entry; bump synchronized versions; prepare concise GitHub release copy; update backlog and changelog records required by repository policy.
* Confidence: high. The compatibility boundary, catalog growth, documentation dependencies, and release conventions are directly evidenced.

Proposed root README structure:

1. Product description and screenshot
2. What Recap Page helps a reader do
3. Run the app
4. Upgrade safely
5. Privacy and data boundary
6. Learn more
7. Disclaimer and license

Proposed release-note structure:

* One headline that names the new Recap Page milestone.
* Five to seven bullets, each beginning with the reader benefit rather than the implementation.
* One bullet for the new identity and visual system.
* One bullet for clearer discovery and reading progress.
* One bullet for the twenty new modern event guides and the 46-order catalog.
* One explicit safe-upgrade bullet.
* One final link to the full changelog.

### Alternative: Major release

* Approach: Publish the redesign and expanded catalog as the next major version.
* Trade-offs: Strong version-number signal, but it tells readers and older builds to expect a compatibility break.
* Evidence refs: C1, C5, C6, W1.
* Rejection rationale: Rejected as v2.0.0 because no stored-data or public compatibility break exists.

### Alternative: Minor release

* Approach: Publish the accumulated backward-compatible features as the next minor version.
* Trade-offs: Accurately communicates backward-compatible features; product framing must carry the milestone weight the number does not.
* Evidence refs: C1-C6, W1.
* Rejection rationale: Selected, with flagship launch framing.

### Alternative: Defer release

* Approach: Complete documentation restructuring before choosing and publishing the version.
* Trade-offs: Keeps release copy aligned with final documentation, but postpones a coherent set of already completed reader benefits.
* Evidence refs: C3, C4, C7.
* Rejection rationale: Reject indefinite deferral; finish the documentation restructuring as the release-closing change.

## Open Questions, Risks, and Residual Uncertainty

* Resolved dependency: PR 161 merged the second ten-order batch, and the current tree contains 46 orders.
* Important: "World-class product team" is a quality bar rather than a mechanically testable phrase. Planning should make it concrete through brevity, specificity, benefit-first bullets, and removal of implementation jargon.
* Follow-up: The release itself is externally visible and should occur only after the documentation and version change merge to main.
* Residual uncertainty: The exact wording of the final release bullets should be written after implementation so it describes what actually shipped.

## Current Decisions

| Decision | Status | Evidence | Owner / next trigger |
|----------|--------|----------|----------------------|
| Keep Research read-only. | confirmed | RPI phase contract | RPI Agent |
| Preserve a short root README focused on description, run, upgrade, and detail links as the target boundary. | caller-directed | User intake | Planning after research |
| Require concise bullet-led release notes with polished product language. | caller-directed | User direction change | Planning after research |
| Treat this as a flagship product release but number it v1.3.0. | research recommendation | C1-C6, W1 | User or Plan phase |
| Keep the exhaustive changelog separate from the concise GitHub release notes. | research recommendation | C3, W2 | Plan phase |
| Wait for the additional ten-list batch before planning the release. | satisfied | PR 161 merged and C3-C4 were refreshed | Plan is ready |

## Unresolved Decisions

| Decision needed | Options | Evidence needed | Owner / trigger |
|-----------------|---------|-----------------|-----------------|
| Whether to accept the v1.3.0 recommendation | v1.3.0 flagship release or explicit override | Research is complete | User advancement to Plan |

## Potential Next Research

* No further research is required before implementation. Final release wording remains implementation work so it describes the finished documentation.

## Planning Readiness

* Status: Ready.
* Rationale: PR 161 is integrated, the catalog and Unreleased inventory were re-derived from the combined tree, schema compatibility remains unchanged, and the historical-anchor prerequisite passes with local-only evidence excluded from the portable lock.
* Evidence refs: C1-C12, W1, W2.
* Blocking gaps: None.

## Research Disposition

* Disposition: executed
* Rationale: One focused cycle completed Wider, Deeper, and Contrarian waves and produced a planning-ready recommendation.

## Sources

* Internal repository files and git history listed in the Evidence Log.
* Semantic Versioning 2.0.0, retrieved 2026-08-21.
* Recap Page v1.2.0 GitHub release, retrieved 2026-08-21.

## Self-Check

* [x] All requested research outputs are addressed.
* [x] Scope and non-goals are explicit.
* [x] Wider, deeper, and contrarian waves are complete.
* [x] Evidence IDs support material findings and readiness.
* [x] Alternatives and recommendation are evidence-based.
* [x] Open questions and residual uncertainty are honest.
* [x] Planning readiness is recorded.

## Advisory Next Step

* Manual workflow is ready for `/rpi-implement`.
