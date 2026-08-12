# Marvel Reading Tracker Expansion Backlog

This backlog describes the next product improvements in plain English. It is intended
for review before implementation. The goal is to make the tracker useful for many
Marvel reading lists and events, not only Jonathan Hickman's Secret Wars orders.

It was rewritten after a full pass over the shipped code, so it now records what has already been
built as well as what has not. Of the 28 stories originally written here, 24 ship in full, 1 ships
in part, 1 was never started, 1 is ruled out by a product constraint, and 1 is dropped by a product
decision. The new items come from that same pass and from the UX study in `docs/UX_STUDY.md`.

Sixty-six items have since been delivered and are marked `Shipped` in the table below: BL-007,
BL-014, BL-017, BL-026, BL-027, BL-029, BL-030, BL-031, BL-032, BL-033, BL-034, BL-035, BL-036,
BL-037, BL-038, BL-039, BL-040, BL-041, BL-043, BL-044, BL-045, BL-046, BL-047, BL-048, BL-049,
BL-050, BL-051, BL-052, BL-053, BL-054, BL-055, BL-056, BL-057, BL-058, BL-059, BL-061, BL-062,
BL-063, BL-064, BL-065, BL-066, BL-067, BL-068, BL-069, BL-070, BL-071, BL-072, BL-073, BL-074,
BL-075, BL-076, BL-077, BL-078, BL-079, BL-080, BL-081, BL-082, BL-083, BL-087, BL-088, BL-089,
BL-095, BL-096, BL-099, BL-100 and BL-106.
Their detail blocks record what changed, what was measured, and which tasks were deliberately left
open. BL-049 is the one whose delivery was a decision rather than a code change: it was measured in
full and closed without touching the colours, for the reasons recorded in its block. Ten remain
open on purpose: making the CI run required before merge is a repository setting rather than a
change to the tree, tagging a release needs a commit to point at, confirming BL-027 with a screen
reader is a human check no automated run substitutes for, BL-031's axe re-run cannot be satisfied as
written, because axe declines to judge text over a gradient and the finding was answered by
computing the contrast bound instead, BL-065's third task was answered by measurement rather than
ticked, because no colour raises that pair without reversing which end of a progress bar looks
fuller, BL-033's rail task was answered by measuring the rail at 9 nodes and 2 of them churning on a
read toggle, which is not what that item was raised about, BL-051's README walkthrough has to be
done by someone who does not write software, which is the one thing its author cannot self-certify,
BL-096's reporting route cannot be turned on while this repository is private, which was checked
against the endpoint rather than assumed, BL-089's secret scanning cannot be turned on for the
same reason, which GitHub says in as many words when asked, and BL-099's legal review is a judgement
no document can supply, least of all the document written to ask for it.
`CHANGELOG.md` carries the
user-facing view of the same work.

Eighteen further items, BL-083 through BL-100, come from the 2026-08-10 repository assurance and
open-source readiness study. Ten of them are still `Ready`: the study records gaps for later
implementation and does not mix those fixes into the roadmap change that identified them. BL-083,
BL-087, BL-088, BL-089, BL-095, BL-096, BL-099 and BL-100 have since been delivered, and their
detail blocks record what changed. BL-101 through BL-108 are the eight items here that came from
neither pass. BL-101 through BL-105 and BL-108 were each raised by the review of one of the items
above them and routed to the backlog rather than folded into it, because each belongs to a
different file from the one under repair. Filing them rather than fixing them in place is what
keeps one change to one concern, and each names the review that raised it. The other two were
raised by nobody's review: BL-106 was asked for directly by the owner, and BL-107 was found while
writing BL-106's record.

BL-109, BL-110 and BL-111 come from a third pass, a research task on 2026-08-12 asking where cover
art and issue details could come from for the issues the vendored snapshot left empty. Its answer was
that they can come from nowhere the current source reaches, because that source is complete rather
than behind, and the three items are the defects the research found on this side of that boundary
rather than the question it was asked. All three are `Ready`, and none of them needs a new data
source.

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
| 1.1 | BL-001 | P0 | catalogRow renders name, type, count and description at `src/js/main.js:2657-2691` | Done |
| 1.2 | BL-002 | P0 | catalog filter fieldset at `src/index.html:411-413`, filterByFacet imported at `src/js/main.js:18` | Done |
| 1.3 | BL-003 | P1 | search form at `src/index.html:404-410`, search-as-you-type at `src/js/main.js:2719-2734` | Done |
| 1.4 | BL-004 | P1 | depth pill rendered before the Import button at `src/js/main.js:2665` and `src/js/main.js:2674-2679` | Done |
| 2.1 | BL-005 | P0 | all five named events ship as data: `src/data/house_of_m.json`, `src/data/civil_war.json`, `src/data/secret_invasion.json`, `src/data/annihilation.json`, `src/data/king_in_black.json` | Done |
| 2.2 | BL-006 | P0 | attributionLine renders source and snapshot date at `src/js/main.js:2697-2717` | Done |
| 2.3 | BL-007 | P1 | three of the five events now ship a main-series variant beside the complete order, grouped in `src/data/catalog.json`; the two whose main series does not open their order are refused by `scripts/build-event-order.mjs:441-451` and say so | Done, shipped as BL-007 |
| 2.4 | BL-008 | P1 | orders and catalog generated by `scripts/vendor-orders.mjs:190-304`, consumed as data with no view change | Done |
| 3.1 | BL-009 | P0 | parseChecklist and the import report at `src/js/main.js:2358-2414`, `src/js/lib/markdown.js:36-112` | Done |
| 3.2 | BL-010 | P1 | unresolvedRow offers search, auto-accepts a unique exact match, else lists candidates with series and date at `src/js/main.js:2422-2491` | Done |
| 3.3 | BL-011 | P1 | series and creator adds at `src/js/main.js:2320-2338`, manual issue add at `src/js/main.js:2493-2537` | Done |
| 3.4 | BL-012 | P2 | duplicate at `src/js/main.js:1518-1538`, with read progress deliberately shared rather than copied per `src/js/lib/model.js:198` | Done |
| 4.1 | BL-013 | P0 | renderRail marks the active list with `aria-current` and a progress bar at `src/js/main.js:852-892` | Done |
| 4.2 | BL-014 | P1 | the progress view is scoped to the active list at `src/js/main.js:2896-2930`, with a scope control at `src/index.html:371-375` and a subtitle that stops claiming every list at `src/js/main.js:2910-2912` | Done, shipped as BL-014 |
| 4.3 | BL-015 | P1 | all four named filters plus All at `src/js/lib/readingFilters.js:25-48`, applied without touching stored order at `src/js/main.js:1879` | Done |
| 4.4 | BL-016 | P1 | hero next-unread and Done, next at `src/index.html:295-330` | Done |
| 4.5 | BL-017 | P2 | notes on both shapes at `src/js/lib/model.js:423-452`, quoted into the Markdown export at `src/js/lib/markdown.js:177-179` | Done, shipped as BL-017 |
| 5.1 | BL-018 | P0 | pending and by-hand badges at `src/js/main.js:1975-1981`, pending filter at `src/js/lib/readingFilters.js:46` | Done |
| 5.2 | BL-019 | P1 | five-state availability model at `src/js/lib/availability.js:17-23`, hedged short labels at `src/js/main.js:2036-2041` | Done |
| 5.3 | BL-020 | P1 | manual entries carry `source: 'manual'` at `src/js/main.js:2516` and render, reorder, export and back up like any other issue | Done |
| 5.4 | BL-021 | P2 | `scripts/check-contract.mjs:248-280` runs a set of upstream assumptions and exits non-zero when any has drifted, wired as `npm run contract` at `package.json:13` | Done |
| 6.1 | BL-022 | P0 | validated backup shape at `src/js/lib/model.js:671-699` | Done |
| 6.2 | BL-023 | P1 | same backup file restores on another browser, validated and atomic, with undo at `src/js/main.js:3040-3046` | Done |
| 6.3 | BL-024 | P1 | Export as Markdown ships as a list tool, confirmed in the live DOM at `docs/ux-artifacts/viewport-sweep-reading.json` | Done |
| 6.4 | BL-025 | P2 | not applicable. Ruled out by Repository Constraint 3, which forbids accounts and cloud services, and already listed as out of scope at the end of this document | Forbidden, Constraint 3 |
| 7.1 | BL-026 | P0 | focus order and visible focus pass across 45 measured tab stops in `docs/ux-artifacts/live-inspection.json`, and the shortcut handler now stands down for text entry and for an open dialog at `src/js/main.js:2067-2090` | Done, shipped as BL-026 |
| 7.2 | BL-027 | P1 | announcements fired into two live regions at once and the first-run heading was empty per `docs/ux-artifacts/pa11y-landing.json`; both are fixed, and `notify` now picks one channel at `src/js/main.js:254-267` and `src/js/main.js:356-377` | Done, shipped as BL-027 |
| 7.3 | BL-028 | P1 | the mobile rail rule at `src/styles.css:213-216` is overridden by `src/styles.css:220-224`, and the reading view overflows by 93 px at 320 px per `docs/ux-artifacts/viewport-sweep-reading.json` | Dropped, product decision |

### Orientation disagreements

Three quantities used to brief this pass disagreed with what the repository actually contains. They
are recorded rather than inherited.

* `src/js/main.js` is 1,566 lines, not 1,543, by `(Get-Content).Count` and confirmed by the last
  line number when reading the file. Evidence: `src/js/main.js:3307-3327`. The work shipped since has
  taken it to 3,413; 1,566 is the figure as audited.
* `src/js/ui/` does not exist in this worktree. Evidence: `absent: src/js/ui, Test-Path returning
  False and a recursive directory listing of src/`. Git cannot track an empty directory, so an
  empty `src/js/ui/` in another checkout is a local artifact rather than repository content. Either
  way the conclusion is the same: there is no view layer to put components in.
* The test count is 224 passing, not the 119 recorded in `.copilot-tracking/changes/`. Evidence:
  `package.json:10`, and a full run of `npm test`. The items shipped in this pass have since taken
  it to 634; 224 is the figure as audited.

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
| BL-030 | Stop dimming read rows with a blanket opacity | Defect | EP-08 | Leaves alone | 5 | 3 | 2 | 1 | 10.0 | none | Measured | Shipped | src/styles.css:557-566 |
| BL-083 | Make backup restore truthful under every write failure | Defect | EP-06 | Follows BL-023 | 8 | 8 | 13 | 3 | 9.67 | none | Measured | Shipped | src/js/storage.js:341-408 |
| BL-096 | Publish a security policy and private reporting route | Enabler | EP-12 | Leaves alone | 5 | 5 | 8 | 2 | 9.0 | none | Observed | Shipped | SECURITY.md:29-42 |
| BL-100 | Establish a pre-publication content and history gate | Chore | EP-12 | Follows BL-089 | 5 | 8 | 13 | 3 | 8.67 | none | Measured | Shipped | scripts/check-publication.mjs:36-44 |
| BL-029 | Raise the red accent so white text on it clears 4.5:1 | Defect | EP-08 | Leaves alone | 8 | 5 | 3 | 2 | 8.0 | none | Measured | Shipped | src/styles.css:27-35 |
| BL-039 | Run the test suite automatically on every change | Enabler | EP-12 | Leaves alone | 5 | 3 | 8 | 2 | 8.0 | none | Observed | Shipped | absent: .github/workflows, directory listing of repository root and .github |
| BL-050 | Fail the build when an evidence anchor stops naming the code it claims | Enabler | EP-12 | Leaves alone | 5 | 3 | 8 | 2 | 8.0 | none | Measured | Shipped | absent: any check of anchor identity, read of .github/workflows/ci.yml and the package.json scripts block |
| BL-095 | Put explicit deadlines on CI jobs | Chore | EP-12 | Extends BL-039 | 2 | 2 | 3 | 1 | 7.0 | none | Measured | Shipped | .github/workflows/ci.yml:103-105 |
| BL-088 | Pin and harden workflow actions for untrusted contributions | Enabler | EP-12 | Extends BL-039 | 3 | 2 | 8 | 2 | 6.5 | none | Observed | Shipped | .github/workflows/ci.yml:68-91 |
| BL-044 | Send a content security policy and frame options from the dev server | Enabler | EP-12 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | server.mjs:112-122 |
| BL-048 | Correct the availability comment that names four states | Debt | EP-05 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | src/js/lib/availability.js:10 |
| BL-040 | Add a linter and formatter | Chore | EP-12 | Leaves alone | 2 | 1 | 3 | 1 | 6.0 | none | Observed | Shipped | absent: eslint or prettier config or lint script, read of package.json:8-17 and glob of repository root |
| BL-099 | Clarify the license and provenance boundary for committed data | Debt | EP-12 | Leaves alone | 8 | 8 | 13 | 5 | 5.8 | none | Measured | Shipped | src/data/curated-lists.json:80-120 |
| BL-087 | State the network privacy boundary where the promise appears | Debt | EP-05 | Leaves alone | 5 | 3 | 3 | 2 | 5.5 | none | Measured | Shipped | src/index.html:503 |
| BL-091 | Let catalog descriptions survive the WCAG text-spacing override | Defect | EP-07 | Leaves BL-028 alone | 5 | 3 | 3 | 2 | 5.5 | none | Measured | Ready | src/styles.css:817-820 |
| BL-101 | Withdraw the undo-restore offer when erasing everything | Defect | EP-06 | Follows BL-083 | 5 | 3 | 3 | 2 | 5.5 | none | Measured | Ready | src/js/main.js:3076-3089 |
| BL-085 | Bound backup restore before parsing and persistence | Enabler | EP-06 | Extends BL-022 | 5 | 3 | 8 | 3 | 5.33 | none | Measured | Ready | src/js/main.js:3010-3038 |
| BL-084 | Prevent one tab from overwriting another tab's progress | Defect | EP-06 | Leaves BL-075 alone | 8 | 5 | 13 | 5 | 5.2 | none | Measured | Ready | src/js/storage.js:290-335 |
| BL-104 | Let the anchors gate see a citation of a file with no extension | Debt | EP-12 | Extends BL-079 | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Ready | scripts/check-anchors.mjs:32 |
| BL-105 | Derive the roadmap paragraph's status split in the counts gate | Debt | EP-12 | Extends BL-059 | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Ready | scripts/check-counts.mjs:225-258 |
| BL-106 | Credit Comic Book Herald where a new reader would look for it | Chore | EP-12 | Follows BL-099 | 2 | 1 | 2 | 1 | 5.0 | none | Observed | Shipped | absent: any mention of Comic Book Herald in README.md, search of every tracked file on main for the name, which ten of them carry |
| BL-107 | Date or re-derive the repeat figures BL-058 states as current | Debt | EP-12 | Extends BL-059 | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Ready | PRODUCT_BACKLOG.md:3836-3839 |
| BL-111 | Check the metadata source for what it covers, not only what it returns | Enabler | EP-05 | Extends BL-021 | 1 | 1 | 3 | 1 | 5.0 | none | Measured | Ready | scripts/check-contract.mjs:62-67 |
| BL-043 | Give releases a version, a tag and a changelog | Chore | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Observed | Shipped | package.json:3 |
| BL-055 | Record the drift in the audited figures instead of letting them go stale | Debt | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Shipped | PRODUCT_BACKLOG.md:175-187 |
| BL-059 | Stop the changelog entry that explains stale figures from carrying two of its own | Debt | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Shipped | absent: any current line count or test count in the entry, read of the audited-figures entry in CHANGELOG.md |
| BL-057 | Write the detail block BL-050 never got, which two sentences promise a reader | Debt | EP-12 | Leaves alone | 2 | 1 | 2 | 1 | 5.0 | none | Measured | Shipped | absent: any **BL-050:** block, enumeration of every bold BL heading against every table row |
| BL-089 | Turn on repository security and dependency monitoring | Enabler | EP-12 | Extends BL-040 | 3 | 3 | 8 | 3 | 4.67 | none | Measured | Shipped | .github/dependabot.yml:34-71 |
| BL-098 | Define review ownership and contribution intake | Enabler | EP-12 | Follows BL-097 | 3 | 3 | 8 | 3 | 4.67 | none | Observed | Ready | absent: CODEOWNERS and issue or pull request templates, tracked-file inventory |
| BL-056 | Fail the build when a derived count in the backlog disagrees with the table it is derived from | Enabler | EP-12 | Leaves alone | 3 | 1 | 5 | 2 | 4.5 | none | Measured | Shipped | absent: any recomputation of a stated count, read of the package.json scripts block and .github/workflows/ci.yml |
| BL-035 | Offer an undo after a list is deleted | Story | EP-11 | Leaves alone | 5 | 2 | 5 | 3 | 4.0 | none | Observed | Shipped | src/js/main.js:1604-1631 |
| BL-047 | Split the two meanings of the row class | Debt | EP-12 | Leaves alone | 1 | 1 | 2 | 1 | 4.0 | none | Observed | Shipped | src/styles.css:662-678 |
| BL-049 | Decide whether the faint badge borders need to meet the 3:1 non-text minimum | Defect | EP-08 | Leaves alone | 1 | 1 | 2 | 1 | 4.0 | none | Measured | Shipped | src/styles.css:464 |
| BL-061 | Take the two em dashes out of the copy the app puts on screen | Chore | EP-12 | Leaves alone | 2 | 1 | 1 | 1 | 4.0 | none | Measured | Shipped | eslint.config.mjs:56-67 |
| BL-068 | Stop the model reading a list id that names a prototype member | Defect | EP-12 | Leaves alone | 3 | 2 | 3 | 2 | 4.0 | none | Measured | Shipped | src/js/lib/model.js:640 |
| BL-090 | Announce passive service, cache and hydration status changes once | Defect | EP-07 | Extends BL-027 | 3 | 2 | 3 | 2 | 4.0 | none | Measured | Ready | src/js/main.js:3246-3294 |
| BL-103 | Retire the branches publication would put on display | Chore | EP-12 | Follows BL-100 | 1 | 1 | 2 | 1 | 4.0 | none | Measured | Ready | 9 of the 22 heads git ls-remote advertises are the head branches of already-merged pull requests |
| BL-110 | Count the issues an order imported empty, and say so | Defect | EP-05 | Extends BL-009 | 3 | 2 | 3 | 2 | 4.0 | none | Measured | Ready | src/js/main.js:2849 |
| BL-026 | Make every action reachable and repeatable from the keyboard | Story | EP-07 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | P0 | Measured | Shipped | src/js/lib/shortcuts.js:26-60 |
| BL-097 | Publish contribution, conduct, support and maintainer governance | Chore | EP-12 | Extends BL-052 | 3 | 3 | 5 | 3 | 3.67 | none | Observed | Ready | README.md:269-314 |
| BL-027 | Announce each change once, in a way a screen reader can use | Story | EP-07 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | P1 | Measured | Shipped | src/js/main.js:356-377 |
| BL-031 | Put a scrim behind hero text so its contrast stops depending on the cover | Defect | EP-08 | Leaves alone | 5 | 3 | 3 | 3 | 3.67 | none | Measured | Shipped | src/index.html:295-330 |
| BL-051 | Make the README enough for a non-engineer to run the app | Chore | EP-12 | Leaves alone | 3 | 1 | 3 | 2 | 3.5 | none | Observed | Shipped | absent: any address, prerequisite, success indicator or troubleshooting section in README.md, read of README.md and a literal run of npm start in a fresh clone |
| BL-086 | Keep cover requests inside the stated trust boundary | Defect | EP-05 | Extends BL-044 | 3 | 2 | 5 | 3 | 3.33 | none | Measured | Ready | src/js/lib/model.js:94-115 |
| BL-094 | Test the local host and launcher contract | Enabler | EP-12 | Extends BL-041 | 3 | 2 | 5 | 3 | 3.33 | none | Observed | Ready | server.mjs:76-168 |
| BL-108 | Make the cover art switch stop the cover requests it hides | Defect | EP-05 | Follows BL-087 | 3 | 2 | 5 | 3 | 3.33 | none | Measured | Ready | src/js/main.js:485-488 |
| BL-093 | Make real-browser regression evidence reproducible | Enabler | EP-12 | Extends BL-041 | 5 | 3 | 8 | 5 | 3.2 | none | Measured | Ready | absent: committed browser-runner script, tracked-file inventory and package scripts |
| BL-109 | Tell an issue upstream refused apart from one nobody has asked about | Defect | EP-05 | Extends BL-018 | 5 | 3 | 8 | 5 | 3.2 | none | Measured | Ready | src/js/main.js:2820 |
| BL-045 | Move the API base URL check into the client that uses it | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Observed | Shipped | src/js/api.js:20-33 |
| BL-063 | Extend the Constraint 11 check past JavaScript to the page and its styling | Chore | EP-12 | Leaves alone | 2 | 1 | 1 | 2 | 2.0 | none | Measured | Shipped | test/shipped-copy.test.js:47-63 |
| BL-062 | Delete the paragraph that BL-054's block states twice over | Debt | EP-12 | Leaves alone | 1 | 1 | 1 | 1 | 3.0 | none | Measured | Shipped | scripts/check-counts.mjs:324-354 |
| BL-014 | Count series progress for the list being read | Story | EP-04 | Leaves alone | 5 | 2 | 2 | 3 | 3.0 | P1 | Observed | Shipped | src/js/main.js:2896-2930 |
| BL-070 | Print each citation's claim beside its line at bless time | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Measured | Shipped | scripts/check-anchors.mjs:494 |
| BL-072 | Give the recovery banner's two actions different weights | Story | EP-11 | Leaves alone | 3 | 3 | 2 | 2 | 4.0 | none | Measured | Shipped | src/styles.css:944 |
| BL-073 | Say the recovery instructions once instead of twice | Debt | EP-11 | Leaves alone | 2 | 2 | 2 | 2 | 3.0 | none | Observed | Shipped | src/index.html:147-148 |
| BL-075 | Keep the reason saving is paused where the reader can still see it | Debt | EP-11 | Leaves alone | 3 | 2 | 2 | 2 | 3.5 | none | Measured | Shipped | src/js/storage.js:60 |
| BL-076 | Stop a reload during a second incident writing another dated salvage copy | Defect | EP-06 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Measured | Shipped | src/js/storage.js:90-100 |
| BL-071 | Bring the citations in code comments under the anchors gate | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 3 | 2.0 | none | Measured | Shipped | scripts/check-anchors.mjs:193 |
| BL-077 | Bring relative citations under the anchors gate, or stop writing them | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Measured | Shipped | scripts/check-anchors.mjs:282-297 |
| BL-078 | Print a first-time citation at bless time, since it has nothing to be compared against | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Measured | Shipped | scripts/check-anchors.mjs:934 |
| BL-079 | Teach the gate the comment syntax of every file it already reads | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Measured | Shipped | scripts/check-anchors.mjs:271 |
| BL-080 | Pair a citation whose scope alone was renamed, rather than report a loss and an addition | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Observed | Shipped | scripts/check-anchors.mjs:1035 |
| BL-081 | Let the repetition check see a copy that is not next to its original | Debt | EP-12 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Measured | Shipped | scripts/check-counts.mjs:381-419 |
| BL-082 | Give the salvage copies a life beyond the incident that wrote them | Debt | EP-06 | Leaves alone | 2 | 1 | 3 | 2 | 3.0 | none | Measured | Shipped | src/js/storage.js:222-245 |
| BL-074 | Draw the architecture and data flow the code already has | Chore | EP-12 | Leaves alone | 3 | 2 | 3 | 3 | 2.67 | none | Observed | Shipped | absent: any architecture or data flow diagram, read of docs/ and every tracked Markdown file |
| BL-034 | Replace the native dialogs with the app's own notice system | Debt | EP-11 | Leaves alone | 3 | 2 | 3 | 3 | 2.67 | none | Observed | Shipped | src/js/ask.js:35-47 |
| BL-054 | Put focus back where it was when the shelf and the full order rebuild | Debt | EP-07 | Leaves alone | 3 | 2 | 3 | 3 | 2.67 | none | Measured | Shipped | src/js/main.js:232 |
| BL-058 | Keep focus on the home grid and the rail when their lists rebuild | Debt | EP-07 | Leaves alone | 3 | 2 | 3 | 3 | 2.67 | none | Measured | Shipped | absent: any capture of the focused control before importCurated disables it, read of addFromCatalog and renderRail |
| BL-037 | Keep the chosen filter across a reload | Story | EP-10 | Leaves alone | 3 | 1 | 1 | 2 | 2.5 | none | Observed | Shipped | src/js/main.js:85 |
| BL-066 | Offer a reading order grouped by the collected editions it is sold in | Story | EP-02 | Leaves alone | 5 | 2 | 5 | 5 | 2.4 | none | Measured | Shipped | src/data/orders/new-ultimate-universe-trades.md:19 |
| BL-038 | Build the two Library sub-views the adopted design specified | Story | EP-10 | Leaves alone | 3 | 1 | 2 | 3 | 2.0 | none | Observed | Shipped | design/mockups/5-longbox-focus.html:169-172 |
| BL-092 | Bring the fault harness under the alternate-page accessibility baseline | Debt | EP-07 | Leaves BL-034 alone | 1 | 1 | 2 | 2 | 2.0 | none | Measured | Ready | src/dev-faults.js:12-22 |
| BL-102 | Send the security headers on the dev server's error responses too | Debt | EP-12 | Follows BL-096 | 1 | 1 | 2 | 2 | 2.0 | none | Measured | Ready | server.mjs:86-96 |
| BL-046 | Share the retry and backoff between the two vendor scripts | Debt | EP-12 | Leaves alone | 1 | 1 | 2 | 2 | 2.0 | none | Observed | Shipped | scripts/lib/fetch-json.mjs:52-61 |
| BL-053 | Make the reading filters one list rather than two that must agree | Debt | EP-12 | Leaves alone | 1 | 1 | 2 | 2 | 2.0 | none | Observed | Shipped | src/js/lib/readingFilters.js:25-48 |
| BL-067 | Gate the switch and the primary button, which no pair measures | Debt | EP-08 | Leaves alone | 2 | 2 | 2 | 3 | 2.0 | none | Measured | Shipped | src/styles.css:393 |
| BL-069 | Close the three accent boundaries the BL-067 review found and could not gate | Debt | EP-08 | Leaves alone | 2 | 1 | 2 | 3 | 1.67 | none | Measured | Shipped | src/styles.css:290 |
| BL-041 | Cover the three browser-coupled modules with tests | Enabler | EP-12 | Leaves alone | 3 | 2 | 8 | 8 | 1.63 | none | Observed | Shipped | absent: test/cache.test.js and test/hydrate.test.js and test/main.test.js, glob of test/ cross-checked against src/js |
| BL-052 | Make the contributor sections of the README readable at the same standard | Chore | EP-12 | Leaves alone | 1 | 1 | 1 | 2 | 1.5 | none | Observed | Shipped | absent: any sentence-length or vocabulary standard applied to README.md below the contributor heading, read of README.md |
| BL-033 | Re-render only what changed when an issue is marked read | Debt | EP-09 | Leaves alone | 5 | 2 | 5 | 8 | 1.5 | none | Measured | Shipped | src/js/main.js:3307-3321 |
| BL-007 | Give the event orders the variants the catalog can already carry | Story | EP-02 | Leaves alone | 3 | 2 | 2 | 5 | 1.4 | P1 | Observed | Shipped | src/data/catalog.json |
| BL-032 | Offer a light theme and follow the system preference | Story | EP-08 | Leaves alone | 3 | 2 | 2 | 5 | 1.4 | none | Measured | Shipped | src/styles.css |
| BL-065 | Raise the six non-text boundaries that sit below 3:1 | Debt | EP-08 | Depends on | 3 | 2 | 2 | 5 | 1.4 | none | Measured | Shipped | scripts/check-palette.mjs |
| BL-036 | Make the current view and list addressable in the URL | Story | EP-10 | Leaves alone | 5 | 2 | 3 | 8 | 1.25 | none | Observed | Shipped | src/js/lib/route.js:35-43 |
| BL-064 | Make the view file importable so its render paths can be tested | Enabler | EP-12 | Depends on | 3 | 2 | 8 | 13 | 1.0 | none | Measured | Shipped | src/js/app.js:12 |
| BL-017 | Let a reader keep notes on a list or an issue | Story | EP-04 | Leaves alone | 2 | 1 | 1 | 5 | 0.8 | P2 | Observed | Shipped | src/js/lib/model.js:432-440 |
| BL-042 | Break the single view file into per-view modules | Debt | EP-12 | Leaves alone | 2 | 1 | 8 | 20 | 0.55 | none | Measured | Proposed | src/js/main.js:3307-3321 |

### Parked

| ID | Title | Type | Epic | Relationship | V | TC | RE | Size | WSJF | P | Basis | Status | Evidence |
|----|-------|------|------|--------------|---|----|----|------|------|---|-------|--------|----------|
| BL-025 | Optional synchronization between devices | Story | EP-06 | Leaves alone | not scored | not scored | not scored | not scored | not scored | P2 | Observed | Dropped | PRODUCT_BACKLOG.md, out-of-scope list |
| BL-028 | Make the reading view usable on a phone | Story | EP-07 | Leaves alone | 8 | 5 | 5 | 5 | 3.6 | P1 | Measured | Dropped | src/styles.css:213-216 |
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
that function is at `src/js/main.js:2571` today, with the rename-list handler occupying the lines the
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

- [x] Choose which shipped events warrant an essential path alongside the complete one
- [x] Produce the essential order files through `scripts/vendor-orders.mjs` rather than by hand
- [x] Populate `group`, `groupName` and `variant` for each new pair in the catalog
- [x] Confirm the existing grouped rendering handles more than one group without change

Shipped. Three of the five events now ship a second, shorter list: House of M at 8 issues beside
20, Civil War at 7 beside 31, and Secret Invasion at 8 beside 36. The catalog has been able to
carry two variants of one story since the first release and the Hickman pair used it, but every
event list carried a null group.

The whole item turned on one question, and it is the first task above: what can "essential" mean
here without `scripts/build-event-order.mjs` starting to make the editorial judgements its own
opening note says it does not make. The answer taken is the main series alone. `main` is already
declared for every event and already load-bearing, since `readingOrder` uses it to break same-day
ties, so naming it as the spine asserts nothing new about the comics.

The contrarian pass is what shaped the rest. A blanket main-series rule looked obviously right and
is wrong for two of the five, which the vendored data says outright: Annihilation's main series is
preceded by seventeen issues, a prologue and four mini-series, and King in Black's by one. A list
labelled the essential path that opens in chapter six is worse than no list. So the rule is derived
rather than curated, at `scripts/build-event-order.mjs:441-451`: the variant is offered only when
the main series opens the complete order, and where it does not the script names the event and the
count rather than passing over it in silence, because an event missing its short path and an event
that never had one look identical on disk.

That derivation is what the tests pin, not the three files that came out of it. The load-bearing
one re-reads every event's pinned order and asserts a short path exists exactly when that order
opens on the main series, so a fourth event added later cannot quietly acquire or lose one. A
second asserts each pinned short path is the main-series subsequence of its complete order, which
is the failure mode of generating two lists from one source.

Nothing in the app changed. `groupCatalog` at `src/js/lib/catalog.js:362` was already a general
loop over any number of groups, and the catalog now renders four rather than one.

Verified: 384 unit tests pass, 10 of them new. 12 mutations of the shipped tree are all caught,
covering each clause of the refusal, the file naming, a variant generated for an event that opens
on a prologue, a generated variant deleted, a pinned variant reversed, a pinned variant one issue
short, two variants sharing a label, and a complete order losing its group. 12 browser checks in
Edge cover the four groups rendering together, the two ungrouped events staying plain entries, and
importing both halves of a pair; check 12 asserts the imported short path is a subsequence of the
imported complete one, from the reader's side rather than the data's.

One of those browser checks could not fail when first written. It read the row titles from
`h3, .row-title`, which matches nothing here, so it compared two empty lists and reported that they
differed. Making both variants share a label did not move it. The real title is `.result-title`,
written at `src/js/main.js:2669`, and with the selector corrected the same mutation fails it. It is
counted above only because it was then seen to fail.

Review raised one finding, and it was in the code added to be careful, which is where this
repository has twice found the most dangerous code in a change. The printed refusal computed one
reason for all three ways `essentialOrder` can refuse, so the two that are not about starting in
the middle would have printed a lead of 0 or -1 and a sentence contradicting itself: "0 issues come
before the main series, so reading it alone would start in the middle". Neither is reachable from
the five events shipping today, both being properties of data that does not exist yet, so the fix
was to lift the message into an exported `essentialRefusal` and assert the unreachable cases
directly rather than leave them to a build that cannot produce them. Both new tests were re-proved
by mutation: restoring the single-reason body fails the reason test and nothing else, and blanking
a reason fails the pairing test that holds the reasons and the refusals together.

Constraint gate: checked 1 to 11, none breached. Constraint 2 was the live consideration and holds:
the new checklists come from the same vendored series metadata as the complete orders, through the
same script, with no new source. Constraint 4 holds, because this is data, a build script and
tests. Constraint 5 is untouched, since no id of an existing list changed and reading progress is
keyed on those ids.

**BL-014: Count series progress for the list being read**

- [x] Give `seriesProgress` a list scope while keeping the cross-list total available
- [x] Show the per-list breakdown in the progress view for the active list
- [x] Update the view subtitle, which currently states the count spans every list
- [x] Keep the global unique-issue count reachable, since sharing read state across lists is deliberate

Shipped. `seriesProgress` takes an optional list id at `src/js/lib/model.js:471-482`; omitting it
keeps the cross-list aggregate the old callers relied on, so the global unique-issue count is a call
away rather than gone. The progress view gained a two-option scope control at
`src/index.html:371-375`, matching the reading filter's fieldset pattern rather than inventing a
second idiom, and the subtitle at `src/index.html:369` is now written by the render at
`src/js/main.js:2910-2912` instead of asserting "every list" whatever is being counted.

The scope is deliberately not persisted, which is the opposite of the decision BL-037 made for the
reading filter. That filter is a lens on one long order a reader returns to over days; this one is
answered by whichever list they are reading now, so the active list is the right default every time
the view opens.

The case worth naming is no active list. `state.active` is null only when no list exists at all:
`deleteList` falls back to the first surviving list at `src/js/lib/model.js:254` and load normalises
a stale id at `src/js/lib/model.js:666`, so the two cannot come apart. That invariant also rules out
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

- [x] Add an optional note field to the list and issue shapes behind a schema migration
- [x] Include notes in backup, restore and Markdown export
- [x] Provide an edit affordance that does not crowd the row
- [x] Add tests covering migration from a state with no notes

Constraint gate: checked 1 to 11, none breached. Constraint 3 was the live consideration and is
satisfied, because notes stay in local storage and travel only inside the user's own backup file.

Shipped, and the first task's own wording was the trap. "Behind a schema migration" reads as a
version bump, and a bump would have made every existing reader's data unreadable. `migrate` returns
early when the version matches and takes the upgrade path only below 2, so a stored version 2 blob
against a `SCHEMA_VERSION` of 3 matches neither branch and reaches the throw at
`src/js/lib/model.js:607-608`, which latches the "Could not read your saved data" banner. Measured
before the field was added: versions 2.5, 3 and 4 all throw today, 1 and 2 load. Notes are
therefore additive and the version is unchanged, which is also what the changelog's own MINOR
definition asks for.

Two persistence paths had to be named explicitly, and each is silent when missed. `coerce` rebuilds
state field by field, so an unnamed map is dropped on every page load, and `exportBackup` names its
keys one at a time rather than spreading, so an unnamed map never reaches the backup file or local
storage in the first place. The second was found only by running a probe against the real functions
after the plan had asserted the opposite, which is the contrarian wave doing its job.

An issue note is global, keyed by issue id at `src/js/lib/model.js:432-440`, for the same reason
read state is: the bundled minimal and full orders overlap heavily, so a note tied to one path
through an issue would vanish when the reader took another. A list note is a field on the list,
because it dies with the list, and it is deliberately separate from `description`, which holds the
curated order's authored blurb shown on the catalog card.

The editor is a dialog rather than an inline field, and that is forced rather than chosen.
`renderRows` runs inside `preservingFocus`, whose first act is to replace the row children, and it
runs on every store change. Focus is restored by key and action alone, not the caret or an
uncommitted value, so anything typed into an inline field would be lost the moment any other part
of the app changed. The control sits in the row's text column, showing the note itself once there
is one, so the six-button action cluster is untouched.

Clearing a note and backing out are different answers, so `askNote` returns `""` for the first and
`null` for the second. `askText` cannot: it folds both to `null` and marks its field required, which
is right for a name but would leave a reader no way to delete a note they had written.

Notes export to Markdown quoted with `> `, at `src/js/lib/markdown.js:177-179`, and the prefix is
a guard rather than decoration. Every pattern in that file anchors on `-`, `*` or `#` after optional
whitespace, so an unquoted note beginning `- ` would be read back as an issue and one beginning `# `
as a heading, inventing items the reader never added. Notes deliberately do not re-import; the JSON
backup is the lossless path.

Verified: 25 new tests, every one of 23 mutations caught with none skipped, and 32 browser checks in
Edge. The mutation harness lied on its first run, reporting 13 caught while silently skipping the
five that mattered most, because its anchors were written with `\n` against a CRLF tree. The browser
harness lied in the other direction, reporting ten failures that were its own: `requestSubmit()`
with no submitter leaves a `method="dialog"` form's `returnValue` empty, so every save read as a
cancel, and two of its passes were vacuous as a result.

Review found the note control named itself by its action alone. An `aria-label` replaces an
element's contents in the accessible name rather than adding to them, so the button whose visible
text is the note announced only "Edit your note on X", and a reader who could not see the row would
have had to open the editor on every issue to find out what they had written. The note now ends the
label, and it ends it rather than leading it because a note typed with a full stop announced as
"here.. Select to edit it." when the action trailed. Confirmed against the browser's own name
computation: Edge reports `role=button`, `ignored=false` and the full note in the computed name.
That check first read `ignored=true`, which was the closed `<details>` around the order correctly
hiding its contents, not a defect in the control.

Notes and BL-066's collected editions were built on separate branches and first met in the merge,
inside `serializeChecklist`, which now writes both a `## ` heading per edition and a `> ` line per
note. Neither branch could have tested the combination, and the risk is specific: a quoted note sits
between two items, so a failure of the quoting would be read back as an item inside whichever book
it followed, silently growing that edition by an issue. A round-trip test covers it, and all three
mutations of it are caught.

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
announced. It now lands on the all-read heading at `src/index.html:333`, which is both what the
reader needs to hear and where the remaining actions are.

The About view carries the shortcut reference at `src/index.html:626-633`, naming all three
bindings. Only two of them were advertised in the interface, on the hero's `kbd` hints; `Ctrl` +
`\` for the sidebar was written into the toggle button's tooltip at `src/js/main.js:572` and
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
Which channel to use is now decided by reading the container at `src/js/main.js:260-267` rather
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
`src/js/main.js:1971-1981`, along with the pending badge's. A `title` is unreachable by touch and
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
text, at `src/styles.css:21-29`. The `kbd` tint was removed at `src/styles.css:478` and the
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
strikethrough, at `src/styles.css:563-564`; the strikethrough is the non-colour indicator. The
only opacity left on a read row is the cover image at `src/styles.css:566`, which carries no
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
top stop was raised from 60 to 88 percent alpha at `src/styles.css:420-427`. The spread collapsed
to `#1b1d22` to `#1e2126`, and the computed bound for a pure white cover is `#1f2228`, so the
backdrop is now bounded for any import rather than merely for the covers that were sampled. All
19 hero text nodes were checked against that bound.

The last task is left open because it cannot be satisfied as written. axe still returns the same
nodes as incomplete, and always will: it declines to judge any text over a gradient, regardless
of how opaque that gradient is. The finding was answered by computing the bound instead. Reword
the task or close it, but do not expect a tool to clear it.

**BL-032: Offer a light theme and follow the system preference**

- [x] Derive the palette from tokens so a second theme is a token set
- [x] Add a light theme behind `prefers-color-scheme` with a manual override
- [x] Meet the same contrast floor in both themes
- [x] Keep the existing forced-colors and reduced-motion handling intact

Constraint gate: checked 1 to 11, none breached. Constraint 3 was checked, since a theme preference
is stored locally alongside existing settings and is never sent anywhere.

Shipped. The palette was already a token block, but only 15 tokens deep: 62 further colours were
literals in the rules, so a second theme was a rewrite rather than a token set. All 62 are tokens
now, and two of them are not colours. `--tint-base` is what every raised or hovered surface is
mixed from at low alpha, and it has to invert between themes or a hover on a light page is
invisible. `--shadow-alpha` scales every drop shadow, because a shadow tuned against `#0f1115` is a
smear against `#fbfcfe`. Both exist because most of those 62 literals were white-alpha overlays and
black-alpha shadows that assumed a dark base, so their sign had to flip rather than their value.

The dark theme is provably unchanged. Every declaration was resolved against its own token set
before and after and compared pairwise: 992 declarations on each side, 194 of them colour-bearing,
0 differing. That proof is the reason each hex alpha was converted exactly rather than rounded.
Rounding `0x55` to 33% instead of 33.333% drifted four declarations, and the comparison caught it
where an eye would not have.

Two findings came out of the sweep. `--warn` and `--panel` were referenced but never defined, so
the literal fallbacks inside the `var()` calls had been the real colours all along; both are
defined now and the dead fallbacks removed. The retired red `#e23636` also turned out to have
survived at five tint sites and in the progress ring, despite the comment above the palette saying
`--red` and `--red-text` had replaced it. It is preserved as `--red-line` rather than folded into
`--red`, because that is a visual decision rather than a rename, and it is named rather than left
as five loose literals.

The light palette is written out twice, once for `:root[data-theme="light"]` and once inside the
`prefers-color-scheme` query. The duplication is deliberate: the module is deferred at
`src/index.html:743`, so resolving the theme in JavaScript would paint dark and then flip, and
would leave the page dark entirely for a reader with JavaScript off. A test asserts the two blocks
are identical token for token, which is what makes the duplication safe to keep rather than merely
necessary.

`system` writes no `data-theme` attribute at all. Writing `data-theme="system"` would match neither
the dark selector nor the light one, so the page would fall through to the bare `:root` defaults
and sit on dark while the control claimed to be following the system. An unrecognised stored value
resolves the same way, so a settings blob from a later build degrades to the reader's own
preference instead of overriding it.

No `matchMedia` listener survives. One was written, and removing it changed nothing a browser could
show, because the stylesheet's own `prefers-color-scheme` block already repaints a reader on
`system` with no JavaScript involved. It was found by mutation rather than by review: the browser
check written to catch exactly that removal still reported a pass, which is what a check that
cannot fail looks like.

Task 3 needed a gate, because the contrast claims were prose in CSS comments and the availability
badge reasoning in the BL-029 block had already warned that a second theme "would void all of them
and the measurement would have to be redone per theme". `scripts/check-palette.mjs` shipped
measuring 50 pairs across the two palettes, each naming the surface it is actually rendered on,
because a pair nobody renders is a number that can drift unnoticed and a floor met by a combination
the app never shows is not a floor. The list has grown since, to 60 under BL-065 and 72 under
BL-067, and the gate prints the figure from the list rather than from prose so it cannot go stale
where it matters.
It is `npm run palette` rather than `contrast`, which sits one letter from
`contract` and would have put a live third-party API call one typo away.

The gate's first run found three non-text boundaries already below 3:1 in the dark theme that has
shipped since the first release, and the light theme inherited them by mirroring that ramp step for
step. Two measure the same to two decimal places in both. All six are recorded rather than fixed,
and BL-065 raises them together; the reasoning is in that item. They are recorded rather than
waived because a gate that tolerates its own findings is not a gate, and the record is exact in
both directions: a new pair below the floor fails, and so does a recorded pair that has since been
raised. The second half is what stops the list outliving the debt it describes.

Task 4 held without changes. Both `forced-colors` blocks and the `prefers-reduced-motion` block use
system colour keywords only, so they are palette-independent by construction, and a browser check
confirms forced-colors still wins over both palettes.

One surface cannot follow the theme and is left alone deliberately. The favicon at
`src/index.html:13` is a data URI with its colours baked in, and a document's icon is chosen before
any stylesheet applies, so no token can reach it.

Verified: 403 tests, 19 new, and 10 of 10 mutations caught. 16 of 16 browser checks in Edge, with
the system preference emulated through CDP, and 4 of 4 browser mutations caught after the fourth
was rewritten to break the CSS rather than the deleted listener.

**BL-065: Raise the six non-text boundaries that sit below 3:1**

- [x] Raise `--line-2` against `--bg` in both themes
- [x] Raise `--cb-line` against `--card` in both themes
- [ ] Raise `--track` against `--card` in both themes
- [x] Remove each pair from `KNOWN` as it is raised, and delete the list when it empties

Constraint gate: checked 1 to 11, none breached. Constraint 11 applies to any new copy.

WCAG 1.4.11 asks 3:1 of the visual information needed to identify a control. These three are a
bordered control's boundary, an unchecked checkbox's boundary, and the unfilled part of a progress
bar, and all three sit below it: in the dark theme at 1.53, 1.95 and 1.32, and in the light theme
at 1.53, 2.60 and 1.32. Two of the three measure the same in both themes because the light ramp
mirrors the dark one step for step, which is the token refactor working as intended.

They were found by the gate BL-032 added, and deliberately not fixed there. Raising them is a
visible change to every bordered control, every checkbox and every progress bar in the app, which
is a redesign of a theme nobody asked to have redesigned, and BL-032's own proof was that the dark
theme came through the refactor unchanged. Bundling a visual change into that would have destroyed
the one claim the item could make.

All six move together. Raising the dark three alone would leave the light theme trailing, and
raising the light three alone would leave the two themes visually inconsistent in exactly the way
the token refactor exists to prevent.

The gate holds this honest without any work here: `KNOWN` in `scripts/check-palette.mjs` fails if a
recorded pair is raised without being removed from the list, so this item cannot be half-done and
forgotten.

Delivered, and the contrarian pass changed what delivering it meant. Three of the six recorded
numbers were not the worst case, and one of the six turned out to be the wrong measurement
entirely. All of this came from measuring what Edge actually paints rather than trusting the pair
list, and none of it was visible from the stylesheet.

The first correction is that a boundary was being measured against one surface when it is drawn on
three. A checkbox in a row sits on the page, not on a card, so the light theme's real figure was
2.54 rather than the recorded 2.60. A button inside the hero sits on a card, not on the page, so
the dark theme's real figure was 1.41 rather than the recorded 1.53. A text input has its own fill
on the inner side of its border, which was never measured at all and was the worst of the three at
1.32. Raising each token to clear only the surface the list named would have left the other two
below the floor with the gate reporting green, which is the failure the pair list exists to
prevent. The list now carries every surface each boundary is drawn on.

The second correction is larger. The ordinary bordered control in this app was never on `--line-2`
at all. `Rename`, `Note`, `Duplicate`, `Export as Markdown` and `Delete list` are `.quiet`, the row
actions are `.mini`, the cover-art switch is `.tgl`, the reading filters are `.fp`, and every saved
list is a `.yours button`, and all five were bordered with `--line`, measured at 1.29:1 in the dark
theme and 1.27:1 in the light. `--line-2` bordered a hover state and a handful of placeholders. So
raising `--line-2` alone would have satisfied the item as written and left almost every button in
the app exactly as unreadable as before. The five control rules were moved onto `--line-2`, which
now meets the floor, and a sixth found later by review moved with them, the note control on a row.
`--line` stays as it was for the things that are not controls: the hairline around cards, images,
panels and separators, and the static `.pill` and `.badge` labels. Nothing that is not a control
changed colour.

The third task is not ticked, and it is not deferred either. It cannot be done. `--track` is the
trough of a progress bar and the `--red` fill sits directly on it, so the token answers to two
floors at once and they pull in opposite directions. Colours that clear 3:1 against the card behind
the bar and still carry the fill at 3:1 do exist, and the first draft of this block wrongly called
them impossible; a search of the colour space refuted that in seconds. What is true is narrower and
checkable: in the dark theme every such colour has a relative luminance of at least 0.598, which is
3.6 times the fill's 0.166, and in the light theme every one is at most 0.022, about an eighth of
it. Either way the empty part of the bar ends up louder than the full part, so a bar at one quarter
would read as a bar at three quarters. Trading a reader's ability to read the bar for a ratio about
the bar is not a trade worth making, so those two pairs stay recorded, and the honest measurement
is made in their place: `--red` against `--track` is now gated at 3:1 and passes in both themes.
Reaching it took the dark trough from `#2a303c` to `#232731`, moving the fill from 2.72 to 3.07;
the light theme already measured 3.67 and was left alone. The bar is also never the only way to
read progress, because both bars state the same numbers as text beside them.

`--line` is deliberately still not in the pair list, and that is a claim rather than an oversight.
After this change it borders nothing interactive, so a floor on it would be inventing a
requirement. What stops that decision rotting is not a list of control selectors, which would be a
list someone has to keep complete.

Two checks hold it up instead, and it took review to find that the first was not enough on its own.
A browser pass enumerates every rendered interactive element and measures its own border against
its own surroundings, which covers what the app paints. But `.rnote` is `border: 0` until
`.has-note` is set, so the note control painted nothing in any fixture, and it was the sixth control
still bordered with `--line`, at the same 1.29:1 as the other five. A scan of what is rendered
cannot see a rule that only paints in a state no fixture reaches. The note control moved onto
`--line-2` with the rest, and the second check reads rules rather than pixels: it cross-references
every rule that draws a border in `--line` against the classes the markup and the renderer actually
put on a button, an input or a link, so a control bordered with the ungated token fails the tests
whether or not anything on screen happens to be showing it.

The browser pass was widened at the same time, from the top border to all four sides, because the
missed rule was a left accent, and from four views to seven. It now measures 731 painted boundaries
per theme and finds none below the floor. It also prints every distinct backdrop it measured
against, which is what settled a second review question: no bordered control is ever drawn on the
rail, so `--line-2` against `--rail` is not a pair that occurs and was not invented. Reverting one
rule to `--line` puts `button.quiet` back at 1.29:1, which is how that check was shown to be capable
of failing.

Review found one more surface, and this one had degraded. The progress bar renders in two places,
on a card in the reading hero and on the rail in the per-list bars, and only the card was measured.
Darkening the dark trough therefore took it from 1.47:1 to 1.30:1 against the rail with nothing
recording the move, which is the same defect this item fixed for `--line-2` and `--cb-line` two
paragraphs above. Both surfaces are listed now, so `KNOWN` holds four entries rather than two and
the trade is on the record in both places rather than only where it was convenient. The rail bar
uses the same `--red` on `--track` pair as the card bar, so it gained the same 2.72 to 3.07.

Verified: 468 tests, 3 new, and 13 of 13 mutations caught, including one for each of the four raised
values, one for a pair left behind in `KNOWN`, one that puts the note control back on `--line`, and
one for each half of the rail trough being unlisted or unrecorded. 12 of 12 browser checks in Edge
across both themes, with the row scan counting 31 painted boundary sites per theme so a check that
found nothing could not pass quietly; that guard earned itself twice, once when the light pass
silently scanned the wrong view and once when it never reached the rows at all. 6 of 6 interactive
control checks over 731 painted boundaries per theme, mutation-proved by reverting `.quiet`.

**BL-067: Gate the switch and the primary button, which no pair measures**

- [x] Measure the cover-art switch track against the page in both themes
- [x] Measure the primary button's surface against the page in both themes
- [x] Add whichever of the two is below 3:1 to the pair list, and raise it

Constraint gate: checked 1 to 11, none breached.

Found while delivering BL-065 and deliberately left out of it, because BL-065 was already carrying
one scope correction and a second would have made it two features in one change.

The cover-art switch is a control whose whole job is to show a state, and the state is the colour of
its track: `--red` when covers are on, `--track-2` when they are off. Neither is measured by any
pair. `--track-2` against the page measures 1.85:1 in the dark theme and 1.79:1 in the light, so the
off state is a shape a reader has to already know to recognise. The on state has never been measured
against the page at all, only `--on-accent` against `--red`, which is the label rather than the
control.

This is not the same defect BL-065 fixed. That one was a boundary that was too faint. This is a
filled surface with no boundary at all, so raising a border would not answer it, and the fix is
likely to be either a darker off-state track or a border added to the switch. Worth deciding which
before writing it.

**The claim above is stronger than what a browser pass supports, and the delivered fix claims less.**
Reading it as an accessibility failure of the kind BL-065 fixed does not survive checking. The switch
graphic is `aria-hidden="true"` at `src/index.html:261`, the state is carried in words that
`src/js/main.js:498` rewrites to "Cover art on" or "Cover art off" and `src/js/main.js:510` announces,
the button carries `aria-pressed`, and it already has a `--line-2` border that clears 3:1 against the
page. So the component is identifiable and its state is stated in text at body contrast beside it,
which means this is not a use-of-colour failure. What survives is smaller and still worth fixing: a
sighted reader looking at the switch sees a smudge and has to fall back to reading the words. The fix
costs one token with one consumer, so the trade is easy.

**A third failure the block never named.** Measuring in the browser rather than from the stylesheet
found that in the light theme the white knob on the pale off-state track was at 1.83:1, so the off
state was not merely a faint track, it was a faint track carrying an invisible knob. A fix that only
darkened the track against the page would have left it open. Darkening the track is what closes it,
so the two moved together, and both are now gated rather than one.

**The primary button renders on two cards, and the page as well.** The second task above says to
measure it against the page. Most of the buttons render on `--card` and on `--card-2`, at 3.59 and
3.36 in the dark theme and 4.86 and 4.57 in the light, and all four already passed. The first
attempt at this item concluded from that survey that the button never renders on `--bg` at all, and
wrote the conclusion into this block in bold. Review found it false, and the paragraph below records
how. All three surfaces are gated.

**The plan asked for a pair with a garbled description, and the first attempt threw out the pair
along with the description.** It listed five pairs, one being `--red` on `--bg`, described as the
switch knob on its on-state track. The description is wrong twice over: the on-state track is `--red`
and not `--track` (`src/styles.css:388`), where `--track` is the unfilled part of a progress bar and
carries no knob at all, and the knob-on-on-state pair was already in the list as `--on-accent` on
`--red`. Reading that, this item dropped to four pairs and recorded the fifth as a boundary nothing
paints. Review found the pair itself was right and only its label was wrong. `--red` on `--bg` is
painted by two separate controls: the cover-art switch's **on**-state track, and the catalog Clear
button, a `.btn` whose ancestors set no background so it falls through to the page. Both measure
3.89:1 dark and 4.73:1 light, so nothing was failing, but for one commit this item gated the off
state of the switch and left the on state of the same control on the same background unwatched. Half
of one control. Five pairs were added after all.

**Why the browser pass did not see either.** The Clear button is `hidden` until a query is typed, and
a fresh fixture lands with covers on, so the on-state track was on screen but was not one of the
things the pass had been told to look at. That is the exact hole `scripts/check-palette.mjs` warns
about in its own header, a rule that paints only in a state no fixture reaches, and it caught this
change rather than the app. The guard in `test/theme.test.js` that exists to force this question was
silent for a mechanical reason: it pins the surface list of three foregrounds by name, and this
change was about two others. It now pins `--red`, `--track-2` and `--on-accent` as well.

**Three further accent surfaces, and the guard that found them.** Adding `--on-accent` to the
multi-surface guard immediately failed its own purpose: the assertion said two surfaces were the
complete set, and there are three. The tick inside a checked read checkbox is `--on-accent` on
`--green` at 2.30:1 in the dark theme, which is below the floor. That pair is now measured and its
dark half recorded in `KNOWN` with the reason, so the number is printed on every CI run rather than
absent; choosing the green is BL-069's. Two `--red` surfaces are deferred there too: red on the rail,
painted by three separate controls at 4.00 dark and 4.41 light, and two buttons on a blocked row
whose background is a `color-mix` with no hex value this gate can express. Both clear the floor.
Writing an assertion that pins a completeness claim is what turned a silent gap into a measured one
within a single commit, which is the argument for the assertion rather than against it.

**And then the sentence above was itself false.** Recording the pair, this block and the changelog all
said the ratio was printed on every CI run. It was not. The gate's passing path printed only how many
pairs were recorded, never what any of them measured; the numbers existed only behind a `--report`
flag that neither `package.json` nor the workflow passes. So a green run said five pairs were below
the floor and never said the tick was at 2.30:1. That is the same defect as recording nothing, one
step further along, because a ratio nobody can see cannot be noticed drifting, and a recorded pair is
free to move anywhere below its floor without the gate saying a word. The passing path now prints each
recorded pair with its current ratio and the place it is drawn, and `test/theme.test.js` pins that so
it cannot quietly revert. The claim was made true rather than weakened to match, which is the same
disposition this item took to the completeness assertion a paragraph above.

**And the guard for that was itself one level too low.** The first attempt asserted on what
`unresolved` returns, not on what a run prints, while the block claimed the printing was pinned. Review
named the mutation that escaped: delete the print loop and its destructure and the suite stays green,
the gate still exits 0, and all three prose claims go false again. The mutation that had been run was a
different edit at a different level, one that made the gate throw, so it proved the data path rather
than the output. The output is built by an exported function now and the test spawns the gate and reads
its stdout, which is the level the claim is actually about. Five mutations are caught where one was:
emptying the loop, dropping the ratio, dropping the place, printing a constant where the measured value
belongs, and removing the refusal that keeps the exported report from calling a failing stylesheet
clean. The last two came from asking review to attack the guard rather than confirm it: checking that
a line opens with some ratio is not checking that it opens with this pair's ratio, and a helper that
hardcoded "0 new" was safe only because of where it was called from, which stops being true the moment
it is exported. This is the third time in this item that
an assertion was written one step short of what the prose beside it claimed, which is worth recording
as a pattern rather than as three separate slips.

`--track-2` went from `#3a4150` to `#616e8b` in the dark theme and from `#b8c0cd` to `#7b8aa2` in
both light blocks, holding each theme's hue and saturation and moving lightness only. A single shared
value was rejected: the band clearing both pages at once is roughly relative luminance 0.117 to
0.293, so sharing takes less margin than tuning each theme, and `test/theme.test.js:94` already
requires the two light blocks to agree so per-theme values stay enforced. Both new values also clear
3:1 against `--card`, which the switch does not sit on today, so a later move onto a card cannot
silently reintroduce this.

Verified: the gate now measures 72 pairs across the two palettes rather than 60, with five recorded
below the floor rather than four and none new. 488 tests, 0 fail. 11 of 11 mutations caught, one for each theme
reverting, one for reverting only one of the two light blocks, one for darkening `--card` under the
button, and one proving each new pair is the only pair that catches its own defect, plus five on the
gate's own passing output: emptying the loop that prints the recorded pairs, dropping the ratio from
each line, dropping the place it is drawn, printing a constant in place of the measured ratio, and
removing the refusal that stops the report describing a failing stylesheet as clean. All five leave
`unresolved` untouched, which is what the first version of that guard was watching and why it caught
none of them. The knob mutation
was wrong on its first draft and passed for the wrong reason: reverting the light track was caught by
the track pair too, so it proved nothing about the knob pair. Replacing it with a pale dark-theme
track, which clears the page easily but leaves the white knob invisible, isolates it properly. In the
browser at 1280x900 across seven views, both themes and both cover states, every measured boundary
now clears 3:1: the off-state track at 3.70 dark and 3.41 light, its knob at 5.11 and 3.50.

**BL-033: Re-render only what changed when an issue is marked read**

- [x] Update the single changed row rather than rebuilding every row
- [ ] Update the counters and the rail without a full pass
- [x] Skip rendering rows while their container is collapsed
- [x] Re-measure the toggle cost on the 219 issue list and record the result

Constraint gate: checked 1 to 11, none breached. Constraint 4 was the live consideration: this must
be done in plain JavaScript, because adopting a rendering library would introduce a runtime
dependency.

Shipped, with the rail left alone deliberately. Measured in Edge at 1280x900 on the 219 issue
Hickman order, marking one issue read went from 12.7ms to 1.7ms with the full order closed, which
is how it starts, and from 14.8ms to 2.8ms with it open. The rows rebuilt per toggle went from 219
to 2, those two being the issue that was ticked and the one that becomes up next. Both figures are
in `docs/ux-artifacts/render-cost-bl033.json`, beside the `render-cost.json` this item was raised
from.

The first attempt at this measured the wrong thing twice, and both errors flattered the result in
opposite directions, so they are worth recording. The harness awaited a `requestAnimationFrame`
after each click, which reports one frame, about 16.7ms, however little work was done; every number
it produced was a floor rather than a measurement, and the 17.4ms baseline it gave is not
comparable with anything above. Separately, the dev server was serving the main checkout rather
than this worktree, so two runs described as "after the fix" were of unmodified code.

The leading hypothesis was refuted rather than confirmed. The obvious saving looked like not
rendering the four hidden views, but a MutationObserver profile split by view found they accounted
for 36 of 520 nodes, and 93 percent of the churn was the visible reading view rebuilding itself. So
the work went into reusing rows, not into skipping views.

Reuse is keyed on the whole item, at `src/js/main.js:1840-1849`, rather than on a list of the
fields a row happens to read. An enumerated list is one somebody has to keep complete, and a field
left out of it is a row that silently stops updating, which is precisely the defect a cache like
this risks buying. Two inputs are not part of the item and so are named in the key separately. One
is the up next marker, which moves on its own. The other is today's date, and it was missed on the
first pass: `availability` and `describe` both default `today` to the local day at call time, and it
is `date > today` that decides whether a badge reads "soon scheduled" or "MU Unlimited", so a tab
left open across local midnight reused the row it had built the day before. It was reused for good
rather than until the next change, because nothing about the item or the marker ever differed
again. The review that found it is the reason this paragraph names two inputs rather than one; the
first version of it asserted that `currentId` was the only one.

That failure was reproduced before it was fixed and the reproduction was then shown to have teeth.
An issue dated tomorrow renders as `soon scheduled`; moving the page's clock past midnight and
making an unrelated change leaves it reading `soon scheduled` on the unfixed tree and moves it to
`MU Unlimited` on the fixed one. The day is now read once per render and passed to both calls, so
every row in one pass is judged against the same day.

The reconciler drops what the new order does not ask for before it places what it does, at
`src/js/main.js:1830-1838`. Doing it the other way round leaves the stale node in front of the
reused ones, which shifts every later index by one and turns a single rebuilt row into a move of
all the rest. That is not hypothetical: the first version scored 217 of 219 rows reused and still
churned 219 nodes and ran in 17.7ms, and it was that contradiction between two measurements of the
same run that exposed it.

The largest saving was not the reuse at all. The full order lives inside a `<details>` that starts
closed, so on a first visit every one of those 219 rows was being built for a container the reader
had not opened. `renderRows` now returns before building them and opening the order is what asks
for them. The unread count is written before that return, not after it, because it sits in the
`<summary>` and stays on screen when the order below it does not.

The rail task is left unticked rather than quietly ticked. Its counter half is done, in that the
count now updates without any row being built. The rail half was measured instead of assumed: it
holds 9 nodes for one list and churns 2 on a read toggle, and it scales with how many reading
orders a reader has rather than with how many issues are in one, so rebuilding it is not what this
item was raised about. Changing it would buy nothing measurable and would put a second cache on a
path that does not need one.

Correctness was checked against an oracle rather than by looking at it. A reload renders the same
stored state cold with an empty cache, so after ten mutating actions on the warm tree, marking read
and unread, moving items up and down, cycling availability overrides and changing the filter twice,
the row list had to be character for character identical to the cold one, and it was. That check
was then shown to have teeth: keying a row on its id alone makes it report a row still drawn unread
while the state says it is read.

The pair of screenshots in `docs/ux-artifacts/` was compared pixel by pixel rather than by eye, and
the comparison is recorded as it came out rather than rounded to "identical". 1253 of 1,152,000
pixels differ, 0.1 per cent, at a largest difference of 18 of 255 on any channel, and every one of
them falls inside a single 32 pixel column at x 375 to 406, which is where the cover thumbnails sit.
Covers are fetched over the network, so their decoding varies between runs. Nothing else moved.

The five guards added to `test/library.test.js` are source-text tests in the register of the wiring
tests already there, because at the time `src/js/main.js` could not be imported in Node at all.
BL-064 has since closed that, and BL-041's third task is ticked there rather than carried. The
guards were left in that register rather than rewritten, because what they pin is the wiring the
render path depends on rather than the render path itself, and the one that matched the cache key
as literal text was re-aimed at the extracted `rowCacheKey` so it cannot drift from the key actually
used. Six mutations were tried against the first four and all six were caught: removing the toggle
listener, removing the guard, moving the count below it, narrowing the cache key to one field,
swapping the two loops in the reconciler, and starting the order open.

That result flattered itself, and the review said so. All six mutate exactly the text the four
scans match, so the pass was close to tautological, and the branches where a cache actually goes
wrong had no guard on them at all. Three one-line deletions were demonstrated surviving the whole
suite: dropping the row key comparison, dropping the heading key comparison, and dropping the reset
that clears the cache when the list changes. The first two freeze a row or a heading at whatever it
was built with. The third is worse than staleness, because a row reused across lists carries move
and remove handlers closed over the id of the list it came from. A fifth test now pins all three,
and seven mutations are caught rather than six: those three, plus dropping the day from the key,
from `availability`, from `describe`, and the read of the day itself.

**BL-034: Replace the native dialogs with the app's own notice system**

- [x] Replace `prompt()` for list naming with an in-page control
- [x] Replace `confirm()` for destructive actions with an in-page confirmation in the app, leaving
      the `dev-faults.html` harness on native dialogs
- [x] Route curated import failures through `notify()` like every other path
- [x] Report into a pane the reader can actually see, not one fixed at call time
- [x] Make sure the replacements are announced once, in step with BL-027

Constraint gate: checked 1 to 11, none breached. Constraint 11 applies to the new copy, which must
carry no em dashes.

Shipped. One `<dialog>` at `src/js/ask.js:51-93` answers every question, because the focus trap,
the Escape key and returning focus to whatever opened it are the browser's job, which is the same
reason the curated-order preview is built this way. `askConfirm` and `askText` wrap it, and the
five callers that used to reach for a native dialog now await one of those two.

The close listener is registered once at start-up rather than per question, at
`src/js/ask.js:35-47`. Per-question listeners let a question answered twice, by submitting as
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
outstanding notice is kept as a record at `src/js/main.js:291` rather than only as a paragraph in
the page, and `placeNotices()` at `src/js/main.js:300-338` renders every outstanding record into
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
report. Both sites key it `catalog-load` at `src/js/main.js:272`, and both success paths clear that
key, which is what stops a loaded catalog from appearing under a banner saying it could not be
loaded.

A curated import is keyed the same way, by the order rather than by the pane, at
`src/js/main.js:2856`. The same order can be added from the landing page and imported from the
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

Shipped. `restoreList` at `src/js/lib/model.js:273-285` puts a list back at the index it held,
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
avoid at `src/js/lib/model.js:216-219`: "in library" and "Continue reading" would both resolve to
whichever list came first in the rail, and the rail would show two entries with the same name and
the same progress. Both refusals are covered by tests.

The refusals are a backstop rather than the plan. The offer is withdrawn at the moment it stops
making sense: `forgetDeleted()` at `src/js/main.js:1571-1574` runs when the whole state is replaced, by
a backup restore, by undoing one, or by erasing everything, and `forgetDeletedFor()` at
`src/js/main.js:1594-1602` runs when the deleted list's own order is imported again. An offer the reader
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
about to make at `src/js/main.js:2856`, because two announcements in one tick leave only the last.

A curated import writes twice, the list record and then its issues, so a failure on the second used
to leave a shell list claiming the catalog entry with no issues in it. That shell then blocked the
undo offer for a deleted copy of the same order, and pressing the button still on screen discarded
the reader's real list in favour of an artefact of a write that failed. Storage being full is the
expected reason to land there, and the issue write is the larger of the two, so the failure now
rolls the half-import back at `src/js/main.js:2824-2835`, leaving nothing behind and the offer still
valid. It also disposes of the empty list this path used to leave in the rail.

Read progress is not a consideration in either direction. It is global and keyed by issue id, so
deleting a list never touched it and restoring one never has to put it back. One of the six new
model tests asserts exactly that, in both directions, because the confirmation copy now promises it.

The offer is held for the session rather than for a few seconds. Deleting the list you were reading
moves you somewhere else, and a timer would take the only way back at the moment the reader was
still deciding whether they wanted it. Only the most recent delete is held: keeping every one would
offer to restore a list the reader has since deliberately replaced, and nothing here can tell those
two cases apart.

`notify` gained an `action` at `src/js/main.js:356`, which puts a button inside the notice rather
than beside it. That is what makes the offer survive: BL-034 renders each outstanding notice from a
record on every view change, so a button held anywhere else would be left behind the first time the
reader moved. It also means the offer is announced with the words that explain it, as
`spoken()` at `src/js/main.js:379-383` appends "Undo delete is available." A button that is never
spoken is a button a screen-reader user cannot know to look for.

A failed undo keeps both the buffer and the button, at `src/js/main.js:1617-1625`. The usual reason
a write fails here is that storage is full, which the reader can act on, so dropping the offer
would turn a recoverable failure into a permanent one. The retry is labelled "Try again" rather
than repeating "Undo delete", since the first attempt visibly did not work.

Erasing everything, restoring a backup and undoing a restore all call `forgetDeleted()`, at
`src/js/main.js:3024`, `src/js/main.js:3024` and `src/js/main.js:3040-3046`. Each replaces the whole
state, so the buffered list belongs to data that is no longer there: putting it back would splice a
list out of one tracker into another, or resurrect one list out of a tracker the reader asked to be
emptied. Undoing a restore is the easiest of the three to miss, because the reader reaches it by
pressing a button labelled undo, but it swaps the state exactly as the restore it reverses did.

A notice carrying a control is the one kind BL-034 does not move into an open dialog, at
`src/js/main.js:308-319`. Moving a message into the modal makes it readable where the reader is
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

- [x] Reflect the active view and list in the URL hash
- [x] Restore view and list from the hash on load
- [x] Handle the browser Back and Forward buttons
- [x] Confirm an unknown or stale hash falls back safely

Constraint gate: checked 1 to 11, none breached. Constraint 5 was the live consideration and is the
reason this uses the hash rather than anything that could alter the origin: the storage bucket must
stay bound to `127.0.0.1:8787`.

**Shipped.** The address is now `#/<view>` with the active list appended, so
`#/read/list-mabc123-x7y2z9` names both. Parsing and formatting live in `src/js/lib/route.js`,
away from `src/js/main.js`, which cannot be imported in Node because it reads `document` at module
scope. That module also became the single home of `VIEWS`, moved out of `main.js`, so one list
backs both what `showView` can display and what an address can reach. Split across two files, a
view could have been routable but not showable, or showable but unreachable by URL.

**Constraint 5 turned out to be the binding reason rather than a preference.** `server.mjs` serves
files and returns 404 for anything it cannot find at `server.mjs:136`, with no single-page
fallback, so a History-API path such as `/read/list-abc` would have failed on precisely the reload
and the bookmark this item exists to deliver. The hash was the only mechanism that works here, and
the constraint and the server agree for different reasons.

**The list rides along on every view, not on a chosen few.** Picking the views that "need" a list
would have been an enumeration someone has to keep in step with the views, which is the defect
class the anchors gate exists to catch. `#/about/list-abc` is mildly odd and entirely honest: it
says which view is open and which order is active, and restoring it restores both.

Three decisions came out of trying to break the design rather than out of writing it:

- **A hash that is not ours is left completely alone.** `src/index.html:16` ships a skip link
  targeting `#main`, and clicking it pushes a real history entry, measured in Edge as
  `history.length` going from 2 to 3. So `hashchange` really is handed a foreign hash during
  ordinary keyboard use. Answering it with a view change would throw a keyboard user somewhere
  they did not ask to go, and rewriting it would break the skip target. A later deliberate
  navigation does reclaim the address, because by then the anchor is no longer where the reader is.
- **Deliberate navigation pushes; everything else replaces.** The eight call sites that follow a
  click push a history entry. Every other path replaces, including the correction of a stale
  address and the redirect that hands an empty reading view over to the landing page. The redirect
  matters most: it is reached from `renderReading`, which runs inside `renderAll` on every state
  change, so pushing by default would have put a history entry behind every mark-read. Replacing is
  also what stops a corrected address becoming a Back trap, since the correction overwrites the bad
  entry rather than stacking a good one on top of it.
- **The address is synced from `renderAll`, not only from `showView`.** The active list is changed
  at more than a dozen places that never navigate, among them duplicating a list and restoring a
  backup. `renderAll` is the one point all of them pass through, because the store calls it on
  every change at `src/js/main.js:72-77`. Syncing anywhere else would have left the address naming
  a list that is no longer on screen.

**Two guards exist only because something ran before it should have.** The sync refuses to write
until boot has read the incoming address, since `renderAll` runs once beforehand and would
otherwise overwrite the very hash it is about to restore. And it compares against the current hash
before writing, which is not an optimisation: writing a hash fires `hashchange`, whose handler
calls back into `showView`, which syncs again. The comparison is what stops that running away.

**A stale list id is corrected rather than obeyed.** `setActive` returns the state untouched when
the id is unknown, at `src/js/lib/model.js:287-289`, so an address naming a deleted list would
otherwise leave a different order on screen while the address claimed the missing one. The reading
view hands over to the landing page when there is no list at all, and the trailing sync rewrites
the address to whatever is actually showing.

Verified: `npm run lint` 0, `npm test` 420 pass and 0 fail, up from 403 by the 17 in
`test/route.test.js`. The pure parsing and formatting are unit tested, including a round trip for
every view the rail can reach, ids containing a slash, a space, a percent or a hash, a malformed
percent escape, and a third segment.

Nine mutations were applied one at a time to prove the new checks can fail, and 9 of 9 turned the
suite red. The first attempt at the most important one did not: removing the `#/` prefix guard left
`#main` parsing to nothing anyway, because `ain` is not a view, so the test that claimed to hold
that guard in place was passing for the wrong reason. What actually exercises it is an anchor whose
third character onwards spells a view, such as `#zread`, and testing those is what made the
mutation bite.

The browser evidence is 25 of 25 assertions in Edge at 1280x900, covering a cold start, an import,
Back and Forward, the heading taking focus on the view Back lands on, a reload restoring view and
list, boot leaving focus on the body rather than stealing it, a deep link from cold, a stale list
id being corrected in place, an unknown view falling back, the skip link surviving untouched, a
later navigation reclaiming the address, three mark-reads adding no history entries, and a second
import moving the address to the new list. That check is known to be capable of failing because an
earlier run of the identical script reported 13 failures: it was pointed at a server serving a tree
without this change, which is also the reason the verification server runs on `MRT_PORT=8799`
rather than disturbing the one already on 8787.

**BL-037: Keep the chosen filter across a reload**

- [x] Persist the filter with the reader's other settings
- [x] Restore it on load, defaulting to All when absent or unrecognised
- [x] Decide whether the filter is per list or global and state the choice
- [x] Carry it in the URL alongside BL-036 if that lands first

Constraint gate: checked 1 to 11, none breached. Constraint 5 applies, since the setting lives in
origin-bound local storage.

**Shipped.** The filter joins `apiBase` and `covers` in `mrt.settings`, which is what "the reader's
other settings" names, and is restored in `wireReading` at `src/js/main.js:1355-1409`, before the
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

**The fourth task is now closed, and the filter travels as a query inside the fragment**, so a
reading view reached with Unread in force is `#/read/<listId>?filter=unread`. BL-036 had landed and
decided the scheme, so nothing had to be invented; the filter was kept out of that change to hold to
one major feature per pull request.

A query rather than a third path segment, and the deciding reason is compatibility. A query is
omitted when it says nothing, so while the filter is the default every address this app writes is
byte for byte the one it wrote before, and every bookmark or shared link made under BL-036 keeps
working untouched. A third segment would have needed a placeholder on any view with no active list,
`#/about//unread`, whose empty middle collides with the shipped rule that a trailing slash reads as
no list.

Three decisions the browser forced, each with the alternative that was tried and rejected:

- **The push writes history rather than assigning the hash.** Assigning fires `hashchange`
  synchronously, which re-runs `applyRoute` and moves focus to the view heading. Every caller that
  pushes a view already reached `showView` with focus of its own, so that second pass was redundant
  for them, but for a filter radio it threw the keyboard out of the control just pressed, which is
  the defect BL-054 and BL-058 fixed for the rows. Measured in Edge before it was relied on:
  `pushState` fires no `hashchange`, and Back over an entry it made still does.
- **An address with no filter means different things at boot and on Back**, so `applyRoute` takes
  what to fall back to rather than deciding. Back hands over an address this app wrote, and this app
  omits the filter only when it is the default, so absent there means All; a first draft that left
  the filter alone would have left it in force and rewritten the address to match, undoing the whole
  task. Boot may instead be handed a bookmark made before any of this shipped, where absent means
  nothing at all, so the stored setting stands; treating absent as All there would have reset the
  reader's stored filter on every old link, regressing this item's own first three tasks.
- **The filter is stored wherever it arrives from**, including from an address, which is what
  `applyRoute` already does with the active list. The alternative, applying a filter from a link
  without storing it, would let Back move the rows without moving the preference, so closing the tab
  and reopening it would show something other than what was last on screen.

An unknown filter refuses the filter rather than the whole route, unlike an unknown view. A stale
link from an older build still names a view the reader can be taken to, and the trailing sync
rewrites the address without the part that no longer means anything.

Verified: `npm run lint` 0, `npm test` 484 pass and 0 fail, up from 468 by the 16 added to
`test/route.test.js`. Fifteen mutations were applied one at a time and 15 of 15 turned the suite red,
including writing the default filter into the address, decoding before splitting on the query,
trusting whatever the query said, replacing instead of pushing, and going back to assigning the
hash.

Review found two defects that the 25 assertions below did not reach, and both are fixed here rather
than filed, because both sit on the address path this task rewrote.

- **Arrowing through the filter group left one history entry per stop passed over.** Arrow keys move
  a radio group one stop at a time and fire `change` at each, so a keyboard reader aiming at the
  fourth filter left four entries and Back walked them back through three filters they had only
  passed over. Measured on the tree before the fix: three presses of `ArrowRight` left three entries
  and one Back landed two filters short. A pointer user making the identical decision left one. The
  first stop of a traversal pushed and the rest overwrote it, so a traversal left one entry whose
  Back returned to the filter in force before it began.

  A second review round found that design broken from the other side, and it is now replaced. A
  traversal that returns to the filter it started from overwrote the top entry with a copy of the one
  underneath it, and a same-document Back between two identical fragments fires no `hashchange` at
  all, so the press did nothing. Measured on that tree: `ArrowRight` then `ArrowLeft` left history
  holding the same address twice, and the Back that followed reported 0 `hashchange` events with the
  rows unmoved. That is the very failure the guard in `syncHash` exists to prevent, reached from the
  other side, and a replace cannot remove an entry the traversal has already pushed. So a traversal
  now writes nothing while it is open and writes one entry when it ends, which leaves the address the
  reader arrived on underneath it and makes the return-to-base sweep correctly leave no entry at all.
  A change no arrow key produced still writes at once, so two pointer choices still get an entry
  each, and the traversal ends the moment the reader leaves the group or reaches for the pointer.

  Holding the write means the address lags the rows while a traversal runs, and something else can
  write in that window: every `store.update` reaches `renderAll`, which syncs, and background
  hydration writes on a timer. A passive sync during a traversal therefore formats the address from
  the filter the traversal began at, not the live one, or it would replace the entry Back exists to
  return to with the half-chosen address. Modified arrow presses are excluded from opening a
  traversal at all, because measured in Edge on this tree `Ctrl+ArrowRight` moves the selection
  nowhere and fires no `change`, which would have left the flag set for whatever came next.
  Collapsing on a timer was the alternative and was rejected: it would have made the behaviour
  depend on how fast someone presses, and it cannot be asserted without sleeping in a test.
- **A list id naming an `Object.prototype` member was adopted from the address.** `store.state.lists`
  is a plain object, so `lists['__proto__']` answers with `Object.prototype`, which is truthy, and
  the guard passed on a list that does not exist. Measured before the fix: opening
  `#/read/__proto__` persisted `active: "__proto__"` and threw a `TypeError` out of `listProgress`,
  and because the id survived in storage the same throw happened on the next boot, during module
  evaluation, so the `hashchange` listener was never registered. It is a BL-036 defect rather than
  one introduced here, but a feature whose whole point is handing someone an address is what makes
  it reachable, so it is closed here. The two lookups that read an address now ask `Object.hasOwn`.
  The lookups that read an id already in storage are reachable only through a hand-edited state
  file, which is a different surface, and are filed as BL-068 rather than widened into this change.

Eight further mutations cover those two fixes and 8 of 8 turned the suite red, including putting
either lookup back, letting any key open a traversal, and letting a move between two radios close
one. Eight more cover the deferred write that replaced the second of them and 8 of 8 turned it red,
including writing on every stop again, letting a modified arrow open a traversal, formatting a
passive sync from the live filter, and leaving the group without committing.

A third review round found that none of those sixteen permutes a statement, and that the two
orderings the design depends on were therefore held by nothing. Both were confirmed here: with the
statements only reordered and nothing added or removed, every text assertion the suite made about
this machinery still passed. Committing after `setFilter` rather than before it formats the
traversal's entry from the filter replacing it, so the push that follows matches the address already
showing and writes nothing, and the traversal's result is never recorded at all; that path is reached
by a click carrying no `pointerdown`, which is what assistive technology produces and the only reason
the commit is there. Discarding below `showView` rather than above it leaves the traversal open while
`showView`'s trailing sync runs, so the address is formatted from the base and left claiming a filter
the rows are not showing, with the same address in two adjacent entries, which is the dead Back this
design exists to close. Two ordered assertions now hold both, and were measured catching 2 of 2 where
the previous wording caught 0 of 2. Both edits look like tidying, which is why they are worth a test.

A browser check of the first-round fixes passes 25 of 25 and a second of the deferred write passes 31
of 31, over the five prototype members and thirteen history sequences. Each was measured failing on
this tree first: the deferred-write check reports 5 failures against the design it replaced, and the
read toggle it drives is asserted to have actually moved the store, because the first draft named a
control that does not exist and two of its checks passed without a passive write ever happening.

The browser evidence is 25 of 25 assertions in Edge at 1280x900, over a real House of M import of 20
issues with 3 marked read through the app's own controls, so All, Unread and Read are three
distinguishable counts. It covers the unfiltered address being unchanged from today, a chosen filter
reaching the address and the rows, focus staying on the radio, Back and a second Back walking the
filter back with the rows following, Forward returning it, a pasted filtered link landing filtered
and surviving a reload, a bookmark made before this shipped keeping the stored filter, an unknown
filter being dropped rather than refused, the filter riding along to another view and back, marking
issues read adding no history entries, and the filter never reaching a query a server would see.

That check is known to be capable of failing: with the push path reverted to assigning the hash and
nothing else changed, the focus assertion fails, reporting focus on the order heading instead of the
radio. Two earlier runs of it were wrong in ways worth recording, because both would have passed
vacuously. The first hand-built a state blob and set the filter inside it, but settings live in
their own `mrt.settings` key, so every probe inherited whatever the previous one had left in the
shared browser profile; it now seeds bytes this app wrote itself. The second measured focus against
a closed full order disclosure, which renders none of its content, so nothing inside it could take
focus and a lost radio was indistinguishable from an unfocusable one.

Verified for the three tasks that shipped earlier: `npm run lint` 0 and `npm test` 256 pass, 0 fail,
unchanged at the time, because this is DOM-coupled code in `src/js/main.js`, which had no unit test
harness. BL-041 is the item that owned that gap. The evidence there was a browser check: in Edge at
1280x900, 16 of 16 assertions pass, covering a fresh profile starting on All, a chosen filter
reaching storage, that value surviving a cover art toggle and a reload with the control and the
rendered rows agreeing, one filter applying across two imported orders in both directions, and a
stored value that is unrecognised or of the wrong type falling back to All and being replaced in
storage. Against the unchanged `src/js/main.js`, 8 of those 16 fail. The 8 that still pass were
already true, and one of them is the pre-existing session-scoped sharing that decided the global
choice above.

**BL-038: Build the two Library sub-views the adopted design specified**

- [x] Add Everything read as a filtered view over the global read map
- [x] Add Added by hand as a filtered view over the existing manual source marker
- [x] Place both in the rail Library section as the adopted direction shows
- [x] Confirm both views behave when empty

Constraint gate: checked 1 to 11, none breached. No constraint is engaged; both views read data the
app already holds.

Shipped. The two selectors are `readIssues` and `manualIssues` in `src/js/lib/model.js:502-552`,
sitting in the derived section beside `seriesProgress`, and the pages themselves are described once
in `src/js/lib/library.js:27-51` and rendered by a single function at `src/js/main.js:2937-2955`.

The reason Everything read reads the read map rather than walking the lists is the sentence above
`deleteList` at `src/js/lib/model.js:255-256`: issue metadata and read state survive the deletion of
the list that introduced them, deliberately, so that deleting one list never destroys progress
shared with another. The consequence was that an issue you read inside an order you later deleted
appeared on no screen in the app at all. The progress view iterates `listOrder`, the reading view
needs a list to be in, and the rail only shows lists. Everything read is the first surface on which
that issue exists, which is why a row that belongs to nothing says "In no list" out loud rather than
leaving the space blank: blank would read as a rendering fault instead of as the fact it is.

Ordering is the part that needed deciding rather than deriving. Everything read is newest first,
because the timestamp `markRead` already stores is the only ordering the data supports, but the tie
break had to be explicit. `markManyRead` calls `markRead` in a loop and each call takes its own
`Date.now()`, so a bulk mark produces runs of equal timestamps; JavaScript enumerates integer-like
keys in ascending numeric order and string keys in insertion order, and a negative id is a string
key, so without the tie break a hand-added issue sorted below every other issue read in the same
second for no reason a reader could see. Added by hand is sorted by title for the same underlying
reason from the other end: an entry with a marvel.com URL keeps that issue's real id and one without
gets a negative synthetic id from the clock, per `src/js/main.js:2503`, so the two kinds cannot be
ordered against each other by id at all.

The descriptor list follows `READING_FILTERS` and for the same stated reason, that a list of view
names living in two places drifts silently. `showView` hides every section by name and then focuses
the heading of the one it showed, so a rail button naming a view with no section blanks the page and
throws on a null, and a section with no route is simply unreachable; neither says anything until a
reader presses the button. `VIEWS` at `src/js/lib/route.js:14` now spreads the Library entries in
rather than naming them, and the sections in `src/index.html:384-396` are empty shells whose heading,
subtitle and empty text are all rendered from the descriptor. The only copy that exists twice is the
rail button's label, which the markup has to carry to be a button at all, and
`test/library.test.js:196-226` reads both files off disk and fails on any disagreement. That is the
difference from `READING_FILTERS`, which can make its drift impossible to express: this makes its
drift impossible to ship.

Fifteen tests were added, and each was proved able to fail before being trusted. Eight mutations
were applied to the tree one at a time and the suite refused every one: a section renamed out from
under its route, a rail label that stopped matching its view, a rail button routing nowhere, the
Library views dropped out of the switch list, the tie break removed, an id with no metadata quietly
dropped, list ids reported where names were promised, and the read timestamp stored verbatim rather
than coerced.

One risk was gone looking for and found open. Everything read prints a date, so what a restore can
put in the read map is this view's problem too, and a backup carrying a string where a timestamp
belongs would put "Invalid Date" on screen. The first pass concluded it could not: `store.load` runs
every saved state through `migrate` at `src/js/storage.js:40`, and `migrate` replaces any value that
is not a usable number. Review found that guard sits in `coerce`, which runs on the current-schema
branch alone. The v1 branch rebuilds the state from scratch and writes read state through `markRead`
instead, which stored its argument verbatim, so restoring a v1 backup carrying `readAt: "banana"`
did put "Invalid Date" on the page. Reproduced end to end through `validateBackup` before it was
believed. The coercion now lives in `markRead` at `src/js/lib/model.js:392-399`, written the same way
`coerce` writes it at `src/js/lib/model.js:621`, so the two paths cannot disagree and every future
caller inherits it.

The test written alongside the original claim exercised only the current-schema shape, so it pinned
the invariant on the one path that already held it and would have reported a pass for as long as the
bug lived. A second test now restores a v1 backup, and it was proved to fail against the old
`markRead` before being trusted. That is the shape the repository's own instructions warn about, a
check that cannot fail, and it is worth recording that it survived being written by someone who had
just read that warning.

Twenty-four browser checks were run in Edge at 1280x900 against a cleared store and then a seeded
one, all passing with no page or console errors: both views reachable and focusing their heading,
both empty states, the row counts singular and plural, newest-first ordering, an unread issue and an
unread hand-added issue both correctly absent, the series year stripped, the by-hand badge present in
Everything read and absent in Added by hand where it would mark nothing out, three rows reading "In
no list" after their list was deleted, an id with no metadata shown as `Issue 4321` rather than
dropped, and no dash in either view as rendered.

Two things were deliberately not done. Neither view offers a way to mark an issue read or to open it,
so both are read-only; adding controls means deciding what "open" does from a page that is not a
reading order, which is a design question this item did not ask. And `renderLibrary` is called from
`renderAll` like every other renderer, so both views are rebuilt on every store update whether or not
they are on screen. That is the existing pattern rather than a new cost, and it is the pattern BL-033
exists to change for all of them at once.

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

- [x] Cover `src/js/cache.js` against a fake IndexedDB
- [x] Cover `src/js/hydrate.js` for cancellation and resumption
- [x] Cover the render paths in `src/js/main.js` that BL-033 will change
- [x] Run the new tests in the workflow from BL-039

Constraint gate: checked 1 to 11, none breached. Constraint 4 permits a dev-only test double.
Splitting this alongside BL-042 will make the third task smaller.

Shipped, with the third task carried to BL-064, and closed there. At the time of this item
`src/js/main.js` could not be imported in Node at all: `node -e "import('./src/js/main.js')"` failed
with `ReferenceError: document is not defined` before a single test could run, because the module
touched the document at import time rather than inside a function. That was not something a test
double could reach around, so the task was left for BL-064 to choose between BL-042's file split and
a DOM implementation as a devDependency. BL-064 found a third route and took it, so the task is now
ticked here. This block's own note anticipated the carry.

The other two modules import cleanly, which is what made them testable without adding anything: both
touch `indexedDB` and `document` only inside functions, and Node 24 defines neither global, so a
double installed on `globalThis` is unambiguous rather than fighting a real implementation. The
doubles are hand-written at the top of each file, which is the existing convention rather than a new
one, and `test/fetch-json.test.js` says why it scripts responses "without a stub library". No
dependency was added, runtime or dev.

`src/js/ask.js` was covered as the third module in place of `main.js`. It is browser-coupled in the
same way, it is 93 lines against main.js's 2,795, and it holds the module-scope `pending` that every
question in the app funnels through, so it carries the same class of risk at a fraction of the cost.
Tests import a fresh copy per case through a cache-busting query, because that module-scope state
would otherwise leak between them.

Forty tests were added, taking the suite from 334 to 374, and **all forty were mutation tested
before being believed**. Twenty-two deliberate bugs were introduced one at a time and the suite was
required to fail on each. Three rounds were needed, and every finding was a defect in the tests
rather than in the modules:

- **The two cancellation guards in `src/js/hydrate.js:69` and `src/js/hydrate.js:74` are textually
  identical, and one test was covering both by accident.** Removing the first guard alone left the
  suite green. The double was keyed by issue id, so a second run's lookup for the same issue
  overwrote the first run's, and the test resolved the wrong call; it also aborted on the signal
  unconditionally, so cancelling rejected the outstanding lookup immediately and the loop broke out
  before ever reaching the first guard. The double now keeps calls as a list and aborts on the
  signal only when asked, and there is one test per guard: a straggler resolving normally after its
  run was cancelled must not advance the replacement run's counter, and a late abort must not clear
  the replacement run's fields. Each now fails when and only when its own guard is removed.
- **Three of the deliberate bugs made the suite hang rather than fail.** Removing the guard that
  ignores a second start leaves the replacement run awaiting a lookup nobody will answer, and
  `node --test` applies no per-test timeout of its own, so CI would have sat there until the job's
  six-hour limit killed it having reported nothing. Every await of a promise the module owns now
  goes through a two-second cap that rejects, so a hang is reported as the failure it is.
- **The fake IndexedDB shared a reference where the real one clones, and that alone was holding up a
  test of the cache's recency ordering.** Found in review rather than by the harness, which had no
  mutation aimed at that line until the review supplied one. `get` in
  `src/js/cache.js:59-63` sets `lastAccess` on the entry it just read and then persists it with a
  `put` it deliberately does not await. Real IndexedDB structured-clones on the way out, so only
  that `put` can persist anything; the fake handed back the stored object itself, so the assignment
  alone appeared to have worked. Deleting the `put` left the suite green, which meant the recency
  ordering eviction depends on was pinned by nothing at all. The fake now clones on `get`, `getAll`
  and `put`, and the deletion fails as it should.

One mutation was refuted rather than caught, and the test was rewritten around what it proved.
Removing the `if (full)` guard that skips an empty lookup leaves the stored state byte for byte
identical, because `upsertIssue` rejects an input with no issue id. What does change is that
`store.update` is called anyway, and the real store persists on every update, so the guard is what
stops an empty answer costing a write. Counting the writes is what made the test able to fail, which
is the same correction BL-035's storage test needed.

Two of BL-056's own tests were fixed in the same change, because filing BL-064 broke them. They
mutate the real document by matching a rank claim, and both matched on a stated table size that
adding a row changed, so each failed on its own guard against a mutation that no longer applies.
The guard behaved exactly as designed, which is why the failure was legible rather than silent, but
the target is now derived from the ranked table instead of spelled out, so the next item to be filed
does not break them again.

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
`src/js/main.js:390-414` now applies the same rule on the way out of storage and falls back to the
default, which is the only option that leaves an app on screen at all. It reports rather than
substitutes silently, through `#app-report` so the message follows the reader between views, and
withdraws that report the moment a usable base is saved rather than leaving it up until the next
reload.

The refused value is left in storage. That took a second change to hold, found in review: the write
is shared. `setCovers` calls `saveSettings` too, so with the fallback in memory, toggling cover art
would have replaced a configured base with the default the reader was handed instead, silently and
unrecoverably, since the settings field already shows the fallback and nothing on screen would still
hold the old value. `saveSettings` at `src/js/main.js:415-428` now writes the refused value back in
preference to the fallback, and the settings form clears the rejection before it writes rather than
after, or that same preference would have discarded the reader's new base. Both directions are
covered by the browser check.

The settings form keeps its own check and its own message at `src/js/main.js:3050-3051`, unchanged.
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
`scripts/vendor-orders.mjs:46` and `scripts/build-event-order.mjs:207`, and none of them used the
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

Shipped. The form row is now `.field-row` at `src/styles.css:662-678` and the reading row keeps
`.row`, so the thirteen rules that describe a reading row, from `src/styles.css:551-554` down to the
hover rule on its action buttons, can no longer reach a form. The form row was the side that moved
because it had one rule against those thirteen, and the empty `.row { }` that sat between them is
gone.

Nothing depended on the collision, which was checked rather than assumed. All eight form rows in
`src/index.html` sit inside a `.stack` or a `.card`, so the old `.stack .row, .card .row` selector
reached every one of them; the reading list at `src/index.html:369` sits inside neither, so it never
matched. No JavaScript queries either class, and no test names them.

The one thing that did lean on the collision was the pair of `padding: 0` and `border: 0` resets in
the old rule, and the first pass through this recorded that they existed only to undo the reading
row's own padding and border. Review found that incomplete and it was wrong for two of the eight.
Six sit inside a `.stack`, where nothing sets either, so for those the original account holds. The
two at `src/index.html:509` and `src/index.html:516` are direct children of a `.card card-static`,
where `.card > *:not(summary)` at 0,1,1 and `.card > *:last-child` at 0,2,0 can both reach them and
both now out-rank `.field-row` at 0,1,0. What holds their padding at zero is the `!important` on
`.card-static > *` at `src/styles.css:655`, which the old rule's 0,2,0 had been masking. Measured
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

BL-038 has since shipped and did neither. Both sub-views reuse the `.results` and `.result` classes
the progress view already uses, so they contain no form row and no `.card` at all, and the prediction
above is left standing rather than deleted because it was the right thing to write down: it was a
statement about what the stylesheet permits, and that has not changed.

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
is written out in words inside the pill at `src/js/main.js:1971-1981`, drawing on the labels at
`src/js/main.js:2036-2041`, and the full sentence from `describe` sits in a visually-hidden span
inside that same pill. Delete the outline and the reader still sees "MU Unlimited", "soon scheduled",
"? unknown", "MU✓ yours: available" or "no yours: not in MU". The outline bounds the label rather
than carrying it, which puts it in the same class as a card border or a table rule.

Two supporting measurements make that safe to rely on. The badge text passes on its own, at 5.94:1
in the worst context against the 4.5:1 floor, so nothing is depending on the border to be legible.
And because the five states are named in words rather than only tinted, 1.4.1 Use of Color holds
without the border too, so Constraint 6 is not resting on the outline either. Both the text
colours and the state distinctions are untouched, which is what the fourth task asked for.

The reasoning is recorded at `src/styles.css:604-628`, directly above the rules it governs, along
with the two conditions that would overturn it. One is these labels being cut back to the bare
glyphs in `SHORT`, which would make the outline the state indicator and put it under the 3:1
floor. The other is a second palette: every figure here is composited against the dark theme, so
BL-032's light theme would void all of them and the measurement would have to be redone per
theme. That comment is the point of the item. The measurement is cheap and will be cheap again;
what was expensive was the judgement, and leaving it unwritten is what caused this to be measured
twice.

BL-032 has since shipped, and the prediction held exactly: a second palette did void every figure
above. What it did not do is repeat the measurement by hand. `scripts/check-palette.mjs` now
measures 82 pairs across both palettes on every CI run, which is the durable answer to a comment
warning that a number would need redoing. The judgement recorded above is what the gate could not
supply and is why it was worth writing down.

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
progress-ring transition at `src/styles.css:380` and the preference queries at
`src/styles.css:901-908`.

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
later. It runs in the lint job at `.github/workflows/ci.yml:154-156` and locally as `npm run anchors`,
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
now three, at `README.md:451-462`, and the four sentences over 40 words are now none: the longest
is 36 and the mean is 17.3. The audit paragraph was the one worth splitting on its own merits, not
just its length, because it was carrying three separate arguments at once: where the catalogue
comes from, why it is read out of `HEAD`, and what a shortcut nobody can check would cost.

The vocabulary was handled by defining all four terms, and by removing an earlier undefined use of
one of them. `vendor` is defined in the paragraph immediately after the word first appears, at
`README.md:359-363`, as fetching a list once and committing what came back. `depth` gained a gloss
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
`src/js/main.js:1372-1375`, and `renderRows` asks it at `src/js/main.js:1879`. "In the markup but
not in the code" stopped being a mistake to avoid and became one that cannot be expressed: there is
no way to add a radio without adding the predicate it renders from.

**The failure was measured before it was closed, not assumed.** The defect this item describes was
reproduced on the tree as it stood, by making the mistake an author would make: a sixth radio
authored into the fieldset with no branch in `matchesFilter`. Against an eight row fixture the
reader saw all eight rows with Crossovers selected, the choice written to `mrt.settings`, and
nothing thrown or logged. The same edit against this change stops the app on the first boot after
it, naming the file to add the filter to. That guard at `src/js/main.js:1367-1371` exists because
rendering into the fieldset appends rather than replaces, so a hand-authored radio would otherwise
have survived alongside the rendered five, offering a filter with no predicate and no listener,
which is the same silence in a new place.

**An unknown filter throws rather than matching nothing.** `filterByFacet` at
`src/js/lib/catalog.js:261-271` takes the opposite decision for the catalog, and the difference is
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
control the two lists build, and `preservingFocus` at `src/js/main.js:232` reads the pair back out of
the rebuilt DOM. It is a no-op whenever focus is not inside the container it was given, which is what
keeps the shelf and the full order from fighting over the same restore when `renderAll` runs both.

Where the pair no longer exists at all, focus goes to the row that took the vacated place, and
deliberately not to the same control on it. `⚑` and `✕` sit in that strip, and Enter auto-repeats on
a held key while Space does not, so restoring `✕` under a finger already on Enter would delete the
next issue as well. Each list names its least destructive control instead, at
`src/js/main.js:2069`, and the reasoning is recorded at `src/js/main.js:187-191` rather than only
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

No unit test, and the reason is worth recording rather than leaving as a silence. Nothing in the
suite touches a DOM: the tests run over pure modules and over files read off disk. The helper
is DOM-bound end to end, and the two things worth asserting about it, that focus lands on a control
and that it is the right one, cannot be observed without a real focus model. Adding one to reach it
would mean adding a test-only DOM implementation, which is scope this item did not earn. The browser
check is the evidence, which is why it was made to fail first.

One measurement trap found while writing that check, recorded because it makes a focus probe pass
while proving nothing. The full order lives inside a `<details>` at `src/index.html:347` that is
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
`src/js/main.js:1227` carries a comment at `src/js/main.js:1237` saying adding must not move the
reader, and the home grid is the one view the app is built to keep them on. It does move them.
Measured in Edge at 1280x900, clicking `+ Add to library` with the button focused leaves
`document.activeElement` at `BODY` immediately, while the button is still in the document and merely
disabled, and it is still `BODY` two seconds later once both rebuilds have run.

The mechanism is not the one BL-054 answered, which is why the helper it shipped does not simply
drop in. `importCurated` sets `btn.disabled = true` at `src/js/main.js:2803`, and disabling a focused
control blurs it there and then, before any rebuild has run. By the time `renderHomeCatalog` reaches
`grid.replaceChildren` at `src/js/main.js:1080` there is nothing left to preserve, so a wrapper that
reads focus at rebuild time reads `BODY` and correctly declines. The grid is then rebuilt a second
time after a 1500 ms `setTimeout`, and the re-enable in its `finally` at `src/js/main.js:2873` puts
a node back in an enabled state that has been detached twice over. Any fix has to capture the
identity before the disable, not at the rebuild.

`renderRail` at `src/js/main.js:852` is the other half, and it is the easier one: its mechanism is
the plain `replaceChildren` that BL-054 already answered, not the disable that the home grid trips
over, so the helper should drop straight in. The review that filed this item read both it
and `renderYours` as safe because navigation follows them, which is only half true: `showView` calls
`renderRail` at `src/js/main.js:826` and reaches `renderYours` through `renderHome` at
`src/js/main.js:828`, where the reader is being moved anyway, but `renderAll` at
`src/js/main.js:3307` calls both on every `store.update` with no navigation at all. Measured on that
route in Edge at 1280x900: with a reading order's button in the rail focused, pressing `d` took the
order from 0 of 89 read to 1 of 89, left the reader on the read view, and put
`document.activeElement` at `BODY`. Only `#list-nav` is rebuilt, at `src/js/main.js:860`, so the
loss is scoped to the per-order entries.

`renderYours` at `src/js/main.js:1003` is a different answer, and the reason is a guard rather than a
call site. The shortcut handler returns unless the read view is showing, at `src/js/main.js:2069`,
and `#home-yours` sits inside the home view, which is hidden exactly then. Its buttons navigate on
click at `src/js/main.js:1016`. There is no route that rebuilds it while it holds focus, so it is
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
`src/js/main.js:876` and `src/js/main.js:1195`. Both predate this change and neither is part of its
mechanism, so they are filed as BL-061 rather than folded in. The first sits on a line this change
rewrites for an unrelated reason, which is why it appears in this diff's added lines. BL-061 has
since removed both, so those two lines carry the rewritten copy rather than what was found here.

**BL-064: Make the view file importable so its render paths can be tested**

- [x] Decide between splitting the file and adding a DOM implementation as a devDependency
- [x] Cover the render paths that BL-033 will change

Constraint gate: checked 1 to 11, none breached. Constraint 4 governs half of the first task: a DOM
implementation would be a devDependency, which is permitted, and runtime dependencies stay at zero
on either route. In the event neither was needed and nothing was added to `package.json` at all.

Filed out of BL-041, which shipped its other three tasks and could not ship this one. The blocker is
not that `src/js/main.js` is long, it is that the module cannot be imported in Node at all:
`node -e "import('./src/js/main.js')"` exits on `ReferenceError: document is not defined`. It reaches
for the document while the module is being evaluated rather than inside a function, so the failure
lands before any test body runs and no double can be installed early enough to prevent it. That is
the whole difference between this item and the three modules BL-041 did cover, each of which touches
the browser only inside functions and so imports cleanly against a double on `globalThis`.

Shipped, and the first task was answered with neither of the two routes it named. Both were tested
rather than reasoned about, and the evidence refused them together.

The route this item was sized for was a DOM implementation as a devDependency. A hand-written double
rich enough to satisfy every top-level statement was built and the import retried, and it got much
further than expected: past the document read, past `loadSettings`, past all five constructions, and
into `renderAll`, where it failed inside `captureFocus`. That is the finding. Importing the module
was the same act as starting the application, so a DOM implementation would not have bought a
testable module, it would have bought a booting one that also never exits, because the module
installed a one-second interval on the way past.

The second half of the finding is the one that settled it. `src/js/main.js` declared no `export` at
all, so an import that did succeed handed back an empty object. There was no render path to call, and
no dependency could have added one. Both named routes address importability; only the split
addressed callability, and the split is sized 20 and held at `Proposed` for being unsplit.

So the third route: separate what the module defines from what it does when it loads. The load-time
sequence moved into an exported `boot()` at `src/js/main.js:3340`, and `src/js/app.js` is the entry
the page loads now, whose whole body is a call to it. The one document read that ran during
evaluation, a lookup of the live region, became a lookup on use. The module now imports in bare Node
with no double of any kind installed, and the process exits, which is the check that the interval
moved too.

`commitRows` and `rowCacheKey` are exported and tested by being called, in
`test/render-rows.test.js`. `rowCacheKey` is the second half of the split: the key was an expression
buried in a two-hundred-line function, and a value with no name cannot be asserted about. The
reasoning that was written above the expression moved with it.

Ten tests, and each was shown to fail before it was trusted. Four mutations were made against the
shipped code, one at a time, and each failed exactly one test by name: placing rows before dropping
them, narrowing the key to one field, dropping today's date from the key, and dropping the up next
marker. The first of those is the defect BL-033's own block records, which scored 217 of 219 rows
reused while still churning 219 nodes, and it is worth saying why the test that catches it counts
moves rather than comparing the result. Placing before dropping still arrives at the right list. It
is only the cost that differs, so a test that asserted on the final order would have passed on the
broken code and proved nothing.

The seam is verified in a browser as well as in Node, because none of the Node tests boot the app
and the change is entirely about what happens at boot. Eight checks in Edge at 1280x900: no uncaught
error, the page loads the entry module, both fields written by the last two statements of `boot()`
are filled, exactly one view is shown, navigation still changes it, and the live region still
receives a real announcement. That check was then shown to have teeth by pointing the page back at
the module rather than the entry: six of the eight fail, which is the whole application not starting.

One test in `test/library.test.js` was re-aimed rather than deleted. It matched the key as literal
source text, and extracting the key moved the text it matched. Its first assertion now names the
extracted function and a second confirms `renderRows` still calls it, so the tested key cannot drift
from the used one. Its remaining assertions stay, because they cover the half no unit test reaches:
that the day is read once per pass and handed to both judgements.

A citation written into this block was wrong and the gate could not have caught it. It named the
line the boot function starts on, computed while the surrounding comment was still being written,
and by the time the comment was finished the signature had moved five lines down. The gate blesses a
citation appearing for the first time against whatever it happens to point at, so it reported no
drift and the reading that would have caught it was skipped, because the pairing print was read only
where a line's content had changed rather than everywhere a line was being blessed. It was found
while re-applying this block after a rebase. The lesson is the narrower one: a first-time citation
has nothing to be compared against and so has to be read, and reading only the changed ones is not
reading the print.

What this does not do is split the file, and BL-042 is untouched and still `Proposed`. The seam
added here is one module and one function, not a view layer.

**BL-063: Extend the Constraint 11 check past JavaScript to the page and its styling**

- [x] Decide what mechanism reads the three HTML files and the three stylesheets
- [x] Record whether CSS `content` counts as shipped copy, since it reaches the screen without text

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

**The mechanism is a test, at `test/shipped-copy.test.js:47-63`, not a second ESLint rule.** ESLint
cannot read HTML or CSS without a parser plugin for each, which is two new tools for 1,626 lines in a
repository that carries three devDependencies in total. A test needs neither: `npm test` already runs
in CI on Node 20 and 24, so nothing new had to be wired up, and reading a shipped file from a test
follows the checklist-heading test BL-061 itself added.

The plain text sweep the block worried about turned out to be right for markup, but only after
answering the imprecision objection rather than waving it through. Two answers.

The first is comments, and the deciding evidence is what the rule being extended already does. An em
dash in a JavaScript comment passes ESLint and an em dash in a JavaScript string does not, which was
measured by running both through it rather than read off the selectors. Catching an HTML comment
while ignoring a JavaScript one would apply Constraint 11 more strictly to markup than to the source
it was written for, so comments are stripped. That decides real lines: `src/index.html` carries 31
HTML comments and `src/styles.css` 46.

The second is what remains once the comments go, which is everything else, and that is the point.
A rule aimed at text nodes would have to name the attributes that carry copy, and `title`,
`aria-label`, `placeholder` and `alt` are an enumeration someone has to keep complete. Sweeping what
is left names nothing and so forgets nothing. It can over-report, since a URL could in principle hold
a dash, and over-reporting is the safe direction here: a false positive gets looked at once, a false
negative ships.

**CSS `content` does count as shipped copy, and the proof is already in the tree.**
`src/styles.css:649` sets `content` to a right-pointing angle glyph on the card summary marker. It
reaches the screen with no text node behind it, so the reader sees it and Constraint 11 governs it.
The comment-stripped sweep covers it with no special handling, because the value is a string literal
in the text that survives. Recorded rather than built, which is what the task asked for.

The imprecision the block worried about is real and was met head on while researching this. A first
scan for `content:` declarations reported 18 hits across the stylesheets; 14 of them were
`justify-content`. Only 4 are `content`, and only one of those four carries a glyph. That measurement
is why the mechanism question was worth the second task rather than being answered by the first
plausible regex.

One limit is worth recording rather than leaving for someone to rediscover, and it is the only case
found that fails in the unsafe direction. Every other edge tried errs towards over-reporting: an
unterminated comment marker matches nothing and so strips nothing, a stray closing marker does
nothing, and the pattern being chosen by file extension can only leave a comment standing. The
exception is a CSS comment opener inside one string literal closing against a marker inside a later
one, which would blank the copy between them. It cannot fire today, since the only glyph-bearing
`content` in the stylesheets is the one at `src/styles.css:649`. Closing it would need a tokenizer
that skips string literals, which is scope this item did not earn.

Scope is walked rather than listed. `server.mjs:12` resolves the served root to `src/`, so `src/` is
what shipped means, and the walk finds whatever is there. The six files are not written down anywhere
in the check, because a seventh added later is precisely what a written list would miss, which is the
argument `scripts/check-anchors.mjs:167-170` makes about the anchors gate. The `design/mockups/`
pages are outside that root and are not served, so they stay out of scope.

Every assertion was proved able to fail before it was trusted. A dash injected into an HTML text
node, into an HTML attribute value and into a CSS `content` string each fails the sweep, naming the
file and line; a dash injected into an HTML comment and into a CSS comment each correctly does not.
The guard against a walk that finds nothing was proved by aiming it at a directory holding no markup,
where it fails rather than passing over an empty list.

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
mid-clause after a full stop. The second copy was deleted; the retained text is at
`PRODUCT_BACKLOG.md:2704-2707`.

The second task was the substance. A scan of every tracked Markdown file, at every block length from
eight lines down to one, found exactly one repeat, and it is this one. That result is what made a
permanent check worth building rather than a one-off answer worth writing down. The scan needed no
minimum length and no exception list to stay quiet, so `scripts/check-counts.mjs` now carries it, at
`scripts/check-counts.mjs:324-354`, and `npm run counts` fails on a repeat. That remains true of this
scan, which is why the citation names it rather than the whole function: the whole-document pass
BL-081 added later does need a floor, and the reason is recorded there.

Putting it in that script rather than in a new one follows what was already there. The counts gate
already refuses a detail block that appears twice, at `scripts/check-counts.mjs:293-303`, which is
this same defect one level coarser: an edit that copied where it meant to move. The heading check
could not see this case, because a block that states its own paragraph twice still has one heading
and one row, so every enumeration agreed the document was sound.

Deliberately not scoped to detail blocks. Copy and paste does not respect a section boundary, and an
enumeration of where to look is the thing `scripts/check-anchors.mjs:167-170` argues against, having
found that every anchor defect the gate exists to catch came from exactly that.

Four tests cover it and all four were proved able to fail. Neutering the check to return nothing
fails the two that assert a repeat is caught; removing the guard that stops a window spanning a blank
line fails the one that asserts two paragraphs cannot pair across the gap between them; and the
fourth, which asserts the committed document is clean, is the one that failed before the deletion
landed.

Review found a fifth case worth covering. The first draft searched block lengths from a fixed eight
downwards, a number with no reason behind it, so a duplicated paragraph would have escaped merely for
running long, which is the defect the check exists to catch. The bound is now derived: a repeat
cannot span a blank line, by the guard already there, so both copies must sit inside one blank-free
run and no block can exceed half of the longest. Across the tracked Markdown that run is 41 lines, so
the real ceiling is 20 rather than 8. A test now duplicates a twelve-line block, which the shipped
ceiling would have missed.

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
built at `src/js/main.js:876` and joined the list's name to its progress with one; the preview button
on every catalog card, at `src/js/main.js:1195`, joined an issue count to an invitation to open the
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
at `src/js/main.js:2369`. A reader who imports one of this repository's own checklists therefore saw
an em dash in the rail, in the page title and in every place the list is named.

That decided the second task the strict way: those headings are copy this repository writes, not
copy it received. Five of the six are generated, at `scripts/build-event-order.mjs:481`, which wrote
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
`src/js/main.js:1179`. That also retired a latent bug rather than fixing it. The old label said
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

**BL-068: Stop the model reading a list id that names a prototype member**

- [x] Read every stored list id through a lookup that answers only for members the object owns
- [x] Decide between a null-prototype list map and a guard at each site, and state the choice
- [x] Prove the fix on a hand-edited state file naming `__proto__`, before and after

Constraint gate: checked 1 to 11, none breached.

`store.state.lists` is a plain object literal, so `lists.constructor` answers with a function,
`lists.toString` with another, and both are truthy. Every place that asks whether a list exists by
indexing that object therefore says yes to ids no reader ever created. Measured on a plain map, six
members answer truthy to an index and none of them answers true to `Object.hasOwn`: `__proto__`,
`constructor`, `toString`, `hasOwnProperty`, `valueOf` and `isPrototypeOf`.

`coerce` in `src/js/lib/model.js` reads a stored id by index three times. It writes each list with
`lists[k] = {...}` at `src/js/lib/model.js:640`, filters the stored order with `lists[id]` at
`src/js/lib/model.js:655`, and picks the active list with `lists[raw.active]` at
`src/js/lib/model.js:666`.

Measured on the tree as it stands, driving `migrate` with state parsed from real JSON text, which is
how a restored backup arrives. Two results, and the second is the serious one.

- **An `active` naming any prototype member is adopted, and the first render throws.** All five of
  `constructor`, `toString`, `valueOf`, `hasOwnProperty` and `__proto__` survive the guard at 647 and
  every one of them throws `TypeError: Cannot read properties of undefined (reading 'length')` out of
  `listProgress`. The stored order keeps them too: a `listOrder` of `["real","constructor","toString"]`
  comes back with all three, because the filter at 636 is an index rather than an ownership question.
- **A stored list id of `__proto__` makes the list invisible and then deletes it from the backup.**
  `JSON.parse` defines `__proto__` as an own key rather than invoking the setter, so `coerce` sees it
  and the write at 621 does invoke the setter: the list becomes the prototype of the map instead of a
  member of it. `Object.keys(state.lists)` is then empty while `state.lists.__proto__` still resolves
  and `listProgress` happily reports 0 read of 3. So the list works when reached by id and does not
  exist to anything that enumerates. `exportBackup` is one of those: the backup it writes carries
  `"lists":{}` beside a `listOrder` and an `active` that both still name the list, and restoring that
  backup loses it for good.

Filed rather than fixed inside BL-037, and the boundary is deliberate. BL-037 closed the same fault
on the two lookups that read an address, because an addressable app hands people links and a link is
how a stranger's id gets in. These three lookups are reachable only by hand-editing the state file or
by restoring a doctored backup, which is a different surface with a different threat, and folding it
in would have widened a filter-in-the-URL change into a model change. The `main.js` fix carries a
comment naming this item so the remaining half is not lost.

Two candidate fixes, to be decided when it is picked up rather than assumed here. `Object.create(null)`
for the list map removes the whole class at once and is the only one of the two that also fixes the
write at 621, since a null-prototype object has no `__proto__` setter to invoke; but it changes the
type of a value that is serialised, spread and iterated in several places. Guarding each site with
`Object.hasOwn` is smaller and local, and it would stop the id being adopted, but the list would then
be dropped rather than kept under its own name, and it is an enumeration someone has to keep
complete, which is the shape of defect this repository has been bitten by before.

Worth recording because it cost a run: the first attempt to measure this proved nothing. It set the
version key to `v` rather than `schemaVersion`, so `migrate` took the version-1 branch and never
reached `coerce` at all, and it built the doctored state from an object literal written
`{ __proto__: ... }`, which sets the prototype at the point of writing, so the fixture had no such
key to begin with. Both mistakes made the output look like a finding. The numbers above come from
the corrected run.

**Shipped.** The null-prototype map was chosen over per-site `Object.hasOwn` guards, for the reason
the second candidate names against itself: a guard at each site is an enumeration someone has to keep
complete, and the next lookup added is the one that will not have it. The null prototype removes the
class rather than each instance of it, and it is the only one of the two that also fixes the write,
since a map with no prototype has no `__proto__` setter for the write to invoke.

The choice does not survive being made once. `{ ...Object.create(null) }` yields an ordinary object,
so a single `Object.create(null)` in `coerce` would evaporate on the reader's first rename and take
every guarantee with it. So the map is built and rebuilt only through three helpers, `emptyLists`,
`cloneLists` and `withList`, and all eleven sites that produce a list map now route through them:
eight renames or edits through `withList`, the delete through `cloneLists`, and `createEmptyState`
and `coerce` through `emptyLists`. Counted from the source rather than carried from the plan, which
said ten and had left `coerce` out of its own list.

The prediction in the plan that a fix confined to `coerce` would be caught by asserting on the
restored state was tested and is wrong. Reverting one rebuild site to `{ ...state.lists, [listId]: next }`
still passes every restore assertion, because a computed key is stored as data even when it spells
`__proto__`, so the list survives its own rename while the map quietly reverts to `Object.prototype`
and the damage lands on the next lookup instead. The assertion that catches it drives a rename first
and then checks both the five names and the map's prototype, which is the assertion the tests now
make. Recorded because the plan's version looked sufficient and was not.

The proof harness had to be repaired before it could be believed, in the same way and for the second
time in this item. `{ '__proto__': value }` invokes the prototype setter even with the key quoted;
only a computed key or real JSON text creates an own property. The fixture was therefore empty, and
two cases were failing because the list was never in the input rather than because the app dropped
it. A check that has never been seen to fail for the reason it claims is not evidence, which is why
both the harness and the permanent tests are now built from JSON text and were run against the
unfixed tree before being trusted.

One stale comment went with the fix. The `main.js` guard added by BL-037 described the list map as a
plain object and deferred the rest of the fault to this item, and both halves of that sentence stopped
being true here. The guard itself stays: it asks the question it means rather than relying on the
map's type, so it is what holds if a later change hands the map a prototype back. The review found a
sibling comment four lines below making the same claim in the present tense, which the first sweep
missed and the record described as complete; both are now past tense.

Three things the review found that the gates did not, all of them the same shape as the fix itself.
The source scan matched a single identifier before `.lists`, so it was blind to `store.state.lists`,
which is how the map is spelled in every one of its twenty references in `main.js`, and blind to a
spread split across lines. That is exactly the wrong file to be blind to, because it is the one file
with no behavioural coverage at all, so a rebuild introduced there would have been caught by nothing.
The scan now matches a dotted receiver over the whole file text rather than one identifier per line.
Separately, `createEmptyState` was the one producing site held by no check: reverting it alone left
all sixty-eight tests green, because a state with no list in it is never looked up by a colliding
name. One assertion closes it. Both were proved by mutation after the fix, not asserted.

The third is a process finding worth more than the other two. Re-aiming citations is per citation but
printing them is naturally per range, and a printer that deduplicates ranges hides the case where two
different claims are re-aimed onto one line. That happened here: the nineteen lines added to the top
of `model.js` shifted a BL-058 citation and this item's own, one landed correctly and the other
landed thirty-eight lines out on top of it, the deduplicated print showed one line that read
perfectly well for the claim it did belong to, and it was blessed. The gate then certified a false
claim and reported zero drifted forever after, which is the precise failure the bless step exists to
prevent. The instructions now say to read one line per citation rather than one per distinct range,
and to expect those two counts to match.

Verified: 494 tests, 0 fail, lint 0, anchors 0 drifted. On the unfixed tree the six new permanent
tests all fail and the harness reports 15 of 17 failing. Eight mutations were tried and all eight
caught: the whole module reverted, `coerce` reverted alone, one rename site put back to a spread,
that same spread split across lines, a spread through a dotted receiver in `main.js`, `withList`
returning an ordinary object, `createEmptyState` reverted alone, and `restoreList` reverted alone.
Two further probes check the scan does not cry wolf: a comment spelling the forbidden idiom out as a
warning does not fire it, while real code with a trailing comment on the same line still does.

A second review round found two more of the same shape and both are closed here. `restoreList` was
held by the source scan and nothing else, so reverting it alone failed structurally and passed
behaviourally, and that is the undo-after-delete path, which is where this repository has twice found
the most dangerous code in a change. It now has its own assertion. The scan also fired on any comment
or string that spelled the idiom out, which is a false alarm that would have landed on the very
comment a maintainer would write to warn the next person off, and false alarms are how a check gets
ignored. It skips text after a line comment marker now.

Also worth recording as the same failure this item keeps producing: the "fifty-five references"
figure in an earlier draft of this block was carried from a review comment rather than counted. It is
twenty. The review that supplied the number caught it in the next round, which is the argument for
re-deriving a figure even when it arrives from something as authoritative-looking as a review.

**BL-070: Print each citation's claim beside its line at bless time**

- [x] Print `claim -> head` per citation on a re-aiming bless, one line per citation
- [x] Decide whether two citations resolving to one anchor with unlike claims is worth a notice
- [x] Prove it by reproducing the BL-068 collision and watching the print catch it

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-068 review, which found a citation blessed onto a line that had nothing to do
with its claim. The failure was not carelessness at the bless step so much as a printer that
deduplicates: two citations had been re-aimed onto one line, the print showed that line once, and it
read perfectly well for the claim it did legitimately belong to. The instructions were tightened to
say read each line beside its own claim sentence, but that is a human discipline, and this repository
argues in `src/js/lib/model.js` and in BL-068's own scan test that a discipline everyone must
remember at every site is the defect rather than the fix.

The structural version is close to free, which is why this is Debt rather than a Proposed idea.
`scripts/check-anchors.mjs:494` already slices the prose immediately preceding each citation into a
`claim` field, and the bless path at `scripts/check-anchors.mjs:934` then writes only the anchor,
fingerprint and head, discarding it. So the script already holds both halves of the pairing that step
3 asks a person to make by hand, and printing them together on the run that re-aims them is the whole
change. `reportNearMisses` at `scripts/check-anchors.mjs:780` is the precedent for the script
printing a notice of this kind.

Shipped as written. `--bless` now prints one record per citation whose blessed line is changing,
carrying the claim, the anchor and the cited line together, and it prints before the lock is
overwritten and from the lock about to be overwritten, because afterwards nothing can say which
claims went unread. Citations already blessed against the line they cite are left out, so a bless
that re-aims eleven prints eleven rather than burying them under the four hundred that did not
move. A range prints its last cited line as well as its first, which is what step 3 asked a person
to do by hand; the last line is computed for the print and deliberately not written to the lock,
since nothing compares against it and adding a field would have rewritten every entry in the lock.

The second task was the open question and the answer is yes, narrowed twice. Once to a single
document and scope, because sharing an anchor across the document is ordinary: 92 anchors in the
blessed lock are cited more than once, against 17 buckets holding more than one citation of one
anchor within one scope. Once more to buckets holding a citation this bless is changing, because
all 17 are correct and a notice firing on correct work every run is what trains the reflexive
re-bless. At rest it prints nothing. Both narrowings are held by a test: removing either turns the
suite red.

Proved on the real collision rather than an invented one. `test/check-anchors.test.js` rebuilds the
two lock entries as they actually stood, both naming line 640 of the model module, both
fingerprinted `0c1b3de0385c2af9`, one asserting a claim about `readAt` over a line that builds a
list, and asserts two records where a deduplicating printer yields one. Reintroducing the
deduplication fails that assertion with `1 !== 2` and leaves the other thirteen green, which is the
shape a negative proof should have. The notice fired for real on its own change: re-aiming the
eleven citations of the gate that this work moved raised it on the four that cite one comment block
in one scope, and it caught a second one in the paragraph you are reading, where the collided line
had first been written in citation form and so became a live claim of its own.

Review found two holes in the first cut, both in the new code and both fixed here rather than
filed. The claim was read only from the citation's own line, and prose wraps, so a citation opening
a line extracted nothing: 76 of the 411 then blessed, better than one in five, printed with no claim
to read
against. Worse, `collisions` compared those blanks and found them equal, which read as agreement
when nothing had been read, and it was already exempting a live bucket where
`src/js/lib/readingFilters.js:25-48` is cited twice in one scope under wholly unlike sentences. The
claim now walks back over the wrapped lines of its paragraph, stopping at the blank line, heading or
table row that ends the sentence, and an unreadable claim is treated as unlike everything including
another unreadable claim. Second, the ten tests all held `pairings`, while the printer that turns
its records into the lines a person actually reads was private and unheld, so moving the very same
deduplication one layer down into the printer left all ten green. The line building is now exported
and asserted directly, and that break turns it red.

Two things were carried rather than done. Making the script importable was necessary before any of
it could be tested and is the only reason the executable body now sits behind an entry guard, in the
shape `scripts/check-counts.mjs` already uses; nothing about the gate's behaviour changed with it,
and the run before and after reported the same count unchanged. The claim is also now printed beside a
`NEW` citation on the check run, which had been giving the line alone. That is the same defect on
the same surface rather than a second item, and a reader who had to go back to the document to find
out what a new line was supposed to say is a reader who skips the step.

**BL-071: Bring the citations in code comments under the anchors gate**

- [x] Decide whether a code comment's citation is a claim the gate should own
- [x] If it is, widen the population past Markdown and re-bless, watching for a flood of new anchors
- [x] Prove it by moving a cited line and watching the gate catch a comment that names it

Constraint gate: checked 1 to 11, none breached.

Filed out of BL-069, which found four of them already wrong. The anchors gate enumerated its
population with `git ls-files` and then kept what ended in `.md`, and that filter was the whole of
the scope decision: a `path:line` written in a code comment was unprotected. BL-069 corrected four
in `scripts/check-palette.mjs` that had drifted silently, all four pointing at code the gate itself
had moved since the comments were written.

The figures this item was filed with were stale by the time it was picked up, and are recorded here
corrected rather than quietly replaced, because the item was scoped on them. It said 706 citations
in non-Markdown files, 696 of them in the lock, leaving ten. Measured at implementation: 27 outside
the lock, and the lock's own share had grown to 825. BL-070 caused most of that growth, which is the
general hazard of sizing an anchors item from a count taken earlier.

The first task was the real one, and the answer is not a flat yes. A citation in a comment is prose
asserting something to a reader, so the gate should own it. A citation inside a string literal is a
value the program computes with, and thirteen of the 27 are exactly that: synthetic inputs in the
gate's own test, one of them naming a line past the end of its file on purpose so the unresolvable
path has something to resolve to nothing. Gating that one would require the fixture to resolve,
which is the single thing it exists not to do.

So outside Markdown only the backticked form is collected, at `scripts/check-anchors.mjs:315-327`.
That is the opposite call from the one Markdown makes, and it is made for the same reason rather
than in spite of it: collect the form that asserts something. In Markdown both forms do, because the
backlog's Evidence column is written bare. In code the two separate by role, and measured across the
repository the split was exact once four evidence strings in `scripts/check-palette.mjs` were
backticked to say what they had always meant. Fourteen citations enrolled: twelve there, one in
`src/styles.css` and one in `test/shipped-copy.test.js`.

The objection this item was filed against is the lock excluding itself by name, since the script
argues in its own comment at `scripts/check-anchors.mjs:167-170` that an enumeration is exactly the
defect it exists to catch, and "skip the lock file" is an enumeration of one. It is excluded
structurally at `scripts/check-anchors.mjs:193`, by the same `LOCK` constant that says where the
output is written, so the rule is that the gate does not read its own output and nothing has to be
kept in step. Binary files are dropped the same way, by a NUL byte at `scripts/check-anchors.mjs:94`
rather than by an extension list, which matters more than it sounds: 43 tracked PNGs would otherwise
have had to be named.

Widening found two wrong citations immediately, which is a rate of two in fourteen on first contact
and the argument for the item in one line. The palette checker claimed the start-fresh button's
border was set at a line that is prose inside a comment, eight lines above the rule that sets it.
The stylesheet claimed the cover placeholder's hue came from the series id at a line that is also a
comment, when it comes from the series name at `src/js/main.js:461-462`. Both are re-aimed, and the
second's prose corrected with it.

Three further citations were rewritten as plain prose instead. Each named an anchor under discussion
rather than pointing at evidence, so fingerprinting the line would have gated content the sentence
never claimed anything about, and a future re-aim would have falsified a true historical record. The
repository already has that rule for a wrong line described in prose, and it applies unchanged here.

One thing had to be repaired rather than merely widened. The claim printed beside each line at bless
time, which is all BL-070 shipped, degrades badly in code: comment markers splice `//` into the
middle of a sentence, and a citation that opens a comment printed a claim of `//` and nothing else.
`claimBefore` at `scripts/check-anchors.mjs:358-384` now strips the marker outside prose, stops at
the first line that is not a comment so a comment cannot absorb the code above it, and reads forward
from the citation when almost nothing precedes it.

The first two of those are conditioned on the prose flag, so Markdown is untouched by them. The
third is not, and that is the deliberate half: a Markdown citation that opens its line has the same
empty claim for the same reason, and six did, three printing `Evidence:` and one printing nothing at
all. So the forward read applies everywhere, it skips the anchor itself rather than repeating the
citation printed directly above it, and it stops at a cell boundary inside a table row, since
forwards a cell ends the sentence exactly as a row does backwards. Nothing here reaches the lock:
the claim is derived at print time and only `anchor`, `fp` and `head` are written, so none of it
can churn a fingerprint.

Five of those six now read as sentences. The sixth does not, and it is worth saying which way that
falls: its citation ends the line, so skipping the anchor leaves nothing to read forward into and
the claim falls back to the `Evidence:` it printed before. That is the fallback working rather than
failing, since the alternative was printing the citation back at a reader who already has it, but
the count of what improved is five and not six.

One near miss came with the split and is reported rather than accepted. A bare citation outside
prose is a string literal in the ordinary case and correctly ignored, but a bare citation inside a
comment is a claim, and would have been ungated in the same silence the item exists to end. Being
in a comment is the only signal the text carries, so that is where `reportNearMisses` draws the
line, at `scripts/check-anchors.mjs:793-809`, and it prints a notice rather than failing, because
prose may legitimately name a file.

The sharp edge is worth stating, because the first draft of the tests hit it. A backticked citation
inside a string literal is indistinguishable from one in a comment, and five fixtures enrolled
themselves as live anchors that would have drifted whenever an unrelated module moved. The fixtures
now assemble their backticks at runtime, which is the rule under test applied to the test, and the
contributor instructions gained a bullet saying so.

**BL-077: Bring relative citations under the anchors gate, or stop writing them**

- [x] Decide whether to resolve a relative citation against the last full path or to forbid it
- [x] Apply the decision to the two that exist and to whatever the gate then reports

Constraint gate: checked 1 to 11, none breached.

Filed out of the review of BL-064, which found one of the two wrong. BL-071 widened the gate to
citations in code comments, and the widening is real, but it matches a full `path:line` and a
citation written as a colon and a line number with no path in front of it is not one. A comment can
therefore name a line, be read as naming a line, and drift with nothing watching it, which is the
exact defect BL-071 was raised to end. The gate reports zero drift while the comment is wrong, and
it is right to, because it never saw the claim.

Both existing cases sat in `scripts/check-palette.mjs`, and each paired a full citation with a
relative one on the following line, so the reader plainly intended the same file. One had already
gone stale by thirteen lines and was corrected in BL-064 by writing it in full. The other, at
`scripts/check-palette.mjs:99`, was still correct, which is what made this an item rather than a
defect: nothing was wrong that day and nothing would have reported it when it went wrong.

**Forbidden rather than resolved**, and the three reasons all point the same way. Detection is
needed under either answer, since a form that cannot be found cannot be prohibited either, so the
choice was never about the mechanism but only about what to do with a hit. Resolution decides which
file a claim is about, and every other heuristic in that gate is confined by its own comments to
naming or printing and kept away from membership, precisely because a wrong guess about a key costs
an ugly key and a wrong guess about a path costs a false claim. Resolution would also write into the
lock an anchor whose citation text cannot be found in the document that supposedly makes it, because
the string recorded there was never written there, which is a new defect rather than a fix for the
old one. The reason that settles it is the reader: a bare line number is unreadable to a person for
the same reason it is unreadable to the gate, since read as a search hit, in a diff, or in the
lock's own quoted head line it names nothing at all. Resolving it would have served the gate and not
the reader, and this whole discipline exists for the reader.

The second task was worded as "whatever the gate then reports" because reading is what had been
finding these and a count from reading is not to be trusted. That was the right instinct twice over.
An enumeration of the tracked corpus found four rather than two: the known one, two inside the lock,
which is excluded from the population by construction because the gate must not read its own output,
and one in this very block, which had written the stale citation in backticks in order to describe
it. The repository's own instructions already forbid that, in the rule that a wrong line is
described in prose and never in the citation form, and this item had broken the rule it exists to
enforce. Then the check caught its author twice more, in the comment explaining the check, within a
minute of that comment being written. What the gate itself then listed was a different four, because
the lock is excluded from the population: the known one, the one in this block, and the two in the
comment. Three of those four were in prose about the defect rather than in code committing it, which
is the honest shape of the thing and the reason the rule cannot be illustrated by example.

The check runs before the bless path rather than beside it, at `scripts/check-anchors.mjs:838-872`,
because blessing a tree that holds one of these records a lock that looks complete and is not.
Where it counts follows the split BL-071 drew: every line of a Markdown file is addressed to a
reader, so a relative citation anywhere in one is a claim, while in code only a comment is, at
`scripts/check-anchors.mjs:282-297`. That is not a nicety. This gate's own test builds its fixtures
out of exactly this shape, so a rule that read string literals would have failed on the tests
written to prove the rule.

It refuses the form against the working tree and only names it under `--ref`, and the review is what
found that the first version did neither: it refused both. That made every revision predating this
commit unqueryable, which is the one thing `--ref` exists for, since the reason to point the gate at
a past revision is to ask whether it would have caught a past breakage. Measured before the fix,
`--ref HEAD` exited 0 while `--ref origin/main` exited 2 with nothing said about drift. The remedy it
printed, to write the path in full, is also unactionable against a revision, because a commit that
has shipped cannot be edited to satisfy a rule adopted after it. The distinction now has one
definition, at `scripts/check-anchors.mjs:306-309`, and two tests hold the two halves apart, because
a policy that lives inside a conditional in `main` can only be checked by running the whole gate.

Both citations in the paragraph above were wrong when first written, by nineteen lines and by
eleven, and both were caught by reading them rather than by any gate. This is the same defect the
BL-064 review recorded and the same cause: a line number computed while the prose around it was
still being written. It is recorded again here because it happened again in the item about
citations being unreadable, one commit after the lesson was written down, which is the strongest
argument available that reading first-time citations has to be mechanical rather than remembered.

A third was wrong in this same item, and it is the worst of the three because it was not a near
miss. The sentence about the audited test count cited the epic narrative one heading above the one
it describes, so the claim named a paragraph about dialogs and notices while asserting that the
paragraph mentions a linter and a changelog, which only the next epic's does. A wrong number lands
on the wrong line; a wrong target lands on a different subject and still reads as a citation. Both
survive every gate identically. It drew attention to itself only because the range it named begins
on a blank line.

Reading the rest of that print then found two more of the same kind, which is the number worth
recording. Five first-time citations in this one item were wrong: two by a line count, and three by
naming a different passage entirely. Of those three, one pointed a claim about the maintainability
gap at the security section's resolution note, and one pointed a claim about correcting a miscount
inside a resolution line at an evidence line two bullets earlier, whose range also ran on into the
start of an unrelated bullet. Every one of the five was written by computing a line number instead
of opening the file, and not one of them was catchable by any gate in this repository, because a
fingerprint blessed on first sight is a fingerprint of whatever the citation happened to hit.

All five were found by a throwaway harness outside the tree that diffs the lock against `main`,
keeps the entries whose anchor and fingerprint are both new, and prints each cited line beside the
sentence citing it. Nothing in the repository does that, so the finding is filed as BL-078 rather
than built here, on the same reasoning that filed BL-070 instead of widening the item that found
it. Until it ships this is a hand discipline, and five defects in one item is the measure of how
well hand disciplines work.

Filing BL-078 then exposed one more figure that had already gone stale, and it had gone stale in
this item's own first pass: Appendix B states the size of the ranked table in a sentence of
arithmetic rather than in the fixed form the counts gate matches, so adding this item's row moved
the real total to 53 while the sentence still said 52 and every gate passed. It reads 54 now, with
the count of filed items beside it re-derived rather than incremented. This is the case BL-057
recorded as deliberately out of the gate's reach, and it is the second time the un-gated half of
that document has drifted in the same direction, which is worth more as evidence than as a
complaint.

**BL-078: Print a first-time citation at bless time, since it has nothing to be compared against**

- [x] Print every citation whose anchor and fingerprint are both absent from the previous lock
- [x] Print each one beside the prose that cites it, one reading per citation
- [x] Refuse a range that begins or ends on a blank line

Constraint gate: checked 1 to 11, none breached.

Filed out of BL-077, which produced five of these in a single item. BL-070 made the bless print the
claim beside the line for every citation whose line is changing, and that is the case where the gate
already knows something is different. A citation appearing for the first time is the opposite case:
there is no previous fingerprint to compare, so the bless records whatever the citation happens to
point at and reports no drift, correctly, because nothing drifted. The reader is the only check, and
the print gives the reader nothing to read.

The evidence is the bless path itself at `scripts/check-anchors.mjs:934`, which writes the anchor,
the fingerprint and the head line into the lock with no reference to a previous entry. Everything
needed is already computed: `collect` carries the prose before each citation, and comparing against
the committed lock is one read of `git show HEAD:docs/anchors.lock.json`.

The blank line rule belongs here rather than in a separate item because it is the same read. The
convention already forbids a range ending on a blank line, nothing enforces it, and the one defect
in BL-077 that announced itself did so by beginning on one, which is the cheapest signal available
that a range was computed rather than read.

Deliberately not proposed: failing the bless on a first-time citation. It would make every new
citation a two-step operation and the gate cannot tell a correct one from an incorrect one, which is
the whole reason a person has to read it. Printing is the intervention that matches what is known.

Delivered, with four decisions worth the record.

The mark went into the existing report rather than beside it. A separate list would print the same
citation twice and leave the reader choosing which copy to read, so `firstTime` returns the records
and `pairingLines` marks them in place, with a count in the header so the number is not something
the reader has to tally. The marking is asserted per citation rather than per anchor, because the
collapse BL-070 was written against would otherwise return one layer higher: two first-time
citations of one anchor have to be marked twice or a reader reads one line and believes both are
covered.

First time means the lock has never held the citation under either its key or its content, and the
second half is the load-bearing one. Re-aiming rewrites the anchor, and the anchor is part of the
key, so a test on the key alone calls every re-aim new. Re-aiming is the common case here rather
than the rare one: a change that moves a module by a few lines rewrites the anchor of every citation
of it, so keying on that alone would announce dozens of new citations on a change that introduced
none. A re-aim carries a fingerprint the lock already holds, which is this gate having
agreed once that the content matched.

Matching that fingerprint anywhere in the corpus was too generous, and a review of this change found
the hole before it shipped. 176 of the 492 entries share a fingerprint with some other entry, mostly
because a rule stated twice in a file is stated in the same words both times, so a citation written
for the very first time in one document was excused by an identical line blessed in another and the
mark it exists to print never appeared. `collisions` is no backstop, because it groups by anchor and
a wrongly aimed citation is at a different anchor by definition. The match is therefore made at the
site, meaning the document, the section and the ordinal, all three of which a re-aim keeps and only
the anchor moves. Both rules were measured against this change's own re-aims and neither announces
any of them, so the narrowing costs nothing on the case it was built for. What the site rule still
cannot separate is a new citation landing at the very site and ordinal of a blessed one, on content
that blessed one already matched, and from the lock alone nothing can. The claim is the narrower one
for that reason: every first sighting elsewhere in the corpus is announced, not every first sighting.

The blank line rule became a refusal rather than a notice, and it refuses at bless time because that
is when a range is recorded. It is the one defect in a range that reading the print cannot find:
`fingerprint` drops blank lines before it takes a head, so a range written a line too wide prints
the first line that has content in it, reads correctly against its claim, and is blessed around a
line the claim does not cover. Refusing was affordable because the tree already complied. All 492
anchors in the lock this change started from were measured and none began or ended on a blank line,
so the rule starts from zero rather than from a backlog of exceptions.

Bless time alone was not enough, which the same review demonstrated in a scratch repository. Dropping
blank lines from the fingerprint is exactly what lets a compliant range acquire the fault later:
sliding a paragraph break inside a cited range onto its last line leaves the fingerprint
byte-identical, so the check reported one unchanged citation and exited 0 while the range had stopped
covering what its sentence is about. The defect would then surface as a refusal aimed at whoever next
blessed for an unrelated reason, which is the shape of failure this gate is supposed to end rather
than create. The check path now names it and fails too. Under `--ref` it is a notice instead, on the
same reasoning the relative citation rule already carries, since a revision that has shipped cannot
be rewritten to satisfy a rule adopted after it. That leaves one verdict written twice, close beside
`relativeVerdict` and not sharing it, which was a deliberate choice to avoid churning code and
citations that had only just landed and is worth revisiting the next time either rule is touched.

It then caught one immediately, and the one it caught was this change's own. Growing the gate by a
hundred and seventeen lines pushed a citation of `claimBefore` onto a blank last line, and the
refusal named it before the re-aiming pass reached it.

One thing went wrong that is worth more than the feature. The harness written to prove these tests
could fail reported all three patched builds green. It keyed on a spawned process throwing, and the
test runner here defaults to the spec reporter rather than TAP, so the lines it searched for never
existed and a failed run and a failed spawn were indistinguishable from a pass. Rewritten to key on
the exit code, the three patches failed five tests between them. A prover that cannot fail is worth
less than no prover, because it is believed.

It then earned its keep a second time. Carried forward to cover the review's fixes, it reported that
removing the ordinal from the site changed nothing, which meant no test held that part of the rule
in place. Dropping the ordinal would have reintroduced the very collapse this item was written to
survive, one layer up: a second citation of a line its section already cites is a first sighting of
its own, and without the ordinal it would have been silently excused. The test that pins it was
written because a sabotage went green, not because anyone thought of the case. Five patched builds
now fail ten times between them across nine distinct tests.

**BL-079: Teach the gate the comment syntax of every file it already reads**

- [x] Widen the comment predicate to the syntaxes the corpus actually contains
- [x] Apply the widening at all three sites at once, since they are one rule written three times
- [x] Give the rule one definition, so a fourth caller cannot inherit a stale copy

Constraint gate: checked 1 to 11, none breached.

Filed out of BL-077's review. The gate reads every tracked file, because `docs()` deliberately passes
no pathspec at `scripts/check-anchors.mjs:183-185`, and binary content is dropped by the reader
rather than by extension. So the corpus holds YAML, CSS and HTML as well as JavaScript. But every
place that asked whether a line is a comment asked it in JavaScript only, with
`/^\s*(?:\/\/|\/\*|\*)/` written out at each. Those three places are the ones that now consult a
syntax instead, at `scripts/check-anchors.mjs:291`, `scripts/check-anchors.mjs:389` and
`scripts/check-anchors.mjs:804`. A YAML comment opens with a hash, an HTML comment with an angle
bracket, and neither was recognised anywhere.

The predicate was character-identical at all three, so this was one rule written out three times and
not three rules that happen to agree. That is the reason to fix it once rather than at the site that
exposed it, and the reason the third task is to leave a single definition behind: the defect this
item describes is exactly what a copied predicate produces when the corpus grows underneath it.

It under-fires rather than over-fires, so nothing false is currently asserted and no gate reports a
pass it should not. A citation written in a YAML comment is simply never examined. It is filed
rather than fixed inside BL-077 because it predates that item: the same predicate arrived with
BL-071, which is where the code-comment split was drawn, and widening it touches claim extraction in
`claimBefore`, which would move the claim text recorded for existing entries and put a large,
unrelated diff into the lock.

One detail is worth carrying into the fix. The message BL-077 prints tells its reader to describe a
wrong line in prose, "line 12 of the workflow file", and a workflow file is YAML, which is precisely
where the rule cannot fire today. The advice is sound and the example is the repository's own, so it
is left as written, but the item that widens the predicate is the one that makes the example
enforceable rather than merely quoted.

Delivered, and the item's own recorded reason for deferring it was false. It said widening "would
move the claim text recorded for existing entries and put a large, unrelated diff into the lock".
The lock records three fields per entry, an anchor, a fingerprint and a head line, and no claim text
at all, which the gate's own comment above `claimBefore` states in as many words: everything there
"decides print only, never membership or fingerprint". The item was still worth doing. The reason
written down for its timing was simply wrong, and repeating it in the delivery would have preserved
it.

What replaced it is a measurement, and the measurement is the awkward one. Widening changes nothing
the gate collects, prints or records today. Every citation outside Markdown was compared under the
shipped code and the new code: 20 before and 20 after, 0 claims different, 0 new lock entries, 0 new
notices, 0 new refusals. The reason is that the 105 lines the widening newly reads as comments, 60 in
the workflow file, 37 in HTML, 5 in the ignore file and 3 in the batch script, hold no citation of any
form between them. So this closes a hole before anyone falls into it, and tests are the only evidence
it can have. That is worth saying plainly rather than dressing a no-op up as a fix.

Keyed on the path rather than unioned into one pattern, and the union was tried first. A hash opens a
comment in YAML and a private class field in JavaScript, and two scripts here already open with a
hashbang. Under a union all three read as sentences addressed to a reader, and the stripper would take
the hash off a future field declaration and splice the remainder into a claim. Keying on the path also
makes the third task worth having: a caller handing over a path gets the answer for that file rather
than the union of every file, so a fourth caller inherits the right rule instead of a stale copy of one.

JSON answers "none" rather than falling through, because a string value opening with an asterisk is
data and not a sentence. Verified as a no-op today: no tracked JSON line matches the old pattern.
`LICENSE` keeps the default for the reverse reason. It has no comment syntax, but it holds no
leading-asterisk line and no citation either, so a rule for it would have no case to answer.

The half fix this nearly shipped was found by looking for it. `ends()` inside `claimBefore` tested the
Markdown heading shape unconditionally, outside prose as well as in, and a YAML comment necessarily
opens with a hash and a space. Widening the opener alone would have taught the walk to recognise
workflow comments and then terminate on them, which looks finished and yields a one-line claim. The
heading test is now scoped to prose, which is safe in the other direction because no JavaScript,
module or stylesheet line can begin with a hash and a space.

The prover caught the same class of mistake in the test written to pin that. The first fixture indented
its two comment lines, the heading pattern anchors the hash to the start of the line, and the test
therefore passed with the scoping removed. Unindented, which is how top-level workflow comments are
actually written, it fails.

Review then found three more rules with no case, and the shape is the same in all three: a test that
reads as though it covers a rule while never reaching it. The batch opener was asserted against a `::`
line, and the one batch script here opens every comment with `rem`, so the assertion passed against a
pattern that misses every comment in the file it was written for. The closing HTML marker was asserted
through a single-line fixture whose backward text clears the length `claimBefore` returns at, so the
read never walks up to a line ending in a marker and both assertions held with the closer removed. The
guard on a null closer had no case at all, and without it `replace(null, '')` coerces to the substring
"null" and deletes that word from any claim carrying it. Each is now pinned by a case that fails without
it. Eleven patched builds fail twenty times between them across all eight new tests, and none of the
eleven is green.

**BL-080: Pair a citation whose scope alone was renamed, rather than report a loss and an addition**

- [x] Pair an addition against a loss in the same document whose anchor and fingerprint are both identical, and whose scope alone differs
- [x] Report that pair as a rename, so a reader is not asked to prove a loss was not a loss
- [x] Keep the existing refusal to guess, since a pairing that guesses is the defect this gate exists to catch

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-078 and BL-079 pass, where two people hit it independently within the same hour and
reasoned their way out of it identically both times. The gate already pairs one addition against one
loss and prints the result as a re-aim, and it refuses that pairing unless a single bucket holds
exactly one of each, at `scripts/check-anchors.mjs:1067-1073`. The bucket carries the scope, at
`scripts/check-anchors.mjs:1035`, so a citation whose scope slug is renamed while its anchor and its
content both stay put drops out of the pairing and prints as an unrelated addition beside an unrelated
loss.

The rename is not exotic, because prose scopes are keyed on the nearest heading and several headings in
this document state a rank. Inserting one item above them rewords every heading below. Reconstructing
the lock across every commit that has touched it, the heading naming BL-007's rank alone has produced
this exact shape twelve times on twenty-four anchors, between 6 and 9 August, each time moving two
citations of `src/js/main.js` from one rank word to the next with the anchors and the lines they name
unchanged. Three fell across the first two days, five on the third as the rank climbed from
thirty-eighth to forty-fourth, and four more in a single evening on the fourth, ending at fiftieth.
Filing this item was the twelfth. That last one is the one worth keeping, because the act of writing
the item down produced the defect the item is about, which is as good a case for building it as any
measurement could be.

What makes it worth building rather than tolerating is that the gate already holds everything the
reasoning needs. An addition and a loss carrying an identical anchor and an identical fingerprint
cannot be a loss, because nothing about what is cited has changed, only the name of the region the
citation sits in. That identity is decisive in a way the existing one is not: the existing pairing
matches on document, scope and file, and then insists on a count of one on each side precisely because
it cannot tell which loss explains which addition. Matching the anchor and the fingerprint tells it,
so reporting a rename does not weaken the refusal to guess that the comment above that pairing defends.
The document must still be held, or a genuine loss in one document could be absorbed by an unrelated
new citation of the same lines in another.

Left open on purpose: whether a recognised rename should still make the gate exit 1. It should. A
rename absorbed silently would let a real loss hide behind a real rename in the same run, which is the
shape of every defect this gate has caught so far. Printing it as its own kind while still exiting 1
spares the reader the reasoning without sparing them the reading.

Delivered as `scopeRenames` at `scripts/check-anchors.mjs:659-705`, exported so a test can hold its
shape rather than reach it through a run of the whole gate. It pairs on document, anchor, ordinal and
fingerprint together, keeps the existing count of one on each side, and refuses two anchors that both
resolve to nothing, since those are not equal but unreadable. The renames are taken out before the
re-aim buckets are built, at `scripts/check-anchors.mjs:1046`, or a renamed pair could be the second
entry that tips a bucket past one and silently suppresses a genuine re-aim beside it. Both sides stay
in the counts the exit code is computed from, so a run holding a rename still fails, as decided above.

The question the item could not answer from a single session is how often this really fires, so the
shipped function was run over every blessed version of the lock preceding this change. Two things had
to be fixed before that answer meant anything, and the first pass reported neither. `git log --follow`
returns commits in log order rather than a parent chain, so nine of its comparisons were across
branches; and the commit that introduced the scope component into the key re-keyed the whole lock at
once, which the sweep counted as documents renaming headings when it was the gate migrating. Together
those manufactured 92 of the 117 pairs the first pass claimed.

Restricted to the first-parent chain, the sweep pairs twenty-four anchors across twelve commits, and
every one is BL-007's rank heading: exactly the occurrences and dates recorded above, with `ae515ba`
as the twelfth. So the history adds no case that was unknown when this was filed. It confirms the
figure the item was filed on, which is a weaker claim than the first pass made and an honest one.

The single other candidate in the whole history is the one that earned the falsifier. On 7 August an
anchor moved from `item-details` into a newly created `parked` section while `item-details` kept a
hundred others. Identity alone paired it, and it is not a rename: it is a citation moved between two
sections that both still exist, which is a genuine loss beside a genuine addition. Requiring the old
heading to have actually vanished rejects that one pair and leaves all twenty-four standing.

Eleven tests cover it. One holds the pairing itself. Four hold the refusals and fail against a matcher
that pairs on the anchor alone: changed content, two unresolvable anchors, two candidates on one side,
and a loss in one document explained by an addition in another. Six more were added after review.
Three hold the falsifier, built on the collision this change's own delivery notes create, since
`scripts/check-anchors.mjs:1035` is now cited under two headings with the same ordinal and the same
fingerprint; they separate a heading that vanished from one that did not, and keep the check per
document so a shared slug elsewhere cannot block a real rename. Three more hold the verdict, which is
now a named function rather than an expression so the decision that a rename still fails a run can be
asserted directly. The test that claimed to defend it asserted instead that a pure function had not
mutated its arguments, which no change to the verdict could have falsified.

Both halves were proved able to fail by swapping in the implementation a first attempt would write,
rather than by removing the file, since deleting a module that gained an export fails at import and
proves only that the export is missing. Without the falsifier one test fails; with the verdict reduced
to drift alone, three do.

**BL-081: Let the repetition check see a copy that is not next to its original**

- [x] Compare each blank-free window against the whole document, not only the block after it
- [x] Decide what a legitimate repeat is, since some lines are meant to appear more than once
- [x] Prove it against the copy that got past the gate, which this repository's history still holds

Constraint gate: checked 1 to 11, none breached.

Filed out of BL-075's review, which found the defect the gate is named for sitting inside the change
that ran it. `checkRepeats` compares a window against the window immediately following it, at
`scripts/check-counts.mjs:340-346`, so it catches a block directly followed by its copy and nothing
else. BL-075's first draft repeated a six-line paragraph forty-five lines further down, which put
pre-implementation framing after the verification numbers that closed the block, and the gate printed
that nothing was said twice.

Measured with a whole-document scan for repeated blank-free four-line windows: 3 in that draft, which
are the three overlapping windows of the one six-line duplication, and 0 in the tree it was written
against. The same scan finds 0 across the five product documents today, so this is a gap in what is
checked rather than a defect currently on disk.

Sized 2 and filed rather than fixed inside BL-075, because comparing every window against every other
is a different algorithm from the adjacency walk and changes what the gate says about every document
it reads, which is not a thing to smuggle into a change about a recovery banner. The second task is
the real work and not a formality. Adjacency made the question of a legitimate repeat moot, since two
identical paragraphs touching are almost never intended, and a whole-document comparison has to
answer it: the ceiling derivation above the loop already records that a repeat cannot span a blank
line, and that guard is doing more work than it looks like once the two copies can be anywhere.

**Shipped.** The adjacency walk is untouched and a second pass runs after it, at
`scripts/check-counts.mjs:381-419`, descending from the longest possible repeat down to a floor and
comparing every blank-free window against every earlier one. Both passes share the one `claimed`
set, so a block the adjacency walk has already reported is not reported again by the second.

That sharing has a cost worth stating rather than discovering later. A hit from the adjacency walk
splits a pasted block into runs shorter than the floor, so a paragraph containing one internally
doubled line, pasted 40 lines away, is reported only as the two one-line adjacency hits and never
named as a paste. It is an under-report and not a silent pass, since the gate still fails on those
hits, which is why it is recorded beside the code rather than fixed by re-anchoring around claimed
lines.

While in the function, the ceiling comment's two figures were re-derived and were both stale: the
longest blank-free run in this document is 59 and not 41, so the derived ceiling is 29 and not 20.
That is a pre-existing figure rather than one this change introduced, corrected because the new
pass reads the same `longest` value and would otherwise inherit a comment that disagrees with it.

**The second task was the work, and the answer is three lines, measured.** The item guessed at four
by measuring the one draft it was filed from. Counting every repeated blank-free window across the
six tracked prose documents instead gives 124 at one line, 4 at two, and 0 at three and at every
size above it. All 128 are meant: the constraint gate line stands 25 times in this document and
accounts for 24 of its 26 one-line repeats, and the four two-line repeats are a table header, a
fenced `npm start`, a WCAG criterion line and a bare mermaid fence. Three is therefore the smallest
size at which a repeat is not already ordinary practice here, and it is a reading of this corpus
rather than a rule about prose.

That floor is falsifiable rather than asserted, which is the part worth keeping. Lowering it to two
and running the suite fails 8 tests, and the failures include the check that the document as
committed contains no repeat, so the four legitimate two-line repeats are not a prediction about
what a lower floor would report but a measurement of it. Removing the blank-line guard from the new
pass fails 10, sharing 7 of those 8. So both decisions are held up by the real document rather than
by a fixture, and the two sets are named here rather than being called the same set, which they are
not.

**Claiming both copies rather than only the later one needs a third copy to show at all.** The
overlap test inspects the origin as well as the duplicate, so with two copies a claimed duplicate
already suppresses every smaller window and claiming the origin changes nothing. It is the third
copy that needs it: an unclaimed origin pairs again with the next copy along, and the same paragraph
is reported twice carrying the same origin line number, which reads as two faults where there is
one. Measured on a six-line block written three times: 1 finding as shipped, 2 with the origin claim
removed. This paragraph replaces one claiming a duplication would report five times, which review
showed was false, and the test that was said to hold the decision passed with the decision reversed.
A sixth test on a triplicate now holds it, and it is the only test the origin claim can fail.

**The third task was completed by refusing the method it named.** The draft that got past the gate
does still exist, and running the new pass against it reports the duplication where the shipped
walk reports nothing. But it exists only in a local checkpoint ref on one machine, on no branch and
on no remote, so a test that read it would have passed here and failed in CI and in every other
clone, which is the class of fault the line-ending note at the top of the counts test was written
about. The test rebuilds the shape instead: it locates a real blank-free six-line paragraph in the
real document, pastes a copy 45 lines further down, and asserts one finding of six lines. It
asserts the paragraph was located, so a document that changed shape under it fails rather than
quietly checking nothing.

Six tests were added and each was proven able to fail, which took four mutations rather than one:
deleting the pass fails 4, lowering the floor fails 8, dropping the blank-line guard fails 10, and
leaving the origin unclaimed fails 1. A refusal cannot be proven by deleting the pass, because a
pass that does not exist refuses everything, so each refusal was failed separately by the wrong
version of the decision it holds. Review found one that could not fail at all: its fixture's longest
blank-free run was two, below the floor, so the loop it was named for never started and the guard it
tested was never reached. It now carries an unrelated run of three for that reason, and fails when
the guard is dropped.

**BL-072: Give the recovery banner's two actions different weights**



- [x] Remove `btn-p` from the three places that write it, or define it if a primary button is wanted
- [x] Decide which, since the class name says an intent the stylesheet never carried out
- [x] Carry that intent out with the class the app already has, rather than a new one
- [x] Gate the boundary the change creates, in both places a ghost button has one

Constraint gate: checked 1 to 11, none breached.

Filed out of BL-069, where it caused a wrong measurement before it was noticed. `.btn-p` was written
in three places, on the download button in the recovery banner and on two buttons built in
JavaScript, and the stylesheet defined no rule for it anywhere. Every button carrying it rendered
exactly as a plain `.btn`. Those three sites are named in prose rather than cited, because the class
is gone from all of them and a citation of it would be a claim about lines that no longer say what it
says.

**The class was never removed, because it was never written.** `git log -S` over the stylesheet
returns nothing for it, so this is not a rule that was deleted and left dangling; the intent was
declared in the markup and the rule to carry it out was never written at all. That matters for
which way to resolve it, because there is no earlier design to restore.

**The framing on this row was wrong, and inverting it is the work.** It was filed as dead markup to
delete, on the reading that `.btn-p` was a missing primary style. It is not. `.btn` at
`src/styles.css:465-469` is already the primary treatment, a red fill with `--on-accent` text, and
`.btn-g` at `src/styles.css:474` is the secondary ghost. `.btn-p` is a modifier that says "primary"
on a base class that is primary anyway, so deleting it changes nothing on screen and was correctly
scored a 1. What that reading missed is what the redundancy was hiding.

The banner's own paragraph says "Download a copy first, then you can start fresh", and both buttons
were `.btn`. Two identical buttons cannot carry an order. The one made equally loud is the
destructive one: `src/js/main.js:134-146` confirms Start fresh replaces the unreadable data with an
empty tracker, behind a confirm dialog. So the app's data-loss recovery screen gave a destructive
action exactly the same weight as the safe action it tells the reader to take first, which is the
sort of defect this repository's own rule about recovery paths exists to catch.

`.btn-g` is the app's established answer, used in nine places including the Cancel button of the
confirm dialog at `src/index.html:737`. The convention there is the same shape as this: the action
being asked for is `.btn`, the way out is `.btn-g`. Applying it here follows the app rather than
inventing anything, and it is what `.btn-p` was reaching for, expressed from the other side.

**The gate refused the first attempt, which is the reason it exists.** A ghost button on this banner
is a tint over a tint, and the first version could not express that: `resolveSurface` read its base
as a token and nothing else, so it resolved one level deep. Nesting it and measuring found the
generic ghost border at 2.44:1 dark and 2.39:1 light, under the 3:1 a control boundary needs,
because `--line-2` is calibrated for the page and the card while the ghost's own fill sits closer in
luminance to it than either, lighter than the page in dark and darker than it in light. `--muted` is
the quietest token that clears against that fill, at 4.29 and 4.39, and staying quiet is the point of
a ghost. `--warn` clears too, at 4.42 and 4.91, and was rejected for the opposite reason: it is the
banner's own alarm colour and would pull the eye towards the action the paragraph says to take
second.

**Every figure here is quoted against the button's fill, not against the banner.** Review found the
first draft of this block and of the stylesheet comment attributing both to the banner, which
overstates them: against the banner `--line-2` reads 2.90 and 2.73 and `--muted` reads 5.11 and 5.00.
The same draft called the banner "a warm tint lighter than either", which holds in dark and is false
in light, where the banner is darker than both the page and the card. The code was right throughout,
since the `SURFACES` entry and both new pairs name the button rather than the banner; only the prose
explaining it was wrong. That is the identical misattribution BL-069 recorded one surface earlier,
made a second time in the block describing how the first one was caught.

**Verified against painted pixels rather than against the arithmetic.** `getComputedStyle` reports
this button's background as `rgba(255,255,255,0.06)`, the value before compositing, so reading it
back would have confirmed the stylesheet and not the render. The surface was sampled from
screenshots of the real banner instead, reached by writing unreadable bytes into the storage key
before load. Edge paints `#38302b` dark and `#e3dcd4` light, which is what the gate computes, to the
byte. Both are pinned in the test.

The pair count goes from 78 to 82, and the two new pairs are the two places a ghost button has a
boundary: its label against the body floor, and its border against the control floor. Both are
checked against the declarations they claim to measure, because a hand written list can drift from
the rule it describes, and a pair deleted from it is how the button that was made quieter would stop
being measured at all. That last one was found by mutation: nine of ten mutations were caught and
the tenth, deleting the label pair, was missed until the check was tied to the stylesheet.

**BL-073: Say the recovery instructions once instead of twice**

- [x] Decide which of the two paragraphs owns the guidance, and cut it from the other
- [x] Keep the reason the data could not be read, which is the part only the error knows

Constraint gate: checked 1 to 11, none breached.

Seen in the BL-072 screenshots rather than looked for. The banner renders two paragraphs that say
almost the same thing. The error line built in the store and written into `#blocked-why` ended "It
has NOT been changed or deleted. Saving is paused so it cannot be overwritten. Download a copy, then
choose to start fresh." The static paragraph at `src/index.html:147-148` then says "It has not been
changed or deleted, and saving is paused so it cannot be overwritten. Download a copy first, then
you can start fresh." The store's half is quoted as it was filed and is no longer what the code
says, so it is named in prose rather than cited.

The duplication is not merely untidy. The one thing on that screen only the error knows is why the
data could not be read, and repeating the reassurance twice pushes that reason into the middle of a
paragraph a reader has already been told to skim. This is the same judgement BL-027 made about
saying a thing twice in an alert, so there is precedent for the direction.

Filed rather than folded into BL-072, which changed the weight of the two buttons and touched no
copy. It is a content decision on a recovery surface and deserves its own change.

**It was three times, not twice, and the third was the loudest.** Counted in Edge against a real
schema-version failure rather than read off the source: every one of the three instructions was on
the screen three times. Boot handed whatever error it found to the save report, an assertive live
region above the banner, and the load failure was such an error at the time, so the string was
painted there and in `#blocked-why` and paraphrased again by the standing paragraph. BL-075 removed
that boot report, and the comment now standing in its place at `src/js/main.js:3385-3389` records
why. The row was filed off a screenshot of the banner alone, which is where the miscount came from.
After the change each instruction is on screen once. BL-075 has since taken the load failure out of
that slot, so this path no longer reaches it.

**The paragraph owns the guidance because it is the only one of the two that lasts.**
`#blocked-why` is repainted on every render at `src/js/main.js:103-122`, and until BL-075 took its
text from `store.lastError`, so that slot held whatever failed most recently, not what raised the
banner. Instructions written into it are destroyed by the next failure, which is to say exactly
when recovery is going badly. The markup paragraph is unconditional and cannot be overwritten, so
it keeps the advice and the store keeps the reason. That also settled the accessibility question
the other way round from the obvious one: `role="alert"` is `aria-live="assertive"` with
`aria-atomic="true"`, MDN's ARIA alert role reference, retrieved 2026-08-09, so the region is
announced whole and nothing was lost by moving a sentence from the string into the paragraph beside
it. BL-075 removed the repaint from `lastError`; the copy division here is unchanged.

**Cutting the load error alone would have left the defect reachable.** A second writer sets
`lastError` while blocked, the refusal in `persist`, and it carried the same two instructions. It
is reachable by adding anything to the library while the banner is up, which is a plausible thing
to try, and driving that path in the browser put the pair back on screen twice. It now reports only
what the reader cannot see, that the change was not saved and that saving resumes on a choice. This
was found by stressing the recovery path rather than by reading the diff, which is precisely the
shape this repository's rule about recovery code warns of: the least exercised paths in the app are
the ones that only run once something has already gone wrong.

**One message is allowed to repeat the standing copy, and the difference is the point.** The
refusal in `startFresh` still says to download a copy. It is not restating the advice, it is
redirecting: the automatic copy did not land, storage is probably full, and the way through is to
save the file by hand and press again. The rule this change applies is that a message may repeat
the banner only when it adds something the banner cannot say. The refusal adds a distinct failure
and a distinct route; the refused write added nothing but its own news.

**The reason was still on screen twice, and fixing that here would have been a different change.**
The save report and the banner both showed it, and the banner showed the newest failure rather than
the one that blocked saving, so the reason could be pushed off the screen by a later error. Holding
the blocking reason in its own field ends both, and it is a behaviour change rather than a
copy decision, so it was filed as BL-075 rather than folded in here, and shipped there.

Verified with 529 tests passing, lint clean, and two browser runs against the real banner in Edge:
the instruction count went from three to one, and a seven-point stress of the blocked paths, write
refused, banner repainted, original bytes intact, copy set aside, banner withdrawn on choice,
passed in full. The new check was proved to fail three ways before it was trusted, once with the
guidance back in each of the two store messages and once with the paragraph deleted from the
markup.

**BL-074: Draw the architecture and data flow the code already has**

- [x] Draw the module graph as ownership, separating what the view file constructs from what it only calls
- [x] Draw the data flow of one reading action, from the click through the store to the repaint
- [x] Draw the persistence and recovery paths, naming every storage key the app writes
- [x] Pitch each diagram at a level that survives BL-042 splitting the view file, or say plainly that it will not

Constraint gate: checked 1 to 11, none breached.

Asked for directly by the owner, whose stated purpose is explaining how the app's components function
to other people. That framing scopes the item: it buys comprehension, not restructuring, and it must
not become a reason to move code around. Nothing like it exists today. The `docs/` directory holds the
UX study, the rationale for building a browser companion rather than an emulator, and four documents
under `docs/ux` that specify interface flows in prose without naming a single source module. The UX
study does cite source modules, twenty-six times, but it cites them as evidence for findings about the
interface rather than to describe how the parts fit together, and no tracked file in the repository
contains a rendered diagram of any kind. The code's own shape is the one thing the documentation
never draws.

Three diagrams rather than one, because the app has three separable stories and one picture that told
all three would tell none of them well. The module graph answers what depends on what: a single view
file of 3,413 lines wires a store, a metadata client, a rate limiter, a response cache and a hydrator
together at `src/js/main.js:65-78`, and behind it sit sixteen library modules, none of which holds
state of its own at module level. Where state exists it lives in an instance the view file constructs,
as the rate limiter's queue and its window of recent hits do, which is why the graph is worth drawing
as ownership rather than as imports. The data flow answers what happens when a reader marks an issue
read, which is the loop that makes the app feel like an app: the store mutates, its change callback
repaints everything, and a failed write reports itself on the way back. The persistence diagram
answers where a reader's progress actually lives, which is the question the product promise turns on,
and it is the one with real teeth because `src/js/storage.js:9-12` declares four keys, not one, and
the other three serve two different kinds of recovery rather than one. Only the salvage key is
reached from a failed read. The other two belong to restoring a backup, one staging the new bytes so
the swap cannot half-happen and one holding the snapshot that lets the restore be undone, and both
are written on a path where nothing has gone wrong at all. A diagram that collapsed those into a
single recovery story would hide the distinction the code is built on.

Mermaid in fenced code blocks, which GitHub renders natively. That keeps runtime dependencies at zero
and adds no build step, so Constraint 4 is untouched, and it keeps the diagrams in the same review
flow as the prose rather than in a binary a reviewer cannot diff.

Two cautions the work should carry rather than discover. BL-042 splits the view file into per-view
modules, so a module graph drawn at file granularity is invalidated the moment it lands; drawing at
the level of responsibilities instead of filenames costs nothing now and survives that change. And
every backticked path and line written into a new document becomes a claim the anchors gate will
chase forever, which matters more here than usual because a document describing structure is exactly
where citations drift fastest.

Shipped as three diagrams in `docs/ARCHITECTURE.md`, linked from the contributor section of
`README.md` beside the emulator rationale, which is where a reader who has decided to look at the
code arrives. All three render on the code host and add nothing to the project: the blocks were
parsed against the same diagram library the host uses, installed in a scratch directory outside the
tree and never referenced from `package.json`, and the check was proved able to fail by feeding it a
deliberately broken block first.

Drawing as ownership rather than as imports paid for itself three times, and each is written into
the document because an import graph would have said the opposite. The metadata client builds its own
limiter and cache when handed neither, at `src/js/api.js:34-35`, and the app always hands it both,
which is what keeps one request budget across the page. Saving a new API base replaces the cache and
the client and leaves the limiter alone, at `src/js/main.js:3063-3065`, because the budget belongs to
the connection rather than to the base URL. And one of the sixteen library modules is not in the
browser graph at all: `src/js/lib/curated.js` is imported outside the tests only by the vendoring
script, at `scripts/vendor-orders.mjs:27`, so fifteen are reachable from the page and a graph drawn
from the directory listing would have been wrong by one.

The third task's enumeration came out at seven names rather than the four the block above predicted,
which is the reason it asked for every key rather than the store's keys. Four are declared at
`src/js/storage.js:9-12`, two more belong to the view file at `src/js/main.js:36-37`, and the
seventh is a family whose suffix is the moment it was written. The response cache is not among them,
because it lives in IndexedDB precisely so it cannot compete for quota with a reader's progress.

The fourth task is answered per diagram rather than in general, because the honest answer differs.
The module graph and the persistence diagram survive a split: the first names responsibilities and
owned instances, and BL-042's own second task commits to keeping the store wiring in one place; the
second names keys and their writers, and moving the two lines that write the view file's own keys
changes neither name nor value. The reading action survives in shape but carries one claim that a
split can falsify, and the document says so where the claim is made. That the repaint is synchronous
inside the write is a property of the store's change callback being called directly, and it is what
lets the announcement be gated on the write having stuck. A split that put a scheduler between them
would make that section wrong rather than merely re-aimable.

Drawing the salvage path found a defect that reading it had not, filed as BL-076 and deliberately not
fixed here, because this item buys comprehension and changes no code. The decision to write a dated
copy is remade on every boot, so reloading while blocked during a second incident writes another
copy of the same bytes: three boots leave three, measured against the shipped module with a fake
storage.

**BL-075: Keep the reason saving is paused where the reader can still see it**

- [x] Hold the reason the read failed in its own value, so a later failure cannot displace it
- [x] Decide where a failure that happens while saving is paused is reported instead
- [x] Say the reason once, since two regions paint it on the first render
- [x] Clear it when the reader resolves the block, and check the banner goes with it

Constraint gate: checked 1 to 11, none breached.

Filed out of BL-073, which cut the duplicated advice off this banner and could not fix this without
becoming a behaviour change. The banner's explanation line was repainted from the store's last error
on every render, so it held whatever failed most recently rather than the failure that paused
saving. Measured in Edge: with the banner up for an unreadable schema version, adding one reading
order replaced the version reason with the refusal to save, and the reason the reader is on that
screen at all was gone from the banner. It went from the save report above in the same instant
rather than surviving there, because both regions were painted from the same last-error value by
the one change callback at `src/js/main.js:72-77`, so nothing left on screen said why saving was
paused.

The same value was also painted twice on the first render, once into the save report and once into
the banner, which is the residual half of BL-073's finding. Both came from one cause. The store had
one slot for the newest error and the banner read that slot, so the banner could not distinguish the
condition it is describing from an event that happened during it.

The shape of the answer is a value that is set when the read fails and cleared when the block is
resolved, with everything else that fails in the meantime reported only where transient notices go.
It is the code that runs after something has already gone wrong, which is where the two most
serious findings in this repository's review history were, so the cases to press on are the ones
where the recovery is offered twice, where it is resolved in another tab, and where the reason is
cleared while the banner is still on screen.

**The reason now has its own slot, and it is the store that keeps them apart.** `blockedReason` is
set where the read fails and read by the banner; `lastError` keeps its job of carrying the newest
failure to the save report. Measured in Edge after the change: with the banner up for the same
unreadable schema version, three added reading orders left the version reason in the banner
untouched while the save report carried the refusal, and the reason was in the banner alone on the
first paint rather than in both regions.

**Boot no longer reports the newest error, and the research wave that justified keeping it was
wrong.** The first draft argued the line was load-bearing because a route applied during boot can
write and fail, leaving it as the only surface. It is not the only surface. Every writer of
`lastError` calls `onChange` in the same step, and that callback notifies the save report, so the
failure is already on screen before boot reaches the line. Reproduced in Edge with a route write
failing during boot: 2 writes into `#save-report`, both the identical string, into a region that
`src/index.html:132` declares as an assertive alert. The duplicate predates this change; what this
change removed was its last excuse, since a failed read no longer sets `lastError` at all. Saying
the same sentence twice on an alert surface is the defect BL-027 closed, so the line went rather
than being re-argued as a backstop.

**Clearing it is the half that could lose something, so it clears only on a resolution that
happened.** Starting fresh unlatches the store before writing the empty state and re-latches if that
write fails, and at that moment the data is still unreadable, so the read failure is still the true
reason saving is paused and is kept rather than replaced by the write that just failed. Clearing on
the way in would have left the banner up with an empty line in the one case where the recovery is
itself failing. The reason falls back to that write only when there was no read failure to keep, so
a latched store can never be left with a banner and nothing to put in it.

**Withdrawing the banner has to withdraw what pointed at it, and a restore is how that surfaced.**
Starting fresh writes its own success into the save report, so the refusal it replaces is gone. A
restore reports to the restore pane instead and leaves the save report alone, so "choose what to do
about the data that could not be read" survived the banner that offered the choice, naming a screen
that was no longer there. Everything the save report can hold while the banner is up is about the
block, since its only writers in that state are the refused write, the refusal to start fresh and
the empty-download warning, so the withdrawal is unconditional on the render where the block ends.

**One render must not re-announce a sentence that has not changed.** The banner is `role="alert"`,
and the line is repainted by every render. While it held the newest error the text differed each
time, which hid the question; a stable reason assigned on every render would replace the text node
inside a live region and invite it to be read out again on each save. It is written only when it
differs, measured at 0 text mutations across three refused writes against 3 before.

**A reason must not outlive the block it explains, and one way out did not say so.** The banner is
hidden by the latch while the line is painted from the reason, so a reason still set after the latch
had cleared could not be seen. It would still be a value asserting that saving is paused when it is
not, one caller away from being believed. Every deliberate exit clears both in the same step, but a
read that simply works cleared only the latch, and that was safe solely because boot reads once on a
fresh store. Since withdrawing at the moment something stops being true is preferred here to
refusing it later, the successful read now drops the reason as well, and the two hold together by
construction rather than by call-site discipline.

**Resolved in another tab is not reachable, and that is a finding rather than code.** Nothing
listens for the `storage` event, so a second tab does not learn that the first resolved the block.
Its banner was already stale before this change and is equally stale after it, since the reason and
the latch move together. Filed as an observation here rather than fixed, because adding cross-tab
awareness to a recovery surface is a larger change than this item and would want its own measurement.

**The same defect had one more instance, and the comment that removed the first states the rule that
finds it.** A start fresh that cannot write reports the failure through the store's callback and was
then reported again by the handler that pressed the button, so one refusal put two identical strings
into the assertive region. Measured in Edge with every write made to fail: 2 before and 1 after, with
the reason and the failed write both still on screen. Found by review rather than by the item, and
fixed here rather than filed, because the comment replacing the deleted boot line states in general
that a report there can only repeat what the callback already showed. A surviving instance three
thousand lines away would have left the file contradicting its own reason for the deletion.

Verified with 575 tests passing, up from 569 by the 6 added here, lint clean, `npm run counts` clean,
and 10 browser checks in Edge at 1280x900. Each check was proved able to fail. With both source files
reverted, 10 of the suite failed: the 6 tests written against the reason's own slot and the 4 updated
ones. Reverting the store alone fails the same 10, so it isolates nothing. What isolates the sixth,
covering a read that works after one that did not, is removing the single `blockedReason` assignment
from the success branch of `load()`, where it is the only failure of 575. The browser run went from 10
of 10 to 6 of 10 on the reverted tree, and to 9 of 10 with only the duplicate refusal restored. An
earlier draft drove no write at all and so scored the same on both trees, which is the shape of check
this repository treats as no evidence, and it was rewritten to click the catalog's own add button.

**BL-076: Stop a reload during a second incident writing another dated salvage copy**

- [x] Write the dated copy once per incident rather than once per boot
- [x] Cover the reload during a second incident, which no test exercises today
- [x] Decide what the banner should say when a dated copy already exists

Constraint gate: checked 1 to 11, none breached.

Found by drawing the persistence paths for BL-074, which is the kind of defect a diagram finds and a
read does not: nothing about the code is wrong on the line, and the fault is in a decision being
remade on a path the reader can repeat. When a load fails, the unreadable bytes are copied aside. If
the salvage slot already holds a different incident's bytes, the copy goes under a dated name
instead, so an old copy cannot be clobbered by a new one. That is right.
What is wrong is that the choice is recomputed from scratch on every boot and the date is taken at
the moment of the write, so the second, third and fourth reload of a page that is still blocked each
write another dated copy of the identical bytes. Measured with a fake storage against the shipped
module: three boots during one second incident attempt three writes. Only two keys survive there,
because a fake storage runs all three inside one millisecond and they collide on the same dated name.
Three distinct copies is a browser measurement, where the boots are milliseconds apart. The
collision is not a mitigation, and is itself the clobber `freeArchiveKey()` was added to prevent.

It costs nothing during a first incident. There is a test for a second, unrelated
incident, at `test/storage.test.js:164-190`, which reaches the dated branch by salvaging one, but it
never loads twice inside that incident, so the repeat is untested rather than tolerated. It costs a
copy of the reader's whole state per reload during a second one, in exactly the near-quota condition
the salvage code exists to survive, and a reader whose storage is too full to hold one copy is the
reader the recovery banner is talking to. This is the shape the repository's own instructions warn
about, where the most dangerous code in a change is the code added to prevent data loss.

Sized 2 because the fix is a condition rather than a redesign, and scored Measured because the
repeat was reproduced rather than reasoned about. The third task is a real question and not a
formality: once a dated copy exists, the banner's offer to download a copy points at one slot, and
what a reader should be told when there are several is a content decision the fix should not make by
accident.

Shipped, and implementing it found the item had understated itself twice. The repeat is not only per
reload: `startFresh()` salvages before it clears, so the button the banner points at wrote one more
inside a single boot. In Edge, two genuine incidents plus two reloads plus one Start fresh left five
salvage keys where two were needed. And the cost is not only space. Run against the near-quota shape
the suite already models, where copying the whole state throws while writing a small empty state
succeeds, the second boot cannot write its duplicate, so the store answers that no copy survived and
the escape hatch refuses, telling the reader their unreadable data could not be set aside while the
copy written on the previous boot is on disk untouched. The duplicates consume the quota that causes
that refusal, so the path manufactures the condition that disables it. A reader is not stranded,
since downloading a copy lets the hatch run, but they are pushed through a step they do not need by
a claim that is false.

One condition covers all three, which is why the size held. Whether a copy exists and whether one can
be written now are different questions, and the code asked the second while reporting the first, at
`src/js/storage.js:90-100`. A salvage slot already holding these exact bytes is now adopted rather
than written again, so writes are a strict subset of what they were: every branch that wrote before
still writes when no copy exists, and none writes that did not. Identity is byte identity and never
the clock, which is what makes "the same incident" mean anything across a reload. Only the salvage
family is scanned, because `restore()` overwrites the pre-restore slot and a copy found there is not
one this store may promise is still held. The main slot is still read directly rather than through
the scan, at `src/js/storage.js:96`, so the scan is an addition to the question and never a
replacement for it. That distinction is load-bearing and was got wrong first: routing the whole
question through the scan meant a storage that cannot be enumerated stopped recognising the copy in
its own main slot, and wrote a duplicate where the shipped code wrote none, measured at 1 write
against 0. Near quota that write fails, and a failed write there is exactly what refuses the reader
`startFresh()`, so the optimisation had quietly reintroduced the defect it was written to remove.
With the direct read restored, a storage that cannot be enumerated, or that throws part way through
the scan, falls back to precisely the shipped behaviour, so the optimisation can never be the reason
a recovery is refused.

Task three, decided rather than defaulted: the banner says nothing new. The download button already
hands back this incident's bytes and stays correct when a copy is adopted instead of written; a
reader cannot reach older copies from the interface, so naming them raises a question the app has no
answer to; and the standing copy was cut with measurement in BL-073 immediately before this. What
changes is that the false refusal stops, so nobody is told a copy could not be set aside while one
exists.

Asserted, tested, and found false, which is the part worth recording. This block first said that two
dated copies written inside the same millisecond would share a name and clobber one another, but that
the case was unreachable in the product because two boots cannot fall inside one millisecond, so the
hazard was recorded rather than coded around. The reasoning was sound and the premise was wrong. It
does not need two boots. `startFresh()` salvages before it clears, so one boot already writes twice,
and when another tab of the same origin rewrites the live key between the boot and the button the
second write has genuinely different bytes, cannot be adopted, and takes the same name as the first.
The copy the reader had already been promised was overwritten by the copy taken on the way out. That
is the one thing the archive exists to prevent, so it is fixed here rather than filed: the archived
name is now chosen by asking which name is free rather than by trusting the clock to be unique. It
was found by pressing the claim rather than by re-reading it, which is what the contrarian wave is
for. The accumulation across genuinely different incidents, which this still does not address, is
BL-082.

Verified: 603 tests pass, 11 of them new, and the four that reproduce a defect were watched failing
with only `src/js/storage.js` put back to the shipped version, at 599 pass and 4 fail. Two of those
count writes rather than keys, because boots inside one millisecond share a key and an assertion on
the final contents passes on the broken code; a third asserts the escape hatch is not refused while
the salvage write is failing, which is the reader-facing half of the defect and counts nothing; the
fourth counts surviving copies, because a clobber writes twice on either tree and only the survivors
separate them. The other seven guard the new code rather than reproducing the old defect, so
reverting cannot exercise them; each was watched failing under a mutation that removes the one
protection it names. Four of the seven exist only because that exercise found gaps. Removing the
catch inside `existingCopyOf` and letting the failure escape left the suite entirely green, because
the storage the enumeration test uses has no `length` at all and never enters the loop, so two tests
now cover the throwing paths. Review then found a worse one: the walk had *replaced* the direct read
of the main slot rather than adding to it, so on a storage that cannot be enumerated the copy already
in hand went unrecognised, and the fallback wrote a duplicate where the shipped code wrote none.
Measured at 1 write against 0, and near quota that failed write is what makes `startFresh()` refuse.
The main slot is now asked directly first, and two tests hold it. A browser check in Edge at
1280x900 goes 7 of 7 on this change and 5 of 7 on the shipped code, the two failures being the repeat
write and the Start fresh write, where the shipped code leaves five copies for the two incidents that
need two. It asserts that Edge's storage can be enumerated rather than assuming it, since the fix
rests on that. The check has to drive two separate incidents to be worth running: during a single one
the shipped code already adopts the copy it is holding, so a one-incident version scores 6 of 6 on
both trees and is evidence of nothing.

**BL-082: Give the salvage copies a life beyond the incident that wrote them**

- [x] Decide when, if ever, a salvage copy stops being worth keeping
- [x] Give the reader a way to see what is being kept on their behalf, or a reason they should not
- [x] Keep whatever is decided inside the near-quota budget the salvage path already defends

Constraint gate: checked 1 to 11, none breached.

Filed out of BL-076, which stopped the same bytes being copied twice but left untouched what happens
across genuinely different incidents. Every distinct incident permanently keeps a full copy of the
reader's state, and nothing in the app ever removes one: not starting fresh, not restoring a backup,
not a later incident. Read the module through and no path deletes a salvage key.

That is the right default, because deleting the reader's only copy of unreadable data is the failure
the whole path exists to prevent, and it is why this is Debt rather than a defect. But it grows
without limit in the one area whose entire purpose is surviving a full origin, and the copies are of
the whole state rather than a fragment of it. A reader with several incidents over a few years is
carrying several copies of everything they have, with no way to see them and no way to remove them,
and the first they will learn of it is a write failing.

The second task is the harder half and should not be answered by adding a manager to the banner. The
banner is talking to a reader in the middle of an incident, and BL-073 cut it down for good measured
reasons; a list of old copies is the wrong thing to put in front of someone who has just been told
their data cannot be read. Settings is the more likely home. Scored Measured because the growth was
observed directly rather than inferred: the browser check written for BL-076 shows five keys reached
by ordinary use before the fix, and two afterwards, with neither number ever falling.

**The first task was answered by declining to answer it.** Nothing expires on a clock. Not
`startFresh()`, not `restore()`, not a later incident, not an age. A rule that removed a copy would
have to know whether the reader still wants data the app itself could not read, and it cannot know
that, so every rule available is a guess against the one thing the path exists to protect. What
changes is not the lifetime but who decides it: kept for ever and invisibly becomes kept until the
reader says otherwise, and visible in the meantime. That reading of the task was reached by trying to
write the expiry rule and finding that every version of it deleted something on a reader's behalf.

**One copy is not offered for removal, and it is withdrawn rather than refused.** While a block is up
the banner is telling the reader to download this incident's copy or start fresh, and both need the
copy that is at that moment the live one. Its row renders a hint in place of the button, so the offer
is never made; `forgetSalvage()` refuses it as well, as a backstop rather than as the design, which is
the shape the BL-035 review asked for. The refusal lifts once the incident is resolved, so that same
copy becomes the reader's to remove. Refusing it for ever would have made the copies this item is
about the one kind that can never be cleared.

**Which copy is live is asked of storage, not of this tab, and the first version got that wrong.**
The review found it and it reproduced first try. `blocked` and `salvageKey` are per `Store`
instance, so a tab open since before the data went bad has neither set. Two instances over one
storage: the second saw the copy as live, the first saw it as removable, and `forgetSalvage()` agreed
with the first because its backstop read the same two fields, so the screen and its backstop failed
together rather than one covering the other. That tab is not blocked, so its next ordinary edit
overwrites the main slot, and a probe confirmed the unreadable original was then recoverable from
nowhere. A copy is live when it holds exactly what the main slot holds, which is the question
`existingCopyOf()` already asks of storage for the same reason: a pointer is bookkeeping that can
drift, and this has an answer storage can be asked directly. The per-tab test is kept as an OR and a
mutation confirms it is now defence in depth rather than load-bearing. The protection lifts by itself
when the main slot changes, so no tab has to be told that another one resolved the block. Two real
pages in Edge over one storage carry the case, since the claim is about `localStorage` being shared
between them and that is a property of the browser rather than of the module.

**Three answers rather than two, for the same reason constraint 6 keeps five.** `salvageCopies()`
returns `null` when the storage will not enumerate and an empty list when it enumerates and finds
nothing, and the screen says "this browser will not list them" for the first and "nothing is being
kept" for the second. Collapsing them is a one-word change that would tell a reader whose copies are
all still on disk that they are carrying nothing, on the screen whose only job is to say what is
being carried. The distinction survives into the click handler too: a copy missing from the list
because the browser declined to enumerate is not a copy that was removed, and saying so would be the
one wrong thing to say here.

**The listing writes nothing.** It is the one screen whose subject is running out of room, so
spending the budget to report on it would be self-defeating; a test counts the writes rather than
inspecting the result, because an assertion on the final contents passes on a version that writes and
then tidies up.

Verified: 614 tests pass, 11 of them new, and none of the eleven can be watched failing on a reverted
tree, because the code they guard does not exist there. Each was instead watched failing under a
mutation that removes the single protection it names, and all twelve mutations were scored as
expected, with the file restored identically afterwards. One did not fire on the first run, and that
was the finding rather than the nuisance: `null` coerces to zero in arithmetic, so subtracting the two
dates sorts an undated copy last by accident for every timestamp after 1970, and the sentinel version
cannot be told from the broken one. The test now seeds a copy stamped at the epoch, which a device
with a dead clock genuinely produces, and that is the only value that separates them.

The mutation harness itself failed the same way once, and it is worth recording because it is the
mirror of the rule about a check that has never been seen to fail. It parsed the runner's output for
`not ok`, which is TAP, while `node --test` defaults to a reporter that prints a heavy cross, so it
read every mutation as survived. It reported the first real guard as untested when the guard was
sound. A harness that cannot see a failure scores every mutation the same way, so it now asks for TAP
explicitly and refuses to score at all unless its named failures agree with the summary count.

A browser check in Edge at 1280x900 goes 19 of 19 on this change and 3 of 19 on the shipped code. The
three that pass there are honest: one measures a property of the browser, and two describe behaviour
that already exists, since a second tab does block and salvage today and nothing removes a copy today.
The check drives two genuine incidents, because one incident produces one copy and a list of one
cannot show an ordering or a withdrawn offer.

The size shown against each copy is twice its length, and the first version of the comment saying so
was wrong in a way no gate could catch. It asserted a 5 MiB budget. Bisected in Edge, the largest
value a cleared page accepted under a one-character key was 5,242,879 characters, which with the key
is 5,242,880, and that is 10 MiB at two bytes per character rather than 5. Two fills of the same room,
one of plain letters and one led by an accented character, were accepted to the identical character,
so the cost is per character and does not vary with the content. The factor survived the measurement
and the sentence around it did not, which is the argument for measuring a claim that is only going to
be read.

Two smaller corrections came out of the same review. A copy's date is shown to the second rather than
to the day, because two copies taken on one day rendered the same sentence in the row, in the
accessible name and in a confirmation that calls the removal unrecoverable, leaving the reader
choosing between them with nothing to choose on. Two copies inside one second still read alike; those
are the collision case `freeArchiveKey()` handles, where the copies are moments apart and the
millisecond separating them is in the key rather than in anything worth showing. And the label
compared its timestamp against `null` rather than testing it for truth, because a stamp of zero is a
real value the layer below reports on purpose, and treating it as absent discarded in the last step
the distinction the module was built to keep. The step that checks it asserts that a date is shown at
all rather than which date: the epoch renders as the last day of 1969 west of Greenwich, and the first
version of that assertion failed against correct code because it was asserting the tester's timezone.

**BL-069: Close the three accent boundaries the BL-067 review found and could not gate**

- [x] Add red on the rail, naming every control that paints it rather than the first one found
- [x] Teach the gate to resolve a `color-mix` background, or record why it will not
- [x] Choose the dark green behind the read tick, or record the 2.30:1 as settled and why
- [x] Re-derive the printed pair count wherever it is stated

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-067 review, which found that `--red` and `--on-accent` paint more surfaces than
that item gated. All three clear the floor or are defensible where they do not, so this is coverage
rather than a visible fault, and the reason for filing it is the reason BL-067 existed: an ungated
boundary is one nobody will notice moving. Nothing on screen changes. Three boundaries that were
unmeasured are now measured on every run, and the pair count goes from 72 to 78.

**Red on the rail, three painters and not one.** The first draft of this block named only the skip
link at `src/index.html:16`, which is the least of them: it is invisible until focused. The other
two are on screen in every view. `.brand .mark` at `src/styles.css:253` is the 28px red square at the
top of the rail, and `.ri[aria-current]::before` at `src/styles.css:290` is the 3px bar marking the
current destination, which the comment at `src/styles.css:283-284` names as part of the selected
state. Writing the reason string as "the skip link" would have gated a state indicator under the
name of a transient link. That is the "named one painter, missed the others" pattern this whole item
exists to close, and the draft reproduced it inside the item about it.

The draft then made a second version of the same mistake, and this is the one that would have shown
up as a wrong number rather than a wrong name. It assumed all three shared one surface at 4.00 and
4.41, with the accent bar as a wrinkle to settle later. The wrinkle was the substance. The bar does
not sit on the rail. It sits inside `.ri[aria-current]`, whose background at `src/styles.css:286` is
a translucent tint over the rail, and the bar is that element's `::before`, so it can only ever land
on the tint. It reads 3.35 dark and 3.68 light, not 4.00 and 4.41, and putting it on `--rail` would
have overstated it by 0.65. It is therefore two pairs, the rail and the tinted item, not one, and
the brand mark and the skip link are what share the 4.00 and 4.41.

**The blocked banner: the gate learned to resolve it.** Two buttons render inside a banner whose
background is `color-mix(in srgb, var(--warn) 12%, var(--panel))` at `src/styles.css:920`. The choice
this block left open was between teaching the gate that form and recording the pair as deliberately
unmeasured. Teaching it won, because the same mechanism was needed anyway for the accent bar above,
and a gate with two unmeasured holes in it is a gate that will grow a third. `SURFACES` at
`scripts/check-palette.mjs:151-174` names a derived background as a fraction of one token over
another, and `resolveSurface` at `scripts/check-palette.mjs:202-222` computes it. One mechanism
covers both CSS forms because they are the same arithmetic: laying a translucent layer over an
opaque backdrop and mixing two opaque colours in sRGB are both a straight interpolation of the gamma
encoded channels. The tokens are still read out of the stylesheet, so changing `--rail`, `--panel` or
`--warn` still moves the number. It was checked against Edge before it was trusted, and the four
composited values agree with the browser to the byte, which is why the test pins them. The banner
measures 3.16 dark and 4.07 light.

**A wrong alarm, and what raised it.** Working out the banner, the two buttons were first read as
carrying a `--line-2` border, which computes to 2.90 dark and 2.73 light and looked like a real
failure. It is not one. The `.btn-p` class on the first of them, since removed under BL-072 and so
named here in prose rather than cited, did not exist anywhere in the stylesheet, so both buttons were
plain `.btn`, which is a red fill with a transparent border. `--line-2` paints nothing there. The
screenshots in `docs/UX_STUDY.md` show it: two solid red buttons, identical to each other, no outline
on either. The lesson is the cheap one, that a border token in a rule is not a border on screen until
the rule matches, and it cost a measurement round. BL-072 later found that the identical pair was
itself the defect, and the second button now carries the ghost treatment, so those screenshots record
the state at the time rather than what ships.

**The read tick, recorded as settled, on arithmetic the block did not have.** The white tick inside
a checked read checkbox is `--on-accent` on `--green`, at 2.30:1 in the dark theme and 6.48:1 in the
light. This block put the choice as open and observed that "nothing about the arithmetic forces
2.30:1, unlike the progress trough". That is true, and it is also not the whole picture. An
exhaustive search over all 16,777,216 sRGB colours says the trough has 0 feasible greens and the
tick has 2,153,393, so the two really are different, but it also says what the feasible ones cost.
White on green at 3:1 caps the green's luminance at 0.3000, and the shipped `#43c088` sits at 0.4067.
Every feasible green therefore reads at most 6.30:1 against the page and 5.81:1 against a card,
against 8.22 and 7.58 today, so clearing the tick costs between 1.77 and 1.92 on the fill, depending
on which surface it is read against. The nearest
feasible green lands on exactly 3.00 with no margin at all. That trade is the wrong way round: it
spends contrast on the fill, which is what tells a reader the box is checked, to buy contrast on a
glyph that no one reads, since the button's label at `src/js/main.js:1955` reads "Mark X as unread"
exactly when it is checked and that is what a screen reader announces. Same judgement as BL-049 on
the badge borders. Recorded as settled, with the numbers, in `KNOWN`.

**Two follow-ups filed rather than folded in.** Four `path:line` citations in the comments of
`scripts/check-palette.mjs` had silently drifted, because the anchors gate reads tracked Markdown
and nothing else, so a citation in a code comment is unprotected. They were corrected here as part
of touching the file; the general question is BL-071. The `.btn-p` class that raised the false alarm
above is dead markup and is BL-072.

**BL-055: Record the drift in the audited figures instead of letting them go stale**

- [x] Re-derive the size of `src/js/main.js` and record the drift where it is stated as a fact
- [x] Re-derive the test count in the same list, which had drifted further than the one it corrects
- [x] Decide, and record, which statements of the figure are live claims and which are snapshots

Constraint gate: checked 1 to 11, none breached.

Filed out of the BL-014 review. `src/js/main.js` was stated as 1,566 lines in three places and was
2,563 when this item measured it, so the file had grown by 997 lines, 64 per cent, while every
statement of its size stood
still. The maintainability gap at `PRODUCT_BACKLOG.md:6683-6685` uses that size as the argument for
the gap, which made the understated figure an understatement of the debt.

The obvious fix would have been to overwrite 1,566 with 2,563 everywhere. That is wrong here,
because this document already has a convention for the case and applies it in the third bullet of
the same list: the audited figure is preserved and the drift is recorded beside it, as "224 is the
figure as audited" at `PRODUCT_BACKLOG.md:185-187`. The clause is quoted only as far as its fixed
half. The live number beside it moves whenever a test is added, and pinning a copy of it into this
record would be the same defect in a second place, which is the rule BL-059 later had to state
outright. Appendix A does the same thing in its own idiom, correcting a miscount inside the
`Resolved:` line rather than editing the bullet it resolves, at `PRODUCT_BACKLOG.md:6702-6706`.
Overwriting would have destroyed the audit trail these sections exist to keep.

So the audited figures stand and each now carries its drift. Two of the three statements were
treated as live and one was not. The outcome narrative at `PRODUCT_BACKLOG.md:6517-6519` describes
the state that motivated OC-3, and the same paragraph says there is no linter
and no changelog, both of which have since shipped; correcting the number alone would leave a
coherent snapshot half-updated and half-stale, which is worse than either. It is left as a snapshot,
which is the treatment the as-is journey map in the UX study already gets. That precedent is the
weaker of the two, because the journey map is stamped as a hypothesis in its own text at
`docs/UX_STUDY.md:836-839` while this paragraph carries no such marker and reads in the present
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
sentence, which is the enumeration anti-pattern `scripts/check-anchors.mjs:167-170` argues against in
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
`CHANGELOG.md:1343-1352` that says so and points at the backlog clause instead. That clause was
checked before the entry was allowed to defer to it: `PRODUCT_BACKLOG.md:175-179` and
`PRODUCT_BACKLOG.md:185-187` do each carry a live value and are marked as needing re-derivation, so
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

**BL-066: Offer a reading order grouped by the collected editions it is sold in**

- [x] Carry a checklist's sub-headings through the parser, the vendor script and the stored list
- [x] Show each collected edition as a heading with its own progress in the reading view
- [x] Ship the New Ultimate Universe as a trade order beside the issue-by-issue one
- [x] Keep an export of a trade order re-importable as a trade order

Constraint gate: checked 1 to 11, none breached.

Filed and shipped from a reader request: a lot of people buy Marvel in trade paperbacks, and
Comic Book Herald publishes reading guides built around the collected editions rather than the
single issues. The catalog had no way to express one. Every vendored order was a flat sequence of
issues, and the checklist format the orders are authored in had no meaning for a sub-heading, so a
trade guide could only be pasted in as an ordinary issue list with the volume boundaries thrown
away.

The obvious design was rejected on evidence, and the evidence is worth recording because it will
come up again. A trade could have been an item in its own right, one row per volume, which is what
the reader actually buys. Marvel serves collections from the same metadata endpoint as issues and
they do carry a `digitalId`, so a collection row would have had a cover and a working reader link:
`/issues/1295` returns ULTIMATE SPIDER-MAN VOL. 4 as a Hardcover, with `digitalId` 53147, retrieved
2026-08-08. It fails on coverage rather than on principle. Paging every record the mirror holds for
the relevant years returned 1110 records for 2023, of which 22 are collections, then 880 for 2024
and 785 for 2025, of which **none at all** are collections, and no collection of any Ultimate title
in any of the three. A trade order built that way would have been 23 empty rows. The contents of a
collection are also prose in the `description` field rather than a structured list, so even where a
record exists the issues it collects cannot be read off it reliably.

So a collected edition is a heading over the issues it collects, not a row. That keeps every issue's
real cover, real availability badge and real reader launch, and it means read state is shared with
the issue-by-issue order rather than duplicated: ticking Ultimate Invasion #1 in one ticks it in the
other, because read state is global and keyed by issue id. Measured in Edge at 1280x900 with storage
cleared: importing the trade order and marking its first two issues read, then importing the
issue-by-issue order, showed 138 rows with 2 already read and no headings.

The grouping is stored on the list rather than on the issue, which is the whole reason it works. An
issue record is shared by every list holding it, so an edition name on the issue would have relabelled
the issue-by-issue order the moment the trade order was imported. Held on the list, the same issue is
in a book in one list and in no book in the other, which is the truth about both.

Editions are rendered as runs of consecutive items rather than as a separate grouping alongside the
order. The reader can move an item, and a grouping held separately would then disagree with the
sequence; a run cannot, because it is read off the sequence. A book split in two by a move shows as
two headings, which is what the order now is. The progress on each heading counts every item in the
run and not the rows a filter left visible, so "2 of 4 read" means the same under every filter. Both
are covered: the unread filter took the view from 132 rows to 130 while the first book went on
reporting 2 of 4.

The volume line-up is the one thing here that no gate can check, and the description says so on the
card. It comes from Comic Book Herald's guide by way of the request, not from Marvel, because the
metadata to verify it does not exist. What could be checked was: all 132 issues resolve to ids
already in the issue-by-issue order, so no new claim about what Marvel published is introduced, and
`Ultimate Universe: Finale #1` is named by five different volumes but a list holds an issue once, so
it is given its own section after the five it is split across. Six issues in the issue-by-issue order
are in no collected edition at all, the 2024 Free Comic Book Day issue and the five-part Ultimate
Impact: Reborn, and they are left out and named in the description rather than quietly dropped.

Constraint 8 applies unchanged and is visible here: 29 of the 132 issues have no `digitalId` and no
cover, because they are past the end of the metadata snapshot. They render with the pending badge, as
they do in the issue-by-issue order.

Verified with 20 new tests, 440 passing in total, and 18 browser checks in Edge at 1280x900. Each new
test was mutation checked rather than merely watched to pass: breaking `listItems`, the re-import
guard, the removal path, the load-time prune and the three catalog behaviours in turn failed exactly
the intended tests and nothing else.

**BL-083: Make backup restore truthful under every write failure**

- [x] Model failure at each restore write and cleanup stage
- [x] Never return failure with durable state changed and in-memory state stale
- [x] Reconcile the screen from durable storage whenever the main-key swap may have happened
- [x] Make the result message describe the durable outcome

Constraint gate: checked 1 to 11, none breached.

The restore writes the replacement to the main key before removing its staging key. If that cleanup
throws, the catch reports that nothing changed while storage already holds the replacement and the
screen still holds the old state. A focused storage probe reproduced that split. This follows up the
atomicity claim under BL-023 rather than adding another backup feature. Evidence:
`src/js/storage.js:341-408`, `src/js/main.js:3010-3038`.

Shipped. Five stages can fail and the shipped code told all five the same story. The restore now
carries `changed` on every return, and the two stages that can leave the saved data altered ask
storage what it holds rather than inferring it from which call threw: a swap that threw and a
cleanup that threw after the swap landed arrive as one indistinguishable exception, so the answer
comes from reading the main key back. If it holds the backup the reader asked for, that is a
success with a staging key left behind, and the screen adopts the restored state instead of keeping
the state it was told had survived. If it does not, the screen is reconciled through `load()`, which
re-reads rather than assuming, and latches if what it finds cannot be read.

**The wrong sentence was not the harm.** The stale screen was. An unreconciled store still holds the
replaced data, so the reader's next ordinary edit writes that data back over the restore they were
told had not happened, and the test that pins this asserts the state after that edit rather than the
message. Reverting the branch that tells the two failures apart turns all five of the first round's
tests red. Removing one line, the call that rewinds the undo snapshot, turns exactly two red, which
names the pair that defends the finding below rather than the reconciliation above it.

**Two smaller findings came out of modelling the earlier stages.** A restore that failed at the swap
had already overwritten the undo snapshot with the current data, so a second failed attempt spent
the undo the first successful restore had earned, and offered to undo it with what was already on
screen. The snapshot slot is now read before the write and rewound when the swap turns out not to
have landed, and a storage that will not say what it held declines the rewind rather than guessing
at it, because `null` means the slot was empty and that is a different answer from silence. The
banner's undo button is also set from `hasPreRestoreSnapshot()` on the failure path, so the offer
follows the snapshot rather than the last thing that happened.

A third case is modelled and cannot be checked: storage that stops answering reads mid-restore. Then
the durable outcome is genuinely unknown, `changed` is null rather than false, and the store latches
so nothing overwrites a value it cannot read. That is what the store already does after a failed
load, and this reaches it by the same route.

**A review of the above found four further defects, three of them in the repair itself.** The
repository's own record says the most dangerous code in a change here is the code added to prevent
data loss, and every one of these was in the code added above.

The first was the worst. `changed: null` latches the store and notifies, the notification repaints,
the repaint asks whether to offer an undo, and that question was an unguarded read of the storage
that had just stopped answering reads. The throw unwound out of the observer, out of the
reconciliation and out of `restore()` itself, so the handler's message never ran and the reader was
told nothing at all about a restore that had already changed their saved data. The read is now
guarded and the result is built before the notification, so a throwing observer cannot swallow it.

The second was in the snapshot rewind that fixed the finding above. It runs in the storage that has
just refused a write, so it is the operation most likely to be refused in turn, and it was the one
write in this path that was neither read back nor tested. When it failed, the undo slot kept the
live data, `hasPreRestoreSnapshot()` said yes, and the button announced "Restore undone" for a swap
of the data already on screen. The rewind now reads itself back and empties the slot when it cannot
be honoured, and `undoRestore()` declines a snapshot identical to the saved data as the backstop for
a withdrawal that is refused too.

The third is the ordinary success path. It took `setItem` not throwing as proof the swap had landed,
which is the exact inference this item exists to remove, and this module already knows better:
`salvage()` reads its own write back and `forgetSalvage()` reads its own removal back, both because
storage can report a success it did not have. Both outcomes now reconcile through the same read-back,
so a swap this browser accepted without storing is reported as the failure it is rather than as a
restore. The mismatch branch also keeps what the main key held going in, so "Nothing was changed" is
now compared rather than asserted, and a key holding a third thing is called what it is.

The fourth was in the view. The success branch un-hid the undo button unconditionally, so a first
restore into an empty tracker offered an undo of a snapshot that is an empty string, and clicking it
answered "No pre-restore snapshot available." Both branches now ask the store.

Verified: 624 unit tests pass, 10 of them new. Of the 5 added in the review round, 4 fail against the
reviewed tree; the fifth pins the branch a genuine quota failure takes first, which was correct and
untested, and it is recorded as a regression pin rather than a reproduction. Each of the three
repairs is defended by exactly one test, measured by reverting each in turn: removing the guard on
`hasPreRestoreSnapshot()` turns 1 red, restoring the unchecked success path turns a different 1 red,
and removing the withdrawal from the rewind turns a third. Lint clean. `docs/ARCHITECTURE.md` now
records that a staging key can outlive the restore that wrote it. The offer left live by
**Erase everything** is a different code path and is filed as `BL-101` rather than fixed here.

One of those tests was flaky and CI found it, on a run for a later item in this branch. It compared
the saved copy against the backup string whole, but `restore()` re-serialises through
`exportBackup()`, so the saved copy carries the moment of the restore rather than the moment the
backup was taken. The two stamps normally land in the same millisecond, which is why it passed
locally every time; one CI run separated them by exactly 1 ms and reddened the build for a reason
no reader could act on. The comparison now excludes the stamp and asserts on the data, and it was
watched failing twice with the stamp excluded, once against a saved copy holding the wrong value
and once against a payload the backup did not contain, so narrowing it did not make it vacuous.

**BL-084: Prevent one tab from overwriting another tab's progress**

- [ ] Add a durable revision or equivalent compare-before-write contract
- [ ] Detect a newer value before replacing the full state
- [ ] Reconcile, block or ask rather than silently choosing one tab's state
- [ ] Test concurrent edits, restore, wipe and blocked-recovery paths

Constraint gate: checked 1 to 11, none breached.

Each tab loads a full snapshot and each update rewrites the whole backup. There is no storage-event
listener, browser lock or revision check, so a stale tab can replace a newer tab's work. Two stores
over one storage reproduced the loss. BL-075 records a related stale recovery observation, but it
does not own ordinary writes. Evidence: `src/js/storage.js:290-335`, `src/js/main.js:64-78`.

**BL-085: Bound backup restore before parsing and persistence**

- [ ] Reject files above an evidence-based byte limit before reading and parsing them
- [ ] Cap collection counts and string lengths during restore
- [ ] Apply the same list-name and description limits used by ordinary creation
- [ ] Refuse before mutating a key when staging plus snapshotting cannot fit

Constraint gate: checked 1 to 11, none breached.

The file picker reads any selected file fully before validation. Structural validation checks object
shapes but caps neither collections nor strings, and restore coercion skips the normal list-name and
description limits. This is a user-selected availability risk, not a remote attack. Evidence:
`src/js/main.js:3010-3038`, `src/js/lib/model.js:612-699`.

**BL-086: Keep cover requests inside the stated trust boundary**

- [ ] Inventory legitimate cover hosts used by bundled data and the supported metadata service
- [ ] Reject or require consent for an unrecognised cover host
- [ ] Keep the image CSP and URL policy in step
- [ ] Prove a hostile HTTPS cover address makes no request

Constraint gate: checked 1 to 11, none breached.

Cover normalization accepts any HTTPS host and the CSP permits images from every HTTPS origin. A
compromised or user-selected metadata service can therefore trigger a tracking request to a third
party while the interface says covers come from Marvel's servers. The fix must continue to store
URLs only, never image bytes, so Constraint 1 remains intact. Evidence:
`src/js/lib/model.js:94-115`, `server.mjs:25-48`, `src/index.html:524-531`.

**BL-087: State the network privacy boundary where the promise appears**

- [x] Replace absolute in-app wording with the precise README distinction
- [x] Name metadata queries and direct cover requests without implying progress is sent
- [x] Keep the no-account, no-analytics, no-telemetry and local-progress promises explicit
- [x] Check first run, Backup and settings, About and README for one consistent claim

Constraint gate: checked 1 to 11, none breached.

The README says correctly that reading data stays local while metadata and covers are downloaded.
The app itself says nothing is uploaded. Search text and requested issue identifiers do cross the
machine boundary, and image hosts receive ordinary requests. Reading progress, notes and identity
remain local or absent. Evidence: `README.md:29-45`, `src/index.html:500-556`,
`src/js/api.js:90-102`.

Shipped. Four destinations were enumerated from the code rather than from the copy, because the
copy was the thing under suspicion. The metadata API is asked whether it is reachable on every
boot, from `checkHealth` with caching off, so a cold start with no list and no search still
contacts it. It also receives the text typed into the issue search, and, through
`src/js/hydrate.js:55`, one request per issue whose details are missing. Marvel's image host
receives a request per cover displayed. Marvel's reader receives the one issue a click opens, and
the metadata API is asked for that issue's reader link when this copy does not hold it. The fourth
is `www.marvel.com`, which receives that same issue whenever no reader link can be resolved, from
`src/open.js:50`. Read state, notes and identity are sent to none of them, and no account exists to
hold them.

The three other search boxes send nothing, which the first draft of the copy got wrong in the
generous direction by saying "searching sends what you typed". Series and creator search is
answered from two collections vendored into `src/data/`, and the catalog search filters
`data/catalog.json`, all three fetched from this origin. The remedy is the same one the item is
about: name which search leaves rather than let one verb cover four boxes.

The README was already the precise version and was still wrong in one clause. It promised "not your
lists", and the issue numbers in a list are exactly what a request for that issue's details or its
cover carries. That is the same overclaim as the app's, arrived at from the opposite direction: the
app understated what leaves by naming nothing, the README overstated what stays by naming a
category the requests disclose.

The absolute the in-app copy is not allowed to reinstate now includes "no server sees your reading
progress", which the code cannot promise even though the progress itself never leaves.
`hydrationOrder` prioritises the unread head of the list, so the order those requests arrive in is
derived from read state. The remedy is to promise what is true, that progress is never sent, rather
than to make a claim about what a recipient could infer.

Review found the first version of this change had made the same mistake twice more, which is why
the rule list grew rather than the copy shrinking. It claimed switching cover art off stops the
cover requests. `setCovers` writes a body class and re-renders, `paintCoverUrl` assigns `img.src`
with no reference to the setting, and `display: none` does not cancel a fetch, so the switch hides
pictures that have already been asked for. Measured in Edge with the setting off from the first
paint: eight requests to `i.annihil.us`, the same eight as with it on. Turning it off is itself a
re-render, so it issues a fresh round. Gating them on the setting is filed as `BL-108`. The second
was scope: a hydration run is not confined to the list that started it, because `pendingIssueIds`
collects from every list in `listOrder` and `hydrationOrder` appends all of them behind the priority
head.

One qualification on that code walk, found by the eighth review and worth carrying here rather than
only in `BL-108`. Every cover `<img>` goes through `paintCoverUrl`, which is why the eight are the
same eight, but one cover request in the file is not an `<img>` and does read the setting:
`src/js/main.js:1724` builds the reading hero's backdrop URL only when covers are on, and a computed
`background-image: none` is never fetched. So "the same requests either way" is true of the pictures
the copy is about and false of the surface as a whole, and the shipped sentences survive because they
are about pictures rather than about totals. The one gated path is the reason `BL-108` reads as an
oversight rather than a decision, and it is recorded there.

The replacement sentence was wrong in its turn, and the third round is the one worth recording,
because the error was a tense. "The requests have already been made" is true and answers a question
nobody at that switch is asking. Someone reading it is deciding about the next screen, not the last
one, and covers are requested exactly the same from that moment onwards. Saying the switch hides
them without stopping them being requested is the same fact stated where the decision is. That is
this item's whole failure mode in miniature: a true sentence can still mislead by being true about
the wrong time.

Verified: three tests added, each watched failing. Reverting both surfaces fails two of the three.
Reverting each surface alone still fails two, which is the measurement that mattered: the first
version of the check passed with the README reverted, so half of it defended nothing. The rule that
closed the gap is that naming the downloads is not sufficient on its own, since the README named
both and still promised the lists were not sent. The third test holds the theme setting's absolute
in place, because a promise about one thing may be absolute when it is true, and without it the
rule above would be satisfiable by deleting promises instead of qualifying claims.

Review then found that hole a second time in a place the measurement had not looked. The check read
the two long statements and not the subtitle, which is the line the item cites as its evidence, so
the old absolute could be restored word for word with the suite green. Later rounds found three
more sites and three rules that could not refuse the sentence they name. The claim turned out to be
written in six places, not three: the security policy makes it too, and the README sends readers
there, and it stopped exactly where the new rule says naming the downloads is not sufficient. The
Cover art card is the fifth, and it is the natural home of the covers overclaim because it owns the
switch, yet the extraction reached neither end of it. The sixth is described below. All are claim
sites now, the policy held to the full shape and the cards to the absolutes, as the subtitle is.

One further site was considered and deliberately left out. The changelog states the claim too, in the
entry describing this very change, and enrolling it would hold every past entry to the rule as well.
Those entries are a record of what was believed when they were written, and a check that can force a
correction into them is a check that can rewrite history to stay green. The two wrong sentences in
this change's own entry were fixed by reading, which is the right instrument for a document whose
value is that it does not change. Recorded here because a later reader will notice the omission and
should not have to guess whether it was an oversight.

The three weak rules were each weak in a different way, and all three are worth naming because the
shapes recur. The disclosure rule matched the bare phrase "which issues", which is a phrase this app
has every reason to use about itself, so the disclosing sentence could be deleted and the rule met by
a line about what the app tracks; it now needs a verb of revealing as well. Two absolutes were scoped
to one sentence, so a full stop evaded them: "Your lists are yours alone. They are never sent
anywhere." was caught by nothing. And the README slice was cut with a bare `split` on a heading, so
renaming that heading would silently have widened it to the whole file and left every rule satisfied
somewhere else; it now asserts its delimiters the way the markup extraction always did.

Fifteen mutations were run against the rules as they then stood, each applied to the real file and
reverted: every one is caught, including all five the review demonstrated. One mutation first
survived and the harness was at fault rather than the rule, since the README says twice that it sends
something to the database and the mutation removed only one of them, which is the same
document-level reading the rules themselves take.

A third round found the claim in a sixth place and found the covers rule broken in both directions
at once. The About view's "Metadata and links only" card, at `src/index.html:601-604`, is the sixth,
and before this change it said cover images "load directly from Marvel's own servers and can be
switched off": two predicates on one subject, the first about loading, so the second reads as
though the loading is what stops. That is the implication three rounds had been spent removing from
five other sentences, surviving four cards above the corrected one on the same screen, in the one
place no extraction reached. It is now a claim site, and the sentence is split so the second half has
its own subject and says the pictures are still requested. Implication is not a thing a rule can
catch, which is the honest limit here: what the site membership buys is that the catchable forms
cannot come back, not that this particular sentence could have been refused.

The covers rule itself has now been three instruments, and the first two are the argument for the
third. A pattern list for the lie was evaded six ways in a minute by swapping the noun to
"downloads" or "fetches", by putting one word between "no" and "requests", and by writing "switch it
off", which is the most natural phrasing on the card that owns the switch. In the same pass it
rejected the most direct honest sentence there is, "the app still sends requests", because `ends?`
matches inside "sends". Reading sentences rather than tokens lost the same way from the other side.
Requiring a cease-claim meant treating every "no", "nothing" and "never" near a request noun as a
lie, which is how honest denials are written, so seven true sentences were reported as lies,
"switching cover art off cannot stop the requests" among them; and pardoning any window that said
"still" let three lies through, because "the page still loads instantly" is true and about something
else entirely.

A check whose cheapest repair is to weaken the copy is worse than no check at all, and both
instruments had that property. The third stops looking for the lie. A window about the covers switch
has to acknowledge that the requests continue, and the acknowledgement may sit in a neighbouring
sentence, because "Switch covers off and every cover becomes a tile. The image is still requested."
is an ordinary way to write it. Nothing searches for a lie vocabulary any more, so there is none to
evade, and the cheapest repair to a failing sentence is to add the truth rather than take it out. The
metadata card's "still loaded" became "still requested" in the same pass, since loading is what the
page does and requesting is what the network does, and only the second is the subject.

Three limits were stated last round, because the item's own failure mode is claiming an instrument is
better than it is. Two of them were found by review inside the sentence that claimed the limits were
smaller, and the third turned out to be smaller than it had been stated to be, which is the same
failure pointing the other way.

The first is that "a window about the covers switch" is an enumeration. Inverting the check moved the
enumeration off the lie and onto the switch, it did not abolish it. A sixth round escaped the
requirement four times by writing "without cover art" and "disable the images", which reached none of
the switch patterns and so were never asked for the truth at all. Widening this list is close to
monotone, but the seventh round measured the "close": bare "images" and "pictures" had to go in for
"disable the images", and they convict a true sentence that pairs one of them with a hiding word,
which then has to be reworded rather than qualified. The word "without" is out of the list for that
reason and is matched only beside a covers term, and the seventh round walked out of that too, once
past its twenty-character gap and once by naming the images rather than the covers. Its gap is now
thirty characters, "the images" is matched beside it and bare "images" still is not, since "a plain
JSON file without images" is not the switch and the article is the only thing that says so. "covers"
is also a verb, and "a backup covers every list you keep, and nothing in it is hidden from you" was
being asked for an acknowledgement it has no business carrying; a determiner after the word now says
it is not ours.

The second is that the acknowledgement is an enumeration too, and this is the one the round before
had denied by naming only the first. A form missing from it fails a true sentence. Tying every branch
to a request noun closed one pardon and excluding the comma closed two more, and the comma exclusion
cost true sentences to do it, "the image is requested, regardless" among them. "The same requests are
made" was refused for a different reason, that its branch had been dropped; the branch is restored,
narrowed so that "the same number of issues" no longer counts as a request, and the copy's own verb
"asks" is in the list it had been missing from.

The third was called unclosable last round and that was wrong, which is worth recording as plainly as
the limit itself. The claim was that the check cannot tell which requests an acknowledgement is about,
and that tying it to a covers noun would convict three of the four acknowledgements shipped here
because they say "them" and "they". The first half was true; the second was wrong in both of its
parts. Three of the four do contain a pronoun, but only one of them rests on it, because the About
view and the README name the covers by noun in the very clause that asserts and the Cover art card
names the image. A noun tie would convict the metadata card alone, on "but they are still requested".
Counting the acknowledgements that contain a pronoun and reporting that number as the ones that depend
on one is how a figure of three was published for a fact about one. Punctuation was the wrong
instrument at the width it was tried and the right one branch by branch, which took until the
thirteenth round to see. Re-measured against the 51 true sentences now in the tree, refusing a gap
that crosses a comma on every branch refuses 6 of them and ending every clause at a coordinator as
well refuses 2 more, and all eight are one shape: an adverbial saying nothing has changed, reached
across the mark from the clause that names the request. Nothing else is refused either way and no
false sentence is pardoned, which is why the thirteenth round applies both marks to the branches
carrying their own subject and to no others. Those two figures have been published here as "seven"
and "four", then as "5" and "2", against corpora of 38 and 44 sentences that no longer exist, and
each time the wording read as though they were properties of the instruments rather than of whatever
they were run against. What separates "no cover
is requested, your notes are unchanged" from "the image is requested, regardless" is the subject, not
the mark before it: one has a different subject and the other has no subject at all. So the
acknowledgement has to name the covers in whichever clause is making the assertion, and the round
after this one had to narrow what counts as naming them.

Deciding which clause that is took two goes, and the eighth round found the first one backwards. A
trailing clause was treated as asserting when it carried a verb drawn from a list of thirty, and as
leaning on the clause before it otherwise. A finite verb is an open class, so a verb outside that list
made a false clause look like it was leaning on its neighbour; it borrowed a subject about the covers
and passed, with nothing refused anywhere to signal it. Review demonstrated it with "loads", "look",
"survive" and "behaves", all four of which the instrument two rounds earlier had caught. The test is
inverted now: a trailing clause asserts unless it is one of a listed set of subjectless fragments, so
a gap in that list refuses a true sentence instead. The same round found "one" and "each" being read
as covers pronouns, which pardoned "no cover is requested, and each of your lists is unchanged", and
they are out. Between them these close five of the six passages the seventh round demonstrated, four
by the subject tie, and one of the three then recorded as unreachable.

"unchanged" is deliberately not in that list of fragments, and it is the single place where the two
directions collide head on. "The requests for covers are, in fact, unchanged" and "no cover is
requested, unchanged" have exactly the same shape: a head naming the covers and a bare "unchanged"
behind a comma. No rule about the trailing clause can accept one and refuse the other. Admitting it
takes the truth and the lie together; refusing it loses the truth and keeps the lie out, and the truth
is repaired by moving "in fact" to the front of the sentence. Costing a truth is the affordable
direction, so that is the one taken.

Round nine then found the covers tie itself making the enumeration mistake the round before had just
finished removing from the trailing-clause test, in the opposite direction. The tie asked whether the
asserting clause contained any of "cover art", "covers", "images", "pictures", "them", "they", "these"
or "those". Containing is not being about. "The details for them are still fetched" and "though these
titles are unchanged" are clauses about the metadata, and dropping either onto the end of a lie turned
that lie into a pass. Seven shapes of that insertion are now in the false list, and two of them are
the entries the list had filed as evasions a wider reference would have opened, so the reference
called narrow was opening them itself. A word present in an open list pardons silently, exactly as a
word missing from one did, and the two lists had been inverted one at a time.

The fix asks what the clause is about instead of what it contains. Of the pronouns only "they" counts,
and only at the head of the clause: "them" is never a subject in English, "these" and "those" are
determiners as often as pronouns and it was the determiner uses that carried the evasions, and "they"
is neither, so at the head of a clause it is the subject rather than evidence about one. The noun half
was left alone, on the reasoning that a clause naming the covers is about them wherever the noun sits.
Measured against the corpus as it then stood this cost nothing: no true sentence refused, no false one
pardoned, no recorded refusal accepted, no escape closed, and all six shipped surfaces still pass,
which follows from only one of the four acknowledgements resting on a pronoun and resting on it as a
subject. A pronoun subject written any other way is now refused, which is the loud direction.

It does have a cost, and the corpus did not hold it, which is the regression-list point arriving
about its own instrument. The real-file harness rewrites the shipped copy into other true phrasings,
and one of those, "they can be hidden, and hiding them changes nothing about what is requested", the
tie refuses: what is hidden sits in the object of "hiding", and an object pronoun is not a subject.
Admitting "them" after a hiding or a stopping verb recovers it and was measured as recovering nothing
else, but it recovers it by enumerating verbs, which is the shape of instrument this round replaced.
So it is repaired by naming the covers and recorded as the twelfth refusal instead. It is close to
the copy the metadata card actually ships, which is the reason for recording it rather than treating
it as contrived.

A tenth round found the same mistake a third time, in the half that had not been touched. Leaving the
noun readable anywhere meant that writing the antecedent out where the pronoun had been refused
restored every pardon: "the details for the covers are still fetched" reads as an acknowledgement
about the covers to any rule that only asks whether the word is in the clause, and it is a clause
about the details. It reached both shipped cards, which the pronoun version had not. Three of the
seven pronoun evasions rewrite straight into it. So the noun is now read the same way the pronoun is.
A covers noun counted unless every occurrence of it in the clause hung off some other noun through
"for", "of" or "about", and a word about requesting is the one thing it can hang off and still be
about them, because the shipped copy writes it that way: "the app still asks for the image". Only
those three prepositions were read as post-modifiers, because reading "with" as one refused "even
with cover art off there is no reduction in requests", which is a plain true sentence and the
measurement caught it. The eleventh round reopened that trade and took the other side of it. The
same round found the noun test had dropped the lookahead that tells our noun from the verb, so
"the export covers what was downloaded anyway" was pardoning a lie; the exclusion is now written once
and shared rather than copied, because two copies are two lists to keep in step.

The same round found subjecthood had been read as reference. A clause-initial "they" was taken as a
reference to the covers whatever it referred to, so "the details are separate, they are still fetched"
pardoned. The antecedent is now resolved rather than assumed: it is the head of the nearest preceding
clause, and where that head is itself a "they" the walk continues, which the shipped metadata card
needs, because it says "cover images load directly from Marvel's own servers. They can be hidden, but
they are still requested" across two links of that chain. A "they" with no covers antecedent to find
is refused. Measured against the corpus this cost nothing: no true sentence refused, no false one
pardoned, no recorded refusal accepted, no escape closed, no recorded repair broken and no shipped
surface failing. Eight of the nine sentences the review wrote to break it are caught and are now in
the false list. The ninth is not, and is recorded as a third escape rather than guessed at: a covers
noun inside a reduced relative clause, "the details the covers carry are still fetched", where nothing
in the punctuation or the word order separates it from "hides the covers but does not stop them".
Telling those apart needs to know that "hides" is a verb and "details" is a noun. That is parsing, and
every list written in this file in place of parsing has been evaded within a round.

An eleventh round found the enumeration back for the sixth round running, this time in the span the
noun rule allowed between the preposition and the covers word. That span was a list of eighteen
determiners, so "the details for the hidden covers are still fetched" walked straight through it, and
seven evasions of that shape were written and all seven pardoned. The answer this time is not another
list but a list that cannot be incomplete: prepositions are a closed class, so the whole class is
written out, fifty-three of them, and the span between one and the covers word becomes any run of
words at all. Each of the fifty additions to the previous three was measured alone and then all
together, and none of them refuses a true sentence, pardons a false one, closes an escape, accepts a
refusal, breaks a repair or fails a shipped surface. Reading the nearest attachment rather than the
first is what pays for that: in "the same number of requests for the covers" the nearest thing the
covers hang off is "requests", which is a request word, so the clause is about them whatever sits
further left.

Two things fell out of that rule and are worth recording apart from it. The word "number" had been
admitted as a request word only to paper over the first-match reading of that same sentence; reading
the nearest attachment answers it properly, so "number" earns nothing, and dropping it closes "the
number of covers is unchanged". And the two halves of the check, the one asking whether a clause
names the covers and the one resolving what "they" refers to, had grown separate determiner lists
doing the same job. The antecedent test now calls the asserting test, so one rule decides both
positions and the second list goes with the first.

The candidate that scored highest against the twenty-three attacks this round produced is not the one
that shipped. Excluding a covers word that starts a noun phrase closed fifteen of them at no cost to
the corpus, and a determiner head test closed seventeen, against nineteen for the rule that shipped.
The argument against the other two is the direction they fail in: both decide by a word list, so a
determiner the list has not heard of makes them pardon silently, which "The details some covers
carry" demonstrates. The shipped rule fails by refusing, which is loud, repairable and recorded. One
such refusal was bought this round and is the thirteenth entry in that list: "Even with cover art off
there is no reduction in requests" hangs its only covers word off "Even". Ignoring a preposition that
opens its clause would recover it, and was measured as pardoning four sentences whose head noun
carries no determiner, so it was refused on the numbers rather than on principle.

Four of the twenty-three survive, and they are one shape: a covers word inside a modifier of some
other head noun with no preposition to hang it off, "the details some covers carry" and "the metadata
that describes covers" among them. That is the shape already recorded as an escape in the asserting
clause, so the four are recorded as escapes as well rather than guessed at.

A twelfth round attacked the two halves of that noun rule separately and got through both. The word
the covers hang off was read from the same list the acknowledgement is built from, and that list holds
the participles, because "still requested" is how the copy says it. A participle is also the one verb
form that can post-modify the noun in front of it, so writing "the details requested for the covers
are still fetched" gives the covers a request word to hang off and hands back every pardon the
attachment rule had just closed. Reading only the forms that cannot be a past participle fixes it and
still admits both ways the shipped copy writes the word: "the requests for the covers" as a noun and
"the app still asks for the image" as a finite verb. Seven evasions of that shape are recorded and all
seven are caught.

The other half failed in the quieter direction. That span was written as word characters, so a
character outside that class made the whole attachment pattern match nothing, and matching nothing was
read as hanging off nothing, which is the answer that pardons. The one span the rule could not read
was the one span it excused. A bracket did it, a quotation mark did it, and a hyphen inside the noun
did it. Two of the six shipped surfaces make that more than hypothetical: those two are read as raw
markdown, because the helper that slices a document hands over what it finds rather than stripping the
markup the way the one for the app's own markup does, so emphasis, code spans and links are exactly
the characters that appear there. The span is now anything at all short of a clause end, which is
what the round before had claimed it already was, and which is safe because the span is only ever read
inside a single clause. Both fixes were measured separately and together: neither refuses a true
sentence, pardons a false one, closes an escape, accepts a refusal, breaks a repair or fails a shipped
surface, and together they catch all thirteen evasions the round produced.

Three counts stated in this section were wrong and are corrected rather than carried forward. The
determiner list the eleventh round replaced held eighteen entries, not nineteen. The leftward walk
accepts most of the recorded refusals and not all of them, the ones it cannot reach having no
preceding clause to lend a subject from, which the next sentence of the same passage already implied
by saying the walk recovers a number rather than the lot. And the cost of reading the whole
preposition class was described
as a clause-opening preposition capturing the covers word beside it, when the span reaches to the end
of the clause and so captures every covers word after it: "Even without cover art the app still
requests every cover" has two and loses both. It is recorded as the fourteenth refusal, repaired by
deleting one word.

Two limits found this round are recorded rather than closed, because closing either costs more true
English than it buys. The rule that hands a subjectless trailing fragment back to the clause in front
of it assumes that clause is the true half. When the fragment carries no content at all the clause in
front of it is the lie, and "no cover is requested, regardless" is built out of a covers word and a
request word, so it reads as its own acknowledgement. Removing the six words that do this costs six
true sentences, "the image is requested, regardless" among them, and does not close the shape either,
because dropping the comma leaves no trailing clause to classify at all. Separately, the exclusion
that stops "a backup covers every list you keep" being read as a claim about pictures is shared with
the test for whether a passage is about the covers switch, and there it inverts: "hide the covers you
have not read and Marvel is never asked for them" is never examined at all, because "you" excuses it
first. Reading the noun a second way for that test alone catches both and refuses four true sentences,
every one an ordinary use of the verb. Nine escapes are recorded across the two shapes, so closing
either later turns the suite red.

A thirteenth round attacked the clause reader itself and got through it twice. A sentence with no
full stop, semicolon or comma inside it is one clause, so the clause an acknowledgement was checked
against was the whole sentence, and the switch phrase at the front of it supplied the covers word
that check was looking for. Anything at all resembling an acknowledgement anywhere in the sentence
then pardoned the lie beside it, and "switch covers off and no cover is requested and the details are
still fetched" passed while its semicolon twin was caught. The mirror of that was the span between an
acknowledgement's two halves, which excluded a full stop and a semicolon but not a comma while the
clause reader split on all three: one match could begin in one clause and end in another, so "the
tiles are still there, no cover is requested" put the acknowledging word in one clause and the
request in the next and the lie became its own acknowledgement. Six shapes of each are recorded and
all twelve are caught.

The fix is the same instrument the third round rejected, applied per branch rather than to all of
them, and the measurement is why. Measured against the coordinator list as the fourteenth round
leaves it, refusing a gap that crosses a comma everywhere refuses 6 true sentences, ending every
clause at a coordinator everywhere refuses 9, and both together refuse 10. Those costs were once
recorded on their own, which flattered the conclusion, because the wholesale forms also buy
something: the comma rule everywhere closes 7 of the 18 recorded escapes, the coordinator rule
everywhere closes 4, and both together close 8. The case for the per-branch form is that it closes
the same escapes for none of the cost, not that the wholesale form is worthless. So the branches
whose two halves are one assertion take both marks and the ones that lean take neither, and "but"
and "yet" are absent from
the coordinator list because the shipped copy hangs its own acknowledgement off one. Two review
suggestions were measured and rejected on the same numbers: requiring the whole match to stay in one
clause refuses seven true sentences, and treating every coordinator as a clause end breaks the About
view's own shipped sentence. The change costs two true sentences, both of which were accepted before
it, and both of which have a comma form that was refused before it and is refused now, so it makes
the rule consistent rather than stricter. Both are recorded with repairs.

The round-twelve participle rule was also found too wide in the other direction. Refusing every
participle closes "the details requested for the covers are still fetched", but English writes the
truth in the passive and it closed that too: "a request is still sent for each cover" was refused. A
participle counts again when a form of "be" or a request noun stands in front of it, which separates
the passive from the post-modifier and recovers three true sentences without reopening any of the
thirteen evasions the round before had closed. Four true sentences of the same shape are still
refused, because "the bytes fetched for the covers are unchanged" and "the details requested for the
covers are still fetched" differ only in whether bytes are requests, which is knowledge about the
world rather than about the sentence. All four are recorded with repairs. One test title was also
found asserting a bound nothing tests, saying the recorded escapes were "still only these" when what
the test checks is that each of them is still open, and it is reworded to say that.

The fourteenth round found that whole conclusion resting on a list of seven words. Review re-joined
the lies the thirteenth round had just closed with a conjunction outside that list, "because", "when",
"if", "since", "then", "after", "but" and "yet", and all forty variants pardoned again. This is the
failure this item has now paid for five times: a rule written as a list somebody enumerated by hand,
where the missing word is the evasion. The list is twenty words now, and extending it was measured as
completely free against the corpus and the six shipped surfaces, refusing nothing, pardoning nothing
and breaking no repair. It takes twenty-six of the forty. Of the fourteen left, six are the price of
keeping "but" and "yet" out, which the About view's own sentence requires, and eight are the price of
letting a trailing adverbial keep the wider gap, which is the whole of what that branch is for. Both
families are unbounded in the joining word, so one representative of each is recorded as an escape
rather than an enumeration that goes stale the moment somebody writes a conjunction nobody thought
of, and the residual below is no longer described as a bound.

The wider list costs five true sentences, and they are one shape: predicate coordination over a
shared subject. "The covers are hidden and still requested" states two things about one subject, and
cutting at the coordinator leaves the second half with no subject in it. Not cutting when the
following segment has no subject of its own would accept all five and is the obvious repair, and it
is written down as rejected rather than left unsaid, because every candidate test for "has a subject
of its own" is another hand-written list, and four such lists in this file have been walked through
inside the round that added them. One of the five is the About view's shipped sentence with "and"
written for its "but", which is the clearest statement of what the class costs: the rule is
indifferent to which conjunction joins two predicates and the copy is not. All five are recorded with
repairs.

Review round fifteen found the last unasserted count in the corpus comments, and it had gone stale
exactly as the argument for asserting counts predicts. The comment above the true sentences says how
many of them are repaired forms of refusals; it read nineteen and the tree holds twenty-four, because
round fourteen added five refusals and updated every count except the one nothing checked. The
neighbouring two counts in the same comment block were asserted in round thirteen and both stayed
right. So the third is asserted now, and it is counted over the entries rather than over the set of
repairs, which is what lets it fail on its own: every repair is already asserted to be held as a true
sentence, one assertion per refusal, so the only way the two counts can disagree is a repaired form
written into the true list twice, and nothing else in the file forbids that. Duplicating one turns
exactly that assertion red and nothing else.

The same round found a hole the guard cannot reach by construction, and it is the original defect of
this item surviving in the one place the rule does not look. All three surfaces that enumerate what
leaves the machine listed the reachability check, the issue search, the detail fetch, the cover
fetch and the reader link, and left out the largest request the app makes: adding a whole series or a
creator's issues pages the metadata API to completion at `src/js/api.js:147-161`, up to sixty
requests, from `src/js/main.js:2323` and `src/js/main.js:2339`. Two of the three said in the same
breath that "searching the catalog, series or creators is answered from files already on this
machine", which is true of the search and not of the add that follows it, so the sentence pointed
away from the omission. The guard inverts sentences that are about the covers switch; a sentence
nobody wrote is outside it. All three surfaces now name the series and creator fetch, the imported
line's "Find match" at `src/js/main.js:2432` is named alongside the search it resembles, and the
clause is held by a rule in the request table rather than left as prose that can be dropped without
anything noticing. Removing it from any one of the three turns the suite red naming that surface.

What is left is a residual of eighteen and a recorded set of twenty-five refusals, and both are now in the
repository instead of being described here. That distinction is the eighth round's most useful
finding. Both this section and the changelog said a proof would disagree with anyone who closed a
pardon or accepted a refusal, and no such proof was in the repository: it was a scratch file on one
machine, absent from CI and unreachable by any reader. The corpus is a test now. It holds 55 sentences
written to be true, 121 written to be false, the 18 that still pardon themselves, and the 25 true
sentences the check refuses, each stored beside a repair that is separately asserted to pass and to be
one of the 55. Closing an escape or accepting a refusal turns the suite red, which is what the
sentence claimed all along.

The twenty-five are a regression list and not a bound on what the check refuses, and calling them a cost
was the round-eight overclaim recurring one level down: it reads as though they were all of it. They
are not close to all of it. Twenty-eight further true sentences were written in the register a
maintainer editing this copy would actually use, and fourteen were refused, "hiding the covers saves
no requests" among them. What the list buys is that a refusal already known cannot quietly start being
accepted. What it does not buy is a number for how much true English this instrument costs, and no
instrument of this kind is going to have one.

The eighteen remaining escapes are one across a full stop, which no rule about clauses inside a
sentence reaches, one that hangs the true clause off the false one with no subject of its own, five
that bury a covers noun in a modifier of some other head noun with nothing to hang it off, seven where
a trailing fragment carrying no content hands the assertion back to the lie's own clause, two the
covers verb exclusion hides before the check can start, and two that stand for the families the
coordinator rule leaves open, one joined by "but" and one where a trailing adverbial keeps the wider
gap. Those last two are representatives and not a count: both families run to as many sentences as
there are conjunctions, which is why the residual is a record of shapes rather than a number that
bounds anything. The twenty-five
refusals fall into eight classes. Four say "the requests" without saying which, and two lean on "one"
or "each" as a covers pronoun, which the ninth round stopped reading as one because "each of your
lists is unchanged" pardoned a lie with it; five of those six are repaired by naming the covers, at
the cost of a word, and the sixth costs a word and a reordering, because naming the covers in "The
requests are, in fact, unchanged" leaves the parenthetical standing between the subject and its verb.
The next five do name the covers in the sentence but not in the asserting clause, because a
parenthetical or a coordinator sits between the subject and its verb: "the covers, even when hidden,
continue to be requested" is refused, and the clause doing the asserting is "continue to be
requested", which has no subject in it at all. All five repair by moving the parenthetical, four of
them to the end of the sentence and the fifth to the front, which neither adds nor removes a word, so
the claim that every repair adds truth rather than removing it was itself an overclaim and is gone.
The twelfth is the object-pronoun case the subject tie brought with it, and the next two are the
clause-opening preposition the eleventh round bought, both described above. The next six are the
thirteenth round's, four for separating a passive from a post-modifier and two for ending a clause at
a coordinator, and the last five are the fourteenth round's, every one of them predicate coordination
over a subject the two halves share. Walking left
to find the subject would accept the middle five, and it was measured against this corpus: it
pardons 57 of the 121 false sentences and accepts twenty-one of the twenty-five
refusals, because a leftward walk lends a subject across clause boundaries in whichever direction
happens to help. That is the second instrument returning under a new name, and it is refused on the
numbers rather than on principle. Two refusals share a repair, and one of the fourteenth round's
repairs to a sentence already recorded as the shipped copy, so the twenty-five have twenty-four
distinct repaired forms.

Thirty-seven mutations run against the finished rules on the real files and all thirty-seven are
caught. Fifteen more run the other way: a true sentence rewritten into a different true phrasing has
to leave the suite green. That is the half no lie mutation can express and the half both earlier
instruments failed, and it is the half that has now caught a cost in each of three rounds. Thirteen of
the fifteen pass, and exactly two do not. "Hiding them changes nothing about what is requested"
stopped passing in the ninth round when the subject tie landed, and "The image is requested and
unchanged" stopped passing in the thirteenth when a coordinator began ending a clause. Each is
recorded as a refusal with its repair, and the second of them was recorded from the rules before this
harness was re-run, so the file-level proof and the corpus in the tree reached it independently. A
third rewrite, "Every one is requested regardless", stopped passing in the eighth round when "one"
left the reference; unlike the other two it was repaired in the list itself, so what the fifteen now
hold is its repaired form and it passes. Naming all three as current failures, as an earlier draft of
this paragraph did, contradicted the thirteen in the same sentence. The tenth
round briefly cost a further one, "the app still asks for the image", which is the shipped copy's own
verb: hanging the covers noun off a request word was
written as a noun test first, and the harness caught it in the same run that proposed it, so the test
reads the same word list the acknowledgement itself is built from and the rewrite passes again.
Separately, eight ways of undoing the eighth round's repairs were each applied
alone, and every one turns the suite red naming the test that defends it; three more undo the ninth
round's, and each of those names the sentence that defends it, one of which had to be written because
the first two mutations left it unwritten and the gap showed as a mutation nothing caught. Five more
undo the tenth round's, one for each piece of it, and every one turns the suite red naming the single
sentence that piece defends. Six more undo the eleventh round's, and every one of those turns the
suite red naming the sentence that piece defends. Two of the six first reported caught while proving
nothing, which is the failure this repository's rule about proving a check can fail is aimed at. The
mutation was applied with a replacement string carrying a dollar sign immediately before a backtick,
which JavaScript reads as a back-reference to the text preceding the match, so what landed in the
mutant was a syntax error rather than a weakened rule. A mutation that stops the file parsing is
caught by every check in it and defends none of them. Applying the replacement through a function
rather than a string fixed both, and both then failed on an assertion naming the sentence. Five more
undo the twelfth round's, and every one of those turns the suite red naming the sentence or the escape
that piece defends. Six more undo the thirteenth round's, one for each rule it adds and one for each
direction of the participle rule, and every one turns the suite red naming the sentence it defends.
The count of distinct repairs needed no mutation to prove it can fail: adding the
fourteenth refusal turned it red on its own, which is what a count asserted rather than written in
prose is for. Six more undo the fourteenth round's coordinator list, one reverting it to its seven
words and four removing a single new word each, with a sixth turning the clause break off for every
branch, and every one turns the suite red naming a sentence it pardons. Getting to that took two
corrections worth recording: a mutation written as a bare word replacement across the whole file hit
an earlier occurrence than the rule, and one of the four sentences chosen to defend a new word turned
out to be caught for an unrelated reason, so the mutation that removed it reported clean while proving
nothing. Both were found by the mutation reporting NOT CAUGHT rather than by reading the rule. The proof
harness itself needed one fix, and it is the one worth naming: a transient file lock failed a restore
and left a mutation in the working tree, which is the only way a harness that exists to prove a check
can instead do harm. It now retries and refuses to continue rather than carrying on with a mutated
file. Four more prove the fifteenth round's two additions: duplicating a repaired form in the true
list turns the new count red on its own, and deleting the series and creator clause from each of the
three enumerating surfaces in turn turns the request table red naming that surface. The harness
needed a fix of its own first, and it is a variant of the same defect: spawning `npm.cmd` through
`execFileSync` here exits with a null status and captures no output at all, which the harness read as
a red baseline, so it refused to run and proved nothing. Driving `node --test` through the shell, as
the script itself does, restored a green baseline.

The security policy was found still holding the absolute that started this item, in a stronger form
than the one removed. "Nothing you create is uploaded anywhere" covers the lists, and the issue
numbers in a list are exactly what a request for that issue carries. The forbidding pattern missed it
by two words, so the identical claim was forbidden on four surfaces and permitted on the security
policy, which the round before had enrolled precisely because it makes the claim. The pattern is
widened and the sentence is scoped to what is true: no accounts, no cloud services, no analytics, no
telemetry. The same bullet also put one verb over a set it does not hold across, saying "those
requests name the issue" of three requests of which the reachability check names nothing, which is
the identical error this round had just fixed for search.

**BL-088: Pin and harden workflow actions for untrusted contributions**

- [x] Replace action tags with reviewed full commit revisions and readable version comments
- [x] Stop checkout persisting credentials where later steps do not need them
- [x] Prove the locked lint graph works with dependency lifecycle scripts disabled
- [x] Define how pinned actions are reviewed and updated

Constraint gate: checked 1 to 11, none breached.

Fork pull requests already run with a read-only token, no repository secret and no privileged event,
which is the right baseline. The two actions executed through mutable major tags, checkout kept its
token by default, and `npm ci` was an execution boundary a contributor could change through the
manifest. Evidence: `.github/workflows/ci.yml:1-19`, `.github/workflows/ci.yml:68-91`.

Shipped. All four `uses:` lines now name a full commit revision with the version written beside it,
both checkouts drop their credentials, and both installs skip dependency lifecycle scripts.

The one decision worth recording is which revision to pin, because the obvious answer was wrong. The
item asks for a reviewed revision, and reviewing the one in the file found `v4` of both actions
declaring the `node20` runtime against `node24` on the current major. A pin never follows its tag,
which is the entire point of it and also its one cost, so pinning `v4` would have frozen a runtime
already being retired with nothing left able to move it, and the pin would have looked deliberate
rather than abandoned. Checked before deciding rather than assumed: `checkout` declares a byte for
byte identical `action.yml` at `v4` and `v7.0.1` apart from that runtime, and `setup-node` drops only
`always-auth` from its inputs, which this workflow never passed. So the pins are the current major.

Ignoring install scripts was measured rather than hoped: 0 of the 90 packages the lockfile names
declares one, so the flag changes nothing that gets installed today and closes the boundary before
something does. Lint and the full suite were run under `npm ci --ignore-scripts` to confirm it.

Verified: seven tests were added and each was watched failing. Nineteen mutations were run and each
turns exactly the intended one red: a tag in place of a revision, a branch name, a seven-character
revision, a missing version comment, a comment that is a date rather than a version, each checkout
losing its `persist-credentials` line, that line set to `true` in as many words, an install without
the flag, a package acquiring an install script in the lockfile, and a second workflow file that is
both unpinned and credential-keeping. The last one is why the checks enumerate with `git ls-files`
rather than naming the file they were written against: an enumeration is a list someone has to
remember to extend, and the first proof run showed the mutation passing because the new file was
untracked, which is the same tracked-file property the anchors gate has and is correct for CI, where
a contributor's workflow arrives tracked or not at all.

Review found six more shapes, every one of which the first version of these checks read as green,
and they are worth recording because five of the six were failures of parsing rather than of policy.
A checkout was recognised only when `uses:` was its opening key, so the ordinary `- name:` form was
never examined at all and defaulted to keeping its token; the guard that the list was non-empty did
not help, because the two compliant checkouts kept the count above zero. `uses:` was matched against
a literal `"- "`, so a step written `-   uses:` was invisible to every check at once. A container
image was read by the rule written for actions, which got it backwards in both directions: the
mutable `docker://alpine:3.19` has no `@` and was skipped as though it were a local path, while the
correctly digest-pinned form was the only container reference the check could fail. `npm i` was not
read as an install, leaving the boundary one character wide. Nothing looked outside
`.github/workflows`, so a composite action was the one place `uses:` could still be written
unchecked. The sixth is policy rather than parsing: `npm rebuild` and `npx` both run package code
the install flag exists to prevent, so a seventh test now refuses them. Each is now a mutation, and
the parsing is done once by a shared step splitter rather than by four regexes that had drifted
apart.

The count was wrong too, in three places at once. The lockfile has 91 entries, but one of them keys
the project itself rather than a locked package, so the honest figure is 90, which is what `BL-089`
already said two sections away.

The `github-actions` entry `BL-089` added is what now moves these pins, and its comment was rewritten
here because it described the tags this item replaced.

Evidence: `.github/workflows/ci.yml:68-73`, `.github/workflows/ci.yml:120-125`,
`.github/workflows/ci.yml:85-91`, `test/ci-supply-chain.test.js:74-108`,
`test/ci-supply-chain.test.js:124-142`, `README.md:317-352`.

**BL-089: Turn on repository security and dependency monitoring**

- [x] Enable Dependabot alerts, security updates and low-noise update proposals
- [ ] Enable secret scanning and push protection where the repository plan supports them
- [x] Decide and document an advisory threshold for the development graph
- [x] Keep runtime dependencies at zero and report development tooling separately

Constraint gate: checked 1 to 11, none breached.

The current lockfile audited with zero known vulnerabilities, but GitHub reported Dependabot alerts
and secret scanning disabled. No committed update configuration or advisory gate repeats the check.
Development dependencies execute in CI even though they never reach the browser. Evidence:
`package.json:22-31`, `package-lock.json:1-21`, `absent: .github/dependabot.yml, tracked-file inventory`.

Shipped, with the second task deliberately left open. Both halves of the monitoring were off before
this: asking whether vulnerability alerts were enabled answered 404, and automated security fixes
reported disabled. Both were turned on and then read back rather than assumed. The alerts list is a
different endpoint from the enablement one, it had answered 403 while the feature was off, and it
now returns an empty array, which is the state a working monitor is meant to be in when there is
nothing wrong. `npm audit` agrees: 0 vulnerabilities over the 90 packages it counts.

Secret scanning is the task left unticked, and the clause "where the repository plan supports them"
is why it can be left there honestly. GitHub refuses it on this repository, answering a request to
enable it with a 422 and "Secret scanning is not available for this repository". The reason is
visibility rather than price: the feature is free on any public repository, so publishing this one
would make it available, which is why the box is unticked rather than struck out. `BL-100` has since
put the gate that publication needs in place, so what is left is the decision itself, and enabling
this is part of what that decision buys. Push
protection is worse than refused: the request to enable that one is accepted with a 200, and the
repository then reads back with push protection still disabled, because it depends on the scanning
that is unavailable. A success that changes nothing is exactly the kind of green this repository
has learned not to trust, so it is written down in `SECURITY.md` next to what is genuinely on,
along with the read-only way to see the state, which is that asking for the alerts answers 404 and
says the scanning is disabled. The box stays unticked because a reader scanning the ticks would
otherwise read it as protection that is running.

The threshold is in `.github/dependabot.yml:8-24`, in the file that acts on it, because a threshold
kept somewhere else is one nobody consults at the moment it applies. It turns on where the package
runs rather than on severity alone: a critical or high advisory against tooling that executes in a
maintainer's checkout and in CI is merged before the next change to the default branch, a moderate
or low one is taken at the weekly cadence instead of interrupting work, and an advisory against a
runtime dependency is a product vulnerability under the security policy rather than a tooling
update. That last row is safe to write only because a test already fails if a runtime dependency
ever appears. The rows govern how fast a person answers, not when the pull request appears: a
security pull request arrives when the advisory does, whatever the schedule says.

Low-noise is a shape rather than a wish, and it took two rules per ecosystem rather than the
obvious one. Both ecosystems propose weekly rather than daily, and each groups its whole set into a
single pull request, so the three lint packages cannot produce three separate reviews in a week.
A group covers version updates only unless it says otherwise, so each ecosystem carries a second
group declaring itself for security updates, without which an advisory hitting two packages at once
would have opened two pull requests and the grouping would have failed in precisely the case it
was written for. The `github-actions` entry exists because the workflow called actions through
mutable major tags back then, which is the drift nothing else would notice, and it keeps earning
its place now `BL-088` has pinned those to commit SHAs, since Dependabot updates a pinned SHA and
rewrites the version comment beside it. There is no `open-pull-requests-limit`, and that absence is
deliberate: it caps version updates only, security pull requests are exempt from it, and a group
matching everything leaves no ungrouped straggler for it to cap.

Verified: three tests were added and each was watched failing. The failure they defend is that
Dependabot fails open, so a config that omits an ecosystem is accepted, reports nothing, and looks
exactly like a quiet week. The expectations are therefore derived from the repository rather than
read out of the config being checked: the ecosystems that ought to be watched are computed by
matching every tracked file against a table of manifest shapes, so a Python or Go or Rust manifest
arriving in a later change fails the check rather than passing unnoticed, which a two-line
enumeration of what is here today could never do. Nine mutations were run, seven against the config
and two against what it describes: dropping the actions entry, adding an entry for an ecosystem the
repository does not contain, moving the npm entry off the root, removing its schedule, misspelling
its interval, deleting its groups block, removing the `applies-to` that makes the second group
cover security updates, committing a Python manifest nothing watches, and stripping every `uses:`
line from the workflow so the actions entry goes stale. Each turns exactly one of the three red.
The first attempt at three of those mutations matched nothing, because the config is CRLF and the
patterns were not, and the harness refused to run rather than reporting the checks unfailable.

The config is read without a YAML parser, on purpose. Adding one would mean adding a dependency to
the very graph this item exists to keep at zero and to watch.

**BL-090: Announce passive service, cache and hydration status changes once**

- [ ] Inventory content that changes without moving focus
- [ ] Give each qualifying state one polite or assertive channel
- [ ] Avoid announcing every queue tick when start, failure and completion are enough
- [ ] Verify timing and repetition in the screen-reader run still owed by BL-027

Constraint gate: checked 1 to 11, none breached.

API health, queue depth, cache usage and hydration progress are updated visually outside the shared
announcement route. Their elements have neither a status role nor a live-region attribute. BL-027
fixed messages travelling through two channels; these travel through none. Evidence:
`src/index.html:121-122`, `src/js/main.js:3246-3294`.

**BL-091: Let catalog descriptions survive the WCAG text-spacing override**

- [ ] Remove or adapt the two-line clamp when required text spacing is applied
- [ ] Keep card actions aligned without hiding description content
- [ ] Test the catalog under the WCAG line, letter, word and paragraph spacing values
- [ ] Cover both themes and the longest bundled description

Constraint gate: checked 1 to 11, none breached.

The catalog clamps every description to two lines and hides overflow. In Edge, applying the WCAG
text-spacing values left the painted box at 38 pixels while descriptions needed between 77 and 518
pixels, clipping the text without page overflow. This is a current measured failure, not the dropped
phone-layout work in BL-028. Evidence: `src/styles.css:817-820`.

**BL-092: Bring the fault harness under the alternate-page accessibility baseline**

- [ ] Make each action result a named atomic status or alert
- [ ] Suppress its result animation when reduced motion is requested
- [ ] Check focus, contrast, keyboard order and 200 percent text resize
- [ ] Keep destructive operations fail closed and document the shared storage origin

Constraint gate: checked 1 to 11, none breached.

The developer harness writes every result into a plain visual container and always runs a 900 ms
animation. A live browser check confirmed that none of its outputs has status semantics. BL-034
explicitly excluded this developer-only page, so the item does not reopen application dialogs.
Evidence: `src/dev-faults.js:12-22`, `src/dev-faults.html:37-39`.

**BL-093: Make real-browser regression evidence reproducible**

- [ ] Commit the critical Edge scenarios already used manually
- [ ] Keep the browser driver outside runtime and development dependencies
- [ ] Give each scenario deterministic fixtures and a proved failing mutation
- [ ] Document one command, prerequisites, assertion counts, artifacts and cleanup

Constraint gate: checked 1 to 11, none breached.

The backlog and UX artifacts record substantial browser verification, but the executable scripts
live outside the tree. A clean clone cannot rerun import, navigation, persistence, recovery and
reader-handoff evidence. This extends BL-041's unit coverage rather than claiming the interface is
untested. Evidence: `absent: committed browser-runner script, tracked-file inventory and package scripts`,
`docs/UX_STUDY.md:896-933`.

**BL-094: Test the local host and launcher contract**

- [ ] Start the server on an ephemeral loopback port in tests
- [ ] Verify methods, malformed and escaping paths, ETags, headers and shutdown
- [ ] Extract launcher command selection as pure data for Windows, macOS and Linux
- [ ] Decide from measured failures whether an operating-system CI smoke is warranted

Constraint gate: checked 1 to 11, none breached.

The server is the install and runtime boundary, but no test starts it or verifies its observable
contract. A Windows smoke succeeded during the study; that rejects a current startup defect but does
not cover the HTTP contract or the macOS and Linux launcher branches. Evidence:
`server.mjs:76-168`, `absent: server behavior test, search of test directory`.

**BL-095: Put explicit deadlines on CI jobs**

- [x] Measure normal and slow recent job durations
- [x] Add per-job deadlines with room for a cold install
- [x] Preserve concurrency cancellation and manual dispatch
- [x] Make a timeout distinguishable from a test or gate failure

Constraint gate: checked 1 to 11, none breached.

Neither job set `timeout-minutes`, so both inherited the platform default of six hours. The
durations say how far from reality that was: over 241 runs and 676 successful jobs, the worst whole
job was 32 seconds and the worst single step was 20 seconds of `setup-node`. Nothing in this
repository has ever taken minutes, so six hours was not a deadline, it was the absence of one.

The last task turned out to decide the design, and it needed measuring rather than reading. A probe
workflow put the same deliberate overrun under both placements and read the conclusions back from
the API: a job-level deadline ends the job `cancelled`, and a step-level one ends it `failure` with
the overrunning step marked. `cancelled` is exactly what the concurrency group produces when a newer
push supersedes a run, and the contributor guide teaches in as many words that such a run means
nothing is broken. A job-level deadline alone would therefore have created the one failure this
project is trained to dismiss, which is worse than the six hours it replaced.

So the deadline that fires is the step's. Every step carries one, sized at twelve times or more the
worst that step has ever taken, and each job's deadline exceeds the sum of its steps' by at least a
minute, which is roughly seven times the eight seconds of runner setup and teardown that sit outside
the steps. That ordering keeps the ambiguous outcome unreachable for anything that
hangs inside a step. It is also invisible in the file, being arithmetic between numbers written
eighty lines apart, so a test holds it: every job has a deadline, every step has one, and the job's
clears the sum. A fourth test holds the test's own hand-rolled parser to the file's own count of
steps and of deadlines, both read off the text rather than off the parse, so neither a deadline the
parser mislaid nor a step it never saw can pass as compliant. Nineteen mutations
were each shown to behave as designed, and the four tests split cleanly across them rather than all firing at once.
The concurrency group, the manual dispatch trigger and the full-history checkout are untouched.

Evidence: `.github/workflows/ci.yml:43-53`, `.github/workflows/ci.yml:30-34`,
`test/ci-deadlines.test.js:149-158`, `test/ci-deadlines.test.js:170-203`.

**BL-096: Publish a security policy and private reporting route**

- [x] Add supported versions, private reporting, acknowledgement and disclosure guidance
- [x] Tell reporters not to publish suspected vulnerabilities as ordinary issues
- [ ] Enable private vulnerability reporting and verify the Security tab presents the route
- [x] Define security scope for data loss, generated data, dependencies and workflows

Constraint gate: checked 1 to 11, none breached.

No security policy or supported private route exists. A public repository needs a safe path before
the first report, not after a vulnerability has already been disclosed in an issue. The repository
setting is a separate task outcome and cannot be claimed by adding the file alone. Evidence:
`absent: SECURITY.md, tracked-file inventory and repository root listing`.

Shipped, with the third task deliberately left open. It cannot be done yet, and that was measured
rather than assumed: GitHub offers private vulnerability reporting on public repositories, this one
is still private, and both `GET` and `PUT` on the private vulnerability reporting endpoint answer
404. `BL-100` has since built the gate that publication needs, but it does not publish anything, so
this task still belongs to the moment that decision is taken. The policy
is written so it is true on both sides of it: it names private reporting as the only channel and
says what it means if the option is not on the Security tab yet, rather than promising a route that
does not answer.

Supported versions were the other question a template would have got wrong. There are no releases
and no tags, so a version table would have listed builds that do not exist. What is supported is the
current state of the default branch, and the version policy that does matter here is the one about
stored data at `src/js/lib/version.js:5-9`, because a MAJOR change is the one an older build cannot
read.

Scope is written from what this repository actually is rather than from a generic list. Losing or
corrupting saved reading progress is named as the highest severity category, which is the honest
ranking for an app with no server and no accounts. The dev server, the rule for which API base a
stored setting may name at `src/js/lib/apiBase.js:26-38`, the generated data under `src/data/`, the
lint tooling and the workflows are in scope. Marvel's own services, the third-party metadata API,
the documented 2025 metadata boundary and the fault harness that damages data by design are out of
it, each with the reason beside it.

Verified: the policy's load-bearing claim is now machine-checked. It says the app has no runtime
dependencies, which is what makes a dependency report a report about lint tooling rather than about
anything a reader runs, and nothing checked that before. Three tests were added and each was watched
failing against the one fact it defends. Four mutations were run against them: adding a runtime
dependency, deleting the sentence that claims there are none, deleting the sentence that names the
three lint packages, and adding a fourth lint package. Each turns exactly one of the three red, and
the four between them reach all three. The first version of the second test passed on a policy that
no longer made the claim, because the phrase wraps across a line in the hard-wrapped file and the
raw text was being matched; collapsing whitespace fixed it, and the mutation now refuses to run if
it matches nothing, so an unreachable check cannot report itself as unfailable again.

Review round: seven findings, all in text this item introduced, all fixed rather than routed. Four
were claims the policy made that the code does not support. It said the dev server sends a content
security policy on every response; the header block at `server.mjs:112-122` is reached only on the
200 and 304 paths, and the 403, 404, 405 and 500 exits carry none of it, so the sentence now says
"every response that serves a file" and records the gap in the same bullet. It said the app "sends
no data anywhere", which contradicts the README's own carve-out: the app does fetch metadata and
cover images, so the bullet now uses Constraint 3's wording, that nothing you create is uploaded
anywhere, and names what does go out. It called `isAllowedApiBase` an endpoint allowlist, which
overstates it: `src/js/lib/apiBase.js:26-38` accepts any `https:` origin and forbids cleartext off
loopback, and pinning a host is refused on purpose so a reader can point the app at their own
mirror. And it said everything under `src/data/` is produced by the scripts, when
`src/data/curated-lists.json` is an input to the generator and the order checklists are kept by
hand.

The fifth was the one worth the round on its own. The reporting section told a reader that an absent
Security tab option means the repository is not yet public. That does not follow: private
vulnerability reporting is off by default on public repositories too, and enabling it is an unticked
task on this item while publication is a different item. The reachable state was therefore public,
setting off, option absent, and a genuine reporter being told there was nothing to report. The
section now conditions on the setting rather than on visibility and gives a route that always
answers, an issue asking for a channel with no detail in it.

The sixth was in the evidence above rather than in the product. The block claimed each mutation
turned exactly one test red, and the two prose assertions in fact shared a single sentence, so
deleting that sentence turned two red and neither guard was independent of the other. The sentence
was split in two, which is why the claim about runtime dependencies and the claim about the three
lint packages now stand as separate sentences at `SECURITY.md:6-9`; a fourth mutation was added for
the second of them, and all four now turn exactly one red, which is what the paragraph above
records. The seventh was the `CHANGELOG.md` entry announcing a private reporting route as shipped
fact while the policy and this block both say it cannot be enabled yet. That entry now says what the
policy says.

**BL-097: Publish contribution, conduct, support and maintainer governance**

- [ ] Add a concise public contribution guide that preserves the repository's quality rules
- [ ] Explain the destructive fault harness and required backup before use
- [ ] Adopt a code of conduct with a monitored enforcement contact
- [ ] Route support, metadata outages, Marvel service issues and security reports correctly
- [ ] State how roadmap, release, moderation and maintainer decisions are made

Constraint gate: checked 1 to 11, none breached.

The README explains tools and data generation well, but it does not define contribution scope,
conduct enforcement, support boundaries or maintainer decisions. The detailed internal instructions
are valuable history and are not a concise public policy. Evidence: `README.md:269-509`,
`absent: CONTRIBUTING.md, CODE_OF_CONDUCT.md, SUPPORT.md and governance file, tracked-file inventory`.

**BL-098: Define review ownership and contribution intake**

- [ ] Add ownership for workflows, persistence, recovery, generated data and release metadata
- [ ] Add a pull request template for impact, scope, evidence and provenance
- [ ] Add focused bug, feature and data-order issue forms
- [ ] Route security reports privately rather than through a public form
- [ ] Verify branch rules require the intended reviews and checks

Constraint gate: checked 1 to 11, none breached.

No ownership file or issue and pull-request templates exist. The internal instructions require a
plain-English opening and verification counts, but an external contributor never sees that shape in
the contribution flow. Branch rules are a settings-only check and must be verified separately.
Evidence: `.github/copilot-instructions.md:380-412`,
`absent: CODEOWNERS and issue or pull request templates, tracked-file inventory`.

**BL-099: Clarify the license and provenance boundary for committed data**

- [x] Inventory each committed data file by origin, copied fields and upstream terms
- [x] Separate provenance descriptions from legal-license fields
- [x] Give locally compiled orders a reviewable source trail or independent derivation record
- [x] State exactly what MIT covers and what remains subject to third-party terms
- [ ] Obtain legal review before describing the complete data tree as MIT-licensed

Constraint gate: checked 1 to 11, none breached.

The MIT license clearly covers repository-authored source. Values such as "Compiled for this
project" describe origin, not legal terms, and one collected-edition order names an external guide
in prose while its structured source is null. The study makes no legal conclusion about
redistribution; it records that the boundary needs review before publication. Evidence:
`src/data/curated-lists.json:80-120`, `src/data/new_ultimate_universe_trades.json:1-10`.

Shipped, with the fifth item open and recorded as a blocker rather than ticked. Obtaining legal
review is not something that can be done by writing a document, so ticking it on the strength of
having written one would be the exact dishonesty the rest of this item exists to remove. Everything
that writing can settle is settled; the question that needs a lawyer is stated plainly and left
open.

The field split is the substance. `sourceLicense` held provenance prose for ten of the twelve lists
and named a licence for two, so a reader could not tell which kind of answer any given value was.
Origin now lives in `sourceOrigin` and `sourceLicense` holds either an SPDX expression or `null`,
with `null` meaning "not established" rather than "none applies". The manifest reader rejects a
missing origin and rejects a licence that is not SPDX-shaped, so the two cannot silently merge back.

The upstream terms were checked rather than assumed, and the check changed the answer. The
repository the two vendored orders came from carries no LICENSE file at all: the GitHub API reports
no licence for it and the licence endpoint is absent, so MIT survives there only as a README badge
and a heading. Its `pyproject.toml` does declare MIT, but for a Python distribution whose wheel
packages the source directory and not the `data/` directory these orders were taken from. So the
honest statement is that the upstream conveys MIT over its code and says nothing at all about its
data, and the boundary document says exactly that and draws no conclusion past it.

Measured for the inventory rather than estimated: twelve pinned order files holding 751 issue
records over 507 distinct issues, of which 688 carry a cover URL, 685 carry creator credits and 508
carry a description written by Marvel. The two index files hold 6,990 and 4,341 records. Those are
the numbers a review needs, and they are what the document reports.

The derivation trail generalised, which was the useful surprise. The first version of the test
assumed only the two hand-compiled orders were authored here and failed immediately on a third, so
the rule is now keyed on shape: every order this repository authors must record how it was derived,
naming either the script that generates it or the provenance record. Adding an order without a trail
fails whether or not anyone remembers to add its filename to a list.

Verified: seven tests were added and each was watched failing before the fix, one of them replacing a
test whose claim the split made false, so the suite grew by six. The parser output for both
hand-compiled orders is byte-identical before and after the headers were added, at 138 and 132
entries with the same sections and the same ids, so nothing a reader sees moved. Evidence:
`docs/DATA_PROVENANCE.md`, `src/js/lib/curated.js:23-26`.

Review found the shape check let a non-string through, which is worth recording because the defect
was the coercion rather than the pattern. `String(true)` is SPDX-shaped, so a boolean passed, and the
reader then stored it through the same helper that yields `null` for anything that is not a string.
The entry came out saying no licence was established, which is the one thing this field exists to be
able to say and nobody had said it. The type is now checked rather than coerced.

The same round found the documents had been corrected and the running app had not. Three shipped
surfaces still claimed MIT over the data, two in the tracker and one in the README, and separately
the About view told a reader that bundled orders were imported from community sources and not
authored here. That last one was false: eight of the twelve are assembled here by a script and two
more are compiled here by hand, so ten of the twelve are authored here. The replacement names all
three origins and carries no count, so adding a list cannot make it stale.

**BL-100: Establish a pre-publication content and history gate**

- [x] Decide which tracking artifacts and prompts are public evidence and which stay local
- [x] Protect intentionally local content with ignore rules or a staging allowlist
- [x] Run a dedicated full-history secret scan and record its revision and result
- [x] Review history for session identifiers, private statements, personal paths and generated data
- [x] Re-clone the publication candidate and verify setup, policies, notices and gates

Constraint gate: checked 1 to 11, none breached.

The boundary is a rule rather than a list. `.gitignore:36-37` now holds out the whole of the
tracking root and the prompts root, and the paragraph above those two lines says why that is safe:
git ignores have no effect on a file that is already tracked, so the six committed artifacts of the
first task keep working while everything a later session writes is held out by construction. The
alternative was an allowlist of filenames, which is the enumeration this repository has twice been
bitten by, and the reason is written into `scripts/check-anchors.mjs:167-170` for the same class of
defect.

That citation of the ignore file is the one claim in this block the evidence gate is not watching.
The gate collects a citation by its extension and an ignore file has none, so the claim is not
enrolled, and the near-miss notice that exists to catch exactly this misses it too because it also
begins at a dot-and-extension. There were already two such citations here before this item, and it
holds them true by luck rather than by a check. It is filed as BL-104 rather than fixed here,
because it is a defect in a different gate from the one this item built.

The scan found nothing, and the interesting part is which population it ran against. The obvious
one is wrong. `git rev-list --objects --all` reaches this machine's local object store, whose
tooling namespace carries 293 checkpoint commits whose messages are literally a session identifier
and a workspace identifier; scanning it reported 316 of them. Not one is advertised by the remote,
so not one would ever be published, and a gate built on `--all` would have been permanently red
over content nobody can remove and no clone ever receives. The population that matters is what the
remote advertises: at `5f78f68`, 22 branches, 1,075 blobs and 252 commit messages, and it is clean.
The same scan reachable from `HEAD` covers 992 blobs and 206 commit messages, also clean. All four
authorship identities in the history are already `noreply` addresses.

`npm run publication` checks both halves, and `npm run publication:surface` swaps the second one to
the branches the remote advertises. It is wired into CI, and that step is the reason the lint job
now checks out at `fetch-depth: 0` while every other job here stays shallow: a shallow clone has one
commit, so the history half would have been answered over almost nothing. The gate exits 2 rather
than 0 in that state, and 2 means "could not answer" rather than "clean", which is the distinction
the whole script turns on.

That distinction is the review's doing, and it is worth recording that the first version did not
make it. A code review of this item found nine defects, seven of them a way the scan could report
success without having looked. The gate exempted two whole files at every revision, so a real
credential committed to either was invisible to the gate and to the test that double-checks it, and
one of those two files matched nothing at all, so the exemption bought a blind spot in the script
the mechanism rests on and nothing else. An allowance is now one exact hit in one exact file, so a
second, unplanned one in the same file still fails. Blobs over the size limit, blobs holding a NUL
byte and exempted blobs were dropped from the count with no mention, so the population line claimed
more than it had read; what was left out is now named in the line itself, and text with a byte order
mark is decoded instead of discarded, which matters because the shell this repository is developed
in writes UTF-16 by default and captured logs are the artifact class most likely to carry a path.
The shallow check sat in an `else if` after the surface branch and so could never run in the mode
the comment above calls authoritative. `--surface` described the last fetch as what the remote
advertises, and now asks the remote. `git ls-files` quoted any path outside plain ASCII, the quoted
form was not one `git show` accepts, and the failure was swallowed, so an unreadable file and a
clean one printed the same. The pattern for a Windows profile path accepted only the raw backslash
form, which is the one a person spots by eye and not one of the four further shapes a tool writes it
in: escaped for a string literal, forward slashed, quoted, and as a file url.

Verified: nineteen mutations, each turning at least one of the eleven tests in this gate's suite red.
Eight are the original set, which delete an ignore rule, remove or loosen a signature, break the
allowance list, or commit a string shaped like an access key in a throwaway clone; that last one
turns the gate itself red too, and names the file. Eleven more were written against the review, one
per defect above, including two that pin the workflow's full-depth checkout: one deletes the setting
and one moves it to the other job, and the second is the one that matters, because the first version
of that test never split the file into jobs and so was true of any workflow mentioning both things
anywhere. A fresh clone installs, and every gate passes from it.

One thing the clone measured that this item does not fix. A clone of the remote receives 22
branches and no tags, and 9 of those 22 are the head branches of pull requests that have already
merged. Nothing here deletes them, because deleting a branch is a repository operation rather than a
change to the tree, and it is filed as BL-103. Cloning this machine's own copy receives 36 instead,
which is a local accumulation and not something publication would expose. Evidence:
`scripts/check-publication.mjs:156-190`, `.github/workflows/ci.yml:107-125`.

**BL-101: Withdraw the undo-restore offer when erasing everything**

- [ ] Clear the pre-restore snapshot when the reader deliberately erases their data
- [ ] Decide the same question for the other routes that replace the whole state
- [ ] Test that the erase promise is not contradicted by a live offer afterwards

Constraint gate: checked 1 to 11, none breached.

Raised by the review of `BL-083` and routed here rather than fixed there, because it is a different
code path from the restore this one repaired. Two routes replace the whole state at once, the erase
button at `src/js/main.js:3076-3089` and the escape hatch out of the blocked state at
`src/js/storage.js:181-183`, and neither touches the undo snapshot. Only `restore()` and its own
rewind ever write that key, so **Undo restore** stays live indefinitely after a confirmation that
says in as many words that erasing cannot be undone. The offer works, which is the problem: the
reader is told their data is gone and is then shown a button that brings a copy of it back. Nothing
is lost either way, so this is a truthfulness defect rather than a data-loss one, which is why it is
scored below the item that raised it. The answer should be decided once for both routes rather than
per button, and the erase route's own copy is the wording to hold it to.

**BL-102: Send the security headers on the dev server's error responses too**

- [ ] Build the header set once and use it on every exit from the request handler
- [ ] Give the 403 and 405 replies a content type, which they currently answer without
- [ ] Test that a request which cannot be served still carries the four headers

Constraint gate: checked 1 to 11, none breached.

Raised by the review of `BL-096` and routed here rather than fixed there, because that item published a
policy and this one changes the server. The header set at `server.mjs:112-122` carries the content
security policy, `nosniff`, `no-referrer` and `X-Frame-Options: DENY`, and it is assembled inside the
success path, so only the 200 and 304 replies ever send it. The 405 and 403 exits at `server.mjs:86-96`
send neither those nor a content type, and the 404 and 500 exits send a content type alone. Measured by
starting the server and reading the replies: a served file carried all four, a missing file carried
`content-type` only, a rejected path carried nothing, and a POST carried `allow` only.

Nothing here is reachable by an attacker who is not already on the machine, since the server binds
loopback and serves the app's own files, which is why the policy puts missing hardening with no
reachable consequence out of scope for a vulnerability report and why this is scored as debt. It is
worth closing anyway: a plain-text body sent with no content type is exactly what `nosniff` exists to
stop being guessed at, and a header set that four of six exits skip is a set whose guarantee cannot be
stated in one sentence. `BL-096` had to write the exception into the security policy instead, which is
the shape of a claim waiting to be simplified.

**BL-103: Retire the branches publication would put on display**

- [ ] Delete the head branches of pull requests that have already merged
- [ ] Decide what happens to the branches that never became a pull request
- [ ] Turn on automatic head-branch deletion so the list does not refill

Constraint gate: checked 1 to 11, none breached.

Raised by `BL-100` and routed here rather than folded into it, because deleting a branch is a
repository operation and that item changed the tree. Publication publishes every branch the remote
advertises, not just the default one. Measured against the live remote: 22 heads, no tags, and 9 of
those 22 are the head branches of pull requests that are already merged, so what a new reader would
find is a branch list where most entries are finished work that nobody removed. Squash merges are
why: the merge leaves the branch behind, and nothing here deletes it.

This is untidiness rather than exposure, which is why it is scored the way it is. `BL-100` scanned
every one of those branches and found nothing to remediate, so the content is the same content, and
the cost of leaving it is that a reader has to work out which of 22 branches is live. The third task
is the one that keeps this closed, because the first two are a cleanup that will be back within a
month otherwise. Evidence: `scripts/check-publication.mjs:156-190`.

**BL-104: Let the anchors gate see a citation of a file with no extension**

- [ ] Collect a citation whose path carries no extension, in both the backticked and bare forms
- [ ] Make the near-miss notice fire on the shape it currently cannot see
- [ ] Test that a citation of an ignore file drifts when the lines it names move

Constraint gate: checked 1 to 11, none breached.

Raised by `BL-100` and routed here rather than fixed there, because that item wrote a boundary and
this one changes the gate that watches claims about it. Both collectors at
`scripts/check-anchors.mjs:32` and the bare form below it require a filename to end in one of seven
extensions, so a path with no extension at all is not a citation as far as the gate is concerned. A
file whose whole name is its suffix is the ordinary case of that, and this repository cites one:
the ignore file is named twice in this document, once by the hygiene section and once by `BL-100`,
and neither citation is enrolled. Both happen to be true today, which is luck rather than a check.

The part that makes it worth fixing rather than accepting is the silence. The near-miss notice
exists precisely so a citation that is not gated is at least visible to a reviewer, but its pattern
begins at a dot followed by an extension, so it fails on this shape for the same reason the
collectors do. The result is a citation that reads exactly like every gated one, drifts exactly like
every gated one, and warns nobody. `BL-079` widened this gate once already, on the comment syntax it
reads rather than the names it accepts, so this is the same lesson arriving at the other end of the
same regexes.

**BL-105: Derive the roadmap paragraph's status split in the counts gate**

- [ ] Derive the "N of them are still `Ready`" figure from the table rows in that id range
- [ ] Derive the list of delivered ids in the same sentence from the same rows
- [ ] Prove both fail by putting the stale wording back

Constraint gate: checked 1 to 11, none breached.

Raised by `BL-095` and routed here rather than fixed there, because that item put deadlines on a
workflow and this one changes the gate that reads this document. The counts gate already derives the
opening paragraph's "N items have since been delivered" sentence and its list of ids, at
`scripts/check-counts.mjs:225-258`. It does not derive the second paragraph, which makes the same two
statements about the eighteen items of the 2026-08-10 study: how many of them are still `Ready`, and
which have shipped. Both went stale as those items shipped, and every gate stayed green.

That is the same defect `BL-059` was raised for and the same one this document has now had three
times, so the interesting part is not the wrong number but that the fix for it was written to one
sentence rather than to the shape of the sentence. Two paragraphs make the same claim about two
different id ranges; one is derived and one is prose. Deriving the second is small, and the check
that matters is the one that proves it: put the wording back that shipped with `BL-095`, which said
fourteen were `Ready` when thirteen were and omitted one delivered id, and watch it fail.

**BL-106: Credit Comic Book Herald where a new reader would look for it**

- [x] Add the site to the README's list of companion sites, saying what it publishes
- [x] State this project's debt to it in the same terms the committed record already uses
- [x] Check the credit claims nothing the record does not

Constraint gate: checked 1 to 11, none breached.

Asked for directly by the owner rather than raised by a study or a review, which is why it names no
finding. The gap it closes was measurable all the same: the site is named in ten tracked files on
`main`, and in none of them a new reader starts. The catalog card names it on screen, and the
provenance record and the order's own header both record that one bundled order's volume division
follows its collected-edition guide. What carried no mention was the one document a new reader opens
first, whose list of companion sites had two entries and not this one.

Shipped as a third entry beside the two already there, saying what the site publishes and what this
project owes it. The wording is the part worth recording, because the first draft overstated the
debt. It said the trade order was compiled from that guide, which is wider than anything committed
here says: `src/data/orders/new-ultimate-universe-trades.md:3-5` states the sequence and its ids as
this project's own work and scopes the debt to the division into volumes alone, and
`docs/DATA_PROVENANCE.md:92` files the order under "Compiled for this project". Review found the
same overclaim in the changelog, where it went further and said the committed record already backed
it. Both now scope the debt the way the record does.

That is worth more than a note about wording. `BL-099` was filed to stop this document and the
running app claiming more than the record supports, and its own block records the same fault running
the other way: the About view told a reader the bundled orders were not authored here when ten of
the twelve are. Claiming too much and claiming too little are one failure, which is reading a
sentence against what you remember of the record rather than against the record. It recurred here,
inside the change that credits the source that item's boundary depends on.

The record you are reading was nearly not written. The argument for omitting it was that neither
entry already in that README section shipped under a backlog item, which is true and is not
precedent: both arrived in the scaffolding commit that predates this document and its rule. Work
that landed before a process existed does not show the process permits landing without it.

**BL-107: Date or re-derive the repeat figures BL-058 states as current**

- [ ] Decide whether the paragraph reports a measurement made then or a fact about the document now
- [ ] Re-derive every figure in it, or date it and name what it was measured against
- [ ] Prove the choice holds by checking whether the next item to ship falsifies it again

Constraint gate: checked 1 to 11, none breached.

Found while writing `BL-106`'s record rather than by a review, and routed here rather than fixed
there, because that item credits a website and this one settles a measurement. `BL-058`'s block
reports the counts that chose the repeat gate's three-line floor, and states them in the present
tense: that the constraint gate line stands 25 times in this document and accounts for 24 of its 26
one-line repeats, out of 124 one-line and 4 two-line repeats across six documents. It did stand 25
times in the commit that wrote that sentence. It stood 49 times in the commit before this one, and
the two blocks this change adds make it 51.

Which kind of sentence it is decides what to do with it, which is why the first task is a decision
and not an edit. Read as a claim about the document today it is simply stale, and this is the fourth
time this document has carried one, after `BL-055`, `BL-059` and `BL-105`. Read as the measurement
that chose three lines over four it is still true, and re-deriving it would replace the evidence for
a decision with numbers that had no part in making it. The figures are load-bearing either way, so
they need to say which they are.

**BL-108: Make the cover art switch stop the cover requests it hides**

- [ ] Gate the cover request itself on the setting, not only the painting of it
- [ ] Fetch the covers that were skipped when the setting is turned back on
- [ ] Cover the two eager images the reading and catalog heroes paint directly
- [ ] Measure the request count with the setting off from the first paint, not only after a toggle

Constraint gate: checked 1 to 11, none breached.

Raised by the review of `BL-087` and routed here rather than fixed there, because that item is a
copy change and this one is a behaviour change. `BL-087` first shipped a sentence saying the switch
stops the requests. It does not. `applyCoversSetting` toggles a body class, the five rules that hide
a cover `<img>` under that class are `display: none`, and `paintCoverUrl` assigns `img.src` with no
reference to the setting, so the request has been made before anything is hidden. Measured in Edge
with the setting off from the first paint: eight requests to `i.annihil.us`, the same eight as with
it on. Evidence: `src/js/main.js:485-488`, `src/js/main.js:491-492`, `src/styles.css:436`.

Two details make this larger than moving one condition. `setCovers` calls `renderReading` and
`renderHome`, so switching covers off is itself a re-render and currently issues a fresh round of
the requests it is meant to end. And the pattern this item wants already exists in the file, twice
over, for the hero backdrop alone: `src/js/main.js:1724` reads the setting before building the URL,
and `src/styles.css:419` sets `background-image: none` under the same class, which does suppress a
request because a computed `none` is never fetched. That is the one place covers are genuinely not
requested when the setting is off, and it is why the omission on the `<img>` beside it reads as an
oversight rather than a decision. Turning the setting back on has to fetch what was skipped, or the
switch becomes one-way until a reload.

**BL-109: Tell an issue upstream refused apart from one nobody has asked about**

- [ ] Stop asserting that every curated item arrived with its metadata
- [ ] Keep the reason a lookup failed instead of discarding it
- [ ] Leave a refusal out of the retry queue and out of the count on its button
- [ ] Show which of the two states an issue is in, on the issue itself

Constraint gate: checked 1 to 11, none breached.

The app carries a complete backfill mechanism and curated import switches it off for the issues that
need it. `pendingIssueIds` collects tracked issues that are not hydrated and were not added by hand,
`hydrationOrder` walks them starting from what the reader is about to read, and the result is a
`details pending` badge and a **Fetch details for N issues** button. Import then maps every item to
`hydrated: true`, which is right for the 688 items that carry metadata and wrong for the 63 that
carry none, where `normalizeIssue` would otherwise infer the flag from whether the item has a
`digitalId` or a `seriesId`. Measured by replaying a real import through the app's own modules: 0
issues report as pending as shipped and 34 with the flag inferred, and 0 either way for each of the
ten orders that have no gaps. The 63 items are 34 distinct issues, because the two Ultimate orders
overlap and `pendingIssueIds` collects into a set keyed by issue id across every list, so the item
count and the figure a reader would ever see are different numbers and only the second belongs on a
button. Evidence: `src/js/main.js:2820`, `src/js/lib/model.js:88`,
`src/js/lib/model.js:554`.

Inferring the flag on its own would be the wrong fix, and that is the substance of this item rather
than a caution attached to it. It lights up **Fetch details for 34 issues**, and upstream answers 404
to every one of those ids, so the button would spend around twenty seconds of the reader's own
request budget, which this app holds at 45 a minute and 20 in any ten seconds, to change nothing. A silent omission would become a loud promise. What is missing is the distinction this app
already draws about availability, where five states are kept apart so that a definite no is never
confused with an absence of data: not fetched yet is worth retrying, and upstream does not hold this
is worth showing and not worth retrying. The hydrator cannot tell them apart because it discards the
error deliberately, so that a failure stays pending and is tried again. That is the right behaviour
for a timeout and the wrong one for a refusal. Evidence: `src/js/hydrate.js:61-65`.

**BL-110: Count the issues an order imported empty, and say so**

- [ ] Count an item whose lookup was refused, separately from a line that never had a link
- [ ] Report that number in the sentence already written to disclose a gap
- [ ] Test both kinds of gap, and an order with neither

Constraint gate: checked 1 to 11, none breached.

Import already means to disclose a gap and its comment already says why, that admitting one is the
difference between a known gap and a list that looks wrong for no reason. The number it reads is the
wrong one. `order.placeholders` is set by the vendor script from `unresolved`, which is checklist
lines carrying no link at all, and a line that carries a link whose lookup was then refused produces
a fully formed record with every field null and no mark on it of what happened. Both Ultimate
Universe orders are entirely of the second kind: `placeholders` reads 0 in each while 34 and 29 of
their items hold nothing beyond an id, a title and a URL, so the sentence never fires. Across all
twelve orders no item at all carries `placeholder: true`, which makes the only gap this sentence can
report the one kind this repository does not currently have. Evidence: `src/js/main.js:2846-2853`,
`scripts/vendor-orders.mjs:219-250`, `scripts/vendor-orders.mjs:303`.

**BL-111: Check the metadata source for what it covers, not only what it returns**

- [ ] Assert the issue count the health endpoint already returns beside its status
- [ ] Assert the issue count of a series whose order stops short of its published run
- [ ] Write the figures down as a dated observation, not as a level expected to rise

Constraint gate: checked 1 to 11, none breached.

The contract check pins the shape of every response the app depends on and asserts nothing about what
the source contains. It asks the health endpoint only whether the API answers, and that same response
carries the issue count. Measured on 2026-08-12: 37,526 issues, a latest on sale date of 2025-10-29
across all 785 records held for that year, and nothing at all for 2026. Marvel's own developer API,
where this data originated, was retired on that same date, so the snapshot is a finished record
rather than a lagging one. Evidence: `scripts/check-contract.mjs:62-67`.

The honest framing is a watch on a source believed dead rather than an expectation of recovery, and
that is the argument for building it rather than against. The retirement is documented outside this
repository and the provenance document now cites it, but nothing inside the repository observes it:
what this check can see is two figures agreeing, and that agreement is load-bearing for two other
items. Instrumenting it costs one assertion on a
request the check already makes, and it is the only thing that would say so if the belief were wrong.
This check is deliberately outside CI, because it calls a live third party, so it is a release
question rather than a build one.

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
  choose an essential reading path or a complete tie-in path.** `BL-007` `Shipped`
  - Variants are grouped under the same event and clearly named.
  - Three of the five events carry a pair. The other two say why they cannot: their main series
    does not open their order, so a main-series-only list would start in the middle of the story.

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
  context, reactions, or reminders.** `BL-017` `Done`
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
this was assessed. Two gaps remained. Both have since closed, and 25 of the 28 ship in full
now.

- Gap: series progress is computed across every list at once rather than for the list being read,
  so a reader inside one crossover sees totals inflated by every other list they have imported.
  Evidence: `src/js/main.js:2896-2930` (renderProgress, which now takes a scope), `src/index.html:369`
  (the view's subtitle).
  Resolved: `BL-014` gave `seriesProgress` an optional list id and put a two-option scope control in
  the view, defaulting to the active list. The evidence above points at the replacement, and the
  subtitle is now written by the render rather than asserting "every list" regardless.
- Gap: the catalog carries a variant grouping model, but only the Hickman creator run populates it.
  All six event lists ship with `group`, `groupName`, and `variant` set to null, so the promise of
  choosing an essential path or a complete path applies to one list out of eight.
  Evidence: `src/data/catalog.json` (per-list `group`, `groupName`, `variant` fields),
  `src/js/main.js:2640` (groupCatalog renders variant rows only where a group exists).
  Resolved: `BL-007` gave three of the five events a main-series variant, so four groups now render
  where one did. The other two are refused rather than left undone, because their main series does
  not open their order and a short path that starts in chapter six is not a shorter path through
  the same story. The evidence above points at the model that was already there and went unused.
- Correctness is well defended: 224 unit tests pass, 235 when this pass shipped and 403 now, and
  `scripts/check-contract.mjs` pins 24 upstream API assumptions so schema drift is distinguishable
  from an outage.
  Evidence: `package.json:10`, `package.json:13`, `scripts/check-contract.mjs:248-280`.

#### 2. Performance efficiency

Gap, measured rather than inferred. Every state change re-renders the entire application. A single
read toggle on the 219 issue Hickman full list rebuilds the rail, all 219 rows and the progress
block: 4,485 DOM nodes and 1,533 row controls, at a median of 21.9 ms synchronous and 75.7 ms to
paint, with the first toggle costing 38.9 ms and 144.1 ms. Measured headless on a desktop machine,
so a phone will be slower, though phone use is out of scope; see BL-028.

Evidence: `docs/ux-artifacts/render-cost.json`, `src/js/main.js:3307-3327` (renderAll rebuilds
every region), `src/js/main.js:72-77` (store.onChange is wired straight to renderAll),
`src/js/main.js:1851-2034` (renderRows, which then built every row with no virtualisation and no
early exit when the containing details element is closed).
Resolved: `BL-033` gave `renderRows` both a per-row cache and that early exit. Re-measured the same
way on the same order, a read toggle went from 14.8 ms to 2.8 ms with the order open, and from
12.7 ms to 1.7 ms with it closed, which is how a reader first meets it; the rows rebuilt per toggle
went from 219 to 2. The 21.9 ms above is not comparable with either figure, because the harness
that produced it awaited a frame after each click and so reported frame cadence rather than work.
`docs/ux-artifacts/render-cost-bl033.json` holds the new measurements. The two other pieces of
evidence are unchanged: `renderAll` still rebuilds every region and the store is still wired
straight to it, which is what BL-042 and BL-064 are about.

Loading is handled well by comparison: the three large data files are fetched only on demand, so
the 353 KB series index never loads for a reader who does not search series.
Evidence: `src/js/api.js:12-17`, `src/data/series-index.json`.

#### 3. Compatibility

No gap. Co-existence is a non-issue for a single local process, and interoperability is served in
both directions: JSON backup for round-tripping and Markdown export for reading elsewhere. Zero
runtime dependencies and plain ES modules mean nothing to reconcile with a host application.

Evidence: `package.json:1-31` (no `dependencies` key at all, `engines.node >= 20`),
`src/js/lib/model.js:671-699` (validated backup shape).

The fixed `127.0.0.1:8787` origin is a deliberate storage-bucket decision rather than a
compatibility gap, so it is recorded here and not proposed for change.

#### 4. Interaction capability

The weakest characteristic, and the source of most of this run's findings. Dropping to
sub-characteristic level, because the characteristic-level answer would hide the split.

- Appropriateness recognisability and learnability: good. Labels are written in plain English and
  the availability wording is careful to hedge. Evidence: `src/js/main.js:2036-2041`.
- Operability: gap, accepted. Row actions sit at `opacity: 0` until hover or focus-within, so on a
  touch device they are invisible until tapped. This was BL-028's third task and is dropped with
  it, on the ground that phones and tablets are out of scope. It is recorded as an accepted gap
  rather than a closed one, because a desktop touchscreen still meets it. Evidence:
  `src/styles.css:635-636`.
- User error protection: no gap, closed by BL-034 and BL-035. Deleting a list is confirmed in the
  page rather than by a native `confirm()`, and it can now be undone for the rest of the session,
  which is the same affordance restoring a backup already had. Evidence:
  `src/js/main.js:1604-1631` (undo), `src/js/main.js:3040-3046` (undoRestore exists).
- User engagement and inclusivity: gap. The interface is hard-locked to a dark scheme, and a light
  preference changes nothing. Measured: under emulated `prefers-color-scheme: light` the body
  background stays `rgb(15, 17, 21)` and the two screenshots are byte-identical.
  Evidence: `docs/ux-artifacts/live-inspection.json`, `src/styles.css:47`, `src/index.html:6`.
- Self-descriptiveness: gap, closed by BL-027. The full availability description was carried only
  in a `title` attribute, which never reaches a keyboard or touch user. It is now text inside the
  badge, read in sequence with the short label rather than as a separate hint. Evidence:
  `src/js/main.js:1971-1981`.

#### 5. Reliability

Strong, and clearly the product of deliberate work. Unreadable saved data pauses writing rather
than overwriting, offers a salvage download, and explains itself. A backup from a newer schema is
refused rather than mangled. A fault-injection harness ships alongside the app.

Evidence: `src/index.html:142-157` (blocked banner, saving paused, salvage offered),
`src/js/lib/model.js:582-608` (migrate refuses an unsupported schema version),
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
  Evidence: `src/js/main.js:3307-3327`, `src/js/main.js:811-828` (showView switches views by
  mutating a module-level variable).
  Still open, and wider than audited: the file is 3,413 lines now, so nearly every item shipped
  since has been added to the one file this gap is about. `BL-053` is the exception in kind rather
  than in size: it moved the reading filter predicates out to `src/js/lib/readingFilters.js` and
  still left `main.js` 8 lines longer, which is the shape of the problem. `BL-038` is the closest
  thing to a counter-example so far, adding two views while putting their selectors in
  `src/js/lib/model.js` and their descriptions in `src/js/lib/library.js`, and it still added 57
  lines here. `BL-055` corrected the figure; `BL-042` is the item that would close the gap.
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
  row, and a leftover empty rule sits between them. Evidence: `src/styles.css:551-554`,
  `src/styles.css:662-678`.
  Resolved: `BL-047` renamed the form row to `.field-row` and deleted the empty rule, so the two
  meanings no longer share a class. The evidence above now points at the replacement, which records
  what the collision was.

#### 8. Flexibility

Swept in full rather than dispositioned.

- Installability: good, and suited to an app cloned and run by hand. `npm start` runs the server
  with no install step, because there is nothing to install. Evidence: `package.json:8-22`.
  Changed since: `BL-040` added three devDependencies and a tracked `package-lock.json`, so linting
  now needs `npm install` first. Running the app still does not, and runtime dependencies are still
  zero.
- Adaptability: good. Plain ES modules with no build step and no bundler mean a Node upgrade
  changes nothing about the client, and `engines.node >= 20` states the floor.
  Evidence: `package.json:24-26`.
- Replaceability: good. The metadata API base URL is user-configurable and validated, the cache is
  keyed by base URL and schema version so switching mirrors does not serve stale data across them,
  and stored state carries a schema version with migrations.
  Evidence: `src/js/main.js:3048-3068`, `src/js/lib/cachePolicy.js:16-20`,
  `src/js/lib/model.js:11` and `src/js/lib/model.js:582-608`.
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
| First-run experience | Gap. The first-run DOM ships an empty `<h2 id="hero-title">`, so the first heading a screen reader meets on an unseeded install is blank. Evidence: `src/index.html:295-330`, `docs/ux-artifacts/pa11y-landing.json`. |
| Empty states | No gap. The unseeded landing state explains what the app is for and routes to the catalog rather than showing a bare shell. Evidence: `docs/ux-artifacts/01-landing-firstrun-1280.png`, `src/index.html:38-41`. |
| Error handling and recovery | Gap, closed by BL-034. Curated import used to report failure through native `alert()` while every other path used the in-page notice system. It now writes to a pane chosen when the message is written, so on the landing page the reason appears beside the catalog it is about rather than stopping the page, and it is not left in a view the reader has already scrolled or navigated away from. Evidence: `src/js/main.js:2814`, `src/js/main.js:2832-2834`, `src/js/main.js:2865` against `src/js/main.js:272-388`. |
| Offline behavior | No gap, and no proposal. Probed as required rather than treated as a caching problem. With the local server running and no internet, the app starts, reads saved state, imports any bundled curated list and marks issues read, because those paths touch only same-origin files. Only cover images, metadata hydration and search degrade, and hydration failure is already surfaced as a pending state rather than as silence. Evidence: `src/data/house_of_m.json`, `src/js/main.js:1975-1981` (pending and by-hand badges), `absent: serviceWorker|navigator.onLine|manifest.json, case-insensitive grep across src/`. Repository Constraint 1 forbids caching cover bytes, so no cover-caching improvement is proposed. |
| Data durability and export | No gap. Full JSON backup and restore, per-list Markdown export, validated and atomic restore with an undo. Evidence: `src/js/lib/model.js:671-699`, `src/js/main.js:3040-3046`. |
| Schema migration | No gap. Stored state carries `SCHEMA_VERSION`, migrations run forward, and a future schema is refused rather than silently coerced, with a test pinning that behaviour. Evidence: `src/js/lib/model.js:11`, `src/js/lib/model.js:582-608`, `test/model.test.js:558-560`. |
| Observability | Partial gap, bounded by Repository Constraint 3. Product analytics are forbidden and are not proposed. What is missing is local and private: there is no way for the reader to see why hydration stalled beyond a queue-depth pill. Evidence: `src/js/main.js:3284-3286`. |
| Performance | Gap, measured. See characteristic 2. Evidence: `docs/ux-artifacts/render-cost.json`. |
| Security, OWASP Top 10 | Gap under A05 Security Misconfiguration: no CSP and no `x-frame-options` on the dev server. Evidence: `server.mjs:112-122`. Resolved: `BL-030` shipped both, assembled at `server.mjs:43-54` and sent at `server.mjs:117` and `server.mjs:120`. Partial gap under A10 Server-Side Request Forgery by analogy: `MarvelApi` accepted any base URL and only stripped trailing slashes, with the https-or-local check living in the settings form rather than in the client. Resolved: `BL-045` moved the rule into the constructor at `src/js/api.js:20-33` and onto the read out of storage at `src/js/main.js:390-414`, so a base the rule refuses cannot reach a fetch from any of the three call sites, and the form keeps its own message at `src/js/main.js:3051-3052`. A01, A02, A03, A07 and A09 are not applicable, because there is no server-side authorisation boundary, no credential store, no server-side query language, no account system and no central log to protect. |
| Privacy | No gap. Nothing is uploaded, there is no account and there is no telemetry, which is the product promise itself. Evidence: `package.json:1-31` (no dependency that could exfiltrate), `absent: analytics|telemetry|gtag|beacon, grep across src/ and scripts/`. |
| Accessibility | Gap, measured and detailed in `docs/UX_STUDY.md`. Headline: 27 pa11y errors on the seeded reading view, 9 definite axe colour-contrast nodes there and 8 in the catalog, and a dead mobile layout rule. Evidence: `docs/ux-artifacts/pa11y-reading-seeded.json`, `docs/ux-artifacts/axe-03-reading-seeded.json`, `src/styles.css:213-216`. Resolved in part: the contrast findings closed under BL-029, BL-030 and BL-048, and the per-finding resolutions are recorded against each finding in `docs/UX_STUDY.md`. The headline counts above are the pre-fix measurements and are left as the record of what the audit found. The dead mobile layout rule is not fixed and will not be: BL-028 is parked, because phone and tablet reading is served by Marvel's own apps. |
| Documentation | No gap for users and maintainers: the README covers setup, the origin decision, the metadata boundary and the closed Android question. Evidence: `README.md`. |
| Testing strategy | Gap. 224 tests pass and the pure logic modules are well covered, but the three browser-coupled modules have none, so no test exercises a render path. Evidence: `absent: test/cache.test.js, test/hydrate.test.js, test/main.test.js; glob of test/ cross-checked against src/js`. Partly changed: the suite is 235 after this pass, but the three modules still have no test file, so the gap itself is unchanged. |
| CI/CD | Gap, total. No workflow, no pipeline, no automated run of the existing suite. Evidence: `absent: .github/workflows, Get-ChildItem of repository root and .github; no pipeline file of any kind`. Resolved: `BL-039` added `.github/workflows/ci.yml`, which runs the suite and the linter on every push and pull request, and on demand for any ref. |
| Release and versioning | Gap. Version is pinned at `0.1.0` with no tags and no changelog, so there is no way to say which build a backup or a bug report came from. Evidence: `package.json:3`, `absent: CHANGELOG.md and git tags, glob of repository root and git tag --list`. Resolved: `BL-043` set the version to `1.0.0` at `package.json:3`, added `CHANGELOG.md`, and wired a `version` script at `package.json:22` that syncs the version the app reports. |
| Dependency management | Not applicable, because runtime dependencies are zero by Repository Constraint 4, there are no `devDependencies`, and there is therefore no lockfile and no dependency graph to manage or audit. The repository invokes no package-fetching tool at all. Evidence: `package.json:1-31` (neither a `dependencies` nor a `devDependencies` key), `absent: npx, grep across the repository returning only this appendix's own text`. The absence of dev tooling is recorded as a maintainability and CI gap above rather than counted twice here. Changed since: the "not applicable" verdict no longer holds. `BL-040` added three `devDependencies` at `package.json:27-31` and a tracked `package-lock.json`, so there is now a dev dependency graph to audit even though runtime dependencies remain zero. |
| Licensing | No gap. The project is MIT, and every vendored order records its upstream source and licence rather than absorbing it silently. Evidence: `LICENSE`, `src/data/catalog.json` (`source` and `sourceLicense` per list), `src/js/main.js:2697-2717` (attribution rendered in the UI before import). |

### 2026-08-10 assurance and open-source delta

The historical assessment above remains the record of the state that produced BL-029 through
BL-052. A current delta reassessed the final tree before planned open-source publication. It filed
BL-083 through BL-100 and found no reason to reopen shipped or deliberately dropped work.

Security and privacy: restore truthfulness, stale-tab overwrites, unbounded backup import, cover-host
trust, precise network wording, immutable workflow inputs and continuous repository security
monitoring are open. The current package audit found zero known vulnerabilities, the server remains
loopback-only, and no injection sink, credential store, analytics client or comic-image storage was
found.

Accessibility: passive service statuses, catalog text clipping under the WCAG text-spacing override,
and the developer fault harness are open. Historical contrast, focus, dialog and theme findings stay
closed; phone reflow remains the accepted BL-028 decision.

Responsible AI: not applicable, because the product contains no model, inference, prompt execution,
generated content, recommendation engine or automated decision. Development prompts are not shipped
inputs. Any future model-backed feature must reopen that decision before implementation.

External contributors: ordinary fork pull requests already run with a read-only token, no referenced
secret and no privileged event. Publication still needs security reporting, public contribution and
governance policy, review ownership and templates, a legally reviewed data boundary, and a content
and history gate. Branch rules, outside-collaborator workflow approval, private vulnerability
reporting and security-feature settings must be verified on GitHub because files cannot prove them.

## Appendix B: Priority disagreements

The `P` labels in this document are the original author's release intent. WSJF is a separate,
mechanical ranking. Neither overwrites the other. Every case where they disagree is listed here for
a human to settle.

None of the 28 original stories is still open work, so no label and score can disagree in the
present tense any longer. BL-017 was the last that could, and it has shipped. Seven keep a label:
BL-007, BL-014, BL-017, BL-026 and BL-027 have shipped, and BL-025 and BL-028 were dropped; six of
those seven keep a score too, BL-025 having been dropped before it was ever scored. The
remaining 21 are `Done` and were never scored. The 22 items this pass created carry no label,
because inventing one would fabricate an intent that no one stated. Six original stories were still
open when the pass ran, so the table was 28 rows then. BL-028 has since been parked and sixty-one
further items filed, none of them labelled, one of which, BL-060, was parked in its turn, which is
how it reaches 87 rows now. The ranks below are positions in it as it stands.

Positions, not scores, and the two have come apart in four places: BL-062, BL-072, BL-075 and BL-077
each sit one row below an item they outscore. Every one of those eight rows has shipped, so the
order is a record rather than a queue and re-sorting it would change no decision while moving ranks
this appendix cites. It is written down instead of fixed for that reason.

### Case 1: BL-026 is labelled P0 but ranks thirty-ninth

- Stated: P0 Foundation, the first keyboard story in the original Epic 7.
- Calculated: WSJF 3.67, rank 39 of 87.
- Driver: job size, not value. Its Cost of Delay of 11 is the eighth highest figure in the backlog.
  It is outranked by thirty-eight items, twenty-two of them sized 1, 2 or 3 whose Cost of Delay is
  lower but whose size is smaller still. WSJF is explicitly a throughput heuristic, so a P0 that
  costs 3 will always sit below a cheap fix that costs 1.
- What a human should settle: whether "Foundation" here means "must be finished before anything
  else ships" or "must not be dropped". If the former, the label wins and BL-026 moves to the top
  regardless of the score. If the latter, the score's ordering is fine, because the items
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

### Case 2: BL-007 is labelled P1 but sits near the bottom

- Stated: P1 Core product value, event order variants.
- Calculated: WSJF 1.4, rank 81 of 87, below seventy-seven unlabelled items and five places above the
  single P2 story.
- Driver: both sides. Job size is 5, because the work is editorial rather than technical, and value
  is only 3, because the rendering that would display variants already ships and works. Evidence:
  `src/js/main.js:2640` and `src/js/main.js:2674-2679`. What is missing is data, in
  `src/data/catalog.json`.
- What a human should settle: whether variants are a product commitment or a nice-to-have. This is
  the one open item whose value depends entirely on an editorial decision nobody has recorded, so
  the score is guessing at the answer.
- Settled by events, and not the way the case framed it. BL-007 has shipped, and the editorial
  decision nobody had recorded turned out not to need recording: the work found a definition of
  "essential" derived from data already in the tree, the main series alone, gated on that series
  opening the order. The size of 5 was scored on the assumption that the work was editorial, and
  the part that actually was editorial reduced to a label and three descriptions. So the label was
  closer than the score here, and the lesson generalises: a size driven by "somebody has to decide
  this" is worth re-checking for a derivation before it is believed.

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
- Consequence for the ranking: with BL-028 removed the table was 34 rows, and was 36 once BL-058
  and BL-059 had been filed. BL-060 was filed here too and then parked on 2026-08-07, which is why
  the count moved by two rather than three. The highest Cost of Delay among the items that remain is
  29, shared by BL-083 and BL-099. That figure was 16, shared by BL-029, BL-039 and BL-050, until
  the 2026-08-10 study filed four items scoring above the 18 BL-028 carried. It had also been
  briefly untrue while BL-060 sat in the table carrying 18, and parking it made the sentence right
  again rather than requiring an edit. The five ranks quoted below are correct on the same basis:
  they were computed without BL-060 and are accurate again now that it is out of the table.

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

- BL-014, P1, rank 52 of 87. Mid-table, which is where a P1 belongs.
- BL-027, P1, rank 41 of 87. Mid-table.
- BL-017, P2, rank 86 of 87. The lowest-ranked scored story other than the one that cannot be
  sized, which matches its P2 label exactly.
- BL-025, P2, parked. The label is moot, because the item was removed by the constraint gate before
  it could be scored.

### One caution about the score itself

BL-042 carries a risk-reduction score of 8, which was joint highest in the backlog until the
2026-08-10 study filed four items at 13, and still ranks last at 0.55. That is entirely the size 20
denominator. The rank is
arithmetically correct and practically misleading: the item is not low value, it is unsplit. It is
held at `Proposed` rather than `Ready` for that reason, and the honest reading of its rank is
"cannot be scheduled yet", not "not worth doing".
