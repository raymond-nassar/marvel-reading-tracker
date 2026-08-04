<!-- markdownlint-disable-file -->
# RPI Plan: Marvel Reading Tracker

## Task Metadata

* Task ID: MRT-001
* Task slug: marvel-reading-tracker
* Planning status: draft — awaiting user review
* Plan date: 2026-08-03
* Phase details: .copilot-tracking/details/2026-08-03/marvel-reading-tracker-phase-details.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-03/marvel-reading-tracker-plan-critique.md

## Executive Summary

Build a single-file, offline-capable web app that turns a curated Marvel reading order into a
durable, tickable checklist and sends you straight into the Marvel Unlimited web reader for the
next issue. It runs as a static page in your ARM64-native browser, stores progress locally, and
reads metadata from the community `marvel.emreparker.com` API. The repository will be private
on your GitHub account.

### User Decisions and Requirements Highlights

* You read on the MU **web** reader and are keeping it — the app links out, it never renders comics.
* You explicitly chose "build a companion app" over adopting an existing tool, after we confirmed
  the tool you remembered (panelhive.io) is dead.
* Output must be a **private** repo under `raymond-nassar`.
* Work must follow HVE Core RPI, with the plan reviewed before implementation.

### What You May Not Know

* **Android emulation is off the table on this machine, permanently.** Your Snapdragon X Elite is
  ARM64; BlueStacks and every rival need Intel/AMD plus kernel-mode drivers, which Windows ARM64's
  Prism emulator cannot load. Google ships no Windows ARM64 emulator binary either.
* **The API exposes `digitalId`**, which maps to `read.marvel.com/#/book/<digitalId>`. That is what
  makes true one-click-into-the-reader possible — no other free tool does this from a reading order.
* **The API exposes `unlimitedDate`**, so the app can warn you when an issue in your order is not
  actually on Unlimited yet — the most common way reading orders waste your time.
* **A complementary extension exists**: LONGBOX (Chrome Web Store, 5.0★) tracks page progress
  *inside* the reader. It has no curated orders, so it pairs with this app rather than replacing it.
* The upstream API is one developer's hobby project. It is MIT-licensed and self-hostable, so the
  plan makes the base URL configurable and keeps all your data local and exportable.

### Unresolved Decisions or Blockers

* `read.marvel.com/#/book/<digitalId>` cannot be verified without your logged-in subscription.
  Mitigated by always showing the guaranteed `marvel.com` detail-page link as a fallback.
  **Needs your confirmation during P04 acceptance.**
* Repo name proposed as `marvel-reading-tracker`. Say the word if you want something else.

## User Decisions and Requirements

* Read comics on the Marvel Unlimited web reader; the companion links to the right page only.
* Must support building/curating reading lists — MU's Library is not a real reading list.
* Must track which issues and series have been read, and where to resume.
* Must surface curated reading orders, not just raw search.
* Deliver as a private GitHub repo on account `raymond-nassar`.
* Follow the HVE Core Research → Plan → Implement → Review workflow; review the plan together first.
* Origin of the idea: r/MarvelUnlimited post announcing `marvel.emreparker.com` + `emreparker/marvel-comics`.

## Goals

* Turn any curated reading order into a durable checklist with persistent progress.
* One click from "next unread issue" into the MU web reader.
* Make Unlimited availability visible per issue before time is wasted.
* Zero install, zero server, zero admin rights; survives the upstream API disappearing.

## Scope and Non-Goals

### In Scope

* Static single-page app (`src/index.html`), vanilla JS, no build step, no dependencies.
* Multiple named reading lists with ordering, progress, and per-series roll-up.
* Import: bundled curated orders, pasted Markdown checklists, pasted issue titles, JSON restore.
* Export: Markdown checklist and JSON backup.
* Search by issue title, whole-series add, browse by creator.
* Client-side rate limiting and caching within the API's 60 req/min budget.
* Private GitHub repo with README documenting the ARM64 findings and the LONGBOX pairing.

### Non-Goals

* Hosting, rendering, downloading, or caching any comic content. Metadata and links only.
* Reimplementing CMRO/Comic Book Herald curation — we import orders, we do not author them.
* Accounts, servers, cross-device sync, or any backend.
* Android emulation. Closed by research; will not be revisited.
* Scraping marvel.com or read.marvel.com.

## Functional Requirements

* Create, rename, delete, and switch between multiple reading lists.
  * Observable acceptance criteria: lists persist across a full browser restart.
* Mark issues read/unread individually, in bulk, and reset a list.
  * Observable acceptance criteria: progress count, percentage, and bar update immediately and persist.
* Surface an "Up Next" card = first unread issue in list order.
  * Observable acceptance criteria: after marking the current issue read, Up Next advances to the next unread.
* Open an issue in the MU web reader.
  * Observable acceptance criteria: clicking Read opens `read.marvel.com/#/book/<digitalId>` in a new tab when `digitalId` resolves; otherwise it opens the `marvel.com` detail page. A separate always-present control opens the detail page.
* Show Unlimited availability per issue.
  * Observable acceptance criteria: badge reads "on Unlimited" only when `unlimitedDate` exists and is in the past; otherwise "not on Unlimited".
* Import curated orders.
  * Observable acceptance criteria: one click imports the bundled Hickman minimal (89) and full (219) lists; a pasted Markdown checklist imports without any network lookup; pre-ticked `- [x]` lines import as already-read.
* Import a plain list of issue titles by resolving them through the API.
  * Observable acceptance criteria: resolved count and unresolved titles are both reported.
* Search issues, add one issue or a whole series, and browse a creator's issues.
  * Observable acceptance criteria: "whole series" paginates to completion and inserts in ascending issue-number order.
* Export Markdown and JSON; restore from JSON.
  * Observable acceptance criteria: exported JSON restores to identical list contents and read-state.
* Show progress grouped by series across all lists.
  * Observable acceptance criteria: each series row shows read/total, count available on Unlimited, and last-read date.

## Non-Functional Requirements

* Stay within the upstream rate limit.
  * Objective threshold: client never exceeds 45 requests in any rolling 60 s window (limit is 60).
  * Verification: token-bucket throttle with max concurrency 2; queue depth surfaced in the status bar.
* Avoid redundant network calls.
  * Objective threshold: repeating an identical search or series fetch in the same browser profile issues zero new requests.
  * Verification: `localStorage` response cache keyed by request path.
* Survive upstream API loss without data loss.
  * Objective threshold: all user data is local; JSON export/restore round-trips losslessly.
* Run natively on Windows 11 ARM64.
  * Objective threshold: no install, no runtime, no admin rights; works from `file://` and over `http://localhost`.
* Legal and ethical posture.
  * Objective threshold: no comic content stored or proxied; README carries an unofficial-fan-project disclaimer; upstream MIT attribution present.

## Acceptance Criteria

* Opening `src/index.html` shows a working app with a green status indicator and the live issue count.
* Importing the Hickman full order produces a 219-issue list with working links.
* Marking issues read persists across a browser restart.
* An issue known to be absent from Unlimited is visibly badged as such.
* "Read" opens the MU reader (user-confirmed while logged in).
* Exported JSON restores identically after clearing storage.
* `github.com/raymond-nassar/marvel-reading-tracker` exists, is **private**, and contains the app,
  README, LICENSE, and this `.copilot-tracking` evidence trail.

## Implementation Context Record

| Context item | Current artifact or record |
|---|---|
| Plan | .copilot-tracking/plans/2026-08-03/marvel-reading-tracker-plan.md |
| Phase details | .copilot-tracking/details/2026-08-03/marvel-reading-tracker-phase-details.md |
| Latest critique | .copilot-tracking/reviews/plans/2026-08-03/marvel-reading-tracker-plan-critique.md — disposition pending user review |
| Relevant research | .copilot-tracking/research/2026-08-03/marvel-reading-tracker-research.md |
| Changes-record role | .copilot-tracking/changes/2026-08-03/marvel-reading-tracker-changes.md created by implementation |
| Planning execution and readiness | Plan drafted; NOT ready — awaiting user approval before P02 |
| Continuation context | Waiting on user review of this plan |

## Sources

* .copilot-tracking/research/2026-08-03/marvel-reading-tracker-research.md: all constraints, API contract, and the build-vs-adopt decision.
* Live probes of `marvel.emreparker.com/v1/*`: CORS `*`, 60 req/min, page limit 200, `digitalId`, `unlimitedDate`.
* `github.com/emreparker/marvel-comics`: MIT license, bundled Hickman orders, self-hosting path.
* Google SDK `repository2-3.xml`: Windows emulator archives are `host-arch = x64` only.

## Phase Checklist

<!-- rpi:phase id=P01 -->
### [ ] P01: Repository foundation

* Intent: A private GitHub repo exists with licensing, documentation, and the research/plan evidence trail.
* Dependencies: none

<!-- rpi:task id=P01-T01 -->
#### [ ] P01-T01: Repo scaffold and metadata

* Requirement and evidence: user requirement "private repo on my GitHub account"; `gh auth status` shows `raymond-nassar` with `repo` scope.
* Expected result: local git repo with `.gitignore`, MIT `LICENSE`, and `README.md`.
* Detail section: P01-T01 in phase details

<!-- rpi:task id=P01-T02 -->
#### [ ] P01-T02: Create private remote and push evidence

* Requirement and evidence: acceptance criterion "exists, is private".
* Expected result: `gh repo create ... --private`; research + plan artifacts pushed; visibility asserted as `private`.
* Detail section: P01-T02 in phase details

<!-- rpi:phase id=P02 -->
### [ ] P02: Core application

* Intent: A working single-file app covering lists, progress, MU links, and availability badges.
* Dependencies: P01

<!-- rpi:task id=P02-T01 -->
#### [ ] P02-T01: API client with throttle and cache

* Requirement and evidence: NFR "never exceed 45 req / rolling 60 s"; observed `x-ratelimit-limit: 60`, page limit 200.
* Expected result: token-bucket queue, concurrency 2, `localStorage` path-keyed cache, live status indicator.
* Detail section: P02-T01 in phase details

<!-- rpi:task id=P02-T02 -->
#### [ ] P02-T02: Storage model and persistence

* Requirement and evidence: FR "lists persist across a full browser restart".
* Expected result: versioned `localStorage` schema for lists, items, read-state, and active list.
* Detail section: P02-T02 in phase details

<!-- rpi:task id=P02-T03 -->
#### [ ] P02-T03: Reading view, Up Next, and MU deep links

* Requirement and evidence: FR Up Next; FR open in reader; `digitalId` confirmed on `/v1/issues/{id}`.
* Expected result: Up Next card, per-issue read toggle, reorder, remove, lazy `digitalId` resolution with detail-page fallback.
* Detail section: P02-T03 in phase details

<!-- rpi:task id=P02-T04 -->
#### [ ] P02-T04: Unlimited availability badges

* Requirement and evidence: FR badge rule from `unlimitedDate`.
* Expected result: per-issue badge; series roll-up counts availability.
* Detail section: P02-T04 in phase details

<!-- rpi:phase id=P03 -->
### [ ] P03: Reading orders, discovery, and portability

* Intent: Get curated orders in, find issues, and get data back out.
* Dependencies: P02

<!-- rpi:task id=P03-T01 -->
#### [ ] P03-T01: Import curated orders

* Requirement and evidence: bundled `hickman_minimal.md` (89) and `hickman_full.md` (219) parsed from Markdown links.
* Expected result: one-click import of both; pasted Markdown import with `- [x]` honoured; zero network calls for link-bearing Markdown.
* Detail section: P03-T01 in phase details

<!-- rpi:task id=P03-T02 -->
#### [ ] P03-T02: Search, whole-series add, creator browse

* Requirement and evidence: `/v1/search/issues`, `/v1/series/{id}/issues`, `/v1/creators/{id}/issues`; page limit 200.
* Expected result: paginated series add sorted ascending; cached creator index.
* Detail section: P03-T02 in phase details

<!-- rpi:task id=P03-T03 -->
#### [ ] P03-T03: Title resolution, export, backup/restore

* Requirement and evidence: FR resolve titles; FR lossless JSON round-trip.
* Expected result: throttled title resolution reporting misses; Markdown + JSON export; JSON restore.
* Detail section: P03-T03 in phase details

<!-- rpi:phase id=P04 -->
### [ ] P04: Validation and review

* Intent: Prove the acceptance criteria, then record the review and route follow-ups.
* Dependencies: P03

<!-- rpi:task id=P04-T01 -->
#### [ ] P04-T01: Automated contract checks

* Requirement and evidence: acceptance criteria depend on live API shape.
* Expected result: script asserting health, CORS, `digitalId`, `unlimitedDate`, page-limit-200, and that both Hickman lists parse to 89/219.
* Detail section: P04-T01 in phase details

<!-- rpi:task id=P04-T02 -->
#### [ ] P04-T02: User acceptance walkthrough

* Requirement and evidence: unresolved reader-URL question; persistence across restart.
* Expected result: user confirms reader deep link works while logged in; persistence and restore confirmed.
* Detail section: P04-T02 in phase details

<!-- rpi:task id=P04-T03 -->
#### [ ] P04-T03: Review record and follow-up routing

* Requirement and evidence: RPI review concept.
* Expected result: review log with execution status and outcome recorded separately; follow-ups routed.
* Detail section: P04-T03 in phase details

## Dependencies

* `marvel.emreparker.com` availability: sole metadata source; mitigated by configurable base URL and MIT self-hosting.
* `raw.githubusercontent.com`: serves the two bundled curated orders at import time.
* ARM64-native Edge/Chrome: confirmed present; provides `localStorage` and `fetch`.
* `gh` CLI 2.96.0 authenticated as `raymond-nassar` with `repo` scope: required for P01-T02.

## Critique Disposition

| Critique run and finding | Disposition | Plan response or residual risk |
|---|---|---|
| CR-001 Single upstream dependency is a hobby project | Accepted with risk | Configurable base URL; local-first data; export/restore. Residual: search unavailable if API dies. |
| CR-002 Reader deep-link format unverified | Open | Fallback link always present; explicit user confirmation gate at P04-T02. |
| CR-003 `localStorage` is erasable and origin-scoped | Accepted with risk | JSON backup/restore + Markdown export; README warns to keep the file in a stable location. |
| CR-004 Metadata ends 2025 | Accepted with risk | Documented in README; recent issues simply will not appear in search. |
| CR-005 Legal posture around Marvel content | Resolved | Metadata and links only; no content stored or proxied; disclaimer in README. |

## Follow-Up Items

* None

## Handoff

* Implementation artifact: .copilot-tracking/changes/2026-08-03/marvel-reading-tracker-changes.md
* Ready phase or task: P01-T01 — **blocked pending user approval of this plan**
* Remaining provisional question or blocker: confirm repo name `marvel-reading-tracker`; confirm reader deep link at P04-T02.
