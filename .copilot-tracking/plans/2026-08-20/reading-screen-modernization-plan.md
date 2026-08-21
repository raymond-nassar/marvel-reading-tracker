<!-- rpi:task-id MRT-003 -->
<!-- rpi:task-slug reading-screen-modernization -->

# Plan: modernize the active reading-order screen

Task MRT-003. Research: `.copilot-tracking/research/2026-08-20/reading-screen-modernization-research.md`.

## Shape of the change

The research measured the anchors exposure and it dictates the shape. `src/js/main.js` and
`src/index.html` are edited **in place only**, so both files keep their current length and no
citation below an edit moves. Every genuinely new rule goes into one new section appended to the end
of `src/styles.css`, which also carries that section's own forced-colors overrides so they land
after the global ones. Existing declarations whose value simply changes are edited where they stand.

<!-- rpi:phase id=P01 -->
## P01 Width and progress

<!-- rpi:task id=P01-T01 -->
### P01-T01 Let the reading view use the desktop

Add `view-wide` to `#view-read` and rewrite the two-line comment above the opt-out so it no longer
claims home is the only view that takes it. Nothing else changes: the prose inside the view is
capped in characters, so no line of text gets longer.

<!-- rpi:task id=P01-T02 -->
### P01-T02 Put the progress figure on the screen

Enlarge the ring from 36px to 44px and its radius from 15 to 19, updating `RING_CIRCUMFERENCE` in
the same edit. Replace the single `3 / 8` label with two lines: `3 of 8 read` and
`5 to go · 38%`. Delete the `title` attribute that was the only place the percentage appeared,
because a tooltip is reachable by neither touch nor keyboard.

<!-- rpi:phase id=P02 -->
## P02 The hero

<!-- rpi:task id=P02-T01 -->
### P02-T01 Larger art, clearer hierarchy

Widen the cover column from 176px to 216px, and to 248px once the viewport can afford it. Raise the
title from 1.9rem to 2.2rem and let it balance across lines. Move the byline from `--muted` to
`--dim` so the gap between the title and the credits is a step rather than a cliff.

<!-- rpi:task id=P02-T02 -->
### P02-T02 One dominant action

Give the Marvel Unlimited button a larger variant. Demote the issue page link from a ghost button to
a blue text link, which is what it is: a link off the app. `Done, next` stays a ghost button, since
it is an action rather than a link. All three keep their classes, their ids, their labels and their
handlers, so the reader launch path is untouched.

<!-- rpi:phase id=P03 -->
## P03 List management

<!-- rpi:task id=P03-T01 -->
### P03-T01 Demote the tools without hiding them

Draw the tool row as one bounded strip and take the individual borders off the buttons inside it,
restoring each border on hover and on focus. The group keeps its affordance, each button stops
competing with the hero, and nothing moves in the DOM, so tab order, shortcut keys and the
destructive-action confirmation are all unchanged.

<!-- rpi:phase id=P04 -->
## P04 Coming up

<!-- rpi:task id=P04-T01 -->
### P04-T01 A shelf that wraps instead of scrolling

Replace the horizontal scroller with a wrapping grid that fits as many tiles as the width allows and
caps a tile at 168px so a nearly finished list does not paint two enormous covers. On a wide desktop
all eight upcoming issues land on one row; at 1280 they wrap rather than clipping; on a phone the
grid falls to three columns. No tile is ever off screen.

<!-- rpi:phase id=P05 -->
## P05 The full order

<!-- rpi:task id=P05-T01 -->
### P05-T01 Give the rows rhythm

Take the thumbnail from 34px to 44px, the title from .89rem to .94rem, and put a hairline under
every row so the eye has a rule to follow. Mark the row you are on with a purple bar down its left
edge, on top of the tint and border it already has.

<!-- rpi:task id=P05-T02 -->
### P05-T02 Keep the filters in reach

Make the reading filters stick to the top of the viewport while a long order scrolls past. Scoped to
the reading filters by id, because the same class is used by three other fieldsets that must not
move.

<!-- rpi:task id=P05-T03 -->
### P05-T03 Say when a collected edition is finished

A completed collected edition already dims its name. Give its count the positive colour as well, so
a finished volume is findable while scanning rather than only readable once found.

<!-- rpi:phase id=P06 -->
## P06 Evidence

<!-- rpi:task id=P06-T01 -->
### P06-T01 Measure the new combinations

Add every newly rendered foreground and background pair to the palette check, and move the surface
assertions in the theme test with them.

<!-- rpi:task id=P06-T02 -->
### P06-T02 A check that fails without the change

Add unit coverage for the progress wording, proven to fail on the tree without the fix by stashing
it.

<!-- rpi:task id=P06-T03 -->
### P06-T03 Browser evidence

Add a scenario proving the reading screen's new behaviour in Edge, and capture the view at 1280x900
and at ultrawide in both themes, with covers off, with reduced motion and with forced colors.

<!-- rpi:task id=P06-T04 -->
### P06-T04 Records

Add BL-169 to the backlog, ranked row and detail block, re-derive the counts in the introduction,
and add the changelog entry.

<!-- rpi:task id=P06-T05 -->
### P06-T05 Gates

Lint, test, counts, sizes, palette, publication, the dash scan over added lines, and one anchors
round with the shift arithmetic reconciled against a head search.
