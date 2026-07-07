# PlanningDoc07Jul2026_SiteVersion2.3

## Purpose

Restore the home mission to a normal paragraph after the SiteVersion2.2 anchored grid made the sentence feel awkward on mobile.

## Source Notes

- Ravin reviewed the deployed mission layout in-browser and found the full grid treatment too awkward.
- Keep the sentence behaving like a normal paragraph.
- Keep `for` visually stable, but only as a small inline anchor, not as a full layout column.
- Add a line break after `working toward`.
- Everything else should remain the same as the previous version.

## Planned Changes

- Remove the three-column mission grid introduced in SiteVersion2.2.
- Restore the mission sentence to inline paragraph flow.
- Render `for` as a fixed-width inline word with explicit spacing around it.
- Insert a line break after `working toward`.
- Keep the `Mission` label.

## Mission Statement Changes

- No variable-bank changes.
- Conceptual structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual structure becomes a normal paragraph with one forced break:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward`
  `[WHY].`

## Page And Wireframe Changes

- Home: restore paragraph-style mission layout.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc07Jul2026_SiteVersion2.3.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Commit this planning doc with the layout correction.

## Open Questions

- If `for` still feels too mobile-jumpy, consider a more deliberate text-composition system for variable phrases instead of inline typing.
