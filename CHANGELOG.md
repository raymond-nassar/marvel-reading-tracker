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

### Added

- Deleting a list can now be undone. The confirmation says so, and afterwards a notice above every
  view offers "Undo delete" for the rest of the session rather than for a few seconds, because
  deleting the list you were reading moves you elsewhere and a timer would take the only way back
  while you were still deciding. The list returns to the position it held in the sidebar, and
  reading progress was never affected either way, since it is global and kept per issue. Erasing
  everything or restoring a backup drops the offer, because it would otherwise point at data that
  is no longer there.

### Changed

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
