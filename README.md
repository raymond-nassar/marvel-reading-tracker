# Marvel Reading Tracker

A free checklist app for people who read Marvel comics on **Marvel Unlimited**, Marvel's
comic subscription service. It runs on your own computer, in your web browser.

Marvel comics are best read in a particular order, and fans publish carefully worked out
**reading orders**: numbered lists of which issue to read next. Marvel Unlimited has no real
way to follow one. You can throw issues into your Library, but you cannot keep a long reading
order as a clean checklist, and you cannot easily see where you left off. This app closes
that gap. You keep the list here, tick issues off as you go, and click straight through into
Marvel Unlimited to read the next one.

It does not contain any comics, and it is not made by Marvel. You still need your own Marvel
Unlimited subscription to read.

**In a hurry?** Jump to [Run it on your computer](#run-it-on-your-computer).

## What it does

- Build and keep multiple **reading lists**, in order
- Track **read / unread** per issue, with progress per list and per series
- Show an **Up Next** card so you know where you resumed
- **One click into the Marvel Unlimited web reader** for the next issue
- Badge every issue with whether it looks like it is **on Unlimited yet**
- Import curated **reading orders** (Markdown checklists, or plain issue titles)
- **Duplicate a list** to try a different path through an event, keeping shared read progress
- Export to Markdown / JSON, and restore from backup

### Your data stays with you

There are no accounts to create and nothing to sign in to. Your reading progress is saved by
your own web browser, on your own computer. It is never sent anywhere, and there is no
analytics or tracking of any kind.

To be exact about what does leave your computer: when the app starts it asks the comics database
whether it is reachable, so it can tell you when it is not. Searching for issues sends what you
typed; searching the catalog, series or creators is answered from files already on this machine.
To show you comic titles, dates and cover pictures, it downloads those details from that same
public comics database and downloads the cover images from Marvel's own image servers. That is
the same kind of request your browser makes when it loads any web page. Those requests do reveal
which issues you are looking at, because asking for an issue's details or its cover picture is
exactly what they are. Turning cover art off hides the covers without stopping them being
requested. What is never sent is your reading progress, your notes, or anything identifying you.

## Run it on your computer

The app runs entirely on your own machine. Follow these three steps in order.

### What you need

- **Node.js**, version 20 or newer. This is a free program that runs the small web server
  this app uses. Download it from [nodejs.org](https://nodejs.org). If you are offered a
  choice, take the "LTS" version.
- **Git**, only to copy the code onto your computer. Get it from
  [git-scm.com](https://git-scm.com). If you would rather not install Git, you can instead
  use the green "Code" button on the GitHub page and choose "Download ZIP", then unzip it.

You do not need to know how to program, and you do not need to install anything else. The
app itself has no other parts to download.

To check Node.js is ready, open a terminal (on Windows, "Command Prompt" or "PowerShell"; on
macOS, "Terminal") and type:

```
node --version
```

You should see a version number of `v20` or higher, like `v20.11.0` or `v24.14.0`. If you
instead see "not recognized" or "command not found", Node.js is not installed yet.

### Step 1: Get the code onto your computer

This copies the project into a new folder and then moves you into that folder.

```
git clone https://github.com/raymond-nassar/marvel-reading-tracker.git
cd marvel-reading-tracker
```

You should now see a lot of file names scroll past, ending with your prompt sitting in the
new folder. If you downloaded the ZIP instead, just unzip it and `cd` into the folder.

### Step 2: Start the app

```
npm start
```

You should see exactly this:

```
Marvel Reading Tracker running at http://127.0.0.1:8787/
Always use this exact address. Other addresses are separate browser storage.
Press Ctrl+C to stop.
```

If you see that, it worked. Leave this window open. Closing it stops the app.

If you see something else, look at [If something goes wrong](#if-something-goes-wrong)
below. The most common one by far is that the address is already being used.

### Step 3: Open it in your browser

The app usually opens your browser for you. If it does not, open your browser yourself and
go to this address, exactly as written:

```
http://127.0.0.1:8787/
```

Use a normal browser window: Edge, Chrome, Firefox or Safari. Do not use a preview panel
built into another program, such as the preview pane in a code editor. Those panels block
new tabs from opening, and opening the comic reader is the one thing this app exists to do.
Everything else would look like it works, and then the "Read" button would do nothing at
all.

### What a working app looks like

You should see a page headed **Pick something to read**, with a sidebar down the left.

- The sidebar starts with **Reading orders**, which says "Nothing yet. Browse the catalog
  below to start." That is correct on a first run. You have not added anything yet.
- Below that are links such as **Browse the catalog**, **Progress by series**, **Search
  issues** and **Paste a reading order**.
- At the bottom of the sidebar you should see **API OK** followed by a number of issues. That
  is the app confirming it can reach the comics database.

If **API OK** is missing, the app still runs, but it cannot look up comic details. Check that
you are online.

To start using it, click **Browse the catalog** and pick a reading order.

### Stopping it, and starting it again another day

To stop the app, click the terminal window where it is running and press **Ctrl+C**. On a
Mac this is still Ctrl+C, not Command+C. You can then close the window.

Your reading progress is not lost when you stop the app. It stays in your browser.

To start it again another day, open a terminal, go back to the folder, and start it again:

```
cd marvel-reading-tracker
npm start
```

There is no need to repeat step 1. You only download the code once.

## Always open the same address

This is the one thing worth understanding, because getting it wrong looks like losing all
your work.

Your reading progress is saved by your browser, and your browser files that saved data under
the exact address you were using at the time. Change any part of the address and the browser
treats it as a completely different website, with its own separate, empty storage. Your
progress is not deleted. It is just filed under the old address, and the new one starts blank.

Both of these count as changes, and both catch people out:

- **The number at the end.** `http://127.0.0.1:8788/` is a different place from
  `http://127.0.0.1:8787/`.
- **The name at the start.** `http://localhost:8787/` is a different place from
  `http://127.0.0.1:8787/`, even though both mean "this computer".

So always open `http://127.0.0.1:8787/`. Bookmark it. If you ever have to start the app on a
different number, remember that your existing progress lives at the old address and will come
back when you return to it.

## If something goes wrong

**"Port 8787 is already in use."**

Something is already using that address. Usually it is this app, still running in another
window you forgot about. Try opening `http://127.0.0.1:8787/` in your browser first, because
the app may well be working already.

If it is genuinely something else, you can start on a different number. The command depends
on which terminal you are using.

Windows PowerShell:

```
$env:MRT_PORT=8788; npm start
```

Windows Command Prompt:

```
set MRT_PORT=8788 && npm start
```

macOS or Linux:

```
MRT_PORT=8788 npm start
```

Then open `http://127.0.0.1:8788/` instead. Please read
[Always open the same address](#always-open-the-same-address) before you do this, because
your existing reading progress will not appear at the new address.

**"npm is not recognized" or "command not found"**

Node.js is not installed, or the terminal was open before you installed it. Install Node.js
from [nodejs.org](https://nodejs.org), then close the terminal window and open a new one.

**The page is blank, or nothing loads**

Check the terminal window where you ran `npm start` is still open and still shows the
"running at" message. If it has closed or shows an error, the app is not running. Also check
you typed the address exactly, including the `http://` at the start.

**The "Read" button does nothing**

Your browser is blocking the new tab. This happens if you opened the app inside a preview
panel rather than in a real browser window, so open it in Edge, Chrome, Firefox or Safari
instead. If you are already in a real browser, look for a small "pop-up blocked" icon in the
address bar and allow pop-ups for this address.

Reading the comics themselves needs your own Marvel Unlimited subscription. This app links
you to the reader; it does not contain any comics.

**My reading progress has disappeared**

Almost always this means the address changed. Read
[Always open the same address](#always-open-the-same-address). Go back to
`http://127.0.0.1:8787/` and your progress should be exactly where you left it.

Progress is also per browser. If you normally use Edge and open the app in Firefox, Firefox
will start empty. That is expected, and your Edge progress is untouched.

## Pairs well with

- **[LONGBOX for Marvel Unlimited](https://chromewebstore.google.com/detail/empty-title/jlnbkkddanlogmlkhnbpjbpidofkigfn)**
  (Chrome Web Store, works in Edge): tracks page progress and bookmarks *inside* the reader.
  It has no curated reading orders, so it complements this app rather than replacing it.
- **[marvelreading.com](https://marvelreading.com)** (the Complete Marvel Reading Order, or
  CMRO): a long-running community source of curated Marvel reading orders. Use it to decide
  *what* to read; use this to keep the checklist and jump into the reader.
- **[Comic Book Herald](https://www.comicbookherald.com)**: editorial reading guides for Marvel by
  era, event and character, carrying the context and the recommendations that a bare ordering
  leaves out, and collected-edition guides for readers who buy the books rather than the single
  issues. This project exists partly because of it: the bundled New Ultimate Universe trade order
  was compiled here, but its division into volumes follows that collected-edition guide, read as a
  reference. Read it to decide what is worth reading and why; use this to track where you are in it.

## Data source

Metadata comes from the community **Marvel Metadata API**:

- API: <https://marvel.emreparker.com>
- Source: [`emreparker/marvel-comics`](https://github.com/emreparker/marvel-comics)

At the time of writing the upstream project reports 37,526 issues, 6,990 series and 4,341
creators, covering 1939 to 2025. It is rate limited to 60 requests/minute, so this app
throttles and caches. The API base URL is configurable and the upstream is self-hostable, so
you can point it at your own copy.

The upstream states MIT for its code, and that statement is narrower than it looks: the
repository carries no licence file, and the declaration in its packaging covers the Python
distribution rather than the reading orders this project vendored from it. The metadata itself
originates with Marvel and is not the upstream's to license on. What that means for this
repository, file by file, is written down in
[the data provenance record](docs/DATA_PROVENANCE.md).

## For contributors

Everything below this point is for people changing the app or adding data to it. You do not
need any of it to read comics.

Background: [why this is a browser app and not an Android emulator](docs/WHY_A_BROWSER_APP.md)
records the hardware findings behind that decision, so the emulator route does not get retried.

Structure: [how the app is put together](docs/ARCHITECTURE.md) draws the module graph as ownership,
one reading action from the click to the repaint, and every place the app stores anything.

Security: [the security policy](SECURITY.md) says what counts as a vulnerability in an app with no
server and no accounts, and how to report one privately. The short version is that anything which
silently loses or corrupts saved reading progress is treated as a security issue, and that a
suspected vulnerability should never be opened as an ordinary issue.

### Checks

```
npm ci
```

Installs the linting tools. You only need this to run the linter. The app itself has no
parts to install, and the tests use the test runner built into Node.js, so both `npm start`
and `npm test` work in a fresh copy with nothing installed.

```
npm test
npm run lint
npm run anchors
npm run counts
```

`npm test` runs the unit tests. `npm run lint` runs ESLint. `npm run anchors` checks that
every `path:line` citation in the tracked files still points at lines saying what the
citation claims. `npm run counts` recomputes the figures the backlog states about its own
ranked table, such as how many rows it has and where an item ranks, and fails with the
derived value when the prose disagrees. All four run in CI on every pull request, and on
pushes to `main`.

`npm start` serves `src/` on a local static server, as described in
[Run it on your computer](#run-it-on-your-computer). Set `MRT_PORT` to serve on a different
port, and `MRT_NO_OPEN=1` to stop it opening a browser for you.

`npm run contract` is deliberately not part of CI. It calls the live metadata API, so it
would fail builds for reasons unrelated to the change under test. Run it by hand before
trusting a release.

### Reviewing an update to a pinned action

The workflow calls each third-party action by a full commit revision rather than by a tag,
with the version it corresponds to written in a comment beside it:

```
- uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
```

A tag is a pointer the action's owner can move at any time. Calling one means agreeing in
advance to run whatever they publish next, on a runner that holds a token for this
repository. A revision cannot be moved, so what was reviewed is what runs.

Dependabot proposes the updates. It understands this form, so it raises the revision and
rewrites the version comment in the same pull request. Three things are worth checking
before merging one:

- The comment and the revision agree. Ask GitHub what the tag points at,
  `gh api repos/actions/checkout/commits/v7.0.1`, and compare it to the revision in
  the diff. A revision that does not match the version claimed beside it is the whole
  attack this pinning exists to stop, and it is the one thing a reader cannot check by eye.
  Read the tag through `commits` rather than through its ref: an annotated tag's ref names the
  tag object rather than the commit, so the ref route answers a different question and reports a
  mismatch on a perfectly good pin.
- The action still declares the inputs this workflow passes it, and a major bump has not
  removed one. Its `action.yml` at the new revision lists them.
- The runtime it declares is one the runners still support. A revision never follows its
  tag, so an action left pinned to an old major keeps its old runtime until someone moves
  it deliberately. That is the reason these are pinned to the current major rather than to
  the version they were first written against.

Tests enforce the shape rather than the judgement: every call is a full revision, every
revision carries a readable version comment, a container image is named by digest, no checkout
keeps its credentials, no install step runs dependency lifecycle scripts, and nothing runs the
package code that flag skips. They read every workflow and composite action the repository
tracks, so a second one added later is covered without anyone remembering to add it.

### Adding a curated reading list

Curated lists are data, not code. To add one, append an entry to
[`src/data/curated-lists.json`](src/data/curated-lists.json) and run `npm run vendor`.

To vendor a list is to fetch it once and commit what came back. The app then reads a file in this
repository, rather than calling the metadata API while someone is using it. The vendor script
loads the order, fills in the details of each issue, and writes the result into `src/data/`. It
then rebuilds `src/data/catalog.json`, so the new list appears in the catalog. No application
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
| `depth` | How much of the story the list covers: `essential`, `complete`, or `tie-ins` |
| `sourceUrl` | `https://` URL of the upstream Markdown checklist to vendor. Mutually exclusive with `sourceFile` |
| `sourceFile` | Plain `*.md` name in `src/data/orders/`, for an order authored here. Mutually exclusive with `sourceUrl` |
| `sourcePage` | Human-readable attribution link (defaults to `sourceUrl`) |
| `sourceOrigin` | Prose: where the order came from and who compiled it. This is what the catalog shows |
| `sourceLicense` | An SPDX expression, or `null` when no licence is conveyed with the order. Not a place for prose |
| `out` | Plain `*.json` file name to write into `src/data/` |
| `characters`, `keywords` | Extra terms the catalog search should match |
| `group`, `groupName`, `variant` | Optional. Ties this order to a story that has more than one reading path, so the catalog groups the versions under `groupName` and labels each with its `variant` |
| `expect` | Optional expected issue count; a mismatch is reported |

An entry that is missing or malformed fails the vendor run with the reason, so a broken
definition does not ship as a quietly shorter catalog.

`npm run vendor -- --only=<id>` rebuilds a single list. Re-vendoring everything to add one costs
hundreds of API calls, and it restamps the date on files whose contents did not change. Skipped
lists keep the JSON already committed for them, and their catalog entries are rebuilt from it.

A checklist line with no Marvel link becomes a placeholder: an entry you can see and tick off,
but not open, because there is nothing to open. Keeping it means the reading order stays complete
rather than quietly losing an issue, and the import notice says how many there are.

#### Orders grouped by collected edition

A checklist may divide its issues with `##` sub-headings. Each one names a collected edition, and
the issues beneath it are the issues that edition collects. The reading view then shows the
heading with its own progress, and the catalog says how many editions the order holds. An order
with no sub-headings is an ordinary issue order and is unaffected, which is what every order
shipped before this was.

Only `##` and deeper count. A `#` heading is the order's title, and it also ends any edition
already open, so an appendix under a second `#` is correctly left in no edition at all.

The grouping is the curator's, not Marvel's, and cannot be checked against the metadata: the API
serves collections from the same endpoint as issues, but it holds no collection record for
anything published after 2023, and where a record does exist the issues it collects are prose in
its description rather than a list. So a grouped order should say in its `description` where its
volume line-up came from and which issues it leaves out.

Read state is shared. An issue is read or unread for the whole app, so the same issue in a grouped
order and in an issue-by-issue order is one tick, not two.

#### Event orders, generated from Marvel's own metadata

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

Series are named by id, not matched by name. A name filter cannot tell an event from its own
sequel (`Civil War II`), its facsimiles or its handbooks, so the script records why each rejected
series was rejected, beside the ones it keeps. Trade collections need no rule, because Marvel
serves them from `/comics/collection/` instead of `/comics/issue/`. Where several issues shipped
the same day the main series is listed first, so it is never read after the tie-in that reacts to
it.

Because selection is by id, a series nobody listed would be silently absent rather than visibly
wrong, so that record of rejections is checked rather than trusted. `--audit` re-runs the name
filter across all 6,990 series and fails if any series it matches is in neither the include list
nor the rejection record. Run it before regenerating an order. It does not assert the reverse:
the name filter cannot find series Marvel never branded, which is the documented gap above.

The audit needs the whole catalogue to work from. It reads that from the committed
[`src/data/series-index.json`](src/data/series-index.json) that `npm run vendor:index` writes for
the search below, and pages the API only when it cannot.

It reads the file out of `HEAD`, not from the working copy, and only when the file covers the
whole catalogue. A short, malformed or uncommitted index is refused out loud, and the API is paged
instead. Reading the committed bytes is what lets that refusal mean what it says: whether a path
is tracked says nothing about whether its contents are still the reviewed ones.

The alternative is a shortcut nobody can check. An index holding three series still matches
something for every event, so it would pass a bare "did it match anything" test while leaving
almost the entire catalogue unaudited.

The output is committed, so an order arrives for review as a diff, and re-running the script
only changes the events whose upstream metadata changed.

### Searching for a series or a creator

The metadata API has a real search endpoint for issues, but none for series or creators.
`/series?q=` and `/creators?q=` accept the query and ignore it, returning the same records as no
query at all. A search for a creator called "Hickman" used to answer with "#O", "#X" and "A CO",
each offering to add every issue it had to your reading list.

Those two searches are therefore answered locally. `npm run vendor:index` pages the whole of
`/series` and `/creators` once, and writes
[`src/data/series-index.json`](src/data/series-index.json) and
[`src/data/creators-index.json`](src/data/creators-index.json). Each record is an
`[id, name, issueCount]` array rather than an object, which is about a third smaller.

The app fetches the file the first time you open one of those two search cards, never on page
load, and filters it in the browser. If the file cannot be loaded the search says so, and never
falls back to showing unfiltered results.

Both files are snapshots, in the same sense as the vendored reading orders: they record what
upstream held on the day they were built. A series added upstream after the last run is not
findable until `npm run vendor:index` is run again, which is why the results say when the
snapshot was taken. `npm run contract` asserts that `q` is still ignored upstream, so if the API
ever grows real search the check fails and these files can be deleted.

### Releasing

Versions follow the rule set out in [`src/js/lib/version.js`](src/js/lib/version.js): a MAJOR
bump means a build older than this one cannot read data saved by it. That matters because reading
progress lives only in the reader's own browser, and nothing can migrate it for them.

To cut a release:

1. Write the entry in [CHANGELOG.md](CHANGELOG.md) under the new version number, and commit it.
2. Run `npm version <major|minor|patch>`. This bumps `package.json` and the lock file, rewrites
   `APP_VERSION` to match, commits the lot, and creates the `v<version>` tag.
3. Push with `git push --follow-tags`.

Step 2 rewrites the constant through [`scripts/sync-version.mjs`](scripts/sync-version.mjs),
wired to npm's `version` lifecycle so it runs after the bump but before the commit. That
ordering matters: it means the number the browser reads and the number npm recorded agree in
every commit, rather than disagreeing in the gap between two of them. The constant is
hand-written rather than generated because the app has no build step, and
[`test/version.test.js`](test/version.test.js) fails if the two ever drift, so a mismatch
cannot reach the default branch.

## Disclaimer

Unofficial fan project. Metadata and links only: no comic content is hosted, stored,
proxied, or distributed. Reading Marvel comics requires your own Marvel Unlimited
subscription. Marvel and all related trademarks are the property of their respective owners.

## License

MIT, see [LICENSE](LICENSE). That grant covers what this repository authors: the app, the
scripts, the tests and the documents. It does not reach the Marvel metadata committed under
`src/data/`, which is not this project's to license on.
[The data provenance record](docs/DATA_PROVENANCE.md) sets out the boundary file by file, and
records the legal review still outstanding before the tree as a whole could be described as
MIT-licensed.
