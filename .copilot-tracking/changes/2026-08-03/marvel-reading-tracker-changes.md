<!-- markdownlint-disable-file -->
# Changes Record: marvel-reading-tracker

Task ID: MRT-001 · Plan: .copilot-tracking/plans/2026-08-03/marvel-reading-tracker-plan.md (v2, approved)

## CHG-001 — P00-T01 reader deep-link contract verified

* Date: 2026-08-03
* Phase/task: P00-T01
* Outcome: **PASS**

User verified, while logged into Marvel Unlimited, that `https://read.marvel.com/#/book/<digitalId>`
opens the correct issue for all three sampled eras:

| Expected issue | issueId | digitalId | Result |
|---|---|---|---|
| The Amazing Spider-Man (1963) #1 | 6482 | 1067 | correct |
| Secret Wars (2015) #1 | 52447 | 38164 | correct |
| Marvel Rivals: King in Black (2025) #1 | 132785 | 76967 | correct |

Significance: case 2 is the issue where the upstream README documents `38866` while the live API
returns `38164`. The **live API value is authoritative**; the upstream README is stale. The app must
therefore always resolve `digitalId` from `/v1/issues/{id}` and never from vendored upstream docs.

Canonical contract recorded:

* Reader deep link: `https://read.marvel.com/#/book/{digitalId}` where `digitalId` comes from
  `GET /v1/issues/{issueId}`.
* Fallback: `detailUrl` (`https://www.marvel.com/comics/issue/{issueId}/{slug}`).

Supporting evidence gathered during preparation:

* `digitalId` is near-universally populated — 10 of 10 randomly sampled 2025 issues had one. The
  null-`digitalId` fallback path still ships but is an edge case, not a common path.
* `unlimitedDate` is **not** trustworthy as availability proof — issue 6482 reports `1963-03-01`,
  predating Marvel Unlimited's 2007 launch. Confirms CR-007; the four-state availability model stays.

CR-001 is closed. P02 is unblocked.

---

## CHG-002 — Single reader tab rejected; launch flow rearchitected

**Date:** 2026-08-03  **Trigger:** user question about how issues actually open  **Status:** closed

The plan assumed each issue would open its own tab and said nothing about reuse. Reviewing the
flow with the user surfaced a real cost: a 219-issue order means 219 tabs over a reading session.
The user asked to try a single reusable reader tab first, so it was tested rather than assumed.

**Tested against a live Marvel Unlimited subscription in Edge:**

| Strategy | Mechanism | Result |
|---|---|---|
| A | Named target `window.open(url, 'mu-reader')` | opened a new tab each time |
| D | Retained window handle, bounced through a same-origin page | opened a new tab each time |

`read.marvel.com` is a hash-routed single-page app. A cross-origin tab cannot be forced to
re-route from script, and a retained handle did not reliably address the existing tab. B and C
were not run: the user judged further investigation not worth it and confirmed multiple tabs
are acceptable.

**Decision:** one tab per issue. This is now a documented property, not an oversight.

**Consequential redesign (the part that actually mattered).** The original design was to open a
placeholder tab, `await` the `digitalId` lookup, then navigate the tab. Testing showed a retained
handle is unreliable, and that design also risked popup-blocking because the `window.open` would
no longer be inside the user gesture once an `await` intervened.

The launch flow was rebuilt so no handle is ever retained:

1. The click handler calls `window.open('/open.html?...', '_blank', 'noopener')` **synchronously**,
   so the browser always treats it as user-initiated.
2. `/open.html` — same-origin — performs any `digitalId` lookup itself and redirects.
3. If the lookup fails or times out (8 s), it falls back to the marvel.com issue page.

`/open.html` is deliberately not an open redirector: it accepts digits-only parameters and builds
the destination in-page rather than redirecting to a caller-supplied URL.

One trap worth recording: with `'noopener'`, `window.open` may legitimately return `null` on
success, so a null handle is **not** evidence of a blocked popup and must not be reported as one.

**Verified 2026-08-03:** the user loaded `http://127.0.0.1:8787/` in Edge, clicked an issue, and a
new tab opened on the correct comic. (The GitHub Copilot side panel blocks popups — it is a
sandboxed webview — so the app must be opened in a real browser.)

Because the taskbar pin is an Edge *app window* (`msedge.exe --app=...`) rather than an installed
PWA, it does not capture these links; they open as ordinary Edge tabs. They share the Default
profile, so the Marvel Unlimited session carries over and no re-login is needed.

---

## CHG-003 — Cover art available after all; UI direction revised

**Date:** 2026-08-03  **Trigger:** user request for UX mockups  **Status:** closed

Research recorded that the API exposed no cover art. That was **wrong**, and the error came from
sampling only list endpoints. `GET /v1/issues/{id}` returns `cover`, `description`, `pageCount`
and `creators`; the list and search endpoints do not.

Re-vendoring both curated orders with per-issue hydration produced **219/219 covers and 0 missing
`digitalId`**, which made a visual design viable where the plan had assumed a text-only one.

**Changes:** `normalizeIssue` and `api.toIssue` carry the four rich fields; `normalizeCover`
(which upgrades the API's `http://` paths to `https://`) and `coverUrl` were added; the UI was
rebuilt to the user-approved "Longbox Focus" direction.

**Constraint deliberately imposed:** the app stores **cover URLs only, never image bytes**, and
never proxies them — the browser fetches from Marvel's own CDN, exactly as it would on
marvel.com. A "Show cover art" toggle (default on) switches to a typographic fallback. This keeps
the app on the correct side of the distinction between linking and reproduction, and every cover
rule in the stylesheet has a `body.nocovers` counterpart.

This corrects the research document, which should not be read as authoritative on this point.

---

## P05 — Verification

**Date:** 2026-08-03

**Unit tests (P05-T01):** 99 tests, all passing. Writing them surfaced two real defects, both
fixed in the source rather than asserted around:

1. **The markdown round trip was lossy.** `serializeChecklist` escaped `]` in link text, but
   `parseChecklist`'s link pattern (`[^\]]*`) could not read the escape back. Any issue title
   containing a bracket silently degraded to an *unresolved* entry on re-import — the app could
   not reliably read back a file it had just written. The parser now accepts backslash escapes.
2. **`readerUrl(null)` produced `https://read.marvel.com/#/book/null`** — a link that looks valid
   and is not. It now returns `null`, forcing callers to handle a missing `digitalId`. `detailUrl`
   had the same class of bug in reverse: it trusted any `url` from third-party metadata, so a bad
   record could point the UI off-domain. It is now host-checked with a marvel.com fallback, and
   callers hide the action when no safe link exists.

**Contract check (P05-T02):** `scripts/check-contract.mjs` pins the 24 upstream assumptions the
app depends on and reports which have drifted. **24/24 hold.** It also caught two errors in its
own first draft — the API only emits CORS headers when an `Origin` header is present, and the
series id used for the ordering assertion was wrong — both fixed so the check is trustworthy.

Confirmed still true: `digitalId` 38164 for issue 52447 (the P00 value), covers arrive as
`http://` and must be upgraded, `limit=500` still returns 422, series issues still arrive
descending, and list endpoints still omit covers (so lazy hydration is still required).

**Accessibility (P03-T04):** audited static markup and generated DOM. No unlabelled controls, no
images missing `alt`, no unlabelled inputs; landmarks, `lang`, a skip link and a live region all
present. One real defect found and fixed: **switching views never moved focus**, so keyboard and
screen-reader users stayed on the rail button with no announcement of the new context. Focus now
moves to the destination view's heading. `aria-current="false"` was also replaced with omitting
the attribute, which is the conventional signal.
