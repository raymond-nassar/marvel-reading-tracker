<!-- markdownlint-disable-file -->
# RPI Plan Critique: Major release documentation

## Metadata

* Task ID: MRT-002
* Task slug: major-release-docs
* Critique date: 2026-08-21
* Plan: .copilot-tracking/plans/2026-08-21/major-release-docs-plan.md
* Phase details: .copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md
* Critique execution status: Complete

## Inputs and Criterion Boundary

* Task context and caller requirements: Assess the final candidate for a root README of at most 250
  lines, no application behavior change, at most two new product documents, exact relocation of the
  named reader and maintainer detail, punchy release bullets, and a hard wait on the dependent
  catalog-expansion session before final release facts or synchronized version metadata.
* Research and evidence considered: The supplied research, plan, phase details, README, contribution,
  support, governance, changelog, product backlog, three affected test files, anchor lock, and
  repository instructions.
* Decisions, dependencies, and acceptance criteria considered: The locked target set, generated-file
  boundary, test-change boundary, exact removals, P01 and P02 independence from the ten-list batch,
  P03 dependency, final fact derivation, release publication exclusion, phase and task markers, and
  all stated functional and non-functional acceptance criteria.
* Assessment boundary: This critique assesses only the supplied repository state and caller
  requirements. It does not inspect the dependent session, invent its eventual facts, perform new
  research, or decide an exception to repository instructions on the user's behalf.

## Coverage Assessment

| Requirement, research, phase, or task ID | Coverage | Evidence or concern |
|------------------------------------------|----------|---------------------|
| MRT-002 root boundary | Covered | The plan caps README.md at 250 lines and retains description, screenshot, benefits, privacy, running, upgrading, routing, disclaimer, and license. |
| Locked additions and target ownership | Covered | The candidate adds only docs/RUNNING.md and docs/MAINTAINING.md and names the three router documents. |
| Exact root removals and destinations | Partial | The two guide task descriptions name the required topic groups, but there is no implementation-ready old-heading-to-destination inventory and no disposition for every other heading omitted by the new root outline. |
| No application behavior change | Covered | Runtime and storage changes are excluded; the later synchronized version bump is separately and explicitly bounded. |
| Phase and task markers | Covered | P01 through P03 and P01-T01 through P03-T03 have unique, matching phase and task markers in both candidate artifacts. |
| P01/P02 dependency safety | Partial | The phase split is sound at a high level, but P01-T03 assigns CONTRIBUTING.md work and completion evidence that P02 owns, while P01-T01 depends on destination headings whose tasks follow it. |
| Dependent session gate | Partial | The session ID and P03-only block are present, but the plan does not define the evidence that proves the session completed successfully and its result is the tree being measured. |
| Final release facts and version boundary | Covered | Catalog totals, release bullets, the changelog version boundary, and synchronized 1.3.0 metadata are deferred to P03 and re-derived from the integrated tree. |
| Release-note quality | Covered | The candidate requires a headline, five to seven benefit-first bullets, safe-upgrade wording, final facts, and a full-changelog link without implementation jargon. |
| Publication exclusion | Covered | Tagging, release creation, and asset upload require later explicit confirmation. |
| Test ownership and semantic coverage | Partial | The candidate allows narrow existing-test changes, but does not assign the README CI-check contract in test/governance-docs.test.js to docs/MAINTAINING.md or define how the two new guides enter link and command coverage. |
| Anchor workflow | Missing | The candidate assumes all anchor movement can close through the established workflow, but the lock contains historical tracking scopes aimed at README sections that must leave the root, while repository instructions prohibit re-aiming historical artifacts. |
| Validation evidence | Partial | Commands and zero-result checks are comprehensive, but the anchor outcome is currently unattainable and changed-test semantic evidence is not specified. |
| Executive summary synchronization | Covered | The summary, phase checklist, dependencies, and handoff consistently state that P01/P02 may proceed and P03 waits. |

## Verdict

* Verdict: Blocked
* Rationale: The overall information architecture, release boundary, and P03 wait are credible, but
  the candidate cannot meet its own anchor acceptance criterion within the locked target set.
  docs/anchors.lock.json records historical tracking scopes aimed at README material beyond the
  proposed 250-line root. Repository instructions say those historical artifacts must not be
  re-aimed, and merely blessing the generated lock cannot change or remove the source citations.
  A user-approved policy or scope decision is required before implementation can be credible.

## Findings

<!-- rpi:critique id=PC-001 -->
### PC-001 [Critical]: Historical README anchors make the locked candidate unsatisfiable

* Related IDs: MRT-002 locked generated target, information-preservation requirement, P02-T02,
  P02-T03, P03-T03
* Evidence: docs/anchors.lock.json contains sixteen README anchor entries. Eight originate in dated
  research or research-subagent artifacts, including required maintainer material currently below
  the future root limit. Repository instructions state that dated tracking artifacts are historical
  records and must not be re-aimed to satisfy the anchor gate. The plan instead permits historical
  prose changes for anchor maintenance and expects zero drift, additions, and removals after the root
  content moves.
* Concern: The root cannot both end at or before line 250 and continue to satisfy historical
  citations aimed at current README material in the 481 through 718 region. Updating only
  docs/anchors.lock.json cannot redirect those source citations. Re-aiming their tracking sources
  would violate repository instructions, while changing the anchor checker or adding an exemption
  would exceed the locked target set.
* Impact: P02 cannot complete, all stated gates cannot pass, and P01 cannot be declared safe to land
  under the current candidate. Blessing the lock without resolving the source citations would not
  solve the contradiction.
* Smallest useful change: Obtain one explicit choice: authorize a narrowly enumerated historical
  citation migration for this structural move, or authorize a separately designed anchor mechanism
  and its additional target scope. Record the selected exception and exact affected scopes in the
  plan before implementation. Do not treat a lock-only bless as a choice.
* Action owner: User, followed by the planning parent
* Exact resolving evidence: The finalized plan records the approved exception or mechanism, names
  every affected historical scope, assigns the permitted source targets, and includes a demonstrated
  anchor cycle ending with zero drifted, zero new, and zero removed without silently dropping any
  citation.
* Decision route: Significant user decision because every viable route changes a locked boundary or
  a standing repository instruction.

<!-- rpi:critique id=PC-002 -->
### PC-002 [High]: The test migration does not name the new semantic owners

* Related IDs: compatibility safety, P01-T01, P01-T03, P02-T03
* Evidence: test/privacy-copy.test.js deliberately scopes the full network disclosure between the
  README privacy and running headings. test/updateCheck.test.js requires the stable Windows archive
  URL in README.md. test/governance-docs.test.js separately requires README.md to contain a fenced
  block with every CI check and the exact CI check count. The proposed root forbids maintainer
  procedures longer than a link sentence, while docs/MAINTAINING.md is intended to own the check
  matrix.
* Concern: The candidate says affected tests may move without weakening, but it does not state which
  assertions remain regression contracts on the root and which semantic contract transfers to a new
  owner. An implementer could leave the suite red, retain forbidden maintainer detail in the root, or
  weaken the original protection.
* Impact: The root length and content boundary cannot be implemented predictably, and "tests pass"
  would not demonstrate that the same documentation promises remain protected.
* Smallest useful change: Add a test-ownership table to P02-T03. Keep the privacy contract and stable
  download contract on README.md. Transfer the exact CI gate-set and count subject from README.md to
  docs/MAINTAINING.md while retaining CONTRIBUTING.md. Extend the existing governance document link
  and command corpus to include both new guides where doing so strengthens the same test rather than
  creating a new test.
* Action owner: Planning parent
* Exact resolving evidence: The phase details name each of the three tests, its current subject, its
  final subject, whether it is semantic or regression coverage, the exact preserved assertions, and
  a validation showing the transferred assertion fails when its new canonical content or link is
  removed and passes on the completed tree.
* Decision route: Direct planner correction.

<!-- rpi:critique id=PC-003 -->
### PC-003 [Medium]: The relocation inventory is deferred past the planning decision

* Related IDs: information preservation, P01-T01, P01-T02, P01-T03, P02-T01
* Evidence: The plan requires a section relocation inventory as completion evidence, and the two new
  guide outlines broadly name the destination topics. The current README also contains duplicated
  startup material, companion links, data-source material, contributor routing, and other headings
  absent from the approved root outline. Their destination, merge, or retirement is not decided in
  the phase details.
* Concern: "Every removed section has a destination" is currently an implementation-time discovery
  rather than a plan. The locked removals are recognizable across the guide outlines, but they are
  not listed one-for-one, and additional omitted headings have no explicit disposition.
* Impact: P01 can accidentally drop useful content, create a third canonical owner through
  duplication, or widen P02 while trying to settle information architecture after writing begins.
* Smallest useful change: Put the relocation inventory in P01 details before implementation. Map
  every current README heading to Retain in root, docs/RUNNING.md, docs/MAINTAINING.md, an existing
  canonical document, Merge as duplicate, or Retire with reason. Explicitly list all nine locked
  removal groups and their named destinations.
* Action owner: Planning parent
* Exact resolving evidence: A complete heading inventory in the phase details has zero unassigned
  rows, names no product document beyond the two allowed additions and existing canonical pages, and
  is used as the P01 completion checklist.
* Decision route: Direct planner correction.

<!-- rpi:critique id=PC-004 -->
### PC-004 [Medium]: P01 and P02 have overlapping router ownership and reversed task prerequisites

* Related IDs: P01, P01-T01, P01-T02, P01-T03, P02, P02-T01
* Evidence: P01 boundaries name only README.md and the two new guides. P01-T03 nevertheless lists
  CONTRIBUTING.md as a likely target and requires it to stop linking to root maintainer anchors.
  P02 explicitly owns router updates. P01-T01 also depends on destination headings from P01-T02 and
  P01-T03, although it is ordered before them.
* Concern: The phase boundary does not identify a single owner for CONTRIBUTING.md, and the checklist
  order invites root links to be written before their destination headings are stable.
* Impact: P01 cannot be reviewed against its own target boundary, and partial implementation can
  leave either broken links or duplicate edits before P02 begins.
* Smallest useful change: Keep all router edits and router completion evidence in P02-T01. Make
  P01-T02 and P01-T03 establish final destination headings before P01-T01 finalizes root links, or
  record an explicit heading-contract dependency that permits drafts in parallel.
* Action owner: Planning parent
* Exact resolving evidence: The finalized phase details assign each file to one phase, show
  P01-T02/P01-T03 heading contracts as prerequisites of P01-T01 link finalization, and leave P02-T01
  as the sole owner of CONTRIBUTING.md, SUPPORT.md, and GOVERNANCE.md routing.
* Decision route: Direct planner correction.

<!-- rpi:critique id=PC-005 -->
### PC-005 [Medium]: The dependent session gate lacks an exact completion and integration proof

* Related IDs: P03, P03-T01, P03-T02, P03-T03
* Evidence: The plan identifies the dependent catalog-expansion session and says it must be complete
  and integrated. P03 then re-derives facts from the final tree, but no artifact or check
  proves that the measured tree contains the dependent session's accepted result rather than merely
  a locally complete catalog state.
* Concern: "Session complete" and "result integrated" are different conditions, and both matter
  before final totals, changelog boundaries, release bullets, and version metadata become valid.
* Impact: P03 could begin from a tree that omits or only partially carries the ten-list result, making
  polished release facts internally consistent but incomplete.
* Smallest useful change: Define the P03 entry gate as successful dependent-session completion plus
  integration of its identified commit or accepted diff. Record that identity before calculating any
  total, then re-run the full P01/P02 link, test, and anchor evidence after integration.
* Action owner: Planning parent
* Exact resolving evidence: The implementation record names the dependent session result and commit
  or accepted diff, shows it present in the current tree, derives the list delta and catalog total
  from that integrated tree, and records all P03 validations after the integration point.
* Decision route: Direct planner correction.

## Strengths and Residual Risk

* The candidate correctly separates product importance from compatibility semantics and keeps the
  intended release at 1.3.0 unless the post-batch schema comparison says otherwise.
* The executive summary, acceptance criteria, phase checklist, and handoff consistently keep final
  catalog facts, release bullets, changelog versioning, and synchronized version metadata in P03.
* The root maximum, two-document addition cap, no-behavior boundary, exact origin, stable download,
  privacy, safe upgrade, and later publication confirmation are all explicit.
* Release-copy criteria are concrete enough to review without mistaking the exhaustive changelog for
  the short release announcement.
* P01 and P02 are conceptually independent of the catalog batch. They become safe to implement before
  P03 after PC-001 is decided and PC-002 through PC-004 are incorporated.
* Residual risk after revision: Integrating the dependent branch may overlap CHANGELOG.md,
  PRODUCT_BACKLOG.md, README.md, or the anchor lock. P03's final full validation must occur after
  conflict resolution, never before it.

## Questions or Blocking Evidence Gaps

* Decision required: Which explicit exception or additional mechanism is authorized for the
  historical README citations identified in PC-001?
* No other user decision is required. PC-002 through PC-005 are direct planner corrections.

## Limitations

* The dependent session was intentionally not inspected, so this critique does not assert its status,
  branch, commit, exact list identities, catalog total, or final changelog content.
* The critique does not validate future release prose or future anchor pairings. It validates whether
  the plan specifies how those facts will be established.
* No source, plan, phase-detail, research, product, test, or lock file was edited.

## Recommended Next Action

* Highest-impact finding: PC-001
* Action owner: User for the boundary decision, then the planning parent for the one-pass revision
* Smallest next action: Choose the permitted treatment for historical README citations, then have the
  planning parent revise the final candidate once to incorporate PC-001 through PC-005.
* User response required: Yes, for PC-001 only.

## Relevant Artifacts

| Artifact | Description |
|----------|-------------|
| [.copilot-tracking/research/2026-08-21/major-release-docs-research.md](.copilot-tracking/research/2026-08-21/major-release-docs-research.md) | Supplied research and release recommendation |
| [.copilot-tracking/plans/2026-08-21/major-release-docs-plan.md](.copilot-tracking/plans/2026-08-21/major-release-docs-plan.md) | Critiqued final-candidate plan |
| [.copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md](.copilot-tracking/details/2026-08-21/major-release-docs-phase-details.md) | Critiqued phase and task details |
| [.copilot-tracking/reviews/plans/2026-08-21/major-release-docs-plan-critique.md](.copilot-tracking/reviews/plans/2026-08-21/major-release-docs-plan-critique.md) | This complete final-candidate critique |
| [README.md](README.md) | Current root content and relocation source |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution policy and current README router |
| [SUPPORT.md](SUPPORT.md) | Support and troubleshooting router |
| [GOVERNANCE.md](GOVERNANCE.md) | Governance and release router |
| [CHANGELOG.md](CHANGELOG.md) | Current Unreleased record and later version boundary |
| [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md) | Product record and live README citations |
| [test/privacy-copy.test.js](test/privacy-copy.test.js) | Semantic privacy-copy contract |
| [test/updateCheck.test.js](test/updateCheck.test.js) | Stable download and release-link regression contract |
| [test/governance-docs.test.js](test/governance-docs.test.js) | Documentation links, commands, and CI-set contract |
| [docs/anchors.lock.json](docs/anchors.lock.json) | Generated anchor inventory exposing the historical-scope conflict |
| [.github/copilot-instructions.md](.github/copilot-instructions.md) | Repository instructions governing historical artifacts and anchor workflow |

## Next Steps

* This is a standalone final-candidate critique. The eligible next action is for the user to resolve
  PC-001, then run `/rpi-plan` so the planning parent can make the single final revision. Do not begin
  implementation while the anchor treatment remains undecided.
