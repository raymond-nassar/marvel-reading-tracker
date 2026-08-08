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

- **The address bar now knows where you are.** Until now the app lived at one address no matter
  what you were looking at, so the browser's Back button dropped you out of the app entirely, a
  reload always dumped you back on the reading view, and there was no way to bookmark a particular
  order. All three now work the way you would expect from any other site. Move between views and
  the address updates; press Back and you return to the view you came from; reload and you land
  exactly where you were, on the same reading order. You can bookmark a specific order, keep two
  open in two tabs, and send yourself a link that opens straight to the one you meant.
  If you follow an old link to a list you have since deleted, the app quietly puts you somewhere
  real and tidies the address rather than showing you an empty page.

- **A light theme, and a Theme setting under Data.** The app has only ever had one look, a dark
  one. There are now three choices: follow whatever your computer is set to, always dark, or
  always light. The default follows your computer, so if your machine switches to light in the
  morning the tracker does too, without you touching anything, and switches back at night. Pick
  dark or light explicitly and that choice sticks and overrides your computer's. It is remembered
  in this browser alongside your other settings and, like everything else here, is never sent
  anywhere.
  Two things worth knowing. The dark theme has not changed at all. Every colour in it was compared
  before and after this work, all 194 of them, and none moved, so if you never touch the setting
  you will not notice a thing. And the app now checks its own colours: every text-and-background
  combination in both themes is measured against the accepted readability standard each time the
  project builds, rather than being claimed in a comment nobody re-checks.
  That check found three things that were already too faint before this change, in the dark theme
  you have been using since the first release: the outlines of bordered buttons and text fields,
  the outline of an unticked checkbox, and the empty part of a progress bar. They are not made
  worse by this change and the light theme has the same three. They are recorded and scheduled to
  be fixed together rather than quietly patched here, because darkening them changes how every
  button and checkbox in the app looks, which is a bigger decision than adding a theme.

- **A short version of three event reading orders.** The catalog could already show two versions of
  one story side by side, and the Hickman run used it, but every event was offered only in full:
  House of M at 20 issues, Civil War at 31, Secret Invasion at 36. Each of those three now has a
  second, shorter option beside it, containing only the main series: 8, 7 and 8 issues. They appear
  together under one heading, so you pick how much you want to read rather than choosing between
  what look like two unrelated lists.
  Annihilation and King in Black deliberately do not get one, and this is the part worth knowing.
  For both of them the main series is not where the story starts. Annihilation opens with a prologue
  and four mini-series, seventeen issues before the main series begins, and King in Black opens with
  a Symbiote Spider-Man issue. A main-series-only list for either would start you in the middle
  while calling itself the essential path, so the build refuses to make one and says why.
  Nothing about the lists you have already imported changes.

- **Two new Library pages: Everything read, and Added by hand.** The rail's Library section had one
  entry, Progress by series, where the adopted design showed three. The two missing ones are now
  there. Everything read lists every issue you have ticked off, newest first, and Added by hand
  lists every issue you typed in yourself. Each row says which of your lists it belongs to, and
  each page tells you how many issues it is showing.
  The interesting part is what Everything read can show that nothing else could. Deleting a reading
  list has always been careful not to throw away your progress, because the same issue may be in
  another list too. The side effect was that an issue you read inside a list you later deleted
  vanished from the app entirely: it was still recorded, but there was no page it appeared on.
  It appears here, and says "In no list" rather than leaving the space blank, so it reads as a fact
  about your library rather than as something that failed to load. Neither page changes anything;
  they only show you what is already saved.

### Fixed

- **Restoring a backup made by a much older build could show "Invalid Date" as a reading date.**
  Only backups written by the earliest data format were affected, and only if one of them held
  something other than a number where the reading date belonged. Restoring such a backup put the
  words "Invalid Date" on screen wherever that issue's date was shown, and sorted it to an
  arbitrary place. Nothing was lost and nothing else misbehaved, but it looked like a fault
  because it was one. Reading dates are now cleaned up wherever they are recorded rather than on
  one of the two restore paths, so a date the app cannot make sense of becomes the time of the
  restore instead of appearing as broken text.

- **The no-em-dash rule now covers the page and its styling, not only the JavaScript.** When that
  rule was first automated it was written as a lint rule, and lint reads JavaScript. Every word the
  app puts on screen from the page files or the stylesheets was outside it, so the check reported
  green over ground it never looked at. A test now sweeps everything served, found by walking the
  folder rather than by a list of the six files that exist today, so a seventh added later is covered
  without anyone remembering to add it. Comments are skipped, which is not a shortcut: the JavaScript
  rule already ignores comments, measured by running a dash through one, so catching them here would
  hold the page to a stricter standard than the code. Styling can also put a character on screen with
  no words behind it, and the app already does this for the little arrow on a collapsible card, so
  that counts as on-screen wording too and is covered. Nothing in the app breaks the rule today; this
  is about the next thing written, not this one.

- **The backlog checker now refuses a passage that is written twice.** A detail block in the backlog
  stated the same four lines over again, word for word, and it was the paragraph warning a reader
  against a specific misreading, so the stutter landed where it could do most harm. Nothing could
  have caught it: the citation checker only fingerprints lines something quotes, and these were not
  quoted, while the count checker looks at numbers. The checker already refused a whole entry that
  appeared twice, which is the same copy-and-paste slip one size larger, so this is the finer version
  of a rule that was already there. It deliberately looks at the whole document rather than at the
  entries alone, because copying and pasting does not respect a section boundary, and it needs no
  list of exceptions to stay quiet: run over every file in the project before it was written, it
  found exactly one repeat, which was the defect. Four tests cover it and every one of them was
  watched failing first.

- **The rule against em dashes in on-screen wording is now enforced by the toolchain.** The
  repository has a standing rule that the words the app shows you contain no em dash, but nothing
  ever checked it, so two had been sitting in shipped wording for months and were found only when
  somebody read the source line by line. Worse, the hand-written scan that was meant to catch them
  was proved unable to fail at all. Two checks now do the job properly. The linter refuses a dash
  inside any piece of text the app's own code can display, and it works on the parsed structure of
  the code rather than on its raw text, so it can tell an on-screen word from a note left for a
  future developer and never complains about the latter. Its reach stops at JavaScript, so wording
  written directly into the page's HTML or its styling is not covered; that wording was checked by
  hand and contains none today, and closing the gap properly is filed as its own item. A test refuses
  one in the title line of the reading checklists, five of which this repository generates and one of
  which is written by hand. Both were deliberately run against the unfixed code first, and both
  failed there, which is the only way to know a check can fail at all.

- **A count stated in the backlog's prose is now checked against the table it is derived from.**
  The evidence anchors gate fingerprints the lines a citation names, so it reports a sentence as
  sound however wrong the numbers inside it have become. That is how one figure here stayed wrong
  across twelve consecutive shipped items with every check green, and how a pass that went looking
  for stale figures still missed one it was explicitly hunting. `npm run counts` recomputes the
  ranked table's row count, each item's rank, the status tally and the list of delivered items, then
  fails with the derived value when the prose disagrees. It also enumerates rows against detail
  blocks in both directions, which is the check that would have found the one row that had no block.
  It runs in continuous integration beside the anchors gate, so there are now four checks rather
  than three. Scope is deliberately the part a machine can settle: figures derived from the table in
  the same file. A figure that needs the working tree, such as how many lines a source file has, is
  out of reach by design, because deciding which number in an arbitrary sentence is derived and from
  what is not a tractable problem. A claim about a past state is exempted by a marker written into
  the source, which is invisible when the document is rendered, so satisfying the checker never
  changes what a reader sees. Pointed at the tree as it stood a few commits ago, it reports fifteen
  findings, every one of them a real defect that was found by hand at the cost of a research cycle.

- **Progress by series** now counts the list you are reading, not everything you have ever
  imported. Import a second order and the totals used to grow even though nothing about the
  crossover in front of you had changed, which made the one number a reader most wants to act on
  the one number they could not trust. A new choice above the results switches between **This
  list** and **All lists**, and the subtitle says which of the two it is showing rather than always
  claiming it counts every list. The cross-list total is still one click away, because sharing read
  state between lists is deliberate: an issue in two orders is read in both. The choice is not
  saved between visits, unlike the reading filter, because the useful answer is almost always about
  the list you are reading now.

- **About this app** now lists the keyboard shortcuts. Enter and D were only ever advertised on the
  hero button in the reading view, so once you had scrolled past it there was nothing in the
  interface to remind you what was available, and the sidebar binding was only ever in the toggle
  button's tooltip, which a touch screen never shows at all. The reference is in one place and the
  hero keeps its own hint, so the shortcut is still shown at the point of use.

- The filter above the full reading order is remembered. Choosing Unread, Read, In Unlimited or
  Details pending used to last only until the page was reloaded, at which point you were silently
  shown everything again. It is now saved with your other settings and restored on start, so a long
  order you are working through the Unread way stays that way. There is one filter, shared by every
  reading order, which is how it already behaved while the app was open. Anything unrecognised in
  storage falls back to All.

### Changed

- **Three parts of the app that talk to the browser now have tests, where before they had none.**
  These are the piece that remembers downloaded issue details so the app does not fetch them twice,
  the piece that fills in issue details in the background while you read, and the piece that puts
  the app's own question boxes on screen in place of the browser's. All three were untested because
  testing them normally means a real browser; they are covered now by standing in fakes for the two
  browser features they use, so they run in the ordinary test run with nothing new installed. Forty
  tests were added, taking the suite from 334 to 374.

  Every one of the forty was then checked by deliberately breaking the app in twenty-two different
  ways, one at a time, and confirming the tests noticed. That found four problems, and all four
  were in the new tests rather than in the app. Two tests had been quietly covering the same thing
  twice while leaving a real safeguard unchecked, so a genuine bug slipped past them. Three of the
  deliberate breakages made the test run hang forever instead of failing, which on the build server
  would have meant hours of waiting and no explanation; the tests now give up after two seconds and
  report the failure. One test only looked like it was working: it checked the app's saved data
  was unchanged, but the fault it was aimed at leaves the data alone and instead saves it again for
  no reason, so it now counts the saves. And the stand-in for the browser's storage was handing back
  the stored item itself where the real one hands back a copy, which made a test of "reading an item
  marks it as recently used" pass even with that step deleted; since the app uses recency to decide
  what to discard when the store is full, nothing was actually holding that up. The stand-in now
  copies, like the real thing. Each was fixed and re-checked before this was called done.

  The fourth part of the app named in this work, the large file that draws the screen, is not covered
  and could not be. It cannot even be loaded outside a browser, so there is nothing for a test to
  take hold of. That is recorded as its own piece of work rather than quietly dropped.

- **Two small pieces of on-screen wording were rewritten.** Hovering a list in the sidebar used to
  show its name and progress joined by a long dash; a colon now does that job, which reads as the
  label and value it always was. The button under each catalog list used to repeat the issue count
  before inviting you to open it, and now simply reads "See the full list", because the count is
  already printed on the same card directly above the button. Dropping it also quietly retired a
  wording bug that would have said "1 issues" for a single-issue list, which no list in the catalog
  is small enough to have triggered. The titles of the six reading checklists changed the same way,
  from a long dash to a colon, which matters because importing one of them takes the list's displayed
  name straight from that title.

- **A changelog entry no longer needs editing every time an unrelated change lands.** The entry
  below that explains how two audited figures went stale had been quoting what those figures were
  today, so it went stale itself twice in two shipped items, both times only because a source file
  grew and a test was added. The rule now applied is that a figure belongs in a release record when
  it is a property of the change and does not when it is a property of the tree, because only the
  second kind moves without anyone editing the record. The audited values stay, since they are the
  measurement being described. The current values are gone, and the entry points at
  [`PRODUCT_BACKLOG.md`](PRODUCT_BACKLOG.md) instead, which already carries both live and is marked
  as needing re-derivation. A third figure of the same kind was found in the same entry and dropped:
  it put a modularity gap at a thousand lines, which the planned split of that file would have
  inverted outright. Three more elsewhere in this file are now tied to the moment of the change they
  describe rather than left in the present tense, one of which was about to be falsified by a fourth
  continuous integration check.

- Committing the prompt behind the eleven Repository Constraints is no longer planned, and
  [`.github/copilot-instructions.md`](.github/copilot-instructions.md) now says so where it used to
  promise the opposite. The prompt drove a single session's backlog and study pass, and a spent
  instruction to an agent is not an artifact the repository owes anybody. What mattered was the
  eleven constraints themselves, and those were already recovered into that file word for word. The
  practical consequence is worth stating plainly, because the file previously described its table as
  a copy held until the source landed: that table is now the only copy of the eleven that will exist
  here, so it is the source rather than a convenience duplicate of one. Parking it also retires the
  unbuilt "historical document" exemption the anchors gate would have needed, which now has no caller.

- Pull request bodies now open with a plain English summary, and
  [`.github/copilot-instructions.md`](.github/copilot-instructions.md) says what that means. The
  request came from the person reviewing them: the technical sections were written for a reader who
  already knows the codebase, and they were making a review harder rather than easier. Most work
  here changes documents rather than screens, so the sentence most worth writing is often the one
  saying that nothing a reader has saved is affected, and that sentence was never being written. The
  rule names no file, no identifier and no backlog id inside the summary, gives the reason before
  the mechanism, and caps it at four short paragraphs. The technical sections are unchanged and sit
  underneath, because the two halves serve different readers and the record needs both.

- The reading filters are defined once. The five choices above the full order used to exist twice
  over, as radio buttons in the page and as a chain of comparisons in the code, and the two had to
  agree without anything checking that they did. Adding a filter to the page and forgetting the
  comparison gave you a filter you could select, that was saved, and that filtered nothing: the list
  in front of you stayed exactly as it was, with nothing to say the choice had been ignored. Each
  filter is now one entry carrying its label and the rule it applies, the buttons are built from
  those entries, and a filter that is named without a rule stops the app on start with a message
  naming the file to fix. Nothing about the five filters themselves changed, and the same eight
  issues sort into the same five counts as before.

### Fixed

- **A stale test count and an over-broad claim, both found by review rather than by any gate.** The
  quality appendix still said 294 tests passed when 311 do, a figure of the kind no automated check
  reads. And the note recording that this project generates its six reading checklists was wrong
  about one of them: five are generated and the sixth is written by hand, which matters only because
  a claim that all six stay identical to a regeneration would have been quietly false for one file
  forever. The hand-written one was edited to match the other five anyway, and that edit is durable,
  because nothing regenerates or overwrites it.

- **The evidence-anchor gate now has the backlog entry it shipped without.** `BL-050` built the
  check that fails the build when a `path:line` citation stops naming the code it claims, and it was
  the only row in `PRODUCT_BACKLOG.md` with no detail block of its own. Two sentences at the top of
  that document promised a block for every delivered item, so both had been given an exception clause
  naming the gap. The research found the account was not missing but misfiled: it had been written as
  a continuation of the block above it, because the gate grew out of that item's digression about
  stale anchors and each of the five commits that extended it appended to the same run of prose. It
  now has a heading, a task list reconstructed from those commits, and a note saying the list is
  reconstructed. Both exception clauses are gone. Nothing in the app changed.

- **The eleven standing product constraints are now the original text rather than a
  reconstruction.** `.github/copilot-instructions.md` shipped with nine of them rebuilt from how
  they were cited and two marked unrecoverable, because the list had never been committed to this
  repository. The original was found in the prompt that drove the backlog and UX study pass, which
  is still untracked in the working tree. Constraints 8 and 9 are therefore recorded for the first
  time, and six of the nine reconstructions turned out to have drifted from the wording the backlog
  gate lines were actually checked against. Committing the source file was filed as BL-060 and parked
  on 2026-08-07, so the table in that file is not a copy of a source held elsewhere but the source
  itself. Nothing in the app changed.

- **Marking an issue read no longer throws away where you were.** The shelf and the full reading
  order are rebuilt from scratch on every change, and the control you had just used was destroyed
  along with everything else, so the keyboard was handed back to the page body with nothing said and
  nothing highlighted. Working down a long order by keyboard meant tabbing in from the top again
  after every single tick, and the same happened on reorder, on the availability flag and on remove.
  Focus now follows the issue rather than the button: the tracker remembers which issue you were
  acting on and what you were doing to it, and finds that control again after the rebuild. If the
  issue disappears from view, because the Unread filter no longer matches the issue you just ticked,
  focus moves to the issue that took its place, landing on its checkbox rather than on the button
  under your finger, so a held Enter can never repeat into a removal. If nothing is left at all, you
  land on the filter you chose, which is what put you there and what will undo it. The page does not
  scroll when it puts you back somewhere you were already looking.

- **Adding a reading order, and marking one read, no longer drop the keyboard on the floor.** The
  landing page is the one screen built to keep you where you are while you add a second or a third
  order, and it was the screen that moved you most: pressing **+ Add to library** by keyboard handed
  focus straight back to the page body, and it was still there a second and a half later once the
  card had settled into **Open**. Getting to the next order meant tabbing in from the top of the
  page again. The same thing happened in the sidebar list of your orders, which is rebuilt every
  time anything changes: with one of its buttons focused, pressing D to mark an issue read left you
  nowhere, on a screen that otherwise had not moved at all. Focus now follows the card, and the
  sidebar button follows the order it belongs to, so adding an order leaves you on that card as its
  button turns into **Open**, and marking an issue read leaves you on the same order in the sidebar.
  If you move somewhere else while the order is being added, you are left alone: you are only put
  back when nothing else has taken the keyboard in the meantime.

- The check that keeps em dashes out of what you read on screen was reporting every change as clean.
  One of the eleven standing constraints is that shipped wording contains no em dashes, and
  [`.github/copilot-instructions.md`](.github/copilot-instructions.md) carried a command for finding
  any that a change had introduced. The command sent the change through a pipe on the way to the
  scanner, and Windows PowerShell rewrites text crossing a pipe into a character set that has no
  dash in it, so the scanner was reading question marks and finding nothing. Run against the change
  above, the old command found none and the corrected one found eight. A check that cannot fail is
  worse than no check, because it is trusted. The command now writes the change to a file and reads
  it back, and the file records why so it is not shortened again.

- The backlog no longer says twice over which of BL-054's browser checks passed before the fix. Four
  lines of that record were pasted in a second time, and the sentence they duplicate is the one
  warning a reader against a specific misreading of the numbers, so the stutter landed where it was
  least affordable. Filed as BL-062 rather than fixed here, because the duplication predates this
  change and correcting it would have widened a focus fix into a documentation pass. No gate could
  have caught it: the anchors gate only fingerprints lines a document cites, and the counts gate only
  checks figures derived from the ranked table.

- The D and Enter shortcuts no longer stop working after you click a button in the reading view.
  The handler stood down whenever anything interactive held focus, and the hero's own "Done, next"
  button is interactive, so clicking it left focus there and the very next press of D did nothing at
  all, with nothing on screen to say why. Recovering meant pressing Tab or clicking elsewhere, which
  is not something you would guess. The handler now asks two narrower questions instead of one broad
  one: whether the control consumes the characters you type, which stands every shortcut down, and
  whether the browser would itself act on the key, which stands Enter down on its own. Typing in a
  search or rename box is unaffected, Enter still submits a form and still follows a link, and D now
  survives a click. Marking the last issue read hides the hero and used to drop focus on the page
  body without a word; focus now moves to the "That is the whole order, read" heading, so the
  keyboard stays where you were working and a screen reader announces where it landed. The shortcuts
  also stand down entirely while a dialog is open, so pressing D behind the "Delete list?" prompt no
  longer quietly marks an issue read underneath it.

- **The audited figures in `PRODUCT_BACKLOG.md` no longer go stale in silence.** The
  reconciliation record measured `src/js/main.js` at 1,566 lines and the test suite at 224 tests.
  Both were true when audited and neither is true now. The line count had no drift clause at all,
  and the test count's clause had itself gone stale, written as 235 when nine items had shipped and
  still reading 235 after twelve more had. The audited figures are preserved, because a record of an
  audit that is edited to match today's tree stops being a record of that audit; what changes is the
  clause beside each of them, which now names the current value. That is the convention the
  reconciliation list's own third bullet already established. Neither current value is repeated
  here, deliberately: a release record that has to be revised every time unrelated work adds a line
  or a test is not recording a release. The clause in the backlog is the one place either figure is
  stated live, and it is where to read it. The same treatment is applied to the modularity gap in
  Appendix A, where the size of the file is the argument for the gap and the audited figure
  understates it. Appendix B's ranks, its two row counts and the counts of items above BL-026 and
  BL-007 are recomputed, because that section states in its own words that its ranks are positions
  in the table "as it stands"; the two headings that describe a past ranking pass are left alone,
  since they say so themselves.

- The vendoring scripts no longer hang when the metadata API rate-limits them. Their retry called
  itself from inside the rate limiter's own queue, so a request that was waiting to try again held
  one of the two concurrency slots while queueing the work that would have released it. Two retries
  of a single request, or one retry each of two requests, filled both slots with jobs waiting on
  jobs that could not start. Nothing timed out, so the script simply stopped with no error and no
  output. This is reachable in an ordinary run, because 429 responses are what rate limiting
  produces and they arrive together. Retries are now queued one attempt at a time, which also means
  the wait between attempts is paced by the limiter rather than spent holding a slot. The number of
  attempts, the backoff, the pause applied to other requests and the error messages are all
  unchanged.

- A saved API address that is not usable no longer reaches the network layer. The check for it ran
  only when you typed one into the settings form, but the address is read back out of your browser's
  storage on every start, where a value written by an older build or edited by hand had never been
  checked by anything. It is now enforced by the client that does the fetching, so an unusable
  address cannot get that far from any route. When one is found at startup the app keeps working on
  the default address and says so, naming both addresses, and it leaves the saved value alone rather
  than overwriting it, including when you change an unrelated setting such as cover art. The message
  also warns that issues without a stored Marvel Unlimited link will open on marvel.com rather than
  in the reader while the saved address is unusable, because the launch page reads the same setting
  and has no way to explain itself. The message goes away as soon as you save a usable address.
  Nothing changes for an address that was already usable, including a self-hosted mirror on
  localhost.

### Changed

- The contributor half of the README has been rewritten for length and vocabulary. It was measured
  before it was edited, which corrected the finding that prompted the work: no sentence there ran to
  over a hundred words, as had been recorded. The longest was 48 and only four passed 40. What did
  pass a hundred was a single 138-word paragraph explaining why the series audit reads its index out
  of committed history. That paragraph is now three, one per argument, and the longest sentence in
  the section came down to 36 words. Five terms a new contributor would not know are handled, the four the
  task named and one it had not spotted: to vendor a list, `depth`, placeholder and snapshot are
  all defined where they are used, the earlier undefined use of "snapshot" is gone, and the
  phrase "pinned JSON" is now "the JSON already committed". Three em dashes are gone. No command,
  path, field name or claim about behaviour changed, so nothing here alters what the scripts do or
  how to run them.

- The three build scripts that page the metadata API now share one rate-limited fetch instead of
  keeping a byte-identical copy each. `scripts/vendor-index.mjs`, `scripts/vendor-orders.mjs` and
  `scripts/build-event-order.mjs` call a new `scripts/lib/fetch-json.mjs`, so a change to how the
  scripts handle a rate limit is made once rather than three times and cannot be applied to two of
  them by accident. It shipped with nine tests, which is nine more than the copies had. Nothing
  the scripts write changes.

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
  correctly produces no run, and it named two checks when the workflow ran three, since the evidence
  anchors gate runs alongside them. And the privacy line said your progress "is not uploaded anywhere",
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
