# PlanningDoc12Jul2026_SiteVersion2.14

## Purpose

Refine the home mission layout by giving `working toward` its own line and moving the mission paragraph slightly upward so it feels better related to the sticky note.

## Source Notes

- Ravin wants a line break after `working toward`.
- Ravin also wants the paragraph moved up a bit so the mission feels more aligned with the post-it note.
- The change should preserve the current light background direction, pale gradient system, and editorial typography rules.

## Planned Changes

- Split the final mission line into two lines:
  - `working toward`
  - `[WHY].`
- Update the mission measurement hook so the new outcome line is measured independently and still auto-fits at narrow widths.
- Lift the desktop mission block slightly with a responsive vertical offset.
- Keep mobile layout stable; the desktop sticky note is the main alignment target.

## Mission Statement Changes

Current sentence structure remains:

`An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`

Visual line structure becomes:

1. `An assembly of creative producers specializing in`
2. `[WHAT + HOW]`
3. `for`
4. `[WHO],`
5. `working toward`
6. `[WHY].`

## Page And Wireframe Changes

- Home: mission line break and vertical placement refinement only.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc12Jul2026_SiteVersion2.14.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Verify desktop and mobile screenshots.
- Confirm the new planning doc is committed with the site change.

## Open Questions

- Whether the mission should eventually use separate desktop/mobile vertical placement tokens instead of a small responsive transform.
