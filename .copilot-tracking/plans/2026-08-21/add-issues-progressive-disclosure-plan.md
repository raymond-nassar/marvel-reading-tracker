# Add Issues progressive disclosure, plan

Task id: MRT-006
Task slug: add-issues-progressive-disclosure
Date: 2026-08-21
Research: .copilot-tracking/research/2026-08-21/add-issues-progressive-disclosure-research.md

## Binding rules

These outrank anything an implementer might otherwise prefer. Every one of them was
derived from the research and each has a reason recorded there.

**R1. The result panes stay non-live.** They receive whole lists at once and the
announcer is the one channel. Do not add `aria-live`, `role="status"` or
`role="alert"` to any element with class `results` in the Add view, and do not remove
an existing `announce(...)` call.

**R2. No new network request pattern.** No cover thumbnails on this surface, no
per-row detail fetch, no prefetch beyond the existing index warming on the series and
creator cards. Search, series and creator results carry no cover field; that is why
hydration exists after the add.

**R3. Every protection in the research's do-not-break list survives byte for byte in
behaviour.** Specifically: the manual lookup never picks automatically and sends
nothing until pressed; an accepted match is withdrawn when the title changes; the
duplicate guard tests the id that will be written and stays gated on there being an
accepted match; unresolved import lines are listed rather than dropped and every
branch of Find match announces; hydration starts after every add that added something;
nothing touches the hydrator or synopsis cancel paths.

**R4. One primary purple control per panel, and never on a repeated row.** The `btn`
class is primary purple. The grey secondary is the pair `btn btn-g`, never `btn-g`
alone: `btn` supplies the padding, radius, inline-flex and gap, and `btn-g` overrides
only background, colour, border colour and weight. A button given `btn-g` on its own
loses all its sizing. The same applies to `btn-added`, which also assumes the `btn`
base.

After this change the Add view markup contains exactly five controls whose class
attribute is exactly `btn`, one per panel, and **every** button the view renders once
per row carries `btn btn-g`. There are four such row sites, not one:

| Site | Today | After |
|---|---|---|
| `renderResults` row Add | `btn` | `btn btn-g` |
| `wireNameSearch` series config `btnClass` | `btn` | `btn btn-g` |
| `wireNameSearch` creator config `btnClass` | `btn btn-g` | unchanged |
| `doManualLookup` candidate "Use this" | `btn` | `btn btn-g` |
| `unresolvedRow` candidate "This one" | `btn` | `btn btn-g` |

The last two were missed by the research's count of primary sites, which looked only at
the markup and the first-level result renderers. They are repeated per candidate inside
the Add view at runtime, so R4 reaches them.

**R5. Preserve the exact meaning and scope of every count and every sentence about
missing metadata.** A count added by this task states what it counted and over what.
The 2025 snapshot sentence and the wiki disclosure sentence keep their meaning.

## Copy and count contract

| Element | Must say | Must not say |
|---|---|---|
| Destination line | which list an add goes into, or that one will be created | anything about how many issues are in it |
| Result summary | how many results were returned, and how many of those the tracker already holds | a total the API did not supply |
| Already-held pill | that the tracker holds the issue | that the issue is in the destination list |
| Manual card hint | the metadata snapshot ends in 2025, newer issues are not found by search, hand entry still tracks, availability shows as unknown | that hand entry recovers the missing metadata |
| Wiki disclosure | the typed title goes to the Marvel Fandom wiki, a community site Marvel does not run, only when the button is pressed, and that nothing about lists or progress goes with it | anything implying an automatic or background request |
| Creator add outcome | creator records omit Unlimited dates so availability is unknown until details are fetched | that availability is known |

The already-held pill and its count are computed over the rendered results only, from
the in-memory issue store. The pill says "Already in your library" because the issue
store is the library; it deliberately does not claim the issue is in the destination
list, which is a different question this code does not answer here.

## Target structure of the Add view

```
h1  Add issues
    destination chip (#add-target)

section.card.card-static#sec-search          <- promoted, always visible
  h2  Search for issues
  form#form-search
  div#search-results

section#add-more
  h2  Other ways to add
  p   one line saying these are for bulk and for what search cannot reach

  details.card#sec-series      summary: h3 Add a whole series   + purpose line
  details.card#sec-creator     summary: h3 Browse a creator     + purpose line
  details.card#sec-import      summary: h3 Paste a reading order + purpose line
  details.card#sec-manual      summary: h3 Add an issue by hand  + purpose line
```

Heading levels are then 1, 2, 2, 3, 3, 3, 3 with no skips.

<!-- rpi:phase id=P01 -->
## P01 Promote search and group the secondary paths

Rendering work. Markup, stylesheet and the render code that fills them.

<!-- rpi:task id=P01-T01 -->
### P01-T01 Restructure the Add view markup

In `src/index.html`:

- Turn `sec-search` from `<details class="card" open>` into
  `<section class="card card-static addpri" id="sec-search">`, with its `h2` promoted
  out of the removed `summary` and kept as the first child. Keep every id inside it
  unchanged: `form-search`, `search-q`, `search-results`. Keep the comment above
  `#search-results` explaining why the pane is not live; it is still true and it is the
  only record of that decision at the site.
- Wrap the remaining four `details` in `<section id="add-more">` carrying
  `<h2>Other ways to add</h2>` and one `<p class="rail-hint">` explaining that these
  cover bulk additions and the issues search cannot reach.
- In each of the four summaries, demote the `h2` to `h3` and add a sibling
  `<span class="card-why">` giving the purpose in under twelve words:
  - series: "Every issue of one series, oldest first."
  - creator: "Every issue credited to one writer or artist."
  - import: "A Markdown checklist or one title per line."
  - manual: "Anything the 2025 metadata snapshot does not have."

  The purpose line must sit inside the `summary`, because a `details` hides its
  non-summary children while closed and the line has to be readable while closed. It
  therefore becomes part of the disclosure's accessible name, and that is **accepted
  deliberately** rather than suppressed. The name reads "Add a whole series Every issue
  of one series, oldest first.", which tells a screen-reader user the same thing the
  sighted reader is being told, and it is the reason the line was added. Do **not**
  reach for `aria-labelledby` on the summary to trim the name back to the heading, and
  do **not** put `aria-hidden` on visible meaningful text.
- Apply R4: the submit buttons of the five panels keep class `btn`. No other `btn`
  appears in this view's markup.
- Leave every hint paragraph in the manual card in place and visible, including the
  wiki disclosure and the reader-address explanation. They precede the actions they
  describe and hiding them behind a disclosure would weaken a privacy statement.

<!-- rpi:task id=P01-T02 -->
### P01-T02 Fix the rail handler for a search panel that is no longer a details

In `src/js/main.js`, `wireNav`. The handler currently closes every `.card[open]` in the
Add view then sets `open` on the named element. After P01-T01, `#sec-search` is not a
`details`, so:

- Narrow the close loop to `#view-add details.card[open]`.
- Set `open` only when the target element is a `DETAILS`.
- Keep the focus move to the first `input, textarea, button` exactly as it is. The rail's
  "Search issues" entry must still land focus in the search box.

This is the single highest-risk mechanical change in the task. A regression here is
silent: the rail still navigates and the card still looks right.

<!-- rpi:task id=P01-T03 -->
### P01-T03 Stylesheet

In `src/styles.css`, using existing tokens only. No new colour literals; use the
established `--tint-base`, `--line`, `--line-2`, `--card`, `--muted`, `--text` family
already in the file.

- `.addpri`: the promoted search panel. Give it slightly more presence than a plain
  `card-static`: a tint-derived border and a subtle tint wash, and a larger heading.
  Restrained, not a hero.
- `.addpri .field-row input[type="search"]`: the primary entry point, so it takes the
  available width and a slightly larger control height.
- `#add-more > h2` and its intro line: clearly a section divider, quieter than the
  search panel's heading.
- **The demoted headings need a rule of their own.** One selector, `.card > summary h2`,
  is the only thing making a card summary heading small, marginless and inline beside
  the chevron. Demoting to `h3` leaves the four summaries matching nothing: the
  `card-static h3` rule is scoped to a class these four do not carry, so they would fall
  back to user-agent defaults, which is a larger block heading with top and bottom
  margins inside a flex summary. Widen that selector to cover both levels rather than
  adding a second rule.
- `.card-why`: the purpose line inside a summary. Muted, small, on its own line under
  the heading. Achieve the two-line layout by making the summary a grid rather than by
  absolute positioning, so it survives 200 per cent zoom and text-spacing overrides.
  **Place every child of the summary explicitly.** The chevron is a `::before` on the
  summary itself, so under grid it becomes a grid item like the others; leaving it
  unplaced puts it in the wrong cell. Two columns, chevron then text, with the heading
  and the purpose line stacked in the second column and the chevron aligned to the
  first text line.
- `.notice-busy`: the loading treatment. Muted text with a small leading dot. Any
  animation must be wrapped in `@media (prefers-reduced-motion: no-preference)` so the
  reduced-motion default is static.
- `.res-head`: the result summary strip above result rows.
- `.pill-held`: the already-held marker. It must carry a shape or glyph as well as a
  colour, so it is distinguishable without colour, and it must remain legible under
  forced colors, which means no background-only encoding.
- Under `@media (forced-colors: active)`, verify the new classes do not rely on a
  background that the platform will flatten.

<!-- rpi:task id=P01-T04 -->
### P01-T04 Result rendering

In `src/js/main.js`:

- `renderResults`: before the rows, render a `div.res-head` stating the result count,
  how many of those the tracker already holds, and the destination sentence. Keep the
  existing `announce(...)` call and extend its text to include the held count. Keep the
  existing destination wording exactly.
- Each row gains a `span.pill-held` when the tracker already holds the issue. The Add
  button stays enabled: a held issue can still be added to a different list, and
  disabling it would assert something this code has not checked.
- Row Add buttons become `btn btn-g` per R4. On success add class `btn-added`, which
  already exists in the stylesheet and assumes the `btn` base, and keep the existing
  label rewrite.
- Apply the rest of R4's table. The series config passed to `wireNameSearch` changes its
  `btnClass` to `btn btn-g`; the creator config already has it. The candidate buttons in
  `doManualLookup` ("Use this") and in `unresolvedRow` ("This one") change to
  `btn btn-g`. Nothing else about those two functions changes: every guard, every
  announcement and every branch stays exactly as it is.
- `wireNameSearch`: print the same destination sentence in its results pane. Today the
  series and creator panes never say where an add will go, which is the destination
  visibility gap requirement 3 names.
- Every place that currently calls `notify(sel, 'Searching…', 'ok')` or
  `'Loading all issues of …'` or `'Loading issues credited to …'` switches to the busy
  treatment: a notice carrying class `notice-busy` instead of `notice-ok`. The message
  text and the announcement stay the same. Do this by extending `notify`'s `kind` to
  accept `'busy'` and mapping it to `notice-busy`, so nothing else changes.

<!-- rpi:phase id=P02 -->
## P02 The held-count helper and its tests

Not rendering work.

<!-- rpi:task id=P02-T01 -->
### P02-T01 Append the helper to the model module

Append to the **end** of `src/js/lib/model.js`, as a pure function, and add its name to
the **existing** multi-line import in `src/js/main.js` without adding an import line.
Appending rather than creating a module is deliberate: a new import line moves every
citation that names the main module, and the existing import block takes another name
without gaining a line.

```
export function heldCount(state, items)
```

Returns the number of entries in `items` whose `issueId` is present in `state.issues`.
Tolerates a null or undefined state, a missing `issues` map, a null `items`, and entries
with no `issueId`. Counts each item once even when the same id appears twice in `items`.

<!-- rpi:task id=P02-T02 -->
### P02-T02 Unit tests

New file `test/add-summary.test.js`. Cover: an empty result set, no state, a state with
no issues map, none held, some held, all held, a duplicate id in the results, and an
entry with no id. Each test named as a sentence describing the behaviour, bare `test()`,
no `describe()` blocks, matching the suite's existing style.

<!-- rpi:phase id=P03 -->
## P03 Copy and structure guard tests

Not rendering work. The research found the Add view's copy is entirely unprotected by
the suite, including the sentence requirement 4 exists to preserve.

<!-- rpi:task id=P03-T01 -->
### P03-T01 Add-view guard tests

New file `test/add-view.test.js`, reading `src/index.html` as text in the manner of the
existing markup tests. Rules:

1. The manual card still states the 2025 snapshot boundary: that the snapshot ends in
   2025, that newer issues are not found by search, and that a hand-added issue still
   tracks with availability unknown.
2. The wiki disclosure still names the Marvel Fandom wiki, still says the request
   carries the typed title, still says nothing about lists or progress goes with it, and
   still says nothing happens until the button is pressed.
3. The Add view contains exactly five controls whose class attribute is exactly `btn`,
   and they are the five panel submits. **Match the exact attribute value**, because the
   manual lookup carries `btn btn-g` and a word-boundary match on `btn` would count six
   and the rule would be wrong on the day it was written. This is R4's markup half held
   by a rule so it cannot drift back. Its limit is worth stating in the test's comment:
   the runtime half of R4 lives in the four row sites in the main module, which this
   rule cannot see.
4. Heading levels inside the Add view are 1, 2, 2, 3, 3, 3, 3 in document order, with no
   level skipped.
5. `#sec-search` is not a `details`, and the other four are, which is the structural
   statement of requirement 1.

Note for the implementer, from the critique: the wiki disclosure's *meaning* is already
pinned by `test/privacy-copy.test.js`, but against the About view, the README and the
security policy rather than against this card. So weakening that wording anywhere those
three surfaces reach will break an existing test, and the new rule here closes the one
place that was genuinely unguarded.

<!-- rpi:task id=P03-T02 -->
### P03-T02 The runtime half of R4

Rule 3 above cannot see a button built in JavaScript, and four of the five repeated-row
sites are. Add a rule in the same file reading the main module as text and asserting
that each of the four row sites carries the grey pair:

- the row Add button built in `renderResults`
- the `btnClass` in each of the two `wireNameSearch` configuration objects
- the candidate button in `doManualLookup`
- the candidate button in `unresolvedRow`

Assert the class strings that appear in those five configuration and construction sites
all contain `btn-g`. A source-text rule is the honest instrument here: there is no DOM
in this suite and the alternative is to assert nothing.

Each rule carries a comment saying what it is defending and why, in the register the
suite already uses.

<!-- rpi:phase id=P04 -->
## P04 Records

<!-- rpi:task id=P04-T01 -->
### P04-T01 Backlog, changelog, governance

- `PRODUCT_BACKLOG.md`: one new item with a table row and a detail block, in the shape
  of the neighbouring entries, carrying a constraint gate line. Re-derive the intro
  count and any stated file size this change moves.
- `CHANGELOG.md`: an entry under `## Unreleased`.
- `GOVERNANCE.md`: re-derive the two counts it states about backlog detail blocks and
  constraint gate lines. The suite asserts them.
- Add the two routed follow-ups from the research as backlog entries: a cancel control
  for the long series and creator loads, and cover thumbnails in search results.

<!-- rpi:phase id=P05 -->
## P05 Verification

<!-- rpi:task id=P05-T01 -->
### P05-T01 Gates and browser matrix

- `npm run lint`, `npm test`, `npm run counts`, `sizes`, `palette`, `publication`.
- The anchors round in full: re-aim, reconcile both derivations, read the bless print,
  re-run to 0 drifted, 0 new, 0 removed.
- Dash scan on the added lines, written to a file and read back.
- Edge matrix over the five paths: light, dark, reduced motion, forced colors, 200 per
  cent zoom, covers off, and 2560 wide. Assert no horizontal overflow, no skipped
  heading level, every form control labelled, focus predictable after each dynamic
  update, and the rail entries each landing focus in the right control.

## Acceptance criteria

1. Search is visually and structurally the default: always visible, never collapsible,
   and the only panel with primary presence.
2. The other four are one clearly labelled group, each with a purpose line readable
   while closed.
3. Destination is stated in the header, in the search results and in the series and
   creator results.
4. Result rows are scannable: a summary strip above them, and a held marker on rows the
   tracker already knows.
5. Loading states are neutral and static under reduced motion.
6. Exactly five controls in the view carry the primary class alone, one per panel, and
   all five repeated-row sites carry the grey pair. Both halves are held by rules.
7. Every protection in R3 still holds, demonstrated by the suite and by the browser
   matrix.
8. The 2025 boundary and the wiki disclosure are held by rules, not by care.
