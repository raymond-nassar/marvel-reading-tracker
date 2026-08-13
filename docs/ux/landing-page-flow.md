# Flow Specification: Landing Page

## Entry Point
App launch, or clicking the brand lockup in the sidebar.

## State A — Empty Library (first run)
1. **Hero**: "Pick something to read" + one-line subhead. Reduced in visual
   weight; it labels the grid rather than replacing it.
2. **Filter chips** (single-select, horizontally scrollable):
   `All` · `Beginner-friendly` · `Events` · `By character` ·
   `Short (< 20 issues)` · `Complete runs`
   Plus a text filter input once the catalog exceeds ~12 orders.
3. **Catalog grid**: responsive cards, min 260px, auto-fill.
   Each card:
   - Cover thumbnail (respects the global `Cover art on` toggle)
   - Title
   - One-line description
   - Metadata row: issue count · estimated length
   - Primary button: `+ Add to library`
   - Card body is a secondary target → opens preview of the full issue list
4. **Overflow**: render the first N (12) cards, then a `See all N orders →`
   link to a dedicated catalog page. Prevents the landing page from degrading
   as the catalog grows.
5. **Escape-hatch row** (quiet, below the grid, text-button styling):
   `Create an empty list` · `Search issues` · `Paste a reading order`
6. **Footer**: existing disclaimer line, unchanged.

## State B — Library Has Lists
1. **Hero — "Continue reading"**: last-read list title, cover, progress bar
   (`23 of 47 issues`), next issue title, primary button `Read next issue →`.
2. **"Your reading orders"**: compact row of the user's lists with progress.
3. **"Discover more"**: horizontally scrolling strip of catalog cards not yet in
   the library. Same card component as State A.
4. Escape-hatch row and footer unchanged.

## Transitions
- `+ Add to library` → optimistic in-place flip to `✓ In library` → morphs to
  `Open →` after 1.5s. No navigation. Sidebar list updates.
- Card body → preview panel/route showing the ordered issue list.
- `See all` → full catalog page carrying the active filter chip.

## Exit Points
- **Success**: reading order in library, user opens it.
- **Alternative**: user takes an escape hatch (empty list / search / paste).
- **Deferred**: user browses without adding; filter state persists for the session.

## Design Principles
1. **Content is the call to action.** Never ship an empty box where the catalog
   could be.
2. **Progressive disclosure.** 12 cards + "See all", not the entire catalog.
3. **One-click commitment, zero-cost reversal.** Adding never navigates; removing
   is always available.
4. **State-aware, not one-size-fits-all.** Empty and populated libraries have
   different jobs.
5. **Offline-first.** The grid renders fully without network; cover art is
   progressive enhancement.

## Accessibility Requirements
- [ ] Grid is a `<ul>`/`<li>`; each card an `<li>` with an `<h3>` title
- [ ] Card has one primary `<button>`; the body link is separate and not nested
- [ ] `+ Add to library` has an accessible name including the order title
      (e.g. `aria-label="Add to library: Civil War"`, with the label's own words
      first so a speech user can activate it by what they can see)
- [ ] `aria-live="polite"` region announces "Civil War added to your library"
- [ ] Filter chips: `role="radiogroup"` with `aria-checked`, arrow-key navigation
- [ ] Progress bar: `role="progressbar"` with `aria-valuenow/min/max` + text label
- [ ] Cover images: `alt=""` (decorative — title is adjacent text)
- [ ] Focus visible: 2px outline, 3:1 contrast against card and page background
- [ ] Metadata not conveyed by color alone
- [ ] Buttons minimum 44px height
- [ ] Text contrast ≥ 4.5:1; verify description text on the dark card surface
- [ ] Layout survives 200% text zoom without clipping
