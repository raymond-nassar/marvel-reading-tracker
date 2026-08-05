# Marvel Reading Tracker

A small, self-contained companion for reading **Marvel Unlimited** in a web browser.

Marvel Unlimited has no real reading lists. You can throw issues into your Library, but you
can't keep a long curated reading order as a clean checklist, and you can't easily see where
you left off in a run. This closes that gap.

## What it does

- Build and keep multiple **reading lists**, in order
- Track **read / unread** per issue, with progress per list and per series
- Show an **Up Next** card so you know where you resumed
- **One click into the Marvel Unlimited web reader** for the next issue
- Badge every issue with whether it looks like it is **on Unlimited yet**
- Import curated **reading orders** (Markdown checklists, or plain issue titles)
- Export to Markdown / JSON, and restore from backup

It is a static site: no install, no account, no build step. Your reading progress is stored
in your browser and is not uploaded anywhere.

## Why a web app and not BlueStacks

This started as an attempt to run the Marvel Unlimited **Android** app via BlueStacks. That
did not work on this hardware, and it is worth writing down so nobody retries it:

- The machine is **ARM64** (Snapdragon X Elite). BlueStacks' published minimum spec is
  "Intel or AMD Processor", and its installer ships as `..._amd64_native.exe`.
- BlueStacks (and NoxPlayer, LDPlayer, MEmu, MuMu) load **kernel-mode hypervisor drivers**.
  Windows on ARM's x86-64 emulation (Prism) is user-mode only, and kernel drivers have to be
  compiled natively for ARM64.
- **Google Play Games on PC** targets x86 Intel/AMD hosts.
- **Windows Subsystem for Android** was removed from the Microsoft Store on 2025-03-05.
- The **Android Studio emulator** ships `arm64-v8a` Google Play system images, but Google
  publishes the Windows emulator binary as x64 only. There is no Windows ARM64 build.

Marvel supports Marvel Unlimited on Windows through the browser (streaming only; offline
downloads remain iOS/Android). Edge and Chrome are both ARM64-native here, so a
browser-based companion runs without an emulation layer in the way.

## Pairs well with

- **[LONGBOX for Marvel Unlimited](https://chromewebstore.google.com/detail/empty-title/jlnbkkddanlogmlkhnbpjbpidofkigfn)**
  (Chrome Web Store, works in Edge): tracks page progress and bookmarks *inside* the reader.
  It has no curated reading orders, so it complements this app rather than replacing it.
- **[marvelreading.com](https://marvelreading.com)** (CMRO): a long-running community source of
  curated Marvel reading orders. Use it to decide *what* to read; use this to keep the
  checklist and jump into the reader.

## Data source

Metadata comes from the community **Marvel Metadata API**:

- API: <https://marvel.emreparker.com>
- Source: [`emreparker/marvel-comics`](https://github.com/emreparker/marvel-comics) (MIT)

At the time of writing the upstream project reports 37,526 issues, 6,990 series and 4,341
creators, covering 1939 to 2025. It is rate limited to 60 requests/minute, so this app
throttles and caches. The API base URL is configurable, and the upstream project is
MIT-licensed and self-hostable, so you can point it at your own copy.

## Adding a curated reading list

Curated lists are data, not code. To add one, append an entry to
[`src/data/curated-lists.json`](src/data/curated-lists.json) and run `npm run vendor`. The
vendor script fetches the upstream order, pins the enriched issue data into `src/data/`, and
regenerates `src/data/catalog.json`, so the new list appears in the catalog. No application
code changes.

Each entry needs:

| Field | Meaning |
|---|---|
| `id` | Stable, unique identifier for the list |
| `name`, `description` | What a reader sees in the catalog |
| `type` | `event`, `character-run`, `creator-run`, or `era` |
| `depth` | `essential`, `complete`, or `tie-ins` |
| `sourceUrl` | `https://` URL of the upstream Markdown checklist to vendor |
| `sourcePage` | Human-readable attribution link (defaults to `sourceUrl`) |
| `sourceLicense` | Licence of the upstream order |
| `out` | Plain `*.json` file name to write into `src/data/` |
| `characters`, `keywords` | Extra terms the catalog search should match |
| `group`, `groupName`, `variant` | Optional. Ties this order to a story that has more than one reading path, so the catalog groups the versions under `groupName` and labels each with its `variant` |
| `expect` | Optional expected issue count; a mismatch is reported |

An entry that is missing or malformed fails the vendor run with the reason, so a broken
definition does not ship as a quietly shorter catalog.

## Running it

```
npm start
```

Serves `src/` on a local static server. `npm test` runs the unit tests.

## Disclaimer

Unofficial fan project. Metadata and links only: no comic content is hosted, stored,
proxied, or distributed. Reading Marvel comics requires your own Marvel Unlimited
subscription. Marvel and all related trademarks are the property of their respective owners.

## License

MIT, see [LICENSE](LICENSE).
