# Changes: Cohesion and accessibility

Task MRT-008. Plan: `.copilot-tracking/plans/2026-08-21/cohesion-and-accessibility-plan.md`.

One entry closes the plan's substitution and target-size phases. The rest exist because the work
departed from the plan, which is what a changes record is for.

## CHG-001 One type and corner scale, and six controls raised to the 24 pixel floor

Closes P01-T01, P01-T02, P02-T01 through P02-T04, and P03-T01 through P03-T03.

The stylesheet had accumulated 13 declared font weights, 33 declared rem sizes and 17 declared
radii across the phases that built it. None of those numbers is a defect on its own, and that is
exactly why they grew: every one of them was a locally reasonable choice. Together they were the
reason two buttons in the same panel could carry visibly different corners. Weights now come from
four values, sizes from 29 and radii from 11, applied as in-place value substitutions only. The
stylesheet is 1,334 lines before and after, 58 added and 58 removed, and the lowest line touched is
255, so the three token blocks are untouched by construction.

Three rules gained `min-height: 24px`: `.quiet`, the file input, and `.checkbox`. That took the
controls measuring under 24 pixels from six to zero across all nine views, with covers on and with
covers off, and the `.quiet` class from two of twelve under the floor to none. The two controls that
delete data are among the six, which is the reason this was worth doing rather than a tidy-up.

Not fixed here, and deliberately: the reading row's own controls stay at 17 by 17 and 22 by 26. They
pass 2.5.8 through the spacing exception, that reading is recorded in the UX study, and the item that
scored it is parked as a product decision rather than by a gate. Raising them is a density change to
the primary reading surface, which is outside a defect-removal pass.

## CHG-002 The font-size map was withdrawn after the census refuted it

No plan task. This is a departure.

The map was validated on pair ordering: no two near values pushed apart. The geometry census showed
that property is insufficient. A map can hold every pair in its original order and still visibly
resize the text inside it, and this one did: `.95rem` folded to `.92rem`, shrinking seventeen section
headings by 3.2 per cent and cascading 35 pixels of reflow down the catalog list.

Two reasons to revert rather than accept. Shrinking every section heading is the wrong direction in
an accessibility pass, and resizing headings across the app is a design decision rather than defect
removal. The eight declarations at `.94rem` and `.95rem` were reverted, the acceptance figure moved
from 33 to 27 down to the honest 33 to 29, and the bar that replaced pair ordering is stronger than
it: no declaration may move by more than 0.01rem, which is 0.16 pixels at the root size. Every
surviving row satisfies it.

The finding is worth more than the fix. The defect was in the plan, not in the implementation, and
only the census found it. An acceptance criterion stated on a property that is easy to check is not
the same as one stated on the property that matters.

## CHG-003 Dialogs give focus back to the control that opened them

No plan task beyond P01-T02's one line. This entry records what the fix had to defend.

Closing a confirmation, by Escape or by Cancel, returned focus to the document body, so anyone
working a long list by keyboard or by screen reader lost their place on every confirmation. The
opener is now captured before `showModal()`, because opening the dialog moves focus and reading
`activeElement` afterwards returns the dialog itself. It is committed to module scope only after
`showModal()` returns, so a throw on an already-open dialog cannot leave a stale opener behind. It
is cleared unconditionally on every close, and the restore is guarded on the element still being
connected, not disabled, not hidden and not inert, because the control that opened a confirmation is
quite often the one the confirmation removes.

Each of those four properties was proved by reverting it alone and watching the suite fail: removing
the restore, never committing the opener, and capturing after `showModal()` each fail six tests, and
removing the usability guard fails exactly the two that cover a detached and a disabled opener.
Dropping each of the three `min-height` declarations fails exactly one theme test each. The dialog
suite went from 11 tests to 17 and the theme suite from 30 to 33.

## CHG-004 Two instruments were measuring nothing, and both were caught by a negative control

The screenshot comparison was the one that mattered. It waited on `load` with fixed sleeps and never
waited on `document.fonts.ready`, so text rendered in a fallback face on some runs. Two captures of
an unchanged tree differed by up to 31.5 per cent of their pixels, which is a tool that would have
reported a difference whatever the change did. Waiting on network idle, then on fonts, then on two
animation frames, brought the unchanged-tree control to 8 of 9 views pixel-identical with a 0.089
per cent residue on one cover.

The earlier one: a text-spacing override was silently dropped because the local server sets
`style-src 'self'`, so the probe needed `setBypassCSP`. Same shape, same lesson. An instrument that
has not been shown to be quiet on an unchanged tree is not evidence, and both of these would have
produced confident nonsense instead of an error.

Light-theme contrast was then established by construction rather than by measurement, which is the
stronger form: of the 58 added and 58 removed stylesheet lines, zero change a colour token, so no
contrast pair can have moved. Dark theme measured zero failures directly.

## CHG-005 The critique was brought to the citation style the other seven already use

No plan task. Found while running the anchors gate.

The critique artifact carried 32 `path:line` citations, 19 of them naming a file with no directory
in front of it, and one written as a bare line number with no path at all, which the gate rejects
outright. Seven of the eight
critiques already committed carry no citations in either form, and the phase 5 critique explains why
in a banner: a critique describes the tree it was written against, so enrolling it in the anchors
gate either falsifies the record or breaks the gate the moment the change lands. That is exactly what
happened here. All 32 were converted to the prose form the house style uses, which keeps every line
number and takes none of them into the gate, and the same banner was added.
