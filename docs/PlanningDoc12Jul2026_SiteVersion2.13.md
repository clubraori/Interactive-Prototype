# PlanningDoc12Jul2026_SiteVersion2.13

## Purpose

Test a lighter home page direction by moving the background to white/off-white, softening the interactive gradient, and adjusting home page typography colors for legibility. Also harden the GitHub Pages build so cached HTML does not point at missing hashed assets after deployment.

## Source Notes

- Ravin wants to try the interactive gradient on a white background with lighter colors.
- Home page font colors need to shift from off-white-on-dark to darker editorial colors.
- The gradient should still use the existing Alchemy palette, but as pale washes rather than a dark atmospheric field.
- The previous live deploy briefly failed for cached browsers because old hashed JS/CSS assets returned 404 after GitHub Pages replaced the deployment artifact.

## Planned Changes

- Change the home page base from near-black to warm white/off-white.
- Rework the interactive gradient into lighter mint, peach, yellow, violet, and coral washes.
- Keep mouse X as pixel/grid texture density and mouse Y as gradient mood.
- Change home page header, nav, mission label, mission body, and lock states to dark editorial colors.
- Keep variable highlights colorful but dark enough to read on white.
- Keep the sparse video fragments, but make their border/shadow treatment fit the light background.
- Make the app build emit stable `assets/index.js` and `assets/index.css` filenames.
- Add compatibility aliases for the previous hashed GitHub Pages assets so cached HTML can still load the current app.

## Mission Statement Changes

- No mission sentence or variable-bank changes.
- Current structure remains:
  `An assembly of creative producers specializing in [WHAT + HOW] for [WHO], working toward [WHY].`

## Page And Wireframe Changes

- Home: light background, pale interactive gradient, adjusted typography colors.
- About: no change.
- Lenses: no change.
- Works: no change.
- Contact: no change.

## Files Likely To Change

- `artifacts/alchemy-unlimited/src/pages/home.tsx`
- `artifacts/alchemy-unlimited/src/index.css`
- `artifacts/alchemy-unlimited/vite.config.ts`
- `artifacts/alchemy-unlimited/package.json`
- `scripts/write-github-pages-asset-aliases.mjs`
- `docs/PlanningDoc12Jul2026_SiteVersion2.13.md`

## Checks Before Push

- Run the app typecheck.
- Run the app production build.
- Verify desktop and mobile screenshots.
- Confirm live/cached asset aliases exist in the production build output.
- Confirm the new planning doc is committed with the site change.

## Open Questions

- Whether the lighter direction should replace the dark direction or remain one branch of exploration.
- Whether final brand colors should define separate light-mode and dark-mode token sets.
