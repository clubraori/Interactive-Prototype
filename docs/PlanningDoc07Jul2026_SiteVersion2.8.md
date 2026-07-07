# PlanningDoc07Jul2026_SiteVersion2.8

## Purpose

Clean up the mission typography so the four-line layout uses consistent type size, spacing, and alignment.

## Source Notes

- Ravin reviewed SiteVersion2.7 and the line sizes/indents were inconsistent.
- The update should be straightforward typography, not another interaction trick.
- Every mission line should share one type size.
- Spacing between lines should be consistent.
- `for` should remain centered in the second line while the phrases sit on either side.

## Planned Changes

- Replace per-line responsive type classes with one measured font size on the full mission block.
- Use the same line spacing across all four mission lines.
- Keep the second line as an anchored row, but remove awkward visual indentation.
- Measure all lines, not only the anchor row, so the chosen type size keeps the full composition stable.

## Mission Statement Changes

- No variable-bank changes.
- Conceptual structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual structure remains four lines:
  1. `An assembly of creative producers specializing in`
  2. `[WHAT + HOW] for [WHO],`
  3. `working toward`
  4. `[WHY].`

## Page And Wireframe Changes

- Home: mission typography cleanup only.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc07Jul2026_SiteVersion2.8.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Commit this planning doc with the typography cleanup.

## Open Questions

- Whether the final type size feels too small with the longest phrase combinations.
