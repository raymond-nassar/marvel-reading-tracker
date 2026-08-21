# Recap Page

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

![The Reading list catalog screen. A sidebar down the left lists your reading orders, library views
and ways to add issues. The main panel has a search box and a row of chips that filter the list, then
a section headed "The shared story", described as events and eras in the order they happened. Its
first entry, Essential Avengers, carries a green "Start here" badge beside a line reading "The Modern
Avengers, step 1 of 10, next: Avengers Disassembled", and below it Avengers Disassembled is step 2 of
10. Each order says what it covers, who compiled it and where it came from, and has an Import
button.](docs/screenshots/catalog-shelf-1280.png)

The catalog is where you pick something to read. Every order shown ships inside the app, so
importing one needs no internet connection, and the one to read first is marked.

## Start here

### On Windows

**[Download the tracker](https://github.com/raymond-nassar/recap-page/releases/latest/download/marvel-reading-tracker-windows.zip)**, unzip it, and double-click **Start on
Windows.cmd** inside.

That is the whole thing. There is nothing to install, and no account to make. The download is
about 34 MB because everything the tracker needs to run is inside it.

Windows may warn you once, because the file came from the internet. On the unzipped folder, or on
the first run, choose **More info** and then **Run anyway**. That prompt is expected, and
[what it is](#the-first-run-warning) is explained below.

### On a Mac, or if you would rather build it yourself

Three things, once. After that, starting the app is one double-click.

1. **Install Node.js.** It is free, and it is the only thing you need that does not come with
   this project. Get it from [nodejs.org](https://nodejs.org), and take the "LTS" version if
   you are offered a choice.
2. **Download this project.** Use the green **Code** button near the top of this page, choose
   **Download ZIP**, and unzip it wherever you keep your files.
3. **Double-click the start file** inside the folder you just unzipped: **Start on
   Windows.cmd** on Windows, or **Start on macOS.command** on a Mac.

### Either way

A small window opens and stays open, and your browser opens the app by itself. That window is
the app running, so leave it alone until you are finished. To stop, click that window and
press **Ctrl+C**. Your reading progress is kept by your browser, so stopping the app never
loses it.

Both routes open the app at the same address, so they are the same app with the same reading
progress. You can start with the download and switch to the source later without losing anything.

Once the app is open, your browser will offer to
[install it](#optional-install-it-as-an-app), which gives the tracker its own icon and its own
window. After that the icon opens the tracker whether or not the app is running.

### Getting updates

The app checks GitHub once a day by default to ask for the latest version number. That request sends
no reading list, progress, note or identifier. If a newer version exists, the app shows a notice with
a direct download link and a link to what changed.

The app never downloads or installs an update by itself. You download the new zip, unzip it and start
the new copy. Your reading progress carries over because it is saved by your browser at the same app
address, not inside the folder you replace.

If you do not want the daily check, open **Backup & settings**, find **Update checks**, and switch off
**Check for updates automatically**. The button under **About this app** still lets you check by hand.

The longer version of all this, with what to do when a step goes wrong, is in
[Run it on your computer](#run-it-on-your-computer) below.

### The first run warning

Whichever route you took, Windows or macOS may ask you to confirm the first time, because the
files arrived from the internet. This is expected, and it is not a sign anything is wrong.

On Windows, choose **More info** and then **Run anyway**. On a Mac, if double-clicking does
nothing or the file opens in a text editor instead, right-click it, choose **Open**, and confirm.

The warning is the operating system saying it cannot vouch for who wrote a file, which is true of
anything not signed by a paying software company. Nothing here is hidden from you: every line of
this app is on this page, and the runtime inside the Windows download is the official one from
[nodejs.org](https://nodejs.org), fetched and checked against its published checksum when the
download is built.

## What it does

- Build and keep multiple **reading lists**, in order
- Track **read / unread** per issue, with progress per list and per series
- Show an **Up Next** card so you know where you resumed
- **One click into the Marvel Unlimited web reader** for the next issue
- Badge every issue with whether it looks like it is **on Unlimited yet**
- Import curated **reading orders** (Markdown checklists, or plain issue titles)
- **Duplicate a list** to try a different path through an event, keeping shared read progress
- Export to Markdown / JSON, and restore from backup

### Modern Marvel guide intake stays build-time only

This repository tracks a build-time intake program for modern Marvel continuity guides. Its first
two approved batches add twenty ordinary catalog orders containing 416 distinct issues, while the
maintained inventory, source mappings, resolver, and overlap reports stay outside the browser. Only
the authored checklists and their vendored issue data ship with the app. The flow adds no runtime
dependency, credits Comic Book Herald on every resulting card, links each card to the exact guide
followed, and blocks a candidate instead of guessing when issue identity or overlap is unresolved.

### Your data stays with you

There are no accounts to create and nothing to sign in to. Your reading progress is saved by
your own web browser, on your own computer. It is never sent anywhere, and there is no
analytics or tracking of any kind.

To be exact about what does leave your computer: when the app starts it asks the comics database
whether it is reachable, so it can tell you when it is not. Searching for issues sends what you
typed, and so does asking an imported line to find its own match; searching the catalog, series or
creators is answered from files already on this machine, but adding a whole series or a creator's
issues then asks that database for every issue it lists, which is the longest run of requests the
app makes. To show you comic titles, dates and cover pictures, it downloads those details from that
same public comics database and downloads the cover images from Marvel's own image servers. Those
images come from that one server and no other: the database reports each cover address, and one
naming a different host is refused rather than fetched, so a database that had been tampered with
cannot point your browser at a server of its own. That is the same kind of request your browser
makes when it loads any web page. Those requests do reveal which issues you are looking at, because
asking for an issue's details or its cover picture is exactly what they are. Turning cover art off
stops the covers being requested at all. What is never sent is your reading progress, your notes,
or anything identifying you.

GitHub is contacted once a day by default to ask for the latest release version, and you can switch
that off under **Backup & settings**. The request sends no reading data, no note and no identifier.

One other site is contacted, and only if you ask it to be. Adding an issue by hand sends the words in
the title box to the Marvel Fandom wiki, a community site Marvel does not run, and it does that
only when you press the lookup button. It is there because the comics database this app reads stops at
October 2025, so for a newer comic the wiki is the only place a release date, a page count or a list
of credits can be found. That wiki sees the title you searched for; your lists, your progress and
your notes are no part of the request, and no picture is fetched from it.

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
git clone https://github.com/raymond-nassar/recap-page.git
cd recap-page
```

You should now see a lot of file names scroll past, ending with your prompt sitting in the
new folder. If you downloaded the ZIP instead, just unzip it and `cd` into the folder.

### Step 2: Start the app

There are two ways to do this, and they do exactly the same thing. Pick either one.

**Double-click a file.** In the folder from step 1, double-click:

- **Start on Windows.cmd** on Windows
- **Start on macOS.command** on a Mac

A terminal window opens and stays open. That window *is* the app running, so leave it alone
until you are finished for the day.

The first time, your computer may ask you to confirm, because the file arrived from the
internet. On a Mac, if double-clicking does nothing or the file opens in a text editor
instead, right-click it, choose **Open**, and confirm.

**Or type a command,** if you are comfortable in a terminal. Open one, go to the folder from
step 1, and run:

```
npm start
```

Either way, you should see exactly this:

```
Recap Page running at http://127.0.0.1:8787/
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

### Optional: install it as an app

Once the page is open, most browsers will offer to install it. In Edge or Chrome, look for an
install icon at the right-hand end of the address bar, or open the browser menu and choose
**Install** or **Apps**, then **Install this site as an app**. Safari calls it **Add to Dock**.

Installing gives the tracker its own window, without the address bar and tabs, and an entry in
the Start menu, the Dock or the applications list. It is the same app with the same reading
progress, opened at the same address, so nothing you have saved is affected either way. You can
uninstall it from the same menu.

**The installed icon opens whether or not the app is running,** because the browser keeps its own
copy of the page after your first visit. What you get with nothing running is the tracker exactly
as you left it: everything you have marked as read, every list you have made, all of it. What you
do not get is anything that has to be fetched while you are there, so covers that have never been
shown before stay blank and looking up a comic's details will not work until you start the app
again.

So the honest version is that step 2 is still worth doing, and the app is better with it running.
It is just no longer the difference between a working app and an error page.

### Stopping it, and starting it again another day

To stop the app, click the terminal window where it is running and press **Ctrl+C**. On a
Mac this is still Ctrl+C, not Command+C. You can then close the window.

Your reading progress is not lost when you stop the app. It stays in your browser.

To start it again another day, double-click the same file you used in step 2, or open a
terminal, go back to the folder, and start it again:

```
cd recap-page
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

**Double-clicking the start file does nothing useful**

Both start files are written to stay open and say what went wrong, including when Node.js is
missing, so read whatever is in the window before closing it. If the window vanishes with
nothing in it at all, start the app the other way instead, by opening a terminal and running
`npm start` in the folder, because the terminal will keep the error where you can read it.

On a Mac, if the file opens in a text editor instead of running, right-click it and choose
**Open**. If it says permission denied, open Terminal, go to the folder, and run
`chmod +x "Start on macOS.command"` once.

**The page is blank, or nothing loads**

Check the terminal window where you started the app is still open and still shows the
"running at" message. If it has closed or shows an error, the app is not running. Also check
you typed the address exactly, including the `http://` at the start.

Once you have opened the app at least once, your browser keeps its own copy of it, so the page
may well load even with nothing running. What will not work then is anything that has to be
fetched at the time, such as a cover you have never seen before.

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

Contributing: [the contributing guide](CONTRIBUTING.md) sets out what this project will decline
whatever the merits, how a change is judged, and why the fault harness needs two backups taken
before you open it. Read it before writing anything.

Getting help: [the support guide](SUPPORT.md) covers where to take a question, how to tell a
metadata outage from a bug in this app, and which problems belong to Marvel or to the upstream
database rather than here.

Conduct and decisions: [the code of conduct](CODE_OF_CONDUCT.md) applies to everything in this
repository, and [the governance record](GOVERNANCE.md) says how roadmap, release, moderation and
maintainer decisions get made.

Publishing: [the publication runbook](docs/PUBLICATION_RUNBOOK.md) is the record of the day this
repository was published, on 2026-08-16: the passages that were true only while it was private, the
three GitHub settings publication unlocked, and the legal question accepted rather than answered.

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
npm run sizes
npm run palette
npm run publication
```

`npm test` runs the unit tests. `npm run lint` runs ESLint. `npm run anchors` checks that
every `path:line` citation in the tracked files still points at lines saying what the
citation claims. `npm run counts` recomputes the figures the backlog states about its own
ranked table, such as how many rows it has and where an item ranks, and fails with the
derived value when the prose disagrees. `npm run sizes` does the same for a sentence stating
how many lines a file has, recounting the file it names. `npm run palette` checks colour contrast
against the thresholds the interface promises. `npm run publication` checks that nothing in the
tracked files or in the history would be a problem if this repository were made public.
All seven run in CI on every pull request, and on pushes to `main`.

`npm start` serves `src/` on a local static server, as described in
[Run it on your computer](#run-it-on-your-computer). Set `MRT_PORT` to serve on a different
port, and `MRT_NO_OPEN=1` to stop it opening a browser for you.

`npm run contract` is deliberately not part of CI. It calls the live metadata API, so it
would fail builds for reasons unrelated to the change under test. Run it by hand before
trusting a release.

### The browser check

```
npm run browser
```

Drives installed Microsoft Edge through the eight journeys the app exists for: importing a
curated order, moving between views with the address bar and the Back button, keeping progress
across a reload, meeting unreadable saved data with an offer rather than a wipe, opening the
reader tab inside the click that asked for it, counting a synopsis run by what arrived rather
than by what it asked for, filling a hand entry from the wiki while refusing an issue already
held, and turning a pasted reader address into a working Read button. It makes 53 assertions
across those eight and takes about 6 seconds.

It needs two things that are not installed for you. The first is a browser driver, which is
**deliberately not a dependency of this repository** and must not become one: nothing the app
serves depends on it, and `npm ci` should stay as small as it is. Install it outside the tree:

```
mkdir ~/.mrt-scratch && cd ~/.mrt-scratch
npm init -y && npm i puppeteer-core
```

The second is Edge itself, at one of the usual install paths. If either lives somewhere else,
`MRT_PUPPETEER` and `MRT_EDGE` name them. A missing prerequisite exits **2** and prints how to
fix it, which is a different answer from a failed assertion exiting 1: "the driver is not here"
and "the app is broken" should not look alike. `MRT_HEADED=1` shows the browser doing the work.

It is not part of CI, because CI has neither Edge nor the driver.

**It writes nothing you have to clean up, and it cannot touch your reading progress.** The check
serves the app on an ephemeral port rather than 8787, and a different port is a different storage
bucket, so what it saves and corrupts is discarded with the browser it ran in. That is the same
rule as [Always open the same address](#always-open-the-same-address), pointed the other way: what
makes the app fussy about its address is what makes this check safe to run. Catalog data is
stubbed with a three-issue fixture, so no vendored file is read and no network request is made.

```
npm run browser:prove
```

Runs each of the seven scenarios again under eleven injected faults, and checks that each fault
turns the scenario aimed at it red. A check that has never been seen to fail is not evidence, and
this is where that is demonstrated rather than asserted: it reports the named assertion each fault
breaks. It takes about three minutes, nearly all of it waiting out the timeouts a broken app
produces, so it is a thing to run when the scenarios change rather than on every commit.

### The upgrade check

```
npm run upgrade
```

Drives the upgrade that the in-app update notice tells you to perform. The notice says your reading
progress is kept by the browser rather than in the app folder, so replacing the folder keeps
everything and the old folder can be deleted. That sentence is the only thing standing between you
and deleting a directory you believe is disposable, so it is driven rather than reasoned about. Two
copies of the app are installed under the system temporary directory at different version numbers,
each served by the real server, an order is imported into the first, that copy stops, and the second
takes the address the first was using. Ten assertions cover which build is actually being served
after the swap, the saved order surviving it by identity and by issue order, and the upgraded copy
drawing that order and its progress. It takes about 8 seconds.

The last of the ten is a control. The same new copy is served at a second address, where the
progress has to be absent. Without it the check would pass just as happily if the progress were
being read out of the folder, which is the opposite of what the notice claims.

It needs the same two things the browser check needs, answers a missing one the same way with exit
**2**, and is left out of CI for the same reason. It writes nothing outside the system temporary
directory and deletes both copies when it finishes, and it serves on ephemeral ports rather than
8787, so it cannot reach your reading progress.

```
npm run upgrade:prove
```

Runs the check four more times with one thing deliberately broken in each, and reports which
assertion each break turns red. It takes about 32 seconds. One of the four starts the upgraded copy
on a different port, which is the one way that following this advice really can lose everything, and
is [Always open the same address](#always-open-the-same-address) seen from the other side.

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
| `timeline` | Optional whole year of 1939 or later: where the *story* starts, not when it was published. It orders the catalog, and the shelf prints it as "Starts 1963". Leave it out for an order that ranges across the timeline rather than sitting on it, such as a best-of |
| `group`, `groupName`, `variant` | Optional. Ties this order to a story that has more than one reading path, so the catalog groups the versions under `groupName` and labels each with its `variant` |
| `expect` | Optional expected issue count; a mismatch is reported |

An entry that is missing or malformed fails the vendor run with the reason, so a broken
definition does not ship as a quietly shorter catalog.

`npm run vendor -- --only=<id>` rebuilds a single list. Re-vendoring everything to add one costs
hundreds of API calls, and it restamps the date on files whose contents did not change. Skipped
lists keep the JSON already committed for them, and their catalog entries are rebuilt from it.

#### Building a Comic Book Herald continuity packet

The maintained program begins with `npm run cbh:prepare`, which refreshes deterministic issue
candidates for the declared source pages and leaves ambiguous or unmatched rows blocked. Every
authorable mapping then needs a complete report from `npm run orders:overlap`, an independent review
of its source count, issue sequence, timeline, cover and provenance, and an explicit approved state.
Approved mappings are left untouched. `--refresh-approved` updates their resolver evidence only when
the selected sequence and manifest fields are unchanged; `--force-approved` deliberately returns
them to pending review.

`node scripts/author-cbh-packet.mjs` writes Markdown and manifest entries only from those approved
mappings. It drops mapping-only review fields, preserves the reviewed issue order, and refuses any
non-`none` overlap. Vendor only the approved ids afterwards. Every resulting card must credit Comic
Book Herald, link to the exact guide followed, use
`Compiled for this project from Comic Book Herald's guide` as `sourceOrigin`, and keep
`sourceLicense` null.

A checklist line with no Marvel link becomes a placeholder: an entry you can see and tick off,
but not open, because there is nothing to open. Keeping it means the reading order stays complete
rather than quietly losing an issue, and the import notice says how many there are.

#### Reading paths

`group` says two orders are two readings of one story. Nothing said that one story is read *after*
another, which is the question a reader who has never read a Marvel comic actually asks. A reading
path answers it: a named, ordered sequence of stories, declared once beside the lists.

```json
"paths": [
  {
    "id": "modern-avengers",
    "name": "The Modern Avengers",
    "description": "What the shelf says the path is for.",
    "sourceOrigin": "Compiled for this project. Seven stops follow ...",
    "steps": ["essential-avengers", "avengers-disassembled", "house-of-m"]
  }
]
```

Each step is a list `id`, not a story key. The id namespace is already checked for uniqueness, so a
typo is caught rather than resolved to the wrong thing; naming the order also records which reading
the source chose; and a story key is an internal shape that has no business being typed into
hand-authored data. The app resolves each step to its story, so a stop is shown under the name the
shelf uses. Naming either reading of House of M places the House of M row, not one version of it.

An array rather than a `follows` field on each entry, and that is the whole design: an array cannot
contain a cycle, its next stop is the next element, and it starts where it starts.

`sourceOrigin` is required. A path is a claim this repository makes about how stories connect, and
no upstream publishes one in this form, so the shelf has to be able to say who compiled it and from
what. The vendor run refuses a path with a step naming no list, two steps in one story, fewer than
two steps, or a duplicate `id`.

Nothing checks that the stops do not overlap, because nothing can: two orders sharing an issue is
legitimate everywhere else in the catalog. What keeps the shipped path honest is a test that reads
every order behind every stop and asserts no two stories share an issue, at any reading depth. Add
a stop that overlaps another and that test fails with the pair named.



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

1. Write the entry in [CHANGELOG.md](CHANGELOG.md) under the new version number.
2. Run `npm version <major|minor|patch> --no-git-tag-version`. This bumps `package.json` and the
   lock file and rewrites `APP_VERSION` to match, without creating a tag.
3. Commit, open a pull request, and merge it.
4. Build the archive with `npm run pack`, then create the release from the merged commit with that
   archive attached. Creating the release is what creates the `v<version>` tag.

The tag is deliberately not created locally, which is why step 2 passes `--no-git-tag-version`.
Branches here are squash-merged, so a tag made before the merge points at a branch commit that
never reaches the default branch, and the release would name a commit nobody can check out from
it. Creating the tag from the merged commit instead is what `v1.1.0` did, and its tag resolves to
the squash commit on the default branch rather than to the branch it was written on.

Step 2 rewrites the constant through [`scripts/sync-version.mjs`](scripts/sync-version.mjs),
wired to npm's `version` lifecycle so it runs as part of the bump rather than after it. That
ordering matters: it means the number the browser reads and the number npm recorded agree in
every commit, rather than disagreeing in the gap between two of them. The constant is
hand-written rather than generated because the app has no build step, and
[`test/version.test.js`](test/version.test.js) fails if the two ever drift, so a mismatch
cannot reach the default branch.

The download link in [Start here](#start-here) points at the latest release rather than at a
version, so publishing a release is also what replaces the file a reader downloads. A fix that is
merged but not released is not a fix any reader has.

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
