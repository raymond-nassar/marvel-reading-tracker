# Review log — Marvel Reading Tracker

**Date:** 2026-08-03
**Scope:** the complete implementation, P00 through P05
**Workflow:** HVE Core RPI (Research → Plan → Implement → Review)

---

## What was built

A local, private web app that turns Marvel Unlimited into something you can actually read
*through*. It holds curated reading orders, tracks what you have read in a way that survives
across lists, and deep-links each issue into the Marvel Unlimited web reader.

It runs from `http://127.0.0.1:8787`. It stores nothing off your machine, has no accounts, and
hosts no comic content — only metadata and links.

## How it was verified

| Check | Result |
|---|---|
| Unit tests | 99 / 99 pass |
| Live upstream contract | 24 / 24 assumptions hold |
| Reader deep link (P00 gate) | 3 / 3 issues opened correctly, confirmed by the user |
| End-to-end launch in Edge | confirmed by the user |
| Element wiring (67 ids) | all resolve |
| Accessibility audit | no unlabelled controls, images, or inputs; one real defect found and fixed |

## Defects found by review, and fixed

These are recorded because each was a case where the code looked correct and was not.

**1. The markdown round trip was lossy.** `serializeChecklist` escaped `]` inside link text, but
`parseChecklist`'s link pattern (`[^\]]*`) stopped at the escape and could not read it back. Any
issue title containing a bracket silently degraded to an *unresolved* entry on re-import — the
app could not reliably read back a file it had just written. Since export/restore is the only
backup mechanism, this had real consequences. The parser now accepts backslash escapes.

**2. A missing `digitalId` produced a plausible dead link.** `readerUrl(null)` returned
`https://read.marvel.com/#/book/null`. It now returns `null`, so callers must handle the case.

**3. Third-party metadata was trusted for navigation.** `detailUrl` returned whatever `url` the
API supplied. It is now host-checked against marvel.com with a canonical fallback, and the UI
hides the action when no safe link exists.

**4. Switching views never moved focus.** Keyboard and screen-reader users stayed on the rail
button with nothing announcing the new context. Focus now moves to the destination heading.

**5. The contract check's own first draft was wrong twice** — it omitted the `Origin` header (so
the API correctly withheld CORS headers and the check cried wolf) and used a wrong series id.
Worth recording: a verification tool that has not itself been verified is not evidence.

## Assumptions that were tested rather than trusted

- **The reader deep link works** (P00, CHG-001). Gated before any UI was built. It also revealed
  the upstream README is stale: for issue 52447 it documents `38866`, but the live API and the
  reader both use `38164`. **The live API is authoritative.**
- **Single-tab reuse** (CHG-002). Tested against a live subscription and rejected. The valuable
  outcome was not the tab count but discovering that the planned launch flow depended on an
  unreliable window handle and would have risked popup blocking.
- **Cover art availability** (CHG-003). The research document said there was none. That was wrong
  — it had sampled only list endpoints. Re-checking produced 219/219 covers and changed the UI
  direction. Recorded prominently because the research doc is otherwise treated as authoritative.

## Known limitations

- **One browser tab per issue.** Tested and accepted; see CHG-002.
- **Availability is never claimed as fact.** `unlimitedDate` is unreliable — issue 6482 reports
  `1963-03-01`, predating Marvel Unlimited's 2007 launch. The four-state model ("expected",
  "scheduled", "unknown", plus manual override) exists for this reason and should not be
  simplified into a boolean.
- **The upstream API is unofficial and could disappear.** It has already replaced Marvel's own
  API, which was shut down. `scripts/check-contract.mjs` is the early-warning system; the base
  URL is configurable so a self-hosted mirror can be substituted.
- **The app must be opened in a real browser.** The GitHub Copilot side panel is a sandboxed
  webview and blocks the popups the reader launch depends on.
- **Not tested across browsers.** Verified in Edge only, which is what the user runs.

## Standing constraints for future work

1. **Store cover URLs, never image bytes, and never proxy them.** The browser must fetch from
   Marvel's CDN directly.
2. **Never claim an issue is available in Marvel Unlimited as fact.** The metadata does not
   support it.
3. **Resolve `digitalId` from the live API**, never from vendored upstream documentation.
4. **Keep `window.open` synchronous inside the click handler.** Never `await` before it.
5. **Run `npm run contract` before trusting a release.** It distinguishes a local regression from
   upstream drift.

## Outcome

All phases complete and verified. The original request — run the Marvel Unlimited Android app via
BlueStacks — was impossible on this hardware (Windows on ARM cannot host an x86 Android emulator,
as no Windows ARM64 emulator binary exists). The delivered app addresses the underlying goal,
reading-order tracking, which the user confirmed was the actual need.

## Review round 2 — verification of the round-1 fixes

The same independent reviewer was asked to verify commit `09921d7` and to look specifically for
problems the fixes themselves introduced. It confirmed four of the eight round-1 fixes as correct
and complete (server DoS, limiter/hydrator abort, penciler filter, markdown backslash) and found
six further issues — two of them High, and **both of the Highs were in the recovery path added by
round 1**. That is the finding worth carrying forward: the code written to prevent data loss was
itself the most dangerous code in the change.

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | High | `startFresh()` wiped the original even when the salvage copy had not landed. `salvage()` swallowed every error, and copying the state **doubles** the origin's footprint — so a state near the quota is exactly when the copy fails, and exactly when the banner is telling the user to press the button. | `salvage()` now reads the write back and returns a boolean; `startFresh()` refuses without a verified copy. `confirmedDownloaded` is the deliberate way out once the user has saved the file themselves, so refusing is not a dead end. |
| 2 | High | The "never overwrite an existing salvage" rule was scoped to the key, not the incident, and the key was never cleared. A second, unrelated corruption months later was left unsalvaged, while `salvagedRaw()` handed the user incident #1's stale blob **presented as their data**. | A second incident is archived under its own key; `salvagedRaw()` tracks the current incident's key and falls back to the live value rather than reaching for the old blob. |
| 3 | Medium | `serializeChecklist` had its own `issueId != null` fallback, so the negative synthetic ids allowed in round 1 leaked a fabricated `marvel.com/comics/issue/-1754289012345/` link into exported checklists — and did not survive re-import, detaching the entry's read state. | Guarded with `issueId > 0`, matching `normalizeIssue`. The entry now serializes as a plain checkbox, which already round-trips. |
| 4 | Medium | The persist-failure fix had been applied to 1 of 10 call sites. Worst case: a failed list creation rolled `listOrder` back, so `ids[ids.length - 1]` was a **pre-existing** list that the user was silently switched to while being told their new list was created. | `update()` now sets `lastUpdateOk`; every announcement and navigation consults it. Ids are read from the state `update()` returned, never from `store.state` afterwards. `ensureList` returns `null` rather than an undefined id. |
| 5 | Medium | `renderBlocked()` was never called after a successful restore, so a recovered user kept staring at a banner saying saving was paused — and the obvious next click, "Start fresh", would have wiped the backup they had just restored. | `renderBlocked()` moved into `renderAll()`, so it cannot go stale in either direction. |
| 6 | Low | `model.js` had acquired a UTF-8 BOM and a mojibake'd em-dash, indicating the editing path was lossy on non-ASCII — a live hazard for `main.js`, which contains functional glyphs (`✓ ↑ ↓ ✕ ⚑`). | File repaired and re-saved without BOM. Repo-wide sweep run over all 41 tracked text files: clean. `main.js` glyphs verified intact. |

Reviewer confirmed as **not** problems: `restore()` writing `PRERESTORE_KEY`/`KEY` while blocked
(it snapshots the original first, so nothing is lost), `undoRestore()` on such a snapshot (fails
cleanly through `validateBackup`), the outer 500 handler after a partial stream (`headersSent`
guards it), `sleepOrAbort` listener handling in both orderings, and every other consumer of
`issueId` — hydration, cache keys, sort, availability, series progress, and `reader.js`.

Verification after round 2: **119/119 unit tests pass** (up from 114), including new regressions
for each of findings 1–4. Malformed-path and traversal probes re-run against the live server with
`curl --path-as-is`: `/%`, `/a%2`, `/%zz`, `/%c0%af` all 403, traversal 404, server alive.

### Lesson recorded

Round 1 fixed a Critical data-loss defect and, in doing so, introduced two High data-loss defects
in the recovery path. New safety code deserves the same scrutiny as the code it replaces —
arguably more, because it runs only when the user's data is already in a bad state and there is
no second chance. A recovery path should be reviewed on the assumption that every write it makes
can fail.

