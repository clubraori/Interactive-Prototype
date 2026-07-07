# PlanningDoc07Jul2026_SiteVersion2.9

## Purpose

Make the mission statement follow a simple editorial left-align rule so all four lines share one clear left edge.

## Source Notes

- Ravin reviewed SiteVersion2.8 and the type sizing was improved, but the alignment still felt uneven.
- Line three and line four appeared slightly offset from each other.
- The likely cause is centered text plus a right-aligned left phrase in the anchor row.
- Contemporary editorial rule for this pass: use one left edge, one type size, one rhythm, and a clear grid anchor.

## Planned Changes

- Keep the shared mission font sizing from SiteVersion2.8.
- Change the mission block from centered to left-aligned.
- Change the left side of the `[WHAT + HOW] for [WHO]` row from right-aligned to left-aligned.
- Keep `for` as the fixed grid anchor in the second line.
- Keep the existing four-line structure.

## Mission Statement Changes

- No variable-bank changes.
- Conceptual structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual structure remains:
  1. `An assembly of creative producers specializing in`
  2. `[WHAT + HOW] for [WHO],`
  3. `working toward`
  4. `[WHY].`

## Page And Wireframe Changes

- Home: mission alignment only.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc07Jul2026_SiteVersion2.9.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Commit this planning doc with the alignment cleanup.

## Open Questions

- Whether `for` should remain centered in the full statement width or move to a fixed left-grid column later.
