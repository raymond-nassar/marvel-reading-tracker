<!-- markdownlint-disable-file -->
# MRT-004 Cycle 1 Wave 2: Deeper evidence

## Participation

The bounded research worker returned evidence inline because its interface could not write this
file. The parent persisted the accepted evidence here without granting the worker decision authority.

## Pilot comparison

| Candidate | Source shape | Current overlap | Main hazard | Evidence | Parent-use ranking |
|---|---|---|---|---|---:|
| World War Hulk: Aftersmash | 26 flat issue lines | No exact shipped collision found in the relevant current orders | Yearless series names and one-shots need exact Marvel issue resolution | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/guide-part-10-wwh-aftersmash/, retrieved 2026-08-20; src/data/curated-lists.json:372-411,905-1127 | 1 |
| X-Men Extermination | 14 lines across prelude, core, and epilogue sections | No exact shipped collision found | Repository headings mean collected editions, so narrative sections must be flattened or handled by a pre-approved rule | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/marvel-fresh-start-reading-order/x-men-extermination/, retrieved 2026-08-20; README.md:714-718 | 2 |
| Siege | 39 issue-like rows, of which two are not mechanically stable issue references | At least 13 issues already occur in dark-reign-avengers | Ambiguous records and exact overlap require an editorial disposition | https://www.comicbookherald.com/the-complete-marvel-reading-order-guide/guide-part-13-siege-checklist/, retrieved 2026-08-20; src/data/orders/dark-reign-avengers.md:41-46,82-88,112-117 | 3 |

Aftersmash is the best first proof because it exercises source normalization, issue URL resolution,
provenance, vendoring, and catalog import without first requiring a new section or overlap policy.

## Lower-model normalization contract

1. Work from exactly one pre-approved Comic Book Herald page and its frozen inventory record.
2. Copy only issue-bearing lines into a worksheet. Exclude commentary, images, advertisements,
   navigation, recommendations, and prose-only trade descriptions.
3. Expand every range to one issue per line in source order.
4. Resolve every line to one exact Marvel issue URL. Use series year, annual or one-shot status,
   issue number, and title to disambiguate. Do not guess.
5. Stop if one source row can name multiple Marvel issues or no stable issue.
6. Use repository `##` headings only for true collected-edition membership approved before the task.
   Flatten narrative phases unless the planner has assigned another representation.
7. Remove an exact duplicate only under a pre-approved first-occurrence rule. Any other duplicate
   decision stops the task.
8. Require zero unresolved lines and zero placeholders unless the inventory record explicitly
   approves an exception.
9. Put a derivation block before the checklist that records source URL, retrieval date, normalization
   rule, flattened sections, removed duplicates, approved issue count, and provenance record.
10. Use a local `sourceFile`, the exact guide as `sourcePage`,
    `Compiled for this project from Comic Book Herald's guide` as `sourceOrigin`, and `null` as
    `sourceLicense`.
11. Lock `expect` to the approved final line count. Treat a count warning, duplicate warning,
    placeholder, or unresolved record as failure.
12. Do not choose `type`, `depth`, `beginner`, `timeline`, grouping, variant, or reading-path
    placement during implementation. The batch definition supplies those values.

The parser and vendor behavior behind these rules are at src/js/lib/markdown.js:70-148,
scripts/vendor-orders.mjs:270-323, and src/js/lib/curated.js:39-143.

## Conservative batch thresholds

| Batch class | Guides | Approved issue lines | Ambiguities | Chronology | Review-size rule |
|---|---:|---:|---:|---|---|
| Pilot or small flat batch | 1 by default, 2 maximum | 40 combined maximum | 0 | One story family | About 70 KB generated JSON maximum |
| Single complex guide | 1 | 60 maximum | 0 unresolved; every exception pre-decided | One story family | About 70 KB generated JSON maximum |
| Escalate or split | More than 2 | More than 60 | Any unresolved | Mixed families | More than about 70 KB generated JSON |

Current moderate event orders contain 20 to 38 issues and roughly 19 to 36 KB of generated JSON;
current broad Comic Book Herald-derived era orders contain 59 to 120 issues. The thresholds keep a
normal batch within the review shape already used for one modest event. This is a reviewability
limit, not a file-format limit.

## Ordered queue

| Queue | Window | Likely content lane | Hold for higher-capability disposition |
|---|---|---|---|
| Q0 | Inventory freeze | None | All 86 links |
| Q1 | 1998-2006 | Discrete non-overlapping issue guides | Early-era umbrella, bridges, and shipped House of M or Civil War families |
| Q2 | 2007-2010 | Aftersmash first, then other clean discrete events | Fast tracks, bridges, Secret Invasion overlap, Dark Reign umbrella, Siege |
| Q3 | 2010-2012 | Clean discrete events one at a time | Heroic Age umbrella, bridges, and overlap with heroic-age-avengers |
| Q4 | 2012-2015 | Discrete Marvel NOW! events | Marvel NOW! umbrella and Secret Wars overlap |
| Q5 | 2015-2017 | Discrete events | All-New All-Different, Marvel Now 2.0, ResurreXion, and Legacy umbrellas |
| Q6 | 2018-2021 | Extermination after the pilot, then clean discrete events | Fresh Start umbrella and Hickman X-Men as a separate subprogram |
| Q7 | 2022-present | Clean discrete events | Fresh Start Pt. 2, Krakoa umbrellas, and commerce-only source links |

## Validation ownership

### Per guide

* Source worksheet count equals approved `expect`.
* Every Markdown issue line has one exact Marvel issue URL.
* Vendor output reports the approved issue count, zero unresolved, zero placeholders, zero
  duplicates, and no count warning.
* Pinned JSON preserves the exact issue ID sequence and provenance fields.
* Catalog entry preserves type, depth, timeline, grouping, count, and source link from the frozen batch.
* First, middle, and final issue are compared against the source; every planner-identified
  ambiguity boundary is compared too.

### Per batch

* Run the focused tests that own curated manifest, catalog, Markdown, and reading paths.
* Run lint, full tests, anchors, counts, sizes, palette, and publication.
* Run the live contract for batches adding issue IDs.
* Run the browser check for the pilot and for any catalog, grouping, or path behavior change.
* Run browser proof only when the browser scenarios themselves change.

## Decisions the implementation model may not make

* Any inventory disposition.
* Pilot or batch membership.
* Narrative-section representation.
* Overlap treatment.
* Editorial manifest fields or path placement.
* Approved count.
* Ambiguous issue identity.
* Any threshold exception.
