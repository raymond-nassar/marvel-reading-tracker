# MRT-008 phase details

Companion to `.copilot-tracking/plans/2026-08-21/cohesion-and-accessibility-plan.md`. The mappings
below are stated as rules rather than as a list of line numbers, because a line list goes stale the
moment the first edit lands while a rule stays true.

## Scope guard that applies to every P02 task

Three blocks of the stylesheet define the palette and the theme overrides. They are the token
source, not rule-level values, and nothing in P02 touches them. At the time of measurement they were
the block beginning at line 21, the one beginning at line 54 and the one beginning at line 112.
Identify them by their opening selector rather than by those numbers, since earlier edits in the
same change may have moved them.

No substitution in P02 may add or remove a line. Every one is a value replaced in place inside an
existing declaration.

## P02-T01: font weight

Replace the numeric weight in every `font-weight` declaration outside the token blocks according to
this map. Leave 400, 600 and 700 alone; they are the destination.

| From | To |
| --- | --- |
| 500 | 600 |
| 520 | 600 |
| 540 | 600 |
| 560 | 600 |
| 620 | 600 |
| 640 | 600 |
| 650 | 600 |
| 660 | 700 |
| 680 | 700 |

650 is exactly halfway between 600 and 700, so nearest is undefined and the tie needs a stated
reason. It resolves to 600 because all three of its sites are body-scale text, at 0.92rem, 1rem and
0.82rem, and 600 is the emphasis weight this stylesheet already uses at that scale, while 700 is
carried by display type. Snapping them up would introduce a heavier body weight than the file uses
anywhere else.

One site needs watching rather than assuming. The heading rule that sets 2.2rem carries 660, and a 40
unit increase on the largest glyphs in the application is exactly where a weight change becomes
visible. The research measured invisibility for 620 against 600 at twelve pixels and did not measure
this case. Treat that heading as the at-risk site, inspect it specifically in T04, and if the change
reads at all, revert that one declaration and record it.

Sixteen declarations match. Two of them sit on lines an evidence anchor watches and will drift; that
is expected and is handled in P03-T02.

Acceptance for this task: distinct declared weights outside the token blocks fall from 13 to 3,
unless T04 records a visible case, in which case the surviving fourth weight is named and the reason
recorded. The outcome defers to T04; it does not override it.

## P02-T02: font size

For every `font-size` declared in rem outside the token blocks, apply this map and nothing else.

| From | To |
| --- | --- |
| 0.74rem | 0.75rem |
| 0.76rem | 0.75rem |
| 0.84rem | 0.85rem |
| 0.93rem | 0.92rem |

Seventeen declarations match. None sits on a watched line. Distinct declared rem sizes fall from
33 to 29.

Amended during implementation, on measurement. The map first carried two further rows, 0.94rem and
0.95rem both to 0.92rem, and the geometry census refuted them. Every other row moves text by exactly
0.01rem, which renders as 0.16 of a pixel, and those two moved it by 0.32 and 0.48 of a pixel. The
0.95rem row was the damaging one: its six sites are all section headings, the section header, the
open card summary heading, the static card heading and its data view variant, and the library group
heading, plus the byline. It shrank 17 rendered elements by 3.2 per cent and cascaded into 35 pixels
of vertical reflow down the catalog list. Shrinking every section heading in a pass whose purpose is
accessibility is the wrong direction, and resizing headings across the application is a design
decision rather than the defect removal this phase is scoped to. Both rows were withdrawn.

The bar that replaced them is stronger than the one they passed, and it is the one to keep: no
declaration may move by more than 0.01rem. Pair safety alone was not enough, because a map can hold
every pair in its original order while still visibly resizing the text inside it.

This map is deliberately narrower than a snap to a full ladder, and the reason is worth keeping
because it is not obvious. Bounding each value's own movement to under half a pixel does not bound
the movement between two values. Two sizes a hundredth of a rem apart can sit either side of a rung
midpoint and be pushed in opposite directions, ending about 1.12 pixels apart. Measured against this
stylesheet, a nearest-rung snap did that to 120 pairs. The map above is the largest subset of that
snap under which no two declarations that were within half a pixel of each other end more than half a
pixel apart, computed by withdrawing unsafe snaps until none remained. It moves 0 pairs apart.

The consequence is that the dense band from 0.85 to 0.92, which holds 0.86, 0.87, 0.875, 0.88, 0.89
and 0.9, is left exactly as written, and so is the heading band at 0.92, 0.94 and 0.95. Collapsing
either band is the part of the consolidation that cannot be done invisibly, so both are measured,
recorded and routed to the backlog rather than folded in here.

Do not touch a size declared in any unit other than rem, and do not touch `font: inherit`.

Acceptance for this task: distinct declared rem sizes outside the token blocks fall from 33 to 29,
no declaration moves by more than 0.01rem, and no two declarations that were within 0.03125rem of
each other end further apart than that.

## P02-T03: border radius

Replace the value in every `border-radius` declaration outside the token blocks according to this
map.

| From | To |
| --- | --- |
| 4px | 6px |
| 5px | 6px |
| 9px | 8px |
| 10px | 12px |
| 11px | 12px |
| 13px | 12px |

Leave alone, deliberately: 6px, 8px, 12px, 14px, 20px, 999px, 50% and the radius token. The 14 pixel
rung is that token, and moving values towards it is the point. The 20 pixel rung is carried
consistently by the three large panels, so it is a tier rather than a stray value, and collapsing it
would visibly redesign the largest surfaces on the home screen.

Twenty-five declarations match. Four sit on watched lines.

Where a declaration carries more than one length, such as a shorthand with differing corners, apply
the map to each length independently and only where that length appears in the table.

Nested corners were checked rather than assumed, because an inner radius is often tuned against its
parent and moving it alone shifts the concentric relationship. Across all nine views only four nested
pairs shift at all, and two of those are pill children whose radius is capped by their own height, so
they stay pills. The two real cases are the small key badge inside each of the two hero buttons.
Those two sibling buttons currently carry 13px and 11px, which is itself the kind of mismatch this
phase exists to remove, and the map lands both on 12px. Confirm the badges in the T04 screenshots and
accept the one pixel change if they read correctly.

Acceptance for this task: distinct declared radii outside the token blocks fall from 17 to 11, and
the two hero buttons end at the same radius.


## P01-T01: the three minimum heights

Add `min-height: 24px` to the quiet button rule, the file input rule and the checkbox row class, each
appended to the existing declaration list on its existing line so no line is added.

The quiet button rule is the one declaring a transparent background, muted colour, an 8 pixel radius
and 0.8rem text. It is not on a watched line. Neither is the file input rule nor the checkbox class.

Do not add a minimum height anywhere else. Ten of the twelve quiet buttons are already 32 or 33
pixels tall because they are flex items; a floor cannot shrink them, and nothing else in the audit
measured short.

One doubt about the file input was worth testing rather than reasoning about, and it did not survive
the test. A file input renders a button sub-part and a filename area, and the sub-part is what most
people assume is the only live target, which would mean a floor on the outer box grows the measured
number without growing the thing a reader actually has to hit. Measured instead: the control's box is
241 by 22 and its button sub-part is also 22 tall, and clicking the far right of the filename area,
234 pixels clear of the button, opens the picker. The whole box is the target, so the floor moves the
real number and not just the reported one.

## Axes measured and closed without a change

The brief named several axes that the first research pass did not profile. Each was measured. None
produces work inside this change, and saying so is the point: an axis with no recorded result cannot
be called clean.

**Text spacing.** The reader override that WCAG asks a page to survive, line height at 1.5, letter
spacing at 0.12em, word spacing at 0.16em and paragraph spacing at 2em, was applied across all nine
views. Result: no horizontal overflow anywhere and no element clipped that was not already clipped
without the override. The clipped set is identical either way and consists of the visually hidden
legends, whose clip is the hiding technique itself, and a deliberate two line clamp on the reading
order descriptions. Passes.

This one needed a positive control before the result meant anything. The first run reported an
identical result to its own negative control, which was suspicious rather than reassuring, and the
reason was that the development server sends a policy that permits stylesheets only from itself, so
the injected override was dropped in silence. An instrument that cannot change anything reports every
page as passing. The bypass is a harness setting, not a product change.

**Spacing.** Profiled the same way the typography axes were: 257 declarations of padding, margin and
gap outside the token blocks, 51 distinct literal values, 19 of them used exactly once, and no
spacing token defined at all. That is the same sprawl signature as font size and it is genuine.
It stays out of this change for a reason that is structural rather than a matter of appetite. Every
substitution in P02 is invisible because it moves no box. A spacing change moves boxes by
construction, so it cannot ride that discipline, and consolidating spacing is a visible redesign
whatever care is taken. Measured, recorded, routed to the backlog.

**Live announcements.** Four live regions are declared. Importing a reading order, marking an issue
read, opening the catalog and toggling a setting each announce. Two rail navigations do not. That is
an inconsistency rather than a defect, since those views announce themselves through their heading,
and closing it means adding announcements, which is new behaviour rather than cohesion. Recorded and
routed.

**Icons.** There is no icon set to be inconsistent. The whole application carries one inline vector,
the progress ring, four images, one emoji glyph and a single stylesheet rule mentioning vectors.
Not applicable, recorded so the axis is closed rather than skipped.


## P01-T02: dialog focus restoration

In the dialog module, hold a module-scoped reference alongside the existing pending-question
reference.

The opener can only be read before the dialog is shown, because showing it moves focus inside. The
call that shows it can also throw, and the module already defends that path. Those two facts pull
against each other, so the ordering has to be explicit:

1. Read the currently focused element into a **local** variable before the show call.
2. Make the show call.
3. Only after it returns without throwing, commit that local to the module-scoped reference.

Committing before the call instead would leave a live reference behind when the call throws. Worse,
when a dialog is genuinely already open with its own earlier opener recorded, a second attempt would
overwrite that earlier opener and then throw, and the eventual close would send focus to the wrong
control. Restoring focus to some plausible element looks exactly like success, so nothing downstream
would report it.

In the existing close handler, after the pending question has been settled, focus the recorded
element when it is still a usable target. Clear the reference unconditionally on every close, whether
or not it was used, so the next question cannot inherit it.

Usable means more than still attached. A connected element that has been disabled, hidden or made
inert still exposes a focus method, and calling it silently does nothing, which strands the reader on
the body and reproduces the defect this task exists to fix. The confirmed action does not only remove
its opener; disabling it while work runs is at least as common. So skip the restore when the element
is missing, detached, disabled, hidden or inert, and let the browser default stand in those cases,
the same way it does for a removed opener.

Three properties the implementation must hold, each of which the tests will check:

1. When the opener is no longer a usable target, whether removed, disabled or hidden, nothing is
   focused by this code and the existing behaviour stands unchanged.
2. The restore happens inside the close handler, which runs before the awaiting caller resumes, so a
   caller that moves focus deliberately afterwards still wins.
3. The reference is cleared on every close, and a failed open leaves the previous reference exactly
   as it was. A question closed without ever being answered must not leave an opener behind for the
   next one.

Update the module's opening comment. It currently states that returning focus to whatever opened the
dialog is the browser's job, and that sentence is what this task disproves. Say what was measured
instead.

Two evidence anchors watch ranges in this module and both will move, since this task adds lines.
That is expected and handled in P03-T02.

## P01-T03: what each test must defend

The existing dialog test file drives the module through a hand-built document double. That double has
no active element, no focus method and no way to mark an element detached, so none of the tests below
can run against it as it stands. Extend it first: give the fake document an `activeElement`, give the
fake element an `isConnected` flag, a `disabled` flag and a `focus` spy that records its calls. A test
written against a double that cannot observe focus would pass without proving anything, which this
repository has shipped before.

Dialog focus, added to the existing dialog test file:

- Escape returns focus to the opener.
- Cancel returns focus to the opener.
- An opener removed from the document before the close leaves focus untouched by this code.
- An opener disabled before the close leaves focus untouched by this code.
- Two questions in sequence from two different openers each return to their own opener.
- A failed open does not change where the next close sends focus.

Stylesheet targets, asserted against the stylesheet text:

- The quiet button rule declares a minimum height of at least 24 pixels.
- The file input rule declares a minimum height of at least 24 pixels.
- The checkbox row class declares a minimum height of at least 24 pixels.

Each assertion must be watched failing on a tree without its fix. Use a stash rather than a checkout
against the index, because the checkout form discards staged work with no reflog entry to recover
it from. Prefer the smallest revert that turns the assertion red, so the record names the line the
test defends rather than only that the suite noticed something.

## Verification instruments

Instruments already exist in the session state directory and should be re-run rather than rewritten:
the stylesheet value profiler, the rendered census, the contrast instrument, the Tab-driven focus
instrument, the mode instrument, the spacing profiler, the text spacing and live region instrument,
and the screenshot capture. They are research tooling and must not be added to the repository or to
its manifest.

One of them carries the weight of the whole P02 argument and is worth naming separately. The geometry
census records position, size, font size, weight, radius, shadow and line height for every rendered
element across all nine views, and its companion diffs two runs. Its negative control passes: two
independent browser launches of the unchanged tree compare 987 elements and report nothing moved,
nothing restyled, nothing appeared and nothing vanished. So any movement it reports after the
substitutions is real rather than instrument noise, and a claim that a substitution is invisible is
checked rather than asserted.

Baseline figures to compare against, all measured on faefca7:

| Measure | Before |
| --- | --- |
| distinct rendered font sizes | 26 |
| distinct rendered weights | 13 |
| distinct rendered radii | 12 |
| distinct declared rem sizes | 33 |
| distinct declared weights | 13 |
| distinct declared radii | 17 |
| effective targets under 24px | 6 |
| contrast failures, dark and light | 0 and 0 |
| Tab stops with a focus ring | 90 of 90 |
| animated elements under reduced motion | 0, against 13 when motion is allowed |
| horizontal overflow, 9 views by 5 widths | 0 |
| elements clipped under the text spacing override | 17, identical without it |
| elements in the geometry census | 987 |

## P02-T04: what the invisibility proof must show

Acceptance is on the declared counts, which this change controls directly, and on the geometry
census, which is the invisibility check rather than a count check. Do not set a target on the
rendered radius count: a pill value and a percentage radius resolve to element specific pixel radii
that the census counts separately, so the rendered figure sits above the ladder by construction and a
target on it invites either a false failure or a quiet loosening of the bar.

- Declared weights fall from 13 to 3, or to 4 with the surviving value named and its reason recorded.
- Declared rem sizes fall from 33 to 27, with no near pair pushed apart.
- Declared radii fall from 17 to 11, and the two hero buttons end equal.
- The geometry census reports zero elements moved. Anything that moves is inspected, and either
  explained or reverted.
- The largest heading, the two hero buttons and their key badges are compared against the before
  screenshots specifically, because those are the three sites where the map was least certain.

