# Jobs-to-be-Done: Landing Page

## Job Statement
When I open Marvel Reading Tracker and my library is empty, I want to see the
curated reading orders that ship with the app, so I can start reading in one
click instead of hunting through a navigation menu.

## Secondary Job
When I come back with lists already in my library, I want to resume where I left
off, so I don't have to remember which issue I was on.

## Persona
- **Who**: Marvel Unlimited subscriber, casual-to-invested comics reader
- **Expertise**: Knows characters, does *not* know publication order
- **Device**: Desktop (Windows), occasional tablet
- **Frequency**: Opens weekly-to-daily during an active read-through
- **Success metric**: First reading order added within 60 seconds of first launch

## Current Solution & Pain Points
- **Current**: The landing page shows a dashed empty box reading "Pick something
  to read", with prose instructing the user to "browse the catalog on the left."
- **Pain**:
  1. The call to action is *descriptive, not interactive* — the largest element
     on the page cannot be clicked.
  2. The catalog's contents are invisible until the user navigates away. Users
     cannot judge whether the app is worth their time.
  3. Three competing entry points (Browse the catalog / New empty list / Paste a
     reading order) are given equal weight in the sidebar with no recommendation.
  4. Returning users get the same empty-state screen as first-run users, with no
     "continue reading" affordance.
- **Consequence**: A first-run user must make a navigation decision before seeing
  a single piece of value. Highest-risk drop-off point in the app.

## Anti-goals
- Don't turn the landing page into a storefront that buries returning users'
  progress.
- Don't require network access to render the catalog — the orders ship with the
  app and this is a core product promise.
