<!-- markdownlint-disable-file -->
# RPI Review log: Library and Progress modernization

## Metadata

* Task ID: MRT-005
* Research: .copilot-tracking/research/2026-08-20/library-and-progress-modernization-research.md
* Plan: .copilot-tracking/plans/2026-08-20/library-and-progress-modernization-plan.md
* Plan critique: .copilot-tracking/reviews/plans/2026-08-20/library-and-progress-modernization-plan-critique.md
* Changes record: .copilot-tracking/changes/2026-08-20/library-and-progress-modernization-changes.md
* Review date: 2026-08-21

## Review execution and outcome

* Review execution: Complete
* Outcome: Conformant
* Assessed boundary: CHG-001 through CHG-006, the six numbered user requirements, the preservation
  list, the prohibition list, and every repository gate.
* Acceptance basis: the user's six numbered requirements, the preservation and prohibition lists,
  CR-001 through CR-012, and the plan's copy and count contract.

## Requirement assessment

| Requirement | Evidence | Assessment |
|---|---|---|
| 1. Summary before detailed results | Each of the four surfaces renders a summary band as its first child. Everything Read reads "21 issues read, 7 series, 3 in no list". | Met |
| 2. Visual grouping and progress hierarchy rather than a report | Rows sit in named `section` regions under `h2` headings; 9 headings on Everything Read, 1 on Progress. Heading levels run 1,2,2,... with no skipped level on any of the four surfaces. | Met |
| 3. Cover thumbnails where they aid recognition | 21 covers on Everything Read, 4 on Added by Hand, painted through the vetted builder at the variant the reading rows already request. | Met |
| 4. States distinguishable without relying on colour | "Fully read" carries a tick and the words; "Not started" and "by hand" are words; the empty state is a dashed edge and a glyph. Under forced colours the text still resolves and the headings still render. | Met |
| 5. Exact meaning and scope of every count preserved | The plan's count contract was carried into the code unchanged, and the progress band's "read of tracked" cell stays a phrase rather than being reduced to a number. | Met |
| 6. Long collections scannable and performant | Capped at 120 with a show-more button; a 171-row fixture renders 120 then 171 on one press, with 0px overflow. | Met |

## Preservation and prohibition assessment

* No analytics, accounts, cloud storage or speculative statistics were added. Every figure shown is
  derived from state already held locally.
* Keyboard operation: the rows are deliberately non-interactive, as they were before this change.
  The one control added, the show-more button, takes focus, and focus is not dropped by the rebuild
  it triggers.
* Screen-reader structure: heading levels gain a level rather than losing one; every group region
  is named by its heading, 9 of 9.
* 200 per cent zoom, forced colours, reduced motion, both themes and covers off: 0px horizontal
  overflow on all four surfaces in every one of those modes, at 1280x900 and 2560x1080.
* Persistence: untouched. The single storage key and its recovery keys were not read or written by
  any code this change adds.

## Gates

| Gate | Result |
|---|---|
| lint | 0 problems |
| test | 1248 tests, 1248 pass, 0 fail |
| counts | pass |
| sizes | pass |
| palette | pass |
| publication | pass |
| anchors | 993 unchanged, 0 drifted, 0 new, 0 removed, exit 0 |

## The anchors round

* 483 locked citations name files this change edits. 397 were positionally unchanged and drifted
  only in content; 86 moved and had their citing prose re-aimed.
* Both derivations were run and reconciled, as the repository requires. The arithmetic was taken
  from the diff's own hunks; the search looked for each lock entry's blessed head in the new file.
* One genuine disagreement, and the reconciliation earned its keep. A citation naming where a saved
  list's count is stated as text: the arithmetic said the line was a comment, and the head search
  found the markup 3,500 lines further down, because the passage had been moved into a new builder
  rather than shifted. Hunk arithmetic cannot follow a move. The head search was taken, after
  reading the destination.
* Two traps were observed live and handled. Heads repeat: `forgetDeleted();` occurs five times in
  the main module and `if (!store.lastUpdateOk) {` seven, so the head search is unsound there and
  the arithmetic governed. And the gate reports no range beginning or ending on a blank line, which
  is the check the bless print cannot perform.
* The mapping was computed once and applied once, driven from the lock rather than by a blanket
  search, so a `path:line` value used as test data was not rewritten.
* The bless print was read record by record, each against the claim printed beside it. The NOTICE
  reported 7 anchors cited twice in one scope under unlike claims; all seven are the pre-existing
  cluster in which several backlog blocks cite the same restore, erase and undo lines, and each
  pair's claims describe the same code.
* The total citation count was re-derived rather than assumed: 993 before, 993 after. The `absent:`
  exempt count was checked and is unmoved at 2, so no live citation was swallowed by an absence
  clause.

## Findings

Two defects were found by reading the rendered result rather than by any gate, and both were fixed
before this review. They are recorded because they are the kind a suite cannot catch.

* A chip repeated, in a second place, words the row's own meta line already carried, so a screen
  reader heard "In no list" twice. Removed.
* A derived grouping applied to a short collection produced a heading per row: four entries, four
  headings, four counts of 1. Held back below twelve rows.

One process defect is recorded against this review rather than against the change. A falsification
attempt appeared to pass on a broken tree, which would have been a check proving nothing. The cause
was in the breaking script, not the check: a single-occurrence string replacement removed the focus
options from the progress rebuild rather than the library one, so the control under test was still
intact. Repeating it against the intended site turned the check red, reporting focus on `BODY`. The
lesson is that a falsification attempt needs its own verification that it broke what it meant to
break.

No finding is routed forward. The three queued phases are separate user-directed work rather than
findings from this one.

## Outcome rationale

Every planned marker has direct completion evidence, all twelve critique dispositions are resolved,
every gate is green, the browser matrix passes in every mode at both widths, and the two defects
found by reading the result are closed. No material finding is open.
