# Marvel Reading Tracker

A tiny, self-contained companion for reading **Marvel Unlimited** in a web browser.

Marvel Unlimited has no real reading lists. You can throw issues into your Library, but you
can't keep a long curated reading order as a clean checklist, and you can't easily see where
you left off in a run. This closes that gap.

> **Status: planning.** The implementation plan is under review — see
> [`.copilot-tracking/plans/`](.copilot-tracking/plans/). No application code has been written yet.

## What it will do

- Build and keep multiple **reading lists**, in order
- Track **read / unread** per issue, with progress per list and per series
- Show an **Up Next** card so you always know where you resumed
- **One click into the Marvel Unlimited web reader** for the next issue
- Badge every issue with whether it is **actually on Unlimited yet**
- Import curated **reading orders** (Markdown checklists, or plain issue titles)
- Export to Markdown / JSON, and restore from backup

It is a single static HTML file. No install, no server, no account, no build step.
Your reading progress lives in your browser and never leaves your machine.

## Why a web app and not BlueStacks

This was originally an attempt to run the Marvel Unlimited **Android** app via BlueStacks.
That is not possible on this hardware, and it is worth writing down so nobody retries it:

- The machine is **ARM64** (Snapdragon X Elite). BlueStacks' published minimum spec is
  "Intel or AMD Processor", and its installer ships as `..._amd64_native.exe`.
- BlueStacks (and NoxPlayer, LDPlayer, MEmu, MuMu) load **kernel-mode hypervisor drivers**.
  Windows on ARM's x86-64 emulation (Prism) is **user-mode only** — kernel drivers must be
  compiled natively for ARM64. So these cannot be made to work, at all.
- **Google Play Games on PC** targets x86 Intel/AMD hosts only.
- **Windows Subsystem for Android** was removed from the Microsoft Store on 2025-03-05.
- The **Android Studio emulator** ships `arm64-v8a` Google Play system images, but Google
  publishes the Windows emulator binary as **x64 only** — there is no Windows ARM64 build.

Marvel officially supports Marvel Unlimited on Windows **through the browser** (streaming only;
offline downloads remain iOS/Android exclusive). Edge and Chrome are both ARM64-native here, so
a browser-based companion runs at full speed with no emulation penalty.

## Pairs well with

- **[LONGBOX — for Marvel Unlimited](https://chromewebstore.google.com/detail/empty-title/jlnbkkddanlogmlkhnbpjbpidofkigfn)**
  (Chrome Web Store, works in Edge) — tracks page progress and bookmarks *inside* the reader.
  It has no curated reading orders, so it complements this app rather than replacing it.
- **[marvelreading.com](https://marvelreading.com)** (CMRO) — the best curated Marvel reading
  orders. Use it to decide *what* to read; use this to keep the checklist and jump into the reader.

## Data source

Metadata comes from the community **Marvel Metadata API**:

- API: <https://marvel.emreparker.com>
- Source: [`emreparker/marvel-comics`](https://github.com/emreparker/marvel-comics) (MIT)

37,526 issues · 6,990 series · 4,341 creators · 1939–2025. Rate limited to 60 requests/minute,
so this app throttles and caches aggressively. The API base URL is configurable, and the upstream
project is MIT-licensed and self-hostable, so this app is not permanently tied to one host.

## Disclaimer

Unofficial fan project. **Metadata and links only** — no comic content is hosted, stored,
proxied, or distributed. Reading Marvel comics requires your own Marvel Unlimited subscription.
Marvel and all related trademarks are the property of their respective owners.

## License

MIT — see [LICENSE](LICENSE).
