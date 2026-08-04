<!-- markdownlint-disable-file -->
# Phase Details: marvel-reading-tracker (v2)

Task ID: MRT-001 · Plan: .copilot-tracking/plans/2026-08-03/marvel-reading-tracker-plan.md

## P00-T01: Verify `digitalId` → reader mapping

* Why: the upstream README documents `digitalId` 38866 for issue 52447; the live API returns 38164.
  Proven drift. Every reader link in the app depends on which one the reader actually accepts.
* Sample set must cover: a 1960s issue, a 2015 issue, a recent issue, an issue with a future
  `unlimitedDate`, and an issue with a null/absent `digitalId`.
* Procedure: user is logged into Marvel Unlimited, opens each generated
  `https://read.marvel.com/#/book/<digitalId>` and reports the issue title actually shown.
* Completion evidence: a recorded table of `issueId → digitalId → expected title → observed title`.
* Outcomes:
  * All match → `digitalId` confirmed; reader link becomes the primary action.
  * Systematic mismatch → record `DIV-001`, demote reader links to a labelled "best effort"
    secondary action, promote `detailUrl` to primary, return for fresh critique.

## P02-T01: Local host and canonical origin

* Rationale: Chromium restricts IndexedDB on `file://`; `file://`, `localhost`, and `127.0.0.1`
  are distinct storage buckets, so an unpinned origin can appear to lose all progress.
* Deliverable: `run.cmd` → dependency-free Node static server bound to `127.0.0.1:8787`, serving
  `src/`, then launching the default browser.
* Boundaries: bind to loopback only, never `0.0.0.0`. No dependencies. Serve only from `src/`;
  reject path traversal.
* Validation: start with the network disabled; app renders; IndexedDB opens successfully.

## P02-T02: Normalized store with versioning and migrations

* Shape:
  * `mrt.schemaVersion` — integer
  * `mrt.issues` — `{ [issueId]: { title, num, seriesId, seriesName, url, onSale, mu, digitalId, source, hydrated } }`
  * `mrt.read` — `{ [issueId]: readAtEpochMs }` — **global, the single source of truth**
  * `mrt.lists` — `{ [listId]: { id, name, desc, created, itemIds: [issueId, ...] } }`
  * `mrt.active` — listId
* The same issue may appear in many lists; it is stored once and read once.
* Restore: validate shape → write to a temp key → snapshot current state as pre-restore backup →
  atomic swap. Reject malformed input without mutating anything.
* Persistence failures roll back the in-memory mutation so the UI never shows unsaved progress.
* Validation: unit tests for migration from an empty store, round-trip restore, malformed input,
  and cross-list read consistency.

## P02-T03: Rate limiter and IndexedDB cache

* Limiter: two exact rolling windows over request timestamps — **45 per 60 s** and **20 per 10 s**
  (API: 60/min, burst 30). Not a token bucket; v1's bucket could emit 45 instantly then keep
  refilling within the same minute.
* Read `X-RateLimit-Remaining`; on `429` honour `Retry-After` and back off exponentially with jitter.
* Queue is FIFO, concurrency 2, cancellable, and reports depth for UI status.
* Cache: IndexedDB store keyed by `${baseUrl}|${schemaVersion}|${path}`, with `storedAt`, TTL, byte
  size, and LRU eviction against a configured budget. Search and availability responses get a short
  TTL; per-issue metadata a long one.
* Durable `localStorage` writes must never fail due to cache size — evict first.
* Validation: unit tests drive the limiter with a mocked clock and assert both windows hold.

## P03-T01: Lists, Up Next, curation controls

* Up Next = first `itemIds` entry whose ID is absent from `mrt.read`.
* Controls: create, rename, delete, insert-at-position, move up/down, remove, filter all/unread/read.
* Sort for bulk inserts: on-sale date ascending; tiebreaker parses issue numbers semantically so
  `0.1 < 1 < 1AU < 2`, with annuals and specials grouped after the numbered run.
* De-duplicate within a list; permit the same issue across different lists.
* Validation: unit tests for the comparator against a fixture of awkward issue numbers.

## P03-T02: MU deep links without popup blocking

* On click: synchronously `window.open("", "_blank", "noopener")` to retain user activation, show a
  brief interstitial, resolve `digitalId` if needed, then set `location` on that tab.
* If resolution fails or `digitalId` is null, navigate the same tab to `detailUrl`.
* A separate, always-visible control opens `detailUrl` directly — permanent CR-002/CR-001 mitigation.
* Validation: confirm in ARM64 Edge that no popup-blocked notification appears, including while the
  limiter is deliberately saturated.

## P03-T03: Availability states and series progress

* States computed at render from the raw stored date:
  * `unknown` — no `unlimitedDate` recorded (absence is *not* evidence of unavailability)
  * `scheduled (<date>)` — date is in the future
  * `expected available` — date has passed per the API snapshot (never phrased as a guarantee)
  * `user override` — user marked it available/unavailable from experience
* Compare calendar dates in local time; do not compare UTC midnight instants directly.
* Series progress aggregates **unique** issue IDs across all lists; label `read / tracked`, and show
  the API's known series total separately when available.
* Validation: unit tests for a future date, a today date across a timezone boundary, and null.

## P03-T04: Accessibility pass

* Keyboard-complete: every control tabbable and operable; visible focus ring.
* Status never conveyed by colour alone — pair every badge and indicator with text or an icon.
* Move controls are buttons, not drag-only.
* `aria-live="polite"` region announces import progress, hydration progress, and rate-limit waits.
* Labels on all inputs and icon buttons.

## P04-T01: Vendored curated orders

* One-time Node script hydrates the two upstream Hickman Markdown orders into fully-populated JSON
  (`seriesId`, `seriesName`, `onSale`, `unlimitedDate`, `digitalId`), honouring the limiter.
* Output committed to `src/data/hickman_minimal.json` (89) and `src/data/hickman_full.json` (219).
* Pinned in-repo — never fetched from mutable `main` at runtime.
* Validation: counts assert 89 and 219; import performs zero network requests.

## P04-T02: Arbitrary import and lazy hydration

* Markdown parse: `- [ ] [Title](https://www.marvel.com/comics/issue/<id>/<slug>)`; ID from the URL;
  `- [x]` imports as read.
* Fields not present in Markdown are stored as `pending`, and the UI shows `pending`, not a guess.
* Hydration queue prioritises Up Next plus a lookahead of 5, is cancellable, resumable, and
  persists partial progress.
* Title resolution: auto-accept only a unique normalized exact match; everything else goes to a
  disambiguation queue for explicit user choice. Never silently accept the first result.

## P04-T03: Search, series, creator, manual entry

* Series add pages `?limit=200&offset=N` until `has_next` is false, with a loop guard.
* Creator index cached in IndexedDB and filtered client-side.
* Manual entry accepts a title and a `marvel.com` URL, validates the scheme and host, and creates a
  trackable item with `unknown` metadata — this is how post-2025 issues get tracked.
* All rendered text from the API or imports is escaped; external URLs validated for scheme and host.

## P04-T04: Export, backup, restore

* Markdown export must re-import cleanly through P04-T02's parser (round-trip test).
* JSON backup includes `schemaVersion`.
* Restore is atomic and validated per P02-T02.

## P05-T01: Unit tests

* `node --test`, zero dependencies. Pure logic only, with mocked clock, fetch, and storage.
* Cover: limiter dual windows and backoff; Markdown parser incl. `- [x]`; title normalization;
  availability date semantics incl. timezone boundary; issue-number comparator; dedup; migrations;
  restore validation; cache TTL and LRU eviction.

## P05-T02: Browser integration and contract checks

* Live contract script asserts `/v1/health`, CORS header, `digitalId` and `unlimitedDate` presence,
  `limit=200` ok / `limit=500` → 422. A failure here is schema drift, reported distinctly from a
  plain outage.
* Manual browser matrix in ARM64 Edge at the canonical origin: offline start, offline import of
  vendored orders, persistence across full restart, JSON restore, popup behaviour.

## P05-T03: Review record and follow-up routing

* Produce `.copilot-tracking/reviews/logs/2026-08-03/marvel-reading-tracker-review.md`.
* Keep execution status (`Complete`/`Partial`/`Blocked`) separate from outcome
  (`Conformant`/`Defects found`/`Residual work`/…).
* Route: defects → implement, decision gaps → plan, evidence gaps → research.
