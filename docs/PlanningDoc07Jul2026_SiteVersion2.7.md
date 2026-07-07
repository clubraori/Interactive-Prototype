# PlanningDoc07Jul2026_SiteVersion2.7

## Purpose

Make the mission statement read as four stable lines with smaller type so the anchored `X for Y` line stays on one line.

## Source Notes

- Ravin clarified the intended layout:
  - Line 1: `An assembly of creative producers specializing in`
  - Line 2: `[WHAT + HOW] for [WHO]`
  - Line 3: `working toward`
  - Line 4: `[WHY]`
- The previous issue is that the type is too large, causing the left/right phrases around `for` to wrap awkwardly.
- `for` should stay as the fixed center anchor.
- The left and right phrases should remain on the same line as `for`.

## Planned Changes

- Reduce the mission typography.
- Give the mission statement a wider line container.
- Keep line 1, line 3, and line 4 as fixed one-line blocks.
- Make line 2 an anchored row with `for` in the center.
- Dynamically reduce the line 2 type size so the current What + How and Who phrases fit on one row.

## Mission Statement Changes

- No variable-bank changes.
- Conceptual structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual structure becomes four lines:
  1. `An assembly of creative producers specializing in`
  2. `[WHAT + HOW] for [WHO],`
  3. `working toward`
  4. `[WHY].`

## Page And Wireframe Changes

- Home: mission statement layout and type sizing only.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc07Jul2026_SiteVersion2.7.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Commit this planning doc with the typography/layout change.

## Open Questions

- Whether the dynamically fitted anchor line feels too small with the longest phrase combinations.
