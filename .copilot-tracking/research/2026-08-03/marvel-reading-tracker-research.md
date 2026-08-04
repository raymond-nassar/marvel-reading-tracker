# Task Research: marvel-reading-tracker

| Field | Value |
|---|---|
| Task ID | MRT-001 |
| Task slug | marvel-reading-tracker |
| Research date | 2026-08-03 |
| Status | Complete — planning readiness met |
| Output mode | Alternatives evaluated, build-vs-adopt decision |

## Task Definition

Provide a companion tool that lets the user (a) follow curated Marvel reading orders,
(b) track which issues/series they have already read, and (c) jump straight to the correct
page in the Marvel Unlimited **web** reader.

## Constraints (verified, not assumed)

| Constraint | Evidence |
|---|---|
| Host is Windows 11 Home ARM64, Snapdragon X Elite X1E80100, 16 GB RAM | `Get-CimInstance Win32_OperatingSystem` / `Win32_Processor` |
| Android emulation is not viable | BlueStacks min. spec is "Intel or AMD Processor"; installer is `_amd64_native.exe`; it loads kernel-mode hypervisor drivers. Windows ARM64 Prism emulation is user-mode only — kernel drivers must be native ARM64. Same reasoning eliminates Nox/LDPlayer/MEmu/MuMu. |
| Google Play Games on PC unavailable | Google developer docs describe x86 Intel/AMD hosts + Intel Bridge Technology only. |
| WSA unavailable | Microsoft archived docs: "Starting March 5, 2025, Windows Subsystem for Android and the Amazon Appstore are no longer available in the Microsoft Store." |
| Android SDK emulator not viable | Google SDK repo XML `repository2-3.xml`: every Windows `emulator` archive is `host-arch = x64`. No Windows ARM64 emulator build exists. (`arm64-v8a` Play Store *system images* do exist, API 28–37 — but there is no ARM64 host binary to run them.) |
| Marvel Unlimited on Windows = web only, streaming only | Archived marvel.com/unlimited system requirements: offline access is iPad/iPhone/iPod touch/Android only. No Microsoft Store app (`ProductNotFound`). |
| Browsers are ARM64-native | PE header machine type `0xAA64` for both `msedge.exe` and `chrome.exe`. A browser-based solution runs at full native speed with zero emulation. |

**Conclusion:** a browser-based companion is not a fallback — it is the only architecturally sound option, and it happens to carry no performance penalty.

## Alternatives Evaluated

### A1. panelhive.io — the tool the user remembered
Announced on r/MarvelUnlimited 2019-08-20 by u/vivapolonium (48 pts): "create reading lists and
keep track of your reading progress... opens the comic directly in your app or in the browser."
**DEAD.** Both `panelhive.io` and `app.panelhive.io` return NXDOMAIN — no DNS record at all.

### A2. marvelreading.com (CMRO, Travis Starnes)
Alive. `cmro.travis-starnes.com` now issues a 301 to `marvelreading.com`, indicating active
migration/maintenance. Best-in-class *curated reading order* data with per-issue read tracking.
Cloudflare-gated against scripted access. **Adopt as an order source, not replaceable by us.**

### A3. LONGBOX — for Marvel Unlimited (Chrome extension)
ID `jlnbkkddanlogmlkhnbpjbpidofkigfn`, 5.0★. "Reading cockpit for the Marvel Unlimited web
reader: recently read, bookmarks, status, page progress (metadata only)." The **only** confirmed
tool operating inside `read.marvel.com`. Installable in ARM64 Edge.
**Complementary, not competing:** it tracks progress *inside* the reader but carries no external
curated reading orders. Recommend the user install it alongside.

### A4. League of Comic Geeks / Comic Book Herald / Marvel Chronology Project
Alive. Good tracking (LOCG) and good order guides (CBH), but none deep-link into the MU reader,
and none combine curated order + progress + MU deep link.

### A5. emreparker/marvel-comics — Marvel Metadata API  ← selected foundation
Repo created 2026-01-11, MIT, Python/FastAPI on Fly.io. Announced on r/MarvelUnlimited.

**Verified live by direct probing:**
- `/v1/health` → `{"status":"ok","issue_count":37526}`
- 37,526 issues · 6,990 series · 4,341 creators · years 1939–2025
- `access-control-allow-origin: *` and a working `OPTIONS` preflight → **usable from a static page**
- Rate limit **60 req/min** (`x-ratelimit-limit: 60`), burst 30
- Max `limit` per page = **200** (`limit=500` → HTTP 422)
- `/v1/search/issues`, `/v1/series/{id}/issues`, `/v1/creators/{id}/issues` all return
  `detailUrl`, `seriesId/seriesName`, `onSaleDate`, **`unlimitedDate`**
- `/v1/issues/{id}` additionally returns **`digitalId`** (e.g. issue 52447 → digitalId 38164)

**Two findings that make this the right foundation:**
1. `unlimitedDate` allows a definitive "is this issue actually on Unlimited yet?" badge — the
   single most annoying gap when following a reading order.
2. `digitalId` maps to the MU reader deep link `https://read.marvel.com/#/book/<digitalId>`,
   enabling genuine one-click-into-the-reader. Confirmed independently that this URL shape is
   the MU web reader format.

**Gaps:** no UI, no persistence, no curated orders beyond two bundled Hickman lists,
`digitalId` only on the per-issue endpoint (1 extra request per issue, must be rate-limited
and cached).

## Decision

**Build a static, single-page companion on top of A5**, importing curated orders (A2/repo
markdown), and recommend A3 alongside for in-reader page progress.

Rationale: no existing tool combines curated order + durable progress + MU deep link. The gap
is real and small enough to close. A static page needs no server, no install, no admin rights,
and runs natively on ARM64.

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Upstream API is one person's hobby project on Fly.io; could vanish | High | MIT-licensed and self-hostable; make the API base URL configurable; keep all user data local and exportable so data survives API loss |
| 60 req/min rate limit | Medium | Client-side token bucket capped below the limit; persistent cache of immutable metadata; lazy `digitalId` resolution only on demand |
| `read.marvel.com/#/book/<digitalId>` unverified against a live subscription | Medium | Always keep the guaranteed `detailUrl` as a visible fallback control |
| `localStorage` cleared by browser hygiene tools | Medium | JSON backup/restore + Markdown export |
| Data ends 2025; newer issues absent | Low | Document it; search degrades gracefully |

## Planning Readiness

Met. Requirements, acceptance criteria, dependencies, API contract, and rate/pagination limits
are all established by direct observation.

## Sources

- Direct HTTP probes of `marvel.emreparker.com/v1/*` (health, search, series, creators, issues, CORS, limits)
- `github.com/emreparker/marvel-comics` — README, repo tree, GitHub API metadata
- `dl.google.com/android/repository/repository2-3.xml`, `sys-img2-3.xml`
- `learn.microsoft.com/windows/arm/apps-on-arm-x86-emulation`, archived WSA docs
- `support.bluestacks.com` minimum system requirements
- r/MarvelUnlimited archive via `api.pullpush.io`
- DNS/HTTP liveness checks for panelhive.io, marvelreading.com, comicbookherald.com, leagueofcomicgeeks.com
