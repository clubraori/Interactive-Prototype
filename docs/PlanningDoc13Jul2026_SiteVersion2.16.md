# PlanningDoc13Jul2026_SiteVersion2.16

## Purpose

Respond to the latest homepage notes by reducing the sticky note's menu role and turning it into an audience-facing studio note tool: a place for visitors to write, sketch, and download their own response.

## Source Notes

- Homepage currently has too many competing elements: rotating media, mission statement, sticky note, and top navigation.
- The mission statement and rotating video/media should lead.
- Sticky note and top-right nav are redundant because they duplicate navigation.
- Sticky note is unique and should be retained, but it needs a clearer relationship to Alchemy's collaborative ethos.
- Proposed direction: make the sticky note audience-interactive rather than a menu.
- Visitor can type, draw, annotate, and download at the end.
- Sticky note may become a through-line across sub-pages later.
- Other logged future work:
  - Works page should show which collaborators were involved in each project.
  - Prototype relational data linking producers, projects, and lenses in Google Sheets or Excel.
  - Mix project reels, people/interview footage, and still images in the rotating media system.
  - A lock/bookmark/node-drop feature is a later v2.0 idea.

## Planned Changes

- Remove the duplicate page-menu links from the homepage sticky note.
- Keep the main top navigation as the only homepage navigation.
- Convert the sticky note into a lightweight audience note tool with:
  - a text field for a visitor's field note,
  - a small drawing surface,
  - clear controls,
  - a download button that exports the note as a PNG.
- Store the typed note locally in the browser so it can become a cross-page through-line later.
- Keep the note draggable on desktop and inline on mobile.
- Keep the homepage mission and media system otherwise unchanged.

## Interaction Rules

- The sticky note should be secondary to the mission and media, not a second hero.
- The drag behavior should stay on the note's top strip only so typing and drawing remain usable.
- The download should happen entirely in the browser; no visitor content is sent anywhere.
- The copy should frame the note as a studio-ethos/audience touchpoint.

## Page And Wireframe Changes

- Home: replace sticky-note menu with audience note tool.
- About: no change.
- Lenses: no change.
- Works: no change, but relational producer/project/lens data is logged for later.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc13Jul2026_SiteVersion2.16.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Verify the homepage desktop and mobile layouts.
- Verify the sticky note can accept text, draw, clear, and download.
- Confirm the new planning doc is committed with the site change.

## Open Questions

- Whether the note should persist across pages in the next pass.
- Whether visitors should be able to add multiple mini notes, or whether one note plus sketch is clearer.
- Whether future downloaded notes should include a frozen mission sentence state or page URL.
