# Changes: Settings, backup, and system feedback

Task MRT-007. Plan: `.copilot-tracking/plans/2026-08-21/settings-backup-and-system-feedback-plan.md`.

One entry closes the plan's rendering phases. The rest exist because the work departed from the
plan, which is what a changes record is for.

## CHG-001 Four groups, backup first, and every confirmation routed to its own control

Closes P01-T01 through P01-T03, P02-T01 through P02-T03, P03-T01 through P03-T03, and P04-T01.

The settings view was a flat run of seven cards, so the backup workflow sat visually level with a
cache size readout. It is now four labelled groups, Data safety, Personalization, Connectivity and
Advanced, with the Danger zone card left outside all four and last. Backup and restore is the first
card of the first group and wears `addpri`, the primary treatment MRT-006 introduced for the Add
view's search panel, so exactly one card on the page is primary.

The heading re-homing was the part with a regression waiting in it, and the plan was right to make
it a task of its own rather than a consequence. Demoting each card title from `h2` to `h3` would
otherwise have made every settings card title smaller than the sub-heading beneath it, because the
sizes are keyed on tag. Rules scoped to `#view-data` now give its card-title `h3` what
`.card-static h2` gives and its sub-section `h4` what `.card-static h3` gives, with neither shared
rule rewritten, which R7 forbade. Measured in Edge after the change: ordinary card titles render at
15.2px, the one primary card title at 18.4px, and the only sub-heading in the view, `Restore from a
backup` inside that primary card, at 13.6px. So the one place a title and a sub-heading actually
meet is 18.4 over 13.6 and the title still outranks what sits under it. The About view's title and
six sub-headings, and the Add view's four summary headings, all render at unchanged sizes and
margins.

Worth recording because it is smaller than it looks: a group label is 16px at weight 650 and an
ordinary card title 15.2px at weight 600, in the same colour. Type alone is doing almost none of the
work there. What separates them is that the label sits outside any card, on the page background,
with 27.2px of space above it, over a run of bordered and tinted cards. That is a sound distinction
and it is the one the plan asked for, but a later change that moved a group label inside a card, or
took its space away, would collapse the hierarchy without changing a single font rule.

Three confirmations were writing into a pane that lived in the Backup card. Two new panes,
`#api-report` and `#cache-report`, now sit in the cards whose controls produce them, and only the
pane selector changed at each of the three call sites. Measured: the metadata source confirmation
moved from 905px above its own button, in a different card and off screen, to 38px below it in its
own card. The same holds at 200 per cent zoom, where the old placement was 658px above the top of
the viewport. The routing also fixed a stale-action defect nobody had filed: a refused restore now
survives an unrelated cache clear, where before, pressing Clear cache overwrote a refusal the reader
had not yet read.

Each of the four notice kinds gained its own `::before` glyph, a tick for ok, a triangle for warn, a
cross for error and a dot for busy, and every notice gained a system border under forced colours,
where there was no notice rule at all before. That mode discards our colours, so three of the four
kinds had been indistinguishable from each other. Verified in Edge that the announced string is
unchanged, because a `::before` glyph is not in `textContent` and so cannot reach the spoken path.

The whole surface was checked with a 39 point acceptance run in Edge covering both themes, forced
colours, reduced motion and 200 per cent zoom, with 0 failures. The honest cost is height: the view
grew from 1,672px to 1,950px, which is what four group headings weigh.

## CHG-002 A demoted heading was named by a dialog, and a second test file had to move with it

The plan named one test file whose delimiters the demotion would break, `test/privacy-copy.test.js`,
which cuts the settings markup on literal heading strings. It missed a second.

`test/erase-scope.test.js` does something different and more interesting: the erase dialog's wording
tells the reader that what will be erased is described under a named heading, and the test asserts
both that the page carries that heading and that it sits above the button. It matched on
`<h2>Copies kept after a failed read</h2>`, so demoting the card titles broke it.

The delimiter was repointed to `h3` and nothing else in either file was touched. That is the whole
of the fix, and it is worth naming why the fix is not larger. The failing assertion was not
incidental to the demotion; it is a live claim that the dialog's own words still describe the page,
which is exactly the kind of claim a grouping change can quietly falsify. It stayed true here
because only the level changed and not the text or the order, and the test still proves it.

## CHG-003 The routing guard was rewritten, because counting occurrences is not a behaviour claim

P05-T01 item 5 asked for a guard that `#restore-report` is referenced by the restore and undo
handlers only. What came back asserted raw occurrence counts in the module: five of one selector
string, two of another, one of a third. That passes, and it is not the claim. It fails the day
anyone adds an unrelated restore message and says nothing at all about which control a confirmation
reaches, which is the entire point of the phase.

It was rewritten to work the way a reader would check it: find the message text, walk back to the
`notify(` call that carries it, and assert the literal pane selector at that call.

Writing that exposed a trap in the rewrite itself. `Restore refused, nothing was changed.` is
assembled in a ternary above its own `notify()` call, so a backwards search from the message binds
it to the previous call and passes for the wrong reason. That assertion was removed, and the helper
was hardened with a balanced-paren scan so the whole class of mistake fails loudly rather than
passing quietly. The hardening was proved by temporarily re-adding the bad case and watching it fail
with the intended message.

The seven guards were then proved against a reverted tree: five fail, and the two that do not are
preservation guards, that the danger card is still last and that fifteen named ids all survive.
Those are correctly green on both trees, because what they defend is a thing that must not change,
so they were proved individually by mutation instead.

## CHG-004 The critique predicted a size gate failure that did not happen

The plan critique raised, as CR-005, that repointing confirmations would move enough of
`src/js/main.js` to break the checked-in file size claims and that the round would need a size
re-derivation. It did not.

The only edits that module took were three pane selectors, each a substitution inside an existing
argument, so it is still exactly 5,030 lines and the size gate reports that all seven stated file
sizes agree. This is recorded rather than dropped because the critique was reasonable and the
prediction is the kind that would otherwise be quietly forgotten once it came out green. What
actually kept the number still was the plan's own instruction to change the selector only, which is
narrower than the phase's description of itself suggests.

## CHG-005 The plan and research artifacts were stripped of citations rather than re-aimed

This is the largest departure and the one worth reading.

The plan, research and critique for this task were written with backticked path and line citations
throughout, in the style the product documents use. That was a mistake, and the evidence gate does
not catch it, because the failure mode is the opposite of the one the gate is built for. A citation
that already exists in the lock drifts when the file under it moves, and the gate goes red. A
first-time citation has no earlier fingerprint, so the gate enrols it wherever it happens to point
and reports green. These three artifacts carried 103 first-time enrolments, all written against the
tree before the change, and 85 of them pointed into files this change edits. Many were plainly false
by the time they were read back: one cited a line for the restore heading that had become the
Markdown export button.

Nothing in the anchors round said a word about it. It surfaced only because the bless refused for an
unrelated reason, that five of the citations resolved to blank lines, which prompted a check of all
103.

The fix was taken from precedent rather than invented. The tracking directory is tracked by git, and
prior phases' plans and critiques are committed, yet none of them appears anywhere in the anchors
coverage. MRT-006's five artifacts were measured: zero backticked citations and zero bare ones,
except a single bare citation in its changes record. The preceding phase had already applied the
repository's own rule, that dated artifacts are navigated by stable ids, markers and headings, and
that citations belong in the product documents where re-aiming is the correct response to drift.

So all 103 were rewritten into the sanctioned prose form, naming the file in backticks and the line
in words, and each artifact now carries a note naming the base commit whose tree its numbers
describe. Re-aiming them would have been the wrong repair twice over: it would have enrolled a
historical record into a gate that then demands the record be edited whenever the code moves, which
is the one thing a historical record must not do.

## CHG-006 Six of nine re-aims that needed a decision had wrong arithmetic

The product documents' own citations did have to move, and this is the measurement worth keeping
from that round. Of 394 citations of changed files, 385 were confirmed by fingerprint and 9 needed a
human decision. Six of those nine were wrong when derived from hunk arithmetic alone.

They were wrong because the settings regroup rewrote a whole region rather than inserting into it,
so an offset carried a citation onto an unrelated node inside the same file. The worst of them named
the Theme card where the claim was about update checks, because the update checks card had moved
into a different group. Another landed on the heading above the control the sentence described,
which reads perfectly well and is not what the sentence says. All nine were settled by reading both
trees, and the corrections were applied through an explicit override list carrying a check that
fails if any override does not fire.

The round finished at 993 anchors, 0 drifted, 0 new and 0 removed. The bless printed a
notice that one line is now cited three times under unlike claims. That was investigated and is
pre-existing: all three cited the same line before this change, and the line before and the line
after are byte identical, so the notice fires because the anchor moved and not because this change
collapsed anything together.

Writing the records moved a further 30, because the backlog cites itself and inserting two table
rows and two detail blocks shifts every citation below them. Those came in three clean magnitudes,
2 for a backlog line below the new rows, 72 for one below the new detail blocks as well, and 19 for
a changelog line below the new entry, and every one of the 30 kept its head text byte for byte. So
the honest total for this change is 72 re-aimed citations, 42 by the source edits and 30 by the
records, over a corpus that begins and ends at 993 with nothing lost and nothing added.

## CHG-007 A new detail block shipped without its constraint check, and a test in the suite said so

The second of the two new backlog items was written without the `Constraint gate:` line every
other live item carries. Nothing about the item was wrong, and no constraint was breached, but the
line that records the check was simply absent.

It was caught because one test derives a figure in `GOVERNANCE.md` from the backlog itself, counting
detail blocks and constraint gate lines and asserting the sentence still states both. That sentence
read 152 blocks and 146 checks, and the backlog now holds 154 and 147, so the suite failed with the
two figures printed side by side. This is the one figure in these documents derived from another
document, and it is the reason the test exists.

The gate line was added, which makes the count 154 and 148, and the sentence was updated to match.
The claim it carries stayed true throughout: the only items without a check are the six that were
dropped.

Adding those two lines moved four citations of the backlog a second time, all four by 4 lines. The
shift was derived twice, once by searching each blessed head and once as the arithmetic sum of the
two insertions above them, and both agreed at 4 with a single unambiguous hit each. The total for
the change is still 72, because those four were already among the 30 the records round moved, and
the corpus begins and ends at 993 with nothing lost and nothing added.