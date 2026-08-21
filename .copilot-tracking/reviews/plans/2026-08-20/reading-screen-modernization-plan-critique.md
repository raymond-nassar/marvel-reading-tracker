<!-- rpi:task-id MRT-003 -->
<!-- rpi:task-slug reading-screen-modernization -->

# Plan critique: modernize the active reading-order screen

One pass over `.copilot-tracking/plans/2026-08-20/reading-screen-modernization-plan.md`, before any
source was touched. Findings are numbered `CR-xxx`. Applied findings changed the plan directly.

| ID | Finding | Disposition |
|----|---------|-------------|
| CR-001 | A new rule appended at the end of the stylesheet overrides the narrow-screen hero rule, because that rule is a bare `max-width: 700px` block earlier in the file. The wide hero column would then apply on a phone. | Applied. The base column width changes where it stands, and only the wide bump is appended, inside a `min-width` query that cannot overlap the narrow one. |
| CR-002 | Drawing the row separator as `border-bottom-color: var(--line)` risks the theme test that forbids the ungated hairline on anything a reader operates, and it also fights the hover rule, which sets `border-color` on all four sides. | Applied. The separator and the current-row bar are both drawn as inset shadows, which neither the test nor the hover rule can reach. |
| CR-003 | Making `.filters` sticky would move three other fieldsets that share the class: the home chips, the catalog filters and the progress scope. | Applied. Scoped to the reading filters by id. |
| CR-004 | Widening the view puts the per-row action cluster up to 1296px from the title it acts on. | Accepted as designed. Right-aligned row actions are the ordinary pattern for a list of this kind, and the alternative is a DOM change in the row renderer, which the anchors budget rules out. Recorded rather than fixed. |
| CR-005 | With the description capped at 58 characters, a 1296px hero leaves a wide empty band to the right of the text. | Accepted, mitigated. The larger cover, the spread of the facts row and the blurred cover backdrop all take part of it, and a hero with air in it is not a defect. |
| CR-006 | Deleting the `title` attribute from the progress ring removes information if nothing replaces it. | Applied and checked. The percentage moves into visible text, which is strictly more reachable, and no test, document or browser scenario names the attribute. |
| CR-007 | An auto-fitting shelf stretches its tiles to fill the row, so a list with two issues left would paint two 600px covers. | Applied. A tile is capped at 168px. |
| CR-008 | The plan claimed new palette pairs would be needed. | Rejected on evidence. Every combination the change renders is already measured: the hero counts as a card, so the blue link and the dimmed byline are covered, the positive count on the page is covered, and the current-row bar is the brand token already measured against the page at the stricter text floor. No pair is added, and the surface assertions do not move. |
| CR-009 | One major feature per pull request: five numbered requirements could read as five features. | Rejected. They are one feature, the reading screen, and splitting them would ship a screen that is half modernized in a way no reviewer could judge. |

No finding required a user decision. Nothing here conflicts with a confirmed decision.
