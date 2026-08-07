# Changelog

Every notable change to Marvel Reading Tracker, newest first.

The version number is explained in [`src/js/lib/version.js`](src/js/lib/version.js) and is
summarised here: **MAJOR** means an older build cannot read data saved by this one, **MINOR**
adds a feature or changes the interface while leaving saved data readable by the previous
build, and **PATCH** fixes behaviour without touching either. Because reading progress lives
only in your own browser and no server can migrate it for you, export a backup before
upgrading across a MAJOR.

Releases are tagged `v<version>`. The version shown under **About this app** is the one to
quote in a bug report.

## Unreleased

### Changed

- The `.row` class no longer means two different things. A reading row and a form row shared it, and
  the page only rendered correctly because the form rule was scoped to `.stack` and `.card` and so
  out-ran the reading-row grid on specificity. That held by luck of placement rather than by design:
  the full order sits inside neither container today, and putting a reading list inside a card would
  have silently restyled every row in it. Form rows are now `.field-row`, the reading row keeps
  `.row`, and the leftover empty rule between them is gone. Nothing changes on screen.

- The README now assumes no prior experience. It was reviewed against a twenty-point readability
  rubric by following it literally in a fresh clone, and thirteen of the twenty criteria failed.
  Four of those failures stopped a non-engineer reaching a running app at all: the document named
  no address to open, named no prerequisite, had no troubleshooting section, and put the run
  instructions seventh of ten headings behind vendoring and search-index material. It now opens
  with what the app is and who it is for, then a numbered path from installing Node.js to looking
  at a working screen, each command saying what you should see when it worked. The address is
  written out in full, and there is a section on why it must not change: reading progress is filed
  by your browser under the exact address, so a different port, or `localhost` in place of
  `127.0.0.1`, shows an empty app while the real progress sits untouched at the old one. Both
  halves of that were confirmed in a browser rather than reasoned about. Contributor material is
  unchanged in substance but now grouped under one heading, out of a first-time reader's way.

- The BlueStacks section has moved out of the README to
  [`docs/WHY_A_BROWSER_APP.md`](docs/WHY_A_BROWSER_APP.md), with its wording unchanged. It records
  why this is a browser companion rather than a way to run Marvel's Android app on a PC, which is
  worth keeping so nobody retries the emulator route, but it answered a question nobody trying to
  run the app is asking and it sat second of the README's headings. A reader met a page of ARM64
  driver architecture before anything about starting the app. The README links to it from the
  contributor section.

- Two README statements were corrected. It said the tests and linter run "on every push"; the
  workflow scopes its push trigger to `main`, so a feature branch with no open pull request
  correctly produces no run, and there are three checks rather than two, since the evidence anchors
  gate runs alongside them. And the privacy line said your progress "is not uploaded anywhere",
  which is true but sat alone: the app does download comic details from the metadata API and cover
  images from Marvel's servers on an ordinary page load. Both are now stated together, because the
  promise worth making is the one a reader can check.

- Phone and tablet layout is out of scope. Marvel Unlimited ships iOS and Android apps that already
  carry reading lists, so the small-screen job is served first-party and building a second, worse
  one here would not help anyone. The tracker's posture is now stated rather than implied: it is a
  desktop companion to the Marvel Unlimited **web** reader, which is the platform where no list
  feature exists. BL-028 moves to the parked table in `PRODUCT_BACKLOG.md` with its score left in
  place as the record of what was given up, and the four UX findings behind it are marked accepted
  rather than open. No interface or behaviour changed, so nothing you have saved is affected. This
  is the largest Cost of Delay in the backlog being retired by a scope decision rather than by
  work, which is why it is written down at this length.

### Added

- Contributor instructions at `.github/copilot-instructions.md`, loaded automatically by GitHub
  Copilot in this repository. It records the gates and how to run them, the traps in the evidence
  anchors check, the workflow the project was originally built with and where its committed
  artifacts live, and the eleven standing product constraints. Two of those constraints could not
  be recovered from the tree and are marked as such rather than guessed at.

- Deleting a list can now be undone. The confirmation says so, and afterwards a notice above every
  view offers "Undo delete" for the rest of the session rather than for a few seconds, because
  deleting the list you were reading moves you elsewhere and a timer would take the only way back
  while you were still deciding. The list returns to the position it held in the sidebar, and
  reading progress was never affected either way, since it is global and kept per issue. Erasing
  everything or restoring a backup drops the offer, because it would otherwise point at data that
  is no longer there.

### Changed

- CI can now be started by hand on any branch or tag, from the Actions tab or with
  `gh workflow run CI --ref <branch>`. It previously ran only in response to a push or a pull
  request, so a commit could only ever be tested at the moment it arrived. During a GitHub
  Actions incident on 2026-08-06 run creation stalled for hours and three merges reached the
  default branch with no run recorded against them, which left nothing to retry: a commit that
  never got a run has no run to re-run. The manual trigger is the way back from that.

- Naming a list and confirming a destructive action now happen in the page instead of in a
  browser dialog. The old `prompt()` and `confirm()` could not be styled or announced through
  the app's own live region, blocked the page, and on a browser told to suppress them a rename
  silently did nothing while a deletion was answered for you. Curated import failures are
  reported next to the catalog rather than in an `alert()`, so the reason and the thing it is
  about can be read together, and the notice appears wherever the reader is rather than in a
  view they may have already left.

### Fixed

- Screen readers no longer say every change twice. Six result panes were live regions that also
  copied their summary to the announcer, so both were read; now each message goes down exactly
  one channel. Three headings that were empty until something rendered into them carry text from
  the start, one of which also names its section. The availability wording moved out of a `title`
  attribute, which touch users cannot reach and several screen readers skip, into text inside the
  badge.

## 1.0.0

The first tracked release. Everything before this point is in the git history but was never
given a number, so this entry records the state the project is being pinned at rather than
pretending to reconstruct forty-four commits of changes.

The app at 1.0.0 tracks reading progress through curated Marvel reading orders, entirely in
the browser. It reads issue, series, and creator metadata from the community
`marvel.emreparker.com` API, stores no comic content, and links out to Marvel's own reader.
Data format version 2.

### Added

- Continuous integration on every push and pull request, running the test suite on Node 20
  and Node 24 and running the linter. Previously nothing ran automatically, so a broken test
  could reach the default branch unnoticed.
- ESLint with a flat config derived from a measured survey of the code already in the repo,
  rather than an off-the-shelf style that would have reflowed working code.
- A content security policy and `X-Frame-Options: DENY` from the dev server, with every
  inline script and style moved into its own file so the policy could be strict rather than
  nominal.
- The version and data format number under **About this app**, so a bug report can name the
  build it is about.
- This changelog.

### Fixed

- `npm test` found no tests at all on Node 20, the version the project declares as its
  floor. The script passed a glob to `node --test`, which only started expanding globs after
  Node 20. Anyone honouring the declared engines range saw a green run over zero tests.
- Read rows were dimmed with `opacity: .48`, which pushed their text below the contrast
  minimum. They now use colours chosen to stay legible, with the strikethrough left to carry
  the "already read" meaning.
- The accent red failed contrast in both of the jobs it was doing at once. It is now two
  values: one for filled surfaces behind white text, one for red text on the dark
  background.
- Text over the hero image could fail contrast depending on which cover art the user had
  imported, because the image bled through a translucent gradient. The gradient is now
  opaque enough that the text passes against any possible cover, not just the sampled ones.
- The comment describing issue availability said there were four states when the code has
  five.

[1.0.0]: https://github.com/raymond-nassar/marvel-reading-tracker/releases/tag/v1.0.0
