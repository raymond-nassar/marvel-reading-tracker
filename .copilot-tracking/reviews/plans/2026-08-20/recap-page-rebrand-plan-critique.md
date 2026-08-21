<!-- markdownlint-disable-file -->
# RPI Plan Critique: Recap Page rebrand

## Metadata

* Task ID: MRT-002
* Critique date: 2026-08-20
* Plan: .copilot-tracking/plans/2026-08-20/recap-page-rebrand-plan.md
* Phase details: .copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md
* Critique execution status: Complete

## Inputs and Criterion Boundary

* Task context and caller requirements: BL-161 through BL-164 are one cohesive Recap Page rebrand.
  The product name is Recap Page, the repository slug is recap-page, the GitHub repository rename is
  in this task, and the remaining RPI phases run automatically. The release asset
  marvel-reading-tracker-windows.zip, every mrt.* key, manifest id/start_url/scope, historical RPI
  artifacts, old release entries, and design mockups stay unchanged.
* Research and evidence considered: .copilot-tracking/research/2026-08-20/recap-page-rebrand-research.md,
  PRODUCT_BACKLOG.md BL-161 through BL-164, the named product sources, icon and packaging scripts,
  manifest, update module, and existing test owners identified by the plan.
* Decisions, dependencies, and acceptance criteria considered: The caller locks no removals, at most
  one new product file at src/icons/icon.svg, zero new test files, exactly two new test() blocks,
  scripts/build-icons.mjs as the canonical icon source, SVG plus 192px and 512px PNG outputs, the
  plan's semantic and regression test ownership, internal validation before repository mutation,
  and post-rename compatibility proof before backlog closure.
* Assessment boundary: This critique assesses whether the supplied plan can credibly implement and
  observe the confirmed requirements. It does not repeat external naming research, execute the
  repository rename, choose an unconfirmed Store-listing boundary, or evaluate visual taste.

## Coverage Assessment

| Requirement, research, phase, or task ID | Coverage | Evidence or concern |
|---|---|---|
| Caller cohesive-scope decision; BL-161 through BL-164 | Covered | One task, four dependent phases, and one backlog closeout preserve the confirmed major-feature boundary. |
| Caller product-name and repository-slug decisions | Covered | Recap Page and raymond-nassar/recap-page are fixed throughout the plan and details. |
| Caller automatic-mode decision | Partial | P04 adds another user confirmation even though the caller already authorized this exact repository rename. See PC-003. |
| Caller compatibility locks; research C5, C6, C9, C11, C16 through C20, C23 | Covered | The zip basename, mrt.* keys, manifest identity paths, old-backup acceptance, and old installed-copy routes have independent owners and post-rename checks. |
| Caller historical-surface exclusions; research C21 | Covered | Historical RPI artifacts, old release entries, and design mockups are consistently excluded from replacement. |
| Candidate file and test lock | Partial | File additions and removals are bounded, but the plan states a maximum of two new test blocks rather than the caller's exact two and does not allocate those two blocks. See PC-004. |
| P01-T01; BL-161; research C8, C14, C15, C22 | Partial | One generator and the named icon tests can establish parity, but the new SVG is invisible to the git-derived packager until tracked. See PC-001. |
| P01-T02 | Covered | Live source, package, backup, packaging, server, and current-document labels have named targets and observable searches. |
| P02-T01; BL-163; research C13 | Covered | Both short surfaces and the unchanged detailed provenance have one exact expected sentence and an existing test owner. |
| P02-T02; BL-164 | Covered | Repository slug and release asset basename are independently asserted, while storage and manifest identities are pinned separately. |
| P03-T01 and P03-T02 | Partial | Internal-before-external sequencing is sound, but tracking the new SVG must precede packaging and anchors validation. See PC-001. |
| P04-T01 external rename safety | Partial | Availability, permission, mutation, and remote checks are present, but authorization is reopened and the post-mutation partial-failure state is not made resumable. See PC-003 and PC-005. |
| P04-T02 compatibility acceptance | Covered | Old and new API, release, asset, clone, fetch, and local-remote results are observable after the real rename, and backlog closure is deferred until then. |
| BL-162 acceptance | Missing | The backlog requires the decided name in the Store listing and a clearance recheck immediately before reservation, while the plan excludes a Store listing and still requires BL-162 to become Shipped. See PC-002. |
| Full gate and fail-before-fix requirements | Covered | Focused mutation proofs precede full lint, test, auxiliary, browser, dash, and reviewed anchor checks, with final checks repeated after the external rename. |

## Verdict

* Verdict: Revise
* Rationale: The implementation and compatibility design is credible, but the final candidate cannot
  yet support all of its completion claims. A new generated SVG can be absent from the Windows
  package during the planned real build, BL-162 has acceptance that the plan explicitly excludes,
  automatic execution is blocked by a redundant confirmation, and the exact two-test-block lock and
  post-mutation recovery state need to be made deterministic. Four findings are direct planning
  corrections. One significant Store-listing decision remains with the user.

## Findings

<!-- rpi:critique id=PC-001 -->
### PC-001 [High]: Track the new SVG before package and anchor validation

* Related IDs: Caller file lock, P01-T01, P03-T02, BL-161, research C8 and C22
* Evidence: The plan introduces src/icons/icon.svg and runs a real Windows package build, but does
  not place a tracking step before that build. scripts/pack-windows.mjs derives appFiles() from
  git ls-files, so an untracked SVG is omitted even while the working-tree browser can load it.
  The anchors gate has the same tracked-file boundary. test/packaging.test.js does not currently pin
  the SVG as an archive input.
* Concern: The planned package build can succeed with no SVG in the archive, leaving the favicon and
  rail consumer broken only in the distributed copy. The first anchors run can likewise validate a
  tree that does not include the sole new source file.
* Impact: BL-161 could be marked Shipped and the real package reported successful while the packaged
  Recap Page lacks the canonical icon used by two current consumers.
* Smallest useful change: In P03-T02, require src/icons/icon.svg to be added to the index before the
  focused packaging assertion, real package build, or first anchors run. Extend the existing
  packaging archive-content test block to require src/icons/icon.svg in appFiles(), then inspect the
  built archive for that path. This uses no new test file or test() block.
* Action owner: Planning parent
* Exact resolving evidence: The revised plan and P03-T02 details order icon generation, index
  tracking, the existing packaging assertion, the real package build and archive inspection, then
  anchors. The packaging assertion fails when src/icons/icon.svg is absent from the tracked app file
  set and passes when it is present.
* Decision route: Direct planner correction; no user decision is required.

<!-- rpi:critique id=PC-002 -->
### PC-002 [High]: Resolve the excluded Store-listing acceptance before closing BL-162

* Related IDs: BL-162, P03-T01, P04-T02, final acceptance criteria
* Evidence: BL-162 requires the decided name to reach both the manifest and listing, requires the
  name to be rechecked immediately before reservation, and requires the accepted naming risk to be
  stated. The plan makes adding a Store listing a non-goal, defines no reservation task or external
  evidence, yet requires BL-162 to be marked Shipped with all four items.
* Concern: No planned observation can show that the listing carries Recap Page or that clearance was
  rechecked at reservation time because neither listing nor reservation exists in the planned work.
* Impact: P04-T02 would close an item with unchecked, unobserved acceptance, or implementation would
  have to add an unplanned external Store action after the one final critique.
* Smallest useful change: Decide one boundary explicitly: either add Store name reservation/listing
  work with its required credentials, preflight, risk statement and observable completion evidence,
  or leave BL-162 open and record the remaining listing/reservation work as a follow-up while the
  current product and manifest adopt Recap Page. Do not rewrite the acceptance as satisfied by a
  GitHub repository rename.
* Action owner: User, routed by the planning parent
* Exact resolving evidence: A recorded user decision selects one boundary. If Store work is included,
  the revised plan names the external action and requires a reservation/listing record showing Recap
  Page plus a dated clearance recheck before BL-162 closure. If excluded, the revised acceptance and
  P04-T02 leave BL-162 Ready and create a concrete follow-up for its remaining checklist items.
* Decision route: Significant unresolved user decision; the planner must not choose between a new
  external Store action and withholding BL-162 closure.

<!-- rpi:critique id=PC-003 -->
### PC-003 [High]: Treat the caller's repository-rename decision as authorization

* Related IDs: Caller automatic-mode and repository-rename decisions, P04, P04-T01, session state
* Evidence: The caller explicitly directed this task to rename the GitHub repository to recap-page
  and selected automatic mode. The state artifact records both decisions as confirmed. The plan and
  details nevertheless make another execution-time confirmation a P04 dependency and unresolved
  item.
* Concern: The plan converts an already answered decision into a later interactive blocker. That
  conflicts with automatic mode and can strand a fully rewritten tree whose current URLs point to a
  repository that has not been renamed.
* Impact: Implementation can stop despite having complete authority, and the internal release
  candidate can remain temporarily inconsistent for no decision-relevant reason.
* Smallest useful change: Remove the second confirmation as a dependency and unresolved item. Keep
  an immediate non-interactive preflight for target availability, authenticated repository identity,
  admin permission, clean command output handling, and exact mutation scope.
* Action owner: Planning parent
* Exact resolving evidence: The revised plan, details, dependencies, and state continuation all cite
  the confirmed 2026-08-20 caller decision as authorization; P04-T01 proceeds automatically after a
  passing preflight and halts only on an objective availability, identity, permission, or command
  failure.
* Decision route: Direct planner correction; no user decision is required.

<!-- rpi:critique id=PC-004 -->
### PC-004 [Medium]: Allocate exactly two new test blocks

* Related IDs: Caller test lock, Candidate Change and Test Lock, P01-T01, P02-T01
* Evidence: The caller locks exactly two new test() blocks. The plan places that number under
  "Maximum additions" and assigns files and assertion domains, but it does not identify which two
  behaviors own the new blocks. Every named test owner already contains test blocks that can also be
  extended, so the current wording is not an enforceable exact allocation.
* Concern: Implementers can reasonably add fewer than two, or consume both early and discover that a
  later owner was assumed to receive another. Review cannot distinguish compliance from accidental
  aggregation after the fact.
* Impact: The final change can violate the caller's exact lock or distort semantic ownership to fit
  an unstated block budget.
* Smallest useful change: State "exactly two" and allocate them: one new block in
  test/app-icons.test.js for generated SVG/source and consumer linkage, and one new block in
  test/shipped-copy.test.js for current identity and short attribution. Require every other named
  assertion to extend the existing block identified in the task details, including the PC-001
  packaging assertion.
* Action owner: Planning parent
* Exact resolving evidence: The revised plan and phase details name both new block purposes and their
  files, name the existing block extended by every regression-only owner, and retain zero new test
  files and zero test removals.
* Decision route: Direct planner correction; no user decision is required.

<!-- rpi:critique id=PC-005 -->
### PC-005 [Medium]: Make a successful rename resumable when a later check fails

* Related IDs: P04, P04-T01, P04-T02, external rename safety
* Evidence: P04 records the mutation result and then updates the local remote and performs several
  network and repository checks. It says to stop if the rename itself fails, but does not define the
  durable state or resume behavior when the rename succeeds and a later remote, redirect, fetch,
  test, anchor, or backlog step fails.
* Concern: Retrying P04-T01 after a partial success can treat the now-missing old repository as a
  failed precondition or attempt a second mutation, while renaming back would risk the redirect
  compatibility the task exists to preserve.
* Impact: A transient post-mutation failure can leave the workflow unable to resume safely after an
  externally visible, already successful change.
* Smallest useful change: Add a durable checkpoint immediately after GitHub reports the new full
  name. On later failure, keep the repository renamed, leave backlog items unclosed, record the
  failed observation, and resume idempotently at remote update or P04-T02 after detecting the live
  old/new identity.
* Action owner: Planning parent
* Exact resolving evidence: Revised P04 details define the checkpoint artifact fields, prohibit
  automatic rename-back or reuse of the old name, and give an idempotent entry condition for both
  pre-rename and already-renamed states.
* Decision route: Direct planner correction; no user decision is required.

## Strengths and Residual Risk

* The change/keep/history matrix is unusually explicit and matches the supplied research. It protects
  the fixed archive basename, localStorage namespace, manifest identity and historical record while
  allowing visible identity, package labels, backup labels and current links to move.
* Semantic and regression responsibilities are separated well. The plan avoids global absence tests,
  self-comparing URL assertions, duplicate PNG regeneration and broad duplicate storage tests.
* P03 before P04 is the right phase dependency: tracked behavior is internally proven before the
  externally visible mutation, and backlog closure waits for real post-rename observations.
* Old and new route checks make installed-copy compatibility observable rather than inferred.
* Residual network risk remains after a repository rename because GitHub route availability is
  external. PC-005 contains that risk without pretending it can be removed.

## Questions or Blocking Evidence Gaps

* Does this task perform a Microsoft Store name reservation or listing action, with the credentials
  and external evidence needed to complete BL-162, or does BL-162 remain open for that work? This is
  the only significant unresolved user decision.

## Limitations

* The supplied evidence establishes pre-rename repository and release state only. Actual redirect,
  asset, clone and fetch results remain correctly deferred until after the real rename.
* This critique did not execute a Store reservation, mutate GitHub, build the archive, render the new
  icon or run product tests. It assessed the credibility and observability of the plan that will do
  those things.
* Visual originality and aesthetic quality remain human review judgments; the critique assessed only
  whether the chosen geometry, palette, source parity and consumer linkage can be verified.

## Recommended Next Action

* Highest-impact finding: PC-002
* Action owner: User, routed by the planning parent
* Smallest next action: Decide whether Store reservation/listing work is included now or BL-162 stays
  open; the planning parent can apply PC-001 and PC-003 through PC-005 directly in the same final
  revision.
* User response required: Yes, for PC-002 only.

| Artifact | Description |
|---|---|
| [.copilot-tracking/plans/2026-08-20/recap-page-rebrand-plan.md](.copilot-tracking/plans/2026-08-20/recap-page-rebrand-plan.md) | Final-candidate plan assessed by this critique |
| [.copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md](.copilot-tracking/details/2026-08-20/recap-page-rebrand-phase-details.md) | Task boundaries, dependencies and validation details assessed |
| [.copilot-tracking/research/2026-08-20/recap-page-rebrand-research.md](.copilot-tracking/research/2026-08-20/recap-page-rebrand-research.md) | Supplied Wider, Deeper and Contrarian evidence |
| [.copilot-tracking/rpi-sessions/2026-08-20/recap-page-rebrand-state.json](.copilot-tracking/rpi-sessions/2026-08-20/recap-page-rebrand-state.json) | Confirmed caller decisions and automatic continuation state |
| [PRODUCT_BACKLOG.md](PRODUCT_BACKLOG.md) | BL-161 through BL-164 requirements and acceptance boundary |
| [.copilot-tracking/reviews/plans/2026-08-20/recap-page-rebrand-plan-critique.md](.copilot-tracking/reviews/plans/2026-08-20/recap-page-rebrand-plan-critique.md) | Complete one-pass final-candidate critique and actionable finding set |

## Next Steps

* The active planning parent should apply PC-001 and PC-003 through PC-005 directly, obtain the one
  PC-002 boundary decision, disposition all five findings in the plan, and finalize without running
  a second critique.
