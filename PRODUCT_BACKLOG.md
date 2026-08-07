# Marvel Reading Tracker Expansion Backlog

This backlog describes the next product improvements in plain English. It is intended
for review before implementation. The goal is to make the tracker useful for many
Marvel reading lists and events, not only Jonathan Hickman's Secret Wars orders.

It was rewritten after a full pass over the shipped code, so it now records what has already been
built as well as what has not. Of the 28 stories originally written here, 24 ship in full, 1 ships
in part, 1 was never started, 1 is ruled out by a product constraint, and 1 is dropped by a product
decision. The new items come from that same pass and from the UX study in `docs/UX_STUDY.md`.

Thirty items have since been delivered and are marked `Shipped` in the table below: BL-014,
BL-026, BL-027, BL-029, BL-030, BL-031, BL-034, BL-035, BL-037, BL-039, BL-040, BL-043, BL-044,
BL-045, BL-046, BL-047, BL-048, BL-049, BL-050, BL-051, BL-052, BL-053, BL-054, BL-055, BL-056,
BL-057, BL-058, BL-059, BL-061 and BL-062.
Their detail blocks record what changed, what was measured, and which tasks were deliberately left
open. BL-049 is the one
whose delivery was a decision rather than a code change: it was measured in full and closed
without touching the colours, for the reasons recorded in its block. Six remain open on
purpose: making the CI run required before merge is a repository setting rather than a change to
the tree, tagging a release needs a commit to point at, confirming BL-027 with a screen reader
is a human check no automated run substitutes for, BL-031's axe re-run cannot be satisfied as
written, because axe declines to judge text over a gradient and the finding was answered by
computing the contrast bound instead, BL-037's URL task is conditional on BL-036 and would mean
inventing the scheme that item exists to decide, and BL-051's README walkthrough has to be done by
someone who does not write software, which is the one thing its author cannot self-certify.
`CHANGELOG.md` carries the
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
  input method and the cost of working through a long list. Screen size is deliberately not in
  scope; see the out-of-scope list and BL-028. Epics EP-07, EP-08, EP-09.
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
| 1.1 | BL-001 | P0 | catalogRow renders name, type, count and description at `src/js/main.js:2200-2230` | Done |
| 1.2 | BL-002 | P0 | catalog filter fieldset at `src/index.html:370-372`, filterByFacet imported at `src/js/main.js:16` | Done |
| 1.3 | BL-003 | P1 | search form at `src/index.html:363-369`, search-as-you-type at `src/js/main.js:2258-2273` | Done |
| 1.4 | BL-004 | P1 | depth pill rendered before the Import button at `src/js/main.js:2204` and `src/js/main.js:2213-2218` | Done |
| 2.1 | BL-005 | P0 | all five named events ship as data: `src/data/house_of_m.json`, `src/data/civil_war.json`, `src/data/secret_invasion.json`, `src/data/annihilation.json`, `src/data/king_in_black.json` | Done |
| 2.2 | BL-006 | P0 | attributionLine renders source and snapshot date at `src/js/main.js:2236-2256` | Done |
| 2.3 | BL-007 | P1 | grouping and variant labelling exist at `src/js/main.js:2183` and `src/js/main.js:2213-2218`, but only the Hickman creator run populates `group` and `variant` in `src/data/catalog.json`; all six event lists carry null | Partial |
| 2.4 | BL-008 | P1 | orders and catalog generated by `scripts/vendor-orders.mjs:185-285`, consumed as data with no view change | Done |
| 3.1 | BL-009 | P0 | parseChecklist and the import report at `src/js/main.js:1904-1957`, `src/js/lib/markdown.js:36-99` | Done |
| 3.2 | BL-010 | P1 | unresolvedRow offers search, auto-accepts a unique exact match, else lists candidates with series and date at `src/js/main.js:1965-2034` | Done |
| 3.3 | BL-011 | P1 | series and creator adds at `src/js/main.js:1866-1884`, manual issue add at `src/js/main.js:2036-2080` | Done |
| 3.4 | BL-012 | P2 | duplicate at `src/js/main.js:1207-1227`, with read progress deliberately shared rather than copied per `src/js/lib/model.js:143` | Done |
| 4.1 | BL-013 | P0 | renderRail marks the active list with `aria-current` and a progress bar at `src/js/main.js:658-698` | Done |
| 4.2 | BL-014 | P1 | the progress view is scoped to the active list at `src/js/main.js:2435-2469`, with a scope control at `src/index.html:348-352` and a subtitle that stops claiming every list at `src/js/main.js:2449-2451` | Done, shipped as BL-014 |
| 4.3 | BL-015 | P1 | all four named filters plus All at `src/js/lib/readingFilters.js:25-48`, applied without touching stored order at `src/js/main.js:1510` | Done |
| 4.4 | BL-016 | P1 | hero next-unread and Done, next at `src/index.html:272-307` | Done |
| 4.5 | BL-017 | P2 | `absent: note\|notes, grep across src/**/*.js returning only an unrelated shelf caption and a code comment` | Not started |
| 5.1 | BL-018 | P0 | pending and by-hand badges at `src/js/main.js:1562-1568`, pending filter at `src/js/lib/readingFilters.js:46` | Done |
| 5.2 | BL-019 | P1 | five-state availability model at `src/js/lib/availability.js:17-23`, hedged short labels at `src/js/main.js:1598-1603` | Done |
| 5.3 | BL-020 | P1 | manual entries carry `source: 'manual'` at `src/js/main.js:2059` and render, reorder, export and back up like any other issue | Done |
| 5.4 | BL-021 | P2 | `scripts/check-contract.mjs:248-280` runs a set of upstream assumptions and exits non-zero when any has drifted, wired as `npm run contract` at `package.json:13` | Done |
| 6.1 | BL-022 | P0 | validated backup shape at `src/js/lib/model.js:486-510` | Done |
| 6.2 | BL-023 | P1 | same backup file restores on another browser, validated and atomic, with undo at `src/js/main.js:2514-2520` | Done |
| 6.3 | BL-024 | P1 | Export as Markdown ships as a list tool, confirmed in the live DOM at `docs/ux-artifacts/viewport-sweep-reading.json` | Done |
| 6.4 | BL-025 | P2 | not applicable. Ruled out by Repository Constraint 3, which forbids accounts and cloud services, and already listed as out of scope at the end of this document | Forbidden, Constraint 3 |
| 7.1 | BL-026 | P0 | focus order and visible focus pass across 45 measured tab stops in `docs/ux-artifacts/live-inspection.json`, and the shortcut handler now stands down for text entry and for an open dialog at `src/js/main.js:1613-1636` | Done, shipped as BL-026 |
| 7.2 | BL-027 | P1 | announcements fired into two live regions at once and the first-run heading was empty per `docs/ux-artifacts/pa11y-landing.json`; both are fixed, and `notify` now picks one channel at `src/js/main.js:223-236` and `src/js/main.js:325-346` | Done, shipped as BL-027 |
| 7.3 | BL-028 | P1 | the mobile rail rule at `src/styles.css:87-90` is overridden by `src/styles.css:94-98`, and the reading view overflows by 93 px at 320 px per `docs/ux-artifacts/viewport-sweep-reading.json` | Dropped, product decision |

### Orientation disagreements

Three quantities used to brief this pass disagreed with what the repository actually contains. They
are recorded rather than inherited.

* `src/js/main.js` is 1,566 lines, not 1,543, by `(Get-Content).Count` and confirmed by the last
  line number when reading the file. Evidence: `src/js/main.js:2630-2643`. The work shipped since has
  taken it to 2,698; 1,566 is the figure as audited.
* `src/js/ui/` does not exist in this worktree. Evidence: `absent: src/js/ui, Test-Path returning
  False and a recursive directory listing of src/`. Git cannot track an empty directory, so an
  empty `src/js/ui/` in another checkout is a local artifact rather than repository content. Either
  way the conclusion is the same: there is no view layer to put components in.
* The test count is 224 passing, not the 119 recorded in `.copilot-tracking/changes/`. Evidence:
  `package.json:10`, and a full run of `npm test`. The items shipped in this pass have since taken
  it to 311; 224 is the figure as audited.

Each of those drift clauses is a live number in a record that is otherwise fixed, so it has to be
re-derived whenever this section is touched rather than carried forward. That is not a general
caution: the test figure was written as 235 when nine items had shipped and was still reading 235
after twelve more had, and the line count had no clause at all while the file grew by 997 lines,
which is what BL-055 was filed for.

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
| BL-030 | Stop dimming read rows with a blanket opacity | Defect | EP-08 | Leaves alone | 5 | 3 | 2 | 1 | 10.0 | none | Measured | Shipped | src/styles.css:409-418 |
| BL-029 | Raise the red accent so white text on it clears 4.5:1 | Defect | EP-08 | Leaves alone | 8 | 5 | 3 | 2 | 8.0 | none | Measured | Shipped | src/styles.css:20-29 |
| BL-039 | Run the test suite automatically on every change | Enabler | EP-12 | Leaves alone | 5 | 3 | 8 | 2 | 8.0 | none | Observed | Shipped | absent: .github/workflows, directory listing of repository root and .github |
| BL-050 | Fail the build when an evidence anchor stops naming the code it claims | Enabler | EP-12 | Leaves alone | 5 | 3 | 8 | 2 | 8.0 | none | Measured | Shipped | absent: any check of anchor identity, read of .github/workflows/ci.yml and the package.json scripts block |
| BL-044 | Send a content security policy and frame options from the dev server | Enabler | EP-12 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | server.mjs:112-122 |
| BL-048 | Correct the availability comment that names four states | Debt | EP-05 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | src/js/lib/availability.js:10 |
| BL-040 | Add a linter and formatter | Chore | EP-12 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | absent: eslint or prettier config or lint script, read of package.json:8-17 and glob of repository root |
| BL-043 | Give releases a version, a tag and a changelog | Chore | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Observed | Shipped | package.json:3 |
| BL-055 | Record the drift in the audited figures instead of letting them go stale | Debt | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Shipped | PRODUCT_BACKLOG.md:151-153 |
| BL-059 | Stop the changelog entry that explains stale figures from carrying two of its own | Debt | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Shipped | absent: any current line count or test count in the entry, read of the audited-figures entry in CHANGELOG.md |
| BL-057 | Write the detail block BL-050 never got, which two sentences promise a reader | Debt | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Shipped | absent: any **BL-050:** block, enumeration of every bold BL heading against every table row |
| BL-056 | Fail the build when a derived count in the backlog disagrees with the table it is derived from | Enabler | EP-12 | Leaves alone | 3 | 1 | 5 | 2 | 4.5 | none | Measured | Shipped | absent: any recomputation of a stated count, read of the package.json scripts block and .github/workflows/ci.yml |
| BL-035 | Offer an undo after a list is deleted | Story | EP-11 | Leaves alone | 5 | 2 | 5 | 3 | 4.0 | none | Observed | Shipped | src/js/main.js:1293-1320 |
| BL-047 | Split the two meanings of the row class | Debt | EP-12 | Leaves alone | 1 | 1 | 2 | 1 | 4.0 | none | Observed | Shipped | src/styles.css:496-512 |
| BL-049 | Decide whether the faint badge borders need to meet the 3:1 non-text minimum | Defect | EP-08 | Leaves alone | 1 | 1 | 2 | 1 | 4.0 | none | Measured | Shipped | src/styles.css:464 |
| BL-061 | Take the two em dashes out of the copy the app puts on screen | Chore | EP-12 | Leaves alone | 2 | 1 | 1 | 1 | 4.0 | none | Measured | Shipped | eslint.config.mjs:56-67 |
| BL-026 | Make every action reachable and repeatable from the keyboard | Story | EP-07 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | P0 | Measured | Shipped | src/js/lib/shortcuts.js:26-60 |
| BL-027 | Announce each change once, in a way a screen reader can use | Story | EP-07 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | P1 | Measured | Shipped | src/js/main.js:325-346 |
| BL-031 | Put a scrim behind hero text so its contrast stops depending on the cover | Defect | EP-08 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | none | Measured | Shipped | src/index.html:272-307 |
| BL-051 | Make the README enough for a non-engineer to run the app | Chore | EP-12 | Leaves alone | 3 | 1 | 3 | 2 | 3.5 | none | Observed | Shipped | absent: any address, prerequisite, success indicator or troubleshooting section in README.md, read of README.md and a literal run of npm start in a fresh clone |
| BL-045 | Move the API base URL check into the client that uses it | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Observed | Shipped | src/js/api.js:20-33 |
| BL-063 | Extend the Constraint 11 check past JavaScript to the page and its styling | Chore | EP-12 | Leaves alone | 2 | 1 | 1 | 2 | 2.0 | none | Measured | Ready | eslint.config.mjs:93-97 |
| BL-062 | Delete the paragraph that BL-054's block states twice over | Debt | EP-12 | Leaves alone | 1 | 1 | 1 | 1 | 3.0 | none | Measured | Shipped | scripts/check-counts.mjs:320-341 |
| BL-014 | Count series progress for the list being read | Story | EP-04 | Leaves alone | 5 | 2 | 2 | 3 | 3.0 | P1 | Observed | Shipped | src/js/main.js:2435-2469 |
| BL-034 | Replace the native dialogs with the app's own notice system | Debt | EP-11 | Leaves alone | 3 | 2 | 3 | 3 | 2.67 | none | Observed | Shipped | src/js/ask.js:32-44 |
| BL-054 | Put focus back where it was when the shelf and the full order rebuild | Debt | EP-07 | Leaves alone | 3 | 2 | 3 | 3 | 2.67 | none | Measured | Shipped | src/js/main.js:204 |
| BL-058 | Keep focus on the home grid and the rail when their lists rebuild | Debt | EP-07 | Leaves alone | 3 | 2 | 3 | 3 | 2.67 | none | Measured | Shipped | absent: any capture of the focused control before importCurated disables it, read of addFromCatalog and renderRail |
| BL-037 | Keep the chosen filter across a reload | Story | EP-10 | Leaves alone | 3 | 1 | 1 | 2 | 2.5 | none | Observed | Shipped | src/js/main.js:76 |
| BL-038 | Build the two Library sub-views the adopted design specified | Story | EP-10 | Leaves alone | 3 | 1 | 2 | 3 | 2.0 | none | Observed | Ready | design/mockups/5-longbox-focus.html:169-172 |
| BL-046 | Share the retry and backoff between the two vendor scripts | Debt | EP-12 | Leaves alone | 1 | 1 | 2 | 2 | 2.0 | none | Observed | Shipped | scripts/lib/fetch-json.mjs:52-61 |
| BL-053 | Make the reading filters one list rather than two that must agree | Debt | EP-12 | Leaves alone | 1 | 1 | 2 | 2 | 2.0 | none | Observed | Shipped | src/js/lib/readingFilters.js:25-48 |
| BL-041 | Cover the three browser-coupled modules with tests | Enabler | EP-12 | Leaves alone | 3 | 2 | 8 | 8 | 1.63 | none | Observed | Ready | absent: test/cache.test.js and test/hydrate.test.js and test/main.test.js, glob of test/ cross-checked against src/js |
| BL-052 | Make the contributor sections of the README readable at the same standard | Chore | EP-12 | Leaves alone | 1 | 1 | 1 | 2 | 1.5 | none | Observed | Shipped | absent: any sentence-length or vocabulary standard applied to README.md below the contributor heading, read of README.md |
| BL-033 | Re-render only what changed when an issue is marked read | Debt | EP-09 | Leaves alone | 5 | 2 | 5 | 8 | 1.5 | none | Measured | Ready | src/js/main.js:2630-2642 |
| BL-007 | Give the event orders the variants the catalog can already carry | Story | EP-02 | Leaves alone | 3 | 2 | 2 | 5 | 1.4 | P1 | Observed | Ready | src/data/catalog.json |
| BL-032 | Offer a light theme and follow the system preference | Story | EP-08 | Leaves alone | 3 | 2 | 2 | 5 | 1.4 | none | Measured | Ready | src/styles.css:7 |
| BL-036 | Make the current view and list addressable in the URL | Story | EP-10 | Leaves alone | 5 | 2 | 3 | 8 | 1.25 | none | Observed | Ready | absent: pushState or replaceState or location.hash or hashchange or popstate or history., grep across src/ |
| BL-017 | Let a reader keep notes on a list or an issue | Story | EP-04 | Leaves alone | 2 | 1 | 1 | 5 | 0.8 | P2 | Observed | Ready | absent: note or notes, grep across src/**/*.js |
| BL-042 | Break the single view file into per-view modules | Debt | EP-12 | Leaves alone | 2 | 1 | 8 | 20 | 0.55 | none | Measured | Proposed | src/js/main.js:2630-2642 |

### Parked

| ID | Title | Type | Epic | Relationship | V | TC | RE | Size | WSJF | P | Basis | Status | Evidence |
|----|-------|------|------|--------------|---|----|----|------|------|---|-------|--------|----------|
| BL-025 | Optional synchronization between devices | Story | EP-06 | Leaves alone | not scored | not scored | not scored | not scored | not scored | P2 | Observed | Dropped | PRODUCT_BACKLOG.md, out-of-scope list |
| BL-028 | Make the reading view usable on a phone | Story | EP-07 | Leaves alone | 8 | 5 | 5 | 5 | 3.6 | P1 | Measured | Dropped | src/styles.css:87-90 |
| BL-060 | Commit the prompt that is the only source of the eleven Repository Constraints | Enabler | EP-12 | Leaves alone | 5 | 5 | 8 | 3 | 6.0 | none | Measured | Dropped | absent: .github/prompts/product-backlog-ux-study.prompt.md from git ls-files, enumeration of tracked markdown against the working tree |

**BL-025: Optional synchronization between devices**

Parked reason: Breaches Constraint 3.

Repository Constraint 3 forbids accounts, cloud services, analytics and telemetry, because the
product promise is that nothing is uploaded anywhere. The story's own hedge, that sync would be
opt-in and would not change local-only behaviour for those who decline, does not clear the
constraint: the moment a sync service exists, the promise becomes conditional rather than
structural. The gate ran before scoring, so no score was assigned. The reader-facing need behind
it, moving progress between machines, is already met by BL-023 through export and restore, which
ships today.

**BL-028: Make the reading view usable on a phone**

Parked reason: The phone and tablet job is already done better by Marvel's own app.

Marvel Unlimited ships native iOS and Android apps that carry reading lists, so a reader on a
phone or a tablet has a first-party way to keep their place that this tracker cannot improve on.
Building a second, worse one here would spend the backlog's largest Cost of Delay on a job that is
not ours. The tracker's posture is now stated rather than implied: it is a desktop companion open
beside the Marvel Unlimited web reader, which is the platform where no list feature exists. Phone
and tablet layout is on the out-of-scope list for the same reason.

Unlike BL-025 this item was scored before it was parked, so its numbers are left in the row above
as the record of what was given up. Its five tasks are withdrawn, not deferred, and no constraint
was breached: this is a product decision. The four UX findings that fed it, UX-A-004, UX-A-005,
UX-D-001 and UX-D-002, still point here from `docs/UX_STUDY.md`, and they are now accepted rather
than open. Two of the four are worth re-reading if the posture ever changes, because they are not
purely about width: UX-A-005 hides six controls per row behind `:hover`, which also strands a
desktop touchscreen, and UX-D-001 leaves a dead media query in the stylesheet that will mislead
the next person to read it.

**BL-060: Commit the prompt that is the only source of the eleven Repository Constraints**

Parked reason: the prompt was written for a single session's task and is not a document the
repository needs to keep.

Filed out of the recovery of Constraints 8 and 9. The eleven Repository Constraints that every gate
line in this document is checked against were never committed. They survive in a prompt file sitting
untracked in the working tree, and the two numbers that had been given up for lost were recovered
from it rather than from anything in git. The list is now written into the constraint table in
`.github/copilot-instructions.md`, so the constraints themselves are durable. Their source is still
one `git clean` from gone, and the decision here is that this is acceptable.

The judgement that parks it is the owner's, on 2026-08-07: the prompt drove one session's backlog
and UX study pass, and a spent instruction to an agent is not an artifact the repository owes
anybody. What had to be preserved was the eleven constraints themselves, and that already happened
when they were recovered verbatim into the constraint table. The prompt's remaining value is
provenance, which the table now records in prose instead.

Its three tasks are withdrawn, not deferred, and no constraint was breached: like BL-028, this is a
product decision rather than a gate result. Its numbers are left in the row above as the record of
what was given up.

The cost of doing it is worth keeping, because it is the reason this was never a one-line addition.
The prompt carries three citation-shaped strings inside worked examples of the schema, and the gate
collects the unbackticked form, so committing it as it stands enrolls three anchors that were never
claims. One of them is already false: the example places `renderCatalog` at lines 1116 to 1160, and
that function is at `src/js/main.js:2114` today, with the rename-list handler occupying the lines the
example names. Blessing that would lock in a fingerprint asserting something the code does not say,
which is the exact failure the anchors gate exists to end. The declared `absent:` exemption does not
reach these, since they are neither absent-markers nor marker-led table cells. So the gate would have
needed the notion of a historical document before the file could land, and that notion now has no
caller. It is not built.

**Parking it repaired two things its filing had broken**, which is recorded because neither was
noticed when the item was created. Appendix B states five ranks "of 36", and those five are correct
only with BL-060 excluded from the table; filing it at rank 5 had silently made all five wrong, and
removing it makes them right again without any of them being edited. Appendix B also says the highest
Cost of Delay among the items that remain is 16, which was false while BL-060 sat in the table
carrying 18. Both were checked by deriving the ranks and the Cost of Delay from the table rather than
by reading them, and both are true again as of this change.

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

- [x] Give `seriesProgress` a list scope while keeping the cross-list total available
- [x] Show the per-list breakdown in the progress view for the active list
- [x] Update the view subtitle, which currently states the count spans every list
- [x] Keep the global unique-issue count reachable, since sharing read state across lists is deliberate

Shipped. `seriesProgress` takes an optional list id at `src/js/lib/model.js:350-361`; omitting it
keeps the cross-list aggregate the old callers relied on, so the global unique-issue count is a call
away rather than gone. The progress view gained a two-option scope control at
`src/index.html:348-352`, matching the reading filter's fieldset pattern rather than inventing a
second idiom, and the subtitle at `src/index.html:346` is now written by the render at
`src/js/main.js:2449-2451` instead of asserting "every list" whatever is being counted.

The scope is deliberately not persisted, which is the opposite of the decision BL-037 made for the
reading filter. That filter is a lens on one long order a reader returns to over days; this one is
answered by whichever list they are reading now, so the active list is the right default every time
the view opens.

The case worth naming is no active list. `state.active` is null only when no list exists at all:
`deleteList` falls back to the first surviving list at `src/js/lib/model.js:192` and load normalises
a stale id at `src/js/lib/model.js:476`, so the two cannot come apart. That invariant also rules out
the obvious justification for the fallback: it is not there to avoid an empty view, because with no
list the global count renders "Nothing tracked yet." as well. It is there because the subtitle names
the list, so scoping without one would dereference it. The whole fieldset is hidden in that state,
which is what `#home-chips` and `#catalog-filters` already do when there is nothing to filter.
Disabling the "This list" radio was the first attempt and was wrong: `.fp` paints the adjacent span
and the stylesheet carries no `:disabled` rule for it, so the chip rendered identically to a live
one, hover lift included.

Verified: 285 unit tests pass, 4 of them covering `seriesProgress`, and 3 of those 4 fail when the
list argument is made inert, the remaining one being a pre-existing guard on cross-list uniqueness.
11 browser checks in Edge cover both scopes, the switch between them, re-scoping when the active
list changes, the no-list fallback and the return from it. They were checked against six mutations
of the shipped tree rather than against the pre-change tree, where the selectors are simply absent
and every assertion fails trivially: making the scoping inert while leaving the markup intact fails
checks 4 and 7, never hiding the fieldset fails 9, deleting the hide outright fails 9, inverting it
fails 3, 9 and 11, never naming the list in the subtitle fails 2 and 7, and scoping to a list that
does not exist fails 8 and 10. Every mutation is caught. Checks 1, 5 and 6 are caught by none of
them and are recorded as regression guards on the return path rather than counted as evidence they
are not: with the scope inert the two counts are equal, so 6 cannot tell them apart.

Constraint gate: checked 1 to 11, none breached. Constraint 4 was the live consideration: the scope
control is two static radio inputs and a text assignment, so no rendering library was reached for.
Constraint 10 holds, because scoping to the list in front of one reader is not segmentation.

**BL-017: Let a reader keep notes on a list or an issue**

- [ ] Add an optional note field to the list and issue shapes behind a schema migration
- [ ] Include notes in backup, restore and Markdown export
- [ ] Provide an edit affordance that does not crowd the row
- [ ] Add tests covering migration from a state with no notes

Constraint gate: checked 1 to 11, none breached. Constraint 3 was the live consideration and is
satisfied, because notes stay in local storage and travel only inside the user's own backup file.

**BL-026: Make every action reachable and repeatable from the keyboard**

- [x] Narrow the shortcut guard so it excludes text entry rather than every interactive element
- [x] Decide where focus lands after Done, next, so the shortcut stays live
- [x] Add a shortcut reference to the About view as the single maintained list
- [x] Re-run the tab-ring walk and confirm focus order, visible focus and no trap still hold

Constraint gate: checked 1 to 11, none breached. Constraint 7 was the live consideration: focus
handling after the read action must not delay or wrap the `window.open` call, because losing user
activation is what gets the reader tab blocked.

Shipped. The guard asked whether the focused element was interactive, which is the wrong question.
A focused button does nothing with D, so refusing D there took the shortcut away and bought
nothing. The two questions that decide it are separate and are now asked separately at
`src/js/lib/shortcuts.js:26-60`: does the control consume typed characters, and would the browser
itself act on this key. Only the first silences a shortcut outright, and the second is asked of
Enter alone.

The reason this mattered is that the reading view's own furniture was the trap. Clicking the "Done,
next" button leaves it focused, so the D the hero advertises died on the very next press, silently
and for the rest of the session. The five filter radios and the "Show the full order" summary did
the same. Measured in Edge against a seeded House of M list: with the old guard, D after clicking
that button leaves 19 unread; with the new one it goes to 18, and again to 17 on shift-D.

Enter is still left alone wherever the browser would act on it, so one press never becomes two
actions. Confirmed rather than assumed: with the button focused, Enter marks read and calls
`window.open` zero times, and on the summary it toggles the disclosure and calls it zero times,
while with nothing focused it opens the reader exactly once. Constraint 7 is untouched, because
nothing was added between the key press and the call; the focus move happens after the state
write, and the read path was not edited at all.

Focus after Done, next needed a decision only at the end of an order. While issues remain, the
hero's buttons are static markup that the re-render leaves in place, so focus is kept and the
shortcut stays live without moving anything. Finishing the order hides the whole hero, which drops
the focused button out of the document and sends focus to the top of the page with nothing
announced. It now lands on the all-read heading at `src/index.html:310`, which is both what the
reader needs to hear and where the remaining actions are.

The About view carries the shortcut reference at `src/index.html:554-561`, naming all three
bindings. Only two of them were advertised in the interface, on the hero's `kbd` hints; `Ctrl` +
`\` for the sidebar was written into the toggle button's tooltip at `src/js/main.js:504` and
nowhere else, which asks for a deliberate hover on a pointer and shows nothing at all on a touch
screen. The hero's hints stay, because they are the discoverable spot for a first-time reader, but
About is now the maintained list.

Review of this change found that `D` still fired from behind an open modal: `showModal()` makes the
rest of the document inert, but a keydown inside the dialog still bubbles to the document handler
and the view behind the backdrop is still the reading view. Measured in Edge with the "Delete list?"
prompt open and focus on its Cancel button, unread went from 20 to 19, a persisted write the reader
never asked for. The old blanket guard had been blocking this by accident, because Cancel is a
`button`. Asking the narrower question reopened it, so `wireShortcuts` now bails on any open dialog.

Seventy-seven assertions across two harnesses. Seventeen unit tests make 52 of them about the
predicate alone, and 33 mutations of it are all caught, including one that reinstates the original
blanket guard and fifteen that delete a single member from one of the two type sets. Twenty-five
browser checks cover the behaviour the unit tests cannot reach; eight of them fail against the
pre-change tree, which is what makes them evidence rather than decoration. The modal check is a
ninth, and a different shape: it passes against the pre-change tree, for the accidental reason
above, and fails against the first draft of this change, which is the only tree it could have
caught. The rest are regression guards that pass either way, the tab-ring walk among them: 142
stops, every one with a visible focus ring, focus order strictly following document order, no stop
visited twice and the reverse walk escaping cleanly. That walk is deliberately not offered as proof
of the fix, since the ring was never the defect. The walk is measured with the order part read and
without navigating away and back first, both of which change the ring: an earlier draft of the modal
check made that round trip and the count moved to 151.

**BL-027: Announce each change once, in a way a screen reader can use**

- [x] Choose one announcement channel per message and stop double-writing
- [x] Keep the dedicated announcer for events with no visible surface
- [x] Remove the empty first-run heading, or give the empty state real heading text
- [x] Move the availability description out of the `title` attribute into associated text
- [ ] Verify with a screen reader, which no automated run substitutes for

Constraint gate: checked 1 to 11, none breached. Constraint 6 was the live consideration: the
availability description must keep all five states distinct and must never assert that an issue is
available.

Shipped, with the last task deliberately left open. The double-speak was not two announcers but
one message written into a container that was itself a live region and then copied to
`#announcer`, so six result panes read their whole contents aloud and then read the summary.
Which channel to use is now decided by reading the container at `src/js/main.js:229-236` rather
than from a list of ids, so marking something live later cannot quietly reintroduce it. The six
panes lost `aria-live`; `#announcer`, `#save-report` and `#blocked-banner` keep theirs, and
`isLive` correctly leaves those alone. Measured in Edge on a first run with storage cleared,
speaking surfaces went from 9 to 3.

The empty heading was three headings, not one. `#chero-h` is the one `pa11y-landing.json` caught,
and it also names its section through `aria-labelledby`, so empty it cost the section its name
too. `#hero-title` and `#preview-h` fail the same way and were missed because both sit in
containers that are hidden until used, which axe skips and HTML_CodeSniffer does not. All three
now carry text in the markup and are put back by their render functions, so they are never empty
in the document rather than merely never seen. Measured empty headings went from 3 to 0.

The availability wording moved from `title` into a `visually-hidden` span inside the badge at
`src/js/main.js:1558-1568`, along with the pending badge's. A `title` is unreachable by touch and
skipped by several screen readers, and it was the only place the hedge behind a two-word badge
was written down, so "Not in Unlimited" read as a fact rather than as what the snapshot shows.
`describe()` is called unchanged, so all five states stay distinct and none asserts availability.

A screen reader run is still owed. Nothing automated here substitutes for it, and the numbers
above measure what the document exposes, not what a reader hears.

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
text, at `src/styles.css:20-29`. The `kbd` tint was removed at `src/styles.css:346` and the
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
strikethrough, at `src/styles.css:415-416`; the strikethrough is the non-colour indicator. The
only opacity left on a read row is the cover image at `src/styles.css:418`, which carries no
text. Verified with six rows actually in the read state rather than by reading the stylesheet:
every descendant now computes `opacity: 1`, and axe-core 4.13.0 reported 0 contrast violations.

On the badge check, the 2.75:1 figure this task was written against was the opacity multiplying
the badge, and that cause is gone: a badge now renders identically whether or not its row is
read, which is what the task was asking for. Measuring the composited border anyway put
`.badge-expected` at 1.58:1, but that is unconditional design at `src/styles.css:464` rather than
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
top stop was raised from 60 to 88 percent alpha at `src/styles.css:288-295`. The spread collapsed
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

- [x] Replace `prompt()` for list naming with an in-page control
- [x] Replace `confirm()` for destructive actions with an in-page confirmation in the app, leaving
      the `dev-faults.html` harness on native dialogs
- [x] Route curated import failures through `notify()` like every other path
- [x] Report into a pane the reader can actually see, not one fixed at call time
- [x] Make sure the replacements are announced once, in step with BL-027

Constraint gate: checked 1 to 11, none breached. Constraint 11 applies to the new copy, which must
carry no em dashes.

Shipped. One `<dialog>` at `src/js/ask.js:48-80` answers every question, because the focus trap,
the Escape key and returning focus to whatever opened it are the browser's job, which is the same
reason the curated-order preview is built this way. `askConfirm` and `askText` wrap it, and the
five callers that used to reach for a native dialog now await one of those two.

The close listener is registered once at start-up rather than per question, at
`src/js/ask.js:32-44`. Per-question listeners let a question answered twice, by submitting as
Escape is pressed, resolve twice. The typed value is read while the dialog is closing rather than
by the caller after it has awaited, because the field is shared and the next question would
otherwise be able to overwrite an answer that had not been read yet.

`returnValue` is cleared on open rather than trusted to be empty. Escape closes a dialog without
touching `returnValue` in browsers that predate the change making it `""`, so a question answered
with Escape would inherit the `ok` left behind by the last question that was confirmed, which
turns a cancelled deletion into a deletion. Measured in Edge: cancelling a rename after a
confirmed one leaves the name alone, and cancelling a delete keeps the list.

The three `alert()` calls in `importCurated` became `notify()` against a caller-supplied pane, so
a failure on the landing page lands in `#home-cat-report` beside the catalog rather than stopping
the page. A stale failure is cleared on success, because a previous error sitting under a
successful import contradicts it.

A pane only replaces `alert()` if the reader can see it, and `alert()` could not be missed. Three
ways the named pane went unseen were measured with an import in flight: switching view left the
message in a hidden one, so nothing appeared at all; the preview dialog being still open put the
pane behind its backdrop and outside the top layer; and a scrolled grid left it 87px above the
viewport.

Which pane can be seen is not fixed at the moment a message is written. The failure is usually
written before the reader navigates, not after, and a 219-issue order makes that window real. So an
outstanding notice is kept as a record at `src/js/main.js:260` rather than only as a paragraph in
the page, and `placeNotices()` at `src/js/main.js:269-307` renders every outstanding record into
the pane that is visible now, on every view change and when the preview dialog closes. `notify()`
then scrolls the chosen pane into view with `block: 'nearest'`, which is a no-op when it is already
visible.

Moving the paragraph between panes was tried first and produced three separate defects: a copy was
left behind in the pane the message started in, so one message appeared twice on one screen; a
notice outlived the condition it described and stayed pinned above every view; and with two
messages outstanding the one kept was whichever pane came first in the markup rather than the newer
one. Rendering from the record fixes all three, because insertion order decides which message wins
a shared pane and clearing is by condition rather than by DOM location.

That needs somewhere to render into. Five of the seven views carry no notice pane of their own, so
`#app-report` sits above every view and is the destination when a message's own pane is not
showing. It is deliberately not a live region: the message was already announced once when it was
written, and re-rendering it into an assertive region would say it a second time, which is the
double-speak BL-027 removed. `placeNotices()` also drops the shared copy when the same sentence is
already readable in a view's own pane, since the same text twice on one screen is the visual form
of that double-speak.

A notice is cleared by condition, not by pane. The catalog is loaded once and shown in two views,
so a load failure written into the landing page's pane is the same failure the catalog view would
report. Both sites key it `catalog-load` at `src/js/main.js:241`, and both success paths clear that
key, which is what stops a loaded catalog from appearing under a banner saying it could not be
loaded.

A curated import is keyed the same way, by the order rather than by the pane, at
`src/js/main.js:2338`. The same order can be added from the landing page and imported from the
catalog row, so keying by pane meant a success from one entry point left the other's failure
outstanding. Measured in both directions: the reader ended up looking at the card flipped to "In
library" and the list in the sidebar at `0 / 89`, under a banner saying it could not be loaded and
that their lists were unchanged, pinned above every view for the rest of the session and announced
as well.

Only panes carrying `report` are placed this way. `#save-report` is above every view and assertive
because a persistence failure must not be missed, and the result panes are read next to the form
that filled them, so relocating either would strip the context that makes the message actionable.
Without that guard an open dialog captured the storage-full error and the half that says what to do
about it never reached the reader on any channel.

Thirty-nine scenarios are measured in Edge, including every view that has no pane of its own, the
case where a notice already in view must not scroll the page out from under the reader, and each of
the four defects above.

This covers the app pages. `src/dev-faults.js` still uses `confirm()` and `alert()` at
`src/dev-faults.js:184` and `src/dev-faults.js:198`. It is the fault-injection harness behind
`dev-faults.html`, which is not linked from the app, ships no reader-facing flow, and does not load
`main.js`, so it has none of the markup `ask.js` needs. A suppressed dialog there fails safe: the
wipe simply does not run. Converting it would mean giving a developer tool the app's dialog markup
for no reader benefit, so the claim above is about the app, not about every file under `src/`.

`#ask-title` ships with text for the reason BL-027 recorded: a heading counts as empty in the
document whether or not its dialog has been opened, which is exactly how two of that item's three
empty headings went unreported. Measured after this change, empty headings are still 0.

Done here, in BL-035: the undo after a delete, and the wording that goes with it.

**BL-035: Offer an undo after a list is deleted**

- [x] Hold the deleted list in memory for the rest of the session
- [x] Surface an undo affordance in the existing notice system
- [x] Confirm read progress, which is global, is unaffected either way
- [x] Add a test covering delete followed by undo

Constraint gate: checked 1 to 11, none breached. No constraint is engaged; the undo buffer is
in-memory and local.

Shipped. `restoreList` at `src/js/lib/model.js:211-223` puts a list back at the index it held,
because appending it to the end would be a different list order from the one the reader built, and
a rail that silently reorders itself is not an undo. The caller holds both the removed list object
and its index, since `deleteList` is the only thing that knows both and neither survives in the
state afterwards, so the delete handler captures them before the update rather than after.

A list is not restored on top of a live one. The offer is held for the rest of the session, so the
buffer can outlive the deletion by a long way, and there are two ways the thing it points at can
come back on its own: undoing a restore can bring the same id back, and importing the same curated
order again brings the same order back under a new id. `restoreList` refuses both, returning the
state unchanged, because splicing the stale copy in would either overwrite work or leave two lists
answering to one catalog entry. That second state is the one `duplicateList` clears `catalogId` to
avoid at `src/js/lib/model.js:158-161`: "in library" and "Continue reading" would both resolve to
whichever list came first in the rail, and the rail would show two entries with the same name and
the same progress. Both refusals are covered by tests.

The refusals are a backstop rather than the plan. The offer is withdrawn at the moment it stops
making sense: `forgetDeleted()` at `src/js/main.js:1260-1263` runs when the whole state is replaced, by
a backup restore, by undoing one, or by erasing everything, and `forgetDeletedFor()` at
`src/js/main.js:1283-1291` runs when the deleted list's own order is imported again. An offer the reader
can see and press should do what it says, so the case where it cannot is prevented rather than
handled.

Withdrawing it says so, and names both lists. Deleting the list you were reading hands you to the
home view, where the card for that order has already reverted to "+ Add to library", so the wrong
way back and the right one sit on the same screen. A reader who had renamed or reordered their copy
would otherwise press it, be told the order is now in their sidebar, and lose the route back to that
copy in the same tick with nothing said about it. What came back is the order under its own name and
what cannot be put back is their copy, so naming the copy as the thing that returned would report
the loss and deny it in the same breath, and send them looking in the rail for a list that is not
there. The sentence is returned as well as shown, and the caller folds it into the announcement it is
about to make at `src/js/main.js:2395`, because two announcements in one tick leave only the last.

A curated import writes twice, the list record and then its issues, so a failure on the second used
to leave a shell list claiming the catalog entry with no issues in it. That shell then blocked the
undo offer for a deleted copy of the same order, and pressing the button still on screen discarded
the reader's real list in favour of an artefact of a write that failed. Storage being full is the
expected reason to land there, and the issue write is the larger of the two, so the failure now
rolls the half-import back at `src/js/main.js:2363-2374`, leaving nothing behind and the offer still
valid. It also disposes of the empty list this path used to leave in the rail.

Read progress is not a consideration in either direction. It is global and keyed by issue id, so
deleting a list never touched it and restoring one never has to put it back. One of the six new
model tests asserts exactly that, in both directions, because the confirmation copy now promises it.

The offer is held for the session rather than for a few seconds. Deleting the list you were reading
moves you somewhere else, and a timer would take the only way back at the moment the reader was
still deciding whether they wanted it. Only the most recent delete is held: keeping every one would
offer to restore a list the reader has since deliberately replaced, and nothing here can tell those
two cases apart.

`notify` gained an `action` at `src/js/main.js:325`, which puts a button inside the notice rather
than beside it. That is what makes the offer survive: BL-034 renders each outstanding notice from a
record on every view change, so a button held anywhere else would be left behind the first time the
reader moved. It also means the offer is announced with the words that explain it, as
`spoken()` at `src/js/main.js:348-352` appends "Undo delete is available." A button that is never
spoken is a button a screen-reader user cannot know to look for.

A failed undo keeps both the buffer and the button, at `src/js/main.js:1306-1314`. The usual reason
a write fails here is that storage is full, which the reader can act on, so dropping the offer
would turn a recoverable failure into a permanent one. The retry is labelled "Try again" rather
than repeating "Undo delete", since the first attempt visibly did not work.

Erasing everything, restoring a backup and undoing a restore all call `forgetDeleted()`, at
`src/js/main.js:2507`, `src/js/main.js:2507` and `src/js/main.js:2514-2520`. Each replaces the whole
state, so the buffered list belongs to data that is no longer there: putting it back would splice a
list out of one tracker into another, or resurrect one list out of a tracker the reader asked to be
emptied. Undoing a restore is the easiest of the three to miss, because the reader reaches it by
pressing a button labelled undo, but it swaps the state exactly as the restore it reverses did.

A notice carrying a control is the one kind BL-034 does not move into an open dialog, at
`src/js/main.js:277-288`. Moving a message into the modal makes it readable where the reader is
looking, which is the whole point; moving a button there makes it pressable in a context that has
nothing to do with it, and pressing this one navigates to the reading view on a page that is inert
underneath the dialog, so the reader closes the modal onto a view they never asked for.

Twelve scenarios are measured in Edge on top of the fourteen for the dialogs, covering the offer
surviving all six other views with its button still working, the announcement carrying the button,
erasing dropping the offer, a second delete replacing rather than stacking the first, an unrelated
catalog failure and the offer coexisting without destroying each other, and the six cases above:
undoing a restore, re-importing the order, the dialog, the offer still working once the dialog is
closed, the withdrawal being announced rather than silent, and an import whose issue write is made
to fail leaving nothing behind and an offer that still restores the whole list.

**BL-036: Make the current view and list addressable in the URL**

- [ ] Reflect the active view and list in the URL hash
- [ ] Restore view and list from the hash on load
- [ ] Handle the browser Back and Forward buttons
- [ ] Confirm an unknown or stale hash falls back safely

Constraint gate: checked 1 to 11, none breached. Constraint 5 was the live consideration and is the
reason this uses the hash rather than anything that could alter the origin: the storage bucket must
stay bound to `127.0.0.1:8787`.

**BL-037: Keep the chosen filter across a reload**

- [x] Persist the filter with the reader's other settings
- [x] Restore it on load, defaulting to All when absent or unrecognised
- [x] Decide whether the filter is per list or global and state the choice
- [ ] Carry it in the URL alongside BL-036 if that lands first

Constraint gate: checked 1 to 11, none breached. Constraint 5 applies, since the setting lives in
origin-bound local storage.

**Shipped.** The filter joins `apiBase` and `covers` in `mrt.settings`, which is what "the reader's
other settings" names, and is restored in `wireReading` at `src/js/main.js:1124-1177`, before the
first render, so the opening paint is already filtered rather than showing everything for a frame.

**The choice is global, one filter shared by every list.** Per list was considered and rejected on
two grounds. The filter already crossed lists within a session, so making it per list would have
changed behaviour a reader has today, which is more than this item asked for; and it would add
stored state that grows with the library. A reader who sets Unread has said something about how
they want to read, not about how they want to read one particular order.

**What counted as a filter was the radios, not a list in the code.** A stored value is honoured only
when the list offers it, which is why an unrecognised one falls back to All without the restore path
enumerating the five. An enumeration there would have been a list someone has to keep in step with
the markup, and a filter dropped from that markup could otherwise leave the module holding a value
nothing on screen can select or clear. The coupling was reduced rather than gone when this item
shipped, and the code said so: `matchesFilter` still enumerated the five and returned true for
anything else, so a radio added to the markup and not to that function would be honoured, stored and
checked while filtering nothing. Single-sourcing both paths was not attempted here, because it is a
change to how filtering works rather than to whether the choice survives a reload. It was filed as
BL-053 rather than left in this block, which is a closed record once the item ships, and BL-053 has
since shipped: the radios are rendered from `READING_FILTERS` at
`src/js/lib/readingFilters.js:25-48`, so the restore path above now checks a stored value against
the only list there is.

Two smaller decisions, both found by the browser check rather than by reading:

- **An unrecognised stored value is corrected in storage**, not merely ignored. This is the opposite
  of what BL-045 does with a refused API base, and deliberately so: a reader typed that one and may
  want to repair a typo, whereas no control here can produce an unrecognised filter, none can show
  it, and nothing would ever clear it, so it would sit in the record being ignored on every boot.
  The first version only corrected the value in memory, which left the junk in storage until some
  unrelated write happened to flush it. A review then found the same hole still open for a stored
  value of the wrong type, because `loadSettings` was coercing one to All before `wireReading` could
  recognise it as wrong. Nothing coerces it now; a wrong type takes the same route as a wrong string.
  An empty radio group was not treated as either, since that said the document was missing rather
  than the value being bad, and correcting storage on the strength of it would have discarded a good
  filter. BL-053 removed that case: the group is filled from the list immediately above this check,
  so a document missing the fieldset now fails at the append instead.
- **The radio is set from the state rather than left to the browser.** A browser restoring form
  state across a reload sets the control without telling this module, and it can disagree with what
  `renderRows` is about to use. The markup was the other source of disagreement, because it always
  started on All; since BL-053 it authors no radio at all, and this line is what puts the first mark
  on the group.

The fourth task stays open because BL-036 has not landed. Carrying the filter in the URL is
conditional on that item, and doing it here would mean inventing the URL scheme BL-036 exists to
decide.

Verified: `npm run lint` 0 and `npm test` 256 pass, 0 fail, unchanged, because this is DOM-coupled
code in `src/js/main.js`, which has no unit test harness. BL-041 is the item that owns that gap. The
evidence here is a browser check: in Edge at 1280x900, 16 of 16 assertions pass, covering a fresh
profile starting on All, a chosen filter reaching storage, that value surviving a cover art toggle
and a reload with the control and the rendered rows agreeing, one filter applying across two
imported orders in both directions, and a stored value that is unrecognised or of the wrong type
falling back to All and being replaced in storage. Against the unchanged `src/js/main.js`, 8 of
those 16 fail. The 8 that still pass were already true, and one of them is the pre-existing
session-scoped sharing that decided the global choice above.

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
- [x] Let the run be started by hand, so a commit that never got a run can still get one
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

The manual trigger was added later, after a GitHub Actions incident on 2026-08-06 showed the cost
of having only event-driven triggers. Run creation stalled for hours: no run was ever created for
the merge of BL-035, and the run for the merge of BL-034 sat queued for over an hour before
reaching a state that refused both cancel and rerun while still reporting itself queued. Three
merges reached the default branch with nothing recorded against them and no way to ask for a
result, because a commit that never got a run has no run to re-run. `workflow_dispatch` at
`.github/workflows/ci.yml:15` is the way back from that, and it is what makes a result reachable
for any ref on demand. The runs that read `failure` during the incident had every job `cancelled`,
which is the concurrency group behaving correctly rather than a test failing, so reading that
column alone would have been misleading.

The concurrency group is deliberately still keyed on the ref alone. A dispatch of a ref that
already has a run in flight is a newer request for the same code, which is the case the
`cancel-in-progress` comment already describes; splitting the group by event would leave two runs
alive testing an identical tree.

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

- [x] Validate https-or-local inside the API client rather than only at the settings form
- [x] Keep the settings form message, since it is the one a reader sees
- [x] Add a test covering a rejected base URL
- [x] Confirm the cache key still scopes by base URL

Constraint gate: checked 1 to 11, none breached. See the correction below on how Constraint 2 is
actually held, which is not by the URL check.

Shipped. The check now runs in the `MarvelApi` constructor at `src/js/api.js:20-33`, which throws a
`TypeError` on a base the rule refuses. The form was never the only way a base reached the client.
`loadSettings` reads one straight out of `localStorage` on every boot, and that value outlives the
build that wrote it, so an older version, a restored backup or one devtools edit could put anything
in front of the fetch. `src/open.js:65` had always re-checked on that read path; the app's own boot
path had not.

Throwing, rather than falling back inside the client, is deliberate: quietly talking to a different
service than the one asked for is the failure being prevented, not an acceptable recovery from it.
That makes the caller responsible for having something usable, so `loadSettings` at
`src/js/main.js:359-383` now applies the same rule on the way out of storage and falls back to the
default, which is the only option that leaves an app on screen at all. It reports rather than
substitutes silently, through `#app-report` so the message follows the reader between views, and
withdraws that report the moment a usable base is saved rather than leaving it up until the next
reload.

The refused value is left in storage. That took a second change to hold, found in review: the write
is shared. `setCovers` calls `saveSettings` too, so with the fallback in memory, toggling cover art
would have replaced a configured base with the default the reader was handed instead, silently and
unrecoverably, since the settings field already shows the fallback and nothing on screen would still
hold the old value. `saveSettings` at `src/js/main.js:385-398` now writes the refused value back in
preference to the fallback, and the settings form clears the rejection before it writes rather than
after, or that same preference would have discarded the reader's new base. Both directions are
covered by the browser check.

The settings form keeps its own check and its own message at `src/js/main.js:2524-2525`, unchanged.
It is the one a reader actually sees, and it fires before the constructor can throw.

**A divergence recorded rather than closed.** `src/open.js` refuses the same stored value but does
not fall back: it returns `null` and sends the tab to marvel.com instead of resolving the Marvel
Unlimited link. That is unchanged by this item and is arguably right, since inventing a default for
a lookup the reader did not configure is the same silent substitution this item exists to prevent,
and the launch page has no notice system to explain one. It only bites an issue whose `digitalId` is
not already known, so never a bundled curated issue. What was wrong was that the boot notice did not
mention it, so the reader saw the app carry on and had no way to connect a launch landing on
marvel.com to the setting they had been told about. The notice now names that consequence. Giving
the launch page its own fallback and its own explanation would be a change to reader-visible launch
behaviour, which is more than this item asked for.

Two coupled changes fell out. `saveSettings` now writes the real settings by name rather than
stringifying the whole object, because the boot-time report is state about this session and
persisting it would turn a one-off complaint into part of the stored record. And `MarvelApi` now
coerces its argument before normalising it, so a stored `null` is refused rather than throwing on
`.replace`.

**A correction to this item's own constraint note.** It read that the check "must continue to make a
marvel.com or read.marvel.com base URL unusable as a metadata source". It never did that and does
not now: `isAllowedApiBase('https://read.marvel.com/v1')` returns true, because the rule is about
scheme and loopback, not about hosts. What holds Constraint 2 is that this client only ever issues
API routes and parses JSON, so pointing it at marvel.com yields nothing usable rather than a scrape.
No host denylist was added. One would give false assurance, since a scraping base could be at any
host, and it would be new behaviour this item did not ask for.

Verified: `npm test` 256 pass, 0 fail, up from 252. Four tests were added, and exactly one of them,
the refusal, fails with `src/js/api.js` stashed; the other three guard behaviour that already held,
which is what they are for. In Edge at 1280x900 against a seeded `localStorage`, 14 of 14 assertions
pass: a refused base boots with no uncaught error and a rendered app, produces exactly one visible
warning naming both the refused value and the one in use, leaves storage untouched across both an
unrelated write and a subsequent one, shows the fallback in the settings field, and clears the
warning when a usable base is saved. With `src/js/api.js` and `src/js/main.js` stashed, four of those
fourteen fail, including the settings field reading back `http://evil.example.com/v1`, which is the
pre-change behaviour this closes. The shared-write fault was found in review after that run and has
its own assertion, which fails on its own when the preference in `saveSettings` is reverted.

**BL-046: Share the retry and backoff between the two vendor scripts**

- [x] Extract the shared retry and backoff into one module
- [x] Use it from both vendor scripts
- [x] Keep the existing rate-limit behaviour identical
- [x] Cover the extracted module with tests

Constraint gate: checked 1 to 11, none breached. Constraint 2 applies: the shared client must keep
fetching only from the metadata API.

Shipped, and wider than the title says. The item was written against two vendor scripts; there were
three copies, because `scripts/build-event-order.mjs` carries the same function. All three were
byte-identical, 589 characters each from `async function` to the closing brace, so the third was
taken with the other two rather than left as the one place a rate-limit fix would still have to be
applied twice. The shared module is
`scripts/lib/fetch-json.mjs`, a factory at `scripts/lib/fetch-json.mjs:38-43` whose limiter, fetch,
sleep and attempt count are all injectable, which is what makes it testable on a virtual clock the
way `src/js/lib/limiter.js` already is. It lives under `scripts/` rather than `src/js/lib/` because
nothing in it is served to the browser. Each script now reads
`const { getJson } = createJsonFetcher();` at `scripts/vendor-index.mjs:38`,
`scripts/vendor-orders.mjs:46` and `scripts/build-event-order.mjs:203`, and none of them used the
limiter for anything besides `getJson`, so the local binding went with the copy.

The extraction found a deadlock, which was fixed with it. The copies retried by calling themselves
from inside `limiter.schedule()`, so a retrying request held its concurrency slot while queueing the
job that would release it, and `pump()` at `src/js/lib/limiter.js:91-92` returns early once `active`
reaches `concurrency`. Measured against the original shape at its default concurrency of 2: one
request needing one retry completes in 2 fetches, one request needing two retries stops for ever at
`active` 2 and `queued` 1, and two requests each needing one retry stop at `active` 2 and `queued` 2.
Nothing times out. A second retry is not an exotic case and 429s arrive together because rate
limiting is what produces them, so both shapes are reachable in a normal vendoring run. The fix is
to schedule each attempt separately and loop outside `schedule()`, at
`scripts/lib/fetch-json.mjs:52-61`, which also lets the limiter pace the backoff instead of holding a
slot through it.

Rate-limit behaviour is otherwise unchanged and the tests pin the parts that could drift: six
attempts in total, matching the copies' `attempt >= 5`; the same two error strings; the same
`accept: application/json` header; `observe()` on every response so `retry-after` still reaches the
limiter; and `penalize()` given each backoff, so the pause holds the other requests back. Each of
those was confirmed by mutating the module and watching the suite go red, eleven mutations and
eleven caught, which is a stronger claim than the tests passing. Eight of the eleven target the five
behaviours above, at least one each; the other three bend the backoff itself.

Three assertions failed that check on an earlier draft and were rewritten. Growth in the backoff was
asserted so loosely that a constant satisfied it; it now pins the band `backoff(attempt)` must
return for each attempt, which a constant, a frozen attempt and a reversed sequence all fall
outside. The `retry-after` test was answered by the successful retry, because the stub put the
header on every response where a real API sends it only on the 429; it now sends the header on the
429 alone and asserts a 3 second pause, which no attempt-0 backoff can reach. And `penalize()` was
checked by call count alone, so `penalize(0)` and `penalize(wait / 1000)` both survived; it now
records the argument and compares it against the wait the retry went on to sleep.

`test/fetch-json.test.js` adds nine tests, taking the suite from 256 to 265, and runs in well under
a second because the limiter is given the virtual clock from `test/limiter.test.js:7-14` rather than
a real one, which is worth the injection on its own: the same nine tests took roughly 50 seconds
against `Date.now`. Three of the nine fail against the pre-change
shape, checked by swapping the module back to it. They are the ones that would otherwise hang rather
than fail, so each carries its own deadline; `node --test` has no default timeout, and a hung run is
indistinguishable from a slow one. Beyond the unit tests, `scripts/vendor-index.mjs` was run
end to end with `fetch` stubbed to serve one 503 and then a two-record page: it retried, wrote a
`series-index.json` the app's own parser accepted, and made exactly 2 calls.

**BL-047: Split the two meanings of the row class**

- [x] Rename one of the two uses so a reading row and a form row stop sharing a class
- [x] Delete the leftover empty rule
- [x] Confirm no selector elsewhere depended on the collision

Constraint gate: checked 1 to 11, none breached. No constraint is engaged.

Shipped. The form row is now `.field-row` at `src/styles.css:496-512` and the reading row keeps
`.row`, so the thirteen rules that describe a reading row, from `src/styles.css:403-406` down to the
hover rule on its action buttons, can no longer reach a form. The form row was the side that moved
because it had one rule against those thirteen, and the empty `.row { }` that sat between them is
gone.

Nothing depended on the collision, which was checked rather than assumed. All eight form rows in
`src/index.html` sit inside a `.stack` or a `.card`, so the old `.stack .row, .card .row` selector
reached every one of them; the reading list at `src/index.html:338` sits inside neither, so it never
matched. No JavaScript queries either class, and no test names them.

The one thing that did lean on the collision was the pair of `padding: 0` and `border: 0` resets in
the old rule, and the first pass through this recorded that they existed only to undo the reading
row's own padding and border. Review found that incomplete and it was wrong for two of the eight.
Six sit inside a `.stack`, where nothing sets either, so for those the original account holds. The
two at `src/index.html:468` and `src/index.html:475` are direct children of a `.card card-static`,
where `.card > *:not(summary)` at 0,1,1 and `.card > *:last-child` at 0,2,0 can both reach them and
both now out-rank `.field-row` at 0,1,0. What holds their padding at zero is the `!important` on
`.card-static > *` at `src/styles.css:489`, which the old rule's 0,2,0 had been masking. Measured
rather than reasoned about: neutralise that one declaration in the live page and both rows go from
0 to 17.6px of side padding.

That leaves one real change in behaviour, recorded rather than guarded. A form row placed directly
inside a `.card` that is not also `.card-static` would now take `0 1.1rem`, where the old selector
out-ranked that. No such element exists, and writing a speculative rule for one would be widening
the item. BL-038, which adds two Library sub-views, is the plausible way one appears.

The collision was latent rather than live, and that is the reason worth recording: correctness rested
on where the reading list happens to sit in the markup, not on anything the stylesheet stated. Moving
a reading list inside a card, which BL-038's two Library sub-views could plausibly do, would have
restyled every row in it with no failing check anywhere.

`src/dev-faults.css:47` has a third `.row` of its own. It is left alone: `src/dev-faults.html` loads
only that stylesheet, so the two never meet, and renaming it would have widened this change into a
file the item does not name.

Verified in Edge at 1280x900 against a real server, with House of M imported for its 20 reading
rows. Eleven assertions pass: all eight form rows resolve to `display: flex` with zero padding on
all four sides and no border, the two that depend on the `.card-static` `!important` are identified
by name, no `div` carries the old class, and a reading row still computes to `display: grid` with
four tracks and its own 6.72 pixel padding. The check was run against the tree with the fix stashed
and failed four of its assertions, two of which had passed vacuously on an empty list until the
count was asserted first. A first version of it asserted `padding-top` alone, which reads 0 whether
or not `.card > *:not(summary)` applies, because that rule sets `0 1.1rem`; measuring all four
sides is what makes it able to see the case above. `npm run lint` reports 0, `npm test` 252 pass
and 0 fail, and `npm run anchors` 0 drifted, 0 new and 0 removed.

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
unconditional design at `src/styles.css:464`, where the border is 25 percent alpha green.

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
is written out in words inside the pill at `src/js/main.js:1558-1568`, drawing on the labels at
`src/js/main.js:1598-1603`, and the full sentence from `describe` sits in a visually-hidden span
inside that same pill. Delete the outline and the reader still sees "MU Unlimited", "soon scheduled",
"? unknown", "MU✓ yours: available" or "no yours: not in MU". The outline bounds the label rather
than carrying it, which puts it in the same class as a card border or a table rule.

Two supporting measurements make that safe to rely on. The badge text passes on its own, at 5.94:1
in the worst context against the 4.5:1 floor, so nothing is depending on the border to be legible.
And because the five states are named in words rather than only tinted, 1.4.1 Use of Color holds
without the border too, so Constraint 6 is not resting on the outline either. Both the text
colours and the state distinctions are untouched, which is what the fourth task asked for.

The reasoning is recorded at `src/styles.css:438-462`, directly above the rules it governs, along
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
progress-ring transition at `src/styles.css:248` and the preference queries at
`src/styles.css:717-724`.

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
citations were stale the moment they were committed. Lines 606 to 611 of `src/js/main.js` show it
plainly, written here in prose because they are a frozen historical reference and a citation would be
chased by the anchors gate and re-aimed away from the claim: at
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

**BL-050: Fail the build when an evidence anchor stops naming the code it claims**

- [x] Fingerprint the cited lines rather than their numbers, so a correct re-aim passes and drift fails
- [x] Take the population from `git ls-files` rather than from a list inside the script, and assert coverage per document
- [x] Declare the historical exemption in the text rather than resolving it by punctuation
- [x] Fail on a lost anchor, and on a lock the script cannot read, rather than describing either as drift
- [x] Prove each of those by control, including against the commit where these citations were born

Constraint gate: checked 1 to 11, none breached. Constraint 4 is the live one and permits this: the
gate is a dev-only script run by `npm run anchors`, and it adds no runtime dependency.

This checklist is reconstructed from the delivered commits rather than ticked as the work went,
because this item never had one. It is the only row in the ranked table that shipped without a
heading of its own, and the account below it was written as a continuation of BL-049's block instead,
which is why a reader looking for `BL-050` found nothing. What this change adds is the heading, the
checklist, the constraint line and this paragraph. Everything after it is the original record, left
where it was written and unedited except for the sentence that used to open it, which pointed at
`all of this` and now names what it points at.

The thread this item closes starts under BL-049, at the paragraph beginning "One thing found on the
way, and it grew". That is where the stale anchors were first counted, and it is worth reading first:
the case for a gate is made there, and the gate itself is described here.

Nothing is left open. The two gaps this work exposed were routed onward rather than parked as tasks,
which is why the ledger above still counts six tasks left open on purpose and not seven. Counts
stated in prose are the same problem with no gate behind them, filed as BL-056. Citations inside a
preserved historical document are enrolled when they should be exempt, filed as BL-060 and parked
with it on 2026-08-07, because the one document that would have needed the exemption is not being
committed and the gap now has no caller. The limits described at the end of
this record are limits rather than tasks: they say what fingerprinting cannot do, and no amount of
work on this item would close them.

It closes the loop that the sweeps recorded under BL-049 opened. Five sweeps found one defect class
five times,
because each compared line numbers rather than reading lines, and because each matched a different
subset of the places an anchor can be written. `scripts/check-anchors.mjs` fingerprints the cited
lines themselves rather than their numbers, so a correct re-aim preserves the fingerprint while
drift breaks it, and the build fails in the commit that moves the code rather than in a sweep months
later. It runs in the lint job at `.github/workflows/ci.yml:93-94` and locally as `npm run anchors`,
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

The Evidence column of the backlog table above is inside the gate, and the eight rows that must not
be are exempted on a marker they declare rather than on how they are punctuated. A claim about a past
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

Spurious drift was possible until the key changed. Ordinals used to be scoped to a file, so two
different anchors in one section shared a bucket, and deleting one renumbered the other into its
slot to be compared against a fingerprint that was never its own. That printed as drift, and the
report asserted the anchor had once pointed at code it never pointed at. The fabricated part was the
corroborating detail, made credible by the true details printed beside it. Scoping the ordinal to
the whole anchor rather than to the file means two entries in a bucket cite identical lines and
therefore carry identical fingerprints, so a renumber cannot manufacture a mismatch at all. The
defect is gone by construction rather than by care, which is worth more than a rule telling readers
to distrust a particular combination of counts.

The cost is that re-aiming an anchor changes its key, so it reports as one addition and one loss
rather than as drift. Those are paired back together for reporting when a section holds exactly one
of each for the same file, showing the blessed anchor and the new one side by side; a section with
several is left unpaired, because guessing which removal explains which addition would invent the
same kind of persuasive detail the key change removed. Pairing never makes two anchors compare
equal, so it cannot bring the defect back.

A guard can also be loud and wrong about what it is loud about. Renaming the lock's fingerprint
field used to report all 218 anchors as drifted, when the truth was that the lock could not be read,
and the reader is sent hunting for code movements that never happened. The partial version is the
dangerous one: two entries missing the field reported `216 unchanged, 2 drifted`, which is an
ordinary-looking result nobody would question. The lock's shape is now asserted before anything is
compared, so a lock this script cannot read is refused rather than described as movement. That a
failure is caught says nothing about whether it is diagnosed, and a plausible number is what stops
you looking.

**BL-051: Make the README enough for a non-engineer to run the app**

- [x] Establish by doing rather than by reading: follow the README literally in a clone with nothing installed
- [x] State the prerequisites, including the Node floor the engines field already declares
- [x] Write the address out literally, port included, and say what correct output looks like
- [x] Explain the origin trap in words a reader without a storage model can act on
- [x] Add a troubleshooting section covering the failures a first run actually produces
- [x] Separate the newcomer path from the contributor material rather than interleaving them
- [ ] Have a non-engineer follow it start to finish on a machine that has never run the project

Constraint gate: checked 1 to 11, none breached. Constraint 5 is the live consideration and is the
reason this item exists at all: storage is bound to the origin with the port included, so a reader
who takes the server's own suggestion to move ports loses sight of their progress. Constraint 3 is
the second: the privacy promise is a product commitment, so the README has to state it without
overstating it. Constraint 11 applies to the rewritten prose, which is new copy throughout.

The trigger was a review against a twenty-point readability rubric, scored Pass, Weak or Fail. Four
criteria passed, three were weak and thirteen failed. That ratio is the finding. The document was
not badly written; it was written for somebody who already had the project working.

Four failures were graded blockers, meaning a non-engineer could not reach a running app. The
README named no address anywhere, so a reader who ran the one command it gave had nowhere to go.
It named no prerequisite, so a reader without Node saw a "not recognized" error the document did
not acknowledge. It had no troubleshooting section. And the run instructions sat seventh of ten
headings, behind vendoring, event-order generation and search-index material that a reader must
not need.

The blocker that mattered most was found by running the instructions rather than by reading them.
A literal first run in a fresh clone failed on `EADDRINUSE`, because a server was already holding
the port. That is the single most likely first-run outcome for anyone who has started the app once
before, and the document said nothing about it. Reading alone would not have surfaced it, which is
the argument for treating a documentation review as an experiment.

Two claims were corrected rather than restated. The checks paragraph said lint and tests run on
every push; the workflow scopes its push trigger to `main`, so a feature branch with no open pull
request correctly produces no run, and there are three checks rather than two. And the privacy
line said progress "is not uploaded anywhere", which is true, but sat next to nothing about the
requests the app does make. A browser capture on a plain page load shows calls to the metadata API
and cover fetches from Marvel's image servers. Both facts are now stated together, because a
promise a reader can catch you overstating is worth less than a narrower one they can verify.

The origin warning covers the hostname as well as the port. Both halves were confirmed in a
browser rather than reasoned about: a probe key written at `127.0.0.1` on one port was absent both
at a second port and at `localhost` on the original port. The second half is the one nobody warns
about, and a reader who reaches for `localhost` because it reads more like a word will find an
empty app and no explanation.

The last task is left open deliberately. Every other check here was made by someone who already
knew the answer, and the rubric's own definition of done is a person who does not write software
reaching a working app without asking a question. That cannot be self-certified, and recording it
as passed on the strength of a careful re-read is exactly the substitution this item was raised to
correct.

Scope was held to the newcomer path. The contributor sections were moved and grouped, not
rewritten: their long sentences and their undefined vocabulary are real findings, recorded as
BL-052, and fixing them here would have widened a documentation change into a rewrite of material
that is serving its actual audience adequately.

**BL-052: Make the contributor sections of the README readable at the same standard**

- [x] Shorten the sentences in the vendoring and audit sections, which run to over a hundred words unbroken
- [x] Define or avoid the vocabulary a new contributor would not know: vendor, snapshot, placeholder, depth
- [x] Decide whether the BlueStacks section belongs in the README at all, or in `docs/`

Constraint gate: checked 1 to 11, none breached. Constraint 11 is engaged rather than merely
unbreached: three em dashes stood in the audit and search sections, in material this item was
raised to rewrite, and rewriting a sentence containing one makes it copy being edited. All three
are gone.

Split out of BL-051 rather than folded into it. BL-051's rubric scored the whole document, and
three of its criteria failed on passages that only a contributor reads. Fixing them there would
have meant editing the em dashes and the historical phrasing in sections whose facts were not
under review, so the finding is recorded where it can be scheduled against its own audience
instead of riding along with a change aimed at a different reader.

The first task's premise was wrong, and measuring before editing is what caught it. No sentence
below the contributor heading ran to over a hundred words: the longest was 48, the mean 19.1, and
only four exceeded 40. What did exceed a hundred words was a single *paragraph*, the 138-word one
that explained why the audit reads its index out of `HEAD`. The README below that heading is
byte-identical to the state BL-052 was filed against, checked with `git show`, so this was an
imprecise reading when the item was written rather than something that changed underneath it. The
task text is left as it was written, and corrected here, because a task rewritten to match what
was found is no longer evidence of what was asked.

So the work was done against the measurement rather than the wording. That 138-word paragraph is
now three, at `README.md:366-377`, and the four sentences over 40 words are now none: the longest
is 36 and the mean is 17.3. The audit paragraph was the one worth splitting on its own merits, not
just its length, because it was carrying three separate arguments at once: where the catalogue
comes from, why it is read out of `HEAD`, and what a shortcut nobody can check would cost.

The vocabulary was handled by defining all four terms, and by removing an earlier undefined use of
one of them. `vendor` is defined in the paragraph immediately after the word first appears, at
`README.md:295-299`, as fetching a list once and committing what came back. `depth` gained a gloss
in the field table, which had listed its three values without ever saying what the field meant.
`placeholder` is defined inline at its only remaining use. `snapshot` is defined at its remaining
first use, as recording what upstream held on the day the file was built, and the earlier sentence
that said "snapshot date" before anything had defined a snapshot now says the date is restamped.
"pinned JSON" became "the JSON already committed", pinning being a fifth undefined term the task had
not spotted.

Scope was held to prose, and that is checked rather than asserted: every code span, every link
target and every fenced block below the contributor heading is identical to the pre-change file, so
no command, path, flag or field name moved. The anchors gate is not the evidence for that, and
saying so would overstate it. The lock held no citation into `README.md` before this change, so
nothing the rewrite did to those sections could have drifted it. The two citations that now exist
were created here and fingerprinted against the rewritten text, which makes them coverage this
change adds for future edits rather than a check it passed.

The third task is closed ahead of the other two, on the repository owner's decision. The
BlueStacks material moved to `docs/WHY_A_BROWSER_APP.md` with its wording unchanged, and the
README links to it from the contributor section. It was the largest block of text in the document
that answered a question nobody trying to run the app is asking, and it sat second of the headings,
so a reader met a page of ARM64 driver architecture before anything about starting the app.

Moved rather than deleted, though every fact in it survives in more detail in the research
artifact under `.copilot-tracking/research/` for 2026-08-03, which carries the command output and
the sources behind each finding. That artifact is dated working evidence and is navigated by id
rather than cited by line, so it is not somewhere a reader would be sent. The new page says where
the underlying evidence lives without turning a historical record into a maintained reference.

**BL-053: Make the reading filters one list rather than two that must agree**

- [x] Give `matchesFilter` a way to answer for a filter it was not written with, or derive both paths from one list
- [x] Make a filter present in one place and missing from the other fail loudly rather than silently pass everything
- [x] Confirm the five filters that exist today behave identically afterwards

Constraint gate: checked 1 to 11, none breached. Constraint 6 applies and is the reason this is
worth doing rather than papering over: the `unlimited` filter is the one that reads the five-state
availability model, so a filter that silently degrades to All is a filter that silently stops
distinguishing those states.

Filed out of the BL-037 review rather than fixed there. BL-037 made the radios in the markup the
list of valid filters for the restore path, so a stored value was honoured only when a radio
offered it. `matchesFilter` still enumerated the same five and returned true for anything else, so
the coupling was reduced rather than removed and the failure simply changed direction: a radio
added to the markup and not to that function was honoured, stored and checked while filtering
nothing, and the reader saw a filter selected against an unfiltered list with nothing failing.

Not folded into BL-037 because single-sourcing the two paths changes how filtering works, whereas
that item was about whether the choice survives a reload. The residual coupling is described in
BL-037's block as well, but a paragraph inside a block marked `Shipped` is a closed record rather
than a work queue, which is why it is also here.

**Shipped.** The second list is gone rather than reconciled. `READING_FILTERS` at
`src/js/lib/readingFilters.js:25-48` carries the value, the label the radio shows and the predicate
that decides a row in one entry each, `wireReading` renders the radios from it at
`src/js/main.js:1141-1144`, and `renderRows` asks it at `src/js/main.js:1510`. "In the markup but
not in the code" stopped being a mistake to avoid and became one that cannot be expressed: there is
no way to add a radio without adding the predicate it renders from.

**The failure was measured before it was closed, not assumed.** The defect this item describes was
reproduced on the tree as it stood, by making the mistake an author would make: a sixth radio
authored into the fieldset with no branch in `matchesFilter`. Against an eight row fixture the
reader saw all eight rows with Crossovers selected, the choice written to `mrt.settings`, and
nothing thrown or logged. The same edit against this change stops the app on the first boot after
it, naming the file to add the filter to. That guard at `src/js/main.js:1136-1140` exists because
rendering into the fieldset appends rather than replaces, so a hand-authored radio would otherwise
have survived alongside the rendered five, offering a filter with no predicate and no listener,
which is the same silence in a new place.

**An unknown filter throws rather than matching nothing.** `filterByFacet` at
`src/js/lib/catalog.js:238-247` takes the opposite decision for the catalog, and the difference is
who can reach it. A stale facet is reachable by a reader whose saved value an older build wrote, so
matching nothing is the honest answer there. A reading filter cannot be reached at all without an
edit to the list, because every value comes from a radio rendered out of it and a stored value that
is not in it is refused before it gets that far, so the useful behaviour is to stop the person
making the edit. The one inconsistency the single list can still hold is an entry that names a
filter and does not decide one, and `filterListProblems` at `src/js/lib/readingFilters.js:73-89`
reports it at load rather than at whichever later moment a reader picks that filter.

Verified by nine new unit tests, taking the suite from 285 to 294, and by a browser check of 14
assertions in Edge at 1280x900. **Three of the nine fail against the behaviour this item removed**,
confirmed by giving the module the old shape, an entry with a label and no predicate and an unknown
value falling through to true: 291 pass, 3 fail, and they are the three that assert the loud
failure rather than the filtering. The other six assert the filtering, which is meant to be
unchanged.

**The five filters were checked for equivalence against the previous tree, not against a
description of it.** The browser check seeds a fixed eight row state, refuses the metadata API so
hydration cannot move a row between runs, and counts the rows each filter shows. Run against this
branch and against `911ee23` with `src/js/main.js` and `src/index.html` taken from it, both report
`all=8 unread=7 read=1 unlimited=3 pending=1`, with the same five labels in the same order. The
check also confirms what BL-037 and BL-054 established still holds: the choice is stored and
restored across a reload, a stored value the build does not offer falls back to All and is
corrected in storage without throwing, and choosing a filter leaves focus on that filter.

BL-054's twelve assertions were re-run unchanged and all twelve still pass, which is the one
regression that mattered: the radios are now rendered, and rendering them on every write instead of
once would destroy the radio the reader had just activated.

**BL-054: Put focus back where it was when the shelf and the full order rebuild**

- [x] Keep the focused control identifiable across a rebuild, or move focus somewhere deliberate
- [x] Cover the click route and the keyboard route, which reach the same rebuild
- [x] Confirm a reader is not returned to the top of the document every time an issue is marked read

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-026 review rather than fixed there. `renderShelf` and `renderRows` both handed
`replaceChildren` a freshly built set of nodes, so every `store.update` discarded whatever was
focused and focus fell to the body. Measured in Edge by clicking a checkbox in the full order and
reading `document.activeElement` immediately afterwards: `BODY`. The hero escapes this because its
buttons are static markup the re-render leaves in place, which is why the focus work in BL-026
stopped where it did.

Not folded into BL-026 because the click route already behaved this way and was not touched by that
change; BL-026 only added a keyboard route into the same rebuild. That block also predicted this
would have to be settled together with BL-033's incremental rendering. It did not: the identity a
control keeps across a rebuild can be decided without deciding which nodes get rebuilt, so BL-033 is
left untouched and inherits the answer rather than being pulled forward into this change.

A node cannot be restored, because the node is gone. What is restored is the identity the node
carried: which issue the control acts on, and which action it is. Both are written onto every
control the two lists build, and `preservingFocus` at `src/js/main.js:204` reads the pair back out of
the rebuilt DOM. It is a no-op whenever focus is not inside the container it was given, which is what
keeps the shelf and the full order from fighting over the same restore when `renderAll` runs both.

Where the pair no longer exists at all, focus goes to the row that took the vacated place, and
deliberately not to the same control on it. `⚑` and `✕` sit in that strip, and Enter auto-repeats on
a held key while Space does not, so restoring `✕` under a finger already on Enter would delete the
next issue as well. Each list names its least destructive control instead, at
`src/js/main.js:1589`, and the reasoning is recorded at `src/js/main.js:159-163` rather than only
here. When even that is gone the landing is the checked filter radio, which is both the reason the
list is empty and the control that undoes it.

Verified by a browser check in Edge at 1280x900, 12 of 12 assertions passing. They are, in order:
focus stays on a control after a row checkbox click, and on the same issue, which is two
assertions; the document does not scroll; the availability control survives the rebuild it
triggers; the reorder control follows its own row down the list; the keyboard route lands on a
control; a shelf tile survives a rebuild it did not cause; a row filtered away by the act performed
on it drops focus neither to `<body>` nor onto the wrong row, which is two assertions; emptying the
filtered list entirely still leaves focus somewhere reachable; changing the filter leaves focus on
the filter radio; and the shelf emptying under a focused tile lands on the hero rather than nowhere.

Proved able to fail. Against the same tree with `src/js/main.js` taken from `8c44bac`, the last
commit before the fix landed, and the served file confirmed to no longer contain it, 10 of the 12
fail and `document.activeElement` reports `BODY` exactly as this block described. The
two that pass unfixed are the honest baselines, and they are not the two filter assertions, which is
easy to misread: emptying the filtered list is one of the ten that fails. What passes unfixed is the
scroll position, which never moved, so the third task was already satisfied, and changing the filter,
because the radio sits outside both rebuilt containers and was never at risk.

The last of the twelve is the one worth naming separately, because it exercises the only path in the
change that can decline to land anywhere. Leaving exactly two unread issues puts one tile on the
shelf; marking the first read from the keyboard, so that nothing moves focus off that tile first,
empties the shelf and hides it under the reader's own focus. Measured: `shelfHidden=true`,
`heroHidden=false`, and focus on `#btn-hero-done`. Unfixed the same sequence reports `BODY`.

No unit test, and the reason is worth recording rather than leaving as a silence. Every one of the
285 tests runs over pure modules under `src/js/lib/`; nothing in the suite touches a DOM. The helper
is DOM-bound end to end, and the two things worth asserting about it, that focus lands on a control
and that it is the right one, cannot be observed without a real focus model. Adding one to reach it
would mean adding a test-only DOM implementation, which is scope this item did not earn. The browser
check is the evidence, which is why it was made to fail first.

One measurement trap found while writing that check, recorded because it makes a focus probe pass
while proving nothing. The full order lives inside a `<details>` at `src/index.html:324` that is
closed on load, and a closed disclosure does not render its contents, so `element.focus()` is a
silent no-op: no event fires and `document.activeElement` never changes. The usual guards all read
clean, because `getComputedStyle` still reports `display: grid` and `visibility: visible` and
`getBoundingClientRect` still returns a non-zero box. `element.checkVisibility()` returning `false`
is what settles it, and the check now opens the disclosure and waits on that before it measures.

Not closed by this item. The review found the same defect on the home grid, where `+ Add to library`
loses focus to `<body>`, and reviewing that finding turned up a second on the reading order rail,
which loses it on every `renderAll`. Both are filed as BL-058 rather than folded in here. Neither
shares this item's mechanism, and widening the change to reach them would have put two untested
fixes under an already large diff.

**BL-058: Keep focus on the home grid and the rail when their lists rebuild**

- [x] Keep focus on a control after `+ Add to library`, on the one view built to keep the reader put
- [x] Decide what the landing is once the button that was pressed no longer exists
- [x] Do the same for the reading order rail, which loses focus to `<body>` on every `renderAll`
- [x] Cover both in the same browser check that covers the shelf and the full order

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-054 review, and deliberately not fixed there. `addFromCatalog` at
`src/js/main.js:1032` carries a comment at `src/js/main.js:1042` saying adding must not move the
reader, and the home grid is the one view the app is built to keep them on. It does move them.
Measured in Edge at 1280x900, clicking `+ Add to library` with the button focused leaves
`document.activeElement` at `BODY` immediately, while the button is still in the document and merely
disabled, and it is still `BODY` two seconds later once both rebuilds have run.

The mechanism is not the one BL-054 answered, which is why the helper it shipped does not simply
drop in. `importCurated` sets `btn.disabled = true` at `src/js/main.js:2342`, and disabling a focused
control blurs it there and then, before any rebuild has run. By the time `renderHomeCatalog` reaches
`grid.replaceChildren` at `src/js/main.js:886` there is nothing left to preserve, so a wrapper that
reads focus at rebuild time reads `BODY` and correctly declines. The grid is then rebuilt a second
time after a 1500 ms `setTimeout`, and the re-enable in its `finally` at `src/js/main.js:2412` puts
a node back in an enabled state that has been detached twice over. Any fix has to capture the
identity before the disable, not at the rebuild.

`renderRail` at `src/js/main.js:658` is the other half, and it is the easier one: its mechanism is
the plain `replaceChildren` that BL-054 already answered, not the disable that the home grid trips
over, so the helper should drop straight in. The review that filed this item read both it
and `renderYours` as safe because navigation follows them, which is only half true: `showView` calls
`renderRail` at `src/js/main.js:639` and reaches `renderYours` through `renderHome` at
`src/js/main.js:641`, where the reader is being moved anyway, but `renderAll` at
`src/js/main.js:2630` calls both on every `store.update` with no navigation at all. Measured on that
route in Edge at 1280x900: with a reading order's button in the rail focused, pressing `d` took the
order from 0 of 89 read to 1 of 89, left the reader on the read view, and put
`document.activeElement` at `BODY`. Only `#list-nav` is rebuilt, at `src/js/main.js:666`, so the
loss is scoped to the per-order entries.

`renderYours` at `src/js/main.js:809` is a different answer, and the reason is a guard rather than a
call site. The shortcut handler returns unless the read view is showing, at `src/js/main.js:1615`,
and `#home-yours` sits inside the home view, which is hidden exactly then. Its buttons navigate on
click at `src/js/main.js:822`. There is no route that rebuilds it while it holds focus, so it is
excluded on evidence rather than on the reviewer's original reasoning.

**The `renderRail` paragraph two above said the BL-054 helper "should drop straight in" for the rail.
That was wrong, and finding it wrong is what shaped the change.** The helper matches a control by the
pair `data-act` and `data-issue`, and rail buttons carried neither, so it would have returned at its
own `if (!act)` guard and preserved nothing at all, silently and with every test still green. The
same was true of the home grid. The claim was reasonable when it was written, because it was written
about the call site rather than about the markup, and the call site really is the ordinary
`replaceChildren` BL-054 answered. It is left standing and corrected here rather than edited away,
because the paragraph is the research that led to the work, and rewriting research to agree with its
own outcome is how a repository stops being able to tell the two apart. It was edited away once, in
the first commit of this item, which left this paragraph quoting a sentence no reader could find.

So the identity attribute had to reach both containers, and once it did, `issue` was the wrong name
for it: the thing a control acts on is an issue in the reading lists, a reading order in the rail
and a catalog entry on the home grid. It is now `data-key`, renamed across all ten declarations,
and the helper's comment says why one attribute serves three meanings, which is that a key is only
ever compared against controls inside the same container.

`preservingFocus` is now the composition of a `captureFocus` and a `restoreFocus` that callers can
also use apart, because the home grid cannot use them together. It captures before `importCurated`
disables the button, and restores after the rebuild, which is on the far side of an `await`. Both
`renderHomeCatalog()` calls in `addFromCatalog` are now awaited so that the restore cannot run
before the grid it is restoring into exists.

A reader is free to move during that await, so the restore after it is guarded: `returnFocus` puts
focus back only when `document.activeElement` is still `<body>`. The disable is what sent focus to
`<body>`, so `<body>` is the only state that means "still lost". Anything else is somewhere the
reader chose to be, and dragging them back from it would be the same discourtesy in the other
direction. The settle rebuild 1500 ms later needs no such guard, because it goes through
`renderHomeCatalog`, whose own capture is empty unless focus is inside the grid at the time.

`primary` is `open` for the rail and `main` for the home grid. Both `addButton` branches use the one
act name because what persists is the slot rather than the action: the same control says
`+ Add to library`, then `In library`, then `Open`, and a reader who pressed the first should land
on whatever it has become. That is exactly what the check watches, since it follows the button
through all three of its accessible names.

Verified in Edge at 1280x900 with a browser check outside the tree, five assertions covering both
halves. On the unfixed tree it reports 2 of 5, with `activeElement=BODY` on each of the three that
matter; on the fixed tree, 5 of 5. Its locators read only accessible names and the rail's progress
numbers, never the `data-key` and `data-act` the fix introduces, because a check that can only find
its target once the fix is in place cannot be run against the broken tree, and a check never seen to
fail is not evidence. The rail assertion imports a second reading order and parks focus on the
button for the list that is **not** active, so a restore that simply grabbed the first button would
be caught rather than flattered, and it waits on the active order's progress changing from 0 of 20
to 1 of 20 before reading focus at all, so it cannot pass on a page where nothing happened.

Two em dashes in shipped copy were found while scanning the diff for Constraint 11, at
`src/js/main.js:682` and `src/js/main.js:1000`. Both predate this change and neither is part of its
mechanism, so they are filed as BL-061 rather than folded in. The first sits on a line this change
rewrites for an unrelated reason, which is why it appears in this diff's added lines. BL-061 has
since removed both, so those two lines carry the rewritten copy rather than what was found here.

**BL-063: Extend the Constraint 11 check past JavaScript to the page and its styling**

- [ ] Decide what mechanism reads the three HTML files and the three stylesheets
- [ ] Record whether CSS `content` counts as shipped copy, since it reaches the screen without text

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-061 review, which found the gap by asking what the new rule cannot see rather
than by confirming what it can. BL-061 made Constraint 11 machine-checked for the first time, but it
did so with an ESLint rule, and ESLint reads JavaScript. The rule is attached to `src/**/*.js`, at
`eslint.config.mjs:93-97`, so it covers `src/js/`, `src/open.js` and `src/dev-faults.js` and stops
there. Copy written straight into `src/index.html`, `src/open.html` or `src/dev-faults.html`, or into
a `content` declaration in `src/styles.css`, `src/open.css` or `src/dev-faults.css`, reaches the
screen without passing through a `Literal` or a `TemplateElement`.

Not a live breach. All six files were scanned during the review and none holds an en or em dash
today, which is why this is filed rather than fixed inside BL-061. The point is that the check now
reports green over a region it never looks at, and a green check over an unexamined region is the
shape of defect this repository has been caught by twice: BL-058 found a dash scan that could not
fail, and BL-056 was filed because the anchors gate reports a sentence as sound however wrong the
numbers inside it are.

Sized 2 on effort rather than 1 because the mechanism is an open question, not a line to write. A
plain text sweep over the six files would work and is the obvious answer, but it is the same
technique whose imprecision made the ESLint rule worth preferring, since it cannot tell an HTML
comment from a paragraph. Whether that imprecision matters for markup, where there is far less
commentary than in source, is the decision the first task has to make and record.

**BL-062: Delete the paragraph that BL-054's block states twice over**

- [x] Remove the second copy and confirm the first is the one the surrounding prose reads with
- [x] Check the other detail blocks for the same fault

Constraint gate: checked 1 to 11, none breached.

BL-054's block set out which of its twelve browser assertions pass against the unfixed tree, and it
set it out twice: four lines repeated word for word. The repetition read as a stutter rather than as
emphasis, and the sentence it doubled is the one warning a reader against a specific misreading, so
the defect landed on the paragraph least able to afford it.

The first copy is the one the prose reads with, which is settled rather than assumed: the line above
it ends on the bare word "The", so the sentence completes into the first copy and the second begins
mid-clause after a full stop. The second was deleted, at `PRODUCT_BACKLOG.md:1761-1764`.

The second task was the substance. A scan of every tracked Markdown file, at every block length from
eight lines down to one, found exactly one repeat, and it is this one. That result is what made a
permanent check worth building rather than a one-off answer worth writing down. The scan needed no
minimum length and no exception list to stay quiet, so `scripts/check-counts.mjs` now carries it, at
`scripts/check-counts.mjs:320-341`, and `npm run counts` fails on a repeat.

Putting it in that script rather than in a new one follows what was already there. The counts gate
already refuses a detail block that appears twice, at `scripts/check-counts.mjs:293-303`, which is
this same defect one level coarser: an edit that copied where it meant to move. The heading check
could not see this case, because a block that states its own paragraph twice still has one heading
and one row, so every enumeration agreed the document was sound.

Deliberately not scoped to detail blocks. Copy and paste does not respect a section boundary, and an
enumeration of where to look is the thing `scripts/check-anchors.mjs:101-104` argues against, having
found that every anchor defect the gate exists to catch came from exactly that.

Four tests cover it and all four were proved able to fail. Neutering the check to return nothing
fails the two that assert a repeat is caught; removing the guard that stops a window spanning a blank
line fails the one that asserts two paragraphs cannot pair across the gap between them; and the
fourth, which asserts the committed document is clean, is the one that failed before the deletion
landed.

The gate's summary line was rewritten in the same change, because a repeat is not a figure and has no
derived value to write, so counting both classes in one sentence would have described neither. The
two are now counted apart.

Filed out of the BL-058 review rather than fixed in it. The duplication predates that change, which
neither caused it nor touched those lines, and the change was a focus fix rather than a documentation
pass.

**BL-061: Take the two em dashes out of the copy the app puts on screen**

- [x] Rewrite the rail tooltip and the preview button label without an em dash
- [x] Check whether anything else the app puts on screen carries one

Constraint gate: checked 1 to 11, none breached.

Constraint 11 says shipped surfaces contain no em dashes, and two of them did. The rail tooltip is
built at `src/js/main.js:682` and joined the list's name to its progress with one; the preview button
on every catalog card, at `src/js/main.js:1000`, joined an issue count to an invitation to open the
list the same way. Both are copy the reader sees, the first through a tooltip and the second as the
button's own text.

Measured rather than assumed: a scan of every tracked `.js` file under `src/` for U+2013 and U+2014
found eight lines, of which six are code comments and these two were the shipped copy. Scanning all
of `src/` instead returns thirty-nine, but the other thirty-one are vendored issue descriptions in
`src/data/*.json` and the checklist files under `src/data/orders/`, which are not copy this
repository writes.

One of those thirty-one was not as far out of scope as it looked, which is what the second task was
for. Each checklist file opened with a heading that joined the event name to `Issue-by-Issue Reading
Checklist` with an em dash, and an imported file's first heading becomes the list's name on screen,
at `src/js/main.js:1915`. A reader who imports one of this repository's own checklists therefore saw
an em dash in the rail, in the page title and in every place the list is named.

That decided the second task the strict way: those headings are copy this repository writes, not
copy it received. Five of the six are generated, at `scripts/build-event-order.mjs:431`, which wrote
the dash as an explicit `\u2014` escape. So the escape became a colon and those five committed files
were edited to match, which keeps them byte-identical to what a regeneration would now emit. The
sixth, `new-ultimate-universe.md`, is not generated at all: no event in the generator's list produces
it, it carries none of the generated-by line the other five do, and `curated-lists.json` records it
as compiled for this project. It was edited to the same shape by hand. That edit is durable rather
than a thing a later vendor run would revert, because `scripts/vendor-orders.mjs` only reads these
files, and the review that found this checked it. Nothing else reads a heading: the vendor script
takes each list's name from `curated-lists.json`, at `scripts/vendor-orders.mjs:140`, and
`loadOrderText` reads only the item lines.

The rewrites themselves. The tooltip now separates name from progress with a colon, which is what the
line is: a label and its value. The button now reads `See the full list` and drops the count entirely,
because the count was already on the card, in the meta line rendered immediately above it at
`src/js/main.js:984`. That also retired a latent bug rather than fixing it. The old label said
`issues` unconditionally, so a one-issue list would have read `1 issues`, unreachable only because
the smallest list in the catalog holds twenty.

The part worth keeping is the check, not the two edits. Constraint 11 had been machine-unchecked
since it was written, and the scan meant to enforce it was itself proved unable to fail, in BL-058.
Two rules now enforce it where prose could not. ESLint refuses an en or em dash inside a `Literal` or
a `TemplateElement` under `src/**/*.js`, which is exact in the way a text scan is not: a comment is
neither node type, so the six comment dashes stay legal and needed no suppression. A test refuses one
in any heading of a committed checklist, scoped to headings on purpose, because the item lines carry
Marvel's own titles and five of those really are spelled with an en dash. Both were run against the
unfixed tree first and both failed there, ESLint naming exactly lines 682 and 998 and nothing else.

Each of the two selectors was then proved to fire on its own, in review, against a scratch file
carrying a dash in every context: nine hits, five on plain string literals and four inside template
literals, including one either side of an interpolation. That mattered because a selector that
silently matches nothing would have left half the rule decorative while the other half made it look
green, which is the same defect in a new place.

Two limits of the rule, both known and neither a breach today. It reads JavaScript, so the copy in
`src/index.html` and in CSS `content` is out of its reach; that copy was scanned and holds none, and
closing the gap is filed as BL-063 rather than widened into this item. And a dash inside a regular
expression escapes it, because esquery matches an attribute only when its value is a string and a
regex literal's is an object. A regular expression is not copy, so that one is recorded rather than
filed.

Filed out of the BL-058 change rather than fixed in it. BL-058 rewrote the tooltip's line for an
unrelated reason, so the dash appeared in its diff as an added line, but the copy was older than that
change and correcting it there would have widened a focus fix into a copy edit.

**BL-055: Record the drift in the audited figures instead of letting them go stale**

- [x] Re-derive the size of `src/js/main.js` and record the drift where it is stated as a fact
- [x] Re-derive the test count in the same list, which had drifted further than the one it corrects
- [x] Decide, and record, which statements of the figure are live claims and which are snapshots

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-014 review. `src/js/main.js` was stated as 1,566 lines in three places and was
2,563 when this item measured it, so the file had grown by 997 lines, 64 per cent, while every
statement of its size stood
still. The maintainability gap at `PRODUCT_BACKLOG.md:2627-2628` uses that size as the argument for
the gap, which made the understated figure an understatement of the debt.

The obvious fix would have been to overwrite 1,566 with 2,563 everywhere. That is wrong here,
because this document already has a convention for the case and applies it in the third bullet of
the same list: the audited figure is preserved and the drift is recorded beside it, as "224 is the
figure as audited" at `PRODUCT_BACKLOG.md:158-160`. The clause is quoted only as far as its fixed
half. The live number beside it moves whenever a test is added, and pinning a copy of it into this
record would be the same defect in a second place, which is the rule BL-059 later had to state
outright. Appendix A does the same thing in its own idiom, correcting a miscount inside the
`Resolved:` line rather than editing the bullet it resolves, at `PRODUCT_BACKLOG.md:2645-2647`.
Overwriting would have destroyed the audit trail these sections exist to keep.

So the audited figures stand and each now carries its drift. Two of the three statements were
treated as live and one was not. The outcome narrative at `PRODUCT_BACKLOG.md:2473-2475` describes
the state that motivated OC-3, and the same paragraph says there is no linter
and no changelog, both of which have since shipped; correcting the number alone would leave a
coherent snapshot half-updated and half-stale, which is worse than either. It is left as a snapshot,
which is the treatment the as-is journey map in the UX study already gets. That precedent is the
weaker of the two, because the journey map is stamped as a hypothesis in its own text at
`docs/UX_STUDY.md:742-745` while this paragraph carries no such marker and reads in the present
tense, so a reader who never opens this block has no way to tell it is frozen. Marking it in place
would mean editing the snapshot, which is the thing being avoided; the record is here instead.

The drift clause the convention produces is itself a live number in an otherwise fixed record, which
is why the test figure was written as 235 when nine items had shipped and was still reading 235
after twelve more had. That is now stated in the section rather than left as a trap.

This is the defect class the anchors gate cannot see. Every citation around these sentences resolved
throughout, because the lines they name still exist and still say what they said; only the numbers in
the prose were wrong. Twelve consecutive shipped items passed every gate over a figure that was
already wrong, which is the argument for re-deriving counts mechanically rather than reading past
them.

Verified: the size by `(Get-Content).Count`, the test count by a full run, and the ranks and status
counts this item's own row shifts by a script that parses the ranked table and excludes the Parked
table, rather than by hand. The review of this change found one live figure the first pass had
missed, a second row count in Appendix B stating the table at 31, which is the same defect class
being fixed and was caught only by re-deriving rather than reading. Every count in the appendix was
then re-derived against the final table, with BL-056's and BL-057's rows already in it, so no figure
here was
written twice.

Not closed by this item: nothing enforces the convention. The anchors gate fingerprints the lines a
citation names, so it will keep reporting these sentences as sound however wrong their numbers
become, which is exactly how the figure survived twelve shipped items. What this item leaves behind
is a written instruction and a worked example, not a gate, and an instruction is the weakest thing
this repository knows how to rely on.

That gap is filed as BL-056 rather than left as prose. The first draft of this block declined to
file it, on the reasoning that adding a second row would shift the Appendix B ranks twice in one
change. That reasoning was wrong on its own terms: the ranks are derived by a script over the final
table, so both rows go in and the numbers are written once. It also read as an argument for not
doing the work, which is the thing this repository routes findings to avoid, and the missed row
count above is the evidence that the gap is live rather than theoretical.

**BL-056: Fail the build when a derived count in the backlog disagrees with the table it is derived from**

- [x] Derive the ranked-row count, every rank, the status counts and the delivered-id list from the table itself
- [x] Compare each against the figures stated in prose, and fail with the derived value when they disagree
- [x] Check that every row has a detail block and every detail block has a row, which is the same enumeration over the same table
- [x] Run it in CI beside the anchors gate, and record what it caught on its first run

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-055 review. BL-050 already proved the shape works: an evidence claim that no one
checks is an evidence claim that drifts, and the anchors gate ended that for `path:line` citations by
failing the build. Counts stated in prose are the same problem with no gate behind them. The three
worked examples are in BL-055's block, and one of them was missed by the pass that was explicitly
looking for it, which is the argument for a machine rather than a habit.

The scope that is worth doing is the machine-checkable subset, not a general one. A general checker
would have to know which number in any sentence is derived and from what, which is not tractable.
Every figure this item is filed over is derived from the ranked table in this same file: the row
count, each rank, the ordinal spelled out in a heading, the counts of items above a given row, the
status tallies and the list of delivered ids in the opening ledger. All of those can be recomputed
from the table and compared with what the prose says, which is what the throwaway script written
during BL-055 already did. This item is that script, made durable, wired into CI and given the tests
that prove it fails when a figure is wrong.

Deliberately out of scope: figures derived from outside this file, the line count of `src/js/main.js`
and the test total among them. Those need the tree, not the table, and folding them in would turn a
tractable item into the intractable one. If they are wanted later they are a separate filing.

Shipped as `scripts/check-counts.mjs`, run by `npm run counts` and by a CI step beside the anchors
gate. It derives the ranked rows, the parked rows, each item's rank, the status tally, the delivered
ids and every bold detail-block heading, then checks four claim forms against them: `rank N of M`,
an ordinal spelled out in a heading, the delivered ledger's count and id list, and the enumeration
of rows against blocks in both directions. Claims are recognised by rigid syntactic form rather than
by reading the English around them, which is the concession that makes the tractable subset
tractable. Where a rank claim names no item, the subject is taken from the nearest preceding
heading, which is a fixed rule rather than a search: guessing which item a number refers to is the
kind of corroborating detail that makes a wrong report persuasive.

**What it caught on its first run.** Against the working tree, one claim, and it is the case the
design had to answer rather than a defect: Appendix B states BL-028's rank as 15 of 28, which is
what the ranking pass computed and is not a claim about the table now. A gate that cannot tell a
frozen figure from a live one either fails forever or has to be taught to read English. The answer
is the same one the anchors gate reached for historical citations, a declared marker, here an HTML
comment so that satisfying the checker never changes what the rendered document says. Two tests
hold that control honest: removing the marker must fail, and a marker on one line must not silence
a claim on another.

Pointed at the commit before BL-057 shipped, which is the honest test of whether it would have
caught anything, it reports fifteen findings. One is that BL-050 had a table row and no detail
block, which is the defect BL-057 existed to close and which was found by hand at the cost of a
research cycle. The other fourteen are the rank and row-count figures that were false while BL-060
sat in the ranked table: every `rank N of M` in Appendix B was wrong in both halves, and both
spelled-out ordinals with them. That set was also found by hand, during the contrarian pass on
parking BL-060, and finding it was luck rather than method. Two defects this repository paid for
twice over are recomputed by this gate in under a second.

**What the review of this commit found.** The delivered-id check compared the two lists as sets,
which is the obvious way to write it and is blind to an id written twice: a duplicate is in neither
difference, and the count word beside it is derived from the rows rather than from the list, so it
agrees too. The gate reported nothing on a ledger that visibly enumerated one id more than the table
had rows. The check now compares lengths as well and names the repeated id. This is the same edit
that writes a detail block twice, which the block enumeration had already had to grow a case for,
and the lesson is that a set comparison answers "which members differ" and was being asked "do these
two lists agree".

Not closed by this item. The gate reads four claim forms, and the block above names two more figures
that are derived from the table and remain unchecked: the count of items above a given row, stated as
"outranked by N items sized 1, 2 or 3" and "below N unlabelled items", and the
Cost of Delay orderings. Both are stated in prose too varied to match without inventing a pattern per
sentence, which is the enumeration anti-pattern `scripts/check-anchors.mjs:101-104` argues against in
this repository's own words. They are recorded here rather than filed, because the cost of a bespoke
matcher exceeds the cost of the figure being wrong. The two are quoted by shape rather than by their
values, which had already drifted twice by the time anyone read this sentence again, and quoting a
live figure into a record of a past decision is the fault BL-059 had to state outright.

**BL-057: Write the detail block BL-050 never got, which two sentences promise a reader**

- [x] Record what BL-050 changed, what was measured and which tasks it left open, in the house shape
- [x] Remove the two exception clauses once the block exists, rather than leaving them as scar tissue

Constraint gate: checked 1 to 11, none breached.

Filed out of the second BL-055 review. `BL-050` was the only row in the table, of any status, with no
detail block, and it was never written rather than deleted: a search of the history for the heading
returns no commit that ever added one. Two sentences promised otherwise, the delivered-item ledger
above and the note above the table, both false
for one of the twenty-four ids they governed until BL-055 gave each the exception clause it
carried. Both clauses are gone now, which is the second task.

Writing the block is not a correction and did not belong in the change that found this. It is new
research into what a different piece of work changed, what it measured and what it left open, which
is the shape the routing rule exists to route. What did belong in that change is making the two
sentences true in the meantime, so each named the exception. That is the same treatment the
audited figures get one section up: state the drift beside the claim rather than let the claim stand
wrong, and remove the clause when the underlying gap closes rather than leaving it permanently.

**The block was not missing so much as misfiled, which the item did not anticipate.** The research
this item asked for found the record already written: `scripts/check-anchors.mjs` is described across
several hundred words that sit immediately above BL-051, in the right place in the document, with the
controls, the coverage assertion and the stated limits all recorded. What was missing was the
heading. The account had been written as a continuation of BL-049's block, whose own digression about
stale anchors is what produced the gate, and each of the five commits that extended the gate appended
to that same run of prose. The commit that added the lost-anchor guard says in its message that it
recorded the result "in the BL-050 section", so the author believed a section existed. Nothing
disagreed, because nothing checks that a bold heading exists for every row: the search that found
this was written for BL-055's review and enumerated headings against rows, which no gate does.

That changed what this item had to do, and it is worth saying plainly rather than presenting the
result as the plan. Writing a fresh block from the commits would have duplicated a record that was
already accurate, and left two accounts of one gate to drift apart. So the delivered change adds the
heading, a checklist reconstructed from the five commits, the constraint line and a paragraph saying
the checklist is reconstructed. One sentence of the original record was edited: it opened
`BL-050 closes the loop that all of this opened`, where "all of this" reached back across what is now
a heading boundary, so it names the thread instead.

**The reconstructed checklist is all ticked, and that is a claim worth distrusting.** It was derived
by reading the five commit messages and the shipped script rather than by inferring intent from the
result, which is the failure mode a reconstruction invites. Each of the five tasks names a control
those messages record: fingerprinting, the `git ls-files` population with per-document coverage, the
declared `absent:` exemption, the fatal on a lost anchor and on an unreadable lock, and the historical
controls against the birth commit. The two gaps the work left are filed as BL-056 and BL-060 rather
than carried as open tasks here, so the ledger's count of six tasks left open on purpose is unchanged
by this item. BL-060 has since been parked, which closes that route without reopening the gap here.
The limits the record ends on are limits, not tasks: fingerprinting compares an anchor against its own
past and not against the claim beside it, and no further work on this item would change that.

**Verified by re-running the enumeration that filed it.** Every bold `BL-` heading in this file was
listed against every row of the three tables: 39 headings against 39 scored and parked rows, with no
row lacking a heading and no heading lacking a row. Before this change it was 38 against 39. The
counts in the opening ledger were re-derived from the table rather than incremented, which moved the
delivered figure from twenty-four to twenty-five and added `BL-057` to the list of ids.

This sat inside BL-056's declared scope, because the delivered-id ledger is one of the figures that
item would check, so a gate that existed would have caught it. It was filed separately anyway, because
BL-056 is the checker and this is the content the checker would have demanded. BL-056 now has a second
job this item found for it: nothing checks that a row has a heading, and that is the same kind of
enumeration, over the same table, in the same file.

**BL-059: Stop the changelog entry that explains stale figures from carrying two of its own**

- [x] Decide what a release record should say about a figure that will not stay true
- [x] Rewrite the entry so it no longer needs editing when the tree grows
- [x] Check the rest of `CHANGELOG.md` for the same shape before closing

Constraint gate: checked 1 to 11, none breached.

Filed out of BL-053. BL-055's changelog entry explained that two audited figures went stale by
quoting what they were at the time of writing, which put two live numbers inside a record that is
meant to be written once and left alone. They had needed editing on each of the two items shipped
since, BL-054 and BL-053, both times only because a file grew and a test was added. A release
record that has to be revised whenever unrelated work lands is not recording a release.

This is the case BL-056 put out of scope in its own words, and for the reason it gave: these two
figures come from the tree rather than from the ranked table, so no checker reading this repository's
markdown can recompute them. That makes it a writing problem rather than a tooling one. The likely
answer is that the entry should say the figures were both true when audited and have moved since,
naming neither current value, and leave the current value to the backlog clause that already exists
to carry it. Deciding that is the item.

Not fixed in BL-053, which had to touch those two numbers and would have been widening its own
scope to rewrite the entry that holds them.

Shipped. The rule the item asked for is that a figure belongs in a release record when it is a
property of the change and does not when it is a property of the tree, because only the second kind
moves without anyone editing the record. Both audited figures are properties of the audit and stay;
the two current values were properties of the tree and are gone, replaced by a sentence at
`CHANGELOG.md:236-239` that says so and points at the backlog clause instead. That clause was
checked before the entry was allowed to defer to it: `PRODUCT_BACKLOG.md:151-153` and
`PRODUCT_BACKLOG.md:158-160` do each carry a live value and are marked as needing re-derivation, so
deferring to them loses nothing a reader could previously find.

The same entry carried a third figure of the same kind that the item had not named, in the sentence
about Appendix A's modularity gap: it put the understatement at a thousand lines, which is the
difference between the audited count and the tree. That would have gone stale in the ordinary way,
and BL-042 would have inverted it outright by splitting the file, so the magnitude is dropped and
the direction kept.

The third task found three more of the shape elsewhere in the file, all now tied to the moment of
the change they describe rather than left in the present tense: the README correction said there
were three CI checks, which BL-056 is about to falsify by adding a fourth, and now says the README
named two when the workflow ran three; a fetch helper "is covered by nine tests", now "shipped with
nine tests"; and a rewritten README section's longest sentence "is 36 words", now "came down to 36
words". Each is true permanently rather than until the next unrelated change. Two present-tense
figures were checked and deliberately left, because both describe what their change did rather than
what the tree is: a paragraph that "is now three" paragraphs, and a value that "is now two values".

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
  understand where I am within a large crossover.** `BL-014` `Done`
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
  a mouse so that the app is fully usable with my preferred input method.** `BL-026` `Shipped`
  - Focus order, visible focus, and keyboard actions are consistent.

- **P1: As a screen-reader user, I want list changes and import results announced so
  that I know what happened without relying on visual updates.** `BL-027` `Partial`
  - Important actions have meaningful accessible labels and status messages.

- **P1: As a reader on a small screen, I want the catalog and reading view to remain
  easy to scan so that I can use the app beside Marvel Unlimited.** `BL-028` `Dropped`
  - Dropped by product decision. Marvel Unlimited's own iOS and Android apps already carry
    reading lists, so the phone and tablet job is met first-party. This tracker is a desktop
    companion to the web reader, which is where no list feature exists. See the parked entry
    for BL-028.

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
record of that plan. The order this backlog now suggests is the WSJF sequence in the item table.
The one adjustment a score could not express, that BL-039 should land early regardless of its rank
because every other item is safer to make once the tests run automatically, has been applied and
BL-039 has shipped, so the sequence now stands on the scores alone.

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
- Phone and tablet layout. Marvel Unlimited's iOS and Android apps already support reading lists,
  so the tracker targets the desktop browser it sits beside. See BL-028.

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

Functionally complete against its own backlog: 21 of the 28 original stories shipped in full when
this was assessed. Two gaps remained. One of the two has since closed, and 24 of the 28 ship in full
now.

- Gap: series progress is computed across every list at once rather than for the list being read,
  so a reader inside one crossover sees totals inflated by every other list they have imported.
  Evidence: `src/js/main.js:2435-2469` (renderProgress, which now takes a scope), `src/index.html:346`
  (the view's subtitle).
  Resolved: `BL-014` gave `seriesProgress` an optional list id and put a two-option scope control in
  the view, defaulting to the active list. The evidence above points at the replacement, and the
  subtitle is now written by the render rather than asserting "every list" regardless.
- Gap: the catalog carries a variant grouping model, but only the Hickman creator run populates it.
  All six event lists ship with `group`, `groupName`, and `variant` set to null, so the promise of
  choosing an essential path or a complete path applies to one list out of eight.
  Evidence: `src/data/catalog.json` (per-list `group`, `groupName`, `variant` fields),
  `src/js/main.js:2183` (groupCatalog renders variant rows only where a group exists).
- Correctness is well defended: 224 unit tests pass, 235 when this pass shipped and 311 now, and
  `scripts/check-contract.mjs` pins 24 upstream API assumptions so schema drift is distinguishable
  from an outage.
  Evidence: `package.json:10`, `package.json:13`, `scripts/check-contract.mjs:248-280`.

#### 2. Performance efficiency

Gap, measured rather than inferred. Every state change re-renders the entire application. A single
read toggle on the 219 issue Hickman full list rebuilds the rail, all 219 rows and the progress
block: 4,485 DOM nodes and 1,533 row controls, at a median of 21.9 ms synchronous and 75.7 ms to
paint, with the first toggle costing 38.9 ms and 144.1 ms. Measured headless on a desktop machine,
so a phone will be slower, though phone use is out of scope; see BL-028.

Evidence: `docs/ux-artifacts/render-cost.json`, `src/js/main.js:2630-2643` (renderAll rebuilds
every region), `src/js/main.js:63-68` (store.onChange is wired straight to renderAll),
`src/js/main.js:1499-1596` (renderRows builds every row with no virtualisation and no early exit when
the containing details element is closed).

Loading is handled well by comparison: the three large data files are fetched only on demand, so
the 353 KB series index never loads for a reader who does not search series.
Evidence: `src/js/api.js:12-17`, `src/data/series-index.json`.

#### 3. Compatibility

No gap. Co-existence is a non-issue for a single local process, and interoperability is served in
both directions: JSON backup for round-tripping and Markdown export for reading elsewhere. Zero
runtime dependencies and plain ES modules mean nothing to reconcile with a host application.

Evidence: `package.json:1-29` (no `dependencies` key at all, `engines.node >= 20`),
`src/js/lib/model.js:486-510` (validated backup shape).

The fixed `127.0.0.1:8787` origin is a deliberate storage-bucket decision rather than a
compatibility gap, so it is recorded here and not proposed for change.

#### 4. Interaction capability

The weakest characteristic, and the source of most of this run's findings. Dropping to
sub-characteristic level, because the characteristic-level answer would hide the split.

- Appropriateness recognisability and learnability: good. Labels are written in plain English and
  the availability wording is careful to hedge. Evidence: `src/js/main.js:1598-1603`.
- Operability: gap, accepted. Row actions sit at `opacity: 0` until hover or focus-within, so on a
  touch device they are invisible until tapped. This was BL-028's third task and is dropped with
  it, on the ground that phones and tablets are out of scope. It is recorded as an accepted gap
  rather than a closed one, because a desktop touchscreen still meets it. Evidence:
  `src/styles.css:469-476`.
- User error protection: no gap, closed by BL-034 and BL-035. Deleting a list is confirmed in the
  page rather than by a native `confirm()`, and it can now be undone for the rest of the session,
  which is the same affordance restoring a backup already had. Evidence:
  `src/js/main.js:1293-1320` (undo), `src/js/main.js:2514-2520` (undoRestore exists).
- User engagement and inclusivity: gap. The interface is hard-locked to a dark scheme, and a light
  preference changes nothing. Measured: under emulated `prefers-color-scheme: light` the body
  background stays `rgb(15, 17, 21)` and the two screenshots are byte-identical.
  Evidence: `docs/ux-artifacts/live-inspection.json`, `src/styles.css:7`, `src/index.html:6`.
- Self-descriptiveness: gap, closed by BL-027. The full availability description was carried only
  in a `title` attribute, which never reaches a keyboard or touch user. It is now text inside the
  badge, read in sequence with the short label rather than as a separate hint. Evidence:
  `src/js/main.js:1558-1568`.

#### 5. Reliability

Strong, and clearly the product of deliberate work. Unreadable saved data pauses writing rather
than overwriting, offers a salvage download, and explains itself. A backup from a newer schema is
refused rather than mangled. A fault-injection harness ships alongside the app.

Evidence: `src/index.html:130-141` (blocked banner, saving paused, salvage offered),
`src/js/lib/model.js:409-435` (migrate refuses an unsupported schema version),
`src/dev-faults.html` (fault-injection harness).

- Gap: none of this is verified automatically on change. There is no continuous integration, so the
  224 tests only run when someone remembers. Evidence: `absent: .github/workflows, Get-ChildItem of
  repository root and .github; no pipeline file of any kind`.
  Resolved: `BL-039` added `.github/workflows/ci.yml`, which runs the suite and the linter on every
  push and pull request, and on demand for any ref.

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
  Evidence: `src/js/main.js:2630-2643`, `src/js/main.js:626-654` (showView switches views by
  mutating a module-level variable).
  Still open, and wider than audited: the file is 2,698 lines now, so nearly every item shipped
  since has been added to the one file this gap is about. `BL-053` is the exception in kind rather
  than in size: it moved the reading filter predicates out to `src/js/lib/readingFilters.js` and
  still left `main.js` 8 lines longer, which is the shape of the problem. `BL-055` corrected the
  figure; `BL-042` is the item that would close the gap.
- Testability gap: `src/js/cache.js`, `src/js/hydrate.js` and `src/js/main.js` have no test file,
  and they are exactly the modules holding browser-coupled logic.
  Evidence: `absent: test/cache.test.js, test/hydrate.test.js, test/main.test.js; glob of test/ and
  cross-check of every test file name against src/js`.
- Analysability gap: no linter and no formatter configuration exists, so style drift is caught only
  by review. Evidence: `absent: eslint|prettier config or lint script, read of package.json:8-17 and
  glob of repository root for .eslintrc*, eslint.config.*, .prettierrc*`.
  Resolved: `BL-040` added `eslint.config.mjs` and wired `npm run lint` at `package.json:11-12`.
- Modifiability gap: the retry and backoff logic is duplicated between the two vendoring scripts.
  Evidence: `scripts/lib/fetch-json.mjs:52-61`, `scripts/lib/fetch-json.mjs:22-37`.
  Resolved: `BL-046` extracted it into one module, which all three scripts that page the API now
  call. There were three copies rather than the two counted here, and the evidence above points at
  the replacement, whose header records what was duplicated and what it was hiding.
- Minor analysability gap: the `.row` class carries two unrelated meanings, a reading row and a form
  row, and a leftover empty rule sits between them. Evidence: `src/styles.css:403-406`,
  `src/styles.css:496-512`.
  Resolved: `BL-047` renamed the form row to `.field-row` and deleted the empty rule, so the two
  meanings no longer share a class. The evidence above now points at the replacement, which records
  what the collision was.

#### 8. Flexibility

Swept in full rather than dispositioned.

- Installability: good, and suited to an app cloned and run by hand. `npm start` runs the server
  with no install step, because there is nothing to install. Evidence: `package.json:8-20`.
  Changed since: `BL-040` added three devDependencies and a tracked `package-lock.json`, so linting
  now needs `npm install` first. Running the app still does not, and runtime dependencies are still
  zero.
- Adaptability: good. Plain ES modules with no build step and no bundler mean a Node upgrade
  changes nothing about the client, and `engines.node >= 20` states the floor.
  Evidence: `package.json:21-23`.
- Replaceability: good. The metadata API base URL is user-configurable and validated, the cache is
  keyed by base URL and schema version so switching mirrors does not serve stale data across them,
  and stored state carries a schema version with migrations.
  Evidence: `src/js/main.js:2522-2542`, `src/js/lib/cachePolicy.js:16-20`,
  `src/js/lib/model.js:11` and `src/js/lib/model.js:409-435`.
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
| First-run experience | Gap. The first-run DOM ships an empty `<h2 id="hero-title">`, so the first heading a screen reader meets on an unseeded install is blank. Evidence: `src/index.html:272-307`, `docs/ux-artifacts/pa11y-landing.json`. |
| Empty states | No gap. The unseeded landing state explains what the app is for and routes to the catalog rather than showing a bare shell. Evidence: `docs/ux-artifacts/01-landing-firstrun-1280.png`, `src/index.html:34-37`. |
| Error handling and recovery | Gap, closed by BL-034. Curated import used to report failure through native `alert()` while every other path used the in-page notice system. It now writes to a pane chosen when the message is written, so on the landing page the reason appears beside the catalog it is about rather than stopping the page, and it is not left in a view the reader has already scrolled or navigated away from. Evidence: `src/js/main.js:2353`, `src/js/main.js:2371-2373`, `src/js/main.js:2404` against `src/js/main.js:241-357`. |
| Offline behavior | No gap, and no proposal. Probed as required rather than treated as a caching problem. With the local server running and no internet, the app starts, reads saved state, imports any bundled curated list and marks issues read, because those paths touch only same-origin files. Only cover images, metadata hydration and search degrade, and hydration failure is already surfaced as a pending state rather than as silence. Evidence: `src/data/house_of_m.json`, `src/js/main.js:1562-1568` (pending and by-hand badges), `absent: serviceWorker|navigator.onLine|manifest.json, case-insensitive grep across src/`. Repository Constraint 1 forbids caching cover bytes, so no cover-caching improvement is proposed. |
| Data durability and export | No gap. Full JSON backup and restore, per-list Markdown export, validated and atomic restore with an undo. Evidence: `src/js/lib/model.js:486-510`, `src/js/main.js:2514-2520`. |
| Schema migration | No gap. Stored state carries `SCHEMA_VERSION`, migrations run forward, and a future schema is refused rather than silently coerced, with a test pinning that behaviour. Evidence: `src/js/lib/model.js:11`, `src/js/lib/model.js:409-435`, `test/model.test.js:550-552`. |
| Observability | Partial gap, bounded by Repository Constraint 3. Product analytics are forbidden and are not proposed. What is missing is local and private: there is no way for the reader to see why hydration stalled beyond a queue-depth pill. Evidence: `src/js/main.js:2607-2609`. |
| Performance | Gap, measured. See characteristic 2. Evidence: `docs/ux-artifacts/render-cost.json`. |
| Security, OWASP Top 10 | Gap under A05 Security Misconfiguration: no CSP and no `x-frame-options` on the dev server. Evidence: `server.mjs:112-122`. Resolved: `BL-030` shipped both, assembled at `server.mjs:43-54` and sent at `server.mjs:117` and `server.mjs:120`. Partial gap under A10 Server-Side Request Forgery by analogy: `MarvelApi` accepted any base URL and only stripped trailing slashes, with the https-or-local check living in the settings form rather than in the client. Resolved: `BL-045` moved the rule into the constructor at `src/js/api.js:20-33` and onto the read out of storage at `src/js/main.js:359-383`, so a base the rule refuses cannot reach a fetch from any of the three call sites, and the form keeps its own message at `src/js/main.js:2525-2526`. A01, A02, A03, A07 and A09 are not applicable, because there is no server-side authorisation boundary, no credential store, no server-side query language, no account system and no central log to protect. |
| Privacy | No gap. Nothing is uploaded, there is no account and there is no telemetry, which is the product promise itself. Evidence: `package.json:1-29` (no dependency that could exfiltrate), `absent: analytics|telemetry|gtag|beacon, grep across src/ and scripts/`. |
| Accessibility | Gap, measured and detailed in `docs/UX_STUDY.md`. Headline: 27 pa11y errors on the seeded reading view, 9 definite axe colour-contrast nodes there and 8 in the catalog, and a dead mobile layout rule. Evidence: `docs/ux-artifacts/pa11y-reading-seeded.json`, `docs/ux-artifacts/axe-03-reading-seeded.json`, `src/styles.css:87-90`. Resolved in part: the contrast findings closed under BL-029, BL-030 and BL-048, and the per-finding resolutions are recorded against each finding in `docs/UX_STUDY.md`. The headline counts above are the pre-fix measurements and are left as the record of what the audit found. The dead mobile layout rule is not fixed and will not be: BL-028 is parked, because phone and tablet reading is served by Marvel's own apps. |
| Documentation | No gap for users and maintainers: the README covers setup, the origin decision, the metadata boundary and the closed Android question. Evidence: `README.md`. |
| Testing strategy | Gap. 224 tests pass and the pure logic modules are well covered, but the three browser-coupled modules have none, so no test exercises a render path. Evidence: `absent: test/cache.test.js, test/hydrate.test.js, test/main.test.js; glob of test/ cross-checked against src/js`. Partly changed: the suite is 235 after this pass, but the three modules still have no test file, so the gap itself is unchanged. |
| CI/CD | Gap, total. No workflow, no pipeline, no automated run of the existing suite. Evidence: `absent: .github/workflows, Get-ChildItem of repository root and .github; no pipeline file of any kind`. Resolved: `BL-039` added `.github/workflows/ci.yml`, which runs the suite and the linter on every push and pull request, and on demand for any ref. |
| Release and versioning | Gap. Version is pinned at `0.1.0` with no tags and no changelog, so there is no way to say which build a backup or a bug report came from. Evidence: `package.json:3`, `absent: CHANGELOG.md and git tags, glob of repository root and git tag --list`. Resolved: `BL-043` set the version to `1.0.0` at `package.json:3`, added `CHANGELOG.md`, and wired a `version` script at `package.json:19` that syncs the version the app reports. |
| Dependency management | Not applicable, because runtime dependencies are zero by Repository Constraint 4, there are no `devDependencies`, and there is therefore no lockfile and no dependency graph to manage or audit. The repository invokes no package-fetching tool at all. Evidence: `package.json:1-29` (neither a `dependencies` nor a `devDependencies` key), `absent: npx, grep across the repository returning only this appendix's own text`. The absence of dev tooling is recorded as a maintainability and CI gap above rather than counted twice here. Changed since: the "not applicable" verdict no longer holds. `BL-040` added three `devDependencies` at `package.json:24-28` and a tracked `package-lock.json`, so there is now a dev dependency graph to audit even though runtime dependencies remain zero. |
| Licensing | No gap. The project is MIT, and every vendored order records its upstream source and licence rather than absorbing it silently. Evidence: `LICENSE`, `src/data/catalog.json` (`source` and `sourceLicense` per list), `src/js/main.js:2236-2256` (attribution rendered in the UI before import). |

## Appendix B: Priority disagreements

The `P` labels in this document are the original author's release intent. WSJF is a separate,
mechanical ranking. Neither overwrites the other. Every case where they disagree is listed here for
a human to settle.

Only two of the 28 original stories are still open work and therefore carry both a label and a
score that can disagree: BL-007 and BL-017. Five more keep a label but can no longer disagree,
because BL-014, BL-026 and BL-027 have shipped and BL-025 and BL-028 were dropped; four of those
five keep a score too, BL-025 having been dropped before it was ever scored. The
remaining 21 are `Done` and were never scored. The 22 items this pass created carry no label,
because inventing one would fabricate an intent that no one stated. Six original stories were still
open when the pass ran, so the table was 28 rows then. BL-028 has since been parked and ten further
items filed, none of them labelled. Two of those, BL-060 and BL-061, arrived after the pass in the
same way, and BL-060 has since been parked in its turn, which is how it reaches 37 rows now. The
ranks below are
positions in it as it stands.

### Case 1: BL-026 is labelled P0 but ranks seventeenth

- Stated: P0 Foundation, the first keyboard story in the original Epic 7.
- Calculated: WSJF 3.67, rank 17 of 39.
- Driver: job size, not value. Its Cost of Delay of 11 is the fourth highest figure in the backlog.
  It is outranked by sixteen items sized 1, 2 or 3 whose Cost of Delay is lower but whose size is
  smaller still. WSJF is explicitly a throughput heuristic, so a P0 that costs 3 will always sit
  below a cheap fix that costs 1.
- What a human should settle: whether "Foundation" here means "must be finished before anything
  else ships" or "must not be dropped". If the former, the label wins and BL-026 moves to the top
  regardless of the score. If the latter, the score's ordering is fine, because the sixteen items
  above it total a small amount of work.
- Complicating evidence: the measured keyboard picture is better than the P0 label implies. All 45
  tab stops carry a visible focus ring, focus order matches reading order, and the reverse walk
  escaped cleanly. Evidence: `docs/ux-artifacts/live-inspection.json`. The remaining defect is
  narrow, which is part of why the size is only 3.
- Settled by events: BL-026 has shipped, so the question no longer needs an answer for this item.
  The second reading won in practice. Every one of the eleven cheaper items in Case 4 was built
  first and BL-026 followed, which is the order the score gave and not the order the label gave.
  Nothing was harmed by waiting, so treat a Foundation label as "must not be dropped" unless a
  future item's own evidence says otherwise.

### Case 2: BL-007 is labelled P1 but ranks thirty-fifth

- Stated: P1 Core product value, event order variants.
- Calculated: WSJF 1.4, rank 35 of 39, below thirty-one unlabelled items and three places above the
  single P2 story.
- Driver: both sides. Job size is 5, because the work is editorial rather than technical, and value
  is only 3, because the rendering that would display variants already ships and works. Evidence:
  `src/js/main.js:2183` and `src/js/main.js:2213-2218`. What is missing is data, in
  `src/data/catalog.json`.
- What a human should settle: whether variants are a product commitment or a nice-to-have. This is
  the one open item whose value depends entirely on an editorial decision nobody has recorded, so
  the score is guessing at the answer.

### Case 3: BL-028 carried the highest Cost of Delay in the backlog and was dropped anyway

- Stated: P1 Core product value.
- Calculated: WSJF 3.6 at a Cost of Delay of 18, which was the highest of any item here, held down
  to rank 15 of 28 by a job size of 5 alone. <!-- counts:frozen -->
- Settled, and no longer a label-versus-score disagreement. Neither number was the deciding
  argument. The item was dropped because Marvel Unlimited's iOS and Android apps already carry
  reading lists, so the reader this item served is better served by software that is not ours. A
  high Cost of Delay measures how much a problem costs while it stays open, and it says nothing
  about whether the problem is the product's to solve.
- What this case is kept for: it is the one item here where the highest measured urgency in the
  backlog lost to a scope judgement, and both WSJF and the P1 label would have argued for building
  it. Evidence for the state that prompted it is unchanged and still recorded in the reconciliation
  table and in `docs/UX_STUDY.md`.
- Consequence for the ranking: with BL-028 removed the table was 34 rows, and is 36 now that BL-058
  and BL-059 have been filed. BL-060 was filed here too and then parked on 2026-08-07, which is why
  the count moved by two rather than three. The highest Cost of Delay among the items that remain is
  16, shared by BL-029, BL-039 and BL-050. That sentence was briefly untrue while BL-060 sat in the
  table carrying 18, and parking it made the sentence right again rather than requiring an edit. The
  five ranks quoted below are correct on the same basis: they were computed without BL-060 and are
  accurate again now that it is out of the table.

### Case 4: eleven items created this pass outrank the only open P0 story

- Stated: nothing. These items have no label because none was ever assigned.
- Calculated: BL-030, BL-029, BL-039, BL-050, BL-044, BL-048, BL-040, BL-043, BL-035, BL-047 and
  BL-049 all rank above BL-026.
- Driver: ten of the eleven are sized 1 or 2, and the eleventh, BL-035, is sized 3. They are small,
  evidenced defects and enablers, and WSJF rewards exactly that shape.
- What a human should settle: whether an unlabelled item is allowed to precede a P0 at all. If the
  release labels are a gate rather than a sort, then this whole group is blocked behind BL-026, and
  the ranking below the gate is what WSJF is actually for.
- Settled by events: the labels behaved as a sort, not a gate. All eleven shipped ahead of BL-026
  and none of them was blocked by it. BL-026 has now shipped too, so this heading records
  the state at the ranking pass and is no longer a present-tense claim: there is no open P0 story
  left in the table.

### Where the label and the score agree

- BL-014, P1, rank 24 of 39. Mid-table, which is where a P1 belongs.
- BL-027, P1, rank 18 of 39. Mid-table.
- BL-017, P2, rank 38 of 39. The lowest-ranked scored story other than the one that cannot be
  sized, which matches its P2 label exactly.
- BL-025, P2, parked. The label is moot, because the item was removed by the constraint gate before
  it could be scored.

### One caution about the score itself

BL-042 carries a risk-reduction score of 8, joint highest in the backlog alongside BL-039, BL-041
and BL-050, and still ranks last at 0.55. That is entirely the size 20 denominator. The rank is
arithmetically correct and practically misleading: the item is not low value, it is unsplit. It is
held at `Proposed` rather than `Ready` for that reason, and the honest reading of its rank is
"cannot be scheduled yet", not "not worth doing".
