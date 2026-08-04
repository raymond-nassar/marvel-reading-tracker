# Marvel Reading Tracker Expansion Backlog

This backlog describes the next product improvements in plain English. It is intended
for review before implementation. The goal is to make the tracker useful for many
Marvel reading lists and events, not only Jonathan Hickman’s Secret Wars orders.

## Product direction

Users should be able to discover, import, follow, and customize reading lists for
Marvel events, character runs, creators, and eras. The app should remain local-first,
easy to use, and focused on helping users know what to read next.

## Priority guide

- **P0 — Foundation:** needed before the app can scale beyond the current bundled lists.
- **P1 — Core product value:** makes finding and following more reading lists useful.
- **P2 — Later enhancement:** valuable after the broader reading-list experience works well.

## Epic 1: Curated reading-list catalog

**Goal:** Make multiple Marvel reading lists visible and easy to start.

### User stories

- **P0 — As a reader, I want to see a catalog of available reading lists so that I can
  choose something other than the Hickman Secret Wars list.**
  - The catalog includes the list name, a short description, approximate issue count,
    and the type of list.

- **P0 — As a reader, I want to browse lists by category so that I can find events,
  character runs, creator runs, and eras relevant to me.**
  - Categories can be filtered without losing the list details.

- **P1 — As a reader, I want to search the catalog by title or character so that I can
  quickly find a list I have in mind.**
  - Search results update clearly and show when there are no matches.

- **P1 — As a reader, I want to understand whether a list is essential, complete, or
  tie-in focused so that I can choose the amount of reading I want.**
  - Each list displays its reading-depth label before import.

## Epic 2: Expand Marvel event coverage

**Goal:** Provide useful non-Hickman examples and establish an expandable editorial
pipeline for event lists.

### User stories

- **P0 — As a reader, I want several major Marvel event lists available out of the box
  so that the app feels like a Marvel tracker rather than a single-saga tracker.**
  - The first release includes a balanced sample of events from different eras,
    such as House of M, Civil War, Secret Invasion, Annihilation, and King in Black.

- **P0 — As a product owner, I want each curated list to record its source and version
  so that users can understand where the order came from and when it was updated.**
  - The list shows attribution and a last-updated date.

- **P1 — As a reader, I want more than one version of an event order so that I can
  choose an essential reading path or a complete tie-in path.**
  - Variants are grouped under the same event and clearly named.

- **P1 — As a maintainer, I want to add a new curated list without changing the main
  application logic so that the catalog can grow safely.**
  - A new list is defined through data and appears automatically in the catalog.

## Epic 3: Import and create personal reading orders

**Goal:** Let users bring in lists that are not bundled with the app.

### User stories

- **P0 — As a reader, I want to paste a Markdown or plain-text reading order so that
  I can track a list from another guide.**
  - The app reports how many entries were imported, how many were unresolved, and
    never silently drops an entry.

- **P1 — As a reader, I want to resolve an unmatched title by choosing from search
  results so that my imported list remains accurate.**
  - The app shows enough title, series, and date information to make a safe choice.

- **P1 — As a reader, I want to create a list by adding series, creators, or individual
  issues so that I can build a custom reading path.**
  - Added issues keep their selected order and can be moved or removed.

- **P2 — As a reader, I want to duplicate an existing list so that I can customize it
  without losing the original order.**
  - The copy has its own name and order while preserving shared read progress behavior.

## Epic 4: Reading-list experience

**Goal:** Help users understand and complete a list with less effort.

### User stories

- **P0 — As a reader, I want to see which list I am currently following so that I do
  not mark progress in the wrong list.**
  - The active list is clearly identified in the navigation and reading view.

- **P1 — As a reader, I want to see event progress by section or series so that I can
  understand where I am within a large crossover.**
  - Progress can be viewed for the list overall and for its constituent series.

- **P1 — As a reader, I want to filter a list to unread, read, available, or pending
  issues so that I can focus on the next useful action.**
  - Filtering does not change the saved reading order.

- **P1 — As a reader, I want to resume from the next unread issue so that I do not have
  to remember where I stopped.**
  - The app presents one clear next issue and advances after it is marked read.

- **P2 — As a reader, I want optional notes on a list or issue so that I can record
  context, reactions, or reminders.**
  - Notes remain local and are included in backups.

## Epic 5: Trustworthy metadata and availability

**Goal:** Make the app transparent about what it knows and what it cannot verify.

### User stories

- **P0 — As a reader, I want to know when an issue's metadata is incomplete so that I
  do not mistake a pending lookup for missing content.**
  - Pending, unknown, and confirmed metadata states are distinct.

- **P1 — As a reader, I want to know whether an issue is expected to be on Marvel
  Unlimited so that I can plan my reading session.**
  - The wording makes clear when availability is an estimate rather than a guarantee.

- **P1 — As a reader, I want newer issues to remain trackable even when they are absent
  from the metadata snapshot so that the tracker does not become obsolete.**
  - Manual entries can be read, reordered, exported, and backed up.

- **P2 — As a maintainer, I want the app to detect changes in the metadata API contract
  so that upstream changes do not quietly break the experience.**
  - Contract checks identify missing or changed fields before a release.

## Epic 6: Backup, portability, and ownership

**Goal:** Keep user progress safe while preserving the local-first design.

### User stories

- **P0 — As a reader, I want to export all my lists and progress so that I can recover
  from browser storage loss.**
  - A backup restores list names, order, issue data, and read state.

- **P1 — As a reader, I want to move a list between browsers or computers so that my
  reading progress is not tied to one device.**
  - Exported data can be restored on another supported browser.

- **P1 — As a reader, I want to export one list as Markdown so that I can share or
  review it outside the app.**
  - The export preserves order and read/unread state.

- **P2 — As a reader, I want optional synchronization between my devices so that I do
  not have to manage backups manually.**
  - Sync is opt-in and does not change the local-only behavior for users who do not
    enable it.

## Epic 7: Accessibility and usability

**Goal:** Make the expanded catalog and tracker usable by more readers.

### User stories

- **P0 — As a keyboard user, I want to browse, select, and manage reading lists without
  a mouse so that the app is fully usable with my preferred input method.**
  - Focus order, visible focus, and keyboard actions are consistent.

- **P1 — As a screen-reader user, I want list changes and import results announced so
  that I know what happened without relying on visual updates.**
  - Important actions have meaningful accessible labels and status messages.

- **P1 — As a reader on a small screen, I want the catalog and reading view to remain
  easy to scan so that I can use the app beside Marvel Unlimited.**
  - Long names, progress indicators, and actions remain usable on narrow screens.

## Suggested delivery order

1. Build the data-driven curated-list catalog.
2. Add several non-Hickman event lists with attribution and variants.
3. Improve import resolution and custom-list workflows.
4. Add event sections, richer progress views, and list duplication.
5. Strengthen metadata transparency, backups, and accessibility as the catalog grows.
6. Consider optional synchronization only after local workflows are proven useful.

## Out of scope for the next expansion

- Hosting or distributing comic content.
- Scraping Marvel Unlimited pages.
- Replacing established community sites that curate reading orders.
- Requiring accounts or cloud services for the core tracker experience.
