<!-- rpi:task-id MRT-003 -->
<!-- rpi:task-slug reading-screen-modernization -->

# Research: modernize the active reading-order screen

Task MRT-003. Read only. Every claim below was checked against the working tree, against a running
copy of the app in Edge, or against a gate run, and carries the evidence for it.

## Question

The adaptive shell (BL-165) and the purple palette (BL-166) are merged. The reading view is the one
screen neither of them touched. Five things are asked of it: a stronger "Read this next" hero, list
management demoted without being hidden, better progress and Coming Up on wide desktops, a full
order that is easier to scan, and the colour roles applied consistently. Everything already
promised has to survive: popup-safe reader launching, local persistence, cover-off mode, both
themes, forced colors, reduced motion, and the accessibility behaviour.

## What the screen is made of

The view is one section of markup, three renderers and three style sections.

- Markup lives in `src/index.html:291-410`: a `.head` carrying the order name, the cover-art switch
  and the progress ring; a `.list-tools` row; the note; the hero; the Coming Up shelf; and a
  `details` element holding the filters and the rows.
- `renderReading` drives the whole view and hides the progress ring when no list is open, at
  `src/js/main.js:2357-2370`.
- `renderHero` writes the hero, including the three calls to action, at `src/js/main.js:2401-2466`.
- `renderShelf` builds the eight upcoming tiles at `src/js/main.js:2475-2536`.
- `renderRows` builds the full order at `src/js/main.js:2661-2839`.
- The styles are three named sections of the stylesheet: hero, shelf and full order.

Two mechanisms constrain any change to the renderers.

- `rowCacheKey` at `src/js/main.js:2577-2579` stringifies an item plus the current id, today's date
  and the covers setting. Any new per-row input that is not in that key means rows silently stop
  updating.
- `preservingFocus` restores focus after a rebuild by matching `data-key` and `data-act`, so a new
  control inside a rebuilt container needs both attributes or focus is lost on every re-render.

## Baseline, measured in Edge

Captured with the out-of-tree `puppeteer-core` harness, House of M imported, dark theme, full order
open, at 1280x900 and at 2560x1080.

1. The hero cover column is 176px wide and the title is 1.9rem. Three buttons sit side by side in
   the call to action and two of them are ghost buttons of the same size, so no single Marvel
   Unlimited action dominates.
2. `.list-tools` renders five outlined pills immediately above the hero. They are the same visual
   weight as the hero's own ghost buttons, so destructive and routine list management compete with
   the one thing the screen exists to offer.
3. Progress is a 36px ring reading `0 / 8`. The percentage exists only inside a `title` attribute,
   which no touch user and no keyboard user can reach.
4. Coming Up is a horizontal scroller of 106px tiles. At 1280 the eighth tile is clipped at the
   right edge.
5. At 2560 the shell caps at 1360px, and the reading view stays at the 876px prose measure, so the
   extra width is entirely margin. The landing page, which opts out, renders 1296px wide.
6. Rows are 34px thumbnails with no separator between them, and the per-row actions are invisible
   until hover or focus.

## What the palette already gives us

BL-166 left the colour roles in place: `--accent` and `--accent-text` for interaction, `--blue` for
links and focus, `--teal` for positive states, `--amber` for warnings, `--red-fg` for danger. The
availability badges already use teal, amber and red; the filter pills already use purple for the
selected state; focus outlines are already blue.

Three gates police colour and all three matter here.

- `test/theme.test.js` forbids a literal colour in any rule outside the token blocks, so every new
  value has to be a token or an `rgb(var(--token) / n%)` composite.
- The same file asserts the two light-theme token blocks are identical token for token.
- `scripts/check-palette.mjs` measures a fixed list of foreground and background pairs, and
  `test/theme.test.js` asserts the exact set of surfaces each foreground is measured against. A
  foreground drawn on a surface that is not in that list is the defect the assertion exists to
  catch, so a newly rendered combination has to be added rather than assumed covered.

## The cost that shapes the plan

`docs/anchors.lock.json` holds 892 citations. Counted by the file they cite, 242 name
`src/js/main.js`, 76 name `src/styles.css` and 68 name `src/index.html`. A citation is fingerprinted
by the content of the lines it names, so inserting a line into any of those three files breaks every
citation below the insertion.

Measured against the lock: 137 of the main.js citations sit at or after line 2390, 41 of the
stylesheet citations sit at or after line 487, and 41 of the markup citations sit at or after line
300. That is the whole argument for the shape of the implementation.

An edit that replaces a line in place changes one fingerprint. An edit that adds a line moves
everything after it. So the plan holds `src/js/main.js` and `src/index.html` to strict in-place
edits, keeping both files at their current length, and concentrates the additions in the stylesheet
where the exposure is a quarter of the size.

## The width question, and why it does not overturn BL-165

BL-165 recorded a deliberate decision to hold every prose view at the measure it already had, and
gave the landing page an opt-out because a catalog is a grid rather than a paragraph. The reading
view is the same kind of surface: a cover, a shelf of cover art and a list. The opt-out already
exists at `src/styles.css:418-421` and costs nothing to extend, and the prose inside the view is
capped in characters rather than pixels, so widening the view does not widen a line of text.

That is the cheapest route to requirement 3 and it reuses a mechanism the project already decided
on, rather than introducing a third width token. The comment above the opt-out says home is the
only view that takes it, and that sentence stops being true, so it is rewritten in place.

A two-column layout with a sticky aside carrying progress and Coming Up was considered and
rejected. It is the highest-risk option on the board: it changes reading order, tab order and focus
management, it interacts badly with forced colors, and it buys less than the four cheaper changes
together.

## Constraints checked

Constraints 1 to 11 were read before planning. Nothing here hosts an image byte, scrapes a Marvel
domain, adds a network call, adds a runtime dependency, changes the origin, collapses the
availability model, touches the reader launch path, moves the metadata boundary, reopens Android,
or adopts market framing. Constraint 11 is checked by the dash scan over the added lines of the
diff.

Constraint 7 deserves naming rather than ticking. The hero's primary action is the reader launch,
and its handler must keep calling `window.open` synchronously inside the click, before any lookup
resolves. Restyling the button is safe; re-wiring it is not, so the plan restyles only.

## Planning readiness

Ready. The screen, the renderers, the gates, the palette rules and the anchors exposure are all
established, the baseline is measured at both target widths, and the one open product question
resolves to reusing an existing decision rather than overturning it.
