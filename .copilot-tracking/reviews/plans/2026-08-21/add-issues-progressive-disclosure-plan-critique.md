# Add Issues progressive disclosure, plan critique

Task id: MRT-006
Task slug: add-issues-progressive-disclosure
Date: 2026-08-21
Plan: .copilot-tracking/plans/2026-08-21/add-issues-progressive-disclosure-plan.md
Critique execution: Complete
Verdict: Revise, all findings applied directly by the planner

## Boundary

The plan, its research, and the source it touches: the Add view markup, the rail
entries, the stylesheet rules for cards and buttons, and the main module functions
named in the plan. Delegated to an independent reader with instructions to trace the
code rather than reason from the plan. Eight numbered checks were requested, covering
shipped behaviour, heading demotion, test coverage, the primary-button rule, the busy
notice kind, the honesty of the held pill, requirement delivery, and accessibility.

## Findings

| Id | Severity | Concern | Disposition |
|---|---|---|---|
| CR-001 | Major | Demoting the four summary headings to `h3` unstyles them. The single rule that makes a card summary heading small, marginless and inline is scoped to `h2`, and the `card-static h3` rule is scoped to a class the four disclosures do not carry, so they would fall back to user-agent block headings with margins inside a flex summary. | Applied. The stylesheet task now requires that selector widened to cover both levels rather than a second rule added. |
| CR-002 | Major | The plan forbade the purpose line becoming the disclosure's accessible name while also requiring it be readable while closed. Those are contradictory: a closed `details` hides everything but the summary, so the line must live inside the summary, where it joins the name. The stated mechanism, a grid, is layout and does not affect name computation. | Applied, by resolving in the opposite direction to the original rule. The line is accepted into the accessible name deliberately, because it tells a screen-reader user exactly what it tells a sighted one, and that is why it exists. The plan now forbids trimming the name with `aria-labelledby` and forbids `aria-hidden` on visible meaningful text. |
| CR-003 | Major | The primary-button rule was not delivered. Three repeated-row sites keep the primary class and two of them appear in no task: the series configuration passed to the shared name-search wiring, the candidate buttons in the manual lookup, and the candidate buttons in the unresolved-import row. The research's count of primary sites had looked only at the markup and the first-level renderers. | Applied. The rule now carries a table naming all five row sites and their before and after classes, and the render task enumerates each one. |
| CR-004 | Major | "Row buttons become `btn-g`" is wrong for this stylesheet. The grey secondary is the pair; the primary class supplies padding, radius, inline-flex and gap, and the grey class overrides only colours and weight. Taken literally the buttons lose all sizing. The same applies to the added-state class. | Applied. Every site now states the pair, and the rule states why. |
| CR-005 | Minor | The markup guard as written was imprecise and would have been wrong on the day it was written: six elements in the view carry the primary token, five with it alone and one paired with the grey class, so a word-boundary match counts six. | Applied. The guard now matches the exact attribute value, and its comment states the limit that it cannot see a button built in JavaScript. |
| CR-006 | Minor | The research's claim that the Add view's copy is entirely unprotected is half true. The wiki disclosure's meaning is pinned by an existing rule, but against the About view, the README and the security policy, not against this card. | Applied as a note to the implementer in the guard task. The new rule still closes the genuinely unguarded place, and the note prevents the implementer believing the wording is free elsewhere. |
| CR-007 | Minor | Under a grid summary the chevron, which is generated content on the summary itself, becomes a grid item and will land in the wrong cell if left unplaced. | Applied. The stylesheet task now specifies two columns with the chevron placed explicitly and aligned to the first text line. |
| CR-008 | None | Adding a busy kind to the notice helper was checked and is safe. The notice builder interpolates the kind with no allow-list, the panes remain non-live so the announcement still fires, and no test enumerates the allowed kinds or pins the loading notices to the success class. | No change. Recorded so it is not re-litigated. |
| CR-009 | None | The held pill's honesty was checked. Issue metadata deliberately survives list deletion, and the add path merges every incoming issue into the store before deciding membership, so an issue can be in the store while in no list. The plan's wording claims the store, not the destination list, and explicitly refuses the stronger claim. | No change. |
| CR-010 | None | Promoting the search panel out of the disclosure was traced. The only code that reads the open state in this view is the rail handler, the index warming is bound to the other two cards, the summary rules simply stop applying, and the static card's padding override is consistent. The plan's handler fix is the one real risk and it is already covered. | No change. |

## Coverage and limitations

Every requested check returned a reading of the source rather than a reading of the
plan, which is what the critique was for. Three of the four major findings were
invisible from the plan alone and were found only by tracing: the unstyled headings,
the two unmentioned candidate button sites, and the class-pair error.

The critique did not assess the browser matrix, which has no artifact yet, and did not
assess the records phase, which is mechanical.

## Highest-impact finding

CR-003, because it is the one that would have shipped a change failing its own stated
requirement while every gate passed. The markup guard would have been green, the suite
would have been green, and two of the five row sites would still have painted primary
purple once per candidate.
