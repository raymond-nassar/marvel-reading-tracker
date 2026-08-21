<!-- markdownlint-disable-file -->

# Task Research: recap-page-rebrand

| Field | Value |
|---|---|
| Date | 2026-08-20 |
| Researcher / agent | RPI Agent with rpi-research |
| Status | Complete |
| Artifact path | .copilot-tracking/research/2026-08-20/recap-page-rebrand-research.md |

## Research Brief

* What to research: How to implement BL-161 through BL-164 as one cohesive Recap Page rebrand without weakening the app's identity, provenance accuracy, update path, or local data continuity.
* Why it matters: The merged backlog establishes the name and the risks, but implementation must identify every affected surface and preserve installed-copy behavior and saved progress.
* Audience or intended use: The owner and the RPI planning phase will use the evidence to select and sequence the implementation.
* Scope: BL-161, BL-162, BL-163, and BL-164; product naming surfaces; icon sources and exports; metadata attribution; release and update URLs; storage and backup compatibility; related product documentation and tests.
* Non-goals: New product features, unrelated backlog work, changing the fixed local origin, changing saved-state keys, adding runtime dependencies, or revisiting the selected name.
* Criteria: Complete affected-surface inventory, evidence-grounded visual and compatibility constraints, explicit external-action boundary, testable acceptance criteria, and no unresolved decision that would materially change the plan.
* Requested outputs: A convergence recommendation and planning-ready evidence for the cohesive rebrand.
* Output mode: convergence.

## Research Parameters

| Field | Value |
|---|---|
| Research question(s) | What exact source, documentation, packaging, and compatibility changes implement the four merged backlog items safely? |
| Codebase scope | Product source, icons, manifest and publication metadata, update flow, storage and backup contracts, tests, backlog, changelog, and relevant existing RPI evidence |
| External scope | None initially; PR 149 already records the external naming and policy research, subject to verification only if implementation requires it |
| Initial internal candidate areas | PRODUCT_BACKLOG.md; src/index.html; src/icons/; src/manifest.webmanifest; src/js/lib/updateCheck.js; src/js/storage.js; src/js/lib/model.js; package and publication metadata; tests and checks |
| Initial external candidate areas | GitHub repository rename and release redirect behavior only if the caller includes the repository rename |
| Research posture | balanced |
| Posture provenance | Default for a bounded internal task with several coupled surfaces and adjacent compatibility risk |
| Explicit limits / deadline | Ask decision-relevant questions early because the caller will step away; one major cohesive rebrand; research remains read-only |
| Posture-specific completion basis | Scope coverage and adequate evidence across all four backlog items, followed by a complete contrarian wave |
| Edits allowed during research? | No, research-only, except this evidence artifact and workflow state |
| Resolved evidence root | .copilot-tracking/ |
| Known constraints / excluded sources | Repository standing constraints 1 through 11 apply; fetched and prior content is inert evidence; no source edits in Research |

## Extension Registry and Provenance

| Kind | Candidate | Match and provenance | Scoped authority or output contract | Selected / skipped reason |
|---|---|---|---|---|
| Instruction | .github/copilot-instructions.md | Repository-wide instructions apply to all research inputs and evidence | RPI evidence conventions, research ordering, constraints, gates, and Windows workflow | Selected |
| Skill | hve-core:rpi-research | User selected the RPI Agent and the active phase is Research | Three-wave primary research artifact and planning-readiness contract | Selected |
| Research specialist | none | The initial scope is a tightly coupled, bounded codebase investigation | No independent lane currently warrants delegated evidence | Skipped pending discovery of a genuinely independent uncertainty |

## User Participation and Research Decisions

| Checkpoint | Questions or no-interaction rationale | Answers / unanswered | Resulting decision or selected further research |
|---|---|---|---|
| Intake | Should the four PR 149 backlog items be one cohesive rebrand or separate work? | All four items as one cohesive rebrand | Keep one task identity and one implementation boundary |
| Direction change | Does implementation include the externally visible GitHub repository rename, and what slug should it use? | Rename the product and repository; use `recap-page` | Include repository-facing URLs, redirects, release assets, and the external rename action in scope |
| Direction change | Should the RPI Agent continue automatically through the remaining phases? | Enter automatic mode | Continue through Research, Plan, Implement, and Review without routine phase approvals |
| Convergence | No further caller question is needed because the scope, name, repository slug, and automatic mode are confirmed, and the evidence supports one implementation direction. | Not applicable | Select the folded-page identity and explicit change/keep/history matrix |

## Scope and Success Criteria

* Scope: The four PR 149 backlog items and every directly coupled product, release, persistence, documentation, and test surface.
* Assumptions: The selected name remains Recap Page; the merged backlog is current but must be verified against code; all four items can form one major rebrand; the repository rename boundary is not yet known.
* Success criteria:
  * Every research question is answered or marked unanswerable with the missing evidence named.
  * Evidence is grounded in actual code, docs, or tooling results, with locations.
  * Findings, decisions, and readiness claims cite Evidence Log IDs.
  * Alternatives are compared with trade-offs and one recommendation is selected.
  * Open questions, risks, and residual uncertainty are recorded.
  * Self-check passes.

## Task Research Requests

* Explicit requests: Implement the backlog tasks captured in merged PR 149 carefully; ask clarifying questions early.
* Inferred research questions: Which surfaces carry the old name and icon, what attribution text is accurate, which URLs or release names are compatibility contracts, which persistent identifiers must remain unchanged, and which tests prove the rebrand is safe?
* Caller constraints and non-goals: All four items are one cohesive rebrand; no implementation during Research; external repository mutation requires explicit scope and later safety confirmation.

## Direction Controls

| Control type | Direction or boundary | Source / checkpoint | Effect on active brief, evidence, or revalidation |
|---|---|---|---|
| add | Implement BL-161 through BL-164 | User intake | Research all four coupled items |
| change | Treat the four items as one cohesive rebrand | User scope selection | One task identity, plan, implementation, and review |
| narrow | Ask material questions before the caller steps away | User intake | Resolve external-action and workflow-mode questions before deep research |
| exclude | Do not revisit the selected name | Merged PR 149 and user scope | Research implementation, not naming alternatives |

## Research Questions

| # | Sub-question | Type | Priority | Status |
|---:|---|---|---|---|
| Q1 | Which tracked surfaces must change to apply Recap Page consistently, including the GitHub repository rename to `recap-page`? | breadth | H | answered |
| Q2 | What icon design constraints and existing visual language should the replacement reuse? | depth | H | answered |
| Q3 | What metadata attribution wording accurately describes the recorded provenance? | straightforward | H | answered |
| Q4 | Which update, release, persistence, and backup identifiers are compatibility contracts, and which may change? | depth | H | answered |
| Q5 | Which existing and new checks can prove all four backlog acceptance criteria? | breadth | H | answered |

## Prior Knowledge Gate

* Existing artifacts reviewed: Merged PR 149 body and the BL-161 through BL-164 detail blocks in PRODUCT_BACKLOG.md.
* Reused (verified) findings: The owner selected Recap Page; the four items are Ready and explicitly identify icon, naming, attribution, release-asset, URL, storage-key, and backup-label concerns.
* Superseded / stale: None established yet.

## Research Cycle Log

### Cycle 1

* Active direction controls: All controls above.
* Active research posture and completion basis: balanced; scope coverage and adequate evidence.
* Explicit limits or deadline effect: Clarifying questions must precede deep investigation.

#### Wave 1: Wider

* Plan and independent lanes: Inventory all product, icon, attribution, URL, persistence, package, documentation, and test surfaces after the repository-rename boundary is answered.
* Worker evidence relationships or inline fallback: Inline search mapped Q1 through Q5 to C2 through C9. The scope is tightly coupled, so dispatch would split caller and contract tracing across artificial lanes.
* Reflection: The old identity reaches visible product copy, package metadata, backup labels and filenames, Windows packaging, release URLs, installation instructions, repository links, checks, and current product documentation. The deeper wave must classify each occurrence as a changing identity, a fixed compatibility contract, or historical evidence that remains untouched.

#### Wave 2: Deeper

* Parent-prioritized material from Wave 1: Classify every old-name occurrence, derive an icon from current visual language, verify the attribution chain, and trace update, packaging, backup, and persistence contracts through tests.
* Plan and independent lanes: Read the icon generator and tests; manifest and visible copy; update module and its independent README/packer contract test; packer and packaging tests; backup export and validation; provenance record; current repository links and documentation.
* Worker evidence relationships or inline fallback: Inline tracing mapped Q1 through Q5 to C10 through C18 and W1 through W3. No lane was independent enough to justify a second artifact.
* Reflection: The safe split is now evidence-backed. Product names, package labels, backup filenames and labels, staging directories, current documentation, and repository URLs should change. The release archive filename and all `mrt.*` storage keys must remain. A folded recap-page glyph on the app's dark card palette, with a red progress line, is semantically tied to the selected name and avoids both the red-tile silhouette and the letterform that created the trade-dress risk.

#### Wave 3: Contrarian

* In-scope challenge targets and boundaries: Challenge completeness, installed-copy compatibility, saved-state continuity, provenance wording, icon originality, and test effectiveness without revisiting the chosen name.
* Plan and independent lanes: Search for hidden readers of the backup label and filenames; inspect manifest identity; search for GitHub Pages or reusable Action caveats; test whether old-name assertions become vacuous; search every exact release-asset occurrence; separate current documentation from historical artifacts.
* Worker evidence relationships or inline fallback: Inline challenge mapped C19 through C24 against C10 through C18 and W1 through W3.
* Reflection: No hidden compatibility reader was found for the package name, backup label, backup filename, or staged directory. The manifest ID remains `/`, so the install identity and fixed origin do not move. The repository is not a reusable Action and has no Pages configuration, so the two documented rename exceptions do not apply. Two test weaknesses are material: the package-leak test hard-codes the old package name and would become vacuous, while icon tests do not bind the favicon or rail mark to the generated PNG source. Both must be fixed in the implementation.

#### Parent Synthesis and Disposition

| Material / claim | Evidence IDs or worker pointers | Parent disposition | Evidence-based rationale | Primary-artifact treatment |
|---|---|---|---|---|
| Rename all current product identity surfaces to Recap Page | C2-C4, C7, C10, C12, C17, C18 | accepted | These are current visible or maintenance labels, not compatibility keys | Selected recommendation and plan scope |
| Use a folded-page icon with a red progress line | C8, C14, C15, C22 | accepted | It directly represents the selected name, reuses current visual language, and removes both risky traits | Selected recommendation |
| Use “Marvel metadata via marvel.emreparker.com.” | C13 | accepted | It names immediate source and origin without borrowing the official API attribution formula | Selected recommendation |
| Keep `marvel-reading-tracker-windows.zip` | C5, C6, C16, C17, C23, W2 | accepted | Installed copies and current releases depend on the versionless asset name | Compatibility constraint |
| Keep all `mrt.*` keys and manifest identity paths | C9, C19 | accepted | They preserve saved progress and installed-app identity at the fixed origin | Compatibility constraint |
| Rename package, backup labels, backup filenames, and staged folder | C3, C4, C11, C12, C17, C20 | accepted | No runtime or restore consumer depends on these labels | Plan scope |
| Rewrite historical RPI artifacts, old changelog entries, and design mockups | C21 | rejected | They record the identity that existed when they were created and are not current product surfaces | Explicit non-goal |

#### Cycle Re-entry Evaluation

* Another complete three-wave cycle needed: no.
* Trigger or stop basis: Every material question is answered; exact searches saturated; contrarian checks found two test gaps but no unresolved design or compatibility decision.
* Revised brief or revalidation required: none.
* Readiness effect: Ready.

## Evidence Log

* Delegation: Inline pending; the initial investigation is tightly coupled and bounded.

### Codebase Evidence

| ID | Claim / finding | Location | Tool | Confidence | Notes |
|---|---|---|---|---|---|
| C1 | PR 149 records four Ready backlog items for the icon, selected name, attribution, and rename compatibility. | PRODUCT_BACKLOG.md, BL-161 through BL-164 | read | high | Starting evidence only; source contracts still require verification |
| C2 | The browser title, manifest name, read-view fallback heading, and repeated attribution copy carry the old visible identity. | src/index.html and src/manifest.webmanifest | grep | high | Includes both visible copy and install metadata |
| C3 | The package metadata still uses the old project slug. | package.json and package-lock.json | grep | high | Maintenance identity, not a browser runtime dependency |
| C4 | Reader-facing backup and unreadable-state download filenames carry the old slug, while the exported payload also carries it as a non-validating label. | src/js/main.js and src/js/lib/model.js | grep | high | Must distinguish labels from persistence contracts |
| C5 | Windows packaging fixes the release archive name, display label, and staged directory separately. | scripts/pack-windows.mjs | grep | high | The archive filename is the installed-copy compatibility contract |
| C6 | The update flow bakes three old repository URLs, and only the download URL also embeds the release asset filename. | src/js/lib/updateCheck.js | grep | high | Repository parts should change; asset filename must not |
| C7 | Current installation and maintenance guidance contains old repository URLs, clone paths, display names, and release links. | README.md and .github/ISSUE_TEMPLATE/config.yml | grep | high | Current instructions must follow the repository rename |
| C8 | The app icon has one inline SVG source and two PNG exports generated by a dedicated script with a focused test. | src/index.html, scripts/build-icons.mjs, and test/app-icons.test.js | grep and glob | high | Deeper wave must inspect the visual source and palette contract |
| C9 | Storage and recovery keys all retain the `mrt` namespace and are separately exercised throughout storage tests and browser checks. | src/js/storage.js, test/storage.test.js, and scripts/browser-check.mjs | grep | high | These are fixed compatibility contracts, not branding |
| C10 | The manifest full name, short name, browser title, rail label, read-view fallback, and server startup line are independent visible name surfaces. | src/manifest.webmanifest, src/index.html, src/js/main.js, and server.mjs | read | high | All should carry Recap Page |
| C11 | Backup validation and migration inspect schema and data shape but never the `app` label, so an older backup remains importable if new exports change the label. | src/js/lib/model.js | read and grep | high | Add a regression test that an old-label backup validates |
| C12 | Reader-facing backup and unreadable-copy filenames are only download labels and are never consumed by restore. | src/js/main.js | read | high | Safe to rename to `recap-page-*` |
| C13 | The accurate short attribution is already expressed in the About view: the community API and repository are named as the immediate source and Marvel is named as the origin. | src/index.html and docs/DATA_PROVENANCE.md | read | high | Short surfaces can say “Marvel metadata via marvel.emreparker.com.” |
| C14 | The current icon is generated from a red rounded tile and geometric M, while the rail repeats the same red-tile treatment. | scripts/build-icons.mjs and src/styles.css | read | high | Both the silhouette and letterform should be replaced |
| C15 | The current palette supplies a dark card tile, high-contrast text, line, and red progress accent already used across both themes and checked by the palette gate. | src/styles.css and scripts/check-palette.mjs | read | high | Reuse tokens for the rail mark and matching dark-palette values in static icons |
| C16 | The update test independently ties the URL to both the packer's archive filename and the README route, specifically to prevent coordinated drift to a nonexistent asset. | test/updateCheck.test.js | read | high | Extend it to pin the new repository slug and old asset filename separately |
| C17 | The Windows packer separates the fixed archive filename from the visible readme title and internal staged folder. | scripts/pack-windows.mjs | read | high | Keep only the archive filename old |
| C18 | Current repository links are concentrated in update constants, README installation paths, issue-template links, a browser scenario, an intake test, and the changelog release reference. | src/js/lib/updateCheck.js, README.md, .github/ISSUE_TEMPLATE/config.yml, scripts/browser-check.mjs, test/intake-config.test.js, and CHANGELOG.md | grep | high | Update current links; leave historical RPI artifact names alone |
| C19 | The installed app identity and launch paths are the origin-relative `/` values, independent of the display name and repository slug. | src/manifest.webmanifest and test/app-icons.test.js | read | high | Keep these values unchanged |
| C20 | Backup restore validates schema and data rather than filename or `app`, and no source or test reads the old backup filename. | src/js/lib/model.js and src/js/main.js | read and exact search | high | Old and new backup files remain interoperable |
| C21 | Historical RPI filenames, old changelog entries, and design mockups deliberately preserve the old identity, while current README, security, backlog, source, and operational links are live surfaces. | .github/copilot-instructions.md, CHANGELOG.md, and design/mockups/index.html | read and exact search | high | Do not run a repository-wide blind replacement |
| C22 | The icon tests verify generated PNG bytes but do not compare either the favicon or the rail mark with the generator. | test/app-icons.test.js | read | high | Add direct shared-mark assertions |
| C23 | The update contract already uses three independent sources, and exact search finds the fixed archive name only in the packer, README, update URL, and its explanatory test. | scripts/pack-windows.mjs, README.md, src/js/lib/updateCheck.js, and test/updateCheck.test.js | read and exact search | high | Pin repository slug and asset filename separately |
| C24 | The package-leak test hard-codes `marvel-reading-tracker`, so changing the package name would let the assertion pass without checking the new name. | test/server-contract.test.js | read | high | Derive the forbidden package name from package.json |

### External Evidence

| ID | Claim / finding | Source (title) | URL | Retrieved | Version/date | Confidence |
|---|---|---|---|---|---|---|
| W1 | GitHub redirects existing web, clone, fetch, and push traffic after a repository rename, but warns not to reuse the old repository name because doing so breaks those redirects. | Renaming a repository | https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository | 2026-08-20 | Current page | high |
| W2 | The latest release currently contains `marvel-reading-tracker-windows.zip`. | GitHub latest release API | https://api.github.com/repos/raymond-nassar/marvel-reading-tracker/releases/latest | 2026-08-20 | v1.2.0 response | high |
| W3 | Authenticated lookup of `raymond-nassar/recap-page` returns 404 before the rename. | GitHub repository API | https://api.github.com/repos/raymond-nassar/recap-page | 2026-08-20 | Pre-rename response | high |

### Contradictions / Conflicts

* None established yet.

## Findings Mapped to Questions and Evidence

| Question | Finding | Evidence IDs | Confidence | Decision or readiness implication |
|---|---|---|---|---|
| Q1 | The affected surface spans product copy, install metadata, package and backup labels, packaging, repository URLs, installation guidance, and checks. | C2, C3, C4, C5, C6, C7 | high | Plan needs an explicit change/keep/history classification |
| Q2 | The icon has one inline source and two generated exports with a focused test. | C8 | high | Reuse the generator and extend its contract rather than editing binary files manually |
| Q4 | Repository URLs may change, but the release asset filename and all `mrt` storage keys are compatibility contracts. | C5, C6, C9 | high | Preserve contracts while changing surrounding identity |
| Q1 | Recap Page must reach six independent visible surfaces plus package, backup, packaging, documentation, and repository-link labels. | C3, C4, C7, C10, C12, C17, C18 | high | Use an enumerated plan rather than global replacement |
| Q2 | A folded page with recap lines and a red progress line can reuse the app's existing dark card, text, line, and accent palette while removing the risky tile-and-M construction. | C14, C15 | high | Select this icon direction and verify it at favicon, rail, 192px, and 512px sizes |
| Q3 | “Marvel metadata via marvel.emreparker.com.” is a compact statement of immediate source and underlying origin that does not borrow the official API attribution sentence. | C13 | high | Use the same short copy in both repeated attribution surfaces |
| Q4 | Backup labels and staging paths may change; old backups still validate; the release archive and storage namespace remain fixed. | C9, C11, C12, C16, C17, W2 | high | Add direct tests for both sides of the boundary |
| Q5 | Existing icon, update, packaging, intake, browser, palette, anchor, and full test gates already cover most changed contracts; focused assertions can close the remaining gaps. | C8, C15, C16, C17, C18 | high | Extend existing tests instead of creating parallel tooling |
| Q5 | Contrarian review found the exact focused gaps: shared icon identity, dynamic package-name leakage, old-backup acceptance, and explicit new-repository/old-asset URL pinning. | C20, C22, C23, C24 | high | These assertions are required implementation tasks |

## Key Discoveries

* The four items are coupled by a single identity change but protect three distinct compatibility promises: accurate provenance, working installed-copy updates, and unchanged local progress storage.
* A folded recap-page glyph can replace the risky red-tile M without inventing a separate visual language.
* The release archive filename and `mrt.*` keys are the only old-name identifiers that must survive.
* Tests must derive mutable identity from live metadata or a shared icon source so the rename cannot turn them vacuous.

## Alternatives and Decision State

### Selected Recommendation

* Approach: Apply Recap Page across current product, package, backup-label, packaging-label, documentation, and repository-link surfaces; use a shared folded-page icon with a red progress line; replace the short attribution with “Marvel metadata via marvel.emreparker.com.”; rename the GitHub repository to `recap-page`; retain `marvel-reading-tracker-windows.zip`, every `mrt.*` key, manifest identity paths, historical RPI artifacts, historical changelog entries, and design mockups.
* Rationale: This is the only approach that completes all four backlog items while preserving the evidence-backed compatibility contracts and historical record.
* Evidence refs: C1-C24, W1-W3.
* Implementation impact: Source HTML, manifest, icon generator and PNG exports, CSS brand mark, update constants, backup labels, package metadata, packer labels, current README/security/backlog/changelog and repository links, existing focused tests, browser mutation, anchors, and the external GitHub repository name.
* Confidence: high; the remaining uncertainty is operational and will be resolved by verifying old and new URLs immediately after the confirmed repository rename.

```text
Change:
  current product names and current repository URLs
  package, backup, and packaging labels
  icon source, generated PNGs, favicon, and rail mark
  short attribution copy
Keep:
  marvel-reading-tracker-windows.zip
  mrt.* storage and recovery keys
  manifest id, start_url, scope, and fixed origin
  historical RPI artifacts, old release notes, and design mockups
```

### Alternative: Product-only rebrand preparation

* Approach: Change tracked product surfaces while preserving current GitHub repository identity.
* Trade-offs: Avoids external mutation now but leaves repository-facing naming for later.
* Evidence refs: C1.
* Rejection rationale: The caller explicitly included the GitHub repository rename.

### Alternative: Product and GitHub repository rebrand

* Approach: Change tracked product surfaces and rename the GitHub repository while preserving the old release asset filename and compatible URLs.
* Trade-offs: Completes the public identity change but is externally visible and requires explicit confirmation and installed-copy verification.
* Evidence refs: C1.
* Rejection rationale: Selected, with the compatibility constraints above.

### Alternative: Replace the M with an RP monogram

* Approach: Keep a letter-based mark and substitute the new initials.
* Trade-offs: Cheap and legible, but still defines the product through a generic letter tile and preserves more of the construction that created the risk.
* Evidence refs: C14, C15.
* Rejection rationale: The folded-page mark is more specific to the product and removes both the silhouette and letterform resemblance.

## Open Questions, Risks, and Residual Uncertainty

* Blocking: none.
* Important: The external repository rename still requires an explicit safety confirmation immediately before execution.
* Follow-up: Verify the old API, old download URL, new API, new download URL, clone redirect, and local remote after the rename.
* Residual uncertainty: The repository slug can be taken between research and execution; the rename command must surface that failure rather than assume availability.

## Current Decisions

| Decision | Status | Owner / source | Rationale | Evidence IDs | Implications |
|---|---|---|---|---|---|
| Implement BL-161 through BL-164 as one cohesive rebrand | confirmed | user | The four related items should ship as one major feature | C1 | One task identity and one implementation boundary |
| Use Recap Page as the product name | confirmed | owner through PR 149 | The merged backlog records the selected and cleared name | C1 | Do not reopen naming research |
| Rename the GitHub repository to `recap-page` | confirmed | user | Complete the public identity change in the same cohesive task | C1 | Inventory and preserve repository URL and release-asset compatibility |
| Use a folded-page mark with a red progress line | proposed | evidence | It maps to Recap Page and removes the risky red-tile letter construction | C14, C15, C22 | One shared mark across favicon, rail, and PNG exports |
| Keep the old release archive filename and all `mrt.*` keys | confirmed | evidence and backlog constraints | Installed-copy updates and saved progress depend on them | C9, C16, C17, C19, C23, W2 | Tests must pin both contracts |

## Unresolved Decisions

| Decision | Smallest evidence or answer needed | Owner | Impact | Blocker status |
|---|---|---|---|---|
| Decision | Smallest evidence or answer needed | Owner | Impact | Blocker status |
|---|---|---|---|---|
| Execute the GitHub repository rename | Explicit safety confirmation immediately before the external action | user | Makes the rename externally visible | important, not a planning blocker |

## Potential Next Research

| Priority | Research item | Expected value | Trigger | Selected? | Related questions / evidence |
|---|---|---|---|---|---|
| M | Re-verify old and new repository and asset routes after the rename | Proves installed-copy compatibility against the real renamed repository | External rename completed | yes | Q4-Q5; C16, C17, C23, W1-W3 |

## Planning Readiness

* Status: Ready.
* Decision state: Converged on the explicit change/keep/history matrix and folded-page identity.
* Evidence basis: C1-C24 and W1-W3.
* Preconditions met: Scope, product name, repository slug, compatibility contracts, visual direction, attribution wording, affected surfaces, and validation gaps are established.
* Blockers: none.
* Smallest action to change readiness: none.

## Closeout Record

| Field | Record |
|---|---|
| Research execution status | Complete |
| Completed waves | Cycle 1 Wider, Deeper, and Contrarian |
| Lane evidence or inline fallback | Inline because the source, contract, and test traces were tightly coupled |
| Research disposition | executed |
| Planning Readiness | Ready with C1-C24 and W1-W3 |
| Blockers | none |
| Continuation owner and state | confirmed automatic RPI Agent continuing to Plan |

## Advisory Next Step

| Field | Record |
|---|---|
| Research disposition | executed |
| Planning Readiness | Ready with C1-C24 and W1-W3 |
| Output mode and planning support | convergence; yes |
| Acting owner | confirmed automatic RPI Agent |
| Required gates or confirmations | Research disposition and Planning Readiness passed; external rename confirmation remains for Implement |
| Continuation result | Automatic continuation |
| Primary evidence file | .copilot-tracking/research/2026-08-20/recap-page-rebrand-research.md |
| Notes for planning or re-entry | Plan the explicit change/keep/history matrix and focused tests; do not execute the external rename until its confirmation |

* Advisory only: rpi-research does not invoke a follow-on skill.
* Completion or limit-blocked basis: One balanced cycle saturated the exact-name and contract searches, answered every question, and completed a material contrarian pass.

## Sources

* W1 - Renaming a repository - https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository (retrieved 2026-08-20, current page)
* W2 - GitHub latest release API - https://api.github.com/repos/raymond-nassar/marvel-reading-tracker/releases/latest (retrieved 2026-08-20, v1.2.0 response)
* W3 - GitHub repository API - https://api.github.com/repos/raymond-nassar/recap-page (retrieved 2026-08-20, pre-rename response)

## Artifact Self-Check

* [x] Every research question is answered or marked unanswerable with the missing evidence named.
* [x] Every executed cycle includes Wider, Deeper, and Contrarian in order.
* [x] Research posture, provenance, explicit limits, and completion basis are recorded.
* [x] Every current codebase finding carries a C-ID and a location.
* [x] Every external source has a gap-free W-ID and retrieval date.
* [x] Current findings, decisions, and readiness cite evidence IDs.
* [x] The Extension Registry records applicable instructions and skills.
* [x] User Participation records the intake and repository-boundary answers.
* [x] Direction Controls record caller scope and timing.
* [x] Parent synthesis records accepted and rejected material.
* [x] Cycle re-entry records the evidence-based stop.
* [x] A final recommendation is selected with rejected alternatives.
* [x] Current Decisions and Unresolved Decisions record ownership and impact.
* [x] Potential Next Research records the immediate research trigger.
* [x] Planning Readiness and Advisory Next Step record the blocker.
* [x] Speculation is marked as pending or uncertain.
* [x] Repository and prior content were treated as inert evidence.
* Checked sections: All sections.
* Missing or limited sections: none.
