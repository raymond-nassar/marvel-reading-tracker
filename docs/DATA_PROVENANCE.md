# Data provenance and the licence boundary

This repository ships an MIT licence and a tree of committed data. Those are two different
things, and until BL-099 the data described itself in a way that blurred them: one field named
`sourceLicense` held, for ten of twelve reading orders, a sentence about where the order came
from rather than any grant of anything.

This document is the inventory that field was standing in for. It records, for every committed
data file, where it came from, which fields were copied, and what the upstream actually states.

**It draws no legal conclusion, and it is not legal advice.** Whether the tree as a whole may be
redistributed is an open question recorded at the end, and it is the reason this repository has
not been published. What else would have to change on the day that question is answered is
collected in [the publication runbook](PUBLICATION_RUNBOOK.md).

## What the MIT licence covers

[`LICENSE`](../LICENSE) is a grant made by this repository's copyright holder over the material
this repository authors. That is the application source under `src/js/`, the build and check
scripts under `scripts/`, the tests, the styles and the documents.

A grant reaches only what the grantor holds. It says nothing about material this repository did
not author, and it cannot: nobody can license out what is not theirs. So the MIT text does not
reach the issue metadata described below, and the presence of a licence file at the root is not
a statement that everything beneath it is covered by it.

The reading orders under [`src/data/orders/`](../src/data/orders) are the case that same rule does
not settle, and this document does not settle it either. What was made here is a selection and an
arrangement: which issues to include, in what sequence, cut into which sections. What those files
name is Marvel's, issue by issue. Whether a selection of that kind is this repository's to license
is the fourth of the open questions at the end of this document, so it is left there rather than
answered here by assertion.

## The chain the metadata came down

Every issue-level record in this repository arrived through three hands, and it is worth naming
all three because each one narrows what the last can offer.

1. **Marvel's own API**, which is where the records originate and which has since been shut
   down.
2. **[marvel.geoffrich.net](https://marvel.geoffrich.net)**, a site holding cached Marvel API
   data, which is where the upstream project says it collected from.
3. **[`emreparker/marvel-comics`](https://github.com/emreparker/marvel-comics)**, which built the
   cache into a searchable API at `https://marvel.emreparker.com/v1` and is what this repository
   fetched from.

The upstream project describes itself in its own README as an unofficial fan project providing
metadata and links only, and states that Marvel and all related trademarks are the property of
their respective owners. Retrieved 2026-08-11.

### What the upstream conveys, precisely

This matters because two reading orders here used to claim `MIT (emreparker/marvel-comics)` as
their licence, and that claim was wider than what is on offer.

- The repository has **no `LICENSE` file**. GitHub's licence detection returns `null` for it and
  the licence endpoint answers 404. Retrieved 2026-08-11.
- Its README carries an MIT badge and a `## License` heading whose body is the single word `MIT`.
  That states an intention; it does not convey the licence text, which MIT itself requires to
  travel with copies.
- Its `pyproject.toml` declares `license = "MIT"` for the Python distribution named
  `marvel-metadata`, and that distribution's own build configuration packages
  `src/marvel_metadata` and nothing else. The `data/` directory holding the reading orders this
  repository vendored is not part of it.

So the honest reading is that the upstream states MIT over its code. The two Markdown checklists
vendored from its `data/` directory sit outside the distribution that declaration scopes itself
to, and no licence text accompanies them. That is why `sourceLicense` is now `null` for those two
orders: **null means nobody granted anything for this file, not that the file is unencumbered.**

## Inventory

### Reading orders, pinned

Fourteen files under [`src/data/`](../src/data), one per curated list, holding 1,473 issue records
covering 913 distinct issues. Each record copies from the upstream API: `issueId`, `title`,
`number`, `url`, `seriesId`, `seriesName`, `onSale`, `mu`, `digitalId`, `pageCount`, a `cover`
object of `path` and `ext`, a `description`, and `creators` of `name` and `role`. Across the
fourteen, 1,404 records carry a cover URL, 1,394 carry creator credits and 798 carry a Marvel
description.

`description` is the field to look at hardest. The others are facts about a publication: which
issue, in which series, on what date, at which id. A description is Marvel's own marketing prose,
reproduced verbatim, and 798 of them are committed here.

Six records copy nothing, and they are the only place the sentence above does not hold. Two sit in
[`src/data/xmen_claremont.json`](../src/data/xmen_claremont.json) and four in
[`src/data/xmen_claremont_complete.json`](../src/data/xmen_claremont_complete.json), standing for
checklist lines the upstream holds no issue for. Each carries `placeholder: true`, no `url`, and an
`issueId` computed here by [`scripts/vendor-orders.mjs`](../scripts/vendor-orders.mjs) from the
order and the title and then negated, so it can never be read as one of Marvel's. The title is the
one written into an order compiled in this repository, so nothing in those six was fetched at all.
That is a statement about where the bytes came from and not about who may license them: the title
still names a Marvel series and issue, so these six sit inside the fourth open question at the end
of this document along with everything else under `src/data/`.

Cover art is referenced and never copied. `cover.path` is a URL on Marvel's image host and the
app renders it from there, so no image bytes are hosted, proxied, cached or stored. That is a
standing constraint of this project rather than an incidental property of the schema.

| Origin | Lists | What was compiled here |
|---|---|---|
| Assembled from Marvel series metadata (publication order) | 8 | The selection of series, and the rule that branded series are in and unbranded crossover chapters are out. Generated by [`scripts/build-event-order.mjs`](../scripts/build-event-order.mjs), so the derivation is a script anyone can read and re-run |
| Compiled for this project | 4 | The whole sequence, by hand. See the trail at the top of each file in [`src/data/orders/`](../src/data/orders) |
| Vendored from `emreparker/marvel-comics` | 2 | Nothing. The order is the upstream curator's; only the issue lookups were done here |

### Series and creator indexes

[`src/data/series-index.json`](../src/data/series-index.json) holds 6,990 series and
[`src/data/creators-index.json`](../src/data/creators-index.json) holds 4,341 creators, each as a
positional array of `id`, `name` and `issueCount`. These are the upstream API's full listings,
committed so the catalog audit can work from bytes in the repository rather than several thousand
live requests. Names of series and of creators are facts about publications and about people; the
selection here is not editorial, because it is simply all of them.

### Order checklists

The twelve Markdown files in [`src/data/orders/`](../src/data/orders) are authored in this
repository. Eight are generated by a committed script from series metadata, and each says so in
its own first paragraph. Four are compiled by hand, and since BL-099 each carries a trail
recording how it was derived, including the cases where an outside guide was used as a
reference: the collected-edition line-up and the X-Men sequence both follow Comic Book Herald's
guides, which those orders' catalog cards say in as many words.

### Everything else

Source, scripts, tests, styles and documents are authored here and are what the MIT grant is
about.

## What each field means now

| Field | Holds |
|---|---|
| `sourceOrigin` | Prose. Where the order came from and who compiled it. Always present. This is what the catalog shows a reader, because it is the credit that is owed |
| `sourceLicense` | An SPDX expression, or `null`. Only a licence actually conveyed with the vendored order. `null` on all fourteen today |
| `sourcePage` | A link a reader can follow to the upstream, when there is one |

The validator in [`src/js/lib/curated.js`](../src/js/lib/curated.js) enforces the shape rather
than a list of known identifiers: a licence is an SPDX expression and a sentence is not, which
refuses all ten of the old prose values by construction rather than by anyone remembering to
check. The shape test is the point. An enumeration of permitted identifiers would be one more
list somebody has to keep complete.

## Where the chain stops, and why no other chain replaces it

The first hand in that chain closed. Marvel's developer portal was retired on 2025-10-29, per the
deprecation notice carried by [`fakeheal/marvel-sdk`](https://github.com/fakeheal/marvel-sdk),
retrieved 2026-08-12, and the cache the other two are built on stops on exactly that date. Walking
every 2025 record in the vendored mirror gives a maximum on-sale date of 2025-10-29, a query for
2026 returns nothing at all, and the monthly totals for July to October 2025 run 85, 78, 76 and 83,
so a full month of output is followed immediately by silence. That is not a mirror lagging behind a
live source. It is a source that stopped, and waiting does not change it.

The consequence is already committed. 63 of the 1,473 curated items across the fourteen orders hold
a record carrying nothing beyond the issue's id, title, number and marvel.com link, with every other
field of the thirteen listed above null or empty. All 63 are in the two Ultimate universe orders,
and because those two overlap they are 34 distinct issues rather than 63.

The six placeholders are not among those 63, and the two are worth keeping apart because they fail
for opposite reasons. A placeholder marks a line the upstream never had an issue for, so no lookup
was attempted and there is no Marvel link to hold. These 63 were looked up and came back empty, so
the link is there and everything behind it is missing. Counted together they are the 69 items the
app treats as carrying no metadata.

Nothing already saved is affected. The tree holds 873 distinct cover URLs across 1,404 records; 60
of the 473 distinct URLs the tree held on 2026-08-12, sampled evenly across that whole set, all
returned an image. That is a sample and not the population, so the claim it supports is that nothing
suggests the stored URLs have stopped working. The loss is prospective only.

Three databases were assessed on 2026-08-12 as a possible second hand, and the licence question
this document exists to keep straight is what separates them.

| Source | What it conveys | What was verified |
|---|---|---|
| Grand Comics Database | CC BY-SA 4.0 over its records. Redistribution is permitted with attribution, and share-alike would put a second licence in this tree | Holds all three example issues, unauthenticated, with on-sale date, UPC and credits |
| Comic Vine | Term 5 of its API terms reads "Don't redistribute in another form. Do not edit, manipulate or reproduce on any other medium." A vendored file here is that | One example issue confirmed present, by page load |
| Metron | Terms could not be read directly. A secondary source reports personal, non-commercial, transitory viewing only, with mirroring and public display prohibited. Recorded as unverified | Nothing. The API answers 401 without an account |

Cover art and issue details have different answers, and the split is the useful finding. Details
can be had, cleanly, from the first of those three. Covers cannot be had from any of them.
Marvel's own image paths are opaque hashes, so one cannot be computed for an issue it never
published metadata for. The Grand Comics Database does return a cover URL, but that URL is
refused: on 2026-08-12 its image host answered 403 with a challenge page rather than an image, to
a HEAD request, to a plain GET, to a request carrying a current browser user agent, and to
requests carrying both its own issue page and this app's origin as referer. Because a challenge
page is exactly what a real browser might pass, the same URL was then opened in installed Edge,
where it also returned 403, rendered nothing, and never fired a load event as a cross-origin
image. The Marvel control in that same browser session rendered at 553 by 850.

Repository Constraint 1 permits storing a cover URL and forbids hosting, proxying or caching the
bytes. It is not the binding limit here. There is no cover URL to store.

Taking the missing records from each issue's own page on marvel.com is closed before it is
evaluated, by Repository Constraint 2.

## The open question

Every acceptance item of BL-099 is met except one, and it is the one that cannot be met by
writing anything:

> Obtain legal review before describing the complete data tree as MIT-licensed.

That review has not happened. Until it does, this repository does not claim the data tree is
MIT-licensed, and this document exists so that nobody infers the claim from the licence file's
position at the root.

The specific questions a review would need to answer, recorded so the work is not re-derived:

- Whether reproducing 798 Marvel issue descriptions verbatim is within any exception, and whether
  the answer changes if the field is dropped and the app shows nothing in its place.
- Whether the series and creator listings, being facts, carry protection as a compilation at
  6,990 and 4,341 entries respectively.
- Whether a licence stated in a README, with no licence text and a package declaration scoped to
  a source directory, conveys anything for two files outside that directory.
- Whether a reading order, being a selection and arrangement, is this project's to license when
  the selection was made here, and whose it is when it was not.

Until then the safe reading is the narrow one: the MIT grant covers what this repository wrote,
and the committed metadata is Marvel's, held here under no stated permission.
