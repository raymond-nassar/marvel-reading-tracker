# Flow Specification: Collapsible Sidebar

## Goal
Give users a reversible way to reclaim horizontal space, and add visual rhythm to
a 10-item navigation list that currently reads as an undifferentiated column.

## Collapse Behavior
- **Toggle button**: Fluent `GlobalNavButton` (glyph `E700`), top-left of the
  pane, above the brand lockup. Persistent — visible in both states.
- **Expanded**: current width, icon + label + sublabel.
- **Collapsed**: **48px icon rail** — icons remain visible and clickable.
  Not fully hidden. Section headings hide; group dividers remain as the only
  grouping cue.
- **Tooltips**: in rail mode, hover and keyboard focus both reveal the label.
- **Persistence**: `localStorage` key `sidebar.collapsed`.
- **Responsive**: auto-collapse below 1000px viewport width. A manual toggle
  after that overrides until the next breakpoint crossing.
- **Keyboard**: `Ctrl+\` toggles.
- **Motion**: 150ms width transition; respect `prefers-reduced-motion`.

## Icons (required — rail mode has no labels)
| Item | Fluent glyph |
|------|--------------|
| Browse the catalog | `E736` |
| New empty list | `E710` |
| Progress by series | `E9D2` |
| Search issues | `E721` |
| Add a whole series | `E8F1` |
| Browse a creator | `E77B` |
| Paste a reading order | `E77F` |
| Add an issue by hand | `E948` |
| Backup & settings | `E713` |
| About this app | `E946` |

## Dividers — Option C (two-tier)
- **Between items within a group**: 1px `rgba(255, 255, 255, 0.05)`
- **Between groups**: 1px `rgba(255, 255, 255, 0.10)` + 12px extra vertical space
- Implemented as CSS `border-bottom` on list items, **not** `<hr>` elements, so
  screen readers aren't given separator noise for purely visual structure.
- Last item in each group omits its inner divider (`:last-child`).
- Rationale: creates two levels of hierarchy — items are separated, groups are
  clearly delimited — without the noise of uniform hairlines across 10 rows.

## Item States
- **Rest**: transparent background
- **Hover**: full-width surface, 6px radius, `rgba(255,255,255,0.04)`
- **Active/selected**: 3px Marvel-red left accent bar + `rgba(255,255,255,0.08)`
  background + increased label weight. *(No selected state exists today — this is
  a gap, not just a polish item.)*
- **Focus**: 2px outline, offset 2px, distinct from hover
- **Min height**: 44px

## Status Pill
`API OK · 37,526 issues` collapses to a colored dot in rail mode, with the full
text as its accessible name and tooltip.

## Accessibility Requirements
- [ ] Toggle: `aria-expanded`, `aria-controls="sidebar-nav"`,
      `aria-label="Toggle sidebar"`
- [ ] Nav wrapped in `<nav aria-label="Main">`
- [ ] Active item carries `aria-current="page"`
- [ ] Rail mode: every link keeps a text accessible name (`aria-label` or
      visually-hidden span) — an icon alone is not a name
- [ ] Collapse state change announced politely ("Sidebar collapsed")
- [ ] Tab order unaffected by collapse; no focus trap
- [ ] Tooltips reachable by keyboard focus, not hover-only
- [ ] Dividers are CSS borders, decorative, never announced
- [ ] Accent-bar active state is paired with a background change (not color alone)
- [ ] Icon-only targets are at least 44x44px in rail mode
