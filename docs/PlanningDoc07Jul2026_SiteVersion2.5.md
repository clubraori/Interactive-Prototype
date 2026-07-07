# PlanningDoc07Jul2026_SiteVersion2.5

## Purpose

Protect the fixed mission anchor words so moving variable text cannot visually overlap them.

## Source Notes

- Ravin reviewed SiteVersion2.4 and saw words visually overlapping the fixed anchors.
- The fixed words should feel static and protected.
- This applies to both `for` and `working toward`.
- Keep the anchors locked in place; do not return to the awkward grid.

## Planned Changes

- Keep the existing absolute-positioned anchors.
- Add a subtle backing/clear zone behind each fixed anchor.
- Increase anchor stacking above animated text.
- Keep invisible placeholders in the paragraph so the surrounding sentence retains spacing.

## Mission Statement Changes

- No variable-bank changes.
- Conceptual structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual behavior:
  - `for` remains fixed.
  - `working toward` remains fixed.
  - Moving text is prevented from visually writing over either anchor.

## Page And Wireframe Changes

- Home: protect fixed mission anchors.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc07Jul2026_SiteVersion2.5.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Commit this planning doc with the protected-anchor change.

## Open Questions

- Whether the clear-zone backing should become more transparent after visual review.
