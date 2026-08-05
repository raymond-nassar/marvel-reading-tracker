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
- **Duplicate a list** to try a different path through an event, keeping shared read progress
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
vendor script loads the order, pins the enriched issue data into `src/data/`, and
regenerates `src/data/catalog.json`, so the new list appears in the catalog. No application
code changes.

An order comes from exactly one of two places: `sourceUrl` fetches it from an upstream
publisher over https, or `sourceFile` reads a checklist kept in
[`src/data/orders/`](src/data/orders). The second is for orders compiled by hand, which would
otherwise have to be published somewhere else first just to be vendored back in.

Each entry needs:

| Field | Meaning |
|---|---|
| `id` | Stable, unique identifier for the list |
| `name`, `description` | What a reader sees in the catalog |
| `type` | `event`, `character-run`, `creator-run`, or `era` |
| `depth` | `essential`, `complete`, or `tie-ins` |
| `sourceUrl` | `https://` URL of the upstream Markdown checklist to vendor. Mutually exclusive with `sourceFile` |
| `sourceFile` | Plain `*.md` name in `src/data/orders/`, for an order authored here. Mutually exclusive with `sourceUrl` |
| `sourcePage` | Human-readable attribution link (defaults to `sourceUrl`) |
| `sourceLicense` | Licence of the upstream order, or how a local one was compiled |
| `out` | Plain `*.json` file name to write into `src/data/` |
| `characters`, `keywords` | Extra terms the catalog search should match |
| `group`, `groupName`, `variant` | Optional. Ties this order to a story that has more than one reading path, so the catalog groups the versions under `groupName` and labels each with its `variant` |
| `expect` | Optional expected issue count; a mismatch is reported |

An entry that is missing or malformed fails the vendor run with the reason, so a broken
definition does not ship as a quietly shorter catalog.

`npm run vendor -- --only=<id>` rebuilds a single list. Re-vendoring everything to add one
costs hundreds of API calls and rewrites the snapshot date on files that did not change.
Skipped lists keep their pinned JSON, and their catalog entries are rebuilt from it.

A checklist line with no Marvel link is vendored as a placeholder rather than dropped, so the
reading order stays complete and tickable. Placeholders cannot be opened, and the import
notice says how many there are.

### Event orders, generated from Marvel's own metadata

The five event lists are not typed by hand. `scripts/build-event-order.mjs` holds, per event,
the ids of the series Marvel branded with that event's name, fetches their issues, and writes a
checklist in publication order into `src/data/orders/`:

```
node scripts/build-event-order.mjs               # every event
node scripts/build-event-order.mjs civil-war     # one event
node scripts/build-event-order.mjs --dry-run     # report counts, write nothing
node scripts/build-event-order.mjs --audit      # check the audit trail is complete, then build
```

Selecting the series Marvel itself branded and sorting them by on-sale date restates Marvel's
catalogue rather than reproducing anyone's editorial reading order. The trade-off is stated on
every list it produces: these orders cover the branded series and **not** crossover chapters
published in ongoing titles that carry no event branding, such as Amazing Spider-Man #529-538
during Civil War.

Series are named by id, not matched by name, because a name filter cannot tell an event from its
own sequel (`Civil War II`), its facsimiles or its handbooks; the script records why each
rejected series was rejected beside the ones it keeps. Trade collections need no rule, because
Marvel serves them from `/comics/collection/` instead of `/comics/issue/`. Where several issues
shipped the same day the main series is listed first, so it is never read after the tie-in that
reacts to it.

Because selection is by id, a series nobody listed would be silently absent rather than visibly
wrong, so that record of rejections is checked rather than trusted. `--audit` re-runs the name
filter across all 6,990 series and fails if any series it matches is in neither the include list
nor the rejection record. Run it before regenerating an order. It does not assert the reverse —
the name filter cannot find series Marvel never branded, which is the documented gap above.

The audit pages the API for the catalogue, and will read a committed `src/data/series-index.json`
instead once one exists. That file is used only when it is tracked by git and covers the whole
catalogue; an untracked, short or malformed index is refused out loud and the API is paged
instead. A shortcut that cannot be checked is a way to be quietly wrong — an index holding three
series still matches something for every event, so it would pass a bare "did it match anything"
test while leaving almost the entire catalogue unaudited.

The output is committed, so an order arrives for review as a diff, and re-running the script
only changes the events whose upstream metadata changed.

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
