# PlanningDoc07Jul2026_SiteVersion2.4

## Purpose

Try locking the mission anchor words to fixed x/y positions inside the statement block while allowing the rest of the sentence to continue moving.

## Source Notes

- Ravin reviewed SiteVersion2.3 and the word `for` still moved with the variable phrase before it.
- New experiment: keep `for` locked in one x/y position.
- Also keep `working toward` locked in one x/y position.
- Let the variable phrases and surrounding sentence text continue to flow/move around those anchors.

## Planned Changes

- Keep the mission as a normal paragraph, not a grid.
- Replace the visible inline `for` with a fixed-position visual anchor.
- Leave an invisible inline placeholder for `for` so paragraph flow still has roughly the right spacing.
- Replace the visible inline `working toward` with a fixed-position visual anchor.
- Leave an invisible inline placeholder before the line break so the Why phrase still starts below it.

## Mission Statement Changes

- No variable-bank changes.
- Conceptual structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`
- Visual experiment:
  - `for` is absolutely positioned inside the statement block.
  - `working toward` is absolutely positioned inside the statement block.
  - The other sentence fragments remain in normal paragraph flow.

## Page And Wireframe Changes

- Home: mission layout only.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc07Jul2026_SiteVersion2.4.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Smoke-test the local homepage.
- Commit this planning doc with the mission-anchor experiment.

## Open Questions

- Whether the fixed anchor positions should be tuned separately for mobile and desktop after visual review.
