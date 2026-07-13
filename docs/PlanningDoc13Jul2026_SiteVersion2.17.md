# PlanningDoc13Jul2026_SiteVersion2.17

## Purpose

Make the audience studio note a single persistent object across the whole site instead of a homepage-only element or page-specific sidebar note.

## Source Notes

- The interactive note direction is working and should stay.
- The note should remain consistent across Home, About, Lenses, Works, and Contact.
- Visitors should be able to annotate the same note as they move through the site.
- The older static studio notes on the internal pages can be removed.
- The main navigation already exists, so the note should remain an audience touchpoint rather than navigation.

## Planned Changes

- Move the interactive note from `home.tsx` into a shared component.
- Mount that shared note once in `App.tsx`, outside the route switch, so it stays alive during page navigation.
- Persist typed text in browser storage.
- Persist sketch annotations in browser storage as an image data URL so drawings survive route changes and refreshes.
- Keep the note draggable on desktop through its top strip.
- Use a compact fixed placement on smaller screens so the note remains available without duplicating page content.
- Remove the static `Studio note` aside and page-specific note copy from About, Lenses, Works, and Contact.

## Interaction Rules

- The same note should follow visitors through the site.
- Typing, sketching, clearing, resetting, and downloading should work from every page.
- Dragging should only happen from the note header; text and sketch inputs must remain usable.
- The note should feel secondary to page content while still being present as a collaborative artifact.
- Visitor content should stay local to the browser and should not be sent anywhere.

## Page And Wireframe Changes

- Home: remove the homepage-local note instance; global note appears consistently over the site.
- About: remove the static studio note sidebar; page content becomes a cleaner editorial layout.
- Lenses: remove the static studio note sidebar.
- Works: remove the static studio note sidebar.
- Contact: remove the static studio note sidebar.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/App.tsx`
- `artifacts/alchemy-unlimited/src/components/audience-studio-note.tsx`
- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `artifacts/alchemy-unlimited/src/pages/site-pages.tsx`
- `docs/PlanningDoc13Jul2026_SiteVersion2.17.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Verify the note appears on Home and at least one internal page.
- Verify typed text persists while navigating between pages.
- Verify sketch annotation persists while navigating between pages and after refresh.
- Verify the older static page notes are gone.

## Open Questions

- Whether the note should later include page stamps or references to what the visitor was looking at when they wrote/drew something.
- Whether visitors should be able to create multiple notes instead of one continuous note.
- Whether this note becomes a downloadable end-of-journey artifact on the Contact page.
