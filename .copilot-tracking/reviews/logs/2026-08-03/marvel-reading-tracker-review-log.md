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
