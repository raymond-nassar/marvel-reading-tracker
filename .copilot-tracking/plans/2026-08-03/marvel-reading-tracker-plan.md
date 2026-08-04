<!-- markdownlint-disable-file -->
# RPI Plan: Marvel Reading Tracker

## Task Metadata

* Task ID: MRT-001
* Task slug: marvel-reading-tracker
* Plan version: **v2** (revised after critique CR-run-01, disposition REVISE)
* Planning status: **approved by user 2026-08-03** — implementation gated on P00
* Plan date: 2026-08-03
* Phase details: .copilot-tracking/details/2026-08-03/marvel-reading-tracker-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-03/marvel-reading-tracker-plan-critique.md

## Executive Summary

Build a small static web app that turns a curated Marvel reading order into a durable, tickable
checklist and sends you straight into the Marvel Unlimited web reader for the next issue. It runs
locally in your ARM64-native browser, keeps all progress on your machine, and reads metadata from
the community `marvel.emreparker.com` API. The repository is private on your GitHub account.

v2 restructures the design after an independent critique found ten blocking issues in v1. The
four that mattered most: read-state was stored per-list (so the same issue read in one list stayed
unread in another), the rate limiter maths was wrong and would have breached the API's burst cap,
the reader deep-link contract was being validated far too late to be safe, and Markdown import
could not actually populate the fields the UI needs.

### User Decisions and Requirements Highlights

* You read on the MU **web** reader and are keeping it — the app links out, it never renders comics.
* You chose "build a companion app" after we confirmed the tool you remembered (panelhive.io) is dead.
* Output must be a **private** repo under `raymond-nassar`. Done — repo exists and is verified private.
* Work follows HVE Core RPI, with the plan reviewed before implementation.

### What You May Not Know

* **Android emulation is permanently off the table here.** Snapdragon X Elite is ARM64; BlueStacks
  and every rival need Intel/AMD plus kernel-mode drivers, which Windows ARM64's Prism emulator
  cannot load. Google ships no Windows ARM64 emulator binary either.
* **The upstream README is already out of date about `digitalId`** — it documents `38866` for issue
  52447 while the live API returns `38164`. That proven drift is why v2 verifies the reader link
  contract *before* building on it, not after.
* **IndexedDB is unreliable from `file://` in Chromium.** Since caching now needs IndexedDB, the app
  gets a fixed origin at `http://127.0.0.1:8787` via a bundled zero-dependency Node server. This
  also gives a stable storage origin — `file://`, `localhost`, and `127.0.0.1` are *different*
  storage buckets, so pinning one prevents your progress from silently "disappearing".
* **Node 24 ARM64 is already installed**, so tests use the built-in `node:test` runner and the local
  server is ~30 lines. No dependencies, no `npm install`, nothing to audit.
* **The metadata snapshot ends in 2025.** It is August 2026, so current releases are missing. v2 adds
  manual issue entry so you are not blocked on new comics.
* **LONGBOX** (Chrome Web Store, 5.0★, works in Edge) tracks page progress *inside* the reader but
  has no curated orders — it pairs with this app rather than competing with it.

### Unresolved Decisions or Blockers

* **P00 gate, needs you:** confirm `read.marvel.com/#/book/<digitalId>` opens the right issue while
  you are logged in. Everything in P02-T03 depends on this. If it fails we fall back to detail-page
  links and the app still works — but I want to know before building, not after.
* Repo name `marvel-reading-tracker` chosen on your behalf; easy to rename.

## User Decisions and Requirements

* Read comics on the Marvel Unlimited web reader; the companion links to the right page only.
* Must support building/curating reading lists — MU's Library is not a real reading list.
* Must track which issues and series have been read, and where to resume.
* Must surface curated reading orders, not just raw search.
* Deliver as a private GitHub repo on account `raymond-nassar`.
* Follow HVE Core Research → Plan → Implement → Review; review the plan together first.
* Origin of the idea: r/MarvelUnlimited post announcing `marvel.emreparker.com`.

## Goals

* Turn any curated reading order into a durable checklist with persistent, globally-consistent progress.
* One click from "next unread issue" into the MU web reader.
* Make Unlimited availability legible per issue, without overstating it.
* Zero install, zero account, no admin rights; survives the upstream API disappearing.

## Scope and Non-Goals

### In Scope

* Static app (`src/`), ES modules + CSS, no build step, served from a bundled Node static server.
* Normalized local store: global issue metadata, global read state, lists as ordered ID references.
* Multiple named lists; insert, move, remove; per-list and per-series progress.
* Import: vendored curated orders, pasted Markdown checklists, pasted titles, manual entry, JSON restore.
* Export: Markdown checklist and JSON backup.
* Search by title, whole-series add, creator browse, with throttling and IndexedDB caching.
* Unit tests (`node:test`) for all pure logic; browser integration checks for storage and imports.
* Accessibility: keyboard-complete, labelled, non-colour-only status, `aria-live` updates.

### Non-Goals

* Hosting, rendering, downloading, or caching any comic content. Metadata and links only.
* Authoring curated orders — we import them; CMRO and Comic Book Herald do curation better.
* Accounts, servers beyond the local static file server, or cross-device sync.
* Android emulation. Closed by research; will not be revisited.
* Scraping marvel.com or read.marvel.com.

## Functional Requirements

* Create, rename, delete, reorder, and switch between multiple reading lists.
  * Observable acceptance criteria: lists persist across a full browser restart at the canonical origin.
* Global read state shared across lists.
  * Observable acceptance criteria: marking an issue read in the Hickman *minimal* list shows it read in the *full* list too, and each issue counts once in series progress.
* Surface an "Up Next" card = first unread issue in list order.
  * Observable acceptance criteria: after marking the current issue read, Up Next advances to the next unread.
* Open an issue in the MU web reader without popup blocking.
  * Observable acceptance criteria: a tab opens synchronously on click and then navigates to `read.marvel.com/#/book/<digitalId>`; if resolution fails, that same tab goes to the `marvel.com` detail page. No blocked-popup warning in Edge.
* Represent Unlimited availability honestly.
  * Observable acceptance criteria: each issue renders exactly one of `unknown`, `scheduled (<date>)`, `expected available`, or a user override — never a bare "available" claim derived from a null date.
* Import curated orders with zero network dependency.
  * Observable acceptance criteria: bundled Hickman minimal (89) and full (219) import from vendored JSON with **zero** network requests and full metadata present immediately.
* Import arbitrary Markdown checklists and plain titles.
  * Observable acceptance criteria: `- [x]` imports as read; missing metadata shows as `pending` and hydrates in the background; hydration is cancellable and resumable; unresolved titles are listed, never silently dropped.
* Manually add an issue not present in the 2025 snapshot.
  * Observable acceptance criteria: title + marvel.com URL creates a tracked, tickable item with `unknown` metadata.
* Search issues, add a whole series, browse a creator.
  * Observable acceptance criteria: whole-series add paginates to completion, de-duplicates, and orders by on-sale date with a semantic issue-number tiebreaker.
* Export Markdown and JSON; restore from JSON atomically.
  * Observable acceptance criteria: export → clear storage → restore reproduces identical lists, order, and read state; a malformed file is rejected without mutating existing data.
* Show progress grouped by series across all lists.
  * Observable acceptance criteria: each row shows `read / tracked` over unique issue IDs, plus the API's known series total where available.

## Non-Functional Requirements

* Respect the upstream rate limit precisely.
  * Objective threshold: never more than **45 requests per rolling 60 s** and never more than **20 per rolling 10 s** (API allows 60/min, burst 30).
  * Verification: unit tests drive the limiter with a mocked clock; `X-RateLimit-Remaining` and `Retry-After` are honoured; 429 triggers exponential backoff.
* Durable state must never be lost to cache growth.
  * Objective threshold: user state lives in `localStorage`; cached API responses live in IndexedDB with TTL and LRU eviction; a durable write never fails because of cache size.
  * Verification: unit test evicts cache and confirms the durable write still succeeds.
* Start and function without the network.
  * Objective threshold: local lists and progress render before any request; the health check is optional status only; vendored orders import offline.
* Stable storage origin.
  * Objective threshold: app is launched only via `run.cmd` at `http://127.0.0.1:8787`; README warns that other origins are separate storage buckets.
* Accessibility.
  * Objective threshold: every control reachable and operable by keyboard with visible focus; status conveyed by text/icon not colour alone; async updates announced via `aria-live`.
* Legal and ethical posture.
  * Objective threshold: no comic content stored or proxied; unofficial-fan-project disclaimer; upstream MIT attribution.

## Acceptance Criteria

* `run.cmd` serves the app at `http://127.0.0.1:8787` and it renders with no network available.
* Hickman full imports offline to exactly 219 issues with metadata populated.
* An issue marked read in one list is read in every list containing it.
* Read opens the MU reader in a tab opened synchronously (no popup block), user-confirmed while logged in.
* Availability badges show the four defined states, never a false "available".
* `node --test` passes for limiter, parsers, date semantics, dedup/sort, migrations, and restore.
* Export → clear → restore round-trips losslessly; a corrupt file is rejected safely.
* `github.com/raymond-nassar/marvel-reading-tracker` is private and holds the app plus the full evidence trail.

## Implementation Context Record

| Context item | Current artifact or record |
|---|---|
| Plan | .copilot-tracking/plans/2026-08-03/marvel-reading-tracker-plan.md (v2) |
| Phase details | .copilot-tracking/details/2026-08-03/marvel-reading-tracker-phase-details.md |
| Latest critique | .copilot-tracking/reviews/plans/2026-08-03/marvel-reading-tracker-plan-critique.md — **REVISE**, all 16 findings dispositioned in v2 |
| Relevant research | .copilot-tracking/research/2026-08-03/marvel-reading-tracker-research.md |
| Changes-record role | .copilot-tracking/changes/2026-08-03/marvel-reading-tracker-changes.md created by implementation |
| Planning execution and readiness | v2 **approved by user 2026-08-03**; implementation gated on the P00 deep-link result |
| Continuation context | P00-T01 in progress — user verifying reader links against a logged-in session |

## Sources

* .copilot-tracking/research/2026-08-03/marvel-reading-tracker-research.md: constraints, API contract, build-vs-adopt decision.
* .copilot-tracking/reviews/plans/2026-08-03/marvel-reading-tracker-plan-critique.md: the 16 findings driving v2.
* Live probes of `marvel.emreparker.com/v1/*`: CORS `*`, 60 req/min, page cap 200, `digitalId`, `unlimitedDate`.
* `node -p process.arch` → `arm64`; Node v24.14.0, npm 11.9.0 present; no Python.

## Phase Checklist

<!-- rpi:phase id=P00 -->
### [ ] P00: Feasibility gate — reader deep-link contract

* Intent: Prove the MU reader URL contract before any code depends on it. Closes CR-001.
* Dependencies: none. **Requires the user, logged into Marvel Unlimited.**

<!-- rpi:task id=P00-T01 -->
#### [ ] P00-T01: Verify `digitalId` → reader mapping

* Requirement and evidence: upstream README/API disagree on `digitalId` for issue 52447 (38866 vs 38164).
* Expected result: user opens a generated sample set (old, recent, unavailable, null-`digitalId`) and confirms each lands on the correct issue; canonical URL contract recorded.
* Detail section: P00-T01 in phase details

<!-- rpi:phase id=P01 -->
### [x] P01: Repository foundation

* Intent: Private repo with licensing, docs, and the evidence trail. **Complete.**
* Dependencies: none

<!-- rpi:task id=P01-T01 -->
#### [x] P01-T01: Repo scaffold and metadata

* Expected result: `.gitignore`, MIT `LICENSE`, `README.md`. Done.

<!-- rpi:task id=P01-T02 -->
#### [x] P01-T02: Create private remote and push evidence

* Expected result: `gh repo view` reports `"visibility":"PRIVATE"`. Verified.

<!-- rpi:phase id=P02 -->
### [ ] P02: Foundations — store, limiter, cache, host

* Intent: Correct data model and network behaviour before any UI depends on them.
* Dependencies: P00

<!-- rpi:task id=P02-T01 -->
#### [ ] P02-T01: Local host and canonical origin

* Requirement and evidence: IndexedDB unreliable on `file://`; storage origin must be pinned. Closes CR-008.
* Expected result: `run.cmd` + ~30-line dependency-free Node static server on `127.0.0.1:8787`, opening the default browser.
* Detail section: P02-T01 in phase details

<!-- rpi:task id=P02-T02 -->
#### [ ] P02-T02: Normalized store with versioning and migrations

* Requirement and evidence: overlapping lists corrupt per-list read state. Closes CR-005, CR-014.
* Expected result: global `issues` + global `read` + lists-of-IDs; `schemaVersion`; validated atomic restore with pre-restore backup; in-memory rollback on failed persist.
* Detail section: P02-T02 in phase details

<!-- rpi:task id=P02-T03 -->
#### [ ] P02-T03: Rate limiter and IndexedDB cache

* Requirement and evidence: v1 limiter maths breached burst allowance. Closes CR-004, CR-006.
* Expected result: exact rolling windows (45/60 s and 20/10 s), header-aware, 429 backoff, cancellable queue; IndexedDB cache with TTL, size accounting, LRU, keys scoped by base URL + schema version.
* Detail section: P02-T03 in phase details

<!-- rpi:phase id=P03 -->
### [ ] P03: Reading experience

* Intent: The part you actually use every day.
* Dependencies: P02

<!-- rpi:task id=P03-T01 -->
#### [ ] P03-T01: Lists, Up Next, curation controls

* Requirement and evidence: FR list management; CR-013 ordering.
* Expected result: create/rename/delete, insert-at-position, move, remove, filters, progress; documented sort (on-sale date + semantic issue-number tiebreaker handling `0.1`, `1AU`, annuals).
* Detail section: P03-T01 in phase details

<!-- rpi:task id=P03-T02 -->
#### [ ] P03-T02: MU deep links without popup blocking

* Requirement and evidence: async `window.open` loses user activation. Closes CR-002.
* Expected result: tab opened synchronously then navigated; detail-page fallback in the same tab; permanent detail-page control retained.
* Detail section: P03-T02 in phase details

<!-- rpi:task id=P03-T03 -->
#### [ ] P03-T03: Availability states and series progress

* Requirement and evidence: `unlimitedDate <= now` overstates entitlement. Closes CR-007, CR-011.
* Expected result: four-state availability computed at render with calendar-date semantics + user override; series rows show `read / tracked` over unique IDs plus known total.
* Detail section: P03-T03 in phase details

<!-- rpi:task id=P03-T04 -->
#### [ ] P03-T04: Accessibility pass

* Requirement and evidence: CR-015.
* Expected result: keyboard-complete operation, visible focus, labelled controls, text+icon status, `aria-live` for async updates, non-drag move controls.
* Detail section: P03-T04 in phase details

<!-- rpi:phase id=P04 -->
### [ ] P04: Content in and out

* Intent: Get orders in, find issues, get data out.
* Dependencies: P03

<!-- rpi:task id=P04-T01 -->
#### [ ] P04-T01: Vendored curated orders

* Requirement and evidence: Markdown lacks the needed fields; 219 lookups ≈ 5 min. Closes CR-003, CR-008.
* Expected result: build-time script produces pinned, fully-enriched `src/data/hickman_{minimal,full}.json`, committed; import is offline and instant.
* Detail section: P04-T01 in phase details

<!-- rpi:task id=P04-T02 -->
#### [ ] P04-T02: Arbitrary import and lazy hydration

* Requirement and evidence: CR-003, CR-012.
* Expected result: Markdown and title import; `pending` metadata; cancellable/resumable hydration prioritising Up Next + lookahead; unique-exact-match auto-resolution with a disambiguation queue for the rest.
* Detail section: P04-T02 in phase details

<!-- rpi:task id=P04-T03 -->
#### [ ] P04-T03: Search, series, creator, manual entry

* Requirement and evidence: FR discovery; CR-009 snapshot ends 2025.
* Expected result: search, paginated de-duplicated series add, cached creator index, and manual issue entry from title + marvel.com URL.
* Detail section: P04-T03 in phase details

<!-- rpi:task id=P04-T04 -->
#### [ ] P04-T04: Export, backup, restore

* Requirement and evidence: FR lossless round-trip.
* Expected result: Markdown export that re-imports cleanly; JSON backup; validated atomic restore.
* Detail section: P04-T04 in phase details

<!-- rpi:phase id=P05 -->
### [ ] P05: Validation and review

* Intent: Prove the acceptance criteria, then record the review and route follow-ups.
* Dependencies: P04

<!-- rpi:task id=P05-T01 -->
#### [ ] P05-T01: Unit tests

* Requirement and evidence: v1 had no unit tests at all. Closes CR-010.
* Expected result: `node --test` covering limiter windows, Markdown/title parsers, availability date semantics, dedup and sort, migrations, restore validation, cache eviction.
* Detail section: P05-T01 in phase details

<!-- rpi:task id=P05-T02 -->
#### [ ] P05-T02: Browser integration and contract checks

* Requirement and evidence: schema drift vs outage must be distinguishable.
* Expected result: live-API contract script; browser checks for offline start, import, persistence across restart, restore, and popup behaviour in ARM64 Edge.
* Detail section: P05-T02 in phase details

<!-- rpi:task id=P05-T03 -->
#### [ ] P05-T03: Review record and follow-up routing

* Expected result: review log with execution status and outcome recorded separately; follow-ups routed.
* Detail section: P05-T03 in phase details

## Dependencies

* **User availability for P00** — the deep-link gate cannot be cleared without a logged-in session.
* `marvel.emreparker.com`: metadata source; mitigated by configurable base URL, MIT self-hosting, vendored orders.
* Node v24.14.0 ARM64 (present): local static server, vendoring script, `node:test`.
* `gh` CLI 2.96.0 as `raymond-nassar` with `repo` scope: satisfied in P01.

## Critique Disposition

| Critique run and finding | Disposition | Plan response or residual risk |
|---|---|---|
| CR-001 reader link validated too late | Resolved | New P00 gate before P02 |
| CR-002 popup blocking | Resolved | P03-T02 synchronous tab open |
| CR-003 Markdown cannot fill data model | Resolved | P04-T01 vendored enriched manifests; P04-T02 lazy hydration |
| CR-004 unsafe limiter maths | Resolved | P02-T03 dual rolling windows + header-aware backoff |
| CR-005 list-local read state | Resolved | P02-T02 normalized global read state |
| CR-006 unbounded cache | Resolved | P02-T03 IndexedDB TTL/LRU, durable writes protected |
| CR-007 availability overstated | Resolved | P03-T03 four explicit states |
| CR-008 offline claims unmet | Resolved | P02-T01 canonical origin; P04-T01 vendored orders; local-first render |
| CR-009 snapshot ends 2025 | Resolved | P04-T03 manual entry; documented boundary |
| CR-010 no application tests | Resolved | P05-T01/T02 |
| CR-011 undefined denominator | Resolved | `read / tracked` + known total |
| CR-012 silent wrong-issue resolution | Resolved | Unique exact match only + disambiguation queue |
| CR-013 curation/sort underspecified | Resolved | P03-T01 explicit criteria and tiebreaker |
| CR-014 no versioning/atomic restore | Resolved | P02-T02 |
| CR-015 accessibility absent | Resolved | P03-T04 |
| CR-016 single file vs testability | Resolved | Split ES modules, still no build step |
| Upstream single dependency | Accepted with risk | Configurable base URL, vendored orders, local-first data |
| Snapshot ends 2025 | Accepted with risk | Manual entry has no rich metadata |

## Follow-Up Items

* None

## Handoff

* Implementation artifact: .copilot-tracking/changes/2026-08-03/marvel-reading-tracker-changes.md
* Ready phase or task: **P00-T01 — blocked pending user approval of v2 and a logged-in verification session**
* Remaining provisional question or blocker: confirm repo name; clear the P00 deep-link gate.
