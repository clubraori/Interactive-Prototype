# PlanningDoc12Jul2026_SiteVersion2.12

## Purpose

Replace the moving horizontal line and torch-like cursor glow with a quieter interactive brand-gradient system that gives the cursor meaning without competing with the mission statement.

## Source Notes

- Ravin likes the sparse editorial footage treatment from SiteVersion2.11.
- The current moving horizontal line and cursor-centered glow make the cursor feel too literal and torch-like.
- The cursor should still matter, but through a subtler background rule that fits the Alchemy visual language.
- The interaction should use the existing palette: warm orange, mint, violet, yellow, off-white, and near-black.
- Proposed rule: mouse X controls pixel/grid texture; mouse Y shifts the gradient palette mood.

## Planned Changes

- Remove the horizontal cursor line from the homepage background.
- Remove the direct torch/radial cursor glow.
- Add a layered, brand-colored gradient field using the existing accent palette.
- Use mouse X to control the pixel/grid texture size and visibility.
- Use mouse Y to move through a designed gradient sequence:
  1. Cool/mint-violet atmosphere near the top.
  2. Warm orange-yellow atmosphere through the middle.
  3. Violet-coral atmosphere near the bottom.
- Keep the editorial footage fragments from SiteVersion2.11.
- Keep the mission sentence, variable banks, sticky note, and word-change behavior unchanged.

## Mission Statement Changes

- No mission sentence or variable-bank changes.
- Current structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`

## Page And Wireframe Changes

- Home: replace cursor line/glow with interactive brand-gradient rules.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `docs/PlanningDoc12Jul2026_SiteVersion2.12.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Verify desktop and mobile screenshots.
- Confirm the background interaction preserves mission contrast and keeps footage secondary.
- Confirm the new planning doc is committed with the site change.

## Open Questions

- Whether the gradient moods should become named brand tokens if the Alchemy name and identity remain stable.
- Whether the pixel/grid cue should eventually respond to scroll or page section rather than only cursor X.
