<!-- markdownlint-disable-file -->
# Phase Details: marvel-reading-tracker

Task ID: MRT-001 · Plan: .copilot-tracking/plans/2026-08-03/marvel-reading-tracker-plan.md

## P01-T01: Repo scaffold and metadata

* Boundary: no application logic in this task.
* Files: `.gitignore`, `LICENSE` (MIT), `README.md`.
* README must state: unofficial fan project; metadata and links only; no comic content;
  attribution to `emreparker/marvel-comics` (MIT); the ARM64 finding (why this is a web app,
  not BlueStacks); and the LONGBOX extension pairing recommendation.
* Validation: `git status` clean after commit; files present.

## P01-T02: Create private remote and push evidence

* Command shape: `gh repo create raymond-nassar/marvel-reading-tracker --private --source . --remote origin --push`
* Completion evidence: `gh repo view --json visibility,isPrivate` returns `private` / `true`.
* Boundary: never use `--public`. If the repo already exists, stop and ask.

## P02-T01: API client with throttle and cache

* Observed contract: base `https://marvel.emreparker.com/v1`; `x-ratelimit-limit: 60`;
  `access-control-allow-origin: *`; `limit` max 200 (`limit=500` → HTTP 422).
* Design: token bucket capped at 45 req / rolling 60 s, max concurrency 2, FIFO queue.
  On budget exhaustion, defer and surface "rate limit — waiting" rather than failing.
* Cache: `localStorage` key `mrt.c.<path>` for immutable metadata responses.
* Base URL must be overridable so a self-hosted instance can be substituted.
* Validation: repeat an identical search; observe zero new network requests in DevTools.

## P02-T02: Storage model and persistence

* Schema: `mrt.db` → `{ lists: { [id]: { id, name, desc, created, items[] } }, active }`.
* Item: `{ id, title, num, seriesId, seriesName, url, onSale, mu, digitalId, read, readAt }`.
* Write on every mutation. Guard `QuotaExceededError` with a visible message.
* Validation: create list, mark issues, fully restart the browser, confirm state intact.

## P02-T03: Reading view, Up Next, and MU deep links

* Up Next = first item where `read === false` in list order.
* Read action: if `digitalId` absent, fetch `/v1/issues/{id}` once, cache it, then open
  `https://read.marvel.com/#/book/<digitalId>`; if it cannot be resolved, open `detailUrl`.
* A distinct always-visible control opens `detailUrl` directly. Never remove this fallback —
  it is the mitigation for CR-002.
* All external links: `target="_blank"` with `rel="noopener"`.
* Validation: resolve one issue, confirm the fetch happens once and is cached.

## P02-T04: Unlimited availability badges

* Rule: on Unlimited **iff** `unlimitedDate` is present **and** `new Date(unlimitedDate) <= now`.
  A future date means announced but not yet released — must badge as not available.
* Validation: confirm a known-recent issue badges "not on Unlimited".

## P03-T01: Import curated orders

* Markdown parse regex targets `- [ ] [Title](https://www.marvel.com/comics/issue/<id>/<slug>)`;
  issue ID is captured from the URL, so no lookup is needed.
* `- [x]` must import as already-read.
* Bundled orders fetched from
  `raw.githubusercontent.com/emreparker/marvel-comics/main/data/{hickman_minimal,hickman_full}.md`.
* Validation: minimal parses to exactly 89 items, full to exactly 219.

## P03-T02: Search, whole-series add, creator browse

* Series add: page `/v1/series/{id}/issues?limit=200&offset=N` until `has_next` is false,
  with a loop guard; sort ascending by numeric `issueNumber` before insert.
* Creator index: page `/v1/creators?limit=200`, cache the full index, filter client-side.
* De-duplicate on insert so re-adding a series cannot create duplicates.
* Validation: add a multi-page series; confirm count matches `total` and order ascending.

## P03-T03: Title resolution, export, backup/restore

* Resolution: per title, `/v1/search/issues?q=<title>&limit=10`, prefer a normalised exact
  title match, else first result; report unresolved titles rather than silently dropping them.
* Markdown export must round-trip through the Markdown importer.
* JSON restore accepts either a single list object or a whole-DB object.
* Validation: export JSON, clear storage, restore, diff list contents and read-state.

## P04-T01: Automated contract checks

* Script asserts: `/v1/health` ok; CORS header present; `/v1/issues/52447` exposes `digitalId`
  and `unlimitedDate`; `limit=500` returns 422 while `limit=200` succeeds; both bundled orders
  parse to 89 and 219.
* Purpose: detect upstream drift. Failure here is a blocker, not a warning.

## P04-T02: User acceptance walkthrough

* User confirms, while logged into Marvel Unlimited, that Read opens the correct issue.
* User confirms persistence across a browser restart and a successful JSON restore.
* If the reader link fails, record a `DIV-xxx`, make `detailUrl` the primary action, and
  return the amendment for fresh critique.

## P04-T03: Review record and follow-up routing

* Produce `.copilot-tracking/reviews/logs/2026-08-03/marvel-reading-tracker-review.md`.
* Keep execution status (`Complete`/`Partial`/`Blocked`) separate from outcome
  (`Conformant`/`Defects found`/`Residual work`/…).
* Route: defects → implement, decision gaps → plan, evidence gaps → research.
