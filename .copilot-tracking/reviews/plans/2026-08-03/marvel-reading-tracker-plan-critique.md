<!-- markdownlint-disable-file -->
# Plan Critique: marvel-reading-tracker

Task ID: MRT-001 · Plan: .copilot-tracking/plans/2026-08-03/marvel-reading-tracker-plan.md
Critique run: CR-run-01 · Date: 2026-08-03 · Reviewer: independent critique agent

## Disposition: REVISE

Ten blocking findings. The deep-link contract, storage model, hydration strategy, and rate
limiter must be resolved before implementation begins. Plan revised to v2 in response.

## Findings and Dispositions

| ID | Sev | Finding | Disposition | Plan response |
|---|---|---|---|---|
| CR-001 | Critical | Reader link contract validated too late; upstream README shows `digitalId` 38866 for issue 52447 while live API returns 38164 — proven data drift | Resolved | New **P00 feasibility gate**: user verifies 5–10 representative issues while logged in, before any P02 work |
| CR-002 | High | `await fetch` then `window.open()` loses user activation → popup blocked | Resolved | Open placeholder tab synchronously on click, navigate after resolution, fall back to detail URL in that same tab |
| CR-003 | High | Markdown import cannot populate `seriesId`/`seriesName`/`unlimitedDate`/`digitalId`; hydrating 219 issues ≈ 4–5 min | Resolved | Vendor **pre-enriched JSON manifests** for bundled orders (generated once, committed). Arbitrary imports use `pending` metadata + cancellable/resumable lazy hydration with Up-Next lookahead |
| CR-004 | High | Token bucket cap 45 / refill 45/min is mathematically unsafe; exceeds burst 30; no 429 handling | Resolved | Exact rolling-timestamp window (45/60 s) **plus** separate burst cap (20/10 s), honour `X-RateLimit-Remaining` and `Retry-After`, exponential backoff on 429 |
| CR-005 | High | `read`/`readAt` stored per list item; bundled minimal and full lists overlap heavily → contradictory progress and double-counting | Resolved | **Normalized store**: global `issues` metadata by ID, global `read` state by ID, lists hold ordered ID references only. Series progress aggregates unique IDs |
| CR-006 | High | Unbounded `localStorage` cache can exhaust ~5 MB quota and break progress persistence; path-only keys leak across base URLs | Resolved | Durable state in `localStorage`; disposable cache in **IndexedDB** with TTL, size accounting and LRU eviction; cache keys include base URL + schema version; evict cache before failing a durable write |
| CR-007 | High | `unlimitedDate <= now` overstates entitlement; null ≠ unavailable; UTC midnight can badge a day early | Resolved | Four explicit states — `unknown`, `scheduled`, `expected`, `user-override` — computed at render from the raw date using calendar-date semantics |
| CR-008 | High | "Offline-capable" unmet: bundled orders fetched from mutable `main`; startup blocks on health check; `file://` storage is browser-defined | Resolved | Vendor pinned order manifests in-repo; render local state before any network call; health check is optional status only; **canonical origin fixed at `http://127.0.0.1:8787`** |
| CR-009 | High | Source data ends 2025; it is Aug 2026, so current comics are untrackable | Resolved | Add **manual issue entry** (title + marvel.com URL, unknown metadata allowed); README states the snapshot boundary |
| CR-010 | High | P04-T01 tests API shape only — no tests for throttle, parsers, dates, dedup, eviction, restore, quota | Resolved | Unit tests per phase via built-in `node:test` (zero deps) for pure logic; browser integration checks for import, persistence, restore, popup |
| CR-011 | Medium | "Series progress" denominator undefined | Resolved | Labelled `read / tracked`, with the API's known series total shown separately when available |
| CR-012 | Medium | Title resolution silently picks first result | Resolved | Auto-resolve only on unique normalized exact match; ambiguous titles go to a user disambiguation queue |
| CR-013 | Medium | Curation ops and sort order underspecified; numeric sort breaks on `0.1`, `1AU`, annuals | Resolved | Explicit insert/move/remove criteria; sort by on-sale date with a tested semantic issue-number tiebreaker |
| CR-014 | Medium | No schema version/migration; restore not atomic or validated | Resolved | `schemaVersion` + migrations; validated, atomic restore with pre-restore backup; roll back in-memory mutation if persistence fails |
| CR-015 | Medium | Accessibility absent | Resolved | Keyboard-complete operation, visible focus, labelled controls, text+icon (not colour-only) status, `aria-live` announcements, non-drag move controls |
| CR-016 | Low | Single HTML file conflicts with feature scope and testability | Resolved | Split into `src/index.html` + ES modules + CSS + vendored data; still no build step, served statically |

## Residual Risk Accepted

* Upstream API remains a single hobby-project dependency. Mitigated by configurable base URL,
  MIT self-hosting, vendored bundled orders, and local-first data. Search and hydration degrade
  if it disappears; existing lists and progress keep working.
* Metadata snapshot ends 2025. Manual entry covers newer issues but without rich metadata.
