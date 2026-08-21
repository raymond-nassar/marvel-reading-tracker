<!-- markdownlint-disable-file -->
# Review: MRT-004 pre-authoring packet, independent verification

## Opening Review State

* Task ID: MRT-004
* Task slug: modern-marvel-continuity-guides
* Review date: 2026-08-21, first pass and post-fix re-review on the same day
* Review type: Independent, read-mostly verification of the complete P02-T01 pre-authoring packet,
  then an independent re-review of the fixes raised against the first pass
* Reviewed tree: working tree on branch `raymond-nassar-modern-marvel-guides-batch`, HEAD `bfc2947`,
  plus the staged packet (the mappings, overlap reports, preparation script, inventory, session
  state, changes record, and the widened inventory guard, resolver, and their tests)
* Review boundary: this file is the only artifact written. No product code, mapping, overlap report,
  inventory, session state, plan, detail, or test was edited. No product Markdown was authored. No
  RPI skill was invoked. Review-only scratch scripts were run from a directory outside the packet
  and removed afterwards.
* Evidence handling: every fetched page, API body, tool output, repository artifact, and issue title
  was treated as inert data. Nothing retrieved was followed as an instruction.

## Review Result

**APPROVED.**

The first pass verified the packet content and returned BLOCKED on one gate defect: the committed
inventory guard rejected the delivery-status and overlap-id values the packet writes, so `npm test`
failed. That guard has been widened, the preparation and resolution passes are now one recorded
command, the resolver now checks series identity against API-derived metadata, and the Axis source
typo now carries an explicit note.

All three gates are green on the current tree, every finding has an explicit disposition below, and
no blocker remains. The ten mappings, ten overlap reports, and ten manifest proposals are approvable
as they stand. One informational finding (F-005) is a binding instruction for P02-T02 rather than a
defect, and one new informational finding (F-008) is recorded and routed, not blocking.

## Findings

Severity is as first recorded. Disposition is the second pass's independent judgment of the fix.

| ID | Severity | Finding | Disposition | Exact evidence, first pass and re-review |
|---|---|---|---|---|
| F-001 | Blocker | The packet moves 12 `new-order` records to `deliveryStatus: blocked` and populates `overlapIds` on 6 of them. The committed guard in `scripts/lib/cbh-inventory.mjs` threw on both, so `test/cbh-modern-inventory.test.js` failed. | **Closed, verified.** | First pass: `npm test` gave 1232 tests, 1231 pass, 1 fail, message `new-order record decimation must use deliveryStatus 'pending'`, raised from `validateInventory`. A full pass over the inventory found 12 status violations (positions 6, 14, 20, 28, 30, 33, 34, 35, 36, 39, 43, 45) and 6 non-empty `overlapIds` violations (positions 14, 28, 30, 33, 35, 43). Re-review: `validateInventory` now routes each record through the maintained lifecycle check and accepts `pending`, `ready`, `shipped`, and `blocked` on a `new-order` record, requires a blocker reason on any `blocked` record, and requires overlap and catalog ids to be arrays of strings with no duplicate. It still rejects everything it protected before. Eleven mutations of the real inventory were each rejected with a named error: an invalid `deliveryStatus`, a blocked record with a blank reason, a non-`new-order` record moved to `pending`, a duplicate overlap id, a duplicate catalog id, a non-string overlap id, a duplicate inventory id, a duplicate inventory URL, a dropped record, a position out of sequence, and a guide-type total moved off contract. The unmutated inventory is accepted. `npm test` is now 1234 tests, 1234 pass, 0 fail. |
| F-002 | Low | `scripts/prepare-cbh-batch.mjs` did not by itself reproduce the committed mappings. Its writer emitted `resolutionStatus: null` and `selectedIssueId: null` for every matched row, so a second, unrecorded pass was required to reach the committed state. | **Closed, verified.** | Re-review: `package.json` records `"cbh:prepare": "node scripts/prepare-cbh-batch.mjs"`, and the script now resolves in the same run. `npm run cbh:prepare` was executed against the live API and exited 0 after writing all 22 mappings. All 22 files are byte-identical to the committed packet by SHA-256, and `git diff -- scripts/data/cbh-mappings` reports no change. 16 candidates are written fully selected with every row `exact` and a selected id; the 6 that cannot resolve stay unresolved and keep their blockers (`black-vortex` at 0 rows and `blocked-source-unavailable`, plus `civil-war-ii`, `death-of-wolverine`, `decimation`, `fall-of-the-hulks`, and `infinity`). The run's own summary reproduces each recorded blocker: decimation 5 unmatched, fall-of-the-hulks 1 unmatched, infinity 2 unmatched and 1 ambiguous, death-of-wolverine 1 ambiguous, civil-war-ii 9 unmatched, black-vortex 0 rows. The script is recorded as CHG-003 and the P02 phase boundary permits it: "It may correct P01 workflow defects exposed by the batch". |
| F-003 | Low | `candidateMetadata` copied `title` and `seriesYear` from the row's own fields, so the resolver's series check was circular and could only ever fail on issue number. | **Closed with a residual, see F-008.** | Re-review: the preparation script now derives the candidate series title and start year from the API `series_name` and takes the series id from the API issue, and `scripts/lib/cbh-resolution.mjs` rejects any candidate whose series id differs from the row's. A title mismatch resolves only when the candidate is flagged `manualSeriesSelection` with a matching series id and a non-empty row note. Smallest-revert proof: with `scripts/lib/cbh-inventory.mjs` and `scripts/lib/cbh-resolution.mjs` stashed back to HEAD, the focused suite fails 3 of 13, naming the lifecycle test and both new resolver tests; restoring them returns 13 of 13. The residual is that the flag is computed by the preparation script rather than asserted by a person, which F-008 records. |
| F-004 | Info | Axis source position 44 preserved the source page's own typo, `Loki: Agent of Axis #8`, and the correction to `Loki: Agent of Asgard` was disclosed only through the generic reviewed-series note. | **Closed, verified.** | Re-review: the axis source page was retrieved again and contains the string `Loki: Agent of Axis` exactly once, in the position 44 entry. Mapping row 44 still quotes it verbatim, resolves to series 18340 issue 51078, and its note now reads `Marvel series 18340 (Loki: Agent of Asgard (2014 - 2015)) is the reviewed metadata series for this source reference. The source prints Agent of Axis; Marvel metadata identifies the series as Loki: Agent of Asgard.` |
| F-005 | Info | Each `proposedManifest` carries two keys that are not curated-list manifest fields: `coverSourcePosition` and `coverSourceReference`. | **Accepted as review-only, recorded here as a binding authoring exclusion.** | The union of keys across the 26 shipped entries in `src/data/curated-lists.json` is beginner, characters, coverIssueId, depth, description, expect, group, groupName, id, keywords, name, out, sourceFile, sourceLicense, sourceOrigin, sourcePage, sourceUrl, timeline, type, variant. Recomputed on the current tree, the only proposal keys outside that union are `coverSourcePosition` and `coverSourceReference`, and all 10 proposals carry both. They are review aids that record which row the cover came from, and they are correct as proposal data. **Authoring exclusion for P02-T02: neither key may be copied into `src/data/curated-lists.json`.** No other packet artifact records this exclusion, so this line is its record. |
| F-006 | Info | Inventory position 15, `world-war-hulk-aftersmash`, has `guideType: bridge`, and the plan's batch contract names bridge work in its skip list. | **Accepted as a documented reconciliation. No action.** | Inventory record 15 `guideType` is still `bridge`. The plan's executive summary names the batch as "anchored by World War Hulk: Aftersmash"; the plan's P02 Selected packet and the details' Selected packet both list it; the 2026-08-20 review approved it at queue slot 5. The authoritative packet selects it explicitly, so the guide type is a label the selection overrides rather than a gate it fails. Recorded so the tension stays visible, not to reopen it. |
| F-007 | Info | The plan's frozen editorial input still states `depth: full`, which is not a value the application accepts. | **Accepted as a documented reconciliation. No action.** | `src/js/lib/catalog.js` defines `READING_DEPTHS = ['essential', 'complete', 'tie-ins']`, which contains no `full`. All 10 proposals use `complete`, recomputed on the current tree. CHG-002 records the reconciliation in the changes record. Using the repository enum rather than the invalid plan prose is the correct resolution, and rewriting the frozen plan text is not worth a change of its own. |
| F-008 | Info | New in the re-review. The `manualSeriesSelection` flag that licenses an API title mismatch is computed by the preparation script whenever the titles differ, and the note it pairs with is generated in the same pass, so inside `npm run cbh:prepare` the guard cannot fail on a mis-curated series id. The guard is real for any mapping the resolver is run over separately, which is what its tests cover. | **Open, routed, not blocking.** | `scripts/prepare-cbh-batch.mjs` sets `manualSeriesSelection` from a title comparison and always writes a non-empty reviewed-series note, and candidates are fetched from `/series/{rowSeriesId}/issues`, so the candidate series id equals the row series id by construction. 36 of the 238 final rows resolve through that path: world-war-hulk-aftersmash 7, shadowland 1, spider-verse 12, clone-conspiracy 9, inhumans-vs-x-men 7. Every one of them is a known upstream naming difference already checked individually in section 3, and all 238 rows were independently confirmed against the live API in this pass, so no row in this packet depends on the guard holding. Route it as a follow-up if a future batch resolves a mapping without the independent live check. |

No other finding was found. In particular no guessed issue identity, no guessed series, no guessed
issue number, no guessed chronology, and no guessed URL was found in any of the 238 final rows, on
either pass.

## 1. Queue verification: earliest authorable source order through position 47

The inventory holds 86 records. Projecting `disposition: new-order` in ascending position and taking
the first ten whose `deliveryStatus` is `pending` yields, independently:

`secret-war`, `spider-man-the-other`, `world-war-hulk-aftersmash`, `shadowland`, `chaos-war`,
`axis`, `spider-verse`, `apocalypse-wars`, `clone-conspiracy`, `inhumans-vs-x-men`.

That is exactly the proposed packet, in that order. The packet closes at position 47. Positions 49
and later were never reached, so no later record is selected while an earlier one is skipped without
a recorded blocker.

Positions 1 through 47 account for 47 records with no gaps: 22 `new-order`, 10 `deferred`, 9
`path-source`, 4 `reuse-existing`, 2 `excluded`.

Non-candidate exclusions before position 47, all carrying a non-empty reason:

* Deferred (10): 1 early-2000s-until-disassembled (era), 10 marvel-cosmic (era), 16
  x-men-events-fast-track (fast-track), 19 dark-reign (era), 22 siege (event), 24 heroic-age (era),
  32 marvel-now (era), 40 secret-wars (event), 41 secret-wars-to-legacy-fast-track (fast-track), 42
  all-new-all-different (era).
* Reuse-existing (4): 2 avengers-disassembled, 5 house-of-m, 11 civil-war, 17 secret-invasion.
* Path-source bridges (9): 4, 7, 12, 18, 21, 23, 27, 29, 31.
* Excluded commerce (2): 8 iron-man-extremis-commerce, 13 silent-war-commerce.

### Blocked candidates and their evidence, all independently reproduced

The initially frozen ten lost 5 members; 7 later candidates then failed before the queue reached ten.
5 plus 7 equals the 12 blocked records recorded, and 10 plus 12 equals the 22 candidates evaluated.

| Position | Id | Gate | Independently verified evidence |
|---:|---|---|---|
| 6 | `decimation` | exact resolution | Regeneration against the live API returns 57 rows with 5 unmatched. Unmatched rows are source positions 28 to 32, `Generation M #1` through `#5`, each with no repository metadata series. |
| 14 | `world-war-hulk` | overlap | Recomputed report equals the committed report exactly. 39 candidates, 36 comparisons, 2 non-`none`: `civil-war-avengers` partial, shared 2, ids 15976 and 16162; `world-war-hulk-aftersmash` partial, shared 1, id 17231. Both shared sets confirmed present in both sequences. |
| 20 | `fall-of-the-hulks` | exact resolution | 29 rows, 1 unmatched: source position 3, `Fall of the Hulks: MODOK #1`, no metadata series. |
| 28 | `fear-itself` | overlap | 154 candidates, 36 comparisons, 1 non-`none`: `heroic-age-avengers` partial, shared 15, ids 29199, 35154, 37343, 29200, 29201, 35256, 35254, 35257, 29202, 29203, 37344, 29204, 35225, 35227, 35229. |
| 30 | `avengers-vs-x-men` | overlap | 74 candidates, 36 comparisons, 1 non-`none`: `heroic-age-avengers` partial, shared 17, ids 35232, 40405, 35241, 40706, 40738, 40737, 40410, 40406, 40705, 40709, 40740, 40404, 40409, 40739, 40741, 40736, 40400. |
| 33 | `age-of-ultron` | overlap | 25 candidates, 36 comparisons, 2 non-`none`: `heroic-age-avengers` partial, shared 1, id 39852 (Avengers (2010) #12.1); `spider-man-best-of` partial, shared 1, id 46478 (Superior Spider-Man (2013) #6). The duplicate issue numbers in this mapping are handled by explicit `candidateIssueId` values, not by guessing: source positions 19 and 20 both normalize to series 17318 issue `10` and are separated by `candidateIssueId` 45908 and 47072, and source position 5 (`Fantastic Four #5AU`) is separated by `candidateIssueId` 47073. |
| 34 | `infinity` | exact resolution | 81 rows, 2 unmatched and 1 ambiguous. Unmatched: source positions 12 and 13, `Infinity: Against the Tide #1` and `#2`. Ambiguous: source position 60, `Thanos: A God Up There Infinite Comic`, 6 candidates (50906, 50904, 50903, 50902, 50901, 50900). |
| 35 | `original-sin` | overlap | 56 candidates, 36 comparisons, 3 non-`none`: `hickman-full` partial, shared 6, ids 48383 to 48388; `hickman-minimal` partial, same 6; `spider-verse` partial, shared 2, ids 45803 and 45804. |
| 36 | `death-of-wolverine` | source boundary | 50 rows, 1 ambiguous: source position 50, the open range `Wolverines #1 to present`, 20 candidates. |
| 39 | `black-vortex` | source retrieval | Independent retrieval of the exact inventory URL returns HTTP 404 on 2026-08-21. Mapping holds 0 rows, `approvedSourceCount: null`, `reviewStatus: blocked-source-unavailable`. |
| 43 | `avengers-standoff` | overlap | 26 candidates, 36 comparisons, 1 non-`none`: `all-new-all-different-avengers` partial, shared 2, ids 56219 and 56220. |
| 45 | `civil-war-ii` | exact resolution | 154 rows, 9 unmatched: source positions 11 to 16 (`Civil War II: Ulysses Infinite Comic #1` to `#6`), 22 (`Civil War II: Gods of War #1`), 61 (`Civil War II: X-Men #1`), 113 (`Civil War II: The Accused #1`). |

Source retrieval count check: independently fetching all 22 candidate source URLs on 2026-08-21
returned HTTP 200 for 21 and HTTP 404 for 1 (`black-vortex`). That matches the changes record.

## 2. Source fidelity per final guide

Each guide's exact `sourcePage` from its mapping was retrieved directly on 2026-08-21 and treated as
data. Issue-bearing references in the issue-by-issue order were counted by hand from the retrieved
markup, ranges expanded to one row per issue, and the resulting sequence compared position by
position against the mapping rows. Editorial commentary, trade or collected-edition blocks,
prologue and fill-in blocks, "Previous" and "Next" links, and comment threads were excluded.

Every mapping `sourceUrl` equals its inventory `url` and its manifest `sourcePage`.

| Guide | Derived source rows | Mapping rows | Exact-order match | Notes on the reading |
|---|---:|---:|---|---|
| `secret-war` | 5 | 5 | 5 of 5 | Essay-style page; the five references are the headings `Secret War: Issue #1` through `Issue #5`. |
| `spider-man-the-other` | 12 | 12 | 12 of 12 | Only the block under the `theother` anchor was read. 4 Friendly Neighborhood, 4 Marvel Knights, 4 Amazing, alternating. The page itself links the first reference to Marvel series 877, which is the series the mapping uses. |
| `world-war-hulk-aftersmash` | 26 | 26 | 26 of 26 | The first line of the list paragraph, `World War Hulk Aftersmash`, is a sibling of the rest inside one paragraph separated by line breaks, so it is a reference and not a caption. |
| `shadowland` | 29 | 29 | 29 of 29 | Only the "Daredevil Shadowland Issue by Issue Reading Order" block. The collected-edition block above it names Daredevil #512 and Shadowland: Bullseye, which the issue-by-issue order omits; the mapping correctly follows the issue-by-issue order. |
| `chaos-war` | 19 | 19 | 19 of 19 | Only the "Issue by Issue Chaos War Reading List" block; the trade block above it was excluded. |
| `axis` | 55 | 55 | 54 of 55 literal, 55 of 55 after the source typo | Both the "March to Axis" and "Avengers & X-Men Axis" blocks. `Captain America #22 - #24` expanded to 3. The only divergence is source position 44, where the page prints `Loki: Agent of Axis #8`; the mapping quotes that verbatim and normalizes the series (F-004). |
| `spider-verse` | 35 | 35 | 35 of 35 | Both the "Prelude to Spider-Verse" block (13 references, including `Amazing Spider-Man #4 - #6` expanded to 3) and the "Spider-Verse Reading Order" block (22 references). |
| `apocalypse-wars` | 13 | 13 | 13 of 13 | Only the "Apocalypse Wars Issue by Issue Reading Order" block; the trade block was excluded. |
| `clone-conspiracy` | 24 | 24 | 24 of 24 | Three sub-blocks under the reading order (4 + 14 + 6). The two narrative sub-headings inside the reading order are not collected-edition groups and are correctly flattened into one sequence with no `##` grouping proposed. |
| `inhumans-vs-x-men` | 20 | 20 | 20 of 20 | Only the "Inhumans vs. X-Men Comic Book Reading Order" block. The prologue block above it and the closing prose line about the Medusa and Black Bolt backup were excluded. |

Total derived source rows: 238. Total mapping rows: 238.

## 3. Exact resolution: every row is one real Marvel issue

Two independent passes, both repeated after the fixes.

Pass one, re-derivation. In the first pass a patched copy of the preparation script writing to a
scratch directory was used, because the committed script did not select. On the current tree the
recorded command does the whole job: `npm run cbh:prepare` was run against the live metadata API,
exited 0, and rewrote all 22 mappings in place. Every one of the 22 files is byte-identical to the
committed packet by SHA-256, and `git diff -- scripts/data/cbh-mappings` reports no change, so the
committed rows, candidate lists, series ids, notes, resolved titles, issue URLs, `sourceUrl`,
`sourceRetrievedAt`, `sourceRetrievalStatus`, `approvedSourceCount`, `reviewStatus`, and selections
are all reproducible from one command. Guide totals from that run: 0 unmatched and 0 ambiguous for
all ten final guides, and the same run reproduced the blocked candidates' failures listed in
section 1.

Pass two, live issue verification. All 238 selected issue ids were fetched individually from
`/issues/{id}` again after the fixes. For each row the API title equals the mapping
`resolvedIssueTitle`, the API `detailUrl` equals the mapping `marvelIssueUrl` and begins with
`https://www.marvel.com/comics/issue/{id}/`, the API `seriesId` equals the mapping `seriesId`, and
the API `issueNumber` equals the mapping `issueNumber`. Result: 238 checked, 0 problems, 0 missing.

Row status totals across the packet: 238 `exact`, 0 `ambiguous`, 0 `unmatched`, 0
`approved-exception`. `validateResolvedMapping` passes for all ten, and `resolveMapping` from the
repository resolver passes for all ten and leaves each issue sequence unchanged.

No final guide uses a manual `candidateIssueId`; the only mapping that does is the blocked
`age-of-ultron`, at source positions 5, 19, and 20. Every final row has a real series id and a
non-empty note: 238 of 238 on both counts.

After the F-003 fix, 36 of the 238 final rows resolve through the guarded path where Marvel's own
series name differs from the source's, namely world-war-hulk-aftersmash 7, shadowland 1,
spider-verse 12, clone-conspiracy 9, and inhumans-vs-x-men 7. Each of those differences is one of
the upstream naming quirks checked individually below, and each row's series id was confirmed
against the live API in this pass. F-008 records what that guard does and does not prove.

### Naming differences and manually reasoned rows, checked individually

* `Incredible Hercules #112` (world-war-hulk-aftersmash source position 5) resolves to issue 17212,
  `Hulk (1999) #112`, series 465. Verified: Marvel series 3762 `Incredible Hercules (2008 - 2010)`
  holds 29 issues numbered 113 to 141 and contains no #112. Issue 17212 went on sale 2007-12-19,
  immediately before `Incredible Hercules (2008) #113` (issue 23067, on sale 2008-01-16), and shares
  creators with it (Fred Van Lente writer, Khoi Pham penciler, Stephane Peru colorist, Arthur Adams).
  The row note records the substitution.
* `World War Hulk Aftersmash` with no `#1` resolves to issue 17231 in series 3020,
  `WORLD WAR HULK: AFTERSMASH 1 (2007)`, which holds exactly one issue, numbered 1, on sale
  2007-12-05.
* `Planet Skaar Prologue` with no `#1` resolves to issue 24268 in series 7461,
  `PLANET SKAAR PROLOGUE 1 (2009)`, which holds exactly one issue, on sale 2009-05-20.
* `What If .. Featuring Planet Hulk` with no `#1` resolves to issue 20812 in series 3915,
  `What If? Planet Hulk (2007)`, which holds exactly one issue, on sale 2007-10-24.
* `Shadowland: After the Fall #1` resolves to issue 37059 in series 13252,
  `SHADOWLAND: AFTER THE FALL 1 (2010)`, one issue, on sale 2010-12-08.
* `World War Hulk: Damage Control #1-3` resolve into series 3422, indexed upstream as
  `Wwh Aftersmash: Damage Control (2008)`; the series holds exactly issues 1, 2, 3.
* `Inhumans vs. X-Men #0` resolves to issue 61593, indexed upstream as `Ivx (2016)` in series 22644
  `Ivx (2016 - 2017)`, which holds exactly issues 0 through 6, matching the 7 core rows.
* `Amazing Spider-Man` resolves to two different upstream series with a `The` prefix: 17285
  `The Amazing Spider-Man (2014 - 2015)` for spider-verse and 20432
  `The Amazing Spider-Man (2017 - 2018)` for clone-conspiracy. Both were checked for issue-number
  collisions: series 17285 carries point issues 1.1 through 1.6 and 16.1 through 20.1 alongside the
  whole numbers, and series 20432 carries 1.1 through 1.6, so no whole-number reference is ambiguous.
  Clone Conspiracy rows #16 to #24 in series 20432 have on-sale dates from 2016-08-10 to 2017-02-22,
  which matches the event.
* Age of Ultron's duplicate issue numbers are blocked evidence, covered in section 1.

## 4. Overlap reports

Each committed report was recomputed from scratch using `buildComparisonReport` from
`scripts/lib/cbh-overlap.mjs`, the 26 shipped orders read from `src/data/curated-lists.json` and
their generated payloads, and the other 9 final mappings as peers.

| Guide | candidateCount | mapping rows | comparisonCount | Comparison set | Relationships | Recomputed report equals committed |
|---|---:|---:|---:|---|---|---|
| `secret-war` | 5 | 5 | 35 | 26 shipped + 9 peers, each exactly once | 35 `none` | yes |
| `spider-man-the-other` | 12 | 12 | 35 | same | 35 `none` | yes |
| `world-war-hulk-aftersmash` | 26 | 26 | 35 | same | 35 `none` | yes |
| `shadowland` | 29 | 29 | 35 | same | 35 `none` | yes |
| `chaos-war` | 19 | 19 | 35 | same | 35 `none` | yes |
| `axis` | 55 | 55 | 35 | same | 35 `none` | yes |
| `spider-verse` | 35 | 35 | 35 | same | 35 `none` | yes |
| `apocalypse-wars` | 13 | 13 | 35 | same | 35 `none` | yes |
| `clone-conspiracy` | 24 | 24 | 35 | same | 35 `none` | yes |
| `inhumans-vs-x-men` | 20 | 20 | 35 | same | 35 `none` | yes |

Across the ten reports: 350 comparisons, 350 `none`, 0 shared issue ids. The comparison id list in
each report equals the sorted union of the 26 shipped order ids and the 9 peer ids, with no
duplicate and no omission. Every shipped payload was checked for internal duplicate ids and for
agreement with its manifest `expect`; no warning was raised.

No final guide contains a duplicate id inside its own selected sequence, and the 238 selected ids
across the whole packet are 238 distinct values. Exact, subset, and partial relationships were all
exercised by the recomputation path; none was produced.

## 5. Manifest field verification

All 10 proposals were checked against the schema the repository actually enforces, not against the
plan prose. Result: 0 findings.

* `id` equals the mapping id, collides with no shipped catalog id and no peer.
* `sourcePage` equals the mapping `sourceUrl` and the inventory `url` in all ten, and collides with
  no shipped `sourcePage`.
* `out` follows `<id with underscores>.json`, collides with no shipped `out`, and no such file exists
  under `src/data/`.
* `sourceFile` follows `<id>.md`, collides with no shipped `sourceFile`, and `src/data/orders/` does
  not exist yet, so nothing is overwritten.
* `type` is `event` for all ten, which is in the application's `LIST_TYPES`.
* `depth` is `complete` for all ten, which is in `READING_DEPTHS`. `full` from the plan prose is not.
* `beginner` is `false` for all ten. `group`, `groupName`, and `variant` are `null` for all ten.
* `expect` equals both the mapping row count and `approvedSourceCount` for all ten.
* `sourceOrigin` is byte-for-byte `Compiled for this project from Comic Book Herald's guide` in all
  ten. `sourceLicense` is `null` in all ten.
* `characters` and `keywords` are non-empty in all ten. No en dash or em dash appears in any
  proposal, in any mapping, in any overlap report, in `scripts/prepare-cbh-batch.mjs`, or in the
  added lines of the tracked diff against `origin/main`.

### Timelines and covers, derived from objective issue metadata

`timeline` was checked against the on-sale dates the API returns for that guide's own selected
issues, not against recollection. In every case `timeline` equals the earliest on-sale year in the
guide and lies inside the guide's on-sale span.

| Guide | timeline | On-sale span of selected issues | First row on-sale | coverIssueId | Cover source position and reference | Cover inside mapping | Cover art in metadata |
|---|---:|---|---|---:|---|---|---|
| `secret-war` | 2004 | 2004 to 2005 | 2004-04-01 | 104 | 1, `Secret War #1` | yes | present |
| `spider-man-the-other` | 2005 | 2005 to 2006 | 2005-10-12 | 2453 | 1, `Friendly Neighborhood Spider-Man #1` | yes | present |
| `world-war-hulk-aftersmash` | 2007 | 2007 to 2009 | 2007-12-05 | 17231 | 1, `World War Hulk Aftersmash` | yes | present |
| `shadowland` | 2010 | 2010 to 2010 | 2010-07-08 | 29703 | 1, `Shadowland #1` | yes | present |
| `chaos-war` | 2010 | 2010 to 2011 | 2010-09-01 | 34517 | 1, `Chaos War #1` | yes | present |
| `axis` | 2014 | 2014 to 2014 | 2014-09-10 | 50599 | 10, `Avengers & X-Men: Axis #1` | yes | present |
| `spider-verse` | 2014 | 2014 to 2015 | 2014-07-23 | 45808 | 14, `Amazing Spider-Man #9` | yes | present |
| `apocalypse-wars` | 2016 | 2016 to 2016 | 2016-03-16 | 55440 | 1, `Extraordinary X-Men #8` | yes | present |
| `clone-conspiracy` | 2016 | 2016 to 2017 | 2016-08-10 | 61713 | 5, `The Clone Conspiracy #1` | yes | present |
| `inhumans-vs-x-men` | 2016 | 2016 to 2017 | 2016-11-30 | 61594 | 2, `Inhumans vs. X-Men #1` | yes | present |

Every `coverIssueId` is the selected id of the row at its own `coverSourcePosition`, appears in that
guide's selected sequence, and returns a `cover` object with both a `path` and an `extension` from
the metadata API. That is the condition the vendoring step enforces before it will build a catalog
card, so no cover will fail at vendor time for want of art.

## 6. Spot checks: source position to mapping row to live API

First, middle, and final rows for every guide, plus every exception-adjacent or manually reasoned
row. All source positions and issue ids below were checked one at a time.

| Guide | Source position | Source reference | Mapping series and number | Issue id | API title | API on-sale |
|---|---:|---|---|---:|---|---|
| `secret-war` | 1 | Secret War #1 | 418 #1 | 104 | Secret War (2004) #1 | 2004-04-01 |
| `secret-war` | 3 | Secret War #3 | 418 #3 | 773 | Secret War (2004) #3 | 2004-10-01 |
| `secret-war` | 5 | Secret War #5 | 418 #5 | 2594 | Secret War (2004) #5 | 2005-12-01 |
| `spider-man-the-other` | 1 | Friendly Neighborhood Spider-Man #1 | 877 #1 | 2453 | Friendly Neighborhood Spider-Man (2005) #1 | 2005-10-12 |
| `spider-man-the-other` | 6 | Amazing Spider-Man #526 | 454 #526 | 3020 | Amazing Spider-Man (1999) #526 | 2005-11-23 |
| `spider-man-the-other` | 12 | Amazing Spider-Man #528 | 454 #528 | 3360 | Amazing Spider-Man (1999) #528 | 2006-01-25 |
| `world-war-hulk-aftersmash` | 1 | World War Hulk Aftersmash | 3020 #1 | 17231 | WORLD WAR HULK: AFTERSMASH 1 (2007) #1 | 2007-12-05 |
| `world-war-hulk-aftersmash` | 5 | Incredible Hercules #112 | 465 #112 | 17212 | Hulk (1999) #112 | 2007-12-19 |
| `world-war-hulk-aftersmash` | 9 | Hulk vs. Hercules: When Titans Collide #1 | 7078 #1 | 23911 | Hulk Vs. Hercules: When Titans Collide (2008) #1 | 2008-06-01 |
| `world-war-hulk-aftersmash` | 13 | World War Hulk: Warbound #4 | 3171 #4 | 23234 | World War Hulk: Warbound (2007) #4 | 2008-05-01 |
| `world-war-hulk-aftersmash` | 21 | Planet Skaar Prologue | 7461 #1 | 24268 | PLANET SKAAR PROLOGUE 1 (2009) #1 | 2009-05-20 |
| `world-war-hulk-aftersmash` | 26 | What If .. Featuring Planet Hulk | 3915 #1 | 20812 | What If? Planet Hulk (2007) #1 | 2007-10-24 |
| `shadowland` | 1 | Shadowland #1 | 9934 #1 | 29703 | Shadowland (2010) #1 | 2010-07-08 |
| `shadowland` | 15 | Shadowland: Moon Knight #2 | 11712 #2 | 34342 | Shadowland: Moon Knight (2010) #2 | 2010-09-22 |
| `shadowland` | 29 | Shadowland: After the Fall #1 | 13252 #1 | 37059 | SHADOWLAND: AFTER THE FALL 1 (2010) #1 | 2010-12-08 |
| `chaos-war` | 1 | Chaos War #1 | 11854 #1 | 34517 | Chaos War (2010) #1 | 2010-09-01 |
| `chaos-war` | 10 | Incredible Hulks #618 | 8842 #618 | 31236 | Incredible Hulks (2010) #618 | 2010-12-08 |
| `chaos-war` | 19 | Chaos War #5 | 11854 #5 | 36278 | Chaos War (2010) #5 | 2011-01-26 |
| `axis` | 1 | Magneto #9 | 18407 #9 | 48921 | Magneto (2014) #9 | 2014-09-10 |
| `axis` | 4 | Captain America #22 | 16516 #22 | 48589 | Captain America (2012) #22 | 2014-07-02 |
| `axis` | 28 | Axis: Carnage #2 | 19085 #2 | 51064 | Axis: Carnage (2014) #2 | 2014-11-19 |
| `axis` | 44 | Loki: Agent of Axis #8 | 18340 #8 | 51078 | Loki: Agent of Asgard (2014) #8 | 2014-11-19 |
| `axis` | 55 | Nova #25 | 16411 #25 | 51173 | Nova (2013) #25 | 2014-12-24 |
| `spider-verse` | 1 | Amazing Spider-Man #4 | 17285 #4 | 45803 | The Amazing Spider-Man (2014) #4 | 2014-07-23 |
| `spider-verse` | 18 | Scarlet Spiders #1 | 18889 #1 | 50537 | Scarlet Spiders (2014) #1 | 2014-11-26 |
| `spider-verse` | 35 | Amazing Spider-Man #15 | 17285 #15 | 51324 | The Amazing Spider-Man (2014) #15 | 2015-02-25 |
| `apocalypse-wars` | 1 | Extraordinary X-Men #8 | 20460 #8 | 55440 | Extraordinary X-Men (2015) #8 | 2016-03-16 |
| `apocalypse-wars` | 7 | Uncanny X-Men #8 | 20612 #8 | 56056 | Uncanny X-Men (2016) #8 | 2016-06-15 |
| `apocalypse-wars` | 13 | Uncanny X-Men #10 | 20612 #10 | 56058 | Uncanny X-Men (2016) #10 | 2016-07-20 |
| `clone-conspiracy` | 1 | Amazing Spider-Man #16 | 20432 #16 | 55314 | The Amazing Spider-Man (2017) #16 | 2016-08-10 |
| `clone-conspiracy` | 12 | Silk #15 | 20499 #15 | 55654 | Silk (2015) #15 | 2016-12-14 |
| `clone-conspiracy` | 16 | Prowler #1 | 22535 #1 | 61302 | Prowler (2016) #1 | 2016-10-26 |
| `clone-conspiracy` | 19 | Prowler #4 | 22535 #4 | 61307 | Prowler (2016) #4 | 2017-01-25 |
| `clone-conspiracy` | 24 | The Clone Conspiracy: Omega #1 | 23028 #1 | 62649 | The Clone Conspiracy: Omega (2017) #1 | 2017-03-01 |
| `inhumans-vs-x-men` | 1 | Inhumans vs. X-Men #0 | 22644 #0 | 61593 | Ivx (2016) | 2016-11-30 |
| `inhumans-vs-x-men` | 10 | Extraordinary X-Men #18 | 20460 #18 | 55450 | Extraordinary X-Men (2015) #18 | 2017-01-25 |
| `inhumans-vs-x-men` | 20 | Uncanny Inhumans #20 | 19780 #20 | 61110 | Uncanny Inhumans (2015) #20 | 2017-03-22 |

The `clone-conspiracy` Prowler rows are exception-adjacent: the source page moves Prowler #1 to #3
out of publication order into one block after The Clone Conspiracy #3, and places #4 after #5 of the
event. The mapping follows the source's stated placement, positions 16 to 19 and 23, not publication
order, which is the correct treatment of an editorial ordering decision.

## 7. Duplicate prevention

| Axis | Result |
|---|---|
| Batch id against shipped catalog ids | 0 collisions. The 26 shipped ids were compared against all ten. |
| Batch id against peers | 10 distinct ids. |
| Exact source URL against shipped `sourcePage` | 0 collisions. Seven shipped orders share one Comic Book Herald Avengers guide URL; none of the ten uses it. |
| Exact source URL against peers | 10 distinct URLs. |
| Proposed catalog output `out` against shipped `out` and against peers | 0 collisions, and no such file exists under `src/data/`. |
| Proposed `sourceFile` against shipped `sourceFile` | 0 collisions. |
| Exact selected issue sequence against every shipped order and every peer | 0 duplicate sequences. `buildComparisonReport` also raises on a duplicate sequence and did not raise on any of the 350 comparisons. |
| Semantic duplication | Every one of the 350 comparisons is `none` with 0 shared issue ids, so no proposed guide covers any issue any shipped order or peer covers. No proposed name matches a shipped name. Title similarity was used only as a prompt: `secret-war` against shipped `secret-invasion` and `civil-war`, and `spider-verse` and `clone-conspiracy` against shipped `spider-man-best-of`, were each checked and share no issue. |

## 8. Recomputed packet totals

Every figure below was recomputed from the files, not read from the changes record. All agree with
the changes record.

| Total | Recomputed value |
|---|---:|
| Inventory records | 86 |
| Inventory records at positions 1 to 47 | 47 |
| `new-order` records overall | 48 |
| `new-order` records at positions 1 to 47 | 22 |
| `deliveryStatus` totals | 36 `pending`, 12 `blocked`, 38 `not-applicable` |
| Guide-type totals | 42 event, 14 era, 14 sub-guide, 10 bridge, 3 fast-track, 3 commerce |
| Candidates evaluated in this batch | 22 |
| Final packet guides | 10 |
| Blocked candidates | 12 (5 from the frozen initial ten, 7 later) |
| Mapping files present | 22 |
| Overlap reports present | 16 (10 final, 6 blocked on overlap) |
| Final packet source rows | 238 |
| Final rows resolved `exact` | 238 |
| Final rows ambiguous, unmatched, or approved-exception | 0 |
| Distinct selected issue ids across the packet | 238 of 238 |
| Per-guide row counts | secret-war 5, spider-man-the-other 12, world-war-hulk-aftersmash 26, shadowland 29, chaos-war 19, axis 55, spider-verse 35, apocalypse-wars 13, clone-conspiracy 24, inhumans-vs-x-men 20 |
| Shipped orders compared against | 26 |
| Comparisons per final report | 35 (26 shipped + 9 peers) |
| Total final comparisons | 350 |
| Final comparisons with relationship `none` | 350 |
| Total shared issue ids across final comparisons | 0 |
| Blocked-report comparisons | 216 (6 reports of 36) |
| Non-`none` rows in blocked reports | 10 |
| Source pages retrieved HTTP 200 | 21 of 22 |
| Source pages returning HTTP 404 | 1 (`black-vortex`) |
| Mappings reproduced byte-identically by `npm run cbh:prepare` | 22 of 22 |
| Mappings written fully selected `exact` by that one command | 16 |
| Mappings left unresolved with their blockers intact | 6 |

## 9. Second-pass verification of the fixes

Everything in this section was run on the current tree, after the fixes, and every figure is
recomputed from the output rather than carried forward.

| Check | Result |
|---|---|
| `npm run cbh:prepare` | Exit 0. 22 mappings written; 22 of 22 byte-identical to the committed packet by SHA-256; `git diff -- scripts/data/cbh-mappings` empty. |
| Mappings fully selected | 16 of 22, every row `exact` with a selected id. |
| Mappings left unresolved | 6: `black-vortex`, `civil-war-ii`, `death-of-wolverine`, `decimation`, `fall-of-the-hulks`, `infinity`. |
| Final packet rows | 238, all `exact`, 0 ambiguous, 0 unmatched, 0 approved-exception, 238 distinct selected ids. |
| Overlap reports rebuilt from scratch | 10 of 10 equal the committed report exactly; 35 comparisons each, 35 distinct compared ids each, 350 total, 350 `none`, 0 shared ids. |
| Duplicate prevention recomputed | 0 collisions on id, `sourcePage`, `out`, and `sourceFile` against the 26 shipped orders; 10 distinct ids, source pages, output files, and selected sequences inside the batch. |
| Manifest field conformance recomputed | 0 problems across the 10 proposals, covering id, type, depth, beginner, group, `sourceOrigin`, `sourceLicense`, `sourcePage`, `out`, `sourceFile`, characters, keywords, and cover position agreement. |
| Inventory URLs | Each guide's inventory `url`, mapping `sourceUrl`, and manifest `sourcePage` are the same string, 10 of 10. |
| Timelines and covers | Unchanged. Every `timeline` still equals the earliest on-sale year among that guide's own selected issues and lies inside its span, 10 of 10. Every `coverIssueId` is still the selected id of the row at its `coverSourcePosition` and still returns cover art with both a path and an extension, 10 of 10. |
| Spot checks | All 37 rows of the section 6 table were re-parsed from this file and re-checked against the current mappings and the live API: source reference, series id, issue number, issue id, API title, and on-sale date. 0 problems. |
| Source reference containment | Each of the 238 rows was searched for in its own freshly retrieved page. 185 appear verbatim. The 53 that do not are all rows whose reference was expanded from a printed range, or from a page that prints issue numbers without a hash, and each was inspected directly: Secret War prints `Secret War: Issue #1` to `#5`, Spider-Man The Other prints `Friendly Neighborhood Spider-Man 1`, Aftersmash prints `World War Hulk - Damage Control 1`, Axis prints `Captain America #22 - #24` and `Avengers & X-Men Axis #1`, Spider-Verse prints `Amazing Spider-Man #4 - #6`, Clone Conspiracy prints `Amazing Spider-Man #16-#19`. No invented reference was found. |
| Inventory lifecycle | `validateInventory` accepts the maintained inventory: 86 records, guide types 42 event, 14 era, 14 sub-guide, 10 bridge, 3 fast-track, 3 commerce; delivery statuses 36 `pending`, 12 `blocked`, 38 `not-applicable`; all 12 blocked reasons begin `Blocked:`; overlap ids populated on positions 14, 28, 30, 33, 35, and 43 and catalog ids populated nowhere. |
| Guard negative proof | 11 mutations of the real inventory, 11 rejected with a named error, unmutated inventory accepted. |
| Queue derivation | The first ten `pending` `new-order` records in ascending position are still exactly the proposed packet in the proposed order, closing at position 47. |

## Gate Results

| Gate | Result |
|---|---|
| `npm run lint` | Pass. eslint exited 0 with no output. |
| `npm test` | Pass: 1234 tests, 1234 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo. |
| Focused MRT-004 suite | Pass: 18 tests, 18 pass, 0 fail, across `test/cbh-modern-inventory.test.js` (3), `test/cbh-resolver.test.js` (10), and `test/order-overlap-report.test.js` (5). |
| Focused suite without the fixes | Fails, as required. With `scripts/lib/cbh-inventory.mjs` and `scripts/lib/cbh-resolution.mjs` stashed back to HEAD, the inventory and resolver files give 13 tests, 10 pass, 3 fail, naming the lifecycle test and both new resolver tests. Restoring them returns 13 of 13, with both file hashes unchanged. |
| `npm run anchors` | Pass: 986 unchanged, 0 drifted, 0 new, 0 removed, exit 0, 2 citations exempt by declared absence marker. The exempt count did not move. |
| `npm run cbh:prepare` | Pass, exit 0, 22 of 22 mappings reproduced byte-identically. |
| Overlap recomputation | Pass, all ten reports reproduced exactly. |
| Live issue verification | Pass, 238 of 238, 0 problems. |
| Em dash and en dash scan | 0 in the added lines of the tracked diff against `origin/main`, written to a file and read back rather than piped, and 0 across the 22 mappings, the 16 overlap reports, the preparation script, and the inventory. |

`npm run counts`, `npm run sizes`, `npm run palette`, `npm run publication`, `npm run contract`, and
`npm run browser` were not run. The packet adds no Markdown, no manifest entry, and no generated
data yet, so none of them has anything from this packet to inspect. They belong to P02-T02.

## Limitations

* The ten source pages and the twelve blocked source URLs were retrieved on 2026-08-21 through
  `curl.exe` with a browser user agent. Node's `fetch` was refused with HTTP 403 by the host for
  every URL, so retrieval could not use the runtime the repository's own tooling uses. Content was
  handled as inert data either way.
* Issue identity was verified against the live third-party metadata service the repository's
  build-time tooling already uses. There is no offline snapshot of these ids in the repository to
  check against, so a later change upstream could invalidate a row without anything here noticing.
  `npm run contract` before release remains the guard for that.
* The count of issue-bearing references is my own reading of the retrieved markup. It was performed
  before comparing to the mapping, but it is a human reading of editorial prose and not a mechanical
  extraction, and the plan forbids automated extraction from the source HTML.
* Semantic duplication was assessed by name, source URL, catalog id, output filename, and exact
  issue-set intersection. No deeper editorial equivalence test exists in this repository.
* Cover suitability was verified only as far as the vendoring step checks it: the named issue is
  inside the order and carries cover art in the metadata. Whether each cover is the best card art
  for its guide is an editorial judgment this review does not make.
* The blocked candidates' mappings were verified for the specific evidence recorded against them.
  Their full source-order fidelity was not re-derived line by line from their source pages, because
  none of them is authorable in this batch.
* No production Markdown exists yet, so nothing was checked about heading structure, generated
  payloads, catalog rendering, or reader launch behavior.
* The source-order fidelity table in section 2 was derived by hand on the first pass and was not
  re-derived line by line on the second. The re-review checked instead that the row counts are
  unchanged, that all 238 references still appear in their own freshly retrieved page or are
  explained by an inspected range or hash-free numbering, and that the 37 spot-checked references
  still match verbatim. The fixes touched candidate metadata, notes, and resolver logic, not the
  source rows, and the mappings reproduce byte for byte, which is what makes that proportionate.

## Outcome

* Outcome: Approved
* Severity summary as first recorded: 1 blocker, 2 low, 4 informational, plus 1 informational raised
  by the re-review
* Disposition summary: F-001 closed and verified, F-002 closed and verified, F-003 closed with a
  residual carried as F-008, F-004 closed and verified, F-005 accepted as review-only and recorded
  above as a binding authoring exclusion, F-006 and F-007 accepted as documented reconciliations,
  F-008 open, routed, and not blocking
* Blocking gate: none. `npm run lint` exits 0, `npm test` is 1234 of 1234, and `npm run anchors`
  reports 986 unchanged with 0 drifted, 0 new, and 0 removed at exit 0.
* The packet is verified conformant and needs no rework before authoring.

## Next Steps

1. Move the ten records to `ready` and begin P02-T02.
2. When the manifest entries are authored, drop `coverSourcePosition` and `coverSourceReference`.
   They are proposal keys, and no shipped entry in `src/data/curated-lists.json` has either (F-005).
3. Keep the independent live check in the loop for any future batch, since the preparation script
   sets its own reviewed-mismatch flag (F-008). If that check is ever dropped, require a person to
   assert the flag instead.
4. Leave the plan's `depth: full` prose and the Aftersmash `bridge` guide type as they are. Both are
   reconciled in the changes record, and correcting the frozen text is not worth a change of its own
   (F-006, F-007).
