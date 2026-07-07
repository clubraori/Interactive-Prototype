# PlanningDoc07Jul2026_SiteVersion2.6

## Purpose

Replace the masked fixed-anchor experiment with a real layout anchor for `for` only.

## Source Notes

- Ravin clarified that the goal is not a mask where words pass behind `for`.
- The goal is for `for` to be geospatially locked, with surrounding text moving/wrapping around it.
- `working toward` can go back to normal moving text for now.
- Start by making only `for` fixed and letting the phrases on the left and right form around it.

## Planned Changes

- Remove the masked absolute-position anchors from SiteVersion2.5.
- Render the What + How phrase, fixed `for`, and Who phrase in a simple anchored row.
- Keep `for` in the same x/y spot within that row.
- Let the left and right phrases wrap in their own areas.
- Return `working toward` to normal text flow, with the Why phrase on the next line.

## Mission Statement Changes

- No variable-bank changes.
- Conceptual structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual structure:
  - Static prefix line.
  - Anchored phrase row: `[WHAT + HOW]` / `for` / `[WHO],`.
  - Normal `working toward`.
  - Why phrase beneath it.

## Page And Wireframe Changes

- Home: revise mission layout only.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc07Jul2026_SiteVersion2.6.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Commit this planning doc with the layout correction.

## Open Questions

- Whether the anchored phrase row should be tuned after reviewing the live mobile layout.
