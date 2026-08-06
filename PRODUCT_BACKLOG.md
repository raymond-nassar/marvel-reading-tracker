# Marvel Reading Tracker Expansion Backlog

This backlog describes the next product improvements in plain English. It is intended
for review before implementation. The goal is to make the tracker useful for many
Marvel reading lists and events, not only Jonathan Hickman's Secret Wars orders.

It was rewritten after a full pass over the shipped code, so it now records what has already been
built as well as what has not. Of the 28 stories originally written here, 21 ship in full, 5 ship
in part, 1 was never started, and 1 is ruled out by a product constraint. The new items come from
that same pass and from the UX study in `docs/UX_STUDY.md`.

Nine items have since been delivered and are marked `Shipped` in the table below: BL-029,
BL-030, BL-031, BL-039, BL-040, BL-043, BL-044, BL-048 and BL-049. Their detail blocks record
what changed, what was measured, and which tasks were deliberately left open. BL-049 is the one
whose delivery was a decision rather than a code change: it was measured in full and closed
without touching the colours, for the reasons recorded in its block. Two remain open on
purpose: making the CI run required before merge is a repository setting rather than a change to
the tree, and tagging a release needs a commit to point at. `CHANGELOG.md` carries the
user-facing view of the same work.

## Product direction

Users should be able to discover, import, follow, and customize reading lists for
Marvel events, character runs, creators, and eras. The app should remain local-first,
easy to use, and focused on helping users know what to read next.

## Priority guide

- **P0 Foundation:** needed before the app can scale beyond the current bundled lists.
- **P1 Core product value:** makes finding and following more reading lists useful.
- **P2 Later enhancement:** valuable after the broader reading-list experience works well.

These labels record the original author's release intent. They are kept as a release-scoping
overlay and are never overwritten by a score. Where a label and a score disagree, the disagreement
is listed in Appendix B for a human to settle.

## How this backlog is organised

The hierarchy is three levels: Outcome, Epic, Item. Themes are tags rather than a level. Each
scored item has a detail block below the table carrying its task checklist and its constraint-gate
check.

IDs run as one sequence each and are never reused and never renumbered. `EP-01` through `EP-07` and
`BL-001` through `BL-028` were assigned to the content that already existed here, in document
order. Everything this pass added continues from `EP-08` and `BL-029`.

Evidence is mandatory on every item, written as `path:START-END` for a claim about specific lines,
`path` alone for a claim that a file exists, or `absent: pattern searched, method used` for a claim
that something is missing.

### Why WSJF

Reach is constant for a single-user application, so RICE degenerates to ICE. WSJF is used instead
because it carries risk reduction and opportunity enablement in its numerator, which is what
separates the engineering enablers from the reader-facing work here.

```text
Cost of Delay = Value + Time Criticality + Risk Reduction and Opportunity Enablement
WSJF          = Cost of Delay / Job Size
```

`V`, `TC` and `RE` are scored on the modified Fibonacci scale of 1, 2, 3, 5, 8, 13 and 20, each
column anchored independently at 1. Ties are broken by Kano category in the order Must-be,
Performance, Attractive, Indifferent. An item sized 13 or 20 cannot reach `Ready` without being
split.

## Outcomes

* **OC-1: A reader can use the tracker in whatever condition they are reading in.** Covers sight,
  input method, device size and responsiveness. Epics EP-07, EP-08, EP-09.
* **OC-2: A reader can find a reading order, follow it, and get back to where they were.** Covers
  discovery, import, progress and returning. Epics EP-01, EP-03, EP-04, EP-10, EP-11.
* **OC-3: The catalog and the code can grow without breaking the reader's trust.** Covers
  editorial expansion, metadata honesty, durability and engineering safety. Epics EP-02, EP-05,
  EP-06, EP-12.

## Epics

Each epic is tested against the question "is there more than one way to address this?". An epic
that fails names a solution rather than a problem. The seven original epic titles are kept as
written, because they are the historical record of shipped work, with a problem-framed restatement
recorded beside any that fails the test.

| ID | Title | Outcome | Names a problem? |
|----|-------|---------|------------------|
| EP-01 | Curated reading-list catalog | OC-2 | No. Names a solution. Problem framing: readers cannot find anything to read beyond one bundled list |
| EP-02 | Expand Marvel event coverage | OC-3 | No. Names a solution. Problem framing: the bundled orders cover too little of Marvel |
| EP-03 | Import and create personal reading orders | OC-2 | No. Names a solution. Problem framing: readers cannot track an order the app does not bundle |
| EP-04 | Reading-list experience | OC-2 | No. Names neither. Problem framing: readers lose track of where they are in a long order |
| EP-05 | Trustworthy metadata and availability | OC-3 | Yes |
| EP-06 | Backup, portability, and ownership | OC-3 | No. Names a solution. Problem framing: readers can lose progress and cannot move it |
| EP-07 | Accessibility and usability | OC-1 | Yes, though broad |
| EP-08 | Readers who depend on contrast cannot reliably read the interface | OC-1 | Yes |
| EP-09 | Working through a long order is slower than the list is long | OC-1 | Yes |
| EP-10 | Readers cannot get back to a place in the app | OC-2 | Yes |
| EP-11 | The app answers the same kind of action in different ways | OC-2 | Yes |
| EP-12 | Changing the code is riskier than the change usually warrants | OC-3 | Yes |

## Reconciliation against shipped code

Every story originally written in this document, mapped to the code that implements it. Story
numbers are `epic.story` in document order. A disposition of `Done` or `Superseded` is not work
remaining and is not scored.

| Story | ID | Original priority | Observed evidence | Disposition |
|-------|-----|-------------------|-------------------|-------------|
| 1.1 | BL-001 | P0 | catalogRow renders name, type, count and description at `src/js/main.js:1209-1239` | Done |
| 1.2 | BL-002 | P0 | category fieldset at `src/index.html:214-216`, filterByCategory imported at `src/js/main.js:16` | Done |
| 1.3 | BL-003 | P1 | search form at `src/index.html:207-213`, search-as-you-type at `src/js/main.js:1267-1282` | Done |
| 1.4 | BL-004 | P1 | depth pill rendered before the Import button at `src/js/main.js:1213` and `src/js/main.js:1222-1227` | Done |
| 2.1 | BL-005 | P0 | all five named events ship as data: `src/data/house_of_m.json`, `src/data/civil_war.json`, `src/data/secret_invasion.json`, `src/data/annihilation.json`, `src/data/king_in_black.json` | Done |
| 2.2 | BL-006 | P0 | attributionLine renders source and snapshot date at `src/js/main.js:1245-1265` | Done |
| 2.3 | BL-007 | P1 | grouping and variant labelling exist at `src/js/main.js:1192` and `src/js/main.js:1209-1214`, but only the Hickman creator run populates `group` and `variant` in `src/data/catalog.json`; all six event lists carry null | Partial |
| 2.4 | BL-008 | P1 | orders and catalog generated by `scripts/vendor-orders.mjs:167-267`, consumed as data with no view change | Done |
| 3.1 | BL-009 | P0 | parseChecklist and the import report at `src/js/main.js:922-975`, `src/js/lib/markdown.js:36-99` | Done |
| 3.2 | BL-010 | P1 | unresolvedRow offers search, auto-accepts a unique exact match, else lists candidates with series and date at `src/js/main.js:983-1045` | Done |
| 3.3 | BL-011 | P1 | series and creator adds at `src/js/main.js:884-902`, manual issue add at `src/js/main.js:1047-1091` | Done |
| 3.4 | BL-012 | P2 | duplicate at `src/js/main.js:352-372`, with read progress deliberately shared rather than copied per `src/js/lib/model.js:139` | Done |
| 4.1 | BL-013 | P0 | renderRail marks the active list with `aria-current` and a progress bar at `src/js/main.js:299-324` | Done |
| 4.2 | BL-014 | P1 | seriesProgress is called on the whole state with no list filter at `src/js/main.js:1397-1415`, and the view states it counts across every list at `src/index.html:194-196` | Partial |
| 4.3 | BL-015 | P1 | all four named filters plus All at `src/index.html:180-184`, applied without touching stored order at `src/js/main.js:622-632` | Done |
| 4.4 | BL-016 | P1 | hero next-unread and Done, next at `src/index.html:125-155` | Done |
| 4.5 | BL-017 | P2 | `absent: note\|notes, grep across src/**/*.js returning only an unrelated shelf caption and a code comment` | Not started |
| 5.1 | BL-018 | P0 | pending and by-hand badges at `src/js/main.js:590-593`, pending filter at `src/js/main.js:626` | Done |
| 5.2 | BL-019 | P1 | five-state availability model at `src/js/lib/availability.js:17-23`, hedged short labels at `src/js/main.js:615-620` | Done |
| 5.3 | BL-020 | P1 | manual entries carry `source: 'manual'` at `src/js/main.js:1070` and render, reorder, export and back up like any other issue | Done |
| 5.4 | BL-021 | P2 | `scripts/check-contract.mjs:248-280` runs a set of upstream assumptions and exits non-zero when any has drifted, wired as `npm run contract` at `package.json:13` | Done |
| 6.1 | BL-022 | P0 | validated backup shape at `src/js/lib/model.js:434-458` | Done |
| 6.2 | BL-023 | P1 | same backup file restores on another browser, validated and atomic, with undo at `src/js/main.js:1449-1452` | Done |
| 6.3 | BL-024 | P1 | Export as Markdown ships as a list tool, confirmed in the live DOM at `docs/ux-artifacts/viewport-sweep-reading.json` | Done |
| 6.4 | BL-025 | P2 | not applicable. Ruled out by Repository Constraint 3, which forbids accounts and cloud services, and already listed as out of scope at the end of this document | Forbidden, Constraint 3 |
| 7.1 | BL-026 | P0 | focus order and visible focus pass across 45 measured tab stops in `docs/ux-artifacts/live-inspection.json`, but the shortcut handler bails on any focused control at `src/js/main.js:642-660` | Partial |
| 7.2 | BL-027 | P1 | announcements exist at `src/js/main.js:137-149`, but they fire into two live regions at once and the first-run heading is empty per `docs/ux-artifacts/pa11y-landing.json` | Partial |
| 7.3 | BL-028 | P1 | the mobile rail rule at `src/styles.css:81-84` is overridden by `src/styles.css:88-92`, and the reading view overflows by 93 px at 320 px per `docs/ux-artifacts/viewport-sweep-reading.json` | Partial |

### Orientation disagreements

Three quantities used to brief this pass disagreed with what the repository actually contains. They
are recorded rather than inherited.

* `src/js/main.js` is 1,566 lines, not 1,543, by `(Get-Content).Count` and confirmed by the last
  line number when reading the file. Evidence: `src/js/main.js:1555-1568`.
* `src/js/ui/` does not exist in this worktree. Evidence: `absent: src/js/ui, Test-Path returning
  False and a recursive directory listing of src/`. Git cannot track an empty directory, so an
  empty `src/js/ui/` in another checkout is a local artifact rather than repository content. Either
  way the conclusion is the same: there is no view layer to put components in.
* The test count is 224 passing, not the 119 recorded in `.copilot-tracking/changes/`. Evidence:
  `package.json:10`, and a full run of `npm test`. The items shipped in this pass have since taken
  it to 235; 224 is the figure as audited.

A fourth disagreement is internal to the code and is tracked as a backlog item rather than a note,
because it misleads a reader of the source: see BL-048.

### Repository hygiene

All Phase 1 hygiene checks passed, so no `HYG` findings were raised. The working tree was clean
before any file was written, `.gitignore` covers the runtime `*.log` and `*.err` artifacts at
`.gitignore:12-13` without excluding `docs/ux-artifacts/` or any image type, and that directory was
created and confirmed writable before use.

## The backlog

`P` carries the original release label, or `none` for an item this pass created. `Basis` carries
the same epistemic status the matching UX finding carried. `Relationship` records the verdict
against the existing backlog.

`Status` is `Ready` for an item still to be picked up and `Shipped` for one delivered since this
backlog was written. For a `Shipped` row the `Evidence` column still records the state that
prompted the item, not the state of the code now, because that is what justifies the item having
existed. Each shipped item's detail block below says what changed and how it was checked.

| ID | Title | Type | Epic | Relationship | V | TC | RE | Size | WSJF | P | Basis | Status | Evidence |
|----|-------|------|------|--------------|---|----|----|------|------|---|-------|--------|----------|
| BL-030 | Stop dimming read rows with a blanket opacity | Defect | EP-08 | Leaves alone | 5 | 3 | 2 | 1 | 10.0 | none | Measured | Shipped | src/styles.css:310-319 |
| BL-029 | Raise the red accent so white text on it clears 4.5:1 | Defect | EP-08 | Leaves alone | 8 | 5 | 3 | 2 | 8.0 | none | Measured | Shipped | src/styles.css:20-29 |
| BL-039 | Run the test suite automatically on every change | Enabler | EP-12 | Leaves alone | 5 | 3 | 8 | 2 | 8.0 | none | Observed | Shipped | absent: .github/workflows, directory listing of repository root and .github |
| BL-050 | Fail the build when an evidence anchor stops naming the code it claims | Enabler | EP-12 | Leaves alone | 5 | 3 | 8 | 2 | 8.0 | none | Measured | Shipped | absent: any check of anchor identity, read of .github/workflows/ci.yml and the package.json scripts block |
| BL-044 | Send a content security policy and frame options from the dev server | Enabler | EP-12 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | server.mjs:112-122 |
| BL-048 | Correct the availability comment that names four states | Debt | EP-05 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | src/js/lib/availability.js:10 |
| BL-040 | Add a linter and formatter | Chore | EP-12 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | absent: eslint or prettier config or lint script, read of package.json:8-17 and glob of repository root |
| BL-043 | Give releases a version, a tag and a changelog | Chore | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Observed | Shipped | package.json:3 |
| BL-035 | Offer an undo after a list is deleted | Story | EP-11 | Leaves alone | 5 | 2 | 5 | 3 | 4.0 | none | Observed | Ready | src/js/main.js:343-350 |
| BL-047 | Split the two meanings of the row class | Debt | EP-12 | Leaves alone | 1 | 1 | 2 | 1 | 4.0 | none | Observed | Ready | src/styles.css:396-397 |
| BL-049 | Decide whether the faint badge borders need to meet the 3:1 non-text minimum | Defect | EP-08 | Leaves alone | 1 | 1 | 2 | 1 | 4.0 | none | Measured | Shipped | src/styles.css:364 |
| BL-026 | Make every action reachable and repeatable from the keyboard | Story | EP-07 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | P0 | Measured | Ready | src/js/main.js:642-660 |
| BL-027 | Announce each change once, in a way a screen reader can use | Story | EP-07 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | P1 | Measured | Ready | src/js/main.js:139-144 |
| BL-031 | Put a scrim behind hero text so its contrast stops depending on the cover | Defect | EP-08 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | none | Measured | Shipped | src/index.html:125-155 |
| BL-028 | Make the reading view usable on a phone | Story | EP-07 | Leaves alone | 8 | 5 | 5 | 5 | 3.6 | P1 | Measured | Ready | src/styles.css:81-84 |
| BL-045 | Move the API base URL check into the client that uses it | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Observed | Ready | src/js/api.js:18-26 |
| BL-014 | Count series progress for the list being read | Story | EP-04 | Leaves alone | 5 | 2 | 2 | 3 | 3.0 | P1 | Observed | Ready | src/js/main.js:1397-1415 |
| BL-034 | Replace the native dialogs with the app's own notice system | Debt | EP-11 | Leaves alone | 3 | 2 | 3 | 3 | 2.67 | none | Observed | Ready | src/js/main.js:337-347 |
| BL-037 | Keep the chosen filter across a reload | Story | EP-10 | Leaves alone | 3 | 1 | 1 | 2 | 2.5 | none | Observed | Ready | src/js/main.js:51 |
| BL-038 | Build the two Library sub-views the adopted design specified | Story | EP-10 | Leaves alone | 3 | 1 | 2 | 3 | 2.0 | none | Observed | Ready | design/mockups/5-longbox-focus.html:169-172 |
| BL-046 | Share the retry and backoff between the two vendor scripts | Debt | EP-12 | Leaves alone | 1 | 1 | 2 | 2 | 2.0 | none | Observed | Ready | scripts/vendor-index.mjs:40-54 |
| BL-041 | Cover the three browser-coupled modules with tests | Enabler | EP-12 | Leaves alone | 3 | 2 | 8 | 8 | 1.63 | none | Observed | Ready | absent: test/cache.test.js and test/hydrate.test.js and test/main.test.js, glob of test/ cross-checked against src/js |
| BL-033 | Re-render only what changed when an issue is marked read | Debt | EP-09 | Leaves alone | 5 | 2 | 5 | 8 | 1.5 | none | Measured | Ready | src/js/main.js:1555-1568 |
| BL-007 | Give the event orders the variants the catalog can already carry | Story | EP-02 | Leaves alone | 3 | 2 | 2 | 5 | 1.4 | P1 | Observed | Ready | src/data/catalog.json |
| BL-032 | Offer a light theme and follow the system preference | Story | EP-08 | Leaves alone | 3 | 2 | 2 | 5 | 1.4 | none | Measured | Ready | src/styles.css:7 |
| BL-036 | Make the current view and list addressable in the URL | Story | EP-10 | Leaves alone | 5 | 2 | 3 | 8 | 1.25 | none | Observed | Ready | absent: pushState or replaceState or location.hash or hashchange or popstate or history., grep across src/ |
| BL-017 | Let a reader keep notes on a list or an issue | Story | EP-04 | Leaves alone | 2 | 1 | 1 | 5 | 0.8 | P2 | Observed | Ready | absent: note or notes, grep across src/**/*.js |
| BL-042 | Break the single view file into per-view modules | Debt | EP-12 | Leaves alone | 2 | 1 | 8 | 20 | 0.55 | none | Measured | Proposed | src/js/main.js:1555-1568 |

### Parked

| ID | Title | Type | Epic | Relationship | V | TC | RE | Size | WSJF | P | Basis | Status | Evidence |
|----|-------|------|------|--------------|---|----|----|------|------|---|-------|--------|----------|
| BL-025 | Optional synchronization between devices | Story | EP-06 | Leaves alone | not scored | not scored | not scored | not scored | not scored | P2 | Observed | Dropped | PRODUCT_BACKLOG.md, out-of-scope list |

**BL-025: Optional synchronization between devices**

Parked reason: Breaches Constraint 3.

Repository Constraint 3 forbids accounts, cloud services, analytics and telemetry, because the
product promise is that nothing is uploaded anywhere. The story's own hedge, that sync would be
opt-in and would not change local-only behaviour for those who decline, does not clear the
constraint: the moment a sync service exists, the promise becomes conditional rather than
structural. The gate ran before scoring, so no score was assigned. The reader-facing need behind
it, moving progress between machines, is already met by BL-023 through export and restore, which
ships today.

## Item details

Each block carries the task checklist and the constraint-gate check. The gate ran against all
eleven Repository Constraints for every item; the line below each checklist names the constraints
that were live considerations rather than restating all eleven.

**BL-007: Give the event orders the variants the catalog can already carry**

- [ ] Choose which shipped events warrant an essential path alongside the complete one
- [ ] Produce the essential order files through `scripts/vendor-orders.mjs` rather than by hand
- [ ] Populate `group`, `groupName` and `variant` for each new pair in the catalog
- [ ] Confirm the existing grouped rendering handles more than one group without change

Constraint gate: checked 1 to 11, none breached. Constraint 2 was the live consideration: the
orders must continue to come from the vendored pipeline and licensed upstream sources, never from
scraping marvel.com. Constraint 4 holds, because this is data and a build script only.

**BL-014: Count series progress for the list being read**

- [ ] Give `seriesProgress` a list scope while keeping the cross-list total available
- [ ] Show the per-list breakdown in the progress view for the active list
- [ ] Update the view subtitle, which currently states the count spans every list
- [ ] Keep the global unique-issue count reachable, since sharing read state across lists is deliberate

Constraint gate: checked 1 to 11, none breached. No constraint is engaged; this is arithmetic over
data already held locally.

**BL-017: Let a reader keep notes on a list or an issue**

- [ ] Add an optional note field to the list and issue shapes behind a schema migration
- [ ] Include notes in backup, restore and Markdown export
- [ ] Provide an edit affordance that does not crowd the row
- [ ] Add tests covering migration from a state with no notes

Constraint gate: checked 1 to 11, none breached. Constraint 3 was the live consideration and is
satisfied, because notes stay in local storage and travel only inside the user's own backup file.

**BL-026: Make every action reachable and repeatable from the keyboard**

- [ ] Narrow the shortcut guard so it excludes text entry rather than every interactive element
- [ ] Decide where focus lands after Done, next, so the shortcut stays live
- [ ] Add a shortcut reference to the About view as the single maintained list
- [ ] Re-run the tab-ring walk and confirm focus order, visible focus and no trap still hold

Constraint gate: checked 1 to 11, none breached. Constraint 7 was the live consideration: focus
handling after the read action must not delay or wrap the `window.open` call, because losing user
activation is what gets the reader tab blocked.

**BL-027: Announce each change once, in a way a screen reader can use**

- [ ] Choose one announcement channel per message and stop double-writing
- [ ] Keep the dedicated announcer for events with no visible surface
- [ ] Remove the empty first-run heading, or give the empty state real heading text
- [ ] Move the availability description out of the `title` attribute into associated text
- [ ] Verify with a screen reader, which no automated run substitutes for

Constraint gate: checked 1 to 11, none breached. Constraint 6 was the live consideration: the
availability description must keep all five states distinct and must never assert that an issue is
available.

**BL-028: Make the reading view usable on a phone**

- [ ] Move the mobile rail rule below the base rule so it stops being dead code
- [ ] Contain the shelf so the page stops overflowing at 320 and 390 pixels
- [ ] Reveal row actions at rest on coarse-pointer devices instead of on hover
- [ ] Grow the hit area of the read toggle and row actions without necessarily growing their visual size
- [ ] Add a check pinning the computed rail position at a narrow width, and the 26 pixel target gap

Constraint gate: checked 1 to 11, none breached. Constraint 1 was the live consideration: any
change to how covers are laid out on small screens must continue to reference cover URLs and must
never store image bytes.

**BL-029: Raise the red accent so white text on it clears 4.5:1**

- [x] Darken the accent token until white on it reaches 4.5:1
- [x] Stop tinting the shortcut hint below full white
- [x] Re-check the accent against the page background for the eyebrow text
- [x] Re-run the contrast computation and the two accessibility scanners

Constraint gate: checked 1 to 11, none breached. Constraint 11 applies to any copy touched while
doing this, and no copy change is expected.

Shipped. One token could not do both jobs, because white-on-red and red-on-background pull in
opposite directions: the old `#e23636` measured 4.36:1 and 4.33:1 and failed both. It was split
into `--red` `#d43333` for surfaces behind white text and `--red-text` `#eb5f5f` for red used as
text, at `src/styles.css:20-29`. The `kbd` tint was removed at `src/styles.css:247` and the
`.mark` rule in `src/open.html` was corrected. Landing pa11y errors went from 4 to 2, the seeded
reading view's HTML_CodeSniffer contrast failures went to 0, and axe-core 4.13.0 reported 0
violations. The two residual pa11y errors are its bundled axe 4.8 reporting undeterminable
gradient backgrounds as failures, which is what BL-031 addresses.

**BL-030: Stop dimming read rows with a blanket opacity**

- [x] Replace the container opacity with a dedicated dimmer foreground token
- [x] Keep a non-colour indicator for the read state
- [x] Confirm badge borders clear 3:1 in the read state
- [x] Re-run the scanners on the seeded reading view

Constraint gate: checked 1 to 11, none breached. Constraint 6 was the live consideration: the read
state must not be styled in a way that collapses the availability badge distinctions.

Shipped. `opacity: .48` on the row was replaced with a `--read-fg` foreground plus a
strikethrough, at `src/styles.css:316-317`; the strikethrough is the non-colour indicator. The
only opacity left on a read row is the cover image at `src/styles.css:319`, which carries no
text. Verified with six rows actually in the read state rather than by reading the stylesheet:
every descendant now computes `opacity: 1`, and axe-core 4.13.0 reported 0 contrast violations.

On the badge check, the 2.75:1 figure this task was written against was the opacity multiplying
the badge, and that cause is gone: a badge now renders identically whether or not its row is
read, which is what the task was asking for. Measuring the composited border anyway put
`.badge-expected` at 1.58:1, but that is unconditional design at `src/styles.css:364` rather than
anything the read state does, and the badge's meaning is carried by its text label, which passes.
Raised separately as BL-049 rather than folded into this item.

**BL-031: Put a scrim behind hero text so its contrast stops depending on the cover**

- [x] Add a scrim between the blurred cover and the hero text
- [x] Confirm the computed contrast is now determinable and passes for a light cover and a dark one
- [x] Keep the `body.nocovers` fallback working
- [ ] Re-run axe and confirm the incomplete results resolve

Constraint gate: checked 1 to 11, none breached. Constraint 1 was the live consideration: the hero
must keep rendering the cover from its URL and must not cache or store the image.

Shipped, with the last task deliberately left open. This was found while doing BL-029: the
eyebrow kept failing no matter which colour was chosen, because it sits on `.hero-fade` rather
than on `--bg`, and blurred cover art was bleeding through. Pixel-sampling the rendered
background across all eight catalog series gave a spread of `#222325` to `#2e2d30`, so contrast
depended on whichever cover the reader imported and no fixed colour could ever pass. The scrim's
top stop was raised from 60 to 88 percent alpha at `src/styles.css:189-196`. The spread collapsed
to `#1b1d22` to `#1e2126`, and the computed bound for a pure white cover is `#1f2228`, so the
backdrop is now bounded for any import rather than merely for the covers that were sampled. All
19 hero text nodes were checked against that bound.

The last task is left open because it cannot be satisfied as written. axe still returns the same
nodes as incomplete, and always will: it declines to judge any text over a gradient, regardless
of how opaque that gradient is. The finding was answered by computing the bound instead. Reword
the task or close it, but do not expect a tool to clear it.

**BL-032: Offer a light theme and follow the system preference**

- [ ] Derive the palette from tokens so a second theme is a token set
- [ ] Add a light theme behind `prefers-color-scheme` with a manual override
- [ ] Meet the same contrast floor in both themes
- [ ] Keep the existing forced-colors and reduced-motion handling intact

Constraint gate: checked 1 to 11, none breached. Constraint 3 was checked, since a theme preference
is stored locally alongside existing settings and is never sent anywhere.

**BL-033: Re-render only what changed when an issue is marked read**

- [ ] Update the single changed row rather than rebuilding every row
- [ ] Update the counters and the rail without a full pass
- [ ] Skip rendering rows while their container is collapsed
- [ ] Re-measure the toggle cost on the 219 issue list and record the result

Constraint gate: checked 1 to 11, none breached. Constraint 4 was the live consideration: this must
be done in plain JavaScript, because adopting a rendering library would introduce a runtime
dependency.

**BL-034: Replace the native dialogs with the app's own notice system**

- [ ] Replace `prompt()` for list naming with an in-page control
- [ ] Replace `confirm()` for destructive actions with an in-page confirmation
- [ ] Route curated import failures through `notify()` like every other path
- [ ] Make sure the replacements are announced once, in step with BL-027

Constraint gate: checked 1 to 11, none breached. Constraint 11 applies to the new copy, which must
carry no em dashes.

**BL-035: Offer an undo after a list is deleted**

- [ ] Hold the deleted list in memory for the rest of the session
- [ ] Surface an undo affordance in the existing notice system
- [ ] Confirm read progress, which is global, is unaffected either way
- [ ] Add a test covering delete followed by undo

Constraint gate: checked 1 to 11, none breached. No constraint is engaged; the undo buffer is
in-memory and local.

**BL-036: Make the current view and list addressable in the URL**

- [ ] Reflect the active view and list in the URL hash
- [ ] Restore view and list from the hash on load
- [ ] Handle the browser Back and Forward buttons
- [ ] Confirm an unknown or stale hash falls back safely

Constraint gate: checked 1 to 11, none breached. Constraint 5 was the live consideration and is the
reason this uses the hash rather than anything that could alter the origin: the storage bucket must
stay bound to `127.0.0.1:8787`.

**BL-037: Keep the chosen filter across a reload**

- [ ] Persist the filter with the reader's other settings
- [ ] Restore it on load, defaulting to All when absent or unrecognised
- [ ] Decide whether the filter is per list or global and state the choice
- [ ] Carry it in the URL alongside BL-036 if that lands first

Constraint gate: checked 1 to 11, none breached. Constraint 5 applies, since the setting lives in
origin-bound local storage.

**BL-038: Build the two Library sub-views the adopted design specified**

- [ ] Add Everything read as a filtered view over the global read map
- [ ] Add Added by hand as a filtered view over the existing manual source marker
- [ ] Place both in the rail Library section as the adopted direction shows
- [ ] Confirm both views behave when empty

Constraint gate: checked 1 to 11, none breached. No constraint is engaged; both views read data the
app already holds.

**BL-039: Run the test suite automatically on every change**

- [x] Add a workflow running `npm test` on push and pull request
- [x] Pin the Node version to the `engines` floor
- [x] Keep the live contract check out of the default run, since it depends on a third-party API
- [ ] Make the run required before merge

Constraint gate: checked 1 to 11, none breached. Constraint 4 holds, because the workflow uses the
Node test runner already in use and adds no dependency. Constraint 3 was checked: continuous
integration runs on the repository, not in the shipped app, so it introduces no telemetry.

Shipped, except the last task, which is a branch protection setting on the repository rather than
anything in the tree, so it has to be applied by the repository owner.

Pinning to the `engines` floor immediately earned its keep: it exposed that `npm test` found no
tests at all on Node 20. The script passed a glob, `node --test "test/**/*.test.js"`, and Node
only began expanding globs itself after 20, so anyone honouring the declared engines range got a
green run over zero tests. `node --test test/` fails a different way on Node 24, with
`MODULE_NOT_FOUND`. Bare `node --test` is the only form that is portable across 20 to 24; it
skips `node_modules` and finds the same suite. The workflow at `.github/workflows/ci.yml` runs
the tests on both 20 and 24 so a repeat of this cannot hide.

**BL-040: Add a linter and formatter**

- [x] Add configuration matching the conventions already followed in the source
- [x] Add a lint script and wire it into the workflow from BL-039
- [x] Fix or explicitly ignore the existing findings in one pass
- [x] Keep the tooling in `devDependencies` or behind `npx`

Constraint gate: checked 1 to 11, none breached. Constraint 4 is directly engaged and permits this,
because it allows dev tooling while holding runtime dependencies at zero.

Shipped. The config at `eslint.config.mjs` was written against a survey of the code rather than
an off-the-shelf preset: single quotes won 5405 to 2886, arrow parameters are parenthesised in
206 places and bare in none, and trailing commas appear 216 times. Prettier was deliberately not
adopted, and no `max-len` rule was added, because either would reflow working code and bury the
history under a formatting commit. Runtime dependencies stay at zero; the three additions are
`devDependencies`.

Two rules were rejected on evidence. `no-await-in-loop` flagged 23 correct sequential awaits,
which is the point of the rate limiter, so the pre-existing `eslint-disable` for it became a
plain explanatory comment instead. `design/mockups/mock-data.js` produced 1630 findings and is
generated from `src/data/hickman_full.json`, so it is ignored rather than reformatted.

The pass found three real problems, not just formatting: an unused binding in
`src/js/lib/model.js`, a `let` that is never reassigned in `src/js/main.js`, and the stale
disable directive above. Lint now exits 0 and runs as its own job in the workflow.

**BL-041: Cover the three browser-coupled modules with tests**

- [ ] Cover `src/js/cache.js` against a fake IndexedDB
- [ ] Cover `src/js/hydrate.js` for cancellation and resumption
- [ ] Cover the render paths in `src/js/main.js` that BL-033 will change
- [ ] Run the new tests in the workflow from BL-039

Constraint gate: checked 1 to 11, none breached. Constraint 4 permits a dev-only test double.
Splitting this alongside BL-042 will make the third task smaller.

**BL-042: Break the single view file into per-view modules**

- [ ] Split by view, starting with the one BL-033 touches
- [ ] Keep the store wiring in one place
- [ ] Move shared helpers into `src/js/lib/` where they are already pure
- [ ] Land each split behind passing tests from BL-041

Constraint gate: checked 1 to 11, none breached. Constraint 4 is the live consideration: this is a
file reorganisation and must not become an argument for a framework. Sized 20, so it cannot reach
`Ready` until it is split into per-view items, which is why it sits at `Proposed`.

**BL-043: Give releases a version, a tag and a changelog**

- [x] Move the version off `0.1.0` and state what the number means
- [ ] Tag releases in git
- [x] Add a changelog covering at least the current release
- [x] Surface the version in the About view so a bug report can name a build

Constraint gate: checked 1 to 11, none breached. Constraint 3 was checked: surfacing a version in
the UI is display only and sends nothing anywhere.

Shipped, except cutting the actual tag, which needs a commit to point at and so belongs to
whoever lands this work. The procedure is written up under Releasing in `README.md`.

The version is 1.0.0 and what the number means is written down at `src/js/lib/version.js`: MAJOR
means an older build cannot read data saved by this one. That axis was chosen because reading
progress lives only in the reader's own browser and there is no server that could migrate it for
them, so a data format change is the one upgrade that can actually cost someone their data.

Because the app has no build step, the browser reads the version from a hand-written constant
while npm reads `package.json`, and nothing mechanical stopped those two drifting.
`test/version.test.js` is that mechanism and it runs in CI. `scripts/sync-version.mjs` closes the
loop from the other side: wired to npm's `version` lifecycle, it rewrites the constant after npm
bumps `package.json` but before the release commit is made, so the two agree in every commit
rather than disagreeing in the gap between two of them.

**BL-044: Send a content security policy and frame options from the dev server**

- [x] Add a content security policy covering the metadata API and the cover host
- [x] Add frame options, or a frame-ancestors directive
- [x] Confirm cover images and API calls still work under the policy
- [x] Keep the existing nosniff, referrer-policy and ETag behaviour

Constraint gate: checked 1 to 11, none breached. Constraint 5 is the live consideration: the policy
must be written so it does not require moving off the `127.0.0.1:8787` origin.

Shipped. The policy and `x-frame-options: DENY` are sent from `server.mjs`. Writing it strictly
rather than nominally was most of the work: the first run reported 976 violations, which were
driven to 0 by changing the code rather than by loosening the policy.

Locating them needed instrumentation, because a CSP violation event carries an empty `sample` and
cannot tell you which line produced it. Overriding `setAttribute`, the `innerHTML` setter and
`insertAdjacentHTML` in the page and capturing a stack at each call named the two sources
exactly. Both were the same misunderstanding: `style-src-attr` blocks writing a style attribute
but does not block CSSOM, so `setAttribute('style', ...)` is a violation while
`el.style.setProperty(...)` is not. The per-series cover gradient moved into `src/styles.css`
driven by a `--h` custom property, which also removed a modulo, since CSS hue wraps on its own.
The `el()` helper now takes `style` as an object and applies it through `setProperty`.

Every inline `script` and `style` block was extracted into its own file so `'self'` could be
literal. `connect-src` and `img-src` are deliberately wide: the API base is user-configurable at
runtime, so pinning it to `marvel.emreparker.com` would silently break self-hosted mirrors.

**BL-045: Move the API base URL check into the client that uses it**

- [ ] Validate https-or-local inside the API client rather than only at the settings form
- [ ] Keep the settings form message, since it is the one a reader sees
- [ ] Add a test covering a rejected base URL
- [ ] Confirm the cache key still scopes by base URL

Constraint gate: checked 1 to 11, none breached. Constraint 2 was the live consideration: the check
must continue to make a marvel.com or read.marvel.com base URL unusable as a metadata source.

**BL-046: Share the retry and backoff between the two vendor scripts**

- [ ] Extract the shared retry and backoff into one module
- [ ] Use it from both vendor scripts
- [ ] Keep the existing rate-limit behaviour identical
- [ ] Cover the extracted module with tests

Constraint gate: checked 1 to 11, none breached. Constraint 2 applies: the shared client must keep
fetching only from the metadata API.

**BL-047: Split the two meanings of the row class**

- [ ] Rename one of the two uses so a reading row and a form row stop sharing a class
- [ ] Delete the leftover empty rule
- [ ] Confirm no selector elsewhere depended on the collision

Constraint gate: checked 1 to 11, none breached. No constraint is engaged.

**BL-048: Correct the availability comment that names four states**

- [x] Correct the comment to name the five states the enum defines
- [x] Check the same wording where it was repeated in project history
- [x] Confirm no code branches on the wrong count

Constraint gate: checked 1 to 11, and this item exists because of Constraint 6, which names the
disagreement between the comment and the enum as a finding to record. Nothing here simplifies the
model; it makes the comment match the five states already implemented.

Shipped. The comment at `src/js/lib/availability.js:10` now names five states and records why the
fifth exists, so the next reader is less likely to try collapsing them. No code branched on the
count, so this was a documentation defect only, which is exactly why it was worth fixing: the
comment was the only thing telling a reader the model was smaller than it is.

**BL-049: Decide whether the faint badge borders need to meet the 3:1 non-text minimum**

- [x] Measure the composited border contrast for all four badge variants, not only `.badge-expected`
- [x] Decide whether these borders are meaningful non-text indicators under WCAG 2.2 1.4.11 or decoration
- [ ] If they are meaningful, raise each border to 3:1 without altering the badge text colours
- [x] Confirm the badge text contrast and the five-state distinctions are unchanged either way
- [x] Record the decision and its reasoning next to the rule, so this is not re-measured a third time

Constraint gate: checked 1 to 11, none breached. Constraint 6 is the live consideration: the five
availability states must remain distinguishable from one another, so any change to the borders has
to keep `expected`, `override-available`, `scheduled`, `override-unavailable` and the shared
`unknown`/`pending` treatment telling themselves apart.

Raised out of BL-030 rather than folded into it. BL-030's third task asked whether badge borders
clear 3:1 in the read state, and the answer turned out to be that the read state is not what
governs them. The 2.75:1 figure that task was written against came from the blanket row opacity,
which is gone; a badge now renders identically whether or not its row is read. Measuring the
composited border anyway put `.badge-expected` at 1.58:1 against the 3:1 floor, but that is
unconditional design at `src/styles.css:364`, where the border is 25 percent alpha green.

Shipped as a decision rather than a change: the borders are decoration, the 3:1 floor does not
govern them, and the colours were deliberately left alone. The third task is therefore closed
unticked, because it was conditional on the opposite answer.

All five states were measured first, because deciding on one variant would have been guessing
about the other four. Each border was composited over the full stack of ancestor backgrounds down
to the first opaque one, rather than over the nearest non-transparent ancestor, and each was taken
in all four contexts a row actually renders in. Against the plain row background none of them
clears 3:1: `expected` and `override-available` 1.58:1, `scheduled` 1.71:1,
`override-unavailable` 1.43:1, and the `unknown`/`pending` pair 1.29:1. The worst case across
every context is that same pair at 1.22:1 under `.row:hover`. Read and unread compute identically,
confirming BL-030's finding from the other direction.

Hover was the last context added and it was worth the trouble: it moved both worst cases, the
border from 1.24:1 to 1.22:1 and the text from 6.00:1 to 5.94:1. Neither changes the conclusion,
but the first two figures recorded here were the wrong ones, which is the argument for measuring
the contexts rather than reasoning about which one must be darkest.

The decision is that WCAG 2.2 1.4.11 does not reach these. Its first bullet covers user interface
components, and a badge is a non-interactive `span` with no control state to identify; the states
that bullet protects are a control's own, such as checked or disabled. Its second bullet covers
the part of a graphic *required* to understand the content, and no part of these is: every state
is written out in words inside the pill at `src/js/main.js:586-593`, drawing on the labels at
`src/js/main.js:615-620`, and the full sentence is repeated in the `title` attribute from
`describe`. Delete the outline and the reader still sees "MU Unlimited", "soon scheduled",
"? unknown", "MU✓ yours: available" or "no yours: not in MU". The outline bounds the label rather
than carrying it, which puts it in the same class as a card border or a table rule.

Two supporting measurements make that safe to rely on. The badge text passes on its own, at 5.94:1
in the worst context against the 4.5:1 floor, so nothing is depending on the border to be legible.
And because the five states are named in words rather than only tinted, 1.4.1 Use of Color holds
without the border too, so Constraint 6 is not resting on the outline either. Both the text
colours and the state distinctions are untouched, which is what the fourth task asked for.

The reasoning is recorded at `src/styles.css:339-362`, directly above the rules it governs, along
with the two conditions that would overturn it. One is these labels being cut back to the bare
glyphs in `SHORT`, which would make the outline the state indicator and put it under the 3:1
floor. The other is a second palette: every figure here is composited against the dark theme, so
BL-032's light theme would void all of them and the measurement would have to be redone per
theme. That comment is the point of the item. The measurement is cheap and will be cheap again;
what was expensive was the judgement, and leaving it unwritten is what caused this to be measured
twice.

Automated scanning will not settle this. The axe-core colour-contrast rule evaluates text only and
never looks at borders, so the 0-violation axe run recorded against BL-029, BL-030 and BL-031 says
nothing about this item in either direction. It had to be measured deliberately, and the tool that
does it now walks all five variants instead of only the one that happens to render in the seeded
list.

One thing found on the way, and it grew: correcting the line numbers this comment shifted drew
attention to three evidence anchors in `docs/UX_STUDY.md` that no longer resolved to anything about
motion. All three cited lines 383-385 or 383-390 of `src/styles.css`. The first reading was that
they had always been wrong. They had not. At `b18fc47`, the baseline the audit measured against,
383-385 really was the reduced-motion query. Shipping the top of the backlog at `e6d27c4` grew that
file from 409 lines to 450 and pushed those rules down without changing them, and the study was
written up afterwards still carrying the pre-ship numbers, so the ranges were already stale by the
time it was committed at `240e6d3`. This is drift that one commit introduced, not sloppiness in the
original measurement. Swept properly it was eleven anchors across both documents rather than three,
repaired in `1e3fb64`, and three had drifted far enough to name the wrong rule outright: the claim
that every tab stop carries a 3 pixel focus outline had come to cite `body`, the note about the
leftover empty `.row` rule had come to cite the checkbox, and the description of the reading row
itself had come to cite the cover-tile rules. The three that started this now point at the
progress-ring transition at `src/styles.css:149` and the preference queries at
`src/styles.css:448-455`.

Those stale numbers are written above without the usual anchor backticks on purpose. They are a
historical citation rather than live evidence, and in the anchor form a checker would resolve them
against today's file and report them as healthy. That is precisely the weakness that let them rot
unnoticed, because a range that resolves is not necessarily a range that says what the sentence
claims. It is also why the 24 lines this comment adds were re-derived against every anchor below
them and confirmed by reading the code each one lands on, rather than trusted to a checker that
only asks whether the range exists.

The doc-internal anchors are that weakness squared, and one survived every sweep above. This
document's own out-of-scope list was cited from `docs/UX_STUDY.md` as lines 683-686 of this file,
and that citation was never correct: at `240e6d3`, the commit that first carried the study, 683-686
was the EP-05 heading and the out-of-scope list began at 794. It was wrong on arrival rather than
rotted, which is the harder case, and it survived because a range into a Markdown file that is
always present and always long resolves cleanly forever while naming nothing related. It also fell
outside the eleven-anchor sweep, which followed anchors into code files only. A sweep that would
catch this has to check identity rather than resolution, with `.md` targets in scope.

That sweep has since been run, and it did not stop at Markdown targets. Checking every anchor in
both documents against the code it actually lands on, rather than against whether it resolves, found
fifteen further stale anchors across thirty-three citations. Most sat in the Evidence column of the
backlog table above, which the eleven-anchor sweep never reached because it worked through the
prose. Four named the wrong thing outright: the red-accent defect cited the read-row comment, the
content security policy enabler cited the dev server's method check rather than its header block,
the undo-after-delete story cited the rename handler, and the keyboard story cited the availability
toggle. Two more had come to rest on a blank line. Each was re-derived by reading what the cited
range held at `b18fc47`, locating that same code today, and confirming the result by reading the
lines it now occupies.

Two properties of that method are worth keeping. Deriving a new number by shifting the old one is
unsafe whenever the anchor's own text also changed, because the shift then gets applied twice, so
the reliable move is to find the code and read its current position. And the re-aim cannot be left
to a tool, because an anchor that has already been relocated once will disagree with the baseline by
construction and be reported as stale when it is in fact correct.

A later pass found a blind spot in that sweep too, and it sat in the matcher rather than in the
method. This document carries evidence anchors in three differently shaped table rows as well as in
running prose, and every sweep so far had been written against one shape. The story-verification
table near the top lists its rows as `| 1.1 | BL-001 | ... |`, so a pattern anchored on a leading
story ID never matched it. Twenty-five further anchors were stale across forty-one citations, in
that table, in the table-stakes rows below it, and in the personas and journeys of
`docs/UX_STUDY.md`.

The mechanism behind most of them is not drift at all, and the difference changes the prevention.
These anchors were never correct in any commit that contained them. `docs/UX_STUDY.md` was added at
`240e6d3`, and the story-verification table was written in the same commit, but both were measured
against the working tree at `b18fc47`. In between, `e6d27c4` had already moved `src/js/main.js` by
fourteen lines and `src/styles.css` by forty-one, and `240e6d3` touches neither file, so the
citations were stale the moment they were committed. `src/js/main.js:606-611` shows it plainly: at
`b18fc47` those lines are the `SHORT_LABEL` declaration the row claims, and at `240e6d3`, where the
row was born, they are `]));`.

That inverts the obvious reading. `e6d27c4` did not invalidate correct anchors, it landed before
the anchors existed. So the prevention is not to re-check anchors after changing code, because the
code had already changed. It is to derive anchors against the tree being committed rather than the
tree that was measured, which is the rule about deriving anchors only once the prose is final,
extended from prose to code.

A later commit then made the damage harder to see. `a29aa8b` applied a correct one-line adjustment
to numbers that were already eight lines out, so the anchors came to carry a recent, deliberate and
correct-looking edit. Any check asking whether an anchor has been maintained answers yes, and a
history search on the anchor string shows a considered update rather than neglect. A correct delta
applied to an incorrect base hides better than plain neglect, and it is why three successive sweeps
each asked what had changed since the anchor was written, found the one-line adjustment, and left
the eight lines underneath in place.

Two cautions came out of the repair. The offset is not uniform: most of the cited regions had moved
by eight lines, but the filter predicate had moved by nine, and the file as a whole had moved by
ten, so applying a single delta across a file reintroduces the same defect somewhere else. And
resolution stays a weak test even for code
targets. Two anchors cited for inconsistent error surfaces resolved to real statements and were
still wrong, because the claim is about `alert()` call sites while the lines they named held a
variable assignment and a constant. Locating all three `alert()` sites and reading them is what
settled those two.

One anchor survived even that pass, and it failed on extent rather than on position. The
duplicate-list story cited a six-line range holding only the handler's setup, with the
`duplicateList` call and the shared-progress announcement both outside it. It resolves onto real
code and reads as precise, which is why every resolution check passed it, and it now cites the
whole handler. Extent is the property automated checking is worst at, because a wrong extent is
indistinguishable from a deliberately narrow one.

`BL-050` closes the loop that all of this opened. Five sweeps found one defect class five times,
because each compared line numbers rather than reading lines, and because each matched a different
subset of the places an anchor can be written. `scripts/check-anchors.mjs` fingerprints the cited
lines themselves rather than their numbers, so a correct re-aim preserves the fingerprint while
drift breaks it, and the build fails in the commit that moves the code rather than in a sweep months
later. It runs in the lint job at `.github/workflows/ci.yml:84-85` and locally as `npm run anchors`,
wired at `package.json:14-15`.

Which half of it depends on which is the load-bearing decision. Listing the shapes an anchor can
appear in would repeat this thread's defect with a longer list, because an enumeration is something
somebody has to keep complete, and the next shape to appear is covered by neither the list nor any
check of it. So membership never depends on recognising a shape. The population is a regex scan of
every Markdown file that `git ls-files` reports, and structure supplies only the key: an anchor
whose row the walker misreads is still collected, it just gets an uglier name. Coverage is then
asserted per document on every run, scanned against captured, and a shortfall is fatal.

That assertion exists because counting anchors cannot replace it. A check that the collector found
more than zero detects total failure and is structurally blind to partial failure, which is the only
kind that has actually happened: a collector that reads one table shape returns a large, healthy
number and sails past a zero check while ignoring four fifths of the corpus. Scanned against
captured is the difference between measuring coverage and assuming it.

The controls matter more than the passing result, because a checker that can only report success is
indistinguishable from one that is not running. Pointed at the commit that introduced these
citations it reports drift in the dozens and exits non-zero, so it would have failed the build that
created the defect. Pointed at a revision predating the documents it exits fatal rather than clean.
Moving one anchor by a single line is caught and named. And reintroducing the single-shape defect
deliberately is caught by the coverage assertion rather than passing quietly, which is the property
worth more than the fingerprinting. It also caught its first live defect during its own delivery:
adding the two script lines above shifted four `package.json` citations, which were re-read and
re-aimed rather than re-blessed.

What it cannot do is worth stating as plainly as what it can. It compares an anchor against its own
past, not against the claim beside it, so blessing a wrong anchor locks a wrong anchor in
permanently and silently. Identity is a real improvement on asking whether a line number exists, but
extent still escapes it, for the reason above. The coverage assertion counts the same regex twice,
so it guards the walk rather than measuring the corpus independently, and it cannot see a citation
written in a shape the regex itself does not know. A human still has to read each anchor once. What
the gate removes is having to read all of them again on every sweep, which is the whole of the gain
and the honest limit of it.

The Evidence column of the backlog table above is inside the gate, and the six rows that must not be
are exempted on a marker they declare rather than on how they are punctuated. A claim about a past
state cites code that is expected to contradict it: `BL-040` cites the scripts block as evidence
that no lint script existed, and that block now defines one. Gating it would demand a true
historical record be falsified. So a citation is exempt when it sits inside an `absent:` evidence
token, and only for as far as that token reaches, which is the backticked span or the table cell it
begins. The release row cites `absent: CHANGELOG.md and git tags` and then cites two live anchors
after it, and a rule that ran to end of line would have dropped both.

The earlier version excluded the column by leaving those citations unbackticked, which is
punctuation that happened to coincide with the decision rather than expressing it. It failed
silently in both directions: backticking a path for readability would have enrolled twenty-one rows
unannounced, and a new historical claim written with backticks would have been gated and would have
failed for being correct. The exemption was resolved rather than identified, which is this
document's own recurring defect one level up from where it was found.

Twenty-one live anchors joined the gate as a result, and fourteen of them sit on work that has not
started. Those are the highest-value anchors in the document, because they are the entry point an
implementer navigates to for code they do not know, and they will sit unread longest, which is
exactly the interval in which drift is invisible. They were clean when they were enrolled, so the
exclusion had cost nothing yet. They were clean because they had just been swept by hand, and the
premise of the gate is that nothing tells you when clean stops being true.

Keys are local for the same reason. A story ID is not unique across the document, so keying an
anchor on the ID alone merged the two rows that share one into a single ordinal bucket, and
inserting a citation into either renumbered the other and reported drift that had not happened.
Spurious drift is the expensive kind: it trains a re-bless reflex, and a reflexive re-bless is how a
real drift gets waved through.

A blessed anchor that stops being collected now fails the build too, which it did not before.
Coverage guards the walk inside the documents that exist and discovery guards which documents are
opened, and neither guards loss. Deleting `docs/UX_STUDY.md` in a scratch revision was measured
rather than argued: seventy-two anchors left the gate while the run printed `coverage:
PRODUCT_BACKLOG.md 146/146` and exited 0. Renaming it is the plausible version and it also passed
for the wrong reason, because the seventy-two reappeared under a new document key and the run
complained about additions rather than about the loss. Each guard was measuring the layer it could
see and reporting full marks for the layer beneath it, which is the same defect this section
describes twice already.

Which losses matter is deliberately not judged. Failing only when a whole document disappears would
be a heuristic about significance, and a heuristic about which anchors are worth counting is exactly
how this checker once covered thirty-seven of a hundred and ninety-three. The cost is that deleting
a backlog row now fails until it is re-blessed, which is friction on an ordinary edit rather than on
a code change. That is the right direction: a claim that has vanished is unverifiable, not free of
news.

Blessing is the one action the gate cannot check, and the order of operations matters more than it
looks. Writing the paragraphs above moved this document's own out-of-scope list, which
`docs/UX_STUDY.md` cites by line, and blessing in the same step as the edit locked the broken anchor
in silently and reported a clean run. The gate caught it on the next edit, which is the second best
outcome available. Bless as the last action, with nothing edited after it, and read the check that
follows rather than the bless that preceded it.

One report needs reading with care. Ordinals are positional within a section and a file, so deleting
a citation renumbers the ones after it in the same bucket. Removing a single prose line carrying two
citations is reported as two removed and one drifted, and that one drift has not moved: it inherited
a lower ordinal. Making keys local shrank the blast radius from the whole document to one section
and one file, and it did not remove it. The removed list is the reliable half of that pair, and a
drift reported alongside a removal in the same bucket should be confirmed against the code before it
is treated as movement.

## Existing epics and stories

The original story text is preserved. Each story now carries its ID and disposition.

### EP-01, Epic 1: Curated reading-list catalog

**Goal:** Make multiple Marvel reading lists visible and easy to start.

- **P0: As a reader, I want to see a catalog of available reading lists so that I can
  choose something other than the Hickman Secret Wars list.** `BL-001` `Done`
  - The catalog includes the list name, a short description, approximate issue count,
    and the type of list.

- **P0: As a reader, I want to browse lists by category so that I can find events,
  character runs, creator runs, and eras relevant to me.** `BL-002` `Done`
  - Categories can be filtered without losing the list details.

- **P1: As a reader, I want to search the catalog by title or character so that I can
  quickly find a list I have in mind.** `BL-003` `Done`
  - Search results update clearly and show when there are no matches.

- **P1: As a reader, I want to understand whether a list is essential, complete, or
  tie-in focused so that I can choose the amount of reading I want.** `BL-004` `Done`
  - Each list displays its reading-depth label before import.

### EP-02, Epic 2: Expand Marvel event coverage

**Goal:** Provide useful non-Hickman examples and establish an expandable editorial
pipeline for event lists.

- **P0: As a reader, I want several major Marvel event lists available out of the box
  so that the app feels like a Marvel tracker rather than a single-saga tracker.** `BL-005` `Done`
  - The first release includes a balanced sample of events from different eras,
    such as House of M, Civil War, Secret Invasion, Annihilation, and King in Black.

- **P0: As a product owner, I want each curated list to record its source and version
  so that users can understand where the order came from and when it was updated.** `BL-006` `Done`
  - The list shows attribution and a last-updated date.

- **P1: As a reader, I want more than one version of an event order so that I can
  choose an essential reading path or a complete tie-in path.** `BL-007` `Partial`
  - Variants are grouped under the same event and clearly named.

- **P1: As a maintainer, I want to add a new curated list without changing the main
  application logic so that the catalog can grow safely.** `BL-008` `Done`
  - A new list is defined through data and appears automatically in the catalog.

### EP-03, Epic 3: Import and create personal reading orders

**Goal:** Let users bring in lists that are not bundled with the app.

- **P0: As a reader, I want to paste a Markdown or plain-text reading order so that
  I can track a list from another guide.** `BL-009` `Done`
  - The app reports how many entries were imported, how many were unresolved, and
    never silently drops an entry.

- **P1: As a reader, I want to resolve an unmatched title by choosing from search
  results so that my imported list remains accurate.** `BL-010` `Done`
  - The app shows enough title, series, and date information to make a safe choice.

- **P1: As a reader, I want to create a list by adding series, creators, or individual
  issues so that I can build a custom reading path.** `BL-011` `Done`
  - Added issues keep their selected order and can be moved or removed.

- **P2: As a reader, I want to duplicate an existing list so that I can customize it
  without losing the original order.** `BL-012` `Done`
  - The copy has its own name and order while preserving shared read progress behavior.

### EP-04, Epic 4: Reading-list experience

**Goal:** Help users understand and complete a list with less effort.

- **P0: As a reader, I want to see which list I am currently following so that I do
  not mark progress in the wrong list.** `BL-013` `Done`
  - The active list is clearly identified in the navigation and reading view.

- **P1: As a reader, I want to see event progress by section or series so that I can
  understand where I am within a large crossover.** `BL-014` `Partial`
  - Progress can be viewed for the list overall and for its constituent series.

- **P1: As a reader, I want to filter a list to unread, read, available, or pending
  issues so that I can focus on the next useful action.** `BL-015` `Done`
  - Filtering does not change the saved reading order.

- **P1: As a reader, I want to resume from the next unread issue so that I do not have
  to remember where I stopped.** `BL-016` `Done`
  - The app presents one clear next issue and advances after it is marked read.

- **P2: As a reader, I want optional notes on a list or issue so that I can record
  context, reactions, or reminders.** `BL-017` `Not started`
  - Notes remain local and are included in backups.

### EP-05, Epic 5: Trustworthy metadata and availability

**Goal:** Make the app transparent about what it knows and what it cannot verify.

- **P0: As a reader, I want to know when an issue's metadata is incomplete so that I
  do not mistake a pending lookup for missing content.** `BL-018` `Done`
  - Pending, unknown, and confirmed metadata states are distinct.

- **P1: As a reader, I want to know whether an issue is expected to be on Marvel
  Unlimited so that I can plan my reading session.** `BL-019` `Done`
  - The wording makes clear when availability is an estimate rather than a guarantee.

- **P1: As a reader, I want newer issues to remain trackable even when they are absent
  from the metadata snapshot so that the tracker does not become obsolete.** `BL-020` `Done`
  - Manual entries can be read, reordered, exported, and backed up.

- **P2: As a maintainer, I want the app to detect changes in the metadata API contract
  so that upstream changes do not quietly break the experience.** `BL-021` `Done`
  - Contract checks identify missing or changed fields before a release.

### EP-06, Epic 6: Backup, portability, and ownership

**Goal:** Keep user progress safe while preserving the local-first design.

- **P0: As a reader, I want to export all my lists and progress so that I can recover
  from browser storage loss.** `BL-022` `Done`
  - A backup restores list names, order, issue data, and read state.

- **P1: As a reader, I want to move a list between browsers or computers so that my
  reading progress is not tied to one device.** `BL-023` `Done`
  - Exported data can be restored on another supported browser.

- **P1: As a reader, I want to export one list as Markdown so that I can share or
  review it outside the app.** `BL-024` `Done`
  - The export preserves order and read/unread state.

- **P2: As a reader, I want optional synchronization between my devices so that I do
  not have to manage backups manually.** `BL-025` `Forbidden, Constraint 3`
  - Sync is opt-in and does not change the local-only behavior for users who do not
    enable it.

### EP-07, Epic 7: Accessibility and usability

**Goal:** Make the expanded catalog and tracker usable by more readers.

- **P0: As a keyboard user, I want to browse, select, and manage reading lists without
  a mouse so that the app is fully usable with my preferred input method.** `BL-026` `Partial`
  - Focus order, visible focus, and keyboard actions are consistent.

- **P1: As a screen-reader user, I want list changes and import results announced so
  that I know what happened without relying on visual updates.** `BL-027` `Partial`
  - Important actions have meaningful accessible labels and status messages.

- **P1: As a reader on a small screen, I want the catalog and reading view to remain
  easy to scan so that I can use the app beside Marvel Unlimited.** `BL-028` `Partial`
  - Long names, progress indicators, and actions remain usable on narrow screens.

### EP-08: Readers who depend on contrast cannot reliably read the interface

**Outcome:** OC-1. Items: BL-029, BL-030, BL-031, BL-032, BL-049.

Four measured problems share one root: colour decisions were made without a contrast floor. The
accent fails white text, the read state dims whole rows below the floor, the hero renders text over
an image whose contrast cannot be known at author time, and there is no alternative to the dark
scheme. BL-049 was added later from the same root, and is a decision rather than a fix: the badge
borders are faint enough to fail the non-text floor, but it is genuinely unsettled whether that
floor applies to them.

### EP-09: Working through a long order is slower than the list is long

**Outcome:** OC-1. Items: BL-033.

Marking one issue read rebuilds the whole application. The cost is measured and scales with list
length, on the most repeated action in the product.

### EP-10: Readers cannot get back to a place in the app

**Outcome:** OC-2. Items: BL-036, BL-037, BL-038.

Nothing about where the reader is survives a reload or a Back press, and two views that would let
them find their own history were never built.

### EP-11: The app answers the same kind of action in different ways

**Outcome:** OC-2. Items: BL-034, BL-035.

Naming, confirming and failing are handled by native browser dialogs in some paths and by the
app's own notice system in others, and one destructive action can be undone while another cannot.

### EP-12: Changing the code is riskier than the change usually warrants

**Outcome:** OC-3. Items: BL-039, BL-040, BL-041, BL-042, BL-043, BL-044, BL-045, BL-046, BL-047.

224 tests exist and nothing runs them automatically. The three modules touching the browser have no
tests at all, every view lives in one 1,566 line file, and there is no linter, no changelog and no
release version to name a build by.

## Suggested delivery order

The original order below described the catalog expansion, which has now shipped. It is kept as the
record of that plan. The order this backlog now suggests is the WSJF sequence in the item table,
with one adjustment a score cannot express: BL-039 should land early regardless of its rank,
because every other item is safer to make once the tests run automatically.

1. Build the data-driven curated-list catalog.
2. Add several non-Hickman event lists with attribution and variants.
3. Improve import resolution and custom-list workflows.
4. Add event sections, richer progress views, and list duplication.
5. Strengthen metadata transparency, backups, and accessibility as the catalog grows.
6. Consider optional synchronization only after local workflows are proven useful.

Item 6 has since been ruled out rather than deferred. See BL-025.

## Out of scope for the next expansion

- Hosting or distributing comic content.
- Scraping Marvel Unlimited pages.
- Replacing established community sites that curate reading orders.
- Requiring accounts or cloud services for the core tracker experience.

## Appendix A: Maturity assessment

Swept against ISO/IEC 25010:2023. Every entry carries either a gap with an evidence anchor or a
"not applicable, because" answer. Anchors take the form `path:START-END` for a claim about specific
lines, `path` alone for a claim that a file exists, and `absent: pattern, method` for a claim that
something is missing.

Every gap below is the state as measured at `b18fc47`, the audit baseline, and is kept as the record
of why an item was raised rather than rewritten once the item shipped. Where this pass closed one, a
`Resolved:` note names the item and points at what shipped, which is the convention the findings in
`docs/UX_STUDY.md` already use. The anchors are live and point at where the code sits now, so an
anchor beside a closed gap can land on the fix rather than on the defect it was raised against.

### Product quality characteristics

#### 1. Functional suitability

Functionally complete against its own backlog: 21 of the 28 original stories ship in full. Two
gaps remain.

- Gap: series progress is computed across every list at once rather than for the list being read,
  so a reader inside one crossover sees totals inflated by every other list they have imported.
  Evidence: `src/js/main.js:1397-1415` (renderProgress calls seriesProgress on the whole state, with
  no list filter), `src/index.html:194-196` (the view's own subtitle states it counts across every
  list).
- Gap: the catalog carries a variant grouping model, but only the Hickman creator run populates it.
  All six event lists ship with `group`, `groupName`, and `variant` set to null, so the promise of
  choosing an essential path or a complete path applies to one list out of eight.
  Evidence: `src/data/catalog.json` (per-list `group`, `groupName`, `variant` fields),
  `src/js/main.js:1192` (groupCatalog renders variant rows only where a group exists).
- Correctness is well defended: 224 unit tests pass, 235 since this pass shipped, and
  `scripts/check-contract.mjs` pins 24 upstream API assumptions so schema drift is distinguishable
  from an outage.
  Evidence: `package.json:10`, `package.json:13`, `scripts/check-contract.mjs:248-280`.

#### 2. Performance efficiency

Gap, measured rather than inferred. Every state change re-renders the entire application. A single
read toggle on the 219 issue Hickman full list rebuilds the rail, all 219 rows and the progress
block: 4,485 DOM nodes and 1,533 row controls, at a median of 21.9 ms synchronous and 75.7 ms to
paint, with the first toggle costing 38.9 ms and 144.1 ms. Measured headless on a desktop machine,
so a phone will be slower.

Evidence: `docs/ux-artifacts/render-cost.json`, `src/js/main.js:1555-1568` (renderAll rebuilds
every region), `src/js/main.js:43-48` (store.onChange is wired straight to renderAll),
`src/js/main.js:534-613` (renderRows builds every row with no virtualisation and no early exit when
the containing details element is closed).

Loading is handled well by comparison: the three large data files are fetched only on demand, so
the 353 KB series index never loads for a reader who does not search series.
Evidence: `src/js/api.js:11-16`, `src/data/series-index.json`.

#### 3. Compatibility

No gap. Co-existence is a non-issue for a single local process, and interoperability is served in
both directions: JSON backup for round-tripping and Markdown export for reading elsewhere. Zero
runtime dependencies and plain ES modules mean nothing to reconcile with a host application.

Evidence: `package.json:1-28` (no `dependencies` key at all, `engines.node >= 20`),
`src/js/lib/model.js:434-458` (validated backup shape).

The fixed `127.0.0.1:8787` origin is a deliberate storage-bucket decision rather than a
compatibility gap, so it is recorded here and not proposed for change.

#### 4. Interaction capability

The weakest characteristic, and the source of most of this run's findings. Dropping to
sub-characteristic level, because the characteristic-level answer would hide the split.

- Appropriateness recognisability and learnability: good. Labels are written in plain English and
  the availability wording is careful to hedge. Evidence: `src/js/main.js:615-620`.
- Operability: gap. Row actions sit at `opacity: 0` until hover or focus-within, so on a touch
  device they are invisible until tapped. Evidence: `src/styles.css:369-376`.
- User error protection: gap. Deleting a list is guarded only by a native `confirm()` and cannot be
  undone afterwards, while restoring a backup does have an undo. Evidence:
  `src/js/main.js:343-350` (delete, confirm only), `src/js/main.js:1449-1452` (undoRestore exists).
- User engagement and inclusivity: gap. The interface is hard-locked to a dark scheme, and a light
  preference changes nothing. Measured: under emulated `prefers-color-scheme: light` the body
  background stays `rgb(15, 17, 21)` and the two screenshots are byte-identical.
  Evidence: `docs/ux-artifacts/live-inspection.json`, `src/styles.css:7`, `src/index.html:6`.
- Self-descriptiveness: gap. The full availability description is carried only in a `title`
  attribute, which never reaches a keyboard or touch user. Evidence: `src/js/main.js:588`.

#### 5. Reliability

Strong, and clearly the product of deliberate work. Unreadable saved data pauses writing rather
than overwriting, offers a salvage download, and explains itself. A backup from a newer schema is
refused rather than mangled. A fault-injection harness ships alongside the app.

Evidence: `src/index.html:66-77` (blocked banner, saving paused, salvage offered),
`src/js/lib/model.js:358-384` (migrate refuses an unsupported schema version),
`src/dev-faults.html` (fault-injection harness).

- Gap: none of this is verified automatically on change. There is no continuous integration, so the
  224 tests only run when someone remembers. Evidence: `absent: .github/workflows, Get-ChildItem of
  repository root and .github; no pipeline file of any kind`.
  Resolved: `BL-039` added `.github/workflows/ci.yml`, which runs the suite and the linter on every
  push and pull request.

#### 6. Security

Mapped to the OWASP Top 10 in the table-stakes section below. At characteristic level there is one
gap worth naming here: the static development server sets `x-content-type-options` and
`referrer-policy` but no `content-security-policy` and no `x-frame-options`.

Evidence: `server.mjs:112-122`.

Resolved: `BL-030` shipped both. The policy is assembled at `server.mjs:43-54` and sent at
`server.mjs:117`, with `frame-ancestors 'none'` at `server.mjs:53` and the companion
`x-frame-options: DENY` at `server.mjs:120`.

#### 7. Maintainability

The clearest debt in the repository, and it is concentrated in one file.

- Modularity gap: `src/js/main.js` is 1,566 lines and carries every view, every event handler and
  every render function. There is no view layer to change independently.
  Evidence: `src/js/main.js:1555-1568`, `src/js/main.js:275-295` (showView switches views by
  mutating a module-level variable).
- Testability gap: `src/js/cache.js`, `src/js/hydrate.js` and `src/js/main.js` have no test file,
  and they are exactly the modules holding browser-coupled logic.
  Evidence: `absent: test/cache.test.js, test/hydrate.test.js, test/main.test.js; glob of test/ and
  cross-check of every test file name against src/js`.
- Analysability gap: no linter and no formatter configuration exists, so style drift is caught only
  by review. Evidence: `absent: eslint|prettier config or lint script, read of package.json:8-17 and
  glob of repository root for .eslintrc*, eslint.config.*, .prettierrc*`.
  Resolved: `BL-040` added `eslint.config.mjs` and wired `npm run lint` at `package.json:11-12`.
- Modifiability gap: the retry and backoff logic is duplicated between the two vendoring scripts.
  Evidence: `scripts/vendor-index.mjs:40-54`, `scripts/vendor-orders.mjs:48-62`.
- Minor analysability gap: the `.row` class carries two unrelated meanings, a reading row and a form
  row, and a leftover empty rule sits between them. Evidence: `src/styles.css:304-307`,
  `src/styles.css:396-397`.

#### 8. Flexibility

Swept in full rather than dispositioned.

- Installability: good, and suited to an app cloned and run by hand. `npm start` runs the server
  with no install step, because there is nothing to install. Evidence: `package.json:8-19`.
  Changed since: `BL-040` added three devDependencies and a tracked `package-lock.json`, so linting
  now needs `npm install` first. Running the app still does not, and runtime dependencies are still
  zero.
- Adaptability: good. Plain ES modules with no build step and no bundler mean a Node upgrade
  changes nothing about the client, and `engines.node >= 20` states the floor.
  Evidence: `package.json:20-22`.
- Replaceability: good. The metadata API base URL is user-configurable and validated, the cache is
  keyed by base URL and schema version so switching mirrors does not serve stale data across them,
  and stored state carries a schema version with migrations.
  Evidence: `src/js/main.js:1462-1475`, `src/js/lib/cachePolicy.js:16-20`,
  `src/js/lib/model.js:11` and `src/js/lib/model.js:358-384`.
- Scalability: not applicable, because the app serves one reader in one browser profile on one
  machine, so there is no dimension along which load grows. The volume question that does matter,
  a single list of a few hundred issues, is recorded under performance efficiency above.

#### 9. Safety

Out of scope, because the app has no actuators, no control over any physical or financial process,
and no path by which a defect can cause harm beyond the loss of locally stored reading progress.
That loss is covered as a reliability and data-durability concern rather than a safety one.

### Table-stakes categories

| Category | Verdict |
|----------|---------|
| First-run experience | Gap. The first-run DOM ships an empty `<h2 id="hero-title">`, so the first heading a screen reader meets on an unseeded install is blank. Evidence: `src/index.html:125-155`, `docs/ux-artifacts/pa11y-landing.json`. |
| Empty states | No gap. The unseeded landing state explains what the app is for and routes to the catalog rather than showing a bare shell. Evidence: `docs/ux-artifacts/01-landing-firstrun-1280.png`, `src/index.html:36-38`. |
| Error handling and recovery | Gap. Error surfaces are inconsistent: curated import reports failure through native `alert()`, while every other path uses the in-page notice system. Evidence: `src/js/main.js:1354`, `src/js/main.js:1365`, `src/js/main.js:1382` against `src/js/main.js:137-149`. |
| Offline behavior | No gap, and no proposal. Probed as required rather than treated as a caching problem. With the local server running and no internet, the app starts, reads saved state, imports any bundled curated list and marks issues read, because those paths touch only same-origin files. Only cover images, metadata hydration and search degrade, and hydration failure is already surfaced as a pending state rather than as silence. Evidence: `src/data/house_of_m.json`, `src/js/main.js:590-593` (pending and by-hand badges), `absent: serviceWorker|navigator.onLine|manifest.json, case-insensitive grep across src/`. Repository Constraint 1 forbids caching cover bytes, so no cover-caching improvement is proposed. |
| Data durability and export | No gap. Full JSON backup and restore, per-list Markdown export, validated and atomic restore with an undo. Evidence: `src/js/lib/model.js:434-458`, `src/js/main.js:1449-1452`. |
| Schema migration | No gap. Stored state carries `SCHEMA_VERSION`, migrations run forward, and a future schema is refused rather than silently coerced, with a test pinning that behaviour. Evidence: `src/js/lib/model.js:11`, `src/js/lib/model.js:358-384`, `test/model.test.js:396-398`. |
| Observability | Partial gap, bounded by Repository Constraint 3. Product analytics are forbidden and are not proposed. What is missing is local and private: there is no way for the reader to see why hydration stalled beyond a queue-depth pill. Evidence: `src/js/main.js:1532-1534`. |
| Performance | Gap, measured. See characteristic 2. Evidence: `docs/ux-artifacts/render-cost.json`. |
| Security, OWASP Top 10 | Gap under A05 Security Misconfiguration: no CSP and no `x-frame-options` on the dev server. Evidence: `server.mjs:112-122`. Resolved: `BL-030` shipped both, assembled at `server.mjs:43-54` and sent at `server.mjs:117` and `server.mjs:120`. Partial gap under A10 Server-Side Request Forgery by analogy: `MarvelApi` accepts any base URL and only strips trailing slashes, with the https-or-local check living in the settings form rather than in the client. Evidence: `src/js/api.js:18-26` against `src/js/main.js:1462-1475`. That half stands: the check still lives outside the client, and it is tracked as `BL-045`. A01, A02, A03, A07 and A09 are not applicable, because there is no server-side authorisation boundary, no credential store, no server-side query language, no account system and no central log to protect. |
| Privacy | No gap. Nothing is uploaded, there is no account and there is no telemetry, which is the product promise itself. Evidence: `package.json:1-28` (no dependency that could exfiltrate), `absent: analytics|telemetry|gtag|beacon, grep across src/ and scripts/`. |
| Accessibility | Gap, measured and detailed in `docs/UX_STUDY.md`. Headline: 27 pa11y errors on the seeded reading view, 9 definite axe colour-contrast nodes there and 8 in the catalog, and a dead mobile layout rule. Evidence: `docs/ux-artifacts/pa11y-reading-seeded.json`, `docs/ux-artifacts/axe-03-reading-seeded.json`, `src/styles.css:81-84`. Resolved in part: the contrast findings closed under BL-029, BL-030 and BL-048, and the per-finding resolutions are recorded against each finding in `docs/UX_STUDY.md`. The headline counts above are the pre-fix measurements and are left as the record of what the audit found. The dead mobile layout rule is still open as BL-028. |
| Documentation | No gap for users and maintainers: the README covers setup, the origin decision, the metadata boundary and the closed Android question. Evidence: `README.md`. |
| Testing strategy | Gap. 224 tests pass and the pure logic modules are well covered, but the three browser-coupled modules have none, so no test exercises a render path. Evidence: `absent: test/cache.test.js, test/hydrate.test.js, test/main.test.js; glob of test/ cross-checked against src/js`. Partly changed: the suite is 235 after this pass, but the three modules still have no test file, so the gap itself is unchanged. |
| CI/CD | Gap, total. No workflow, no pipeline, no automated run of the existing suite. Evidence: `absent: .github/workflows, Get-ChildItem of repository root and .github; no pipeline file of any kind`. Resolved: `BL-039` added `.github/workflows/ci.yml`, which runs the suite and the linter on every push and pull request. |
| Release and versioning | Gap. Version is pinned at `0.1.0` with no tags and no changelog, so there is no way to say which build a backup or a bug report came from. Evidence: `package.json:3`, `absent: CHANGELOG.md and git tags, glob of repository root and git tag --list`. Resolved: `BL-043` set the version to `1.0.0` at `package.json:3`, added `CHANGELOG.md`, and wired a `version` script at `package.json:18` that syncs the version the app reports. |
| Dependency management | Not applicable, because runtime dependencies are zero by Repository Constraint 4, there are no `devDependencies`, and there is therefore no lockfile and no dependency graph to manage or audit. The repository invokes no package-fetching tool at all. Evidence: `package.json:1-28` (neither a `dependencies` nor a `devDependencies` key), `absent: npx, grep across the repository returning only this appendix's own text`. The absence of dev tooling is recorded as a maintainability and CI gap above rather than counted twice here. Changed since: the "not applicable" verdict no longer holds. `BL-040` added three `devDependencies` at `package.json:23-27` and a tracked `package-lock.json`, so there is now a dev dependency graph to audit even though runtime dependencies remain zero. |
| Licensing | No gap. The project is MIT, and every vendored order records its upstream source and licence rather than absorbing it silently. Evidence: `LICENSE`, `src/data/catalog.json` (`source` and `sourceLicense` per list), `src/js/main.js:1245-1265` (attribution rendered in the UI before import). |

## Appendix B: Priority disagreements

The `P` labels in this document are the original author's release intent. WSJF is a separate,
mechanical ranking. Neither overwrites the other. Every case where they disagree is listed here for
a human to settle.

Only six of the 28 original stories are still open work and therefore carry both a label and a
score. The other 22 are `Done`, `Superseded` or `Dropped` and are not scored, so they cannot
disagree. The 20 items this pass created carry no label, because inventing one would fabricate an
intent that no one stated.

### Case 1: BL-026 is labelled P0 but ranks tenth

- Stated: P0 Foundation, the first keyboard story in the original Epic 7.
- Calculated: WSJF 3.67, rank 10 of 26.
- Driver: job size, not value. Its Cost of Delay of 11 is the fifth highest in the backlog. It is
  outranked by nine items sized 1, 2 or 3 whose Cost of Delay is lower but whose size is smaller
  still. WSJF is explicitly a throughput heuristic, so a P0 that costs 3 will always sit below a
  cheap fix that costs 1.
- What a human should settle: whether "Foundation" here means "must be finished before anything
  else ships" or "must not be dropped". If the former, the label wins and BL-026 moves to the top
  regardless of the score. If the latter, the score's ordering is fine, because the nine items
  above it total a small amount of work.
- Complicating evidence: the measured keyboard picture is better than the P0 label implies. All 45
  tab stops carry a visible focus ring, focus order matches reading order, and the reverse walk
  escaped cleanly. Evidence: `docs/ux-artifacts/live-inspection.json`. The remaining defect is
  narrow, which is part of why the size is only 3.

### Case 2: BL-007 is labelled P1 but ranks twenty-second

- Stated: P1 Core product value, event order variants.
- Calculated: WSJF 1.4, rank 22 of 26, below fifteen unlabelled items and immediately above the
  single P2 story.
- Driver: both sides. Job size is 5, because the work is editorial rather than technical, and value
  is only 3, because the rendering that would display variants already ships and works. Evidence:
  `src/js/main.js:1192` and `src/js/main.js:1209-1214`. What is missing is data, in
  `src/data/catalog.json`.
- What a human should settle: whether variants are a product commitment or a nice-to-have. This is
  the one open item whose value depends entirely on an editorial decision nobody has recorded, so
  the score is guessing at the answer.

### Case 3: BL-028 carries the highest Cost of Delay in the backlog and ranks thirteenth

- Stated: P1 Core product value.
- Calculated: WSJF 3.6, rank 13 of 26, despite a Cost of Delay of 18, which is the highest of any
  item here.
- Driver: job size 5 alone. Every item above it has a smaller Cost of Delay.
- What a human should settle: whether a measured 93 pixel horizontal overflow at 320 pixels, plus
  row actions that only appear on hover, plus a mobile layout that has never once shipped because
  its rule is dead, together constitute a P0. Evidence: `docs/ux-artifacts/viewport-sweep-reading.json`,
  `src/styles.css:369-376`, `src/styles.css:81-84`. The original document's own framing supports
  raising it: it describes reading "beside Marvel Unlimited", which is a phone-and-tablet posture.

### Case 4: nine items created this pass outrank the only open P0 story

- Stated: nothing. These items have no label because none was ever assigned.
- Calculated: BL-030, BL-029, BL-039, BL-044, BL-048, BL-040, BL-043, BL-035 and BL-047 all rank
  above BL-026.
- Driver: seven of the nine are sized 1 or 2. They are small, evidenced defects and enablers, and
  WSJF rewards exactly that shape.
- What a human should settle: whether an unlabelled item is allowed to precede a P0 at all. If the
  release labels are a gate rather than a sort, then this whole group is blocked behind BL-026, and
  the ranking below the gate is what WSJF is actually for.

### Where the label and the score agree

- BL-014, P1, rank 15 of 26. Mid-table, which is where a P1 belongs.
- BL-027, P1, rank 11 of 26. Mid-table.
- BL-017, P2, rank 25 of 26. The lowest-ranked scored story other than the one that cannot be
  sized, which matches its P2 label exactly.
- BL-025, P2, parked. The label is moot, because the item was removed by the constraint gate before
  it could be scored.

### One caution about the score itself

BL-042 carries a risk-reduction score of 8, joint highest in the backlog alongside BL-039 and
BL-041, and still ranks last at 0.55. That is entirely the size 20 denominator. The rank is
arithmetically correct and practically misleading: the item is not low value, it is unsplit. It is
held at `Proposed` rather than `Ready` for that reason, and the honest reading of its rank is
"cannot be scheduled yet", not "not worth doing".
