# MRT-004 wider research

## 1) Source to catalog workflow

- `src/data/curated-lists.json` is the manifest contract. Each list needs `id`, `name`, `out`, one origin field (`sourceUrl` or `sourceFile`), `sourceOrigin`, `type`, `depth`, and optional `group`, `groupName`, `variant`, `timeline`, `expect`, `sourcePage`, `characters`, `keywords`, `coverIssueId`, `beginner`, and `paths` for path records. Validation is shape based, not enumeration based (`src/js/lib/curated.js:3-15`, `src/js/lib/curated.js:23-26`, `src/js/lib/curated.js:39-143`, `src/js/lib/curated.js:146-205`, `src/js/lib/curated.js:207-248`).
- Checklist syntax is `- [ ] [Title](https://www.marvel.com/comics/issue/<id>/...)` or plain bullets, plus `##` headings for collected editions. `#` is the order title and closes any open section. Unresolved lines become placeholder items, not silent drops (`src/js/lib/markdown.js:2-11`, `src/js/lib/markdown.js:70-148`, `src/js/lib/markdown.js:175-184`).
- `scripts/vendor-orders.mjs` loads the manifest, reads each checklist from `sourceUrl` or `sourceFile`, parses it, resolves issue metadata, and writes pinned JSON with `generatedAt`, `apiBase`, `count`, `collections`, `placeholders`, `unresolved`, and `items`. Skipped lists during `--only` are rehydrated from the committed JSON so the catalog stays complete (`scripts/vendor-orders.mjs:36-45`, `scripts/vendor-orders.mjs:55-59`, `scripts/vendor-orders.mjs:194-360`).
- `count` is derived from the generated items; `expect` is only a warning threshold in the vendor run. `catalog.json` is rebuilt from the generated payloads plus copied `paths` from the manifest (`scripts/vendor-orders.mjs:327-368`).
- `parseCatalog` normalizes the generated catalog, drops unusable rows, sorts by `timeline` with undated entries last, and preserves raw `paths`. `groupCatalog`, `defaultPath`, `pickPath`, and `pathPlacements` are the runtime support for variant grouping and named reading paths (`src/js/lib/catalog.js:126-224`, `src/js/lib/catalog.js:265-309`, `src/js/lib/catalog.js:412-472`, `src/js/lib/catalog.js:482-541`).
- Current path support is real and serialized: `curated-lists.json` and `catalog.json` both carry the `modern-avengers` path, a 10-stop route with seven Comic Book Herald Avengers-guide stops and three stops placed by start year (`src/data/curated-lists.json:1289-1307`, `src/data/catalog.json:1533-1551`).

## 2) Ship inventory and overlap

### Exact-overlap families

| family | ids | type / timeline | source | count(s) | overlap note |
|---|---|---|---|---|---|
| Hickman / Secret Wars | `hickman-minimal`, `hickman-full` | creator-run, 2012 | `emreparker/marvel-comics` mirror pages (`src/data/curated-lists.json:1-76`) | 89 / 219 | exact variant pair, 89 shared issues |
| House of M | `house-of-m`, `house-of-m-essential` | event, 2005 | Marvel metadata (`src/data/curated-lists.json:149-225`) | 20 / 8 | exact variant pair, 8 shared issues |
| Civil War | `civil-war`, `civil-war-essential`, `civil-war-avengers` | event, 2006 | Marvel metadata plus CBH Avengers guide page (`src/data/curated-lists.json:227-304`, `src/data/curated-lists.json:805-841`) | 31 / 7 / 83 | `civil-war-essential` is an exact subset of both other Civil War paths; `civil-war` and `civil-war-avengers` also partially overlap (11 shared) |
| Secret Invasion | `secret-invasion`, `secret-invasion-essential` | event, 2008 | Marvel metadata (`src/data/curated-lists.json:342-423`) | 36 / 8 | exact variant pair, 8 shared issues |

### Thematic-only or partial overlap

| family | ids | type / timeline | source | count(s) | overlap note |
|---|---|---|---|---|---|
| Avengers shelf | `essential-avengers`, `avengers-disassembled`, `dark-reign-avengers`, `heroic-age-avengers`, `all-new-all-different-avengers`, `marvel-fresh-start-avengers` | era / event, 1963 to 2018 | Comic Book Herald Avengers guide page (`src/data/curated-lists.json:738-979`) | 120 / 5 / 75 / 92 / 92 / 59 | modern Avengers continuity spine. `scarlet-witch-best-of` overlaps with four of these, but the others are thematic only in this snapshot |
| CBH character guides | `captain-america-best-of`, `doctor-doom-primer`, `spider-man-best-of`, `thor-best-of`, `scarlet-witch-best-of` | character-run, timeline null | Comic Book Herald guide pages (`src/data/curated-lists.json:552-735`) | 114 / 104 / 230 / 131 / 73 | thematic only. `doctor-doom-primer` shares 9 issues with both Hickman orders; `scarlet-witch-best-of` shares 3, 9, 5, and 10 issues with `essential-avengers`, `dark-reign-avengers`, `all-new-all-different-avengers`, and `marvel-fresh-start-avengers` respectively |
| Standalone events | `annihilation`, `king-in-black` | event, 2006 / 2020 | Marvel metadata (`src/data/curated-lists.json:306-462`) | 25 / 38 | thematic only in this set. No direct issue overlap found with the modern Avengers/CBH rows above |

### Boundary notes

- `new-ultimate-universe` / `new-ultimate-universe-trades` are shipped, but they are Earth-6160, not Earth-616. They do overlap exactly on 132 issues, but that makes them an adjacent continuity pair, not a modern Earth-616 candidate (`src/data/curated-lists.json:78-146`).
- `xmen-claremont` / `xmen-claremont-complete` are shipped but are older Claremont continuity, not modern Earth-616. Their 316 shared issues are an exact variant overlap, but outside this task's continuity focus (`src/data/curated-lists.json:464-549`).
- In backlog terms, `BL-099` is the provenance/licence split that produced the current `sourceOrigin` and `sourceLicense` contract, and `BL-142` is the shipped CBH-guide batch behind the Avengers family and the other guide-derived rows in this matrix.

## 3) Validation owners and commands

| area | current owner | command(s) | evidence / gap |
|---|---|---|---|
| Authoring the curated manifest and orders | `scripts/vendor-orders.mjs`, `src/js/lib/curated.js`, `src/js/lib/markdown.js` | `npm run vendor`, `npm test` | manifest shape, checklist syntax, unresolved placeholders, and source-or-file exclusivity are validated (`README.md:612-673`, `src/js/lib/curated.js:39-143`, `src/js/lib/markdown.js:70-148`) |
| Generated-data parity | `scripts/vendor-orders.mjs`, `test/curated.test.js`, `test/catalog.test.js`, `test/reading-path.test.js` | `npm run vendor`, `npm test` | manifest vs catalog vs pinned JSON parity is checked, including counts, origins, sourceLicense, group metadata, and the shipped path (`test/curated.test.js:135-185`, `test/catalog.test.js:96-125`, `test/catalog.test.js:641-754`, `test/reading-path.test.js:192-248`) |
| Schema and normalization | `src/js/lib/curated.js`, `src/js/lib/catalog.js` | `npm test` | shapes are rejected or normalized rather than inferred, including `sourcePage`, `timeline`, `collections`, `coverIssueId`, and safe filenames (`src/js/lib/curated.js:39-143`, `src/js/lib/catalog.js:109-224`) |
| Provenance | `docs/DATA_PROVENANCE.md`, `src/js/lib/catalog.js`, `test/curated.test.js`, `test/catalog.test.js` | `npm test` | provenance is a credit question, not a licence question, and the catalog renders `sourceOrigin` first (`docs/DATA_PROVENANCE.md:81-123`, `docs/DATA_PROVENANCE.md:280-339`, `docs/DATA_PROVENANCE.md:351-384`, `src/js/lib/catalog.js:61-90`) |
| Counts | `scripts/check-counts.mjs`, `test/check-counts.test.js` | `npm run counts`, `npm test` | backlog prose counts are recomputed from the ranked table and compared back to the text (`scripts/check-counts.mjs:1-23`, `scripts/check-counts.mjs:128-179`, `test/check-counts.test.js:84-136`) |
| Catalog grouping and order | `src/js/lib/catalog.js`, `test/catalog.test.js` | `npm test` | groups, path placement, default path, and variant ordering are all asserted (`src/js/lib/catalog.js:177-224`, `src/js/lib/catalog.js:412-541`, `src/js/lib/catalog.js:544-608`, `test/catalog.test.js:377-519`, `test/catalog.test.js:536-878`) |
| Browser behavior | `scripts/browser-check.mjs` | `npm run browser`, `npm run browser:prove` | real-Edge regression check is out-of-band from `node --test` and not in CI (`README.md:500-520`, `README.md:522-529`, `scripts/browser-check.mjs:1-26`, `scripts/browser-check.mjs:99-260`) |

Missing semantic checks worth noting:

- `vendor-orders.mjs` only warns when `count !== expect`; it does not fail the vendor run. The parity tests catch drift later, if they are run (`scripts/vendor-orders.mjs:327-368`).
- `sourceOrigin` prose is validated only for presence, not for truth. The same is true for the `modern-avengers` path sentence that says seven stops follow CBH and three are start-year placements (`src/js/lib/curated.js:67-73`, `src/js/lib/curated.js:119-120`, `src/data/curated-lists.json:1289-1307`).
- There is no automated check for the exact CBH permission wording. The repository records it manually in the provenance doc.

## 4) Comic Book Herald permission and attribution

The recorded answer is narrow:

- CBH was asked whether more orders could be built from its guides, credited and linked back as the twelve already are, and whether the site would treat the app as a companion for Marvel Unlimited readers (`docs/DATA_PROVENANCE.md:303-305`).
- The reply said it has no problem with continued credit for reading order work and thanked the author for asking (`docs/DATA_PROVENANCE.md:309-325`).
- The doc interprets that as yes to the exact credit-and-link pattern already in use on the twelve CBH guides, and no to rewriting them, but not as a broader licence over Marvel material or CBH editorial work (`docs/DATA_PROVENANCE.md:322-325`).
- The concrete conditions are: credit the site on the card of every list built from it, and link that card back to the exact order page the list follows. The nearby Marvel Master Reading Order and Patreon exclusions belong to a different source and do not constrain this Comic Book Herald task (`docs/DATA_PROVENANCE.md:328-345`).

No extra user clarification is needed for that exact credit-and-link pattern. Broader reuse would need a separate answer.

## 5) Batch sizing and gap assessment

- Small current ship units are genuinely small: `avengers-disassembled` is 5 issues, `civil-war-essential` and `house-of-m-essential` are 7 to 8 issues, and `secret-invasion-essential` is 8 issues. Their generated JSON files are in the roughly 6 to 8.5 KB range, with source checklists around 1 KB.
- Mid-sized modern event runs are still modest: `house-of-m`, `civil-war`, `annihilation`, `secret-invasion`, and `king-in-black` are 20 to 38 issues each, with JSON in the roughly 19 to 36 KB range.
- The large modern-era CBH runs are the real rollout cost: `essential-avengers` is 120 issues, `all-new-all-different-avengers` and `heroic-age-avengers` are 92 each, `marvel-fresh-start-avengers` is 59, and `hickman-full` is 219.
- Local measurement across the 22 Earth-616-relevant lists in this task scope is 1,659 issue entries and about 1.5 MB of generated JSON.
- No small Earth-616 gap is evidenced in the current manifest. The only explicit omissions documented in the data are the six Ultimate Universe issues left out of `new-ultimate-universe-trades`, and those are not Earth-616 (`src/data/curated-lists.json:113-146`).

## 6) Contrarian evidence against a very large data-only rollout

- API dependence is still real. Both vendor scripts hit `https://marvel.emreparker.com/v1`, and `README.md` keeps `npm run contract` out of CI because it calls the live metadata API (`scripts/vendor-orders.mjs:31`, `scripts/vendor-orders.mjs:205-212`, `scripts/build-event-order.mjs:34-36`, `scripts/build-event-order.mjs:209-243`, `README.md:481-483`).
- Duplicate issue IDs are not a hard error in the vendor path. The script only warns that importing will collapse them (`scripts/vendor-orders.mjs:300-307`). That is fine for small, well-understood edits, but a large rollout increases the chance of hidden collapse.
- A giant data-only PR would churn a lot of generated bytes at once. The current shipped corpus already includes 179 KB `hickman-full`, 215 KB `spider-man-best-of`, 274 KB `xmen-claremont`, and 348 KB `xmen-claremont-complete` JSON files, so the repo already proves there is no practical size ceiling to hide behind. The cost is review and anchor churn, not tool failure.
- Catalog usability depends on the current grouping and path model staying readable. The shelf counts stories, not paths, and the one shipped path already compresses 10 stops into one card route. More data raises the importance of that model, not less (`src/js/lib/catalog.js:292-309`, `src/js/lib/catalog.js:412-472`, `src/js/lib/catalog.js:492-541`, `README.md:699-705`).
- The modern Avengers path already mixes source families. Seven stops follow CBH and three are placed by start year (`src/data/curated-lists.json:1289-1307`). That is a sign the data is already a curated hybrid, so large expansions need provenance discipline, not just more generated rows.
