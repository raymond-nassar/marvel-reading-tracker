# Add Issues progressive disclosure, research

Task id: MRT-006
Task slug: add-issues-progressive-disclosure
Date: 2026-08-21
Phase: Research (read only, no source edited)

## What was asked

Redesign the Add Issues workflow around progressive disclosure. Scope is limited to
five paths: issue search, whole-series addition, creator browsing, pasted reading
orders, and manual issue entry. Six requirements, restated as the spec this task is
graded against:

1. Issue search is the obvious default workflow.
2. Series, creator, paste and manual entry are clearly labelled secondary paths.
3. Improve form hierarchy, destination visibility, result scanning, loading
   feedback, and add confirmations.
4. Preserve honest handling of missing metadata and the documented 2025 snapshot
   boundary.
5. Preserve every protection around manual lookup, duplicate issues, unresolved
   imports, hydration, and cancellation.
6. Use the existing purple visual system without turning every action into a
   primary purple button.

Preservation: full labelling, keyboard operation, announced errors, predictable
focus after dynamic updates, and survival at 200 per cent zoom.

## Wave 1, wider: what the surface is today

The Add view is one section in the single-page markup, titled "Add issues", with a
subtitle element that renderAll fills with the destination sentence, either
"Anything you add goes into ..." or "Anything you add will start a new list."

Below it sit five sibling `details` elements, each carrying class `card`, each with
an `h2` inside its `summary`. Their ids are sec-search, sec-series, sec-creator,
sec-import and sec-manual. Only sec-search carries the `open` attribute in the
shipped markup.

Every one of the five is styled identically. The card rule gives a border, a radius
and a card background; the summary rule supplies the disclosure chevron. Nothing in
the markup or the stylesheet distinguishes search from the other four. So although
search is first and open, the page reads as five equal accordions, which is the
defect requirement 1 names.

The left rail carries five separate entries under the heading "Add issues", one per
card. Each is a button with a view attribute of `add` and an open attribute naming
one card id. The navigation handler closes every open card in the Add view, opens the
named one, and moves focus to its first input, textarea or button. That behaviour is
the existing progressive disclosure, and it is good: it is the visual weight of the
five cards that is wrong, not the navigation.

Result panes are `div` elements with class `results`, one per card. A comment above
the search pane records, at length, that these are deliberately not live regions: each
receives a whole result list at once, so announcing the container read every row aloud
on top of the summary the app already sends to the announcer. The summary is the one
channel. **This is a decision to preserve, not to revisit.**

## Wave 1, wider: the code paths

`wireAdd` in the main module wires all five. Search submits to the metadata API's
issue search with a limit of 50 and renders through `renderResults`. Series and
creator are wired once through `wireNameSearch`, because the API ignores the query on
those routes and both read a vendored name index instead; the only differences are
which index they read and what "Add all issues" does. Opening either card warms the
index, which is a few hundred kilobytes and never part of the initial page load.
Paste submits to `doImport`; manual entry submits to `doManual` and its lookup button
calls `doManualLookup`.

`renderResults` prints a destination sentence at the top of the pane, announces the
result count together with that sentence, then renders one row per issue. Each row
is a `div` with class `result` holding a title, a meta line, and an Add button that
disables itself and rewrites its own label to "Added to <list>" or "Already in that
list" on press.

`addToActive` resolves or creates the destination list, adds, announces, and starts
the hydrator when anything was added. `addSeries` and `addCreator` page the API to
completion and announce progress as they go.

`doImport` parses the pasted text, optionally creates a new list named from the first
heading, stages entries with metadata pending, marks ticked lines read, and lists
unresolved lines as rows with a "Find match" button rather than dropping them.

`doManual` is the most heavily defended function in the view.

## Wave 2, deeper: the protections requirement 5 names

Each of these is load-bearing and each has a comment explaining why. They are listed
here so the implementation has an explicit do-not-break list.

**Manual lookup is never automatic and never picks for you.** The lookup button does
nothing until pressed. The search is fuzzy and routinely returns the series page and
the neighbouring issue above the one meant, so the top hit is never taken; the reader
picks. Nothing is written until Add issue is pressed.

**An accepted match is withdrawn when the title stops naming it.** Typing in the title
box after accepting a match clears the match and says why, while the box is still in
front of the reader. This is the repository's stated habit of withdrawing an offer at
the moment it stops making sense rather than refusing it later.

**The duplicate guard tests the id that will be written, not the id the wiki supplied.**
Adding to a list merges into the issue store before it decides whether the list already
held the id, so a collision overwrites the held issue's title, series, release date,
page count and credits while reporting nothing added. The guard is gated on there being
an accepted match, which keeps the deliberate exemption for a pasted address with no
lookup behind it. Its comment records that guarding the wiki id alone left a route open:
look up one comic, press Use this, then paste an address naming another.

**Unresolved import lines are listed, not dropped.** A line with no Marvel issue link
becomes a row with a Find match button. That lookup auto-accepts only a single exact
normalised match; anything else is offered as a choice, because silently picking result
one files the wrong comic. Every branch of that button announces, including the failure
branch, because a disabled button returning to enabled is not announced.

**Hydration starts after every add that added something.** Search, series and creator
results come from list endpoints that return neither cover nor digital id; only the
single-issue route does. Without hydration the issue lands with no art and no way to
open it in Marvel Unlimited. The hydrator's start is a no-op while a run is in flight,
so rapid adds cannot stack.

**Cancellation.** The hydrator and the synopsis runner are cancellable, through controls
that live in the reading view, not this one. Nothing in the Add view offers a cancel and
nothing in the Add view may break those two. The long series and creator loads announce
progress but have no cancel of their own. Adding one would be a new capability rather
than a presentation change, so it is routed to the backlog rather than taken here.

**The snapshot boundary is stated on the surface that needs it.** The manual card's
first hint says the metadata snapshot ends in 2025, so anything newer will not be found
by search, and that adding it by hand still tracks with availability showing as unknown.
The creator add outcome says creator records omit Unlimited dates, so availability shows
as unknown until details are fetched. Both sentences are honest handling of missing
metadata under requirement 4 and constraint 8.

## Wave 2, deeper: what covers can and cannot do here

The Library work that shipped yesterday used cover thumbnails to improve recognition.
That is not available on this surface, and the reason is in the code rather than in
taste. Search, series and creator results come from list endpoints which return no
cover field at all; that is the same fact that makes hydration necessary after every
add. So a cover on a search result would either be blank or would require a per-row
single-issue request, which is a new request pattern this task has no mandate to add.

**Result scanning under requirement 3 therefore has to be typographic and structural
rather than pictorial.** What is available without any new request: the series name, the
release date, and whether the tracker already holds the issue. The last of those is the
useful one and is free, because the issue store is in memory.

## Wave 3, contrarian: trying to break the conclusions

**Is search really not already the default?** It carries the `open` attribute and is
first. Counter-evidence: it is styled identically to four siblings, it sits inside a
collapsible whose chevron invites closing it, and the rail presents five equal entries.
A reader arriving from the rail's "Add a whole series" sees series open and search
closed, which is correct behaviour but leaves search no more prominent than anything
else. The conclusion holds: the default is asserted by markup order and contradicted by
visual weight.

**Would promoting search out of the accordion break the rail?** Yes, if done carelessly.
The rail's search entry names sec-search and the handler closes every open card then
opens the named one. If search stops being a `details`, that handler must not try to
open it, and the rail entry must still land focus in the search box. This is the single
highest-risk mechanical change in the task and it needs an explicit rule.

**Does an always-open search box hurt the index warming?** No. Warming is wired to the
toggle event of the series and creator cards only. Search does not warm anything.

**Is "clearly labelled secondary paths" satisfied by leaving four accordions alone?**
No. Their summaries say what they are but not what they are for, and a reader deciding
between "Add a whole series" and "Paste a reading order" has nothing to choose on until
they open both. A one-line purpose under each summary is the smallest change that
satisfies the requirement.

**Is the purple button count actually a problem?** Counted on the shipped markup and
render code: search submit, series find, creator find, import submit, manual add issue,
every search result row's Add, and every series row's Add all issues are primary purple.
Creator's Add all issues and the manual lookup are the grey variant. So seven primary
sites against two secondary, and the row-level ones repeat once per result, which means
a fifty-result search paints fifty primary purple buttons. Requirement 6 is well founded.

**Does anything in the test suite pin this markup?** Searched the suite for the five card
ids, the five form ids, the destination element and the heading text: no matches. Several
tests read the markup, but for the About view, the reading view, the catalog, theme, and
recovery copy. **So the Add view's copy is unprotected**, including the 2025 boundary
sentence that requirement 4 exists to preserve. That is a gap this task should close with
a rule, not merely respect by hand.

## Planning readiness

Ready. The surface, its five code paths, its protections, its copy rules and its
constraint exposure are established from the source. Two decisions are settled by the
evidence rather than left to the implementation: covers are not available on this
surface, and the result panes stay non-live.

## Constraint gate

Checked 1 to 11, none breached. Constraint 8 is directly engaged and is preserved by
requirement 4 plus a new copy rule. Constraint 4 is untouched: no dependency. Constraint
3 is untouched: the wiki lookup keeps its press-to-send shape and its disclosure.
Constraint 11 applies to all new copy.

## Routed to the backlog rather than taken here

- A cancel control for the long series and creator loads. It is a new capability, not a
  presentation change, and the two existing cancellable runners are wired elsewhere.
- Cover thumbnails in search results, which would need a per-row single-issue request.
