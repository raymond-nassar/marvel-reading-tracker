<!-- markdownlint-disable-file -->
# RPI Phase Details: Reading screen modernization

## Metadata

* Task ID: MRT-003
* Task slug: reading-screen-modernization
* Related plan: .copilot-tracking/plans/2026-08-20/reading-screen-modernization-plan.md
* Related research: .copilot-tracking/research/2026-08-20/reading-screen-modernization-research.md
* Date: 2026-08-20

## The constraint that shaped every task

The evidence anchors lock holds 892 citations. Counted by the file and line each one points at, the
main script carries 242 of them with 137 at or after its line 2390, the markup carries 68 with 41 at
or after line 300, and the stylesheet carries 76 with only 8 at or after line 1060.

Every line added to a file moves every citation below it. So the plan's tasks were written to hold
the markup and the script to edits that replace text without changing the line count, and to put all
new declarations in the stylesheet, at the end of the file, where the fewest citations sit below
them. Both source files were verified afterwards to still hold exactly 835 and 4801 lines.

That is a constraint on the shape of the change, not on the change itself. Where the two conflicted
the product won: the shelf needed a new comment above it explaining why it is a grid, and that
comment was added mid-file and its cost in re-aiming paid.

## P01 Width and progress

### P01-T01 Let the reading view use the desktop

The wrapper class already existed. `.view-wide` was written for the landing page and opts a view out
of the prose measure; the reading view simply had not been given it. One class attribute changed, and
the comment above the rule was rewritten in place because it claimed the landing page was the only
view that opts out, which stopped being true.

Measured before: the reading view is 876px at 1280x900 and 876px at 2560x1080. After: 964px and
1296px.

### P01-T02 Put the progress figure on the screen

The count was `0 / 8` inside a `title` attribute on the ring's wrapper. A tooltip needs a hover and a
pause, is not available to touch at all, and is not announced on focus.

The ring grew from 36px to 44px, which moved the radius from 15 to 19 and the circumference constant
from 94.2 to 119.4. Both the markup and the script hold that number, so they are now asserted to
agree by a test rather than by memory.

The figure is now two elements beside the ring: `0 of 8 read`, and beneath it either `8 to go · 0%`,
or `All read`, or `Nothing in this list`. The `title` was removed rather than left in place, because
two sources for one number is how they come to disagree.

## P02 The hero

### P02-T01 Larger art, clearer hierarchy

The cover was 176x264. It is 216 wide below 1100px and 248 above it, measured at 248x372 at both of
the widths this task was checked at. The title went from 30.4px to 35.2px and gained `text-wrap:
balance` so a two-line title breaks evenly rather than leaving one word alone.

### P02-T02 One dominant action

Three buttons of near-equal weight became one large filled button, one ordinary button, and one link.
The Marvel Unlimited button keeps its element, its handler and its position in the markup: only its
class changed. Nothing was introduced into its click path, so the synchronous `window.open` that
Constraint 7 protects is untouched.

## P03 List management

### P03-T01 Demote the tools without hiding them

Five outlined pills that read as loudly as the hero's own buttons are now borderless inside one
bounded strip, with the border returning on hover and on `:focus-visible`.

Hiding them behind a hover, the way the per-row actions already do, was considered and rejected. It
would have extended a known touch-discoverability weakness, and the request was explicit that
discoverability must not fall.

Under forced colors the strip and each button take a system border. That is correct rather than a
regression: a visual hierarchy is exactly the thing a user's own colours are entitled to discard.

## P04 Coming up

### P04-T01 A shelf that wraps instead of scrolling

The shelf was a flex row of fixed 106px tiles. On an order with eight issues still to come it
overflowed its own box by 62px, at 1280 and at 2560 alike, so the eighth issue was cut in half and no
display width fixed it.

It is now a grid of `repeat(auto-fit, minmax(112px, 1fr))`. Measured after: 0px of overflow at both
widths, eight tiles over two rows at 1280 and eight across one row at 2560 at 149px each.

`auto-fit` alone would have stretched two remaining tiles across the whole width, so the tile carries
a `max-width` as well as a minimum.

## P05 The full order

### P05-T01 Give the rows rhythm

Thumbnails went from 34px to 44px, titles from 14.24px to 15.04px, and the row gained a hairline
above it. The separator is written as `.row + .row`, an adjacent-sibling rule, so no line is drawn
directly under a collected-edition heading.

The current row's marker is an inset box shadow rather than a border, because a border on an
interactive class is the thing the theme suite forbids without a gate, and because a border would
have fought the hover rule already on that element.

### P05-T02 Keep the filters in reach

The filters bar is `position: sticky`, scoped by id. The class it carries is shared by four other
bars in the app, so the rule had to name the one bar it is about.

### P05-T03 Say when a collected edition is finished

A finished edition's count is teal, which is the colour this palette gives to a positive state.

## P06 Evidence

### P06-T01 Measure the new combinations

The palette gate needs no new pair. It already treats the hero as a card surface, so a link inside a
card, dim text on a card, teal on the page and the accent text colour on the page are all measured
already. The gate reports 88 pairs and 0 new below the floor.

### P06-T02 A check that fails without the change

Nine assertions were written, and then the three changed source files were stashed. Eight of the nine
failed on the stashed tree. The ninth is the ring geometry invariant, which cannot fail that way
because both halves revert together, so it was proved by mutating the constant alone and watching it
fail.

### P06-T03 Browser evidence

Thirteen assertions were added to the browser check, measured against the running app at both widths
in one scenario.

### P06-T04 Records

Backlog item BL-169, a changelog entry, and a correction to the governance record's derived count.

### P06-T05 Gates

Lint, tests, counts, sizes, palette, publication, browser, anchors, and the dash scan.
