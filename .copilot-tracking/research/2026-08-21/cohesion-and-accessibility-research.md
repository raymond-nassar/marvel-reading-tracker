# MRT-008 research: cohesion and accessibility

<!-- rpi:phase id=P00 -->

Task id MRT-008. Task slug `cohesion-and-accessibility`. Dated 2026-08-21. Base commit faefca7,
the squash of the settings and system feedback change.

This is the sixth and final modernization phase. It is a consistency and defect-removal pass, not a
feature. The brief is to audit typography, spacing, radii, elevation, icons, control hierarchy and
semantic colour across every view, remove isolated styling treatments that do not belong to the
shared system, verify light, dark, forced-colour, reduced-motion, cover-on and cover-off modes, test
keyboard traversal, focus visibility and restoration, accessible names, live announcements, target
sizes, contrast, text spacing and 200 percent zoom, check wide and narrow reflow, and fix only
material inconsistencies and accessibility defects. Unrelated feature ideas are routed to the
backlog rather than folded in.

## Method

Every figure below was measured rather than recalled. Five instruments were written for this pass
and all five live outside the repository, in the session state directory, because they are research
tools rather than product code and nothing was added to `package.json`.

The browser instruments drive installed Edge through `puppeteer-core` imported by absolute path from
a scratch directory outside the tree, which is the arrangement the browser verification section of
the contributor instructions requires and the arrangement every earlier phase used.

- A stylesheet value profiler that reads the stylesheet directly and excludes the three token blocks,
  so it counts the values rules actually declare rather than the palette they draw from.
- A rendered census that walks every element of every view in the browser and tallies computed
  font size, weight, radius and shadow, plus heading order, accessible names, effective target sizes
  and horizontal overflow at four viewport widths.
- A contrast instrument that composites each text node's colour over its nearest opaque backdrop and
  scores it against the size-adjusted and weight-adjusted threshold.
- A focus instrument that presses Tab for real rather than calling focus in script, for the reason
  given under refuted hypotheses below.
- A mode instrument that emulates forced colours through the devtools protocol, because the
  higher-level media feature emulation rejects that feature by name, and emulates the colour scheme
  and reduced motion preferences through the ordinary path.

All nine views were reached and populated. Eight are reachable from the rail. The reading view has
no rail entry and is reached by opening a list, which is why earlier sweeps left it unmeasured; the
census now opens it through the continue affordance on the home screen. Reading progress was seeded
by importing the first catalogue order and pressing the hero Done, next control seven times, which
is what actually records progress on that screen.

## What is already sound

Ten of the eleven accessibility checks in the brief pass with nothing to fix. Recording the measured
negatives matters as much as recording the defects, because they are the evidence that this phase
should not touch those areas.

| Check | Scope measured | Result |
| --- | --- | --- |
| Heading order | 9 views | 0 skipped levels |
| Accessible names | 9 views, 155 visible controls | 0 unnamed |
| Horizontal overflow | 9 views at 1280, 1920, 2560 and 360 wide | 0 |
| 200 percent zoom | 9 views at 640 by 450 layout pixels, scale factor 2 | 0 overflow |
| Text contrast, dark | 9 views, every visible text node | 0 below threshold |
| Text contrast, light | 9 views, every visible text node | 0 below threshold |
| Focus visibility | 90 distinct Tab stops | 90 identical rings |
| Reduced motion | 9 views | 0 animated elements |
| Forced colours | 9 views | 0 real defects, 8 probe hits all refuted |
| Covers off | 9 views | 0 overflow, target set unchanged |

Two of these deserve their numbers stated rather than summarised.

Focus visibility is not merely present, it is uniform. Every one of the 90 distinct Tab stops across
the eight rail views reports the same computed indicator, a solid three pixel ring in the same blue
at a two pixel offset. There is no second focus treatment anywhere in the application, so there is
nothing here for a cohesion pass to reconcile.

Reduced motion was measured with a working negative control, which is the part that makes it
evidence. Under the reduce preference the census finds zero elements carrying a non-zero transition
or animation duration. Under the no-preference baseline the same census over the same views finds
thirteen, four of them distinct. A check that has never been seen to fail proves nothing, and this
one was seen to fail.

Forced colours turned out to be handled more carefully than the probe could recognise, which is
covered under refuted hypotheses.

## Finding A: six interactive targets are under 24 by 24 pixels

This is the only real accessibility conformance defect the sweep found, and it is a success criterion
the application otherwise meets everywhere.

| Control | Effective size | Measured by |
| --- | --- | --- |
| Clear cached metadata | 131 by 22.5 | the control itself |
| Erase all local data | 105.8 by 22.5 | the control itself |
| Backup file to restore | 241 by 22 | the control itself |
| Show cover art | 114.4 by 21.5 | its associated label |
| Check for updates automatically | 216.8 by 21.5 | its associated label |
| Into a new list | 105.1 by 20.5 | its associated label |

Effective size is the union of the control and its largest associated label, not the control's own
box, because a checkbox with a clickable label is as large as the label. Measuring the raw box would
have reported three thirteen by thirteen checkboxes as defects when the reader can hit a target ten
times that area, and an earlier sweep did exactly that. Inline links inside sentences are excluded,
which the success criterion permits explicitly.

The first two share a cause and it is worth stating precisely, because the obvious diagnosis is
wrong. The quiet button class declares padding and font size but no minimum height, so a quiet button
takes its height from its context. Twelve quiet buttons are visible across the application. Ten of
them sit inside flex rows and measure 32.1 or 33.3 pixels, comfortably clear. The two that fall short
are the only two that sit as direct block children of a card, where nothing stretches them and they
collapse to their intrinsic content height of 22.5 pixels. So this is not a broken shared class used
everywhere, it is a shared class that happens to be carried by its layout in ten places out of twelve
and is not carried in two. The fix belongs on the class, as a floor, rather than on either card.

Both of the short buttons are destructive or advanced actions, one clearing cached metadata and one
erasing all local data, which is the population where an undersized target is least forgivable.

## Finding B: focus does not return to the control that opened a dialog

Already filed as BL-175 and marked Ready with a weighted score of 7.5. When a confirm dialog closes,
by Escape or by Cancel, focus lands on the view's top heading rather than returning to the control
that opened it. It was measured on the settings change's own base commit as well as its changed tree
and is identical on both, so it is pre-existing.

This is squarely a focus order defect and squarely inside this phase's brief, which names focus
restoration explicitly. It is the highest value item available and it is already researched, scoped
and scored, so this phase should close it rather than leave the last modernization phase shipping
with a known focus defect outstanding.

## Finding C: the declared value system has sprawled

The stylesheet draws every colour from a token, and that rule holds absolutely. The other axes have
no equivalent discipline, and the numbers are the finding.

| Axis | Distinct values declared | Distinct values rendered | Assessment |
| --- | --- | --- | --- |
| font-size | 35 across 108 usages | 26 | sprawled, 16 declared values used exactly once |
| font-weight | 13 | 13 | sprawled, nine are near duplicates of two |
| border-radius | 17 | 12 | sprawled, and the one radius token is barely used |
| box-shadow | 4 | 1 | already coherent, leave alone |

Three specifics carry the argument.

Font sizes cluster at differences no reader can see. There is a run at .84, .85, .86, .87, .88 and
.89rem, another at .92, .93, .94 and .95rem, and a third at .72, .74, .75, .76, .78, .8 and .82rem.
At the root size these separate by well under a pixel. Sixteen of the 35 declared sizes appear
exactly once, which is the signature of a value chosen at a single site rather than drawn from a
scale.

Font weights are the clearest case. Alongside 400, 600 and 700 the stylesheet declares 500, 520, 540,
560, 620, 640, 650, 660 and 680. Nine near duplicates of two real weights. The interface font
renders these as a variable axis so they are not snapped to the nearest named weight, but the visible
difference between 620 and 600 at twelve pixels is not something a reader can name, and none of the
nine carries a comment explaining why that exact number was needed.

Radii show the same sprawl with an extra wrinkle: the system already has a radius token, and it is
almost unused. The token resolves to fourteen pixels and appears four times, while ad hoc values
carry the interface, with eleven pixels at 45 rendered instances, eight at 40, ten at 35 and the
pill value at 78. A token that four rules use is not a system, it is a leftover.

## Axes named by the brief and measured after the plan critique

A critique of the plan found that four axes the brief names had been neither measured nor set aside,
which meant the phase could not honestly call them clean. Each was then measured. None produces work
inside this change, and recording that is the point: an axis with no result is not a passing axis.

**Text spacing passes.** The reader override WCAG asks a page to survive, line height at 1.5, letter
spacing at 0.12em, word spacing at 0.16em and paragraph spacing at 2em, was applied across all nine
views. No horizontal overflow appeared and no element was clipped that was not already clipped
without it: 17 either way, being the visually hidden legends, whose clip is the hiding technique
itself, and a deliberate two line clamp on the reading order descriptions.

That result was nearly recorded on a broken instrument. The first run matched its own negative
control exactly, which is not the reassuring outcome it looks like, because an override that does
nothing makes every page pass. The development server sends a policy permitting stylesheets only from
itself, and the injected override was being dropped in silence. Bypassing it in the harness, the
override moved line height, letter spacing and word spacing as intended, and only then was the pass
worth anything.

**Spacing has real sprawl and is deliberately not touched here.** Profiled the same way the
typography axes were: 257 declarations of padding, margin and gap outside the token blocks, 51
distinct literal values, 19 used exactly once, and no spacing token defined at all. That is the same
signature as font size. It stays out for a structural reason rather than lack of appetite. Every
substitution this phase makes is invisible because it moves no box, and a spacing change moves boxes
by construction. Consolidating spacing is a visible redesign however carefully it is done, so it is
measured, recorded and routed to the backlog.

**Live announcements mostly work.** Four live regions are declared. Importing a reading order,
marking an issue read, opening the catalog and toggling a setting each announce. Two rail navigations
do not. Those views announce themselves through their heading, so this is an inconsistency rather
than a defect, and closing it would mean adding announcements, which is new behaviour rather than
cohesion. Routed.

**There is no icon set.** The application carries one inline vector, the progress ring, four images,
one emoji glyph and a single stylesheet rule mentioning vectors. There is nothing to be inconsistent.
Recorded so the axis is closed rather than skipped.

## Refuted hypotheses

The contrarian wave changed five conclusions this pass, and each would have produced a wrong change
if it had gone unchecked.

**Focus indicators are not missing anywhere.** A first instrument called focus in script and reported
sixteen controls with no visible indicator, concentrated in the add and reading views. This was an
artefact. The focus-visible pseudo-class is a browser heuristic that generally does not match on
programmatic focus for buttons, so the instrument was measuring its own method. Rewritten to press
Tab for real, the same sweep found zero, across 90 stops, all carrying an identical ring. Acting on
the first result would have added focus styling to an application that already has exactly one, and
would have introduced the second treatment a cohesion pass exists to remove.

**The quiet button class is not systemically undersized.** The natural reading of two short quiet
buttons is that the class is short and the sweep only caught two of them. Measuring all twelve
refuted it: ten are 32 or 33 pixels tall. The defect is contextual, not universal, and the
distinction changes the fix from restyling a class to giving it a floor.

**Forced colours has no defects.** The probe flagged eight elements as colour-only surfaces. All
eight are false positives and the checking is worth recording so it is not redone. Three are native
checkboxes, which the mode renders itself. Two are parts of the reading progress ring drawn in
vector, which the probe measured as borderless boxes. Two are progress bar fills whose parent bar
already carries an explicit forced-colours border and whose fill is already reassigned to the system
highlight colour, so the probe was looking at the child and missing the rule on the parent. The last
is the decorative track of the cover art toggle, which sits beside a text label that states the state
in words and carries a pressed state programmatically, so no meaning is carried by its colour alone.
The stylesheet has four separate forced-colours blocks and they are commented with the reasoning
behind each override.

**The stylesheet has no literal colours.** Recorded in the previous phase and re-confirmed here. A
scan flags three colour literals; all three are inside explanatory comments. The absolute rule holds.

**A minimum height on the file input does grow the real target.** The doubt was reasonable and worth
testing. A file input renders a button sub-part and a filename area, and if only the button opens the
picker then a floor on the outer box improves the measured number without improving what a reader has
to hit, which is the shape of a check passing while the fix misses. Measured: the box is 241 by 22
and the button sub-part is also 22 tall, so the outer floor genuinely would not have grown the button.
But a click 234 pixels clear of the button, at the far right of the filename area, opens the picker,
and so does one at the centre. The whole box is the target, so the floor moves the real number.

**Snapping font sizes to a ladder is not invisible, even when every value moves less than half a
pixel.** This was the plan's own claim and it does not hold. Bounding each value's movement says
nothing about the movement between two values: two sizes a hundredth of a rem apart can sit either
side of a rung midpoint and be pushed in opposite directions, ending about 1.12 pixels apart.
Measured against this stylesheet, a nearest-rung snap did exactly that to 120 pairs. The map was
narrowed to the largest subset under which no near pair is pushed apart, which moves 0 pairs and
costs most of the consolidation: distinct declared sizes fall from 33 to 27 rather than to 19. The
dense band from 0.85 to 0.92 is exactly the part that cannot be collapsed invisibly, so it is routed
to the backlog rather than forced through.


## The constraint that shapes scope

The evidence anchors gate watches 993 citations, and 77 of them point into the stylesheet. Their
targets are spread from the first line to line 1150, so inserting or deleting a line near the top of
the file shifts almost all 77.

Measuring which lines are actually watched turns this from a blocker into a design rule for the plan.
Of the stylesheet's 1,334 lines, 154 are covered by a citation, which is 11.5 percent. The remaining
88.5 percent can be edited freely provided the edit does not change the line count, because a
citation is fingerprinted by the content of the lines it names and an in-place substitution on an
uncited line touches neither.

So a value consolidation done as pure in-place substitution costs almost nothing, while the same
consolidation done by inserting a token block near the top of the file costs a re-aim of nearly every
citation into the file. That is a large amount of record keeping in exchange for changes no reader
can see, and the standing instruction is to spend the effort on the product rather than on the record
of it. The quiet button rule, which Finding A needs to change, is not among the watched lines.

## Planning readiness

Ready. The defects are measured, their causes are diagnosed rather than guessed, three plausible
findings have been actively refuted, and the cost of each candidate change is known.

The recommended scope is Findings A and B in full, and Finding C bounded to substitutions that
preserve the line count and that no reader can see, so the value counts fall without a visual
regression and without a large anchors round. Anything that would restructure the stylesheet, or add
a treatment rather than remove one, belongs in the backlog rather than in the last phase of a
modernization programme.

## Follow-ups

- Issue rows on the everything-read screen are not interactive, while the equivalent rows on the
  reading screen are buttons that open the issue. This may well be deliberate, since the two screens
  have different jobs, and it is a feature question rather than a defect. Route to the backlog.
